package br.gov.cbmes.cat.sargentacao_api.militar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MilitarCreateRequest(
        @NotBlank @Size(max = 30) String numeroFuncional,
        @NotBlank @Size(max = 200) String nome,
        Boolean ativo
) {}
