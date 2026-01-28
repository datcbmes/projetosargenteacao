import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BoletimApi } from '../../../core/api/boletim.api';

type OcorrenciaView = {
id: number;
boletimId: number;
pagina: number | null;

militarId?: number | null;
militarNumeroFuncional?: string | null;
militarNome?: string | null;

trecho?: string | null;
texto?: string | null;
};

type BoletimListItem = {
id: number;
nomeArquivo?: string | null;
dataImportacao?: string | null;
totalOcorrencias?: number | null;
};

type ModoBusca = 'NF' | 'NOME' | 'AMBOS';

@Component({
selector: 'app-boletim-ocorrencias',
standalone: true,
imports: [CommonModule, FormsModule, RouterLink],
template: `
<div class="card">
<div class="card-header">
<div>
<h1>Ocorrências extraídas do Boletim</h1>
<p>Selecione um boletim importado e, se desejar, filtre as ocorrências por NF e/ou nome do militar.</p>
</div>

<div class="actions">
<a class="link" routerLink="/boletins/upload">Voltar para Upload</a>
</div>
</div>

<div class="card-body">
<div class="toolbar">
<div class="field">
<label>Boletim</label>

<select *ngIf="!modoManual"
class="select"
[disabled]="loadingBoletins || loading"
[(ngModel)]="boletimSelecionadoId">
<option [ngValue]="null">Selecione um boletim importado…</option>
<option *ngFor="let b of boletins" [ngValue]="b.id">
#{{ b.id }}{{ b.nomeArquivo ? ' — ' + b.nomeArquivo : '' }}
{{ (b.totalOcorrencias ?? null) !== null ? ' (' + b.totalOcorrencias + ' ocorrência(s))' : '' }}
</option>
</select>

<input *ngIf="modoManual"
type="number"
min="1"
[(ngModel)]="boletimSelecionadoId"
placeholder="Ex.: 1"
(keyup.enter)="carregar()"/>

<div class="mini-actions">
<button class="btn secondary"
type="button"
[disabled]="loadingBoletins || loading"
(click)="carregarBoletins()">
Atualizar lista
</button>

<button class="link-btn"
type="button"
[disabled]="loading"
(click)="toggleModoManual()">
{{ modoManual ? 'Selecionar boletim' : 'Informar ID manualmente' }}
</button>
</div>
</div>

<div class="field field-busca">
<label>Critério de busca</label>
<select class="select select-small"
[disabled]="loading"
[(ngModel)]="modoBusca"
(ngModelChange)="onModoBuscaChange()">
<option [ngValue]="'NF'">NF</option>
<option [ngValue]="'NOME'">Nome</option>
<option [ngValue]="'AMBOS'">NF + Nome</option>
</select>

<div class="busca-row">
<div class="field-inline" *ngIf="modoBusca === 'NF' || modoBusca === 'AMBOS'">
<label class="label-inline">NF</label>
<input type="text"
class="input"
[disabled]="loading"
[(ngModel)]="filtroNF"
placeholder="Ex.: 123456"
(keyup.enter)="buscarOuFiltrar()"/>
</div>

<div class="field-inline" *ngIf="modoBusca === 'NOME' || modoBusca === 'AMBOS'">
<label class="label-inline">Nome</label>
<input type="text"
class="input input-wide"
[disabled]="loading"
[(ngModel)]="filtroNome"
placeholder="Ex.: João da Silva"
(keyup.enter)="buscarOuFiltrar()"/>
</div>
</div>

<div class="busca-actions">
<button class="btn"
type="button"
[disabled]="!boletimSelecionadoId || loading || !temFiltroValido()"
(click)="buscarOuFiltrar()">
{{ loading ? 'Carregando...' : 'Buscar' }}
</button>

<button class="btn secondary"
type="button"
[disabled]="loading"
(click)="limparFiltros()">
Limpar filtros
</button>
</div>
</div>

<button class="btn secondary"
type="button"
[disabled]="!boletimSelecionadoId || loading"
(click)="carregar()">
Carregar tudo
</button>

<button class="btn secondary"
type="button"
[disabled]="loading"
(click)="limpar()">
Limpar tela
</button>
</div>

<div *ngIf="copiadoMsg" class="toast">
{{ copiadoMsg }}
</div>

<div *ngIf="erro" class="alert error">
{{ erro }}
</div>

<div *ngIf="!erro && carregado && ocorrencias.length === 0" class="empty">
{{ emptyMessage() }}
</div>

<div *ngIf="!erro && ocorrencias.length > 0" class="table-wrap">
<div class="table-head">
<div class="pill">{{ ocorrencias.length }} ocorrência(s)</div>
<div class="hint">
Clique em uma linha para expandir o texto.
<span *ngIf="filtroAtivo()" class="hint-strong">Filtro ativo.</span>
</div>
</div>

<table class="table">
<thead>
<tr>
<th class="col-small">Página</th>
<th class="col-militar">Militar</th>
<th>Trecho / Texto</th>
<th class="col-actions">Ações</th>
</tr>
</thead>

<tbody>
<tr *ngFor="let o of ocorrencias"
(click)="toggle(o.id)"
[class.open]="abertaId === o.id">
<td class="col-small">{{ o.pagina ?? '-' }}</td>

<td class="col-militar">
<div class="militar">
<div class="nome">{{ o.militarNome || '-' }}</div>
<div class="sub">{{ o.militarNumeroFuncional || '' }}</div>
</div>
</td>

<td>
<div class="excerpt">
<span class="preview" *ngIf="abertaId !== o.id">
{{ (o.trecho || o.texto || '') | slice:0:180 }}
<span *ngIf="(o.trecho || o.texto || '').length > 180">...</span>
</span>

<div *ngIf="abertaId === o.id" class="full">
{{ o.trecho || o.texto || '' }}
</div>
</div>
</td>

<td (click)="$event.stopPropagation()">
<div class="row-actions">
<button class="btn small" type="button" (click)="copiarTrecho(o)">
Copiar
</button>
<button class="btn small primary" type="button" (click)="marcarParaSargenteacao(o)">
Enviar p/ Sargentação
</button>
</div>
</td>
</tr>
</tbody>

</table>
</div>
</div>
</div>
`,
styles: [`
.card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden; }
.card-header { padding:18px; border-bottom:1px solid #e5e7eb; display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
.card-header h1 { margin:0; font-size:20px; font-weight:700; color:#0f172a; }
.card-header p { margin:6px 0 0; color:#64748b; font-size:13px; }
.actions { display:flex; gap:8px; }
.link { display:inline-flex; align-items:center; gap:8px; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px; color:#0f172a; text-decoration:none; font-size:13px; background:#fff; }
.link:hover { background:#f8fafc; }

.card-body { padding:18px; }

.toolbar { display:flex; align-items:flex-end; gap:12px; flex-wrap:wrap; }
.field { display:flex; flex-direction:column; gap:6px; }
label { font-size:12px; color:#475569; }

input[type="number"] { width:240px; border:1px solid #e5e7eb; border-radius:10px; padding:10px 12px; font-size:14px; outline:none; }
input[type="number"]:focus { border-color:#94a3b8; box-shadow:0 0 0 3px rgba(148,163,184,.25); }

.input { width:220px; border:1px solid #e5e7eb; border-radius:10px; padding:10px 12px; font-size:14px; outline:none; }
.input-wide { width:320px; }
.input:focus { border-color:#94a3b8; box-shadow:0 0 0 3px rgba(148,163,184,.25); }

.btn { border:1px solid #0f172a; background:#0f172a; color:#fff; border-radius:12px; padding:10px 14px; font-size:13px; cursor:pointer; }
.btn:hover { opacity:.92; }
.btn:disabled { opacity:.5; cursor:not-allowed; }
.btn.secondary { border-color:#e5e7eb; background:#fff; color:#0f172a; }
.btn.small { padding:8px 10px; border-radius:10px; }
.btn.small.primary { background:#0f172a; color:#fff; border-color:#0f172a; }

.select { width:280px; border:1px solid #e5e7eb; border-radius:10px; padding:10px 12px; background:#fff; font-size:14px; outline:none; }
.select:focus { border-color:#94a3b8; box-shadow:0 0 0 3px rgba(148,163,184,.25); }
.select-small { width:180px; }

.mini-actions { margin-top:8px; display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.link-btn { border:none; background:transparent; padding:0; color:#0f172a; text-decoration:underline; cursor:pointer; font-size:13px; }
.link-btn:hover { opacity:.85; }

.field-busca { min-width:520px; }
.busca-row { display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap; }
.field-inline { display:flex; flex-direction:column; gap:6px; }
.label-inline { font-size:12px; color:#64748b; }
.busca-actions { margin-top:6px; display:flex; gap:10px; align-items:center; flex-wrap:wrap; }

.toast { margin-top:12px; padding:10px 12px; border-radius:12px; font-size:13px; background:#ecfeff; border:1px solid #a5f3fc; color:#155e75; }

.alert { margin-top:14px; border-radius:12px; padding:12px 14px; font-size:13px; }
.alert.error { background:#fef2f2; border:1px solid #fecaca; color:#991b1b; }

.empty { margin-top:14px; border:1px dashed #e5e7eb; border-radius:12px; padding:16px; color:#64748b; font-size:13px; background:#fafafa; }

.table-wrap { margin-top:14px; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden; }
.table-head { display:flex; justify-content:space-between; align-items:center; padding:12px 14px; border-bottom:1px solid #e5e7eb; background:#fff; gap:12px; }
.pill { display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; background:#eff6ff; color:#1d4ed8; font-size:12px; border:1px solid #bfdbfe; }
.hint { font-size:12px; color:#64748b; }
.hint-strong { margin-left:8px; color:#0f172a; font-weight:700; }

.table { width:100%; border-collapse:collapse; background:#fff; }
th, td { padding:12px 14px; border-bottom:1px solid #e5e7eb; vertical-align:top; font-size:13px; color:#0f172a; }
th { background:#f8fafc; font-weight:700; font-size:12px; color:#475569; }
tr:hover td { background:#fcfcfd; }
tr.open td { background:#f8fafc; }

.col-small { width:90px; }
.col-militar { width:260px; }
.col-actions { width:220px; }

.militar .nome { font-weight:700; }
.militar .sub { margin-top:2px; font-size:12px; color:#64748b; }

.excerpt .full { white-space:pre-wrap; }
.row-actions { display:flex; gap:8px; justify-content:flex-end; }
`]
})
export class BoletimOcorrenciasComponent implements OnInit {
boletins: BoletimListItem[] = [];
loadingBoletins = false;
modoManual = false;
boletimSelecionadoId: number | null = null;

modoBusca: ModoBusca = 'NF';
filtroNF = '';
filtroNome = '';

loading = false;
carregado = false;
erro: string | null = null;

ocorrencias: OcorrenciaView[] = [];
private todasOcorrencias: OcorrenciaView[] = [];

abertaId: number | null = null;

copiadoMsg: string | null = null;
private toastTimer: any = null;

constructor(private api: BoletimApi, private route: ActivatedRoute) {}

ngOnInit(): void {
const qp = this.route.snapshot.queryParamMap.get('boletimId');
if (qp) {
const n = Number(qp);
if (!Number.isNaN(n) && n > 0) this.boletimSelecionadoId = n;
}
this.carregarBoletins();
}

toggleModoManual(): void {
this.modoManual = !this.modoManual;
}

onModoBuscaChange(): void {
// não dispara busca automática
  }

carregarBoletins(): void {
const listarBoletins = (this.api as any)?.listarBoletins?.bind(this.api);
if (!listarBoletins) {
this.boletins = [];
return;
}

this.loadingBoletins = true;
listarBoletins().subscribe({
next: (lista: BoletimListItem[]) => {
this.boletins = (lista ?? []).slice().sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
},
error: () => {
this.boletins = [];
},
complete: () => {
this.loadingBoletins = false;
}
});
}

carregar(): void {
const id = this.boletimSelecionadoId;
if (!id) return;

this.loading = true;
this.erro = null;
this.carregado = false;
this.ocorrencias = [];
this.todasOcorrencias = [];
this.abertaId = null;

this.api.listarOcorrencias(id).subscribe({
next: (rows: any[]) => {
this.todasOcorrencias = (rows || []).map(r => this.mapear(r));
this.ocorrencias = [...this.todasOcorrencias];
this.loading = false;
this.carregado = true;
},
error: (err) => {
this.loading = false;
this.carregado = true;
this.ocorrencias = [];
this.todasOcorrencias = [];
this.erro = err?.error?.message ?? 'Falha ao carregar ocorrências.';
}
});
}

buscarOuFiltrar(): void {
const id = this.boletimSelecionadoId;
if (!id) return;

// Se não tem filtro válido, volta a mostrar tudo
    if (!this.temFiltroValido()) {
this.carregar();
return;
}

// ✅ REGRA UX: ao iniciar nova busca, limpa imediatamente o resultado anterior
    this.loading = true;
this.erro = null;
this.carregado = true; // mantém a área da tabela/empty ativa durante a busca
    this.abertaId = null;
this.ocorrencias = []; // <-- evita “resultado antigo” aparecer
    // (não mexe em todasOcorrencias; ela é o cache do "Carregar tudo")

    this.api.buscarOcorrencias(id, {
modo: this.modoBusca,
nf: this.filtroNF,
nome: this.filtroNome
}).subscribe({
next: (rows: any[]) => {
const mapped = (rows || []).map(r => this.mapear(r));
this.ocorrencias = mapped;
this.loading = false;
},
error: (err) => {
this.loading = false;
this.ocorrencias = []; // <-- mantém vazio no erro (não reaproveita resultado anterior)
        this.erro = err?.error?.message ?? 'Falha ao buscar ocorrências.';
}
});
}

limparFiltros(): void {
this.filtroNF = '';
this.filtroNome = '';
if (this.boletimSelecionadoId) this.carregar();
}

limpar(): void {
this.boletimSelecionadoId = null;
this.loading = false;
this.carregado = false;
this.erro = null;
this.ocorrencias = [];
this.todasOcorrencias = [];
this.abertaId = null;
this.filtroNF = '';
this.filtroNome = '';
this.copiadoMsg = null;
if (this.toastTimer) clearTimeout(this.toastTimer);
}

toggle(id: number): void {
this.abertaId = (this.abertaId === id) ? null : id;
}

async copiarTrecho(o: OcorrenciaView): Promise<void> {
const txt = (o.trecho || o.texto || '').trim();
if (!txt) {
this.toast('Nada para copiar.');
return;
}

try {
if (navigator.clipboard?.writeText) {
await navigator.clipboard.writeText(txt);
this.toast('Copiado para a área de transferência!');
return;
}

this.copyFallback(txt);
this.toast('Copiado para a área de transferência!');
} catch {
try {
this.copyFallback(txt);
this.toast('Copiado para a área de transferência!');
} catch {
this.toast('Não foi possível copiar automaticamente.');
}
}
}

marcarParaSargenteacao(o: OcorrenciaView): void {
this.copiarTrecho(o);
}

private toast(msg: string): void {
this.copiadoMsg = msg;
if (this.toastTimer) clearTimeout(this.toastTimer);
this.toastTimer = setTimeout(() => (this.copiadoMsg = null), 2200);
}

private copyFallback(text: string): void {
const ta = document.createElement('textarea');
ta.value = text;
ta.style.position = 'fixed';
ta.style.left = '-9999px';
ta.style.top = '-9999px';
document.body.appendChild(ta);
ta.focus();
ta.select();
document.execCommand('copy');
document.body.removeChild(ta);
}

private mapear(r: any): OcorrenciaView {
return {
id: Number(r.id),
boletimId: Number(r.boletimId ?? r.idBoletim ?? 0),
pagina: r.numeroPagina ?? r.pagina ?? null,

militarId: r.militarId ?? r.militar?.id ?? null,
militarNumeroFuncional: r.numeroFuncional ?? r.militarNumeroFuncional ?? r.militar?.numeroFuncional ?? null,
militarNome: r.nomeMilitar ?? r.militarNome ?? r.militar?.nome ?? null,

trecho: r.trecho ?? r.trechoTexto ?? null,
texto: r.texto ?? r.textoOcorrencia ?? null,
};
}

temFiltroValido(): boolean {
const nfOk = (this.filtroNF || '').trim().length > 0;
const nomeOk = (this.filtroNome || '').trim().length > 0;

if (this.modoBusca === 'NF') return nfOk;
if (this.modoBusca === 'NOME') return nomeOk;
return nfOk || nomeOk;
}

filtroAtivo(): boolean {
return ((this.filtroNF || '').trim().length > 0) || ((this.filtroNome || '').trim().length > 0);
}

emptyMessage(): string {
if (this.filtroAtivo()) return 'Nenhuma ocorrência encontrada com os filtros informados.';
return 'Nenhuma ocorrência encontrada para o boletim informado.';
}
}
