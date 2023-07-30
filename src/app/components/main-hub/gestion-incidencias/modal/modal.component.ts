import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FilesService } from 'src/app/services/files.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmAccionesService } from '../../abm-acciones/abm-acciones.service';
import { GestionIncidenciasService } from '../gestion-incidencias.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class GestionIncidenciasModalComponent implements OnInit {

  titulo: string = "";

  estados = [] as Array<any>;
  usuarios = [] as Array<any>;
  selectedFile: any = null;

  incidencia: any;
  checks = {
    aprobacion: null,
    usuario: null,
    planCierre: null,
    adjunto: null
  };
  button: boolean = false;
  justificacion: boolean = false;
  fecha: string = "";

  incidenciaForm: FormGroup = new FormGroup({
    estado: new FormControl(null),
    planCierre: new FormControl(null),
    usuario: new FormControl(null),
    justificado: new FormControl(null)
  })

  constructor(
    public dialogRef: MatDialogRef<GestionIncidenciasModalComponent>,
    private stylesService: StylesService,
    @Inject(MAT_DIALOG_DATA) public data: {titulo: string, id: number, idCuestionario: number},
    private fileService: FilesService,
    private gestionIncidenciasService: GestionIncidenciasService,
    private accionesService: AbmAccionesService,
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    this.titulo = this.data.titulo;
    this.gestionIncidenciasService.getById(this.data.id).subscribe(d => {
      console.log(d);
      this.incidencia = d;
      this.fecha = this.incidencia.fecha_alta
      if(d.incidenciaAdjunto.length > 0) {
        this.button = true;
      };
      if(d.incidenciaPlanesCierre.length > 0) {
        this.incidenciaForm.get('planCierre')?.setValue(d.incidenciaPlanesCierre[0].plan);
        this.incidenciaForm.get('planCierre')?.disable();
      };
      this.checks = {
        aprobacion: this.incidencia.accion.aprobar,
        usuario: this.incidencia.accion.asignar_usuario,
        planCierre: this.incidencia.accion.incluir_plan_cierre,
        adjunto: this.incidencia.accion.incluir_adjuntos
      };
      if(this.checks.aprobacion == 1) {
        this.gestionIncidenciasService.getEstadosPermitidosIncidencia(this.data.id).subscribe(d => {
          console.log(d);
          this.estados = d;
          if(this.incidencia.id_estado == 5) {
            this.estados = [{ince_id: 5, ince_descripcion: "Rechazada"}];
            this.incidenciaForm.get('estado')?.setValue(5);
            this.incidenciaForm.get('estado')?.disable();
            if(this.incidencia.motivo_rechazo) {
              this.incidenciaForm.addControl('justificado', new FormControl(this.incidencia.motivo_rechazo, Validators.required));
              this.incidenciaForm.get('justificado')?.disable();
              this.justificacion = true;
            }
            
          }
        });
      };
      if(this.checks.usuario == 1) {
        this.gestionIncidenciasService.getUsersByCuestionarioId(this.data.idCuestionario).subscribe(d => {
          console.log(d);
          this.usuarios = d;
          if(this.incidencia.incidenciaUsuarioAsignado.length > 0) {
            this.incidenciaForm.get('usuario')?.setValue(this.incidencia.incidenciaUsuarioAsignado[0].id_usuario);
            this.incidenciaForm.get('usuario')?.disable();
          }
        })
      };
    });
  }

  onNoClick() {
    this.dialogRef.close(false);
  }

  confirm() {
    if(this.incidenciaForm.invalid) {
      this.incidenciaForm.markAllAsTouched();
      return;
    }
    if(this.checks.aprobacion == 1 && this.incidenciaForm.get('estado')?.value != null && this.estados.length > 0 && this.incidencia.id_estado != 5) {
      //Subir cambios estado
      this.gestionIncidenciasService.postUpdateEstadoIncidencia(this.data.id, this.incidenciaForm.get('estado')?.value, this.incidenciaForm.get('justificado')?.value).subscribe(d => {
        console.log(d);
      });
    };
    if(this.checks.usuario == 1 && this.incidenciaForm.get('usuario')?.value != null) {
      //Subir cambios usuario
      this.gestionIncidenciasService.postIncidenciaUsuarioAsignado({id_incidencia: this.data.id, id_usuario: this.incidenciaForm.get('usuario')?.value}).subscribe(d => {
        console.log(d)
      })
    };
    if(this.checks.planCierre == 1 && this.incidenciaForm.get('planCierre')?.value != null && this.incidencia.incidenciaPlanesCierre.length == 0) {
      //Subir cambios plan de cierre
      this.gestionIncidenciasService.postIncidenciaPlanCierre({id_incidencia: this.data.id, plan: this.incidenciaForm.get('planCierre')?.value}).subscribe(d => {
        console.log(d)
      })
    };
    if(this.checks.adjunto == 1 && this.selectedFile != null && this.incidencia.incidenciaAdjunto.length == 0) {
      //Subir archivo adjunto
      console.log(this.selectedFile);
      this.fileService.subirArchivo(this.selectedFile, 6, this.data.id).subscribe(res => {
        console.log(res)
      });
    };
    this.dialogRef.close(true);
  }

  uploadFile() {
    //Determinar id a guardar - 6
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
          //this.imgSrc = url;
        }
    };
    input.click();
  }

  estadoChange(event: any) {
    console.log(event.value);
    if(event.value == 5) {
      this.incidenciaForm.addControl('justificado', new FormControl(null, Validators.required));
      this.justificacion = true;
    } else {
      this.justificacion = false;
      this.incidenciaForm.removeControl('justificado');
    }
  }

  get colours() {
    return this.stylesService.getStyle()
  }

}
