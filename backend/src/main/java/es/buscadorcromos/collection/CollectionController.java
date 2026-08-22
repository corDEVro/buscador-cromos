package es.buscadorcromos.collection;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * API REST de la colección del usuario autenticado (prefijo /api/collection).
 * El usuario se saca siempre del Principal que rellena JwtAuthFilter; nunca
 * llega por parámetro, así cada uno solo ve lo suyo.
 */
@RestController
@RequestMapping("/api/collection")
public class CollectionController {

    private final CollectionService service;

    public CollectionController(CollectionService service) {
        this.service = service;
    }

    /** Cuerpo de PUT /api/collection/{code}: estado exacto a fijar. */
    public record StatusRequest(@jakarta.validation.constraints.NotNull StickerStatus status) {
    }

    /** GET /api/collection — todos los estados no-FALTA del usuario. */
    @GetMapping
    public List<CollectionService.EntryDto> collection(Principal principal) {
        return service.getCollection(requirePrincipal(principal));
    }

    /** PUT /api/collection/{code} — fija un estado concreto (FALTA/PEGADA/REPETIDA). */
    @PutMapping("/{code}")
    public CollectionService.EntryDto setStatus(Principal principal, @PathVariable String code,
                                                @Valid @RequestBody StatusRequest request) {
        return service.setStatus(requirePrincipal(principal), code, request.status());
    }

    /** POST /api/collection/{code}/cycle — avanza un paso en el ciclo de estados. */
    @PostMapping("/{code}/cycle")
    public CollectionService.EntryDto cycle(Principal principal, @PathVariable String code) {
        return service.cycle(requirePrincipal(principal), code);
    }

    /** DELETE /api/collection/{code} — vuelve el cromo a "sin anotar" (204). */
    @DeleteMapping("/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clear(Principal principal, @PathVariable String code) {
        service.clearStatus(requirePrincipal(principal), code);
    }

    /** GET /api/collection/stats — resumen y progreso por equipo para las barras. */
    @GetMapping("/stats")
    public CollectionService.Stats stats(Principal principal) {
        return service.stats(requirePrincipal(principal));
    }

    /** Garantiza que hay usuario autenticado en la petición. */
    private static String requirePrincipal(Principal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return principal.getName();
    }
}
