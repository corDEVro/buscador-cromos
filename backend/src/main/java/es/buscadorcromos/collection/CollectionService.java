package es.buscadorcromos.collection;

import es.buscadorcromos.catalog.Sticker;
import es.buscadorcromos.catalog.StickerRepository;
import es.buscadorcromos.catalog.Team;
import es.buscadorcromos.catalog.TeamRepository;
import es.buscadorcromos.user.User;
import es.buscadorcromos.user.UserRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Lógica de negocio de la colección de un usuario: consultar, cambiar de estado
 * y calcular estadísticas. Todos los métodos filtran SIEMPRE por el usuario que
 * llega del token JWT, así nadie puede tocar la colección de otro.
 */
@Service
public class CollectionService {

    private final EntryRepository entries;
    private final StickerRepository stickers;
    private final TeamRepository teams;
    private final UserRepository users;

    public CollectionService(EntryRepository entries, StickerRepository stickers,
                             TeamRepository teams, UserRepository users) {
        this.entries = entries;
        this.stickers = stickers;
        this.teams = teams;
        this.users = users;
    }

    /** Estado de un cromo tal y como se expone en la API (solo código + estado). */
    public record EntryDto(String stickerCode, StickerStatus status) {
    }

    /** Progreso de un equipo concreto (lo usa la barra por equipo en el frontend). */
    public record TeamStats(String teamCode, String teamName, String color, long total, long pegadas) {
    }

    /** Resumen global: totales, repetidas y porcentaje completado. */
    public record Stats(long total, long pegadas, long repetidas, double percent, List<TeamStats> byTeam) {
    }

    /** Devuelve todos los estados no-FALTA del usuario (para pintar el álbum). */
    @Transactional(readOnly = true)
    public List<EntryDto> getCollection(String username) {
        User user = requireUser(username);
        return entries.findByUserId(user.getId()).stream()
                .map(e -> new EntryDto(e.getSticker().getCode(), e.getStatus()))
                .toList();
    }

    /**
     * Fija el estado exacto de un cromo (PUT). Si el usuario aún no tenía ese
     * cromo anotado, crea la entrada; si ya la tenía, actualiza.
     */
    @Transactional
    public EntryDto setStatus(String username, String stickerCode, StickerStatus status) {
        User user = requireUser(username);
        Sticker sticker = stickers.findByCode(stickerCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Cromo no encontrado: " + stickerCode));
        Entry entry = entries.findByUserIdAndStickerId(user.getId(), sticker.getId())
                .orElseGet(() -> new Entry(user, sticker, status));
        entry.setStatus(status);
        entries.save(entry);
        return new EntryDto(sticker.getCode(), entry.getStatus());
    }

    /** Cambia al siguiente estado del ciclo: FALTA → PEGADA → REPETIDA → FALTA. */
    @Transactional
    public EntryDto cycle(String username, String stickerCode) {
        return setStatus(username, stickerCode,
                currentStatus(username, stickerCode).next());
    }

    /**
     * Resetea un cromo a "no anotado" (DELETE). Si no existía entrada, no pasa
     * nada: la operación es idempotente.
     */
    @Transactional
    public void clearStatus(String username, String stickerCode) {
        User user = requireUser(username);
        stickers.findByCode(stickerCode).ifPresent(sticker ->
                entries.deleteByUserIdAndStickerId(user.getId(), sticker.getId()));
    }

    /**
     * Estadísticas para las barras de progreso.
     *
     * <p>Estrategia: carga el catálogo completo y los estados del usuario, y hace
     * los cálculos en memoria (el catálogo es pequeño y estable). Los Extras
     * quedan fuera del progreso por equipo porque no se pegan.</p>
     */
    @Transactional(readOnly = true)
    public Stats stats(String username) {
        User user = requireUser(username);

        List<Sticker> allStickers = stickers.findAllByOrderByAlbumOrderAsc();
        // Mapa código -> estado; lo que no esté en entries se considera FALTA
        Map<String, StickerStatus> statusByCode = new HashMap<>();
        for (Entry e : entries.findByUserId(user.getId())) {
            statusByCode.put(e.getSticker().getCode(), e.getStatus());
        }

        // Recorrido único sobre el catálogo acumulando totales globales y por equipo
        long total = allStickers.size();
        long pegadas = 0;
        long repetidas = 0;

        Map<String, long[]> byTeamTotals = new HashMap<>(); // código -> [total, pegadas]
        for (Sticker s : allStickers) {
            StickerStatus st = statusByCode.getOrDefault(s.getCode(), StickerStatus.FALTA);
            if (st == StickerStatus.PEGADA) {
                pegadas++;
            } else if (st == StickerStatus.REPETIDA) {
                repetidas++;
            }
            if (s.getTeam() != null && s.getSection() == es.buscadorcromos.catalog.StickerSection.EQUIPO) {
                long[] t = byTeamTotals.computeIfAbsent(s.getTeam().getCode(), k -> new long[2]);
                t[0]++;
                if (st == StickerStatus.PEGADA) {
                    t[1]++;
                }
            }
        }

        // Respeta el orden del álbum aunque un equipo no tenga cromos anotados
        List<TeamStats> byTeam = new ArrayList<>();
        for (Team team : teams.findAllByOrderByTeamOrderAsc()) {
            long[] t = byTeamTotals.getOrDefault(team.getCode(), new long[]{0, 0});
            byTeam.add(new TeamStats(team.getCode(), team.getShortName(), team.getColor(), t[0], t[1]));
        }

        // Un decimal de precisión, p. ej. 0.2 % con 1/493
        double percent = total == 0 ? 0 : Math.round(pegadas * 1000.0 / total) / 10.0;
        return new Stats(total, pegadas, repetidas, percent, byTeam);
    }

    /** Estado actual de un cromo para este usuario; FALTA si nunca se ha anotado. */
    private StickerStatus currentStatus(String username, String stickerCode) {
        User user = requireUser(username);
        Sticker sticker = stickers.findByCode(stickerCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Cromo no encontrado: " + stickerCode));
        return entries.findByUserIdAndStickerId(user.getId(), sticker.getId())
                .map(Entry::getStatus)
                .orElse(StickerStatus.FALTA);
    }

    /** Recupera al usuario a partir del nombre del token; 401 si no existe. */
    private User requireUser(String username) {
        return users.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
