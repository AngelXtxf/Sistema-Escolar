import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss'],
})
export class RegistroAlumnosComponent implements OnInit {
  @Input() rol: string = '';
  @Input() datos_user: any = {};

  // Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public alumno: any = {};
  public token: string = '';
  public errors: any = {};
  public editar: boolean = false;
  public idUser: Number = 0;

  // Variables para control del calendario
  public maxDate: Date = new Date();
  public minDate: Date = new Date();
  public startDate: Date = new Date();

  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private alumnosService: AlumnosService,
    private facadeService: FacadeService
  ) {}

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();

    // Configurar fecha máxima (Edad mínima 18 años)
    this.maxDate = new Date();
    this.maxDate.setFullYear(currentYear - 18);

    // Configurar fecha mínima (Edad máxima 99 años para evitar error de 3 dígitos)
    this.minDate = new Date();
    this.minDate.setFullYear(currentYear - 99);

    // Configurar fecha de inicio visual del calendario
    this.startDate = new Date(this.maxDate);

    // Validar si existe un parámetro en la URL
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log('ID User: ', this.idUser);
      this.alumno = this.datos_user;
    } else {
      // Registrar un nuevo alumno
      this.alumno = this.alumnosService.esquemaAlumno();
      this.alumno.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
    }
    console.log('Alumno: ', this.alumno);
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    // Validar formulario campos vacíos
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    // Validar formato de correo electrónico
    if (!this.validarCorreo(this.alumno.email)) {
      alert("El formato del correo electrónico es incorrecto.");
      return;
    }

    if (this.alumno.password == this.alumno.confirmar_password) {

      // Validar rango de edad (18 - 99)
      if(this.alumno.edad < 18 || this.alumno.edad > 99) {
        alert("La edad es inválida, debe ser una edad real (entre 18 y 99 años).");
        return;
      }

      // Ajustar formato de fecha para el servidor
      this.formatDateForServer();

      this.alumnosService.registrarAlumno(this.alumno).subscribe(
        (response) => {
          alert('Alumno registrado exitosamente');
          console.log('Alumno registrado: ', response);
          if (this.token && this.token !== '') {
            this.router.navigate(['alumnos']);
          } else {
            this.router.navigate(['/']);
          }
        },
        (error) => {
          alert('Error al registrar alumno');
          console.error('Error al registrar alumno: ', error);
        }
      );
    } else {
      alert('Las contraseñas no coinciden');
      this.alumno.password = '';
      this.alumno.confirmar_password = '';
    }
  }

  public actualizar() {
    // Validar formulario campos vacíos
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    // Validar formato de correo electrónico
    if (!this.validarCorreo(this.alumno.email)) {
      alert("El formato del correo electrónico es incorrecto.");
      return;
    }

    // Validar rango de edad (18 - 99)
    if(this.alumno.edad < 18 || this.alumno.edad > 99) {
      alert("La edad es inválida, debe ser una edad real (entre 18 y 99 años).");
      return;
    }

    // Ajustar formato de fecha para el servidor
    this.formatDateForServer();

    this.alumnosService.actualizarAlumno(this.alumno).subscribe(
      (response) => {
        alert('Alumno actualizado exitosamente');
        console.log('Alumno actualizado: ', response);
        this.router.navigate(['alumnos']);
      },
      (error) => {
        alert('Error al actualizar alumno');
        console.error('Error al actualizar alumno: ', error);
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

  // Detectar cambio de fecha, calcular edad y validar rango
  public changeFecha(event: any) {
    if (event.value) {
        this.alumno.fecha_nacimiento = event.value;

        const birthDate = new Date(event.value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();

        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        this.alumno.edad = age.toString();

        // Validar que la edad esté dentro del rango permitido (18 - 99)
        if (age < 18 || age > 99) {
          alert('La edad es inválida, debe ser una edad real (entre 18 y 99 años).');
          setTimeout(() => {
            this.alumno.fecha_nacimiento = null;
            this.alumno.edad = 0;
            if(event.target) event.target.value = '';
          }, 100);
        }
    }
  }

  // Formatear fecha a YYYY-MM-DD local
  private formatDateForServer() {
    if (this.alumno.fecha_nacimiento && typeof this.alumno.fecha_nacimiento !== 'string') {
      const d = new Date(this.alumno.fecha_nacimiento);
      const month = '' + (d.getMonth() + 1);
      const day = '' + d.getDate();
      const year = d.getFullYear();

      this.alumno.fecha_nacimiento = [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    }
  }

  // Validar estructura de correo electrónico
  private validarCorreo(correo: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(correo);
  }

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
      !(charCode >= 48 && charCode <= 57)
    ) {
      event.preventDefault();
    }
  }
}
