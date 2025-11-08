import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { MainComponent } from './main/main.component';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from '../shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    NgChartsModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    FullCalendarModule,
    NgApexchartsModule,
    NgScrollbarModule,
    SharedModule,
     MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
})
export class DashboardModule {}
