import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { ThemeToggleComponent } from './shared/components/theme-toggle.component';
import { UndoRedoComponent } from './shared/components/undo-redo/undo-redo.component';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
  section?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    TranslateModule,
    ToastModule,
    ThemeToggleComponent,
    ConfirmDialogComponent,
    UndoRedoComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'legal-system';
  readonly sidebarOpen = signal(true);

  readonly navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'Matters',
      items: [
        { path: '/legal/dashboard', label: 'Dashboard', icon: 'pi pi-home', exact: true },
        { path: '/legal/cases', label: 'Cases', icon: 'pi pi-file', exact: false },
        { path: '/claims', label: 'Claims', icon: 'pi pi-inbox' },
        { path: '/arbitrations', label: 'Arbitrations', icon: 'pi pi-users' },
        { path: '/execution', label: 'Execution Cases', icon: 'pi pi-list' },
        { path: '/settlements', label: 'Business Settlements', icon: 'pi pi-wallet' },
      ],
    },
    {
      title: 'Directory',
      items: [
        { path: '/lawyers', label: 'Lawyers', icon: 'pi pi-id-card' },
        { path: '/courts', label: 'Courts', icon: 'pi pi-building' },
      ],
    },
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }
}
