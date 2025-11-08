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
import { environment } from '../../../environments/environment.prod';

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
  apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) {
  }

  ngOnInit() {
    this.loadExpenses();
    this.loadRates();
  }

  loadExpenses() {
    const url = `${this.apiUrl}expenses/`;
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
    const url = `${this.apiUrl}rates/`;
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
      colors: ['#81C784', '#64B5F6', '#FFD54F', '#FF8A65', '#BA68C8', '#4DD0E1'],
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

    const url = `${this.apiUrl}sync-rates/`;
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
