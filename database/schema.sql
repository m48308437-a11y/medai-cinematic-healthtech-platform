-- ==================================================================
-- MEDAI · PostgreSQL schema (v1)
-- Health data is sensitive: enable pgcrypto, encrypt at rest,
-- and restrict direct table access behind the API service role.
-- ==================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- Identity & access ----------
CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,            -- super_admin | admin | medical_content_manager | support | analyst | user
    description TEXT DEFAULT ''
);

CREATE TABLE permissions (
    id          SERIAL PRIMARY KEY,
    code        TEXT NOT NULL UNIQUE,            -- e.g. users.suspend, knowledge.reindex
    description TEXT DEFAULT ''
);

CREATE TABLE role_permissions (
    role_id       INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           CITEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,               -- bcrypt/argon2 — never plain text
    full_name       TEXT NOT NULL,
    role_id         INT NOT NULL REFERENCES roles(id),
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','deleted')),
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    locale          TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('en','fa','de')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash   TEXT NOT NULL UNIQUE,           -- store hash, never the raw token
    ip           INET,
    user_agent   TEXT,
    expires_at   TIMESTAMPTZ NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- AI conversations ----------
CREATE TABLE consultations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL DEFAULT 'New consultation',
    lang        TEXT NOT NULL DEFAULT 'en',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE messages (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    role            TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
    content         TEXT NOT NULL,
    sources         JSONB DEFAULT '[]',
    has_warning     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_consultation ON messages (consultation_id, created_at);

-- ---------- Health records ----------
CREATE TABLE symptoms (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind        TEXT NOT NULL,
    severity    SMALLINT CHECK (severity BETWEEN 1 AND 5),
    started_at  TIMESTAMPTZ,
    context     JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lab_results (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_code   TEXT NOT NULL,
    value       NUMERIC NOT NULL,
    unit        TEXT NOT NULL,
    ref_low     NUMERIC,
    ref_high    NUMERIC,
    taken_at    TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_labs_user ON lab_results (user_id, test_code, taken_at);

CREATE TABLE medications (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    dose        TEXT,
    schedule    JSONB DEFAULT '[]',
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE health_notes (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood        SMALLINT CHECK (mood BETWEEN 1 AND 5),
    note        TEXT NOT NULL,
    tag         TEXT DEFAULT 'note',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reminders (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind        TEXT NOT NULL CHECK (kind IN ('appointment','medication','lab_followup','general')),
    title       TEXT NOT NULL,
    due_at      TIMESTAMPTZ NOT NULL,
    done        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Medical knowledge (RAG) ----------
CREATE TABLE medical_sources (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        TEXT NOT NULL,                   -- WHO, MedlinePlus, CDC ...
    base_url    TEXT,
    license     TEXT,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE knowledge_documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id   BIGINT REFERENCES medical_sources(id) ON DELETE SET NULL,
    title       TEXT NOT NULL,
    version     TEXT NOT NULL DEFAULT 'v1.0',
    status      TEXT NOT NULL DEFAULT 'indexed' CHECK (status IN ('pending','indexed','updating','failed','archived')),
    chunk_count INT NOT NULL DEFAULT 0,
    checksum    TEXT,
    reindexed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (title, version)
);

-- ---------- Safety & observability ----------
CREATE TABLE safety_events (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    severity    TEXT NOT NULL CHECK (severity IN ('critical','high','medium','low')),
    rule_code   TEXT NOT NULL,
    detail      JSONB DEFAULT '{}',
    resolved    BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    body        TEXT NOT NULL,
    read        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,                   -- e.g. user.suspend, knowledge.reindex
    target      TEXT,
    metadata    JSONB DEFAULT '{}',
    ip          INET,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_created ON audit_logs (created_at DESC);

-- ---------- Seed roles ----------
INSERT INTO roles (name, description) VALUES
    ('super_admin', 'Full platform control'),
    ('admin', 'User, safety and system management'),
    ('medical_content_manager', 'Sources, documents and content'),
    ('support', 'User support, anonymized reads'),
    ('analyst', 'Read-only analytics')
ON CONFLICT (name) DO NOTHING;
