import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Router } from '@angular/router';

// * Services.
import { AbmCuestionarioService } from '../abm-cuestionario/abm-cuestionario.service';
import { AbmEmpresaService } from '../abm-empresa/abm-empresa.service';
import { FilesService } from 'src/app/services/files.service';
import { GestionIncidenciasService } from './gestion-incidencias.service';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';

// * Forms.
import { FormControl, FormGroup } from '@angular/forms';

// * Material.
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// * Components.
import { GestionIncidenciasModalComponent } from './modal/modal.component';
import { GestionIncidenciasParams } from 'src/app/models/gestion-incidencias';

@Component({
  selector: 'app-gestion-incidencias',
  templateUrl: './gestion-incidencias.component.html',
  styleUrls: ['./gestion-incidencias.component.scss'],
})
export class GestionIncidenciasComponent implements OnInit {
  private rol: number = 0;
  private empresa = {} as any;

  private data$ = [] as Array<any>;

  public titulo: string = 'Incidencias';
  public boton: string = '';
  public seccion: string = 'Gestion incidencias';

  public panelOpenState: boolean = false;
  public empresas$ = [] as Array<{ descripcion: string; id: number }>;
  public estados$: any = [];
  public cuestionarios$: any = [];
  public form!: FormGroup;
  public displayedColumns!: string[];
  public dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) public paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, { static: true })
  public expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) public sort!: MatSort;

  constructor(
    private _styles: StylesService,
    private snackbar: MatSnackBar,
    private _empresas: AbmEmpresaService,
    private _gestiones: GestionIncidenciasService,
    private _cuestionario: AbmCuestionarioService,
    private _file: FilesService,
    private _login: LoginService,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.setForm();
    this.setDisplayedColumns();
  }

  ngOnInit(): void {
    let empresa: string | null = this._login.getEmpresa();
    if (empresa !== null) this.empresa = JSON.parse(empresa);

    let rol: string | null = this._login.getRol();
    if (rol !== null) this.rol = Number(this._login.getRol());

    this.getData();
  }

  public get colours(): any {
    return this._styles.getStyle();
  }

  public clean(): void {
    this.form.reset();
    this.setEmpresa();
  }

  public search(): void {
    let params = this.form.getRawValue();
    Object.keys(params).forEach((key) => {
      if (
        params[key] == null ||
        (typeof params[key] == 'string' && params[key] == '')
      ) {
        delete params[key];
      }
    });

    this.getGestiones(params);
  }

  public empresaChange(event: any): void {
    this.form.get('cuestionario')?.setValue(null);
    this.form.get('cuestionario')?.disable();
    this._cuestionario
      .getCuestionariosByParams({ id_empresa: event.value })
      .subscribe((res: any) => {
        this.cuestionarios$ = res;
        this.form.get('cuestionario')?.enable();
      });
  }

  public downloadPDF(id: any): void {
    this._file.traerArchivo(id, 4).subscribe((res: any) => {
      var file = this._file.b64toBlob(res.file, 'application/pdf');
      var fileURL = URL.createObjectURL(file);
      var a = document.createElement('a');
      a.href = fileURL;
      a.target = '_blank';
      a.download = res.fileName;
      document.body.appendChild(a);
      a.click();
    });
  }

  public downloadExtras(adjunto: any): void {
    this._file.traerArchivo(adjunto.id_file, 6).subscribe((res: any) => {
      var file = this._file.b64toBlob(res.file, 'application/pdf');
      var fileURL = URL.createObjectURL(file);
      var a = document.createElement('a');
      a.href = fileURL;
      a.target = '_blank';
      a.download = res.fileName;
      document.body.appendChild(a);
      a.click();
    });
  }

  public viewPlanCierre(incidencia: any): void {
    const dialogRef = this.dialog.open(
      GestionIncidenciasModalPlanDeCierreComponent,
      {
        width: '40%',
        data: {
          plan: incidencia.incidenciaPlanesCierre[0].plan,
          incidenciaTitulo: incidencia.descripcion_accion,
          fecha: incidencia.fecha_alta,
        },
      }
    );

    dialogRef.afterClosed().subscribe((result) => {});
  }

  public modifyAccion(data: any): void {
    const dialogRef = this.dialog.open(GestionIncidenciasModalComponent, {
      width: '70%',
      data: {
        titulo: data.descripcion_accion,
        id: data.id_incidencia,
        idCuestionario: data.id_cuestionario,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      setTimeout(() => {
        this.ngOnInit();
      }, 200);
      if (result) {
      }
    });
  }

  // ? ¿Se utiliza en algún momento?
  public openSnackBar(
    message: string,
    action: string,
    className: string
  ): void {
    this.snackbar.open(message, action, {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: className,
    });
  }

  private getData(): void {
    if (this.rol > 1) {
      this.getEmpresas(this.empresa.id);
      this.getGestiones({ id_empresa: this.empresa.id });
    } else {
      this.getGestiones();
      this.getEmpresas();
    }
    this.getEstados();
    this.form.get('cuestionario')?.disable();
    this.expansionPanel.open();
  }

  private getEmpresas(id?: number): void {
    let params: { id: number } | null = null;

    if (id) params = { id: id };

    this._empresas.getEmpresas(params).subscribe((res: any) => {
      this.empresas$ = res;
      this.setEmpresa();
    });
  }

  private getGestiones(data?: GestionIncidenciasParams): void {
    let params: GestionIncidenciasParams = {};
    if (data) params = data;
    this._gestiones.getByParams(params).subscribe((res: any) => {
      this.data$ = res;
      this.loadTable();
    });
  }

  private getEstados(): void {
    this._gestiones.getEstados().subscribe((res: any) => {
      this.estados$ = res;
    });
  }

  private loadTable(): void {
    this.dataSource = new MatTableDataSource<any>(this.data$);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.sort.sort({
      id: 'defColumnName',
      start: '',
      disableClear: true,
    });
    this.sort.disableClear = true;
  }

  private setForm(): void {
    this.form = new FormGroup({
      id_empresa: new FormControl(null),
      descripcion: new FormControl(null),
      id_cuestionario: new FormControl(null),
      rut_responsable: new FormControl(null),
      rut_supervisor: new FormControl(null),
      id_estado: new FormControl(null),
      fecha_desde: new FormControl(null),
      fecha_hasta: new FormControl(null),
    });
  }

  private setEmpresa(): void {
    if (this.empresas$) {
      if (this.empresas$.length === 1) {
        this.form.get('id_empresa')?.setValue(this.empresa.id);
        this.form.get('id_empresa')?.disable();
      }
    }
  }

  private setDisplayedColumns(): void {
    this.displayedColumns = [
      'descripcion_empresa',
      'descripcion_accion',
      'descripcion_cuestionario',
      'responsable',
      'supervisor',
      'dias_abierto',
      'fecha_alta',
      'descripcion_estado',
      'acciones',
    ];
  }
}

@Component({
  selector: 'app-modal',
  template: `<h1 mat-dialog-title>
      Plan de Cierre - {{ data.incidenciaTitulo }}
    </h1>
    <h2 mat-dialog-title>{{ data.fecha | fechaRespuestaCuestionario }}</h2>
    <div mat-dialog-content>
      <p>{{ data.plan }}</p>
    </div>
    <div mat-dialog-actions class="flex justify-end gap-4">
      <button
        mat-button
        (click)="onNoClick()"
        [style.background-color]="colours.warnButtonColor"
        class="text-white"
      >
        Cerrar
      </button>
    </div>`,
})
export class GestionIncidenciasModalPlanDeCierreComponent {
  constructor(
    private stylesService: StylesService,
    public dialogRef: MatDialogRef<GestionIncidenciasModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { plan: string; incidenciaTitulo: string; fecha: any }
  ) {}

  public onNoClick(): void {
    this.dialogRef.close(false);
  }

  public get colours(): any {
    return this.stylesService.getStyle();
  }
}
