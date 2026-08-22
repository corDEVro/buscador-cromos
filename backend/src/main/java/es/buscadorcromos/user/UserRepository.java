package es.buscadorcromos.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso a datos de usuarios (Spring Data genera las consultas por el nombre del método). */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Busca un usuario sin distinguir mayúsculas/minúsculas.
     * Se usa en login y para resolver el "subject" del JWT.
     */
    Optional<User> findByUsernameIgnoreCase(String username);

    /** Comprueba si un nombre de usuario ya está registrado (para el alta). */
    boolean existsByUsernameIgnoreCase(String username);
}
