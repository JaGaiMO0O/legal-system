import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { ThemeToggleComponent } from './shared/components/theme-toggle.component';
import { UndoRedoComponent } from './shared/components/undo-redo/undo-redo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
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
})
export class AppComponent {
  title = 'legal-system';
  sidebarOpen = true;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
