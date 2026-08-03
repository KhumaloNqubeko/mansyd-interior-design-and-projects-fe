import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReportingOverview } from '../../core/models/reporting.models';
import { ReportingApiService } from '../../core/services/reporting-api.service';

@Component({
  standalone: true,
  imports: [DecimalPipe, KeyValuePipe],
  template: `
    <section class="panel-page">
      <div class="page-heading">
        <p class="eyebrow">Reporting</p>
        <h1>Business overview</h1>
        <p class="muted">A live rollup of revenue, receivables, expenses, projects and stock pressure.</p>
      </div>

      @if (overview(); as report) {
        <div class="money-grid report-grid">
          <span>Accepted orders<strong>{{ report.financial.acceptedOrderValue | number:'1.2-2' }}</strong></span>
          <span>Invoiced<strong>{{ report.financial.invoicedTotal | number:'1.2-2' }}</strong></span>
          <span>Paid<strong>{{ report.financial.paidTotal | number:'1.2-2' }}</strong></span>
          <span>Receivables<strong>{{ report.financial.receivablesTotal | number:'1.2-2' }}</strong></span>
          <span>Approved expenses<strong>{{ report.financial.approvedExpenseTotal | number:'1.2-2' }}</strong></span>
          <span>Net cash position<strong>{{ report.financial.netCashPosition | number:'1.2-2' }}</strong></span>
          <span>Materials<strong>{{ report.inventory.materialCount }}</strong></span>
          <span>Low stock<strong>{{ report.inventory.lowStockCount }}</strong></span>
        </div>

        <div class="report-columns">
          <article class="work-card">
            <h2 class="section-title">Orders</h2>
            @for (entry of report.ordersByStatus | keyvalue; track entry.key) { <p class="report-row"><span>{{ entry.key }}</span><strong>{{ entry.value }}</strong></p> }
          </article>
          <article class="work-card">
            <h2 class="section-title">Projects</h2>
            @for (entry of report.projectsByStatus | keyvalue; track entry.key) { <p class="report-row"><span>{{ entry.key }}</span><strong>{{ entry.value }}</strong></p> }
          </article>
          <article class="work-card">
            <h2 class="section-title">Invoices</h2>
            @for (entry of report.invoicesByStatus | keyvalue; track entry.key) { <p class="report-row"><span>{{ entry.key }}</span><strong>{{ entry.value }}</strong></p> }
          </article>
          <article class="work-card">
            <h2 class="section-title">Payments</h2>
            @for (entry of report.paymentsByStatus | keyvalue; track entry.key) { <p class="report-row"><span>{{ entry.key }}</span><strong>{{ entry.value }}</strong></p> }
          </article>
          <article class="work-card">
            <h2 class="section-title">Expenses by category</h2>
            @for (entry of report.expensesByCategory | keyvalue; track entry.key) { <p class="report-row"><span>{{ entry.key }}</span><strong>{{ entry.value }}</strong></p> }
          </article>
          <article class="work-card">
            <h2 class="section-title">Inventory value</h2>
            <p class="report-row"><span>Stock on hand</span><strong>{{ report.inventory.stockValue | number:'1.2-2' }}</strong></p>
          </article>
        </div>

        <div class="list-stack">
          <h2 class="section-title">Low stock watchlist</h2>
          @for (material of report.lowStockMaterials; track material.id) {
            <article class="work-card request-card">
              <div>
                <strong>{{ material.code }} · {{ material.name }}</strong>
                <p>{{ material.stockQuantity | number:'1.3-3' }} on hand · reorder at {{ material.reorderLevel | number:'1.3-3' }}</p>
              </div>
              <span class="status-pill">LOW STOCK</span>
            </article>
          } @empty {
            <div class="empty-state"><strong>No low-stock materials</strong><span>The inventory cupboard is behaving itself. Suspicious, but welcome.</span></div>
          }
        </div>
      } @else {
        <div class="empty-state"><strong>Loading report</strong><span>Crunching the latest numbers...</span></div>
      }
    </section>
  `
})
export class ReportingOverviewComponent implements OnInit {
  private readonly reports = inject(ReportingApiService);
  readonly overview = signal<ReportingOverview | null>(null);

  ngOnInit(): void {
    this.reports.overview().subscribe(report => this.overview.set(report));
  }
}
