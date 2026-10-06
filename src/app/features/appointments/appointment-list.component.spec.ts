import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AppointmentListComponent } from './appointment-list.component';
import { AppointmentApiService } from '../../core/services/appointment-api.service';
import { CustomerApiService } from '../../core/services/customer-api.service';
import { ServiceRequestApiService } from '../../core/services/service-request-api.service';
import { ProjectApiService } from '../../core/services/project-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { Appointment } from '../../core/models/appointment.models';
import { Project } from '../../core/models/project.models';
import { ServiceRequest } from '../../core/models/service-request.models';

describe('Appointment customer selection', () => {
  let component: AppointmentListComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      { provide: ActivatedRoute, useValue: { snapshot: { data: {} } } },
      ...[AppointmentApiService, CustomerApiService, ServiceRequestApiService, ProjectApiService, NotificationService]
        .map(provide => ({ provide, useValue: {} }))
    ] });
    component = TestBed.createComponent(AppointmentListComponent).componentInstance;
    component.serviceRequests.set([
      { id: 'request-a', customerId: 'a' } as ServiceRequest,
      { id: 'request-b', customerId: 'b' } as ServiceRequest
    ]);
    component.projects.set([
      { id: 'project-a', customerId: 'a' } as Project,
      { id: 'project-b', customerId: 'b' } as Project
    ]);
  });

  it('shows no related records until a customer is chosen and clears links on customer changes', () => {
    expect(component.customerRequests()).toEqual([]);
    expect(component.customerProjects()).toEqual([]);
    component.appointmentForm.controls.customerId.setValue('a');
    expect(component.customerRequests().map(item => item.id)).toEqual(['request-a']);
    expect(component.customerProjects().map(item => item.id)).toEqual(['project-a']);
    component.appointmentForm.patchValue({ serviceRequestId: 'request-a', projectId: 'project-a' });
    component.appointmentForm.controls.customerId.setValue('b');
    expect(component.appointmentForm.controls.serviceRequestId.value).toBe('');
    expect(component.appointmentForm.controls.projectId.value).toBe('');
    expect(component.customerRequests().map(item => item.id)).toEqual(['request-b']);
    expect(component.customerProjects().map(item => item.id)).toEqual(['project-b']);
  });

  it('preserves existing links when opening an appointment for editing', () => {
    component.edit({ id: 'visit', customerId: 'a', serviceRequestId: 'request-a', projectId: 'project-a',
      title: 'Visit', type: 'SITE_VISIT', scheduledStart: '2026-10-07T10:00:00', scheduledEnd: '2026-10-07T11:00:00',
      location: 'Site', notes: '' } as Appointment);
    expect(component.appointmentForm.controls.serviceRequestId.value).toBe('request-a');
    expect(component.appointmentForm.controls.projectId.value).toBe('project-a');
    expect(component.customerProjects().map(item => item.id)).toEqual(['project-a']);
  });
});
