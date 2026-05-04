import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../core/auth/auth.service';
import { ThemeToggleComponent } from '../shared/components/theme-toggle.component';
import { UndoRedoComponent } from '../shared/components/undo-redo/undo-redo.component';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
  section?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    TranslateModule,
    ButtonModule,
    ThemeToggleComponent,
    UndoRedoComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly sidebarOpen = signal(true);
  readonly isAdmin = computed(() => this.auth.role() === 'admin');
  readonly navSections = computed<{ title: string; items: NavItem[] }[]>(() => {
    const sections: { title: string; items: NavItem[] }[] = [
      {
        title: 'Matters',
        items: [
          { path: '/legal/dashboard', label: 'Dashboard', icon: 'pi pi-home', exact: true },
          { path: '/legal/cases', label: 'Cases', icon: 'pi pi-file', exact: false },
          { path: '/arbitrations', label: 'Arbitrations', icon: 'pi pi-users' },
          { path: '/execution', label: 'Execution Cases', icon: 'pi pi-list' },
          { path: '/settlements', label: 'Business Settlements', icon: 'pi pi-wallet' },
        ],
      },
    ];

    if (this.isAdmin()) {
      sections.push({
        title: 'Directory',
        items: [
          { path: '/lawyers', label: 'Lawyers', icon: 'pi pi-id-card' },
          { path: '/courts', label: 'Courts', icon: 'pi pi-building' },
        ],
      });
    }

    return sections;
  });

  protected sessionLabel(): string {
    const u = this.auth.username();
    const r = this.auth.role();
    if (!u || !r) return '';
    return `${u} (${r})`;
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
