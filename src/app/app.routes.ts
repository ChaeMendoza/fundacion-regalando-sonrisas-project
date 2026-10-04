import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        title: 'Inicio | Fundación Regalando Sonrisas',
      },
      {
        path: 'beneficiaries',
        loadComponent: () =>
          import('./features/beneficiaries/beneficiaries.component').then(
            (m) => m.BeneficiariesComponent
          ),
        title: 'Beneficiarios | Fundación Regalando Sonrisas',
      },
      {
        path: 'donations',
        loadComponent: () =>
          import('./features/donations/donations.component').then((m) => m.DonationsComponent),
        title: 'Donaciones | Fundación Regalando Sonrisas',
      },
      {
        path: 'volunteers',
        loadComponent: () =>
          import('./features/volunteers/volunteers.component').then((m) => m.VolunteersComponent),
        title: 'Voluntarios | Fundación Regalando Sonrisas',
      },
      {
        path: 'activities',
        loadComponent: () =>
          import('./features/activities/activities.component').then((m) => m.ActivitiesComponent),
        title: 'Actividades | Fundación Regalando Sonrisas',
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/documents/documents.component').then((m) => m.DocumentsComponent),
        title: 'Gestión Documental | Fundación Regalando Sonrisas',
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then((m) => m.ReportsComponent),
        title: 'Reportes e Indicadores | Fundación Regalando Sonrisas',
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./features/admin/admin.component').then((m) => m.AdminComponent),
        title: 'Administración y Seguridad | Fundación Regalando Sonrisas',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
