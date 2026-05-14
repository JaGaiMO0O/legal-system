import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ButtonModule, CardModule, InputTextModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 bg-[rgb(var(--surface-muted))]">
      <div class="w-full max-w-lg flex flex-col gap-6">
        <div class="text-center">
          <div
            class="inline-flex w-14 h-14 rounded-xl bg-[rgb(var(--primary-dark))] text-white items-center justify-center mb-4"
          >
            <i class="pi pi-shield text-2xl" aria-hidden="true"></i>
          </div>
          <h1 class="text-2xl font-semibold text-[rgb(var(--text))] tracking-tight">
            {{ 'login.title' | translate }}
          </h1>
          <p class="text-sm text-[rgb(var(--text-muted))] mt-1">
            {{ 'login.subtitle' | translate }}
          </p>
        </div>

        <p-card>
          <div class="flex flex-col gap-4 p-2">
            <div>
              <label
                for="login-user"
                class="block text-sm font-semibold mb-2 text-[rgb(var(--text))]"
                >{{ 'login.username' | translate }}</label
              >
              <input
                id="login-user"
                pInputText
                class="w-full"
                [(ngModel)]="username"
                autocomplete="username"
                (keydown.enter)="submit()"
              />
            </div>
            <div>
              <label
                for="login-pass"
                class="block text-sm font-semibold mb-2 text-[rgb(var(--text))]"
                >{{ 'login.password' | translate }}</label
              >
              <input
                id="login-pass"
                pInputText
                type="password"
                class="w-full"
                [(ngModel)]="password"
                autocomplete="current-password"
                (keydown.enter)="submit()"
              />
            </div>

            <p *ngIf="error()" class="text-sm text-danger m-0">{{ error() }}</p>

            <p-button
              severity="primary"
              styleClass="w-full"
              [label]="'login.submit' | translate"
              [loading]="loading()"
              (onClick)="submit()"
            ></p-button>
          </div>
        </p-card>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected username = '';
  protected password = '';
  protected readonly error = signal('');
  protected readonly loading = signal(false);

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/legal/dashboard');
      return;
    }
  }

  submit(): void {
    this.error.set('');
    this.loading.set(true);
    const ok = this.auth.login(this.username, this.password);
    this.loading.set(false);
    if (ok) {
      void this.router.navigateByUrl('/legal/dashboard');
    } else {
      this.error.set(this.translate.instant('login.errorInvalid'));
    }
  }
}
