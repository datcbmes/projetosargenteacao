-- V1__init.sql

CREATE TABLE militar (
  id            BIGSERIAL PRIMARY KEY,
  numero_funcional VARCHAR(30) NOT NULL,
  nome          VARCHAR(200) NOT NULL,
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_militar_numero_funcional
  ON militar (numero_funcional);

CREATE TABLE boletim (
  id                BIGSERIAL PRIMARY KEY,
  nome_arquivo       VARCHAR(255) NOT NULL,
  hash_sha256 VARCHAR(64) NOT NULL,
  data_upload        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status_processamento VARCHAR(30) NOT NULL DEFAULT 'PROCESSANDO',
  erro_processamento TEXT,

  CONSTRAINT ck_boletim_status
    CHECK (status_processamento IN ('PROCESSANDO','CONCLUIDO','ERRO'))
);

CREATE UNIQUE INDEX ux_boletim_hash
  ON boletim (hash_sha256);

CREATE TABLE boletim_pagina (
  id            BIGSERIAL PRIMARY KEY,
  boletim_id    BIGINT NOT NULL REFERENCES boletim(id) ON DELETE CASCADE,
  numero_pagina INT NOT NULL,
  texto         TEXT NOT NULL,

  CONSTRAINT ux_boletim_pagina UNIQUE (boletim_id, numero_pagina)
);

CREATE INDEX ix_boletim_pagina_boletim
  ON boletim_pagina (boletim_id);

CREATE TABLE achado (
  id            BIGSERIAL PRIMARY KEY,
  boletim_id    BIGINT NOT NULL REFERENCES boletim(id) ON DELETE CASCADE,
  militar_id    BIGINT NOT NULL REFERENCES militar(id) ON DELETE CASCADE,
  numero_pagina INT NOT NULL,

  posicao_inicio INT,
  posicao_fim    INT,

  trecho        TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_achado_boletim
  ON achado (boletim_id);

CREATE INDEX ix_achado_militar
  ON achado (militar_id);

CREATE INDEX ix_achado_boletim_militar
  ON achado (boletim_id, militar_id);
