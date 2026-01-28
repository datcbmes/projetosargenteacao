package br.gov.cbmes.cat.sargentacao_api.boletim.dto;

import br.gov.cbmes.cat.sargentacao_api.boletim.model.BoletimOcorrencia;
import java.time.OffsetDateTime;

public record OcorrenciaResumoResponse(
        Long ocorrenciaId,
        Long boletimId,
        String nomeArquivo,
        Integer pagina,
        Long militarId,
        String numeroFuncional,
        String nomeMilitar,
        String trecho,
        BoletimOcorrencia.Status status,
        OffsetDateTime transcritoEm,
        String transcritoPor
) {}
