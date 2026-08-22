package es.buscadorcromos.catalog;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso a datos de equipos. Spring Data genera las consultas por nombre de método. */
public interface TeamRepository extends JpaRepository<Team, Long> {

    /** Busca un equipo por su código corto (BAR, MAD…). Lo usa el seeder. */
    Optional<Team> findByCode(String code);

    /** Equipos en el orden en que aparecen en el álbum. */
    List<Team> findAllByOrderByTeamOrderAsc();
}
