import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
BoletimOcorrenciaResponse,
BoletimResumoResponse,
BoletimUploadResponse,
} from '../models/boletim.models';

export type ModoBuscaOcorrencias = 'NF' | 'NOME' | 'AMBOS';

export interface BuscarOcorrenciasParams {
modo: ModoBuscaOcorrencias;
nf?: string | null;
nome?: string | null;
}

@Injectable({ providedIn: 'root' })
export class BoletimApi {
constructor(private http: HttpClient) {}

uploadBoletim(file: File): Observable<BoletimUploadResponse> {
const form = new FormData();
form.append('file', file);
return this.http.post<BoletimUploadResponse>('/api/boletins/upload', form);
}

/** GET /api/boletins (combo) */
listarBoletins(): Observable<BoletimResumoResponse[]> {
return this.http.get<BoletimResumoResponse[]>('/api/boletins');
}

/** GET /api/boletins/{boletimId}/ocorrencias (sem filtro) */
listarOcorrencias(boletimId: number): Observable<BoletimOcorrenciaResponse[]> {
return this.http.get<BoletimOcorrenciaResponse[]>(
`/api/boletins/${boletimId}/ocorrencias`
);
}

/**
* GET /api/boletins/{boletimId}/ocorrencias?nf=...&nome=...
*
* Observação:
* - Neste momento, o backend pode ainda não suportar esses parâmetros.
* - Quando suportar, basta trocar na tela para usar este método.
*
* Regras:
* - modo=NF => envia somente nf
* - modo=NOME => envia somente nome
* - modo=AMBOS => envia nf e/ou nome (o que estiver preenchido)
*/
buscarOcorrencias(
boletimId: number,
paramsBusca: BuscarOcorrenciasParams
): Observable<BoletimOcorrenciaResponse[]> {
let params = new HttpParams();

const modo = paramsBusca?.modo ?? 'NF';
const nf = (paramsBusca?.nf ?? '').toString().trim();
const nome = (paramsBusca?.nome ?? '').toString().trim();

// Mantém compatibilidade: se não tem nada, devolve o "listarOcorrencias"
    const nfOk = nf.length > 0;
const nomeOk = nome.length > 0;

if (!nfOk && !nomeOk) {
return this.listarOcorrencias(boletimId);
}

if (modo === 'NF') {
if (nfOk) params = params.set('nf', nf);
} else if (modo === 'NOME') {
if (nomeOk) params = params.set('nome', nome);
} else {
// AMBOS
      if (nfOk) params = params.set('nf', nf);
if (nomeOk) params = params.set('nome', nome);
}

return this.http.get<BoletimOcorrenciaResponse[]>(
`/api/boletins/${boletimId}/ocorrencias`,
{ params }
);
}
}
