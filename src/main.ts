import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface RegistrationResponse {
  id: number;
  nombre: string;
  apellido: string;
  numeroDocumento: string;
  paymentStatus: string;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  badge?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="page">
      <header class="hero">
        <p class="eyebrow">Eventos Exclusivos</p>
        <h1>Festival de Música Clásica</h1>
        <p>Adquiera sus entradas y simule el flujo completo de pagos en tiempo real.</p>
      </header>

      <!-- Step Indicator -->
      <div class="stepper" *ngIf="currentStep < 5">
        <div class="step" [class.active]="currentStep === 1" [class.completed]="currentStep > 1">1</div>
        <div class="step" [class.active]="currentStep === 2" [class.completed]="currentStep > 2">2</div>
        <div class="step" [class.active]="currentStep === 3" [class.completed]="currentStep > 3">3</div>
        <div class="step" [class.active]="currentStep === 4" [class.completed]="currentStep > 4">4</div>
      </div>

      <!-- Main Interaction Card -->
      <section class="card fade-in">
        
        <!-- STEP 1: TICKET SELECTION -->
        <div *ngIf="currentStep === 1">
          <h2 style="font-family: var(--font-serif); color: var(--color-primary); margin-top: 0; margin-bottom: 24px; text-align: center;">Seleccione su Ticket</h2>
          <div class="ticket-grid">
            <div 
              *ngFor="let tier of ticketTiers" 
              class="ticket-card" 
              [class.selected]="selectedTicket?.id === tier.id"
              (click)="selectTicket(tier)"
            >
              <div class="ticket-badge" *ngIf="tier.badge">{{tier.badge}}</div>
              <div class="ticket-name">{{tier.name}}</div>
              <div class="ticket-price">\${{tier.price}}<span>/u</span></div>
              <ul class="ticket-features">
                <li *ngFor="let feat of tier.features">✓ {{feat}}</li>
              </ul>
            </div>
          </div>
          <div class="actions">
            <div></div> <!-- Spacer -->
            <button class="btn-primary" [disabled]="!selectedTicket" (click)="goToStep(2)">
              Continuar
            </button>
          </div>
        </div>

        <!-- STEP 2: REGISTRATION DETAILS -->
        <div *ngIf="currentStep === 2">
          <h2 style="font-family: var(--font-serif); color: var(--color-primary); margin-top: 0; margin-bottom: 24px; text-align: center;">Información del Asistente</h2>
          
          <form [formGroup]="registrationForm">
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input id="nombre" formControlName="nombre" placeholder="Ej. Ana">
            </div>
            <div class="form-group">
              <label for="apellido">Apellido</label>
              <input id="apellido" formControlName="apellido" placeholder="Ej. García">
            </div>
            <div class="form-group">
              <label for="numeroDocumento">Número de Documento / DNI</label>
              <input id="numeroDocumento" formControlName="numeroDocumento" placeholder="Ej. 12345678">
            </div>
          </form>

          <div class="actions">
            <button class="btn-secondary" (click)="goToStep(1)">Atrás</button>
            <button class="btn-primary" [disabled]="registrationForm.invalid" (click)="goToStep(3)">
              Continuar al Pago
            </button>
          </div>
        </div>

        <!-- STEP 3: CREDIT CARD SIMULATION -->
        <div *ngIf="currentStep === 3">
          <h2 style="font-family: var(--font-serif); color: var(--color-primary); margin-top: 0; margin-bottom: 24px; text-align: center;">Simulador de Pago</h2>
          
          <!-- Interactive Credit Card View -->
          <div class="credit-card">
            <div class="cc-header">
              <div class="cc-chip"></div>
              <div class="cc-logo">VISA SIM</div>
            </div>
            <div class="cc-number">
              {{ formatCardNumber(paymentForm.value.cardNumber || '') || '•••• •••• •••• ••••' }}
            </div>
            <div class="cc-footer">
              <div>
                <div class="cc-info-label">Tarjetahabiente</div>
                <div class="cc-info-value">
                  {{ (registrationForm.value.nombre + ' ' + registrationForm.value.apellido).trim() || 'TITULAR TICKET' }}
                </div>
              </div>
              <div>
                <div class="cc-info-label">Vence</div>
                <div class="cc-info-value">{{ paymentForm.value.expiry || 'MM/AA' }}</div>
              </div>
            </div>
          </div>

          <form [formGroup]="paymentForm">
            <div class="form-group">
              <label for="cardNumber">Número de Tarjeta (Simulada)</label>
              <input 
                id="cardNumber" 
                formControlName="cardNumber" 
                placeholder="4000 1234 5678 9010"
                maxlength="19"
                (input)="onCardNumberInput($event)"
              >
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="expiry">Fecha de Vencimiento</label>
                <input 
                  id="expiry" 
                  formControlName="expiry" 
                  placeholder="MM/AA" 
                  maxlength="5"
                  (input)="onExpiryInput($event)"
                >
              </div>
              <div class="form-group">
                <label for="cvv">CVV</label>
                <input id="cvv" formControlName="cvv" placeholder="123" maxlength="3">
              </div>
            </div>
          </form>

          <div class="actions">
            <button class="btn-secondary" (click)="goToStep(2)">Atrás</button>
            <button class="btn-primary" [disabled]="paymentForm.invalid" (click)="processPayment()">
              Pagar \${{selectedTicket?.price}}
            </button>
          </div>
        </div>

        <!-- STEP 4: SIMULATION PROGRESSION -->
        <div *ngIf="currentStep === 4" class="loading-simulation">
          <div class="spinner"></div>
          <h2 style="font-family: var(--font-serif); color: var(--color-primary); margin-bottom: 24px;">Procesando Pago Simuladamente</h2>
          
          <div class="loading-steps">
            <div class="loading-step" [class.active]="simulationSubstep === 1" [class.done]="simulationSubstep > 1">
              <span class="bullet"></span>
              <span>Registrando asistente en base de datos...</span>
            </div>
            <div class="loading-step" [class.active]="simulationSubstep === 2" [class.done]="simulationSubstep > 2">
              <span class="bullet"></span>
              <span>Invocando payment-microservice...</span>
            </div>
            <div class="loading-step" [class.active]="simulationSubstep === 3" [class.done]="simulationSubstep > 3">
              <span class="bullet"></span>
              <span>Procesando cargo a tarjeta simulada...</span>
            </div>
            <div class="loading-step" [class.active]="simulationSubstep === 4">
              <span class="bullet"></span>
              <span>Generando ticket de entrada...</span>
            </div>
          </div>
        </div>

        <!-- STEP 5: E-TICKET RECEIPT -->
        <div *ngIf="currentStep === 5" class="ticket-receipt-container">
          <div class="eticket fade-in">
            <div class="eticket-header">
              <h2>TICKET DE ENTRADA</h2>
              <div style="font-size: 0.8rem; margin-top: 4px; color: var(--color-accent-light); letter-spacing: 0.1em; text-transform: uppercase;">
                {{selectedTicket?.name}}
              </div>
            </div>
            
            <div class="eticket-body">
              <div class="eticket-row">
                <div>
                  <div class="eticket-label">Asistente</div>
                  <div class="eticket-val">{{response?.nombre}} {{response?.apellido}}</div>
                </div>
                <div>
                  <div class="eticket-label">Identificación</div>
                  <div class="eticket-val">{{response?.numeroDocumento}}</div>
                </div>
              </div>

              <div class="eticket-row">
                <div>
                  <div class="eticket-label">Ticket ID</div>
                  <div class="eticket-val">#000{{response?.id}}</div>
                </div>
                <div>
                  <div class="eticket-label">Precio</div>
                  <div class="eticket-val">\${{selectedTicket?.price}} USD</div>
                </div>
              </div>

              <div class="eticket-row">
                <div>
                  <div class="eticket-label">Estado de Pago</div>
                  <div class="eticket-val">
                    <span class="status-badge success">{{response?.paymentStatus}}</span>
                  </div>
                </div>
                <div>
                  <div class="eticket-label">Servicio Emisor</div>
                  <div class="eticket-val">payment-microservice</div>
                </div>
              </div>

              <div class="eticket-divider"></div>

              <div class="eticket-barcode-box">
                <div class="barcode"></div>
                <div class="barcode-text">SIM-TKT-{{response?.id}}-{{selectedTicket?.id?.toUpperCase()}}</div>
              </div>
            </div>
          </div>

          <p class="success" style="text-align: center; font-weight: 600; margin-top: 20px; margin-bottom: 20px;">
            ¡Compra completada con éxito! Su entrada ha sido confirmada y liquidada.
          </p>

          <div class="actions" style="width: 100%; max-width: 450px;">
            <button class="btn-primary" (click)="resetFlow()">Comprar Otro Ticket</button>
          </div>
        </div>

        <p class="error" *ngIf="error" style="text-align: center; margin-top: 20px;">{{error}}</p>
      </section>

      <!-- Registered Attendees list -->
      <section class="attendees-section">
        <h2>Asistentes Registrados</h2>
        <div class="table-responsive">
          <table *ngIf="registrations.length > 0; else emptyState">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Nombre Completo</th>
                <th>Número Documento</th>
                <th>Estado de Pago</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let reg of registrations" class="fade-in">
                <td>#000{{reg.id}}</td>
                <td>{{reg.nombre}} {{reg.apellido}}</td>
                <td>{{reg.numeroDocumento}}</td>
                <td>
                  <span 
                    class="status-badge" 
                    [class.success]="reg.paymentStatus === 'SUCCESS'"
                    [style.background-color]="reg.paymentStatus !== 'SUCCESS' ? 'var(--color-error-bg)' : null"
                    [style.color]="reg.paymentStatus !== 'SUCCESS' ? 'var(--color-error)' : null"
                  >
                    {{reg.paymentStatus}}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <ng-template #emptyState>
            <div class="empty-state">
              No hay asistentes registrados actualmente. ¡Sea el primero en comprar una entrada!
            </div>
          </ng-template>
        </div>
      </section>
    </main>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  currentStep = 1;
  simulationSubstep = 1;
  loading = false;
  response?: RegistrationResponse;
  error = '';
  registrations: RegistrationResponse[] = [];

  ticketTiers: TicketType[] = [
    {
      id: 'general',
      name: 'General Pass',
      price: 25,
      description: 'Acceso estándar al evento.',
      features: ['Asiento en zona general', 'Programa digital del evento', 'Acceso a barra de bebidas']
    },
    {
      id: 'vip',
      name: 'VIP Pass',
      price: 75,
      description: 'Acceso privilegiado al concierto.',
      features: ['Asiento preferencial en filas 5-15', 'Programa de mano exclusivo impreso', 'Copa de champagne de bienvenida', 'Estacionamiento reservado'],
      badge: 'Popular'
    },
    {
      id: 'golden',
      name: 'Golden Circle',
      price: 150,
      description: 'La máxima experiencia de música clásica.',
      features: ['Asiento en primera fila / Golden Box', 'Acceso a zona VIP Lounge pre-show', 'Cena premium y barra libre', 'Meet & Greet con el director de orquesta'],
      badge: 'Premium'
    }
  ];

  selectedTicket: TicketType | null = null;

  registrationForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    numeroDocumento: ['', Validators.required]
  });

  paymentForm = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9 ]{15,19}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/[0-9]{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3}$/)]]
  });

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations(): void {
    this.http.get<RegistrationResponse[]>('http://localhost:8080/api/registrations').subscribe({
      next: (data) => {
        // Sort registrations to show newest first
        this.registrations = data.sort((a, b) => b.id - a.id);
      },
      error: () => {
        console.error('No se pudieron obtener las registraciones previas.');
      }
    });
  }

  selectTicket(ticket: TicketType): void {
    this.selectedTicket = ticket;
  }

  goToStep(step: number): void {
    this.currentStep = step;
    this.error = '';
  }

  onCardNumberInput(event: any): void {
    let input = event.target.value.replace(/\D/g, ''); // Keep digits only
    let formatted = '';
    for (let i = 0; i < input.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += input[i];
    }
    this.paymentForm.get('cardNumber')?.setValue(formatted, { emitEvent: false });
  }

  onExpiryInput(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    let formatted = input;
    if (input.length > 2) {
      formatted = input.slice(0, 2) + '/' + input.slice(2, 4);
    }
    this.paymentForm.get('expiry')?.setValue(formatted, { emitEvent: false });
  }

  formatCardNumber(val: string): string {
    return val;
  }

  processPayment(): void {
    if (this.registrationForm.invalid || this.paymentForm.invalid) return;

    this.currentStep = 4; // Loader simulation step
    this.simulationSubstep = 1;
    this.error = '';

    // Step 1: Simulated Registration processing delay
    setTimeout(() => {
      this.simulationSubstep = 2;

      // Step 2: Invocando backend API which automatically invokes the payment-microservice
      setTimeout(() => {
        this.simulationSubstep = 3;

        this.http.post<RegistrationResponse>('http://localhost:8080/api/registrations', this.registrationForm.getRawValue()).subscribe({
          next: (res) => {
            // Step 3: Backend succeeded and simulated the payment
            setTimeout(() => {
              this.simulationSubstep = 4;

              setTimeout(() => {
                this.response = res;
                this.currentStep = 5; // Receipt Ticket step
                this.loadRegistrations(); // Refresh registrations list
              }, 1000);

            }, 1200);
          },
          error: (err) => {
            this.currentStep = 3; // Go back to payment step
            this.error = 'Ocurrió un error al procesar el registro y pago. Por favor intente de nuevo.';
          }
        });
      }, 1200);
    }, 1000);
  }

  resetFlow(): void {
    this.currentStep = 1;
    this.simulationSubstep = 1;
    this.selectedTicket = null;
    this.registrationForm.reset();
    this.paymentForm.reset();
    this.response = undefined;
    this.error = '';
  }
}

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()]
}).catch(console.error);
