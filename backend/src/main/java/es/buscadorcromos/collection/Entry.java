package es.buscadorcromos.collection;

import es.buscadorcromos.catalog.Sticker;
import es.buscadorcromos.user.User;
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
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

/**
 * Entidad JPA: el estado de UN cromo para UN usuario.
 *
 * <p>La restricción única (user_id, sticker_id) garantiza como mucho una fila
 * por cromo y usuario: aquí solo se registran estados distintos de FALTA.</p>
 */
@Entity
@Table(name = "entries", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "sticker_id"}))
public class Entry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Propietario de esta entrada de colección. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Cromo al que se refiere el estado. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sticker_id", nullable = false)
    private Sticker sticker;

    /** Estado actual (nunca FALTA: ese estado es simplemente no tener fila). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private StickerStatus status = StickerStatus.FALTA;

    /** Se actualiza automáticamente en cada guardado (ver {@link #touch()}). */
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    /** Requerido por JPA (no usar directamente). */
    public Entry() {
    }

    /** Crea una entrada nueva con estado inicial. */
    public Entry(User user, Sticker sticker, StickerStatus status) {
        this.user = user;
        this.sticker = sticker;
        this.status = status;
    }

    /** Callback JPA: refresca updated_at antes de insertar o actualizar. */
    @jakarta.persistence.PrePersist
    @jakarta.persistence.PreUpdate
    void touch() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Sticker getSticker() {
        return sticker;
    }

    public StickerStatus getStatus() {
        return status;
    }

    public void setStatus(StickerStatus status) {
        this.status = status;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
