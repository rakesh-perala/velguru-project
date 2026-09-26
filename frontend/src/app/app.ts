import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Appointment {
  id?: number;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  status: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  appointments: Appointment[] = [];

  appointment: Appointment = {
    patientName: '',
    doctorName: '',
    appointmentDate: '',
    status: 'BOOKED'
  };

  private apiUrl = '/api/appointments';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.http.get<Appointment[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.appointments = data;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
      }
    });
  }

  bookAppointment(): void {
    this.http.post<Appointment>(this.apiUrl, this.appointment).subscribe({
      next: () => {
        alert('Appointment booked successfully!');
        
        this.appointment = {
          patientName: '',
          doctorName: '',
          appointmentDate: '',
          status: 'BOOKED'
        };

        this.loadAppointments();
      },
      error: (error) => {
        console.error('Error booking appointment:', error);
        alert('Failed to book appointment.');
      }
    });
  }
}
