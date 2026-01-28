package br.gov.cbmes.cat.sargentacao_api.boletim.dto;

import jakarta.validation.constraints.NotBlank;

public record TranscreverRequest(
        @NotBlank String transcritoPor
) {}
