import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Estado, Grupo, Planta } from 'src/app/models/abm';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { ButtonsEventService } from '../../buttons-event.service';
import { AbmActividadService } from '../../planificacion/abm-actividad/abm-actividad.service';
import { AbmCuestionarioService } from '../abm-cuestionario.service';
import { AbmCuestionarioModalComponent } from '../modal/modal.component';
import { Cuestionario, CuestionarioUpdate, AgregarSeccion, PreguntaCuestionario, EditarSeccion } from 'src/app/models/cuestionario';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss']
})
export class AbmCuestionarioEditarComponent implements OnInit, OnDestroy {

  titulo: string = "Editar cuestionario";
  boton: string = "Guardar cambios";
  seccion: string = "Cuestionarios";

  suscripcion: Subscription;
  displayedColumns = ['orden', 'descripcion', 'tipo', 'acciones'];
  seccionForm: FormGroup = new FormGroup({
    nombre: new FormControl(null, Validators.required)
  });
  estados = [] as Array<Estado>;
  empresas = [] as Array<any>;
  cuestionarioDataForm: FormGroup = new FormGroup({
    descripcion_cuestionario: new FormControl(null, Validators.required),
    empresa: new FormControl("Collahuasi"),
    id_estado: new FormControl(null, Validators.required),
    orden: new FormControl(1, Validators.required),
    planta: new FormControl(null, Validators.required),
    grupo: new FormControl(null, Validators.required),
    planificado: new FormControl(false)
  });
  cuestionarioId: number = 0;
  show: boolean = false;

  rolUsuario: number = 0;
  empresaUsuario = {} as any;

  empresaId: number = 0;
  planificadoCheckbox: boolean = false;

  plantas = [] as Array<Planta>;
  grupos = [] as Array<Grupo>;

  /*
  TPR_ID
  4 - Texto fijo +
  5 - Texto +
  6 - Combo +
  7 - Numérico +
  8 - NOMBRE_USUARIO +
  9 - DATE +
  10 - Selección (Radio) +
  11 - RUT_USUARIO +
  12 - Calendario +
  13 - Completar ???
  14 - Subir foto + 
  15 - Radio SI/NO +
  */

  cuestionario = {} as Cuestionario;

  constructor(
    private buttonsEventService: ButtonsEventService,
    private stylesService: StylesService,
    private empresasService: AbmEmpresaService,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cuestionarioService: AbmCuestionarioService,
    private activatedRoute: ActivatedRoute,
    private loginService: LoginService,
    private router: Router,
    private actividadService: AbmActividadService
  ) {
    this.suscripcion = this.buttonsEventService.events.subscribe(
      (data: any) => {
        this.saveAll()
      }
    )
  }

  ngOnInit(): void {
    this.rolUsuario = Number(this.loginService.getRol());
    this.empresaUsuario = JSON.parse(this.loginService.getEmpresa()!);
    this.estados = JSON.parse(localStorage.getItem('estados')!);
    if(this.rolUsuario > 1) {
      this.empresasService.getEmpresas({id: this.empresaUsuario.id}).subscribe(d => {
        this.empresas = d;
      });
    } else {
      this.empresasService.getEmpresas(null).subscribe(d => {
        this.empresas = d;
      });
    };
    if (this.cuestionarioService.getCuestionario() != undefined) {
      this.cuestionarioDataForm.patchValue({
        empresa: this.cuestionarioService.getCuestionario().empresa,
      })
    };
    if(this.rolUsuario == 3) {
      this.cuestionarioDataForm.disable()
    };
    this.cuestionarioId = this.activatedRoute.snapshot.params['cuestionarioId'];
    this.cuestionarioService.getCreatedEnabledCuestionario(this.cuestionarioId).subscribe(d => {
      console.log(d);
      this.cuestionarioDataForm.get('descripcion_cuestionario')?.setValue(d.descripcion_cuestionario);
      this.cuestionarioDataForm.get('id_estado')?.setValue(d.id_estado);
      this.cuestionarioDataForm.get('planta')?.setValue(d.id_planta);
      this.cuestionarioDataForm.get('grupo')?.setValue(d.id_grupo);
      if(d.planificado) {
        if(d.planificado == 0) {
          this.cuestionarioDataForm.get('planificado')?.setValue(false);
        } else {
          this.cuestionarioDataForm.get('planificado')?.setValue(true);
        }
      }
      this.cuestionario = d;
      this.cuestionario.secciones.forEach(sec => {
        sec.preguntas.sort((a,b) => a.orden! - b.orden!)
      });
      console.log(this.cuestionario.secciones);
      this.cuestionario.secciones.sort((a,b) => a.orden - b.orden);
      this.cuestionarioService.getCuestionariosByParams({descripcion: d.descripcion_cuestionario}).subscribe(e => {
        e = e.filter((emp: { id_cuestionario: number; }) => emp.id_cuestionario == this.cuestionarioId);
        this.empresaId = e[0].id_empresa;
        this.cuestionarioDataForm.get('empresa')?.setValue(e[0].descripcion_empresa);
        this.cuestionarioDataForm.get('empresa')?.disable();
        this.empresasService.getPlantas(e[0].id_empresa).subscribe(res => {
          let plantaSeleccionada = res.find((pl: { id_planta: any; }) => pl.id_planta == d.id_planta);
          this.plantas = res.filter((pl: { id_estado: number; }) => pl.id_estado == 1);
          if(plantaSeleccionada != undefined && !this.plantas.includes(plantaSeleccionada)) {
            this.plantas.push(plantaSeleccionada);
          }
          if(this.plantas.length == 0) {
            this.cuestionarioDataForm.get('planta')?.disable()
          }
        });
        this.empresasService.getGrupos(e[0].id_empresa).subscribe(res => {
          this.grupos = res;
          if(this.grupos.length == 0) {
            this.cuestionarioDataForm.get('grupo')?.disable()
          }
        });
        this.show = true;
      });
    })
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  saveAll() {
    if(this.cuestionarioDataForm.invalid) {
      this.cuestionarioDataForm.markAllAsTouched();
      return;
    };
    if(this.planificadoCheckbox) {
      this.actividadService.getActividadesByParams({id_empresa: this.empresaId}).subscribe(plan => {
        console.log(plan);
        let filtradas = plan.filter((act: { id_cuestionario: number; }) => act.id_cuestionario == this.cuestionarioId);
        console.log(filtradas);
        if(filtradas.length > 0) {
          this.openSnackBar('Tiene actividades cargadas, no puede cambiar el check es planificado', 'X', 'error-snackbar');
          //Detectar si se cambió es planificado
        } else {
          let model: CuestionarioUpdate = {
            id_cuestionario: this.cuestionarioId,
            descripcion: this.cuestionarioDataForm.get('descripcion_cuestionario')?.value,
            id_estado: this.cuestionarioDataForm.get('id_estado')?.value,
            rut_usuario_modificacion: Number(this.loginService.getUser()),
            orden: this.cuestionarioDataForm.get('orden')?.value,
            planificado: this.cuestionarioDataForm.get('planificado')?.value == true ? 1 : 0
          };
          if(this.cuestionarioDataForm.get('planta')?.value != null) {
            Object.assign(model, {id_planta: this.cuestionarioDataForm.get('planta')?.value});
          };
          if(this.cuestionarioDataForm.get('grupo')?.value != null) {
            Object.assign(model, {id_grupo: this.cuestionarioDataForm.get('grupo')?.value});
          };
          this.cuestionarioService.updateCuestionario(model).subscribe(d => {
            console.log(d);
            this.cuestionario.secciones.forEach(sec => {
              sec.preguntas.forEach(pre => {
                let modelPregunta = {
                  id_pregunta: pre.pre_id,
                  descripcion: pre.pre_descripcion,
                  id_tipo_pregunta: pre.tpr_id,
                  rut_usuario_alta: Number(this.loginService.getUser()),
                  id_estado: 1,
                  orden: pre.orden,
                  opciones: [] as Array<any>,
                  preguntaValidaciones: [] as Array<any>
                };
                pre.opciones?.forEach(opc => {
                  modelPregunta.opciones.push({
                    id_opcion: opc.opc_id,
                    descripcion: opc.opc_descripcion,
                    id_pregunta: modelPregunta.id_pregunta,
                    id_estado: 1,
                    valor: opc.opc_valor,
                    orden: opc.opc_orden,
                    //pregunta: 
                  })
                });
                pre.validators?.forEach(val => {
                  modelPregunta.preguntaValidaciones.push({
                    id_pregunta_validacion: val.id_pregunta_validacion,
                    id_validacion: val.id_validacion,
                    valor: val.Value,
                    mensaje: val.Message,
                    id_estado: 1
                  })
                });
                this.cuestionarioService.updatePregunta(modelPregunta, model.id_cuestionario, sec.sec_id, modelPregunta.id_pregunta!).subscribe(e => {
                  //console.log(e)
                })
              });
              if (this.cuestionario.secciones.indexOf(sec) == this.cuestionario.secciones.length - 1) {
                this.openSnackBar('Cambios guardados', 'X', 'success-snackbar');
                let url = this.router.url;
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  this.router.navigate([`/${url}`]).then(() => {
                    //console.log(`After navigation I am on:${this.router.url}`)
                  })
                })
              }
            });
            //this.openSnackBar('Cambios guardados', 'X', 'success-snackbar');
          })
        }
      })
    } else {
      let model: CuestionarioUpdate = {
        id_cuestionario: this.cuestionarioId,
        descripcion: this.cuestionarioDataForm.get('descripcion_cuestionario')?.value,
        id_estado: this.cuestionarioDataForm.get('id_estado')?.value,
        rut_usuario_modificacion: Number(this.loginService.getUser()),
        orden: this.cuestionarioDataForm.get('orden')?.value,
        planificado: this.cuestionarioDataForm.get('planificado')?.value == true ? 1 : 0
      };
      if(this.cuestionarioDataForm.get('planta')?.value != null) {
        Object.assign(model, {id_planta: this.cuestionarioDataForm.get('planta')?.value});
      };
      if(this.cuestionarioDataForm.get('grupo')?.value != null) {
        Object.assign(model, {id_grupo: this.cuestionarioDataForm.get('grupo')?.value});
      };
      this.cuestionarioService.updateCuestionario(model).subscribe(d => {
        console.log(d);
        this.cuestionario.secciones.forEach(sec => {
          sec.preguntas.forEach(pre => {
            let modelPregunta = {
              id_pregunta: pre.pre_id,
              descripcion: pre.pre_descripcion,
              id_tipo_pregunta: pre.tpr_id,
              rut_usuario_alta: Number(this.loginService.getUser()),
              id_estado: 1,
              orden: pre.orden,
              opciones: [] as Array<any>,
              preguntaValidaciones: [] as Array<any>
            };
            pre.opciones?.forEach(opc => {
              modelPregunta.opciones.push({
                id_opcion: opc.opc_id,
                descripcion: opc.opc_descripcion,
                id_pregunta: modelPregunta.id_pregunta,
                id_estado: 1,
                valor: opc.opc_valor,
                orden: opc.opc_orden,
                //pregunta: 
              })
            });
            pre.validators?.forEach(val => {
              modelPregunta.preguntaValidaciones.push({
                id_pregunta_validacion: val.id_pregunta_validacion,
                id_validacion: val.id_validacion,
                valor: val.Value,
                mensaje: val.Message,
                id_estado: 1
              })
            });
            this.cuestionarioService.updatePregunta(modelPregunta, model.id_cuestionario, sec.sec_id, modelPregunta.id_pregunta!).subscribe(e => {
              //console.log(e)
            })
          });
          if (this.cuestionario.secciones.indexOf(sec) == this.cuestionario.secciones.length - 1) {
            this.openSnackBar('Cambios guardados', 'X', 'success-snackbar');
            let url = this.router.url;
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate([`/${url}`]).then(() => {
                //console.log(`After navigation I am on:${this.router.url}`)
              })
            })
          }
        });
        //this.openSnackBar('Cambios guardados', 'X', 'success-snackbar');
      })
    }
    
  }

  checkboxChange() {
    this.planificadoCheckbox = true;
  }

  addSeccion() {
    if(this.seccionForm.invalid) {
      this.seccionForm.markAllAsTouched();
      return;
    };

    let model: AgregarSeccion = {
      id_seccion: 0,
      id_estado: 1,
      descripcion: this.seccionForm.get('nombre')!.value,
      orden: this.cuestionario.secciones.length,
      id_cuestionario: this.cuestionarioId,
      rut_usuario_alta: Number(this.loginService.getUser())
    }

    this.cuestionarioService.addSeccion(model).subscribe(d => {
      this.openSnackBar(d.message, 'X', 'success-snackbar');
      this.cuestionario.secciones.push({
        orden: this.cuestionario.secciones.length,
        sec_descripcion: this.seccionForm.get('nombre')!.value,
        preguntas: [],
        sec_id: d.id,
        cue_id: this.cuestionarioId
      });
      this.cuestionario.secciones.sort((a,b) => a.orden - b.orden);
      this.seccionForm.reset();
    })
  }

  deleteQuestion(row: any) {
    console.log(row)
    console.log(row.pre_id);
    this.cuestionarioService.deletePregunta(row.pre_id).subscribe(d => {
      if(row.tpr_id == 16) {
        this.cuestionarioService.deleteFirmaDatoAdicionalByPregunta(row.pre_id).subscribe(resFirma => {
          this.openSnackBar(d.message, 'X', 'success-snackbar');
          let url = this.router.url;
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate([`/${url}`]).then(() => {
              console.log(`After navigation I am on:${this.router.url}`)
            })
          })
        })
      } else {
        this.openSnackBar(d.message, 'X', 'success-snackbar');
        let url = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([`/${url}`]).then(() => {
            console.log(`After navigation I am on:${this.router.url}`)
          })
        })
      }
    })
  }

  addFirma(row: any) {
    console.log(row);
    let titulos: Array<string> = [];
    if(row.preguntas.length > 0) {
      row.preguntas.forEach((pre: { pre_descripcion: string; }) => {
        titulos.push(pre.pre_descripcion);
      });
    };

    let find = this.cuestionario.secciones.find(sec => sec.orden == 999);

    const dialogRef = this.dialog.open(AbmCuestionarioModalComponent, {
      width: '70%',
      maxHeight: '85vh',
      height: 'auto',
      data: {mode: "Add", ordenPregunta: find!.preguntas.length + 1, idCuestionario: this.cuestionarioId, idSeccion: row.sec_id, titulosSeccion: titulos, preguntaTipo: "Firma", empresaId: this.empresaId},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      console.log(row);
      if(result) {
        let model: PreguntaCuestionario = {
          pre_descripcion: result.descripcion,
          pre_id: result.id_pregunta,
          sec_id: row.sec_id,
          tpr_id: result.id_tipo_pregunta,
          validators: result.preguntaValidaciones,
          opciones: result.opciones
        }
        if (this.cuestionario.secciones[row.orden].preguntas.length > 0) {
          this.cuestionario.secciones[row.orden].preguntas.push(model);
        } else {
          this.cuestionario.secciones[row.orden].preguntas = [model];
        };
        this.cuestionario.secciones[row.orden].preguntas = [...this.cuestionario.secciones[row.orden].preguntas];
        this.openSnackBar('Pregunta agregada correctamente', 'X', 'success-snackbar');
      }
    });
  }

  addQuestion(row: any) {
    console.log(row);
    let titulos: Array<string> = [];
    if(row.preguntas.length > 0) {
      row.preguntas.forEach((pre: { pre_descripcion: string; }) => {
        titulos.push(pre.pre_descripcion);
      });
    };
    const dialogRef = this.dialog.open(AbmCuestionarioModalComponent, {
      width: '70%',
      maxHeight: '85vh',
      height: 'auto',
      data: {mode: "Add", ordenPregunta: this.cuestionario.secciones[row.orden].preguntas.length + 1, idCuestionario: this.cuestionarioId, idSeccion: row.sec_id, titulosSeccion: titulos, empresaId: this.empresaId},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      console.log(row);
      if(result) {
        let model: PreguntaCuestionario = {
          pre_descripcion: result.descripcion,
          pre_id: result.id_pregunta,
          sec_id: row.sec_id,
          tpr_id: result.id_tipo_pregunta,
          validators: result.preguntaValidaciones,
          opciones: result.opciones
        }
        if (this.cuestionario.secciones[row.orden].preguntas.length > 0) {
          this.cuestionario.secciones[row.orden].preguntas.push(model);
        } else {
          this.cuestionario.secciones[row.orden].preguntas = [model];
        };
        this.cuestionario.secciones[row.orden].preguntas = [...this.cuestionario.secciones[row.orden].preguntas];
        this.openSnackBar('Pregunta agregada correctamente', 'X', 'success-snackbar');
      }
    });
  }

  editQuestion(row: any, indexSeccion: number, index: number) {
    console.log(row);
    let section = this.cuestionario.secciones.find(s => s.sec_id == row.sec_id);
    let titulos: Array<string> = [];
    if(section != undefined) {
      if(section.preguntas.length > 0) {
        section.preguntas.forEach(pre => {
          titulos.push(pre.pre_descripcion!);
        });
      };
    };
    const dialogRef = this.dialog.open(AbmCuestionarioModalComponent, {
      width: '70%',
      maxHeight: '85vh',
      height: 'auto',
      data: {mode: "Edit", data: row, ordenPregunta: index + 1, idCuestionario: this.cuestionarioId, idSeccion: row.sec_id, titulosSeccion: titulos, empresaId: this.empresaId},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        let model: PreguntaCuestionario = {
          pre_descripcion: result.descripcion,
          pre_id: result.id_pregunta,
          sec_id: row.sec_id,
          tpr_id: result.id_tipo_pregunta,
          validators: result.preguntaValidaciones,
          opciones: result.opciones
        };
        console.log(model)
        this.cuestionario.secciones[indexSeccion].preguntas[index] = model;
        this.cuestionario.secciones[indexSeccion].preguntas = [...this.cuestionario.secciones[indexSeccion].preguntas];
        this.openSnackBar('Cambios guardados', 'X', 'success-snackbar');
      }
    });
  }

  copyPregunta(indexSeccion: number, index: number, row: any) {
    console.log(indexSeccion);
    console.log(index);
    console.log(row);
    let section = this.cuestionario.secciones.find(s => s.sec_id == row.sec_id);
    let titulos: Array<string> = [];
    if(section != undefined) {
      if(section.preguntas.length > 0) {
        section.preguntas.forEach(pre => {
          titulos.push(pre.pre_descripcion!);
        });
      };
    };
    const dialogRef = this.dialog.open(AbmCuestionarioModalComponent, {
      width: '70%',
      maxHeight: '85vh',
      height: 'auto',
      data: {mode: "Copy", data: row, ordenPregunta: this.cuestionario.secciones[indexSeccion].preguntas.length + 1, idCuestionario: this.cuestionarioId, idSeccion: row.sec_id, titulosSeccion: titulos, empresaId: this.empresaId},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        let model: PreguntaCuestionario = {
          pre_descripcion: result.descripcion,
          pre_id: result.id_pregunta,
          sec_id: row.sec_id,
          tpr_id: result.id_tipo_pregunta,
          validators: result.preguntaValidaciones,
          opciones: result.opciones
        };
        console.log(model)
        if (this.cuestionario.secciones[indexSeccion].preguntas.length > 0) {
          this.cuestionario.secciones[indexSeccion].preguntas.push(model);
        } else {
          this.cuestionario.secciones[indexSeccion].preguntas = [model];
        };
        this.cuestionario.secciones[indexSeccion].preguntas = [...this.cuestionario.secciones[indexSeccion].preguntas];
        this.openSnackBar('Pregunta copiada correctamente', 'X', 'success-snackbar');
      }
    });
  }

  editSeccion(event: any, seccion: any) {
    event.stopPropagation();
    console.log(seccion);
    const dialogRef = this.dialog.open(ModalSeccion, {
      maxHeight: '85vh',
      height: 'auto',
      data: {seccion: seccion.sec_descripcion, id: seccion.sec_id}
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  dropTable(event: CdkDragDrop<any[]>, indexSeccion: number) {
    const prevIndex = this.cuestionario.secciones[indexSeccion].preguntas.findIndex((d) => d === event.item.data);
    moveItemInArray(this.cuestionario.secciones[indexSeccion].preguntas, prevIndex, event.currentIndex);
    let index = 1;
    this.cuestionario.secciones[indexSeccion].preguntas.forEach(pre => {
      pre.orden = index;
      index++;
    });
    this.cuestionario.secciones[indexSeccion].preguntas = [...this.cuestionario.secciones[indexSeccion].preguntas];
  }

  openSnackBar(message: string, action: string, className: string) {
    this.snackbar.open(message, action, {horizontalPosition: 'right', verticalPosition: 'top', panelClass: className});
  }

  get colours() {
    return this.stylesService.getStyle();
  }

}

@Component({
  template: `
  <div mat-dialog-content>
    <form [formGroup]="editForm">
        <mat-form-field appearance="fill">
            <mat-label>Nuevo nombre de sección</mat-label>
            <input matInput formControlName="descripcion">
          </mat-form-field>
    </form>
  </div>
  <div mat-dialog-actions class="flex justify-end gap-x-4">
    <button mat-dialog-close mat-button [style.background-color]="colours.warnButtonColor" class="text-white"(click)="cancel()">Cancelar</button>
    <button mat-button mat-dialog-close [style.background-color]="colours.mainButtonColor" class="text-white" cdkFocusInitial (click)="accept()">Aceptar</button>
  </div>
  `
})

export class ModalSeccion implements OnInit {

  editForm: FormGroup = new FormGroup({
    descripcion: new FormControl(null, Validators.required)
  })

  constructor(
    public dialogRef: MatDialogRef<ModalSeccion>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private stylesService: StylesService,
    private snackbar: MatSnackBar,
    private cuestionarioService: AbmCuestionarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.editForm.setValue({
      descripcion: this.data.seccion
    })
  }

  accept() {
    if(this.editForm.invalid) {
      this.editForm.markAllAsTouched()
      return;
    };

    let model: EditarSeccion = {
      id_seccion: this.data.id,
      descripcion: this.editForm.get('descripcion')?.value
    };
    this.cuestionarioService.updateSeccion(model).subscribe(d => {
      console.log(d);
      this.openSnackBar(d.message, 'X', 'success-snackbar');
      let url = this.router.url;
      this.router.navigateByUrl('/',{skipLocationChange:true}).then(()=>{
        this.router.navigate([`/${url}`]).then(()=>{
          console.log(`After navigation I am on:${this.router.url}`)
        })
      })
    })
  }

  cancel() {
    this.dialogRef.close(false)
  }

  openSnackBar(message: string, action: string, className: string) {
    this.snackbar.open(message, action, {horizontalPosition: 'right', verticalPosition: 'top', panelClass: className});
  }

  get colours() {
    return this.stylesService.getStyle();
  }
}