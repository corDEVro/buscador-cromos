package es.buscadorcromos.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * Entidad JPA: usuario registrado de la app.
 *
 * <p>Cada usuario tiene su propia colección de cromos (tabla {@code entries}).
 * La contraseña NUNCA se guarda en claro, solo su hash BCrypt.</p>
 */
@Entity
@Table(name = "users")
public class User {

    /** Identificador autogenerado por la BD (BIGSERIAL). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nombre de inicio de sesión; único e insensible a mayúsculas a efectos de búsqueda. */
    @Column(nullable = false, unique = true, length = 30)
    private String username;

    /** Hash BCrypt de la contraseña (nunca la contraseña real). */
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    /** Nombre "bonito" para mostrar en la app (p. ej. el nombre del niño/a). */
    @Column(name = "display_name", nullable = false, length = 60)
    private String displayName;

    /** Fecha de creación de la cuenta (UTC). */
    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    /** Requerido por JPA (no usar directamente). */
    public User() {
    }

    /** Crea un usuario listo para guardar. */
    public User(String username, String passwordHash, String displayName) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getDisplayName() {
        return displayName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
