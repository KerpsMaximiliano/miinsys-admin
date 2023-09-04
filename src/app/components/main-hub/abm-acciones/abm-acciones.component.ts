import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// * Services.
import { AbmAccionesService } from './abm-acciones.service';
import { AbmEmpresaService } from '../abm-empresa/abm-empresa.service';
import { AbmUsuarioService } from '../abm-usuario/abm-usuario.service';
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
  selector: 'app-abm-acciones',
  templateUrl: './abm-acciones.component.html',
  styleUrls: ['./abm-acciones.component.scss'],
})
export class AbmAccionesComponent implements OnInit, OnDestroy {
  private rol: number = 0;
  private empresa = {} as any;
  private data = [] as Array<any>;

  public suscripcion: Subscription;

  public titulo: string = 'Acciones';
  public boton: string = 'Crear acción';
  public seccion: string = 'Acción incidencias';

  public estados$ = [] as Array<Estado>;
  public empresas$ = [] as Array<{ descripcion: string; id: number }>;
  public cuestionarios$ = [] as Array<any>;

  public panelOpenState: boolean = false;

  public form!: FormGroup;
  public displayedColumns!: string[];
  public dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) public paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, { static: true })
  public expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) public sort!: MatSort;

  constructor(
    private _acciones: AbmAccionesService,
    private _buttons: ButtonsEventService,
    private _empresas: AbmEmpresaService,
    private _login: LoginService,
    private _styles: StylesService,
    private _usuarios: AbmUsuarioService,
    private router: Router
  ) {
    this.form = new FormGroup({
      descripcion: new FormControl(null),
      id_empresa: new FormControl(null),
      id_estado: new FormControl(null),
      id_cuestionario: new FormControl(null),
      rut_responsable: new FormControl(null),
    });

    this.displayedColumns = [
      'descripcion',
      'descripcion_empresa',
      'descripcion_cuestionario',
      'descripcion_pregunta',
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
      this.empresaChange();
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

    this.getAcciones(params);
  }

  public open(row: any): void {
    this._acciones.setMode('View');
    this.router.navigate(['dashboard/acciones/' + row.id_accion]);
  }

  public edit(row: any): void {
    this._acciones.setMode('Edit');
    this.router.navigate(['dashboard/acciones/' + row.id_accion]);
  }

  public create(): void {
    this.router.navigate(['dashboard/acciones/nueva']);
  }

  public empresaChange(event?: any): void {
    let evento: number | any = this.empresa.id;
    if (event) evento = event.value;

    this.form.get('id_cuestionario')?.setValue(null);
    this.form.get('id_cuestionario')?.disable();

    this._acciones
      .getPreguntasCriticasPorEmpresa(evento)
      .subscribe((res: any) => {
        this.cuestionarios$ = res;
        this.form.get('id_cuestionario')?.enable();
      });
  }

  private filtrar(): void {
    if (this.rol > 1)
      this.data = this.data.filter(
        (acc: any) => acc.id_empresa == this.empresa.id
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
      this.form.get('id_cuestionario')?.disable();
      this.setEmpresa();
    });
  }

  private getAcciones(params: any): void {
    this._acciones.getAccionesByParams(params).subscribe((res: any) => {
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
