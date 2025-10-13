import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateFormatterService {
  formatToApiDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${ year }-${ month }-${ day }`;
  }

  formatDateRangeParams(params: {
    createdAfter?: Date;
    createdBefore?: Date;
    updatedAfter?: Date;
    updatedBefore?: Date;
  }): {
    createdAtAfter?: string;
    createdAtBefore?: string;
    updatedAtAfter?: string;
    updatedAtBefore?: string;
  } {
    const result: {
      createdAtAfter?: string;
      createdAtBefore?: string;
      updatedAtAfter?: string;
      updatedAtBefore?: string;
    } = {};

    if (params.createdAfter) {
      result.createdAtAfter = this.formatToApiDate(params.createdAfter);
    }

    if (params.createdBefore) {
      result.createdAtBefore = this.formatToApiDate(params.createdBefore);
    }

    if (params.updatedAfter) {
      result.updatedAtAfter = this.formatToApiDate(params.updatedAfter);
    }

    if (params.updatedBefore) {
      result.updatedAtBefore = this.formatToApiDate(params.updatedBefore);
    }

    return result;
  }
}
