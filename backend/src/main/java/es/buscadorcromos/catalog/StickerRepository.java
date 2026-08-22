package es.buscadorcromos.catalog;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso a datos de cromos. Spring Data genera las consultas por nombre de método. */
public interface StickerRepository extends JpaRepository<Sticker, Long> {

    /** Busca un cromo por su código único (BAR-20, KRX-K1…). Clave para la API. */
    Optional<Sticker> findByCode(String code);

    /** Todos los cromos ya ordenados tal y como van en el álbum. */
    List<Sticker> findAllByOrderByAlbumOrderAsc();

    /** Cuenta cromos de una sección (útil para comprobaciones del seed). */
    long countBySection(StickerSection section);
}
