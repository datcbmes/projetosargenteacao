CREATE TABLE boletim_ocorrencia (
  id              BIGSERIAL PRIMARY KEY,
  boletim_id      BIGINT NOT NULL REFERENCES boletim(id) ON DELETE CASCADE,
  militar_id      BIGINT NOT NULL REFERENCES militar(id),
  pagina          INT NOT NULL,
  trecho          TEXT NOT NULL,

  status          VARCHAR(20) NOT NULL DEFAULT 'PENDENTE', -- PENDENTE | TRANSCRITO
  transcrito_em   TIMESTAMPTZ NULL,
  transcrito_por  VARCHAR(120) NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_boletim_ocorrencia_boletim ON boletim_ocorrencia(boletim_id);
CREATE INDEX idx_boletim_ocorrencia_militar ON boletim_ocorrencia(militar_id);

-- evita duplicidade do mesmo militar na mesma página para o mesmo boletim
-- (pode ajustar depois, mas já ajuda muito no MVP)
CREATE UNIQUE INDEX uq_boletim_ocorrencia_unica
  ON boletim_ocorrencia(boletim_id, militar_id, pagina);
