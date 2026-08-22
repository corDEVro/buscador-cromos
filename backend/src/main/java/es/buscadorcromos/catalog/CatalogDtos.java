package es.buscadorcromos.catalog;

import es.buscadorcromos.collection.StickerStatus;
import java.util.List;
import java.util.Map;

/** DTOs de solo lectura que expone la API pública del catálogo (/api/catalog). */
public final class CatalogDtos {

    private CatalogDtos() {
    }

    /** Una lámina tal y como la consume el frontend. */
    public record StickerDto(
            Long id,
            String code,
            String name,
            int number,
            String slotLabel,
            StickerCategory category,
            StickerSection section,
            boolean extra,
            String teamCode,
            int albumOrder) {
    }

    /** Un equipo con su plantilla de láminas ya ordenada. */
    public record TeamDto(
            Long id,
            String code,
            String name,
            String shortName,
            String color,
            List<StickerDto> stickers) {
    }

    /** Una serie especial con sus láminas. */
    public record SeriesDto(String code, String name, List<StickerDto> stickers) {
    }

    /** Respuesta completa de GET /api/catalog. */
    public record AlbumDto(String slug, String name, List<TeamDto> teams, List<SeriesDto> series) {
    }
}
