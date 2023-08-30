import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

// * Services.
import { FilesService } from 'src/app/services/files.service';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { ButtonsEventService } from '../../buttons-event.service';
import { AbmActividadService } from '../abm-actividad/abm-actividad.service';
import { PlanificacionService } from './planificacion.service';

// * Forms.
import { FormGroup, FormControl } from '@angular/forms';

// * Material.
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// * Interfaces.
import { PlanificacionParams } from 'src/app/models/abm';

@Component({
  selector: 'app-planificacion',
  templateUrl: './planificacion.component.html',
  styleUrls: ['./planificacion.component.scss'],
})
export class PlanificacionComponent implements OnInit {
  suscripcion: Subscription;

  private rol: number = 0;
  private empresa: any;
  private data = [] as Array<any>;

  public formGroup!: FormGroup;
  public empresas$ = [] as Array<{ descripcion: string; id: number }>;
  public estados$ = [] as Array<any>;
  public panelOpenState: boolean = false;

  public displayedColumns = [
    'descripcion_actividad',
    'descripcion_empresa',
    'descripcion_cuestionario',
    'rut_supervisor',
    'rut_lider',
    'descripcion_actividad_estado',
    'fecha_planificada',
    'fecha_realizada',
    'info_gps',
    'acciones',
  ];
  public dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) public paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, { static: true })
  public expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) public sort!: MatSort;

  constructor(
    private _empresas: AbmEmpresaService,
    private _login: LoginService,
    private _actividad: AbmActividadService,
    private _file: FilesService,
    private _planificacion: PlanificacionService,
    private _styles: StylesService,
    private _router: Router,
    private _buttonsEvent: ButtonsEventService
  ) {
    this.suscripcion = this._buttonsEvent.events.subscribe((data: any) =>
      this.create()
    );
    this.setForm();
  }

  ngOnInit(): void {
    let empresa: string | null = this._login.getEmpresa();
    if (empresa !== null) this.empresa = JSON.parse(empresa);

    let rol: string | null = this._login.getRol();
    if (rol !== null) this.rol = Number(this._login.getRol());

    this.getData();

    this.expansionPanel.open();
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  public search(): void {
    let params = this.formGroup.getRawValue();
    Object.keys(params).forEach((key) => {
      if (
        params[key] == null ||
        (typeof params[key] == 'string' && params[key] == '')
      )
        delete params[key];
    });

    this._planificacion
      .getPlanificacionesByParams(params)
      .subscribe((res: any) => {
        this.data = res;
        this.loadTable();
      });
  }

  public clean(): void {
    this.formGroup.reset();
  }

  public get colours(): any {
    return this._styles.getStyle();
  }

  public open(row: any): void {
    this._actividad.setMode('View');
    this._router.navigate(['dashboard/actividad/' + row.id_actividad]);
  }

  public edit(row: any): void {
    this._actividad.setMode('Edit');
    this._router.navigate(['dashboard/actividad/' + row.id_actividad]);
  }

  public create(): void {
    this._router.navigate(['dashboard/actividad/nuevo']);
  }

  public downloadPDF(id: number): void {
    this._file.traerArchivo(id, 4).subscribe((d) => {
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

  private getData(): void {
    let currentDate: Date = this.addHoursToDate(new Date(), -3);

    if (this.rol > 1) {
      this.getEmpresas(this.empresa.id);
      this.getPlanificaciones(currentDate, this.empresa.id);
    } else {
      this.getEmpresas();
      this.getPlanificaciones(currentDate);
    }

    this.getActividad();
  }

  private getEmpresas(id?: number): void {
    let params: { id: number } | null = null;

    if (id) params = { id: id };

    this._empresas.getEmpresas(params).subscribe((res: any) => {
      this.empresas$ = res;
      this.setEmpresa();
    });
  }

  private getPlanificaciones(date: Date, id?: number): void {
    let params: PlanificacionParams = { fecha_planificada: date };

    if (id) params = { fecha_planificada: date, id_empresa: id };

    this._planificacion
      .getPlanificacionesByParams(params)
      .subscribe((res: any) => {
        this.data = res;
        this.loadTable();
      });
  }

  private getActividad(): void {
    this._actividad
      .getEstadosActividad()
      .subscribe((res: any) => (this.estados$ = res));
  }

  private loadTable(): void {
    this.dataSource = new MatTableDataSource<any>(this.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.sort.sort({
      id: 'defColumnName',
      start: '',
      disableClear: true,
    });
    this.sort.disableClear = true;
  }

  private addHoursToDate(date: Date, hours: number): Date {
    return new Date(new Date(date).setHours(date.getHours() + hours));
  }

  private setForm(): void {
    this.formGroup = new FormGroup({
      descripcion_actividad: new FormControl(),
      id_empresa: new FormControl(),
      rut_supervisor: new FormControl(),
      rut_lider: new FormControl(),
      fecha_planificada: new FormControl(),
      fecha_realizada: new FormControl(),
      id_actividad_estado: new FormControl(),
    });
  }

  private setEmpresa(): void {
    if (this.empresas$) {
      if (this.empresas$.length === 1) {
        this.formGroup.get('id_empresa')?.setValue(this.empresa.id);
        this.formGroup.get('id_empresa')?.disable();
      }
    }
  }
}
