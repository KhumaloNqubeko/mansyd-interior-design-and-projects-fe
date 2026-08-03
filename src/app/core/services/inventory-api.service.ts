import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Material, MaterialRequest, StockChangeRequest, StockTransaction, Supplier, SupplierRequest } from '../models/inventory.models';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiBaseUrl;

  suppliers(): Observable<PageResponse<Supplier>> {
    return this.http.get<PageResponse<Supplier>>(`${this.api}/suppliers`);
  }

  createSupplier(request: SupplierRequest): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.api}/suppliers`, request);
  }

  materials(): Observable<PageResponse<Material>> {
    return this.http.get<PageResponse<Material>>(`${this.api}/materials`);
  }

  createMaterial(request: MaterialRequest): Observable<Material> {
    return this.http.post<Material>(`${this.api}/materials`, request);
  }

  changeStock(request: StockChangeRequest): Observable<StockTransaction> {
    return this.http.post<StockTransaction>(`${this.api}/stock-transactions`, request);
  }

  transactions(): Observable<PageResponse<StockTransaction>> {
    return this.http.get<PageResponse<StockTransaction>>(`${this.api}/stock-transactions`);
  }
}
