-- Cria tabelas se não existirem (safe)
create table if not exists boletim (
    id bigserial primary key,
    nome_arquivo varchar(255) not null,
    hash_sha256 varchar(64) not null unique,
    criado_em timestamptz not null
);

create table if not exists boletim_pagina (
    id bigserial primary key,
    boletim_id bigint not null references boletim(id) on delete cascade,
    numero_pagina int not null,
    texto text,
    constraint uk_boletim_pagina unique (boletim_id, numero_pagina)
);

-- Ajustes de tipos, caso já existam com tipos errados
do $$
begin
    -- hash_sha256 como varchar(64)
    if exists (
        select 1
        from information_schema.columns
        where table_name = 'boletim' and column_name = 'hash_sha256'
    ) then
        -- tenta converter para varchar(64) (se já for, não muda)
        begin
            alter table boletim
                alter column hash_sha256 type varchar(64);
        exception when others then
            -- se houver lixo de padding, converte com trim
            alter table boletim
                alter column hash_sha256 type varchar(64) using trim(hash_sha256);
        end;
    end if;

    -- texto como text (evita OID/CLOB)
    if exists (
        select 1
        from information_schema.columns
        where table_name = 'boletim_pagina' and column_name = 'texto'
    ) then
        begin
            alter table boletim_pagina
                alter column texto type text;
        exception when others then
            -- se vier de OID, é melhor recriar coluna (raríssimo no seu cenário agora).
            null;
        end;
    end if;
end $$;
