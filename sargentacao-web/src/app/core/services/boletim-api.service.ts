import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BoletimUploadResponse {
boletimId: number;
nomeArquivo: string;
hashSha256: string;
totalPaginas: number;
jaExistia: boolean;
}

export interface BoletimOcorrenciaDto {
boletimId: number;
nomeArquivo: string;
pagina: number;
militarId: number;
numeroFuncional: string;
nomeMilitar: string;
trecho: string;
}

@Injectable({ providedIn: 'root' })
export class BoletimApiService {
private readonly baseUrl = '/api'; // usando proxy.conf.json

  constructor(private http: HttpClient) {}

uploadBoletim(file: File): Observable<BoletimUploadResponse> {
const form = new FormData();
form.append('file', file);
return this.http.post<BoletimUploadResponse>(`${this.baseUrl}/boletins/upload`, form);
}

listarOcorrencias(boletimId: number): Observable<BoletimOcorrenciaDto[]> {
return this.http.get<BoletimOcorrenciaDto[]>(`${this.baseUrl}/boletins/${boletimId}/ocorrencias`);
}
}
