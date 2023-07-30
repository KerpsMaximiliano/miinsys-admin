import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Estado } from 'src/app/models/abm';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { ButtonsEventService } from '../../buttons-event.service';
import { AbmAccionesService } from '../abm-acciones.service';
import { Accion } from 'src/app/models/accion';

@Component({
  selector: 'app-nueva',
  templateUrl: './nueva.component.html',
  styleUrls: ['./nueva.component.scss']
})
export class AbmAccionesNuevaComponent implements OnInit, OnDestroy {

  titulo: string = "Crear acción nueva";
  boton: string = "Guardar acción";
  seccion: string = "Acción incidencias";

  suscripcion: Subscription;

  empresas: any;
  cuestionarios: any;
  preguntas: any;
  estados = [] as Array<Estado>;

  rolUsuario: number = 0;
  empresaUsuario = {} as any;

  accionForm: FormGroup = new FormGroup({
    empresa: new FormControl(null, Validators.required),
    cuestionario: new FormControl(null, Validators.required),
    pregunta: new FormControl(null, Validators.required),
    accion: new FormControl(null, Validators.required),
    responsable: new FormControl(null, Validators.required),
    botonesAprobacion: new FormControl(false),
    planCierre: new FormControl(false),
    adjuntos: new FormControl(false),
    alertarCorreoObservaciones: new FormControl(false),
    asignarIncidencia: new FormControl(false),
    alertarCorreoSupervisor: new FormControl(false),
    estado: new FormControl(null, Validators.required)
  });

  constructor(
    private accionesService: AbmAccionesService,
    private router: Router,
    private buttonsEventService: ButtonsEventService,
    private stylesService: StylesService,
    private snackbar: MatSnackBar,
    private loginService: LoginService,
    private empresasService: AbmEmpresaService,
  ) {
    this.suscripcion = this.buttonsEventService.events.subscribe(
      (data: any) => {
        this.save()
      }
    )
  }

  ngOnInit(): void {
    this.estados = JSON.parse(localStorage.getItem('estados')!);
    this.rolUsuario = Number(this.loginService.getRol());
    this.empresaUsuario = JSON.parse(this.loginService.getEmpresa()!);
    console.log(this.estados)
    this.loginService.getUserData(Number(this.loginService.getUser())).subscribe(d => {
      console.log(d);
      this.accionForm.get('responsable')?.setValue(d.lastName + ', ' + d.firstName);
      this.accionForm.get('responsable')?.disable();
    });
    if(this.rolUsuario > 1) {
      this.empresasService.getEmpresas({id: this.empresaUsuario.id}).subscribe(d => {
        this.empresas = d;
        this.accionForm.get('cuestionario')?.disable();
        this.accionForm.get('pregunta')?.disable();
      });
    } else {
      this.empresasService.getEmpresas(null).subscribe(d => {
        this.empresas = d;
        this.accionForm.get('cuestionario')?.disable();
        this.accionForm.get('pregunta')?.disable();
      });
    };
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  save() {
    if(this.accionForm.invalid) {
      this.accionForm.markAllAsTouched();
      if(this.accionForm.get('empresa')?.value != null) {
        if(this.accionForm.get('cuestionario')?.value == null) {
          this.openSnackBar('Debe seleccionar un cuestionario', 'X', 'warn-snackbar');
        } else {
          if(this.accionForm.get('pregunta')?.value == null) {
            this.openSnackBar('Debe seleccionar una pregunta', 'X', 'warn-snackbar');
          };
        }
      }
      return;
    };
    
    let model: Accion = {
      //id_accion: 0,
      id_empresa: this.accionForm.get('empresa')?.value,
      descripcion: this.accionForm.get('accion')?.value,
      id_pregunta: this.accionForm.get('pregunta')?.value,
      id_cuestionario: this.accionForm.get('cuestionario')?.value,
      aprobar: this.accionForm.get('botonesAprobacion')?.value ? 1 : 0,
      incluir_plan_cierre: this.accionForm.get('planCierre')?.value ? 1 : 0,
      incluir_adjuntos: this.accionForm.get('adjuntos')?.value ? 1 : 0,
      asignar_usuario: this.accionForm.get('asignarIncidencia')?.value ? 1 : 0,
      alertar_supervisor: this.accionForm.get('alertarCorreoSupervisor')?.value ? 1 : 0,
      alertar_observaciones: this.accionForm.get('alertarCorreoObservaciones')?.value ? 1 : 0,
      id_estado: this.accionForm.get('estado')?.value
    };
    console.log(model)
    this.accionesService.createAccion(model).subscribe(d => {
      console.log(d);
      this.openSnackBar('Acción asignada correctamente', 'X', 'success-snackbar');
      this.router.navigate(['/dashboard/acciones']);
    });
  }

  empresaChange(event: any) {
    console.log(event.value);
    this.accionForm.get('cuestionario')?.setValue(null);
    this.accionForm.get('cuestionario')?.disable();
    this.accionForm.get('pregunta')?.setValue(null);
    this.accionForm.get('pregunta')?.disable();
    this.accionesService.getPreguntasCriticasPorEmpresa(event.value).subscribe(d => {
      console.log(d);
      this.cuestionarios = d;
      if(this.cuestionarios.length > 0) {
        this.accionForm.get('cuestionario')?.enable();
      } else {
        this.openSnackBar('La empresa seleccionada no posee cuestionarios con preguntas críticas', 'X', 'warn-snackbar');
      }
    })
  }

  cuestionarioChange(event: any) {
    console.log(event.value);
    this.accionForm.get('pregunta')?.setValue(null);
    this.accionForm.get('pregunta')?.disable();
    this.accionesService.getPreguntasCriticasPorCuestionario(event.value).subscribe(d => {
      console.log(d);
      this.preguntas = d;
      if(this.preguntas.length > 0) {
        this.accionForm.get('pregunta')?.enable();
      } else {
        this.openSnackBar('El cuestionario seleccionado no posee preguntas críticas', 'X', 'warn-snackbar');
      }
    })
  }

  openSnackBar(message: string, action: string, className: string) {
    this.snackbar.open(message, action, {horizontalPosition: 'right', verticalPosition: 'top', panelClass: className});
  }

  get colours() {
    return this.stylesService.getStyle()
  }

}
