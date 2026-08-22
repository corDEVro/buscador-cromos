package es.buscadorcromos.collection;

/**
 * Estado de un cromo en la colección de un usuario.
 * El ciclo que aplica el frontend al tocar una carta es:
 * FALTA (❔ me falta) → PEGADA (✅ en el álbum) → REPETIDA (🔁 sobrante).
 */
public enum StickerStatus {
    /** Aún no lo tienes. Estado "virtual": no crea fila en BD. */
    FALTA,
    /** Ya está pegado en su hueco del álbum. */
    PEGADA,
    /** Tienes uno o más de más; no va al álbum pero sirve para cambiar. */
    REPETIDA;

    /** Siguiente estado del ciclo al tocar el cromo en la app. */
    public StickerStatus next() {
        return switch (this) {
            case FALTA -> PEGADA;
            case PEGADA -> REPETIDA;
            case REPETIDA -> FALTA;
        };
    }
}
