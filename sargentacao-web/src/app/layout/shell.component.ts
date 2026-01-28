import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
selector: 'app-shell',
standalone: true,
imports: [RouterModule],
template: `
<div class="app">
<header class="topbar">
<div class="brand">
<div class="logo">CB</div>
<div class="titles">
<div class="title">Sargenteação</div>
<div class="subtitle">Importação de boletim e Citações de militares</div>
</div>
</div>

<nav class="nav">
<a
routerLink="/boletins/upload"
routerLinkActive="active"
[routerLinkActiveOptions]="{ exact: true }"
>
Upload de Documentos
</a>

<a
routerLink="/boletins/ocorrencias"
routerLinkActive="active"
>
Ocorrências
</a>

<a
routerLink="/militares"
routerLinkActive="active"
>
Militares
</a>
</nav>
</header>

<main class="content">
<router-outlet></router-outlet>
</main>

<footer class="footer">
<span>CAT/CBMES • Sistema de Verificação de Citações de Militares</span>
</footer>
</div>
`,
styles: [`
.app { min-height: 100vh; background: #f3f4f6; color:#111827; }

.topbar {
background:#0b1f3a;
color:#fff;
padding: 14px 18px;
display:flex;
align-items:center;
justify-content:space-between;
gap: 18px;
border-bottom: 1px solid rgba(255,255,255,.08);
}

.brand { display:flex; align-items:center; gap: 12px; min-width: 260px; }
.logo {
width: 36px; height: 36px; border-radius: 10px;
display:flex; align-items:center; justify-content:center;
background: rgba(255,255,255,.10);
border: 1px solid rgba(255,255,255,.14);
font-weight: 800;
letter-spacing: .5px;
}
.titles { line-height: 1.1; }
.title { font-weight: 800; font-size: 14px; }
.subtitle { font-size: 12px; opacity: .85; margin-top: 3px; }

.nav { display:flex; gap: 10px; flex-wrap: wrap; justify-content:flex-end; }
.nav a {
color:#e5e7eb;
text-decoration:none;
padding: 8px 12px;
border-radius: 999px;
border: 1px solid rgba(255,255,255,.14);
background: rgba(255,255,255,.06);
font-size: 13px;
}
.nav a:hover { background: rgba(255,255,255,.10); }
.nav a.active {
background: #ffffff;
color:#0b1f3a;
border-color: #ffffff;
font-weight: 700;
}

.content {
max-width: 1100px;
margin: 18px auto;
padding: 0 18px 18px;
}

.footer {
max-width: 1100px;
margin: 0 auto;
padding: 10px 18px 18px;
font-size: 12px;
color:#6b7280;
}
`]
})
export class ShellComponent {}
