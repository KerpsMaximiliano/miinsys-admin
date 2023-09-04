import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

// * Services.
import { AbmCuestionarioService } from '../abm-cuestionario/abm-cuestionario.service';
import { AbmEmpresaService } from '../abm-empresa/abm-empresa.service';
import { FilesService } from 'src/app/services/files.service';
import { LoginService } from 'src/app/services/login.service';
import { RespuestasCuestionariosService } from './respuestas-cuestionarios.service';
import { StylesService } from 'src/app/services/styles.service';

// * Interfaces.
import { Estado } from 'src/app/models/abm';

// * Forms.
import { FormGroup, FormControl } from '@angular/forms';

// * Material.
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-respuestas-cuestionarios',
  templateUrl: './respuestas-cuestionarios.component.html',
  styleUrls: ['./respuestas-cuestionarios.component.scss'],
})
export class RespuestasCuestionariosComponent implements OnInit {
  private rol: number = 0;
  private empresa = {} as any;
  private data = [] as Array<any>;

  public titulo: string = 'Respuestas';
  public boton: string = '';
  public seccion: string = 'Respuestas Cuestionarios';

  public panelOpenState: boolean = false;
  public form!: FormGroup;
  public empresas$ = [] as Array<{ descripcion: string; id: number }>;
  public estados$ = [] as Array<Estado>;

  public dynamicForm!: FormGroup;

  public cuestionariosFiltrados = [] as Array<any>;
  public cuestionarioSeleccionado = [] as Array<any>;
  public cuestionarioIdSeleccionado: number = 0;
  public cuestionarioIdSeccion: number = 0;
  public empresaSeleccionada: number = 0;

  public displayedColumns!: string[];
  public dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) public paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, { static: true })
  public expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) public sort!: MatSort;

  constructor(
    private _cuestionario: AbmCuestionarioService,
    private _empresas: AbmEmpresaService,
    private _file: FilesService,
    private _login: LoginService,
    private _respuestaCuestionario: RespuestasCuestionariosService,
    private _styles: StylesService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {
    this.form = new FormGroup({
      descripcion: new FormControl(null),
      id_empresa: new FormControl(null),
      rut: new FormControl(null),
    });

    this.dynamicForm = new FormGroup({
      control1: new FormControl(null),
      control2: new FormControl(null),
      control3: new FormControl(null),
    });

    this.displayedColumns = [
      'descripcion',
      'fechaCarga',
      'descripcion_empresa',
      'respuestas_positivas',
      'respuestas_negativas',
      'rut',
      'acciones',
    ];
  }

  ngOnInit(): void {
    let empresa: string | null = this._login.getEmpresa();
    if (empresa !== null) this.empresa = JSON.parse(empresa);

    let rol: string | null = this._login.getRol();
    if (rol !== null) this.rol = Number(this._login.getRol());

    if (this.rol > 1) {
      this.getEmpresa({ id: this.empresa.id });
      this.empresaSeleccionada = this.empresa.id;
    } else {
      this.getEmpresa(null);
    }

    this.getCuestionarios({});

    this.estados$ = JSON.parse(localStorage.getItem('estados')!);

    this.expansionPanel.open();
  }

  public get colours(): any {
    return this._styles.getStyle();
  }

  public open(row: any): void {
    this.router.navigate([
      `dashboard/respuestas/${row.id_respuesta_cuestionario}`,
    ]);
  }

  //FILTRADO DINAMICO
  public cleanSearch(): void {
    if (this.empresas$.length > 1) this.empresaSeleccionada = 0;

    this.clearForm();

    this.cuestionariosFiltrados = [];
    this.cuestionarioSeleccionado = [];
    this.cuestionarioIdSeleccionado = 0;
    this.cuestionarioIdSeccion = 0;

    this.getCuestionarios({});
  }

  public empresaChange(event: any): void {
    this.cuestionariosFiltrados = [];
    this.cuestionarioSeleccionado = [];
    this.cuestionarioIdSeleccionado = 0;
    this.cuestionarioIdSeccion = 0;

    this.clearForm();

    let filter = this.data.filter((cue) => cue.id_empresa == event.value);

    filter.forEach((cue) => {
      let find = this.cuestionariosFiltrados.find(
        (c) => c.cuestionarioId == cue.cuestionarioId
      );

      if (find == undefined) {
        this.cuestionariosFiltrados.push({
          cuestionarioId: cue.cuestionarioId,
          descripcion: cue.descripcion,
        });
      }
    });
  }

  public cuestionarioChange(event: any): void {
    this.clearForm();
    this.cuestionarioIdSeleccionado = event.value;
    this._cuestionario
      .getCreatedEnabledCuestionario(event.value)
      .subscribe((d) => {
        let tempCuestionario = [] as Array<any>;
        this.cuestionarioIdSeccion = d.secciones.find(
          (sec: { orden: number }) => sec.orden == 0
        ).sec_id;
        tempCuestionario = d.secciones.find(
          (sec: { orden: number }) => sec.orden == 0
        ).preguntas;
        tempCuestionario = tempCuestionario.filter(
          (pre) =>
            pre.tpr_id != 13 &&
            pre.tpr_id != 14 &&
            pre.tpr_id != 15 &&
            pre.tpr_id != 12 &&
            pre.tpr_id != 10
        );
        tempCuestionario.forEach((pre: { tpr_id: number; pre_id: any }) => {
          if (pre.tpr_id == 9) {
            this.dynamicForm.addControl(
              `control${pre.pre_id}-start`,
              new FormControl(null)
            );
            this.dynamicForm.addControl(
              `control${pre.pre_id}-end`,
              new FormControl(null)
            );
          } else {
            this.dynamicForm.addControl(
              `control${pre.pre_id}`,
              new FormControl(null)
            );
          }
        });
        this.dynamicForm.updateValueAndValidity();
        setTimeout(() => {
          this.cuestionarioSeleccionado = tempCuestionario;
          this.cdRef.detectChanges();
        }, 50);
      });
  }

  public searchDynamic(): void {
    if (this.cuestionarioIdSeleccionado == 0 && this.empresaSeleccionada != 0)
      this.getCuestionarios({ id_empresa: this.empresaSeleccionada });

    let filter = this.data.filter(
      (cue) => cue.cuestionarioId == this.cuestionarioIdSeleccionado
    );

    let respuestasDynamic = [] as Array<any>;
    let totalCalls = 0;

    filter.forEach((resp) => {
      this._respuestaCuestionario
        .getRespuesta(resp.id_respuesta_cuestionario)
        .subscribe((d) => {
          respuestasDynamic.push(d);
          totalCalls++;
          let dataToPush = [] as Array<any>;
          respuestasDynamic.forEach((cues) => {
            let match = 0;
            cues.secciones
              .find(
                (sec: { seccionId: number }) =>
                  sec.seccionId == this.cuestionarioIdSeccion
              )
              .preguntas.forEach(
                (pre: {
                  preguntaTipo: number;
                  preguntaOpcion: number | null;
                  preguntaId: any;
                  preguntaValor: string | null;
                }) => {
                  if (
                    pre.preguntaTipo != 9 &&
                    pre.preguntaTipo != 10 &&
                    pre.preguntaTipo != 12 &&
                    pre.preguntaTipo != 13 &&
                    pre.preguntaTipo != 14 &&
                    pre.preguntaTipo != 15
                  ) {
                    if (
                      this.dynamicForm.get(`control${pre.preguntaId}`)?.value ==
                        null ||
                      this.dynamicForm.get(`control${pre.preguntaId}`)?.value ==
                        ''
                    ) {
                      match++;
                    } else if (
                      pre.preguntaValor ==
                      this.dynamicForm
                        .get(`control${pre.preguntaId}`)
                        ?.value.toString()
                    ) {
                      match++;
                    }
                  } else if (pre.preguntaTipo == 9) {
                    if (
                      (this.dynamicForm.get(`control${pre.preguntaId}-start`)
                        ?.value == null ||
                        this.dynamicForm.get(`control${pre.preguntaId}-start`)
                          ?.value == '') &&
                      (this.dynamicForm.get(`control${pre.preguntaId}-end`)
                        ?.value == null ||
                        this.dynamicForm.get(`control${pre.preguntaId}-end`)
                          ?.value == '')
                    ) {
                      match++;
                      match++;
                    } else {
                      let startDate = new Date(
                        this.dynamicForm.get(
                          `control${pre.preguntaId}-start`
                        )?.value
                      );
                      let endDate = new Date(
                        this.dynamicForm.get(
                          `control${pre.preguntaId}-end`
                        )?.value
                      );
                      let preguntaValor = pre.preguntaValor
                        ?.split(',')[0]
                        .split('-');
                      let date = new Date(
                        preguntaValor![1] +
                          '-' +
                          preguntaValor![0] +
                          '-' +
                          preguntaValor![2]
                      );
                      if (date >= startDate && date <= endDate) {
                        match++;
                        match++;
                      }
                    }
                  }
                }
              );
            if (match == Object.keys(this.dynamicForm.controls).length) {
              dataToPush.push(
                this.data.find(
                  (cue) =>
                    cue.id_respuesta_cuestionario ==
                    cues.id_respuesta_cuestionario
                )
              );
            }
          });

          if (filter.length == totalCalls) this.loadTable(dataToPush);
        });
    });
  }

  public downloadPdf(row: any): void {
    this._file.traerArchivo(row.id_imagen, 4).subscribe((d) => {
      var file = this._file.b64toBlob(d.file, 'application/pdf');
      var fileURL = URL.createObjectURL(file);
      var a = document.createElement('a');
      a.href = fileURL;
      a.target = '_blank';
      a.download = d.fileName;
      document.body.appendChild(a);
      a.click();
    });
  }

  private getEmpresa(id: { id: number } | null): void {
    this._empresas.getEmpresas(id).subscribe((res: any) => {
      this.empresas$ = res;
      // this.filtrar();
    });
  }

  private getCuestionarios(params: any): void {
    this._respuestaCuestionario
      .getCuestionariosByParams(params)
      .subscribe((res: any) => {
        this.data = res;
        this.filtrar();
      });
  }

  private filtrar(): void {
    if (this.rol > 1) {
      this.empresas$ = this.empresas$.filter(
        (emp: any) => emp.id == this.empresa.id
      );
      this.data = this.data.filter(
        (emp: any) => emp.descripcion_empresa == this.empresa.nombre
      );

      this.cuestionariosFiltrados = [];
      this.cuestionarioSeleccionado = [];
      this.cuestionarioIdSeleccionado = 0;
      this.cuestionarioIdSeccion = 0;

      this.clearForm();

      let filter = this.data.filter((cue) => cue.id_empresa == this.empresa.id);

      filter.forEach((cue) => {
        let find = this.cuestionariosFiltrados.find(
          (c) => c.cuestionarioId == cue.cuestionarioId
        );

        if (find == undefined) {
          this.cuestionariosFiltrados.push({
            cuestionarioId: cue.cuestionarioId,
            descripcion: cue.descripcion,
          });
        }
      });
    }

    this.data = this.data.reverse();
    this.loadTable(this.data);
  }

  private clearForm(): void {
    if (Object.keys(this.dynamicForm.controls).length > 0) {
      Object.keys(this.dynamicForm.controls).forEach((key) => {
        this.dynamicForm.removeControl(key);
      });
    }
  }

  private setEmpresa(): void {
    if (this.empresas$) {
      if (this.empresas$.length === 1) {
        // this.form.get('id_empresa')?.setValue(this.empresa.id);
        // this.form.get('id_empresa')?.disable();
      }
    }
  }

  private loadTable(data: any): void {
    this.dataSource = new MatTableDataSource<any>(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.sort.sort({
      id: 'defColumnName',
      start: '',
      disableClear: true,
    });
    this.sort.disableClear = true;
  }
}
