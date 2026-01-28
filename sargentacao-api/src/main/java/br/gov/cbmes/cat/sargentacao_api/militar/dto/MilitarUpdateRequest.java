package br.gov.cbmes.cat.sargentacao_api.militar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MilitarUpdateRequest(
        @NotBlank @Size(max = 200) String nome
) {}
