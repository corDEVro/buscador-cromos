package es.buscadorcromos.catalog;

import tools.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Carga el checklist del álbum (equipos + cromos) desde el recurso JSON a la
 * base de datos. Es idempotente: actualiza por código las filas existentes e
 * inserta las nuevas.
 */
@Component
public class CatalogSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(CatalogSeeder.class);

    private final TeamRepository teams;
    private final StickerRepository stickers;
    private final ObjectMapper mapper;

    public CatalogSeeder(TeamRepository teams, StickerRepository stickers, ObjectMapper mapper) {
        this.teams = teams;
        this.stickers = stickers;
        this.mapper = mapper;
    }

    // --- forma del JSON de seed (campos mínimos; Jackson mapea por nombre) ---

    /** Una lámina del JSON: número, variante opcional, nombre, categoría y equipo (series). */
    public record SeedSticker(int n, String label, String name, String cat, String t) {
        public String label() {
            return label;
        }
    }

    /** Una serie especial del JSON: código (= StickerSection), prefijo de código y si es "extra". */
    public record SeedSeries(String code, String name, String prefix, Boolean extra, java.util.List<SeedSticker> stickers) {
    }

    /** Un equipo del JSON con su lista de láminas. */
    public record SeedTeam(String code, String name, String shortName, String color, java.util.List<SeedSticker> stickers) {
    }

    /** Raíz del JSON. */
    public record SeedAlbum(String slug, String name, java.util.List<SeedTeam> teams, java.util.List<SeedSeries> series) {
    }

    /**
     * Ejecuta al arrancar la app. Idempotente: se puede reiniciar cuantas veces
     * se quiera sin duplicar datos (siempre busca por código y actualiza).
     */
    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        // 1) Leer el checklist completo desde resources/catalog/liga-este-2026-27.json
        SeedAlbum album = mapper.readValue(
                new ClassPathResource("catalog/liga-este-2026-27.json").getInputStream(),
                SeedAlbum.class);

        // 2) Equipos: upsert por código + sus láminas (sección EQUIPO)
        Map<String, Team> teamByCode = new HashMap<>();
        int teamOrder = 0;
        for (SeedTeam st : album.teams()) {
            Team team = teams.findByCode(st.code()).orElseGet(Team::new);
            if (team.getId() == null) {
                team = new Team(st.code(), st.name(), st.shortName(), st.color(), teamOrder);
            }
            teams.save(team);
            teamByCode.put(st.code(), team);

            int i = 0;
            for (SeedSticker ss : st.stickers()) {
                String code = stickerCode(st.code(), ss.n(), ss.label());
                Sticker s = stickers.findByCode(code).orElseGet(Sticker::new); // ¿existe? actualizar : crear
                s.setCode(code);
                s.setName(ss.name());
                s.setNumber(ss.n());
                s.setSlotLabel(ss.label());
                // Sin "cat" en el JSON => JUGADOR
                s.setCategory(ss.cat() == null ? StickerCategory.JUGADOR : StickerCategory.valueOf(ss.cat()));
                s.setSection(StickerSection.EQUIPO);
                s.setExtra(false); // los de equipo siempre se pegan
                s.setTeam(team);
                s.setAlbumOrder(albumOrder(teamOrder, ss.n(), ss.label(), i));
                stickers.save(s);
                i++;
            }
            teamOrder++;
        }

        // 3) Series especiales (ADN Prime, Fantasy, Draft 23, Kromix y Extras)
        int seriesIndex = 0;
        int seq = 0;
        for (SeedSeries series : album.series()) {
            boolean isExtra = Boolean.TRUE.equals(series.extra());
            for (SeedSticker ss : series.stickers()) {
                // Kromix usa numeración K1..K23 para no chocar con otros códigos
                String code = series.prefix() + "-" + (series.code().equals("KROMIX") ? "K" + ss.n() : ss.n());
                Sticker s = stickers.findByCode(code).orElseGet(Sticker::new);
                s.setCode(code);
                s.setName(ss.name());
                s.setNumber(ss.n());
                s.setSlotLabel(null);
                s.setCategory(ss.cat() == null ? StickerCategory.JUGADOR : StickerCategory.valueOf(ss.cat()));
                s.setSection(StickerSection.valueOf(series.code())); // code JSON == nombre del enum
                s.setExtra(isExtra);
                // Algunas láminas de serie referencian a un equipo (p. ej. ADN Prime)
                s.setTeam(ss.t() == null ? null : teamByCode.get(ss.t()));
                s.setAlbumOrder(30000 + seriesIndex * 1000 + seq); // bloques de 1000 por serie
                stickers.save(s);
                seq++;
            }
            seriesIndex++;
        }

        log.info("Catálogo cargado: {} equipos, {} cromos", teamByCode.size(), stickers.count());
    }

    /** Código de una lámina de equipo: CODIGO-n o CODIGO-nA/nB si hay variante. */
    private static String stickerCode(String teamCode, int n, String label) {
        return teamCode + "-" + n + (label == null ? "" : label);
    }

    private static int labelRank(String label) {
        if (label == null) {
            return 0;
        }
        return switch (label.toUpperCase()) {
            case "A" -> 1;
            case "B" -> 2;
            default -> 3;
        };
    }

    private static int albumOrder(int teamOrder, int number, String label, int indexInTeam) {
        // Orden estable: posición dentro del equipo manda; el número da lectura natural.
        return 10000 + teamOrder * 500 + indexInTeam;
    }
}
