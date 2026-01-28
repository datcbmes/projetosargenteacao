package br.gov.cbmes.cat.sargentacao_api.boletim.dto;

public record BoletimUploadResponse(
        Long boletimId,
        String nomeArquivo,
        String hashSha256,
        int totalPaginas,
        boolean jaExistia
) {}
