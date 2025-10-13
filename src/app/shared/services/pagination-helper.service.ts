import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaginationHelperService {
  generatePageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    if (currentPage <= 3) {
      return [...Array.from({ length: 5 }, (_, i) => i), 'ellipsis', totalPages - 1];
    }

    if (currentPage >= totalPages - 4) {
      return [0, 'ellipsis', ...Array.from({ length: 5 }, (_, i) => totalPages - 5 + i)];
    }

    return [
      0,
      'ellipsis',
      ...Array.from({ length: 3 }, (_, i) => currentPage - 1 + i),
      'ellipsis',
      totalPages - 1,
    ];
  }
}
