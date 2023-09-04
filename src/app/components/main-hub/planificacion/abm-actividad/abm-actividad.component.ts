import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// * Services.
import { AbmActividadService } from './abm-actividad.service';
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { ButtonsEventService } from '../../buttons-event.service';
import { FilesService } from 'src/app/services/files.service';
import { LoginService } from 'src/app/services/login.service';
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
  selector: 'app-abm-actividad',
  templateUrl: './abm-actividad.component.html',
  styleUrls: ['./abm-actividad.component.scss'],
})
export class AbmActividadComponent implements OnInit {
  private url: string = 'dashboard/actividad';
  private rol: number = 0;
  private empresa = {} as any;
  private data = [] as Array<any>;

  public suscripcion: Subscription;

  public titulo: string = 'Actividad';
  public boton: string = 'Crear actividad';
  public seccion: string = 'Actividad';

  public panelOpenState: boolean = false;
  public estados$ = [] as Array<Estado>;
  public empresas$ = [] as Array<{ descripcion: string; id: number }>;

  public form!: FormGroup;

  public dataSource = new MatTableDataSource<any>([]);
  public displayedColumns!: string[];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, { static: true })
  expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _actividad: AbmActividadService,
    private _buttons: ButtonsEventService,
    private _empresas: AbmEmpresaService,
    private _file: FilesService,
    private _login: LoginService,
    private _styles: StylesService,
    private router: Router
  ) {
    this.form = new FormGroup({
      descripcion_actividad: new FormControl(null),
      id_empresa: new FormControl(null),
      rut_supervisor: new FormControl(null),
      rut_lider: new FormControl(null),
      id_estado: new FormControl(null),
    });

    this.displayedColumns = [
      'descripcion',
      'descripcion_empresa',
      'rut_responsable',
      'rut_lider',
      'id_estado',
      'acciones',
    ];

    this.suscripcion = this._buttons.events.subscribe((data: any) => {
      this.create();
    });
  }

  ngOnInit(): void {
    let empresa: string | null = this._login.getEmpresa();
    if (empresa !== null) this.empresa = JSON.parse(empresa);

    let rol: string | null = this._login.getRol();
    if (rol !== null) this.rol = Number(this._login.getRol());

    this.estados$ = JSON.parse(localStorage.getItem('estados')!);

    if (this.rol > 1) {
      this.getEmpresas(this.empresa.id);
      this.search(true);
    } else {
      this.getEmpresas();
      this.search();
    }

    this.expansionPanel.open();
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  public get colours(): any {
    return this._styles.getStyle();
  }

  public clean(): void {
    this.form.reset();
    this.setEmpresa();
  }

  public search(only?: boolean): void {
    if (only) this.form.get('id_empresa')?.setValue(this.empresa.id);

    let params = this.form.getRawValue();

    Object.keys(params).forEach((key) => {
      if (
        params[key] == null ||
        (typeof params[key] == 'string' && params[key] == '')
      ) {
        delete params[key];
      }
    });

    this.getActividades(params);
  }

  public open(row: any): void {
    this._actividad.setMode('View');
    this.router.navigate([`${this.url}/${row.id_actividad}`]);
  }

  public edit(row: any): void {
    this._actividad.setMode('Edit');
    this.router.navigate([`${this.url}/${row.id_actividad}`]);
  }

  public duplicate(row: any): void {
    this.router.navigate([`${this.url}/${row.id_actividad}`]);
  }

  public create(): void {
    this.router.navigate([`${this.url}/nuevo`]);
  }

  public downloadPDF(idPdf: number): void {
    this._file.traerArchivo(idPdf, 4).subscribe((d) => {
      var file = this._file.b64toBlob(d.file, 'application/pdf');
      var fileURL = URL.createObjectURL(file);
      //window.open(fileURL);
      var a = document.createElement('a');
      a.href = fileURL;
      a.target = '_blank';
      a.download = d.fileName;
      document.body.appendChild(a);
      a.click();
    });
  }

  private filtrar(): void {
    if (this.rol > 1)
      this.data = this.data.filter(
        (act: any) => act.id_empresa == this.empresa.id
      );

    this.loadTable(this.data);
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

  private getEmpresas(id?: number): void {
    let param: { id: number } | null = null;

    if (id) param = { id: id };

    this._empresas.getEmpresas(param).subscribe((res: any) => {
      this.empresas$ = res;
      this.setEmpresa();
    });
  }

  private getActividades(params: any): void {
    this._actividad.getActividadesByParams(params).subscribe((res: any) => {
      this.data = res;
      this.filtrar();
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
}
