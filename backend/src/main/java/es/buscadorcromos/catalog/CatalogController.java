package es.buscadorcromos.catalog;

import es.buscadorcromos.collection.StickerStatus;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API pública de consulta del catálogo: GET /api/catalog.
 * Devuelve el álbum entero (20 equipos + 5 series, ~500 láminas) en una sola
 * llamada; el frontend lo cachea en memoria durante la sesión.
 */
@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final TeamRepository teams;
    private final StickerRepository stickers;

    public CatalogController(TeamRepository teams, StickerRepository stickers) {
        this.teams = teams;
        this.stickers = stickers;
    }

    /**
     * Construye el DTO del álbum completo.
     *
     * <p>Importante: va anotado con {@code @Transactional(readOnly = true)} porque
     * los cromos tienen su equipo como relación LAZY; sin transacción abierta,
     * acceder a {@code s.getTeam()} lanzaría LazyInitializationException.</p>
     */
    @GetMapping
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public CatalogDtos.AlbumDto album() {
        // Una sola query por tabla y agrupación en memoria (el catálogo es pequeño)
        var teamList = teams.findAllByOrderByTeamOrderAsc();
        var allStickers = stickers.findAllByOrderByAlbumOrderAsc();

        // Reparte los cromos por id de equipo para montar cada TeamDto
        var stickersByTeam = new java.util.HashMap<Long, List<CatalogDtos.StickerDto>>();
        for (var s : allStickers) {
            Long teamId = s.getTeam() == null ? null : s.getTeam().getId();
            if (teamId != null) {
                stickersByTeam.computeIfAbsent(teamId, k -> new java.util.ArrayList<>()).add(toDto(s));
            }
        }

        var teamDtos = teamList.stream()
                .map(t -> new CatalogDtos.TeamDto(t.getId(), t.getCode(), t.getName(), t.getShortName(),
                        t.getColor(), stickersByTeam.getOrDefault(t.getId(), List.of())))
                .toList();

        // Series especiales: todas las secciones menos EQUIPO, en orden del enum
        var seriesDtos = java.util.Arrays.stream(StickerSection.values())
                .filter(sec -> sec != StickerSection.EQUIPO)
                .map(sec -> new CatalogDtos.SeriesDto(sec.name(), sectionName(sec),
                        allStickers.stream()
                                .filter(s -> s.getSection() == sec)
                                .map(CatalogController::toDto)
                                .toList()))
                .toList();

        return new CatalogDtos.AlbumDto("liga-este-2026-27", "Liga Este 2026/27", teamDtos, seriesDtos);
    }

    /** Mapeo entidad → DTO compartido entre equipos y series. */
    static CatalogDtos.StickerDto toDto(Sticker s) {
        return new CatalogDtos.StickerDto(
                s.getId(), s.getCode(), s.getName(), s.getNumber(), s.getSlotLabel(),
                s.getCategory(), s.getSection(), s.isExtra(),
                s.getTeam() == null ? null : s.getTeam().getCode(), s.getAlbumOrder());
    }

    private static String sectionName(StickerSection section) {
        return switch (section) {
            case ADN_PRIME -> "ADN LaLiga Prime";
            case FANTASY -> "LaLiga Fantasy";
            case DRAFT23 -> "Draft 23";
            case KROMIX -> "Kromix · paralela de Draft 23";
            case FICHAJES -> "Últimos Fichajes";
            case EXTRA -> "Extra Stickers";
            default -> section.name();
        };
    }
}
