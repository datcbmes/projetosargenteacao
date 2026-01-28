ALTER TABLE boletim
  ALTER COLUMN criado_em SET DEFAULT now();

-- (Opcional, se existirem registros antigos com null, corrigir)
UPDATE boletim
SET criado_em = now()
WHERE criado_em IS NULL;
