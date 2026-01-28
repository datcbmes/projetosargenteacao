import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BoletimApi } from '../../../core/api/boletim.api';
import { BoletimUploadResponse } from '../../../core/models/boletim.models';

@Component({
selector: 'app-boletim-upload',
standalone: true,
imports: [CommonModule, RouterLink],
template: `
<div class="card">
<div class="card-header">
<div>
<h1>Upload de Boletim (PDF)</h1>
<p>Envie o boletim para registrar páginas e permitir extração de ocorrências.</p>
</div>
</div>

<div class="card-body">
<div class="row">
<input type="file" accept="application/pdf" (change)="onFile($event)" />
<button class="btn" [disabled]="!file || loading" (click)="enviar()">
{{ loading ? 'Enviando...' : 'Enviar' }}
</button>
</div>

<div *ngIf="erro" class="alert error">
{{ erro }}
</div>

<div *ngIf="resp" class="result">
<div class="badge" [class.dup]="resp.jaExistia">
{{ resp.jaExistia ? 'Já existia (hash duplicado)' : 'Importado com sucesso' }}
</div>

<div class="grid">
<div class="item">
<div class="label">Boletim ID</div>
<div class="value">{{ resp.boletimId }}</div>
</div>
<div class="item">
<div class="label">Arquivo</div>
<div class="value">{{ resp.nomeArquivo }}</div>
</div>
<div class="item">
<div class="label">Páginas</div>
<div class="value">{{ resp.totalPaginas }}</div>
</div>
<div class="item full">
<div class="label">Hash SHA-256</div>
<div class="value mono">{{ resp.hashSha256 }}</div>
</div>
</div>

<div class="divider"></div>

<div class="row2">
<button class="btn2" type="button" (click)="irParaOcorrencias()">
Ver ocorrências deste boletim
</button>

<a class="link" routerLink="/boletins/ocorrencias">Ir para Ocorrências</a>
</div>
</div>
</div>
</div>
`,
styles: [`
.card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden; }
.card-header { padding:18px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:space-between; }
h1 { margin:0; font-size:18px; }
p { margin:6px 0 0 0; font-size:13px; color:#6b7280; }
.card-body { padding:18px; }
.row { display:flex; gap:10px; align-items:center; }
input[type="file"] { flex:1; padding:10px; border:1px dashed #cbd5e1; border-radius:12px; }
.btn { background:#0b1f3a; color:#fff; border:none; padding:10px 14px; border-radius:12px; cursor:pointer; }
.btn:disabled { opacity:.6; cursor:not-allowed; }
.alert { margin-top:14px; padding:10px 12px; border-radius:12px; font-size:13px; }
.error { background:#fee2e2; color:#991b1b; border:1px solid #fecaca; }
.result { margin-top:16px; padding:14px; border:1px solid #e5e7eb; border-radius:12px; background:#f9fafb; }
.badge { display:inline-block; padding:6px 10px; border-radius:999px; font-size:12px; background:#dcfce7; color:#166534; border:1px solid #bbf7d0; }
.badge.dup { background:#ffedd5; color:#9a3412; border:1px solid #fed7aa; }
.grid { margin-top:12px; display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; }
.item { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:10px; }
.item.full { grid-column:1 / -1; }
.label { font-size:12px; color:#6b7280; }
.value { margin-top:4px; font-size:14px; font-weight:600; color:#111827; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size:12px; word-break:break-all; }

.divider { height:1px; background:#e5e7eb; margin:14px 0; }
.row2 { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.btn2 { background:#111827; color:#fff; border:none; padding:10px 14px; border-radius:12px; cursor:pointer; }
.btn2:disabled { opacity:.6; cursor:not-allowed; }
.link { display:inline-flex; align-items:center; gap:8px; padding:10px 12px; border:1px solid #e5e7eb; border-radius:12px; color:#0f172a; text-decoration:none; font-size:13px; background:#fff; }
.link:hover { background:#f8fafc; }
`],
})
export class BoletimUploadComponent {
file: File | null = null;
loading = false;
erro: string | null = null;
resp: BoletimUploadResponse | null = null;

constructor(private api: BoletimApi, private router: Router) {}

onFile(ev: Event) {
const input = ev.target as HTMLInputElement;
this.file = input.files?.length ? input.files[0] : null;
this.erro = null;
this.resp = null;
}

enviar() {
if (!this.file) return;

this.loading = true;
this.erro = null;
this.resp = null;

this.api.uploadBoletim(this.file).subscribe({
next: (r) => {
this.resp = r;
this.loading = false;
},
error: (err) => {
this.loading = false;
this.erro = err?.error?.message ?? err?.message ?? 'Falha no upload. Verifique logs do backend.';
},
});
}

irParaOcorrencias() {
if (!this.resp?.boletimId) return;
this.router.navigate(['/boletins/ocorrencias'], { queryParams: { boletimId: this.resp.boletimId } });
}
}
