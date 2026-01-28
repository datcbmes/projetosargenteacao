package br.gov.cbmes.cat.sargentacao_api.militar.dto;

public record MilitarResponse(
        Long id,
        String numeroFuncional,
        String nome,
        boolean ativo
) { }
