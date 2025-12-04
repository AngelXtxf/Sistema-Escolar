import { EventosAcademicosService } from './../../services/eventos-academicos.service';
import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MatDialog } from '@angular/material/dialog';
import { EditarEventosModalComponent } from 'src/app/modals/editar-eventos-modal/editar-eventos-modal.component';

@Component({
  selector: 'app-registro-eventos-academicos',
  templateUrl: './registro-eventos-academicos.component.html',
  styleUrls: ['./registro-eventos-academicos.component.scss'],
})
export class RegistroEventosAcademicosComponent implements OnInit {
  @Input() tipo: string = '';
  @Input() datos_evento: any = {};

  public evento: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = '';
  public idEvento: number = 0;
  public lista_responsables: any[] = [];

  public minDate: Date = new Date();

  public publico_o: any[] = [
    { value: '1', nombre: 'Estudiantes' },
    { value: '2', nombre: 'Profesores' },
    { value: '3', nombre: 'Público general' },
  ];

  public programa_educativo: any[] = [
    { value: '1', viewValue: 'Ingeniería en Ciencias de la Computación' },
    { value: '2', viewValue: 'Licenciatura en Ciencias de la Computación' },
    { value: '3', viewValue: 'Ingeniería en Tecnologías de la Información' },
  ];

  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private eventosAcademicosService: EventosAcademicosService,
    private maestrosService: MaestrosService,
    private administradoresService: AdministradoresService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerResponsables();
    this.token = this.facadeService.getSessionToken();

    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];

      this.eventosAcademicosService.obtenerEventoPorId(this.idEvento).subscribe(
        (response) => {
          this.evento = response;
          // Formateo de horas para quitar segundos si existen
          if (this.evento.hora_inicio && this.evento.hora_inicio.length > 5) {
            this.evento.hora_inicio = this.evento.hora_inicio.slice(0, 5);
          }
          if (this.evento.hora_fin && this.evento.hora_fin.length > 5) {
            this.evento.hora_fin = this.evento.hora_fin.slice(0, 5);
          }
          if (!this.evento.publico_objetivo) {
            this.evento.publico_objetivo = [];
          }
          const responsableEncontrado = this.lista_responsables.find(
            (item) => `${item.user.first_name} ${item.user.last_name}` === this.evento.responsable
          );

          if (responsableEncontrado) {
            this.evento.responsable = responsableEncontrado.user.id;
          }
        },
        (error) => { console.error('Error al cargar el evento', error); }
      );
    } else {
      this.evento = this.eventosAcademicosService.esquemaEventos();
      this.evento.tipo = this.tipo;
      // FIX IMPORTANTE: Forzamos null para que el input aparezca vacío y no con '0'
      this.evento.cupo = null;
    }
  }

  // --- VALIDACIONES DE TECLADO ---

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) &&
      !(charCode >= 97 && charCode <= 122) &&
      charCode !== 32
    ) {
      event.preventDefault();
    }
  }

  public soloAlfanumericos(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) &&
      !(charCode >= 97 && charCode <= 122) &&
      !(charCode >= 48 && charCode <= 57) &&
      charCode !== 32
    ) {
      event.preventDefault();
    }
  }

  public soloTextoPuntuacion(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) &&
      !(charCode >= 97 && charCode <= 122) &&
      !(charCode >= 48 && charCode <= 57) &&
      charCode !== 32 && charCode !== 46 && charCode !== 44
    ) {
      event.preventDefault();
    }
  }

  // MODIFICADO: Evita escribir '0' si el campo está vacío
  public soloNumeros(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    const target = event.target as HTMLInputElement;

    // 1. Permitir solo números (0-9)
    if (!(charCode >= 48 && charCode <= 57)) {
      event.preventDefault();
      return;
    }

    // 2. Si el input está vacío y presionan '0' (ASCII 48), bloquear
    // Esto evita escribir "05", "034", etc.
    if (target.value.length === 0 && charCode === 48) {
      event.preventDefault();
    }
  }

  // --- VALIDACIÓN DE HORAS ---
  public validarHoras(): boolean {
    if (!this.evento.hora_inicio || !this.evento.hora_fin) return true;

    const inicio = this.convertirHoraToDate(this.evento.hora_inicio);
    const fin = this.convertirHoraToDate(this.evento.hora_fin);

    if (fin <= inicio) {
      alert("La hora de finalización debe ser posterior a la hora de inicio.");
      return false;
    }
    return true;
  }

  private convertirHoraToDate(horaStr: string): Date {
    const date = new Date();
    date.setSeconds(0);
    date.setMilliseconds(0);

    if (horaStr.toUpperCase().includes('M')) {
      const [time, modifier] = horaStr.split(' ');
      let [hoursStr, minutesStr] = time.split(':');
      let hours = parseInt(hoursStr, 10);
      let minutes = parseInt(minutesStr, 10);

      if (hours === 12 && modifier.toUpperCase() === 'AM') hours = 0;
      else if (hours < 12 && modifier.toUpperCase() === 'PM') hours += 12;

      date.setHours(hours, minutes);
    } else {
      const [hours, minutes] = horaStr.split(':');
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    }
    return date;
  }

  // --- SOLUCIÓN AL PROBLEMA DE LA FECHA (Día anterior) ---

  // 1. Modificado: Ya no usa toISOString(). Guarda el objeto Date tal cual.
  public changeFecha(event: any) {
    if (event.value) {
        this.evento.fecha = event.value;
    }
  }

  // 2. Nuevo: Función auxiliar para formatear YYYY-MM-DD usando hora LOCAL
  private formatDateForServer() {
    if (this.evento.fecha && typeof this.evento.fecha !== 'string') {
      const d = new Date(this.evento.fecha);
      const month = '' + (d.getMonth() + 1);
      const day = '' + d.getDate();
      const year = d.getFullYear();

      this.evento.fecha = [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    }
  }

  public checkboxChange(event: any) {
    if (event.checked) {
      this.evento.publico_objetivo.push(event.source.value);
    } else {
      this.evento.publico_objetivo.forEach((publico:any, i:any) => {
        if (publico == event.source.value) {
          this.evento.publico_objetivo.splice(i, 1);
        }
      });
    }
  }

  public revisarSeleccion(nombre: string) {
    if (this.evento.publico_objetivo) {
      var busqueda = this.evento.publico_objetivo.find((element:any) => element == nombre);
      return busqueda != undefined;
    }
    return false;
  }

  public regresar() { this.location.back(); }

  public registrar() {
    this.errors = this.eventosAcademicosService.validarEvento(this.evento, this.editar);

    // 1. Validar Horas
    if (!this.validarHoras()) return;

    // 2. Validar Cupo (No vacío y mayor a 0)
    if(!this.evento.cupo || this.evento.cupo <= 0){
      alert("El cupo máximo es obligatorio y debe ser mayor a 0.");
      return;
    }

    // 3. Validar Campos Vacíos Generales
    if (Object.keys(this.errors).length > 0) {
      alert("Por favor, rellena todos los campos obligatorios marcados en rojo.");
      return;
    }

    // --- APLICAR FORMATO DE FECHA ANTES DE ENVIAR ---
    this.formatDateForServer();

    this.eventosAcademicosService.registrarEvento(this.evento).subscribe(
      (response) => {
        alert('Evento registrado exitosamente');
        this.router.navigate(['/eventos-academicos']);
      },
      (error) => { alert('Error al registrar el Evento'); }
    );
  }

  public actualizar() {
    this.errors = this.eventosAcademicosService.validarEvento(this.evento, this.editar);

    // 1. Validar Horas
    if (!this.validarHoras()) return;

    // 2. Validar Cupo
    if(!this.evento.cupo || this.evento.cupo <= 0){
      alert("El cupo máximo es obligatorio y debe ser mayor a 0.");
      return;
    }

    // 3. Validar Campos Vacíos
    if (Object.keys(this.errors).length > 0) {
      alert("Por favor, rellena todos los campos obligatorios antes de actualizar.");
      return;
    }

    const dialogRef = this.dialog.open(EditarEventosModalComponent, {
      data: { mensaje: `¿Estás seguro de actualizar el evento "${this.evento.nombre_evento}"?` },
      width: '328px', height: '288px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.confirmar) {

        // --- APLICAR FORMATO DE FECHA ANTES DE ENVIAR ---
        this.formatDateForServer();

        this.eventosAcademicosService.actualizarEvento(this.evento).subscribe(
          (response) => {
            alert('Evento actualizado exitosamente');
            this.router.navigate(['eventos-academicos']);
          },
          (error) => { alert('Error al actualizar Evento'); }
        );
      }
    });
  }

  public obtenerResponsables() {
    this.administradoresService.obtenerListaAdmins().subscribe(
      (responseAdmins) => {
        this.lista_responsables = responseAdmins;
        this.maestrosService.obtenerListaMaestros().subscribe((responseMaestros) => {
          this.lista_responsables = this.lista_responsables.concat(responseMaestros);
          this.mapResponsableNombreToId();
        });
      }
    );
  }

  private mapResponsableNombreToId(): void {
    if (!this.evento || !this.evento.responsable || !this.lista_responsables || this.lista_responsables.length === 0) return;
    if (typeof this.evento.responsable !== 'string') return;
    const nombreEvento = (this.evento.responsable as string).trim();
    const responsableEncontrado = this.lista_responsables.find((item) => {
      const nombreCompleto = `${item.user.first_name} ${item.user.last_name}`.trim();
      return nombreCompleto === nombreEvento;
    });
    if (responsableEncontrado) this.evento.responsable = responsableEncontrado.user.id;
  }
}
