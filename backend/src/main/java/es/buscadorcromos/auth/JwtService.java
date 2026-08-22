package es.buscadorcromos.auth;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Servicio de utilidad JWT (librería jjwt).
 *
 * <p>Emite tokens firmados con HMAC-SHA usando un secreto compartido y los valida.
 * El token solo guarda el nombre de usuario en el campo "subject"; no lleva roles
 * ni datos sensibles, así que es trivial de inspeccionar pero no de falsificar.</p>
 */
@Service
public class JwtService {

    /** Clave HMAC derivada de {@code app.jwt.secret}. Misma para firmar y verificar. */
    private final SecretKey key;

    /** Vigencia del token en milisegundos ({@code app.jwt.expiration-ms}, 7 días por defecto). */
    private final long expirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    /**
     * Genera un token firmado para el usuario dado.
     * Claims: sub={@code username}, iat=ahora, exp=ahora + expirationMs.
     */
    public String generateToken(String username) {
        Date now = new Date();
        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    /**
     * Verifica firma y caducidad del token.
     *
     * @return el username si el token es válido; vacío si no (firma inválida, expirado…)
     */
    public java.util.Optional<String> validateAndGetUsername(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return java.util.Optional.ofNullable(claims.getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            return java.util.Optional.empty();
        }
    }
}
