package es.buscadorcromos.auth;

import es.buscadorcromos.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filtro de servlet que autentica cada petición mediante JWT.
 *
 * <p>Flujo: lee la cabecera {@code Authorization: Bearer <token>} → valida el
 * token con {@link JwtService} → comprueba que el usuario exista en BD →
 * registra la autenticación en el SecurityContext para el resto del pipeline.</p>
 *
 * <p>Si no hay cabecera o el token no es válido, simplemente deja pasar la
 * petición sin autenticar y serán las reglas de {@code SecurityConfig} las que
 * devuelvan 401/403.</p>
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository users;

    public JwtAuthFilter(JwtService jwtService, UserRepository users) {
        this.jwtService = jwtService;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        // 1) Extraer "Bearer <token>" de la cabecera, si viene
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            // 2) Validar firma/caducidad y comprobar que el usuario aún existe
            jwtService.validateAndGetUsername(header.substring(7)).ifPresent(username ->
                    users.findByUsernameIgnoreCase(username).ifPresent(user -> {
                        // 3) Dar por autenticada la petición para el resto del pipeline
                        var auth = new UsernamePasswordAuthenticationToken(
                                username, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }));
        }
        chain.doFilter(request, response);
    }
}
