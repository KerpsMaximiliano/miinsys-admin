import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// * Services.
import { AbmEmpresaService } from '../abm-empresa/abm-empresa.service';
import { AbmListaDatosService } from './abm-lista-datos.service';
import { ButtonsEventService } from '../buttons-event.service';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';

// * Interfaces.
import { Estado } from 'src/app/models/abm';

// * Forms.
import { FormControl, FormGroup } from '@angular/forms';

// * Material.
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-abm-grilla-datos',
  templateUrl: './abm-grilla-datos.component.html',
  styleUrls: ['./abm-grilla-datos.component.scss'],
})
export class AbmGrillaDatosComponent implements OnInit, OnDestroy {
  private url: string = 'dashboard/lista-datos';
  private rol: number = 0;
  private empresa = {} as any;
  private data = [] as Array<any>;

  grillaMock = [
    { id: 1, listaName: 'Lista 1', empresa: 'Optimal', id_estado: 1 },
    { id: 2, listaName: 'Lista 2', empresa: 'IMEL', id_estado: 1 },
    { id: 3, listaName: 'Lista 3', empresa: 'DERK', id_estado: 3 },
    { id: 4, listaName: 'Lista 4', empresa: 'DERK', id_estado: 1 },
    { id: 5, listaName: 'Lista 5', empresa: 'Optimal', id_estado: 1 },
    { id: 6, listaName: 'Lista 6', empresa: 'Optimal', id_estado: 1 },
    { id: 7, listaName: 'Lista 7', empresa: 'IMEL', id_estado: 3 },
  ];

  public suscripcion: Subscription;

  public titulo: string = 'Lista de datos';
  public boton: string = 'Crear nueva lista';
  public seccion: string = 'Lista de Datos';

  public form!: FormGroup;
  public panelOpenState: boolean = false;
  public empresas$ = [] as Array<{ descripcion: string; id: number }>;
  public estados$ = [] as Array<Estado>;
  public displayedColumns!: string[];
  public dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) public paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, { static: true })
  public expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) public sort!: MatSort;

  constructor(
    private _buttons: ButtonsEventService,
    private _datos: AbmListaDatosService,
    private _empresas: AbmEmpresaService,
    private _login: LoginService,
    private _styles: StylesService,
    private router: Router
  ) {
    this.form = new FormGroup({
      descripcion: new FormControl(null),
      id_empresa: new FormControl(null),
      estado: new FormControl(null),
    });

    this.displayedColumns = [
      'descripcion',
      'descripcion_empresa',
      'estado',
      'fecha_alta',
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
      this.search(false);
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
  }

  public search(only?: boolean): void {
    if (only) this.form.get('id_empresa')?.setValue(this.empresa.id);

    let params = this.form.getRawValue();

    Object.keys(params).forEach((key) => {
      if (
        params[key] == null ||
        (typeof params[key] == 'string' && params[key] == '')
      )
        delete params[key];
    });

    this.getData(params);
  }

  public create(): void {
    this.router.navigate([`${this.url}/nueva`]);
  }

  public open(row: any): void {
    this._datos.setMode('View');
    this.router.navigate([`${this.url}/${row.id_lista_datos}`]);
  }

  public edit(row: any): void {
    this._datos.setMode('Edit');
    this.router.navigate([`${this.url}/${row.id_lista_datos}`]);
  }

  private getEmpresas(id?: number): void {
    let params: { id: number } | null = null;

    if (id) params = { id: id };

    this._empresas.getEmpresas(params).subscribe((res: any) => {
      this.empresas$ = res;
      this.setEmpresa();
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

  private getData(params: any): void {
    this._datos.getListaByParams(params).subscribe((res: any) => {
      this.data = res;
      this.filtrar();
    });
  }

  private filtrar(): void {
    if (this.rol > 1)
      this.data = this.data.filter(
        (lst: any) => lst.empresa == this.empresa.id
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
}
