import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, Output } from '@angular/core';
import { AdvanceTableService } from '../../advance-table.service';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
} from '@angular/forms';
import { AdvanceTable } from '../../advance-table.model';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { Title } from 'chart.js';

export interface DialogData {
  id: number;
  action: string;
  advanceTable: AdvanceTable;
}

@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class FormDialogComponent {
  action: string;
  dialogTitle: string;
  advanceTableForm: UntypedFormGroup;
  advanceTable: AdvanceTable;
  

  constructor(
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public advanceTableService: AdvanceTableService,
    private fb: UntypedFormBuilder
  ) {
    // Set the defaults
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle =
        data.advanceTable.title + ' '
      this.advanceTable = data.advanceTable;
    } else {
      this.dialogTitle = 'New Expense';
      const blankObject = {} as AdvanceTable;
      this.advanceTable = new AdvanceTable(blankObject);
    }
    this.advanceTableForm = this.createContactForm();
  }
  formControl = new UntypedFormControl('', [
    Validators.required,
    // Validators.email,
  ]);
  getErrorMessage() {
    return this.formControl.hasError('required')
      ? 'Required field'
      : this.formControl.hasError('email')
      ? 'Not a valid email'
      : '';
  }
  createContactForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.advanceTable.id],
      title: [this.advanceTable.title, [Validators.required]],
      category: [this.advanceTable.category, [Validators.required]],
      date: [
        formatDate(this.advanceTable.date, 'yyyy-MM-dd', 'en'),
        [Validators.required],
      ],
      amount: [this.advanceTable.amount, [Validators.required]],
    });
  }
  submit() {
    // emppty stuff
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  public confirmAdd(): void {
   if (this.action === 'edit') {
      this.advanceTableService.updateAdvanceTable(
        this.advanceTableForm.getRawValue()
      ).subscribe({
        next: () => {
          this.advanceTableService.dialogData = this.advanceTableForm.getRawValue();
        }
      });
    } else {
      this.advanceTableService.addAdvanceTable(
        this.advanceTableForm.getRawValue()
      ).subscribe({
        next: () => {
          this.advanceTableService.dialogData = this.advanceTableForm.getRawValue();
        }
      });
    }

  }
}
