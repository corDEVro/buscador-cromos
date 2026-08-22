package es.buscadorcromos.catalog;

/**
 * Secciones del álbum Liga Este 2026/27.
 * Los nombres DEBEN coincidir con el campo "code" de cada serie del JSON de seed,
 * porque el seeder hace StickerSection.valueOf(códigoDeLaSerie).
 */
public enum StickerSection {
    /** Cromos de los 20 equipos (escudo + entrenador + plantilla). */
    EQUIPO,
    /** Serie ADN LaLiga Prime (15 cromos). */
    ADN_PRIME,
    /** Serie LaLiga Fantasy (9 cromos). */
    FANTASY,
    /** Serie Draft 23 (23 cromos, jóvenes promesas nacidos en 2003+). */
    DRAFT23,
    /** Serie Kromix metálica (23 cromos, KRX-K1..K23). */
    KROMIX,
    /** Extra Stickers Oro/Plata/Bronce (15): no se pegan en el álbum. */
    EXTRA
}
