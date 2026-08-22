package es.buscadorcromos.config;

import es.buscadorcromos.auth.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuración central de seguridad de la API.
 *
 * <p>Estrategia: autenticación <b>stateless con JWT</b>. No hay sesión de servidor
 * ni cookies: cada petición debe traer la cabecera {@code Authorization: Bearer <token>},
 * que valida {@link JwtAuthFilter} antes de llegar a los controladores.</p>
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    /** Codificador de contraseñas: BCrypt (con salt automático). Lo usa AuthService. */
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Cadena de filtros de seguridad. Reglas de acceso:
     * <ul>
     *   <li>{@code /api/auth/**} — público (registro y login).</li>
     *   <li>{@code GET /api/catalog/**} — público (el catálogo es igual para todos).</li>
     *   <li>{@code /actuator/health} y {@code /error} — públicos (health-check de Render).</li>
     *   <li>El resto exige autenticación (colección del usuario).</li>
     * </ul>
     */
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Sin sesión ni formularios => CSRF no aplica
                .csrf(csrf -> csrf.disable())
                // Habilita el CORS definido en corsConfigurationSource()
                .cors(Customizer.withDefaults())
                // STATELESS: no se crean HttpSession; la identidad viene solo del JWT
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/catalog/**").permitAll()
                        .requestMatchers("/actuator/health", "/error").permitAll()
                        .anyRequest().authenticated())
                // Inserta nuestro filtro JWT justo antes del filtro estándar de autenticación
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());
        return http.build();
    }

    /**
     * Orígenes permitidos para llamar a la API desde el navegador.
     * Se leen de {@code app.cors.allowed-origins} (variable CORS_ALLOWED_ORIGINS),
     * separados por comas: p. ej. "https://mi-sitio.netlify.app,http://localhost:5173".
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origins}") String origins) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
