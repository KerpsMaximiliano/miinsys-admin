import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Estado, Grupo, Planta } from 'src/app/models/abm';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { ButtonsEventService } from '../../buttons-event.service';
import { AbmCuestionarioService } from '../abm-cuestionario.service';
import { CuestionarioInicial } from 'src/app/models/cuestionario';

@Component({
  selector: 'app-nuevo',
  templateUrl: './nuevo.component.html',
  styleUrls: ['./nuevo.component.scss']
})
export class AbmCuestionarioNuevoComponent implements OnInit, OnDestroy {
  titulo: string = "Nuevo cuestionario";
  boton: string = "Guardar cuestionario";
  seccion: string = "Cuestionarios";

  suscripcion: Subscription;
  empresas = [] as Array<{descripcion: string; id: number}>;
  estados = [] as Array<Estado>;

  rolUsuario: number = 0;
  empresaUsuario = {} as any;

  plantas = [] as Array<Planta>;
  grupos = [] as Array<Grupo>;

  selectedEmpresa: string = "";

  cuestionarioForm: FormGroup = new FormGroup({
    nombre: new FormControl(null, Validators.required),
    empresa: new FormControl(null, Validators.required),
    planta: new FormControl({value: null, disabled: true}, Validators.required),
    grupo: new FormControl({value: null, disabled: true}, Validators.required),
    estado: new FormControl(null, Validators.required),
    usuario: new FormControl(this.loginService.getUser()!),
    orden: new FormControl(null, Validators.required),
    planificado: new FormControl(false)
  });

  constructor(
    private stylesService: StylesService,
    private router: Router,
    private buttonsEventService: ButtonsEventService,
    private empresasService: AbmEmpresaService,
    private loginService: LoginService,
    private snackbar: MatSnackBar,
    private cuestionarioService: AbmCuestionarioService
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
      this.empresasService.getEmpresas({id: this.empresaUsuario.id, id_estado: 1}).subscribe(d => {
        this.empresas = d;
      });
    } else {
      this.empresasService.getEmpresas({id_estado: 1}).subscribe(d => {
        this.empresas = d;
      });
    };
    this.estados = JSON.parse(localStorage.getItem('estados')!);
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  save() {
    if(this.cuestionarioForm.invalid) {
      this.cuestionarioForm.markAllAsTouched();
      return;
    };
    this.cuestionarioForm.updateValueAndValidity();
    console.log(this.cuestionarioForm.getRawValue());
    this.cuestionarioService.setMode("Edit")
    this.cuestionarioService.setCuestionario(this.cuestionarioForm.getRawValue());
    let model: CuestionarioInicial = {
      descripcion: this.cuestionarioForm.get('nombre')?.value,
      id_estado: this.cuestionarioForm.get('estado')?.value,
      rut_usuario_alta: Number(this.loginService.getUser()),
      id_empresa: this.cuestionarioForm.get('empresa')?.value,
      orden: this.cuestionarioForm.get('orden')?.value,
      planificado: this.cuestionarioForm.get('planificado')?.value == true ? 1 : 0
    };
    if(this.cuestionarioForm.get('planta')?.value != null) {
      Object.assign(model, {id_planta: this.cuestionarioForm.get('planta')?.value});
    };
    if(this.cuestionarioForm.get('grupo')?.value != null) {
      Object.assign(model, {id_grupo: this.cuestionarioForm.get('grupo')?.value});
    };
    this.cuestionarioService.createInitialCuestionario(model).subscribe(d => {
      this.openSnackBar(d.message, 'X', 'success-snackbar');
      this.router.navigate(['/dashboard/cuestionario/' + d.id]);
    })
  }

  filtrar() {
    if(this.rolUsuario > 1) {
      this.empresas = this.empresas.filter(e => e.id == this.empresaUsuario.id);
    }
  }

  empresaChange(event: any) {
    this.selectedEmpresa = this.empresas.find(x => x.id == event.value)!.descripcion
    this.empresasService.getPlantas(event.value).subscribe(d => {
      this.plantas = d.filter((pl: { id_estado: number; }) => pl.id_estado == 1);
      this.cuestionarioForm.get('planta')?.setValue(null);
      console.log(this.plantas);
      if(this.plantas.length > 0) {
        this.cuestionarioForm.get('planta')?.enable();
      } else {
        this.cuestionarioForm.get('planta')?.disable();
      }
    });
    this.empresasService.getGrupos(event.value).subscribe(d => {
      this.grupos = d;
      this.cuestionarioForm.get('grupo')?.setValue(null);
      console.log(this.grupos);
      if(this.grupos.length > 0) {
        this.cuestionarioForm.get('grupo')?.enable();
      } else {
        this.cuestionarioForm.get('grupo')?.disable();
      }
    })
  }

  openSnackBar(message: string, action: string, className: string) {
    this.snackbar.open(message, action, {horizontalPosition: 'right', verticalPosition: 'top', panelClass: className});
  }

  get colours() {
    return this.stylesService.getStyle();
  }

}
