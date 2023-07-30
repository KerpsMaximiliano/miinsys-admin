import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Estado } from 'src/app/models/abm';
import { FilesService } from 'src/app/services/files.service';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmCuestionarioService } from '../abm-cuestionario/abm-cuestionario.service';
import { AbmEmpresaService } from '../abm-empresa/abm-empresa.service';
import { AbmUsuarioService } from '../abm-usuario/abm-usuario.service';
import { ButtonsEventService } from '../buttons-event.service';
import { RespuestasCuestionariosService } from './respuestas-cuestionarios.service';

@Component({
  selector: 'app-respuestas-cuestionarios',
  templateUrl: './respuestas-cuestionarios.component.html',
  styleUrls: ['./respuestas-cuestionarios.component.scss']
})
export class RespuestasCuestionariosComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, {static: true}) expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) sort!: MatSort;

  titulo: string = "Respuestas";
  boton: string = "";
  seccion: string = "Respuestas Cuestionarios";

  estados = [] as Array<Estado>;
  empresas = [] as Array<{descripcion: string; id: number}>;

  panelOpenState: boolean = false;

  searchForm: FormGroup = new FormGroup({
    descripcion: new FormControl(null),
    id_empresa: new FormControl(null),
    rut: new FormControl(null)
    //fechaCarga: new FormControl(null),
    //id_estado: new FormControl(null)
  });

  dynamicForm: FormGroup = new FormGroup({
    control1: new FormControl(null),
    control2: new FormControl(null),
    control3: new FormControl(null)
  });

  displayedColumns = ['descripcion', 'fechaCarga', 'descripcion_empresa', 'respuestas_positivas', 'respuestas_negativas', 'rut', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  data = [] as Array<any>;

  rolUsuario: number = 0;
  empresaUsuario = {} as any;

  cuestionariosFiltrados = [] as Array<any>;
  cuestionarioSeleccionado = [] as Array<any>;
  cuestionarioIdSeleccionado: number = 0;
  cuestionarioIdSeccion: number = 0;
  empresaSeleccionada: number = 0;

  constructor(
    private stylesService: StylesService,
    private router: Router,
    private buttonsEventService: ButtonsEventService,
    private abmUsuarioService: AbmUsuarioService,
    private empresasService: AbmEmpresaService,
    private respuestaCuestionarioService: RespuestasCuestionariosService,
    private loginService: LoginService,
    private cuestionarioService: AbmCuestionarioService,
    private cdRef:ChangeDetectorRef,
    private fileService: FilesService
  ) {}

  ngOnInit(): void {
    this.rolUsuario = Number(this.loginService.getRol());
    this.empresaUsuario = JSON.parse(this.loginService.getEmpresa()!);
    if(this.rolUsuario > 1) {
      this.empresasService.getEmpresas({id: this.empresaUsuario.id}).subscribe(d => {
        this.empresas = d;
      });
    } else {
      this.empresasService.getEmpresas(null).subscribe(d => {
        this.empresas = d;
      });
    };
    this.respuestaCuestionarioService.getCuestionariosByParams({}).subscribe(d => {
      this.data = d;
      console.log(d);
      this.filtrar();
    });
    this.estados = JSON.parse(localStorage.getItem('estados')!);
    this.expansionPanel.open();
  }

  clean() {
    this.searchForm.reset();
  }

  search() {
    let params = this.searchForm.getRawValue();
    console.log(params)
    Object.keys(params).forEach(key => {
      if(params[key] == null || (typeof params[key] == 'string' && params[key] == '')) {
        delete params[key]
      }
    });
    this.respuestaCuestionarioService.getCuestionariosByParams(params).subscribe(d => {
      this.data = d;
      this.filtrar();
    })
  }

  open(row: any) {
    console.log(row)
    this.router.navigate(['dashboard/respuestas/' + row.id_respuesta_cuestionario]);
  }

  filtrar() {
    if(this.rolUsuario > 1) {
      this.data = this.data.filter(res => res.descripcion_empresa == this.empresaUsuario.nombre);
    };
    this.data = this.data.reverse();
    this.loadTable(this.data);
  }

  loadTable(data: any) {
    this.dataSource = new MatTableDataSource<any>(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.sort.sort({
      id: 'defColumnName',
      start: '',
      disableClear: true
    });
    this.sort.disableClear = true;
  }

  //FILTRADO DINAMICO
  cleanSearch() {
    this.empresaSeleccionada = 0;
    this.clearForm();
    let model = {
      value: 0
    }
    //this.empresaChange(model);
    this.cuestionariosFiltrados = [];
    this.cuestionarioSeleccionado = [];
    this.cuestionarioIdSeleccionado = 0;
    this.cuestionarioIdSeccion = 0;
    this.respuestaCuestionarioService.getCuestionariosByParams({}).subscribe(d => {
      this.data = d;
      console.log(d);
      this.filtrar();
    });
  }

  empresaChange(event: any) {
    this.cuestionariosFiltrados = [];
    this.cuestionarioSeleccionado = [];
    this.cuestionarioIdSeleccionado = 0;
    this.cuestionarioIdSeccion = 0;
    this.clearForm();
    let filter = this.data.filter(cue => cue.id_empresa == event.value);
    filter.forEach(cue => {
      let find = this.cuestionariosFiltrados.find(c => c.cuestionarioId == cue.cuestionarioId);
      if(find == undefined) {
        this.cuestionariosFiltrados.push({
          cuestionarioId: cue.cuestionarioId,
          descripcion: cue.descripcion
        });
      }
    });
    console.log(this.cuestionariosFiltrados);
  }

  cuestionarioChange(event: any) {
    this.clearForm();
    console.log(event.value);
    this.cuestionarioIdSeleccionado = event.value;
    this.cuestionarioService.getCreatedEnabledCuestionario(event.value).subscribe(d => {
      let tempCuestionario = [] as Array<any>;
      this.cuestionarioIdSeccion = d.secciones.find((sec: { orden: number; }) => sec.orden == 0).sec_id;
      tempCuestionario = d.secciones.find((sec: { orden: number; }) => sec.orden == 0).preguntas;
      tempCuestionario = tempCuestionario.filter(pre => pre.tpr_id != 13 && pre.tpr_id != 14 && pre.tpr_id != 15 && pre.tpr_id != 12 && pre.tpr_id != 10);
      console.log(tempCuestionario);
      tempCuestionario.forEach((pre: { tpr_id: number; pre_id: any; }) => {
        if(pre.tpr_id == 9) {
          this.dynamicForm.addControl(`control${pre.pre_id}-start`, new FormControl(null));
          this.dynamicForm.addControl(`control${pre.pre_id}-end`, new FormControl(null));
        } else {
          this.dynamicForm.addControl(`control${pre.pre_id}`, new FormControl(null));
        }
      });
      this.dynamicForm.updateValueAndValidity();
      console.log(this.dynamicForm.controls);
      setTimeout(() => {
        this.cuestionarioSeleccionado = tempCuestionario;
        this.cdRef.detectChanges();
      }, 50);
    })
  }

  clearForm() {
    if(Object.keys(this.dynamicForm.controls).length > 0) {
      Object.keys(this.dynamicForm.controls).forEach(key => {
        this.dynamicForm.removeControl(key)
      })
    }
  }

  searchDynamic() {
    console.log(`Cuestionario Id ${this.cuestionarioIdSeleccionado}`);
    console.log(this.cuestionarioSeleccionado);
    if(this.cuestionarioIdSeleccionado == 0 && this.empresaSeleccionada != 0) {
      this.respuestaCuestionarioService.getCuestionariosByParams({id_empresa: this.empresaSeleccionada}).subscribe(d => {
        this.data = d;
        console.log(d);
        this.filtrar();
      });
    }
    // Object.keys(this.dynamicForm.controls).forEach(key => {
    //   console.log(this.dynamicForm.get(key)!.value)
    // });
    let filter = this.data.filter(d => d.cuestionarioId == this.cuestionarioIdSeleccionado);
    console.log(filter);
    let respuestasDynamic = [] as Array<any>;
    let totalCalls = 0;
    filter.forEach(resp => {
      this.respuestaCuestionarioService.getRespuesta(resp.id_respuesta_cuestionario).subscribe(d => {
        respuestasDynamic.push(d);
        totalCalls++;
        let dataToPush = [] as Array<any>;
          console.log(this.cuestionarioIdSeccion)
          respuestasDynamic.forEach(cues => {
            let match = 0;
            cues.secciones.find((sec: { seccionId: number; }) => sec.seccionId == this.cuestionarioIdSeccion).preguntas.forEach((pre: { preguntaTipo: number; preguntaOpcion: number | null; preguntaId: any; preguntaValor: string | null; }) => {
              if(pre.preguntaTipo != 9 && pre.preguntaTipo != 10 && pre.preguntaTipo != 12 && pre.preguntaTipo != 13 && pre.preguntaTipo != 14 && pre.preguntaTipo != 15) {
                if(this.dynamicForm.get(`control${pre.preguntaId}`)?.value == null || this.dynamicForm.get(`control${pre.preguntaId}`)?.value == '') {
                  match++;
                } else if (pre.preguntaValor == this.dynamicForm.get(`control${pre.preguntaId}`)?.value.toString()) {
                  match++;
                }
              } else if(pre.preguntaTipo == 9) {
                if((this.dynamicForm.get(`control${pre.preguntaId}-start`)?.value == null || this.dynamicForm.get(`control${pre.preguntaId}-start`)?.value == '') &&  (this.dynamicForm.get(`control${pre.preguntaId}-end`)?.value == null || this.dynamicForm.get(`control${pre.preguntaId}-end`)?.value == '')) {
                  match++;
                  match++;
                } else {
                  let startDate = new Date(this.dynamicForm.get(`control${pre.preguntaId}-start`)?.value);
                  let endDate = new Date(this.dynamicForm.get(`control${pre.preguntaId}-end`)?.value);
                  let preguntaValor = pre.preguntaValor?.split(',')[0].split('-');
                  let date = new Date(preguntaValor![1] + '-' + preguntaValor![0] + '-' + preguntaValor![2]);
                  if(date >= startDate && date <= endDate) {
                    match++;
                    match++;
                  }
                }
              }
            });
            console.log(match)
            if(match == Object.keys(this.dynamicForm.controls).length) {
              dataToPush.push(this.data.find(cue => cue.id_respuesta_cuestionario == cues.id_respuesta_cuestionario));
            }
          });
        if(filter.length == totalCalls) {
          this.loadTable(dataToPush);
        }
      })
    })
  }

  downloadPdf(row: any) {
    console.log(row);
    this.fileService.traerArchivo(row.id_imagen, 4).subscribe(d => {
      var file = this.fileService.b64toBlob(d.file, 'application/pdf');
      var fileURL = URL.createObjectURL(file);
      //window.open(fileURL);
      var a = document.createElement('a');
      a.href = fileURL;
      a.target = '_blank';
      a.download = d.fileName;
      document.body.appendChild(a);
      a.click();
    })
  }

  get colours() {
    return this.stylesService.getStyle()
  }

}
