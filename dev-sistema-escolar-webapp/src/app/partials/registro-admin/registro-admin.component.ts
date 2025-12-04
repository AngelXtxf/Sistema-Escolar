import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { AdministradoresService } from 'src/app/services/administradores.service';

@Component({
  selector: 'app-registro-admin',
  templateUrl: './registro-admin.component.html',
  styleUrls: ['./registro-admin.component.scss'],
})
export class RegistroAdminComponent implements OnInit {
  @Input() rol: string = '';
  @Input() datos_user: any = {};

  public admin: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = '';
  public idUser: Number = 0;

  // Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private administradoresService: AdministradoresService,
    private facadeService: FacadeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Validar si existe un parámetro en la URL
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log('ID User: ', this.idUser);
      this.admin = this.datos_user;
    } else {
      // Registrar un nuevo administrador
      this.admin = this.administradoresService.esquemaAdmin();
      this.admin.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
    }
    console.log('Admin: ', this.admin);
  }

  // Funciones para password
  public showPassword() {
    if (this.inputType_1 == 'password') {
      this.inputType_1 = 'text';
      this.hide_1 = true;
    } else {
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  public showPwdConfirmar() {
    if (this.inputType_2 == 'password') {
      this.inputType_2 = 'text';
      this.hide_2 = true;
    } else {
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    // Validar formulario campos vacíos
    this.errors = {};
    this.errors = this.administradoresService.validarAdmin(
      this.admin,
      this.editar
    );
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    // Validar formato de correo electrónico
    if (!this.validarCorreo(this.admin.email)) {
      alert("El formato del correo electrónico es incorrecto.");
      return;
    }

    // Validar la contraseña
    if (this.admin.password == this.admin.confirmar_password) {
      this.administradoresService.registrarAdmin(this.admin).subscribe(
        (response) => {
          alert('Administrador registrado exitosamente');
          console.log('Administrador registrado: ', response);
          if (this.token && this.token !== '') {
            this.router.navigate(['administrador']);
          } else {
            this.router.navigate(['/']);
          }
        },
        (error) => {
          alert('Error al registrar administrador');
          console.error('Error al registrar administrador: ', error);
        }
      );
    } else {
      alert('Las contraseñas no coinciden');
      this.admin.password = '';
      this.admin.confirmar_password = '';
    }
  }

  public actualizar() {
    // Validar formulario campos vacíos
    this.errors = {};
    this.errors = this.administradoresService.validarAdmin(
      this.admin,
      this.editar
    );
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    // Validar formato de correo electrónico
    if (!this.validarCorreo(this.admin.email)) {
      alert("El formato del correo electrónico es incorrecto.");
      return;
    }

    this.administradoresService.actualizarAdmin(this.admin).subscribe(
      (response) => {
        alert('Administrador actualizado exitosamente');
        console.log('Administrador actualizado: ', response);
        this.router.navigate(['administrador']);
      },
      (error) => {
        alert('Error al actualizar administrador');
        console.error('Error al actualizar administrador: ', error);
      }
    );
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
