package es.buscadorcromos.catalog;

import jakarta.persistence.*;

/**
 * Entidad JPA: uno de los 20 equipos de LaLiga del álbum.
 * El color se usa en el frontend para pintar las pestañas y cabeceras.
 */
@Entity
@Table(name = "teams")
public class Team {

    /** Identificador autogenerado. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Código corto único: BAR, MAD, ATM… (parte del código de sus cromos). */
    @Column(nullable = false, unique = true, length = 10)
    private String code;

    /** Nombre oficial ("FC Barcelona"). */
    @Column(nullable = false, length = 80)
    private String name;

    /** Nombre corto para botones/pestañas ("Barcelona", "Athletic"). */
    @Column(name = "short_name", nullable = false, length = 40)
    private String shortName;

    /** Color corporativo en hexadecimal (#A50044). */
    @Column(nullable = false, length = 9)
    private String color;

    /** Posición del equipo en el álbum (0..19) para mantener el orden oficial. */
    @Column(name = "team_order", nullable = false)
    private int teamOrder;

    /** Requerido por JPA (no usar directamente). */
    public Team() {
    }

    /** Crea un equipo completo listo para guardar. */
    public Team(String code, String name, String shortName, String color, int teamOrder) {
        this.code = code;
        this.name = name;
        this.shortName = shortName;
        this.color = color;
        this.teamOrder = teamOrder;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getShortName() {
        return shortName;
    }

    public String getColor() {
        return color;
    }

    public int getTeamOrder() {
        return teamOrder;
    }
}
