export type BoletimUploadResponse = {
boletimId: number;
nomeArquivo: string;
hashSha256: string;
totalPaginas: number;
jaExistia: boolean;
};

export type BoletimOcorrenciaResponse = {
id: number;
boletimId: number;
nomeArquivo: string;
pagina: number;
militarId?: number | null;
numeroFuncional?: string | null;
nomeMilitar?: string | null;
trecho: string;
status: string;
createdAt?: string | null;
observacao?: string | null;
};

/**
* Alimenta o combo do front (GET /api/boletins).
* Ajuste os nomes se o backend devolver diferente.
*/
export type BoletimResumoResponse = {
id: number;
nomeArquivo: string;
hashSha256: string;
criadoEm: string; // ISO
  totalOcorrencias: number;
};
