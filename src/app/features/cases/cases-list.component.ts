import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-cases-list',
  imports: [RouterLink, TranslateModule],
  template: `
    <h2 class="text-lg font-semibold mb-4">{{ 'nav.cases' | translate }}</h2>
    <ul class="list-disc pl-5">
      <li><a [routerLink]="['/cases', 1]" class="text-blue-700 underline">Case #1</a></li>
      <li><a [routerLink]="['/cases', 2]" class="text-blue-700 underline">Case #2</a></li>
    </ul>
  `,
})
export class CasesListComponent {}
