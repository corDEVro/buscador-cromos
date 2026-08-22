package es.buscadorcromos.collection;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso a datos de las entradas de colección (estado usuario↔cromo). */
public interface EntryRepository extends JpaRepository<Entry, Long> {

    /** Toda la colección anotada de un usuario (para pintar el álbum). */
    List<Entry> findByUserId(Long userId);

    /** Busca la entrada concreta de un cromo (para cycle/PUT). */
    Optional<Entry> findByUserIdAndStickerId(Long userId, Long stickerId);

    /** Cuenta cuántos tiene el usuario en un estado dado. */
    long countByUserIdAndStatus(Long userId, StickerStatus status);

    /** Borra la entrada de un cromo = volver a estado FALTA. */
    void deleteByUserIdAndStickerId(Long userId, Long stickerId);
}
