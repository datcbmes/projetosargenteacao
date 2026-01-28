import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
MilitarCreateRequest,
MilitarResponse,
MilitarUpdateRequest,
} from '../models/militar.models';

@Injectable({ providedIn: 'root' })
export class MilitarApi {
constructor(private http: HttpClient) {}

/**
* GET /api/militares?ativo=&q=
* - ativo: true | false | omitido (todos)
* - q: busca em nome ou numeroFuncional
*/
listar(filtro?: { ativo?: boolean | null; q?: string | null }): Observable<MilitarResponse[]> {
let params = new HttpParams();

if (filtro?.ativo !== null && filtro?.ativo !== undefined) {
params = params.set('ativo', String(filtro.ativo));
}
if (filtro?.q) {
params = params.set('q', filtro.q);
}

return this.http.get<MilitarResponse[]>('/api/militares', { params });
}

getById(id: number): Observable<MilitarResponse> {
return this.http.get<MilitarResponse>(`/api/militares/${id}`);
}

criar(payload: MilitarCreateRequest): Observable<MilitarResponse> {
return this.http.post<MilitarResponse>('/api/militares', payload);
}

atualizar(id: number, payload: MilitarUpdateRequest): Observable<MilitarResponse> {
return this.http.put<MilitarResponse>(`/api/militares/${id}`, payload);
}

ativar(id: number): Observable<MilitarResponse> {
return this.http.patch<MilitarResponse>(`/api/militares/${id}/ativar`, {});
}

inativar(id: number): Observable<MilitarResponse> {
return this.http.patch<MilitarResponse>(`/api/militares/${id}/inativar`, {});
}
}
