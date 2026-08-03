import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Expense, ExpenseRequest } from '../models/expense.models';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class ExpenseApiService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiBaseUrl;

  expenses(): Observable<PageResponse<Expense>> {
    return this.http.get<PageResponse<Expense>>(`${this.api}/expenses`);
  }

  create(request: ExpenseRequest): Observable<Expense> {
    return this.http.post<Expense>(`${this.api}/expenses`, request);
  }

  update(id: string, request: ExpenseRequest): Observable<Expense> {
    return this.http.put<Expense>(`${this.api}/expenses/${id}`, request);
  }

  approve(id: string): Observable<Expense> {
    return this.http.post<Expense>(`${this.api}/expenses/${id}/approve`, {});
  }

  reimburse(id: string): Observable<Expense> {
    return this.http.post<Expense>(`${this.api}/expenses/${id}/reimburse`, {});
  }

  void(id: string): Observable<Expense> {
    return this.http.post<Expense>(`${this.api}/expenses/${id}/void`, {});
  }
}
