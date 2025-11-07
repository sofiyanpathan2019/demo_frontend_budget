import { formatDate } from '@angular/common';
export class AdvanceTable {
  id: number;
  title: string;
  category: string;
  amount: number;
  date: string;
  constructor(advanceTable: AdvanceTable) {
    {
      this.id = advanceTable.id || this.getRandomID();
      this.title = advanceTable.title || '';
      this.amount = advanceTable.amount || 0;
      this.date = formatDate(new Date(), 'yyyy-MM-dd', 'en') || '';
      this.category = advanceTable.category || '';
    }
  }
  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}
