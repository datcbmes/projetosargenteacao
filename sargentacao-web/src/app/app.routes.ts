import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';
import { BoletimUploadComponent } from './features/boletins/upload/boletim-upload.component';

export const routes: Routes = [
{
path: '',
component: ShellComponent,
children: [
{ path: '', pathMatch: 'full', redirectTo: 'boletins/upload' },

{ path: 'boletins/upload', component: BoletimUploadComponent },

{
path: 'boletins/ocorrencias',
loadComponent: () =>
import('./features/boletins/ocorrencias/boletim-ocorrencias.component')
.then(m => m.BoletimOcorrenciasComponent),
}, // <-- vírgula aqui

      {
path: 'militares',
loadComponent: () =>
import('./features/militares/militar-page.component')
.then(m => m.MilitarPageComponent),
},
    ],
},
{ path: '**', redirectTo: '' },
];
