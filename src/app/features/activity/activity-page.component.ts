import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityFeedComponent } from '../../shared/components/activity-feed.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-activity-page',
  standalone: true,
  imports: [CommonModule, ActivityFeedComponent, TranslateModule],
  template: `
    <h2 class="text-lg font-semibold mb-4">{{ 'activity.title' | translate }}</h2>
    <app-activity-feed [limit]="100"></app-activity-feed>
  `,
})
export class ActivityPageComponent {}
