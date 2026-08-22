package es.buscadorcromos.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTOs (objetos de transferencia) de los endpoints de autenticación.
 * Usamos records de Java: inmutables y con constructor/equals/toString automáticos.
 */
public final class AuthDtos {

    private AuthDtos() {
    }

    /** Cuerpo esperado por POST /api/auth/register. */
    public record RegisterRequest(
            @NotBlank @Size(min = 3, max = 30) String username,
            @NotBlank @Size(min = 4, max = 100) String password,
            @NotBlank @Size(min = 1, max = 60) String displayName) {
    }

    /** Cuerpo esperado por POST /api/auth/login. */
    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password) {
    }

    /** Respuesta común de register/login: el JWT y los datos públicos del usuario. */
    public record AuthResponse(String token, String username, String displayName) {
    }
}
