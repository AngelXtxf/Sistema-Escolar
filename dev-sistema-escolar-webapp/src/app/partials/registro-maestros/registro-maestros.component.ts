import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss'],
})
export class RegistroMaestrosComponent implements OnInit {
  @Input() rol: string = '';
  @Input() datos_user: any = {};

  // Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public maestro: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = '';
  public idUser: Number = 0;

  // Variables para control del calendario
  public maxDate: Date = new Date();
  public minDate: Date = new Date();
  public startDate: Date = new Date();

  // Para el select
  public areas: any[] = [
    { value: '1', viewValue: 'Desarrollo Web' },
    { value: '2', viewValue: 'Programación' },
    { value: '3', viewValue: 'Bases de datos' },
    { value: '4', viewValue: 'Redes' },
    { value: '5', viewValue: 'Matemáticas' },
  ];

  public materias: any[] = [
    { value: '1', nombre: 'Aplicaciones Web' },
    { value: '2', nombre: 'Programación 1' },
    { value: '3', nombre: 'Bases de datos' },
    { value: '4', nombre: 'Tecnologías Web' },
    { value: '5', nombre: 'Minería de datos' },
    { value: '6', nombre: 'Desarrollo móvil' },
    { value: '7', nombre: 'Estructuras de datos' },
    { value: '8', nombre: 'Administración de redes' },
    { value: '9', nombre: 'Ingeniería de Software' },
    { value: '10', nombre: 'Administración de S.O.' },
  ];

  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private maestrosService: MaestrosService
  ) {}

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();

    // Configurar fecha máxima (Edad mínima 18 años para maestros)
    this.maxDate = new Date();
    this.maxDate.setFullYear(currentYear - 18);

    // Configurar fecha mínima (Edad máxima 99 años)
    this.minDate = new Date();
    this.minDate.setFullYear(currentYear - 99);

    // Configurar fecha de inicio visual del calendario
    this.startDate = new Date(this.maxDate);

    // Validar si existe un parámetro en la URL
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log('ID User: ', this.idUser);
      this.maestro = this.datos_user;
    } else {
      // Registrar un nuevo Maestro
      this.maestro = this.maestrosService.esquemaMaestro();
      this.maestro.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
    }
    console.log('Maestro: ', this.maestro);
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    // Validar formulario campos vacíos
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(
      this.maestro,
      this.editar
    );
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    // Validar formato de correo electrónico
    if (!this.validarCorreo(this.maestro.email)) {
      alert("El formato del correo electrónico es incorrecto.");
      return;
    }

    // Validar rango de edad
    const edad = this.calcularEdad(new Date(this.maestro.fecha_nacimiento));
    if (edad < 18 || edad > 99) {
      alert("La edad es inválida, debe ser una edad real (entre 18 y 99 años).");
      return;
    }

    // Validar la contraseña
    if (this.maestro.password == this.maestro.confirmar_password) {

      // Ajustar formato de fecha para el servidor
      this.formatDateForServer();

      this.maestrosService.registrarMaestro(this.maestro).subscribe(
        (response) => {
          alert('Maestro registrado exitosamente');
          console.log('Maestro registrado: ', response);
          if (this.token && this.token !== '') {
            this.router.navigate(['maestros']);
          } else {
            this.router.navigate(['/']);
          }
        },
        (error) => {
          alert('Error al registrar maestro');
          console.error('Error al registrar maestro: ', error);
        }
      );
    } else {
      alert('Las contraseñas no coinciden');
      this.maestro.password = '';
      this.maestro.confirmar_password = '';
    }
  }

  public actualizar() {
    // Validar formulario campos vacíos
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(
      this.maestro,
      this.editar
    );
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    // Validar formato de correo electrónico
    if (!this.validarCorreo(this.maestro.email)) {
      alert("El formato del correo electrónico es incorrecto.");
      return;
    }

    // Validar rango de edad
    const edad = this.calcularEdad(new Date(this.maestro.fecha_nacimiento));
    if (edad < 18 || edad > 99) {
      alert("La edad es inválida, debe ser una edad real (entre 18 y 99 años).");
      return;
    }

    // Ajustar formato de fecha para el servidor
    this.formatDateForServer();

    this.maestrosService.actualizarMaestro(this.maestro).subscribe(
      (response) => {
        alert('Maestro actualizado exitosamente');
        console.log('Maestro actualizado: ', response);
        this.router.navigate(['maestros']);
      },
      (error) => {
        alert('Error al actualizar maestro');
        console.error('Error al actualizar maestro: ', error);
      }
    );
  }

  // Funciones para password
  showPassword() {
    if (this.inputType_1 == 'password') {
      this.inputType_1 = 'text';
      this.hide_1 = true;
    } else {
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar() {
    if (this.inputType_2 == 'password') {
      this.inputType_2 = 'text';
      this.hide_2 = true;
    } else {
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  // Función para detectar el cambio de fecha
  public changeFecha(event: any) {
    if (event.value) {
      this.maestro.fecha_nacimiento = event.value;

      // Calcular edad para validación inmediata
      const edad = this.calcularEdad(new Date(event.value));

      if (edad < 18 || edad > 99) {
        alert('La edad es inválida, debe ser una edad real (entre 18 y 99 años).');
        setTimeout(() => {
          this.maestro.fecha_nacimiento = null;
          if(event.target) event.target.value = '';
        }, 100);
      }
    }
  }

  // Función auxiliar para calcular edad
  private calcularEdad(fecha: Date): number {
    const today = new Date();
    let age = today.getFullYear() - fecha.getFullYear();
    const monthDiff = today.getMonth() - fecha.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < fecha.getDate())) {
      age--;
    }
    return age;
  }

  // Formatear fecha a YYYY-MM-DD local
  private formatDateForServer() {
    if (this.maestro.fecha_nacimiento && typeof this.maestro.fecha_nacimiento !== 'string') {
      const d = new Date(this.maestro.fecha_nacimiento);
      const month = '' + (d.getMonth() + 1);
      const day = '' + d.getDate();
      const year = d.getFullYear();

      this.maestro.fecha_nacimiento = [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    }
  }

  // Validar estructura de correo electrónico
  private validarCorreo(correo: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(correo);
  }

  // Funciones para los checkbox
  public checkboxChange(event: any) {
    if (event.checked) {
      this.maestro.materias_json.push(event.source.value);
    } else {
      this.maestro.materias_json.forEach((materia: any, i: number) => {
        if (materia == event.source.value) {
          this.maestro.materias_json.splice(i, 1);
        }
      });
    }
  }

  public revisarSeleccion(nombre: string) {
    if (this.maestro.materias_json) {
      var busqueda = this.maestro.materias_json.find(
        (element: any) => element == nombre
      );
      if (busqueda != undefined) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) && // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32 // Espacio
    ) {
      event.preventDefault();
    }
  }

  public soloAlfanumericos(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) && // Letras mayúsculas (A-Z)
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas (a-z)
      !(charCode >= 48 && charCode <= 57) // Números (0-9)
    ) {
      event.preventDefault(); // Bloquea cualquier otro caracter
    }
  }
}
