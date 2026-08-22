package es.buscadorcromos.auth;

import es.buscadorcromos.user.User;
import es.buscadorcromos.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    /**
     * Registra un usuario nuevo.
     * <ul>
     *   <li>Normaliza el username a minúsculas y valida su formato (a-z, 0-9, . _ -).</li>
     *   <li>Rechaza con 409 si ya existe otro usuario igual.</li>
     *   <li>Guarda solo el hash BCrypt, nunca la contraseña en claro.</li>
     * </ul>
     */
    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        String username = request.username().trim().toLowerCase();
        if (!username.matches("[a-z0-9._-]{3,30}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El usuario solo puede tener letras minúsculas, números, punto, guion o _");
        }
        if (users.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese usuario ya existe");
        }
        User user = new User(username, encoder.encode(request.password()), request.displayName().trim());
        users.save(user);
        return new AuthDtos.AuthResponse(jwt.generateToken(username), user.getUsername(), user.getDisplayName());
    }

    /**
     * Autentica a un usuario. Por seguridad, usuario inexistente y contraseña
     * incorrecta devuelven exactamente el mismo error genérico 401.
     */
    @Transactional(readOnly = true)
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        User user = users.findByUsernameIgnoreCase(request.username().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos"));
        // matches(contraseñaEnClaro, hashGuardado): comparación en tiempo constante
        if (!encoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos");
        }
        return new AuthDtos.AuthResponse(jwt.generateToken(user.getUsername()), user.getUsername(), user.getDisplayName());
    }
}
