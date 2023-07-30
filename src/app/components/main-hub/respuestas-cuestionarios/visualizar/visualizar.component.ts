import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RespuestasCuestionariosModalComponent } from '../modal/modal.component';
import { RespuestasCuestionariosService } from '../respuestas-cuestionarios.service';

interface ModeloCuestionario {
  descripcion_cuestionario: string,
  id_cuestionario: number,
  id_estado: number,
  orden: 1,
  secciones: Array<ModeloSeccion>
}

interface ModeloSeccion {
  cue_id: number,
  orden: number,
  sec_descripcion: string,
  sec_id: number,
  preguntas: Array<ModeloPretunta>
}

interface ModeloPretunta {
  pre_descripcion: string,
  pre_id: number,
  sec_id: number,
  tpr_id: number,
  validators: Array<ModeloValidator>,
  opciones: Array<ModeloOpcion>
}

interface ModeloOpcion {
  opc_descripcion: string,
  opc_id: number,
  opc_orden: number,
  opc_valor: number,
  pre_id: number
}

interface ModeloValidator {
  Message: string,
  Value: string,
  id_pregunta_validacion: number,
  id_validacion: number
}

interface TablaRespuesta {
  tipo: number,
  descripcion: string,
  valor: string,
  imgId: number,
  preId: number
}

interface TablaSeccion {
  seccionId: number,
  orden: number,
  preguntas: Array<TablaRespuesta>
}

interface Respuesta {
  cuestionarioId: number,
  fechaCarga: string,
  id_respuesta_cuestionario: number,
  latitud: string,
  longitud: string,
  rut: number,
  secciones: Array<{
    seccionId: number,
    preguntas: Array<{
      preguntaId: number,
      preguntaImagenId: number,
      preguntaOpcion: number,
      preguntaTipo: number,
      preguntaValor: string
    }>
  }>
}

@Component({
  selector: 'app-respuesta-cuestionario-visualizar',
  templateUrl: './visualizar.component.html',
  styleUrls: ['./visualizar.component.scss']
})
export class RespuestasCuestionarioVisualizarComponent implements OnInit {

  titulo: string = "Respuesta";
  boton: string = "";
  seccion: string = "Respuestas Cuestionarios";

  respuestaCuestionarioId!: number;
  cuestionarioId!: number;
  modeloCuestionario = {} as ModeloCuestionario;
  modeloRespuestas = {} as Respuesta;

  cabeceraSecId: number = 0;

  datosUsuarioForm: FormGroup = new FormGroup({
    rut: new FormControl(null),
    ubicacion: new FormControl(null),
    fechaCarga: new FormControl(null)
  });

  tablaRespuestas = [] as Array<TablaSeccion>;
  dataSource!: Array<{}>;

  constructor(
    private respuestasCuestionarioService: RespuestasCuestionariosService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.respuestaCuestionarioId = this.activatedRoute.snapshot.params['respuestaCuestionarioId'];

    this.respuestasCuestionarioService.getRespuesta(this.respuestaCuestionarioId).subscribe(res => {
      console.log(res);
      this.cuestionarioId = res.cuestionarioId;
      this.modeloRespuestas = res;
      if(Number(res.latitud) != 0 && Number(res.longitud) != 0) {
        this.respuestasCuestionarioService.getLocation(Number(res.latitud), Number(res.longitud)).subscribe(d => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(d, 'text/xml');
          this.datosUsuarioForm.patchValue({
            rut: res.rut,
            ubicacion: `${xmlDoc.getElementsByTagName('addressparts')[0].getElementsByTagName('city')[0].innerHTML}, ${xmlDoc.getElementsByTagName('addressparts')[0].getElementsByTagName('state')[0].innerHTML}`,
            fechaCarga: this.formatDate(res.fechaCarga)
          });
          this.datosUsuarioForm.disable();
        });
      } else {
        this.datosUsuarioForm.patchValue({
          rut: res.rut,
          ubicacion: `No se pudo recuperar la ubicación`,
          fechaCarga: this.formatDate(res.fechaCarga)
        });
        this.datosUsuarioForm.disable();
      }

      this.respuestasCuestionarioService.getCuestionario(this.cuestionarioId).subscribe(d => {
        this.modeloCuestionario = d;
        console.log(this.modeloCuestionario);
        this.dataSource = this.modeloCuestionario.secciones.find(sec => sec.orden == 0)!.preguntas;
        console.log(this.dataSource);
        this.tableDataChange();
        this.cabeceraSecId = this.modeloCuestionario.secciones.find(sec => sec.orden == 0)!.sec_id;
        this.modeloCuestionario.secciones.sort(function(a, b){return a.orden - b.orden});
      })
    })
  }

  formatDate(date: string) {
    return `${date.split('T')[0]} / ${date.split('T')[1].split(':')[0]}:${date.split('T')[1].split(':')[1]}`
  }

  changeSeccion(value: number) {
    let model = this.tablaRespuestas.find(sec => sec.seccionId == value)!;
    this.dataSource = [];
    model.preguntas.forEach(pre => {
      console.log(pre)
      this.dataSource.push({
        descripcion: pre.descripcion,
        tipo: pre.tipo,
        valor: pre.valor,
        imgId: pre.imgId,
        preId: pre.preId
      })
    });
    this.dataSource = [...this.dataSource];
    console.log(this.dataSource)
  }

  open(row: any) {
    console.log(row)
    const dialogRef = this.dialog.open(RespuestasCuestionariosModalComponent, {
      maxHeight: '85vh',
      height: 'auto',
      data: {id: row.imgId, type: "img"}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      console.log(row);
    });
  }

  openJustification(row: any) {
    console.log(row)
    const dialogRef = this.dialog.open(RespuestasCuestionariosModalComponent, {
      maxHeight: '85vh',
      height: 'auto',
      data: {id: row.imgId, type: "text"}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      console.log(row);
    });
  }

  openLista(row: any) {
    console.log(row);
    console.log(Number(this.respuestaCuestionarioId));
    const dialogRef = this.dialog.open(RespuestasCuestionariosModalComponent, {
      maxHeight: '85vh',
      height: 'auto',
      data: {id: row.imgId, type: "list", preguntaId: row.preId, respuestaCuestionarioId: this.respuestaCuestionarioId}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      console.log(row);
    });
  }

  tableDataChange() {
    this.modeloCuestionario.secciones.forEach(sec => {
      let modelSeccion = {
        seccionId: sec.sec_id,
        orden: sec.orden,
        preguntas: [] as Array<TablaRespuesta>
      };
      sec.preguntas.forEach(pre => {
        if (this.modeloRespuestas.secciones.find(s => s.seccionId == modelSeccion.seccionId) != undefined) {
          if(this.modeloRespuestas.secciones.find(s => s.seccionId == modelSeccion.seccionId)!.preguntas.find(p => p.preguntaId == pre.pre_id) != undefined) {
            let modelPregunta: TablaRespuesta = {
              tipo: pre.tpr_id,
              descripcion: pre.pre_descripcion,
              preId: pre.pre_id,
              valor: this.modeloRespuestas.secciones.find(s => s.seccionId == modelSeccion.seccionId)!.preguntas.find(p => p.preguntaId == pre.pre_id)!.preguntaValor,
              imgId: this.modeloRespuestas.secciones.find(s => s.seccionId == modelSeccion.seccionId)!.preguntas.find(p => p.preguntaId == pre.pre_id)!.preguntaImagenId,
            };
            if(pre.tpr_id == 10 || pre.tpr_id == 15) {
              modelPregunta.valor = pre.opciones.find(o => o.opc_valor == Number(modelPregunta.valor))!.opc_descripcion;
            }
            modelSeccion.preguntas.push(modelPregunta);
          }
        }
      });
      this.tablaRespuestas.push(modelSeccion);
    });

    //this.changeSeccion(this.tablaRespuestas[0].seccionId);
    this.changeSeccion(this.tablaRespuestas.find(res => res.orden == 0)!.seccionId);
  }

}
