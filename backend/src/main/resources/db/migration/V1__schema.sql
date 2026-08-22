-- ============================================================================
-- V1: esquema inicial del álbum Liga Este 2026/27
-- Aplicada automáticamente por Flyway al arrancar (solo si no se ha aplicado).
-- ============================================================================

-- Equipos de LaLiga que aparecen en el álbum (20 filas tras el seed).
CREATE TABLE teams (
    id            BIGSERIAL PRIMARY KEY,
    code          VARCHAR(10)  NOT NULL UNIQUE,   -- BAR, MAD, ATM...
    name          VARCHAR(80)  NOT NULL,          -- "FC Barcelona"
    short_name    VARCHAR(40)  NOT NULL,          -- "Barcelona" (pestañas UI)
    color         VARCHAR(9)   NOT NULL,          -- color corporativo hex
    team_order    INT          NOT NULL           -- posición en el álbum
);

-- Las láminas del álbum (~493 tras el seed): equipos + series especiales.
CREATE TABLE stickers (
    id           BIGSERIAL PRIMARY KEY,
    code         VARCHAR(16)  NOT NULL UNIQUE,   -- BAR-20, ALA-18B, ADN-1, KRX-K1...
    name         VARCHAR(120) NOT NULL,          -- nombre impreso
    number       INT          NOT NULL,          -- nº de lámina
    slot_label   VARCHAR(2),                     -- variante A/B o NULL
    category     VARCHAR(20)  NOT NULL,          -- ESCUDO | ENTRENADOR | JUGADOR
    section      VARCHAR(20)  NOT NULL,          -- EQUIPO | ADN_PRIME | FANTASY | DRAFT23 | KROMIX | EXTRA
    is_extra     BOOLEAN      NOT NULL DEFAULT FALSE, -- true = no pegable
    team_id      BIGINT REFERENCES teams(id),    -- NULL en series sin equipo
    album_order  INT          NOT NULL           -- orden canónico de pintado
);

CREATE INDEX idx_stickers_team ON stickers(team_id);
CREATE INDEX idx_stickers_section ON stickers(section);

-- Usuarios registrados. La contraseña solo se guarda como hash BCrypt.
CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(30)  NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    display_name  VARCHAR(60)  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Estado de cada cromo para cada usuario.
-- Solo existen filas con estado distinto de FALTA:
--   PEGADA   -> ya está en su hueco del álbum
--   REPETIDA -> sobrante para cambios
CREATE TABLE entries (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sticker_id BIGINT      NOT NULL REFERENCES stickers(id) ON DELETE CASCADE,
    status     VARCHAR(10) NOT NULL DEFAULT 'FALTA',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_entries_user_sticker UNIQUE (user_id, sticker_id) -- máx. 1 fila por cromo y usuario
);

CREATE INDEX idx_entries_user ON entries(user_id);
