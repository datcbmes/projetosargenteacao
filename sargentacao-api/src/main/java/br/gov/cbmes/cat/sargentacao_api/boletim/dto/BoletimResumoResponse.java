package br.gov.cbmes.cat.sargentacao_api.boletim.dto;

import java.time.OffsetDateTime;

public record BoletimResumoResponse(
        Long id,
        String nomeArquivo,
        String hashSha256,
        OffsetDateTime criadoEm,
        Long totalPaginas
) {}
