import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Empresa, Estado, Rol } from 'src/app/models/abm';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmCuestionarioService } from '../../../abm-cuestionario/abm-cuestionario.service';
import { AbmEmpresaService } from '../../../abm-empresa/abm-empresa.service';
import { AbmUsuarioService } from '../../../abm-usuario/abm-usuario.service';
import { ButtonsEventService } from '../../../buttons-event.service';
import { AbmActividadService } from '../abm-actividad.service';

@Component({
  selector: 'app-actividad-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss']
})
export class AbmActividadEditarComponent implements OnInit, OnDestroy {

  titulo: string = "Editar actividad";
  boton: string = "Guardar actividad";
  seccion: string = "Actividad";

  actividadForm: FormGroup = new FormGroup({
    empresa: new FormControl(null, Validators.required),
    cuestionario: new FormControl(null, Validators.required),
    actividad: new FormControl(null, Validators.required),
    fecha: new FormControl(null, Validators.required),
    horaMin: new FormControl(null, Validators.required),
    horaMax: new FormControl(null, Validators.required),
    repetirDiario: new FormControl(false),
    todasLasSemanas: new FormControl(false),
    diasLaborales: new FormControl(false),
    lider: new FormControl(null, Validators.required),
    participantes: new FormControl(null),
    estado: new FormControl(null, Validators.required),
  });

  adicionalForm: FormGroup = new FormGroup({
    nombre: new FormControl(null, Validators.required),
    rut: new FormControl(null, Validators.required),
    cargo: new FormControl(null, Validators.required)
  });

  adicionales = [] as Array<any>;
  cuestionarios = [] as Array<any>;
  usuarios = [] as Array<any>;
  usuariosLider = [] as Array<any>;
  formatSelection = "";
  empresaId: number = 0;

  estados = [] as Array<Estado>;
  roles = [] as Array<Rol>;
  empresas = [] as Array<Empresa>;

  suscripcion: Subscription;

  rolUsuario: number = 0;
  empresaUsuario = {} as any;

  actividadId: number = 0;
  backupActividad: any = {};

  constructor(
    private stylesService: StylesService,
    private buttonsEventService: ButtonsEventService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private snackbar: MatSnackBar,
    private loginService: LoginService,
    private empresaService: AbmEmpresaService,
    public actividadService: AbmActividadService,
    private cuestionarioService: AbmCuestionarioService,
    private usuarioService: AbmUsuarioService
  ) {
    this.suscripcion = this.buttonsEventService.events.subscribe(
      (data: any) => {
        this.save()
      }
    )
  }

  ngOnInit(): void {
    console.log(this.actividadService.getMode())
    this.actividadId = Number(this.activatedRoute.snapshot.params['actividadId']);
    this.existingData();
    console.log(this.loginService.getUser())
    this.rolUsuario = Number(this.loginService.getRol());
    this.empresaUsuario = JSON.parse(this.loginService.getEmpresa()!);
    this.estados = JSON.parse(localStorage.getItem('estados')!);
    if(this.rolUsuario > 1) {
      this.empresaService.getEmpresas({id: this.empresaUsuario.id}).subscribe(d => {
        this.empresas = d;
      });
    } else {
      this.empresaService.getEmpresas(null).subscribe(d => {
        this.empresas = d;
      });
    };
    if(this.actividadService.getMode() == "View") {
      this.actividadForm.disable();
      this.adicionalForm.disable();
    }
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  existingData() {
    this.actividadService.getActividadById(this.actividadId).subscribe(d => {
      console.log(d);
      this.backupActividad = d;
      this.empresaId = d.id_empresa;
      this.actividadForm.setValue({
        empresa: d.id_empresa,
        cuestionario: d.id_cuestionario,
        actividad: d.descripcion,
        fecha: d.fecha_desde,
        horaMin: d.fecha_desde.split('T')[1].split(':')[0] + ':' + d.fecha_desde.split('T')[1].split(':')[1],
        horaMax: d.fecha_hasta.split('T')[1].split(':')[0] + ':' + d.fecha_hasta.split('T')[1].split(':')[1],
        repetirDiario: d.repeticion_diaria == 1 ? true : false,
        todasLasSemanas: d.repeticion_semanal == 1 ? true : false,
        diasLaborales: d.repeticion_dias_laborales == 1 ? true : false,
        lider: d.rut_lider,
        participantes: null,
        estado: d.id_estado
      });
      let arrayParticipantes = [] as Array<any>;
      d.participantes.forEach((par: { rut_participante: any; }) => {
        arrayParticipantes.push(par.rut_participante)
      });
      this.actividadForm.get('participantes')?.setValue(arrayParticipantes);
      this.adicionales = d.adicionales;
      this.actividadForm.get('lider')?.setValue(d.rut_lider)
      this.actividadForm.get('empresa')?.disable();
      this.actividadForm.get('cuestionario')?.disable();
      this.cuestionarioService.getCuestionariosByParams({id_empresa: d.id_empresa}).subscribe(res => {
        this.cuestionarios = res;
        if (this.cuestionarios.length == 0) {
          this.actividadForm.get('cuestionario')?.disable();
        };
        let find = this.cuestionarios.find(cue => cue.id_cuestionario == d.id_cuestionario);
        this.usuarios = [];
        this.usuariosLider = [];
        if (find.id_planta) {
          console.log("Tiene planta")
          this.empresaService.getPlantas(find.id_empresa).subscribe(e => {
            let users = e.filter((plan: { id_planta: any; }) => plan.id_planta == find.id_planta)[0].usuariosPlanta;
            users.forEach((user: { nombre: any; apellido: any; rut: any; }) => {
              this.usuarios.push({
                nombre: user.nombre,
                apellido: user.apellido,
                rut: Number(user.rut)
              });
            });
            this.usuariosLider = this.usuarios;
            this.usuarios = this.usuarios.filter(u => u.rut != d.rut_lider);
            this.changeSelectFormat();
          })
        } else {
          this.usuarioService.getUsersByParams({id_empresa: find.id_empresa}).subscribe(r => {
            console.log(r);
            let allUsers = r;
            this.empresaService.getPlantas(this.empresaId).subscribe(s => {
              console.log(s);
              s.forEach((planta: { usuariosPlanta: any[]; }) => {
                if(planta.usuariosPlanta.length > 0) {
                  planta.usuariosPlanta.forEach(us => {
                    allUsers = allUsers.filter((u: { rut: number; }) => u.rut != Number(us.rut))
                  });
                }
              });
              allUsers.forEach((x: { firstName: any; lastName: any; rut: any; }) => {
                this.usuarios.push({
                  nombre: x.firstName,
                  apellido: x.lastName,
                  rut: Number(x.rut)
                })
              })
              this.usuariosLider = this.usuarios;
              this.usuarios = this.usuarios.filter(u => u.rut != d.rut_lider);
              this.changeSelectFormat();
            })
          });
        }
      })
    });
  }

  save() {
    if(this.actividadService.getMode() == 'View') {
      this.router.navigate(['dashboard/actividad']);
      return;
    }
    this.actividadForm.markAllAsTouched();
    if(this.actividadForm.invalid) {
      return;
    };
    if(this.actividadForm.get('horaMin')?.value >= this.actividadForm.get('horaMax')?.value) {
      this.openSnackBar("La hora desde debe ser mayor a la hora hasta", 'X', 'warn-snackbar');
      return;
    };
    let model = {
      id_estado: this.actividadForm.get('estado')?.value,
      id_actividad: this.actividadId,
      descripcion: this.actividadForm.get('actividad')?.value,
      id_empresa: this.actividadForm.get('empresa')?.value,
      id_cuestionario: this.actividadForm.get('cuestionario')?.value,
      fecha_desde: this.formatDate(false), //formatear fecha con horario
      fecha_hasta: this.formatDate(true), //formatear fecha con horario, si es mayor a 00:00, agregar un día
      repeticion_diaria: this.actividadForm.get('repetirDiario')?.value ? 1 : 0,
      repeticion_semanal: this.actividadForm.get('todasLasSemanas')?.value ? 1 : 0,
      repeticion_dias_laborales: this.actividadForm.get('diasLaborales')?.value ? 1 : 0,
      rut_lider: this.actividadForm.get('lider')?.value,
      adicionales: [] as Array<any>,
      participantes: [] as Array<any>
    };
    if(this.actividadForm.get('participantes')?.value != null) {
      if(this.actividadForm.get('participantes')?.value.length > 0) {
        this.actividadForm.get('participantes')?.value.forEach((part: number) => {
          let findActividad = this.backupActividad.participantes.find((ac: { rut_participante: number; }) => ac.rut_participante == part);
          if(findActividad != undefined) {
            model.participantes.push({
              id_actividad_participante: findActividad.id_actividad_participante,
              rut_participante: part
            })
          } else {
            model.participantes.push({
              id_actividad_participante: 0,
              rut_participante: part
            })
          }
        });
      };
    };
    if(this.adicionales.length > 0) {
      this.adicionales.forEach(adi => {
        let findAdicional = this.backupActividad.adicionales.find((ad: { rut: any; }) => ad.rut == adi.rut);
        if(findAdicional != undefined) {
          model.adicionales.push({
            id_actividad_adicional: findAdicional.id_actividad_adicional,
            rut: Number(adi.rut),
            nombre: adi.nombre,
            cargo: adi.cargo
          })
        } else {
          model.adicionales.push({
            rut: Number(adi.rut),
            nombre: adi.nombre,
            cargo: adi.cargo
          })
        }
      });
    };
    this.actividadService.updateActividad(model).subscribe(d => {
      console.log(d);
      this.openSnackBar(d.message, 'X', 'success-snackbar');
      this.router.navigate(['dashboard/actividad']);
    });
  }

  empresaChange(event: any) {
    this.actividadForm.get('cuestionario')?.enable();
    this.actividadForm.get('cuestionario')?.reset();
    this.cuestionarioService.getCuestionariosByParams({id_empresa: event}).subscribe(d => {
      console.log(d);
      this.cuestionarios = d;
      if(this.cuestionarios.length == 0) {
        this.actividadForm.get('cuestionario')?.disable();
      }
    })
  }

  cuestionarioChange(event: any) {
    let find = this.cuestionarios.find(cue => cue.id_cuestionario == event);
    this.usuarios = [];
    this.usuariosLider = [];
    if (find.id_planta) {
      console.log("Tiene planta")
      this.empresaService.getPlantas(find.id_empresa).subscribe(d => {
        console.log(d);
        console.log(find.id_planta);
        let users = d.filter((plan: { id_planta: any; }) => plan.id_planta == find.id_planta)[0].usuariosPlanta;
        users.forEach((user: { nombre: any; apellido: any; rut: any; }) => {
          this.usuarios.push({
            nombre: user.nombre,
            apellido: user.apellido,
            rut: Number(user.rut)
          });
        });
        this.usuariosLider = this.usuarios;
      })
    } else {
      this.usuarioService.getUsersByParams({id_empresa: find.id_empresa}).subscribe(d => {
        console.log(d);
        let allUsers = d;
        this.empresaService.getPlantas(this.empresaId).subscribe(e => {
          console.log(e);
          e.forEach((planta: { usuariosPlanta: any[]; }) => {
            if(planta.usuariosPlanta.length > 0) {
              planta.usuariosPlanta.forEach(us => {
                allUsers = allUsers.filter((u: { rut: number; }) => u.rut != Number(us.rut))
              });
            }
          });
          allUsers.forEach((x: { firstName: any; lastName: any; rut: any; }) => {
            this.usuarios.push({
              nombre: x.firstName,
              apellido: x.lastName,
              rut: Number(x.rut)
            })
          })
          this.usuariosLider = this.usuarios;
        })
      });
    }
  }

  checkChange(control: string, event: any) {
    if(event.checked) {
      this.actividadForm.get('repetirDiario')?.setValue(false);
      this.actividadForm.get('todasLasSemanas')?.setValue(false);
      this.actividadForm.get('diasLaborales')?.setValue(false);
      this.actividadForm.get(control)?.setValue(true);
    }
  }

  liderSelectionChange(rut: number) {
    this.actividadForm.get('participantes')?.reset();
    this.usuarios = this.usuariosLider;
    this.usuarios = this.usuarios.filter(u => u.rut != rut);
  }

  addAdicional() {
    this.adicionalForm.markAllAsTouched();
    if(this.adicionalForm.invalid) {
      return;
    };
    this.adicionales.push({
      nombre: this.adicionalForm.get('nombre')?.value,
      rut: this.adicionalForm.get('rut')?.value,
      cargo: this.adicionalForm.get('cargo')?.value
    });
    this.adicionales = [...this.adicionales];
    this.adicionalForm.reset();
  }

  deleteAdicional(row: any) {
    this.adicionales.splice(this.adicionales.indexOf(row), 1);
    this.adicionales = [...this.adicionales];
  }

  filtrar() {
    // if(this.rolUsuario > 1) {
    //   this.empresas = this.empresas.filter(e => e.id == this.empresaUsuario.id);
    // }
  }

  openSnackBar(message: string, action: string, className: string) {
    this.snackbar.open(message, action, {horizontalPosition: 'right', verticalPosition: 'top', panelClass: className});
  }

  changeSelectFormat() {
    this.formatSelection = "";
    this.actividadForm.get('participantes')?.value.forEach((rut: any) => {
      let search = this.usuarios.find(user => user.rut == rut);
      if(this.formatSelection == "") {
        this.formatSelection =`${search.apellido}, ${search.nombre}`
      } else {
        this.formatSelection = this.formatSelection + '  -  ' + `${search.apellido}, ${search.nombre}`
      }
    })
  }

  formatDate(endDate: boolean) {
    let date = new Date(this.actividadForm.get('fecha')?.value);
    let hourMin = this.actividadForm.get('horaMin')?.value.split(':')[0];
    let minutesMin = this.actividadForm.get('horaMin')?.value.split(':')[1];
    let hourMax = this.actividadForm.get('horaMax')?.value.split(':')[0];
    let minutesMax = this.actividadForm.get('horaMax')?.value.split(':')[1];
    let stringDate = "";
    if(!endDate) {
      stringDate = `${date.getFullYear()}-${(date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1)}-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}T${hourMin}:${minutesMin}:00.000Z`;
      return stringDate
    } else {
      if(this.actividadForm.get('horaMin')?.value >= this.actividadForm.get('horaMax')?.value) {
        date.setDate(date.getDate() + 1);
      };
      stringDate = `${date.getFullYear()}-${(date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1)}-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}T${hourMax}:${minutesMax}:00.000Z`;
      return stringDate
    }
  }

  get colours() {
    return this.stylesService.getStyle()
  }

  get newSelection() {
    return this.formatSelection
  }

}
