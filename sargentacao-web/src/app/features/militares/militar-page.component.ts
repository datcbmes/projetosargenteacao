import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilitarApi } from '../../core/api/militar.api';
import { MilitarCreateRequest, MilitarResponse, MilitarUpdateRequest } from '../../core/models/militar.models';

type AtivoFiltro = 'TODOS' | 'ATIVOS' | 'INATIVOS';

@Component({
selector: 'app-militar-page',
standalone: true,
imports: [CommonModule, FormsModule],
template: `
<div class="card">
<div class="card-header">
<div>
<h1>Militares</h1>
<p>Cadastre militares para permitir a extração de ocorrências por Número Funcional (NF).</p>
</div>
<div class="header-actions">
<button class="btn" (click)="novo()">+ Novo</button>
</div>
</div>

<div class="card-body">
<div class="filters">
<input
class="input"
type="text"
[(ngModel)]="q"
(keyup.enter)="carregar()"
placeholder="Buscar por nome ou NF..."
/>

<select class="select" [(ngModel)]="ativoFiltro" (change)="carregar()">
<option value="TODOS">Todos</option>
<option value="ATIVOS">Somente ativos</option>
<option value="INATIVOS">Somente inativos</option>
</select>

<button class="btn2" [disabled]="loading" (click)="carregar()">
{{ loading ? 'Carregando...' : 'Buscar' }}
</button>
</div>

<div *ngIf="erro" class="alert error">{{ erro }}</div>
<div *ngIf="ok" class="alert ok">{{ ok }}</div>

<div class="grid">
<!-- Tabela -->
<div class="panel">
<div class="panel-title">Lista</div>

<div class="table-wrap" *ngIf="lista.length; else vazio">
<table class="table">
<thead>
<tr>
<th style="width:70px;">ID</th>
<th style="width:160px;">NF</th>
<th>Nome</th>
<th style="width:110px;" class="center">Ativo</th>
<th style="width:220px;">Ações</th>
</tr>
</thead>
<tbody>
<tr *ngFor="let m of lista">
<td>{{ m.id }}</td>
<td class="mono">{{ m.numeroFuncional }}</td>
<td>{{ m.nome }}</td>
<td class="center">
<span class="pill" [class.off]="!m.ativo">{{ m.ativo ? 'SIM' : 'NÃO' }}</span>
</td>
<td>
<div class="actions">
<button class="link" (click)="editar(m)">Editar</button>
<button class="link warn" *ngIf="m.ativo" (click)="inativar(m)">Inativar</button>
<button class="link ok" *ngIf="!m.ativo" (click)="ativar(m)">Ativar</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>

<ng-template #vazio>
<div class="hint">Nenhum militar encontrado com os filtros atuais.</div>
</ng-template>
</div>

<!-- Form -->
<div class="panel">
<div class="panel-title">{{ modoEdicao ? 'Editar militar' : 'Cadastro' }}</div>

<div class="form">
<label class="lbl">Número Funcional (NF)</label>
<input
class="input"
type="text"
[(ngModel)]="form.numeroFuncional"
(input)="sanitizarNF()"
placeholder="Ex.: 123456"
/>
<div class="help">Somente números (sem hífen). Deve ser único.</div>

<label class="lbl">Nome</label>
<input
class="input"
type="text"
[(ngModel)]="form.nome"
(blur)="normalizarNome()"
placeholder="Ex.: FULANO DE TAL"
/>

<label class="chk">
<input type="checkbox" [(ngModel)]="form.ativo" />
Ativo
</label>

<div class="form-actions">
<button class="btn" [disabled]="salvando" (click)="salvar()">
{{ salvando ? 'Salvando...' : (modoEdicao ? 'SALVAR' : 'CADASTRAR') }}
</button>

<button class="btn3" [disabled]="salvando" (click)="cancelar()">
Cancelar
</button>
</div>

<div class="hint2" *ngIf="modoEdicao">
Dica: não existe exclusão — para “remover” do uso, utilize <b>Inativar</b>.
</div>
</div>
</div>
</div>

</div>
</div>
`,
styles: [`
.card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden; }
.card-header { padding:16px 18px; display:flex; align-items:flex-start; justify-content:space-between; border-bottom:1px solid #e5e7eb; }
.card-header h1 { margin:0; font-size:18px; }
.card-header p { margin:4px 0 0 0; color:#6b7280; font-size:12px; }

.card-body { padding:16px 18px; }
.filters { display:flex; gap:10px; align-items:center; margin-bottom:12px; }
.input { width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px; font-size:13px; outline:none; }
.select { padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px; font-size:13px; background:#fff; }

.grid { display:grid; grid-template-columns: 1.2fr 0.8fr; gap:14px; }
.panel { border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; }
.panel-title { padding:10px 12px; font-weight:700; font-size:13px; border-bottom:1px solid #e5e7eb; background:#fafafa; }
.table-wrap { padding:10px 12px; }
.table { width:100%; border-collapse:collapse; font-size:13px; }
.table th, .table td { padding:10px 8px; border-bottom:1px solid #f1f5f9; vertical-align:top; }
.center { text-align:center; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace; }

.actions { display:flex; gap:10px; align-items:center; }
.link { background:transparent; border:none; padding:0; cursor:pointer; color:#2563eb; font-size:13px; }
.link.warn { color:#ea580c; }
.link.ok { color:#16a34a; }

.pill { display:inline-block; padding:4px 10px; border-radius:999px; background:#dcfce7; color:#166534; font-weight:700; font-size:12px; }
.pill.off { background:#fee2e2; color:#991b1b; }

.form { padding:12px; }
.lbl { display:block; font-size:12px; color:#374151; font-weight:700; margin:10px 0 6px; }
.help { font-size:11px; color:#6b7280; margin-top:6px; }
.chk { display:flex; gap:8px; align-items:center; margin-top:12px; font-size:13px; color:#111827; }

.form-actions { display:flex; gap:10px; margin-top:12px; }
.btn { background:#0f172a; color:#fff; border:none; border-radius:12px; padding:10px 14px; font-weight:800; cursor:pointer; }
.btn2 { background:#111827; color:#fff; border:none; border-radius:12px; padding:10px 14px; font-weight:800; cursor:pointer; }
.btn3 { background:#fff; color:#111827; border:1px solid #e5e7eb; border-radius:12px; padding:10px 14px; font-weight:800; cursor:pointer; }
.btn:disabled, .btn2:disabled, .btn3:disabled { opacity:0.7; cursor:not-allowed; }

.alert { padding:10px 12px; border-radius:12px; margin-bottom:12px; font-size:13px; }
.alert.error { background:#fee2e2; color:#991b1b; border:1px solid #fecaca; }
.alert.ok { background:#dcfce7; color:#166534; border:1px solid #bbf7d0; }

.hint { padding:14px 12px; color:#6b7280; font-size:13px; }
.hint2 { margin-top:10px; font-size:11px; color:#6b7280; }
`]
})
export class MilitarPageComponent {
q: string = '';
ativoFiltro: AtivoFiltro = 'ATIVOS';

lista: MilitarResponse[] = [];
loading = false;
salvando = false;

erro: string | null = null;
ok: string | null = null;

modoEdicao = false;
editId: number | null = null;

form: { numeroFuncional: string; nome: string; ativo: boolean } = {
numeroFuncional: '',
nome: '',
ativo: true,
};

constructor(private api: MilitarApi) {
this.carregar();
}

carregar() {
this.loading = true;
this.erro = null;
this.ok = null;

const ativo =
this.ativoFiltro === 'TODOS' ? null :
this.ativoFiltro === 'ATIVOS' ? true : false;

this.api.listar({ ativo, q: this.q?.trim() || null }).subscribe({
next: (r) => {
this.lista = r ?? [];
this.loading = false;
},
error: (err) => {
this.loading = false;
this.erro = err?.error?.message ?? 'Falha ao listar militares.';
},
});
}

novo() {
this.modoEdicao = false;
this.editId = null;
this.form = { numeroFuncional: '', nome: '', ativo: true };
this.erro = null;
this.ok = null;
}

editar(m: MilitarResponse) {
this.modoEdicao = true;
this.editId = m.id;
this.form = {
numeroFuncional: m.numeroFuncional ?? '',
nome: m.nome ?? '',
ativo: !!m.ativo,
};
this.erro = null;
this.ok = null;
}

cancelar() {
this.novo();
}

sanitizarNF() {
// mantém só dígitos
this.form.numeroFuncional = (this.form.numeroFuncional || '').replace(/\D+/g, '');
}

normalizarNome() {
const n = (this.form.nome || '').trim();
this.form.nome = n.toUpperCase();
}

salvar() {
this.erro = null;
this.ok = null;

const numeroFuncional = (this.form.numeroFuncional || '').trim();
const nome = (this.form.nome || '').trim();

if (!numeroFuncional) {
this.erro = 'Informe o Número Funcional (NF).';
return;
}
if (!nome) {
this.erro = 'Informe o nome.';
return;
}

this.salvando = true;

if (!this.modoEdicao) {
const payload: MilitarCreateRequest = {
numeroFuncional,
nome,
ativo: this.form.ativo,
};

this.api.criar(payload).subscribe({
next: () => {
this.salvando = false;
this.ok = 'Militar cadastrado com sucesso.';
this.novo();
this.carregar();
},
error: (err) => {
this.salvando = false;
this.erro = err?.error?.message ?? 'Falha ao cadastrar militar (verifique NF duplicado).';
},
});

return;
}

const payload: MilitarUpdateRequest = {
numeroFuncional,
nome,
ativo: this.form.ativo,
};

this.api.atualizar(this.editId!, payload).subscribe({
next: () => {
this.salvando = false;
this.ok = 'Militar atualizado com sucesso.';
this.novo();     // <- sai do modo edição e limpa o formulário
  this.carregar(); // <- recarrega a lista já atualizada
},
error: (err) => {
this.salvando = false;
this.erro = err?.error?.message ?? 'Falha ao atualizar militar.';
},
});
}

ativar(m: MilitarResponse) {
this.erro = null;
this.ok = null;

this.api.ativar(m.id).subscribe({
next: () => {
this.ok = 'Militar ativado.';
this.carregar();
},
error: (err) => {
this.erro = err?.error?.message ?? 'Falha ao ativar militar.';
},
});
}

inativar(m: MilitarResponse) {
this.erro = null;
this.ok = null;

this.api.inativar(m.id).subscribe({
next: () => {
this.ok = 'Militar inativado.';
this.carregar();
},
error: (err) => {
this.erro = err?.error?.message ?? 'Falha ao inativar militar.';
},
});
}
}
