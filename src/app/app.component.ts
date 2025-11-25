import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeToggleComponent } from './shared/components/theme-toggle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, TranslateModule, ThemeToggleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'legal-system';
}
