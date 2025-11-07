import { Component, ViewChild, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexTitleSubtitle,
} from 'ng-apexcharts';
import { co } from '@fullcalendar/core/internal-common';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  colors: string[];
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public barChartOptions: Partial<ChartOptions> = {
    series: [],
    chart: { type: 'bar', height: 350 },
    xaxis: { categories: [] },
    colors: ['#4CAF50'],
    plotOptions: { bar: { borderRadius: 6, columnWidth: '55%', distributed: true } },
    dataLabels: { enabled: true },
    title: { text: 'Expenses by Category', align: 'left' },
  };

  isSyncing = false;
  syncSuccess = false;
  syncError = false;

  expenses: any[] = [];
  totalExpenses = 0;
  monthlyExpenses = 0;
  currentMonth = new Date();

  selectedCurrency = 'INR';
  rate= 1;
  rates:any;

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    this.loadExpenses();
    this.loadRates();
  }

  loadExpenses() {
    const url = 'http://localhost:8000/api/expenses/';
    this.httpClient.get<any[]>(url).subscribe({
      next: (data) => {
        this.expenses = data;
        this.prepareChartData();
      },
      error: (err) => {
        console.error('Error loading expenses:', err);
      },
    });
  }

  loadRates() {
    const url = 'http://localhost:8000/api/rates/';
    this.httpClient.get<any>(url).subscribe({
      next: (res) => {
        this.rates = res
        const match = res.find((item :any)=> item.symbol === this.selectedCurrency);
        if (match) {
          this.rate = match.rate
        } else {
          this.rate = 1
        }
      },
      error: (err) => {
        console.error('Error loading rates:', err);
      },
    });
  }

  prepareChartData() {
    if (!this.expenses.length) return;

    const categoryMap: { [key: string]: number } = {};
    let total = 0;
    let monthlyTotal = 0;
    const currentMonth = new Date().getMonth();

    this.expenses.forEach((e) => {
      const amount = parseFloat(e.amount);
      total += amount;
      const date = new Date(e.date);
      if (date.getMonth() === currentMonth) {
        monthlyTotal += amount;
      }
      categoryMap[e.category] = (categoryMap[e.category] || 0) + amount;
    });
    var conversionRate = 1
   
    if (this.rates){
      var match = this.rates.find((item :any)=> item.symbol === this.selectedCurrency);
      conversionRate  = match ? match.rate : 1
    }
   
    this.rate = conversionRate 
    const convertedMap = Object.fromEntries(
      Object.entries(categoryMap).map(([cat, val]) => [cat, val * conversionRate])
    );

    this.totalExpenses = total * conversionRate;
    this.monthlyExpenses = monthlyTotal * conversionRate;

    const categories = Object.keys(convertedMap);
    const values = Object.values(convertedMap);

    this.barChartOptions = {
      series: [{ name: `Expenses (${this.selectedCurrency})`, data: values }],
      chart: { type: 'bar', height: 350 },
      xaxis: { categories },
      colors: ['#4CAF50'],
      plotOptions: { bar: { borderRadius: 6, columnWidth: '55%', distributed: true } },
      dataLabels: { enabled: true },
      title: { text: `Expenses by Category (${this.selectedCurrency})`, align: 'left' },
    };
  }

  onCurrencyChange(currency: string) {
    this.selectedCurrency = currency;
    this.prepareChartData();
  }

  syncRates() {
    this.isSyncing = true;
    this.syncSuccess = false;
    this.syncError = false;

    const url = 'http://localhost:8000/api/sync-rates/';
    this.httpClient.post(url, {}).subscribe({
      next: (response) => {
        console.log('Rates synced:', response);
        this.isSyncing = false;
        this.syncSuccess = true;
        setTimeout(() => (this.syncSuccess = false), 4000);
        this.loadRates(); 
      },
      error: (err) => {
        console.error('Error syncing rates:', err);
        this.isSyncing = false;
        this.syncError = true;
        setTimeout(() => (this.syncError = false), 4000);
      },
    });
  }
}
