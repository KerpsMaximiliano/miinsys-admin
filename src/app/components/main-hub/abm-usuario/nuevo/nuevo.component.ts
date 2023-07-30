import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { empty, Subscription } from 'rxjs';
import { Empresa, Estado, Planta, Rol } from 'src/app/models/abm';
import { FilesService } from 'src/app/services/files.service';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { ButtonsEventService } from '../../buttons-event.service';
import { AbmUsuarioService } from '../abm-usuario.service';

@Component({
  selector: 'app-usuario-nuevo',
  templateUrl: './nuevo.component.html',
  styleUrls: ['./nuevo.component.scss']
})
export class AbmUsuarioNuevoComponent implements OnInit, OnDestroy {

  titulo: string = "Añadir nuevo usuario";
  boton: string = "Guardar usuario";
  seccion: string = "Usuarios";

  usuarioForm: FormGroup = new FormGroup({
    firstName: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
    lastName: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
    rut: new FormControl(null, [Validators.required, Validators.max(999999999)]),
    email: new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.email]),
    contraseña: new FormControl(null, [Validators.required]),//Ver validaciones
    estado: new FormControl(null, [Validators.required]),
    rol: new FormControl(null, Validators.required),
    empresa: new FormControl(null)
  });
  imgSrc: any = "";
  estados = [] as Array<Estado>;
  roles = [] as Array<Rol>;
  empresas = [] as Array<Empresa>;
  grillaEmpresas = [] as Array<Empresa>;
  selectedFile: any = null;

  suscripcion: Subscription;

  rolUsuario: number = 0;
  empresaUsuario = {} as any;

  plantas = [] as Array<Array<Planta>>;
  plantasSeleccionadas: any = [];

  constructor(
    private stylesService: StylesService,
    private buttonsEventService: ButtonsEventService,
    private router: Router,
    private snackbar: MatSnackBar,
    private loginService: LoginService,
    private usuarioService: AbmUsuarioService,
    private empresaService: AbmEmpresaService,
    private fileService: FilesService
  ) {
    this.suscripcion = this.buttonsEventService.events.subscribe(
      (data: any) => {
        this.save()
      }
    )
  }

  ngOnInit(): void {
    this.rolUsuario = Number(this.loginService.getRol());
    this.empresaUsuario = JSON.parse(this.loginService.getEmpresa()!);
    this.estados = JSON.parse(localStorage.getItem('estados')!);
    if(this.rolUsuario > 1) {
      this.empresaService.getEmpresas({id: this.empresaUsuario.id, id_estado: 1}).subscribe(d => {
        this.empresas = d;
      });
    } else {
      this.empresaService.getEmpresas({id_estado: 1}).subscribe(d => {
        this.empresas = d;
      });
    };
    this.usuarioService.getRoles().subscribe(d => {
      this.roles = d;
      d.forEach(rol => {
        if(this.rolUsuario != 1) {
          if(rol.id_rol < 3) {
            this.roles = this.roles.filter(item => item !== rol);
          }
        }
      });
      // if(this.rolUsuario == 2) {
      //   this.roles.splice(0, 1);
      // };
    });
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  save() {
    if(this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    };
    if(this.usuarioForm.get('rol')?.value != 1 && this.usuarioForm.get('rol')?.value != null && (this.grillaEmpresas.find(e => e.id_estado == 1) == undefined || this.grillaEmpresas.length == 0)) {
      this.openSnackBar("El rol seleccionado debe tener una empresa con vínculo activo", 'X', 'warn-snackbar');
      return;
    };
    let plantaError = false;
    this.grillaEmpresas.forEach(emp => {
      if(this.plantas[emp.id!].length > 0 && this.plantasSeleccionadas[emp.id!] == undefined) {
        plantaError = true;
      }
    });
    if(plantaError) {
      this.openSnackBar("El usuario debe tener una planta asociada por empresa, si es que la empresa tiene plantas vinculadas", 'X', 'warn-snackbar');
      return;
    };
    let model = {
      email: this.usuarioForm.get('email')?.value,
      password: this.usuarioForm.get('contraseña')?.value,
      firstName: this.usuarioForm.get('firstName')?.value,
      lastName: this.usuarioForm.get('lastName')?.value,
      rut: this.usuarioForm.get('rut')?.value,
      id_estado: this.usuarioForm.get('estado')?.value,
      rut_user_add: Number(this.loginService.getUser()),
      anu_fecha_alta: null, 
      usuarioEmpresa: [] as any,
      usuarioPlanta: [] as any,
      usuarioRol:[{
        id_rol: this.usuarioForm.get('rol')?.value,
        usu_id: "string"
      }]
    };
    if(this.usuarioForm.get('rol')?.value != 1) {
      this.grillaEmpresas.forEach(emp => {
        model.usuarioEmpresa.push({
          usu_id: "",
          emp_id: emp.id,
          est_id: emp.id_estado,
        });
        if(this.plantasSeleccionadas[emp.id!]) {
          if(this.plantasSeleccionadas[emp.id!].length > 0) {
            this.plantasSeleccionadas[emp.id!].forEach((pl: number) => {
              let find = this.plantas[emp.id!].find(planta => planta.id_planta == pl);
              model.usuarioPlanta.push({
                id_usuario_planta: 0,
                emp_id: emp.id,
                id_planta: find!.id_planta,
                id_usuario: "",
                descripcion_planta: find!.descripcion,
                id_estado: find!.id_estado
              })
            })
          }
        }
      });
    }
    
    if(this.selectedFile != null) {
      this.fileService.subirArchivo(this.selectedFile, 2).subscribe(res => {
        Object.assign(model, {id_imagen: res.id});
        this.usuarioService.createUser(model).subscribe(e => {
          this.openSnackBar("Usuario creado correctamente", 'X', 'success-snackbar');
          this.router.navigate(['dashboard/usuario']);
        },
        err => {
          this.openSnackBar(err.error.message, 'X', 'error-snackbar');
        });
      })
    } else {
      this.usuarioService.createUser(model).subscribe(e => {
        this.openSnackBar("Usuario creado correctamente", 'X', 'success-snackbar');
        this.router.navigate(['dashboard/usuario']);
      },
      err => {
        this.openSnackBar(err.error.message, 'X', 'error-snackbar');
      });
    }
  }

  uploadFoto() {
    //2 - Usuarios
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = _ => {
      let files = Array.from(input.files!);
      console.log(files); //File Array
      this.selectedFile = files[0];
      console.log(input.files); //FileList
      const reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = _event => {
          let url = reader.result;
          this.imgSrc = url;
        }
    };
    input.click();
  }

  addEmpresa() {
    if(this.usuarioForm.get('empresa')?.value == null) {
      return;
    };
    if(this.grillaEmpresas.find(emp => emp.id == this.usuarioForm.get('empresa')?.value) != undefined) {
      this.openSnackBar("La empresa elegida ya existe en la grilla", 'X', 'warn-snackbar');
      return;
    };
    if((this.usuarioForm.get('rol')?.value == 2 || this.usuarioForm.get('rol')?.value == 3) && this.grillaEmpresas.find(e => e.id_estado == 1) != undefined) {
      this.openSnackBar("Los roles Administrador Empresa y Administrador Empresa Full solo pueden tener una empresa asociada", 'X', 'warn-snackbar');
      return;
    };
    
    let model = this.empresas.find(emp => emp.id == this.usuarioForm.get('empresa')?.value);
    
    if(model != undefined) {
      console.log(model)
      this.empresaService.getPlantas(model.id!).subscribe(d => {
        console.log(d);
        this.plantas[model!.id!] = d.filter((pl: { id_estado: number; }) => pl.id_estado == 1);
        console.log(this.plantas);
        this.grillaEmpresas.push(model!);
        this.grillaEmpresas = [...this.grillaEmpresas];
        setTimeout(() => {
          document.getElementById('table')?.scrollIntoView();
        }, 10);
      });
      
    };
  }

  empresaChange(i: number, event: any) {
    if((this.usuarioForm.get('rol')?.value == 2 || this.usuarioForm.get('rol')?.value == 3) && event.value == 1) {
      let grilla2 = this.grillaEmpresas;
      this.grillaEmpresas = [];
      grilla2.forEach(e => e.id_estado = 3);
      grilla2[i].id_estado = event.value;
      this.grillaEmpresas = grilla2;
    } else {
      this.grillaEmpresas[i].id_estado = event.value;
      this.grillaEmpresas = [...this.grillaEmpresas];
    }
  }

  rolChange() {
    this.grillaEmpresas = [];
    this.grillaEmpresas = [...this.grillaEmpresas];
    this.plantas = [];
    this.plantasSeleccionadas = [];
  }

  filtrar() {
    if(this.rolUsuario > 1) {
      this.empresas = this.empresas.filter(e => e.id == this.empresaUsuario.id);
    }
  }

  generatePassword() {
    let password2 = [];
    password2[0] = Array(2).fill("0123456789").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    password2[1] = Array(2).fill("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    password2[2] = Array(2).fill("abcdefghijklmnopqrstuvwxyz").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    password2[3] = Array(2).fill("~!@-#$").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    for (let i = password2.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp: string = password2[i];
      password2[i] = password2[j];
      password2[j] = temp;
    }
    this.usuarioForm.get('contraseña')?.setValue(password2[0] + password2[1] + password2[2] + password2[3]);
    this.usuarioForm.updateValueAndValidity();
  }

  plantaChange(element: any, event: any) {
    this.plantasSeleccionadas[element.id] = event.value;
  }

  openSnackBar(message: string, action: string, className: string) {
    this.snackbar.open(message, action, {horizontalPosition: 'right', verticalPosition: 'top', panelClass: className});
  }

  get colours() {
    return this.stylesService.getStyle()
  }

}
