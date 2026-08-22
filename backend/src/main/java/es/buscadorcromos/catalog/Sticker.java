package es.buscadorcromos.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entidad JPA: una lámina del álbum.
 *
 * <p><b>Formato del código</b> (clave natural, único):</p>
 * <ul>
 *   <li>Equipo: {@code CODIGO-n} o {@code CODIGO-nX} con variante A/B — ej.: BAR-20, ALA-18B.</li>
 *   <li>Series: {@code PREFIJO-n} — ej.: ADN-1, FAN-3, D23-12, KRX-K5, EXT-15.</li>
 * </ul>
 *
 * <p>{@link #albumOrder} fija el orden canónico de pintado en la app:
 * equipos desde 10000 (por posición de equipo) y series desde 30000.</p>
 */
@Entity
@Table(name = "stickers")
public class Sticker {

    /** Identificador técnico autogenerado; el código es la clave de negocio. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Código único del cromo (ver formato arriba). Lo usan la API y el frontend. */
    @Column(nullable = false, unique = true, length = 16)
    private String code;

    /** Nombre impreso en el cromo ("Lamine Yamal"). */
    @Column(nullable = false, length = 120)
    private String name;

    /** Número de la lámina dentro del equipo/serie (1..~24). */
    @Column(nullable = false)
    private int number;

    /** Letra de variante si hay dos láminas con el mismo número ("A"/"B"); null si no aplica. */
    @Column(name = "slot_label", length = 2)
    private String slotLabel;

    /** Qué representa la lámina: escudo / entrenador / jugador. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StickerCategory category;

    /** Sección del álbum a la que pertenece. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StickerSection section;

    /**
     * true para los Extra Stickers (Oro/Plata/Bronce): son de coleccionista,
     * NO se pegan en el álbum y no cuentan para el progreso.
     */
    @Column(name = "is_extra", nullable = false)
    private boolean extra;

    /** Equipo al que pertenece (null solo en cromos de series). LAZY para no arrastrarlo siempre. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    /** Orden canónico de visualización (ver comentario de la clase). */
    @Column(name = "album_order", nullable = false)
    private int albumOrder;

    public Sticker() {
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getNumber() {
        return number;
    }

    public void setNumber(int number) {
        this.number = number;
    }

    public String getSlotLabel() {
        return slotLabel;
    }

    public void setSlotLabel(String slotLabel) {
        this.slotLabel = slotLabel;
    }

    public StickerCategory getCategory() {
        return category;
    }

    public void setCategory(StickerCategory category) {
        this.category = category;
    }

    public StickerSection getSection() {
        return section;
    }

    public void setSection(StickerSection section) {
        this.section = section;
    }

    public boolean isExtra() {
        return extra;
    }

    public void setExtra(boolean extra) {
        this.extra = extra;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public int getAlbumOrder() {
        return albumOrder;
    }

    public void setAlbumOrder(int albumOrder) {
        this.albumOrder = albumOrder;
    }
}
