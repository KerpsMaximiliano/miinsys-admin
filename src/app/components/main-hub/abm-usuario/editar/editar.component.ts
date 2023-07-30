import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Empresa, Estado, Planta, Rol } from 'src/app/models/abm';
import { FilesService } from 'src/app/services/files.service';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { ButtonsEventService } from '../../buttons-event.service';
import { AbmUsuarioService } from '../abm-usuario.service';
import { saveAs } from 'file-saver';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-usuario-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss']
})
export class AbmUsuarioEditarComponent implements OnInit, OnDestroy {

  titulo: string = "Editar usuario";
  boton: string = "Guardar cambios";
  seccion: string = "Usuarios";

  usuarioBackup = {} as any;

  usuarioForm: FormGroup = new FormGroup({
    firstName: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
    lastName: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
    rut: new FormControl(null, [Validators.required, Validators.max(999999999)]),
    email: new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.email]),
    estado: new FormControl(null, [Validators.required]),
    rol: new FormControl(null, Validators.required),
    empresa: new FormControl(null)
  });

  suscripcion: Subscription;
  estados = [] as Array<Estado>;
  roles = [] as Array<Rol>;
  imgSrc: any = "";
  file: any = null;
  empresas = [] as Array<Empresa>;
  grillaEmpresas = [] as Array<Empresa>;
  imgId: number = 0;
  
  rolUsuario: number = 0;
  empresaUsuario = {} as any;

  plantas = [] as Array<Array<Planta>>;
  plantasSeleccionadas: any = [] as Array<any>;

  showTable: boolean = false;

  constructor(
    private stylesService: StylesService,
    private buttonsEventService: ButtonsEventService,
    private router: Router,
    public abmUsuarioService: AbmUsuarioService,
    private snackbar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private loginService: LoginService,
    private fileService: FilesService,
    private empresaService: AbmEmpresaService,
    private sanitizer: DomSanitizer,
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
    if(this.rolUsuario > 1) {
      this.empresaService.getEmpresas({id: this.empresaUsuario.id, id_estado: 1}).subscribe(d => {
        this.empresas = d;
      });
    } else {
      this.empresaService.getEmpresas({id_estado: 1}).subscribe(d => {
        this.empresas = d;
      });
    };
    this.estados = JSON.parse(localStorage.getItem('estados')!);
    console.log(this.estados)
    this.abmUsuarioService.getRoles().subscribe(d => {
      this.roles = d;
      d.forEach(rol => {
        if(this.rolUsuario != 1) {
          if(rol.id_rol < 3) {
            this.roles = this.roles.filter(item => item !== rol);
          }
        }
      });
      console.log(this.roles)
    });
    if(this.abmUsuarioService.getMode() == "View") {
      this.usuarioForm.disable();
    };
    this.abmUsuarioService.getUserByRut(this.activatedRoute.snapshot.params['usuarioId']).subscribe(d => {
      console.log(d);
      this.usuarioBackup = d;
      this.usuarioForm.setValue({
        firstName: d.firstName || null,
        lastName: d.lastName || null,
        rut: d.rut || null,
        email: d.email || null,
        estado: d.id_estado || null,
        rol: d.usuarioRol.length > 0 ? d.usuarioRol[0].id_rol : null ,
        empresa: null
      });
      if(d.usuarioEmpresa.length > 0) {
        d.usuarioEmpresa.forEach((emp: { descripcion_empresa: any; emp_id: number; est_id: any; }) => {
          this.grillaEmpresas.push({
            descripcion: emp.descripcion_empresa,
            id: emp.emp_id,
            id_estado: emp.est_id
          });
          this.empresaService.getPlantas(emp.emp_id).subscribe(res => {
            console.log(res)
            this.plantas[emp.emp_id] = res.filter((pl: { id_estado: number; }) => pl.id_estado == 1);
            if(d.usuarioPlanta.length > 0) {
              d.usuarioPlanta.forEach((planta: { id_estado: number; id_planta: any; }) => {
                if(planta.id_estado == 3) {
                  let findPlanta = res.find((x: { id_planta: any; }) => x.id_planta == planta.id_planta);
                  this.plantas[emp.emp_id].push(findPlanta);
                }
              })
            }
            if(d.usuarioEmpresa[d.usuarioEmpresa.length - 1] == emp) {
              setTimeout(() => {
                this.showTable = true;
              }, 10);
            }
          })
        });
      };
      if (d.usuarioPlanta.length > 0) {
        d.usuarioPlanta.forEach((pl: { id_empresa: string | number; id_planta: any; }) => {
          console.log(this.plantasSeleccionadas)
          if(this.plantasSeleccionadas[pl.id_empresa]) {
            this.plantasSeleccionadas[pl.id_empresa].push(pl.id_planta);
          } else {
            this.plantasSeleccionadas[pl.id_empresa] = [pl.id_planta];
          }
        })
      }
      if(d.id_imagen) {
        this.imgId = d.id_imagen;
        this.fileService.traerArchivo(d.id_imagen, 2).subscribe(d => {
          let blob = this.fileService.b64toBlob(d.file, this.fileService.getFileType(d.fileName));
          this.imgSrc = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
        })
      };
    })
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  save() {
    console.log(this.usuarioForm.getRawValue());
    if(this.abmUsuarioService.getMode() == "View") {
      this.router.navigate(['dashboard/usuario']);
    } else {
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
        if (this.plantas[emp.id!].length > 0 && this.plantasSeleccionadas[emp.id!] == undefined) {
          plantaError = true;
        }
      });
      if (plantaError) {
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
        //id_imagen: null,
        usuarioEmpresa: [] as any,
        usuarioPlanta: [] as any,
        usuarioRol:[{
          id_rol: this.usuarioForm.get('rol')?.value,
          usu_id: "string"
        }]
      };
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
      console.log(this.grillaEmpresas);
      console.log(model)
      if(this.file != null) {
        if(this.imgId == 0) {
          this.fileService.subirArchivo(this.file, 2).subscribe(res => {
            Object.assign(model, {id_imagen: res.id});
            this.abmUsuarioService.updateUser(model).subscribe(d => {
              console.log(d);
              this.openSnackBar("Cambios a usuario guardados correctamente", 'X', 'success-snackbar');
              this.router.navigate(['dashboard/usuario']);
            });
          },
          err => {
            this.openSnackBar("Error al guardar", 'X', 'error-snackbar');
          });
        } else {
          Object.assign(model, {id_imagen: this.imgId});
          this.fileService.actualizarArchivo(this.file, this.imgId, 2).subscribe(res => {
            this.abmUsuarioService.updateUser(model).subscribe(d => {
              console.log(d);
              this.openSnackBar("Cambios a usuario guardados correctamente", 'X', 'success-snackbar');
              this.router.navigate(['dashboard/usuario']);
            },
            err => {
              this.openSnackBar("Error al guardar", 'X', 'error-snackbar');
            });
          });
        };
      } else {
        if(this.imgId == 0) {
          this.abmUsuarioService.updateUser(model).subscribe(d => {
            console.log(d);
            this.openSnackBar("Cambios a usuario guardados correctamente", 'X', 'success-snackbar');
            this.router.navigate(['dashboard/usuario']);
          },
          err => {
            this.openSnackBar("Error al guardar", 'X', 'error-snackbar');
          });
        } else {
          Object.assign(model, {id_imagen: this.imgId});
          this.abmUsuarioService.updateUser(model).subscribe(d => {
            console.log(d);
            this.openSnackBar("Cambios a usuario guardados correctamente", 'X', 'success-snackbar');
            this.router.navigate(['dashboard/usuario']);
          },
          err => {
            this.openSnackBar("Error al guardar", 'X', 'error-snackbar');
          });
        };
      };
    };
  }

  uploadFoto() {
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = _ => {
      let files = Array.from(input.files!);
      console.log(files[0]); //File Array
      this.file = files[0];
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
      this.empresaService.getPlantas(model.id!).subscribe(d => {
        this.plantas[model!.id!] = d;
        this.grillaEmpresas.push(model!);
        this.grillaEmpresas = [...this.grillaEmpresas];
        this.showTable = true;
        setTimeout(() => {
          document.getElementById('table')?.scrollIntoView();
        }, 10);
      })
    }
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
    console.log(this.grillaEmpresas);
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

  resetPassword() {
    this.abmUsuarioService.recoverPassword({username: this.usuarioBackup.rut.toString()}).subscribe(d => {
      this.openSnackBar(d.message, 'X', 'success-snackbar');
    })
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
