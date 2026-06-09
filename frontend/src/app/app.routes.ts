import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/repos/repos.component').then((m) => m.ReposComponent),
  },
  {
    path: 'setup',
    loadComponent: () =>
      import('./features/setup/setup.component').then((m) => m.SetupComponent),
  },
  {
    path: 'how-it-works',
    loadComponent: () =>
      import('./features/how-it-works/how-it-works.component').then((m) => m.HowItWorksComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
