import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// * Forms.
import { FormGroup, FormControl } from '@angular/forms';

// * Services.
import { AbmCuestionarioService } from './abm-cuestionario.service';
import { AbmEmpresaService } from '../abm-empresa/abm-empresa.service';
import { ButtonsEventService } from '../buttons-event.service';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';

// * Interfaces.
import { Estado } from 'src/app/models/abm';

// * Material
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-abm-cuestionario',
  templateUrl: './abm-cuestionario.component.html',
  styleUrls: ['./abm-cuestionario.component.scss'],
})
export class AbmCuestionarioComponent implements OnInit, OnDestroy {
  private url: string = 'dashboard/cuestionario';
  private empresa = {} as any;

  public suscripcion: Subscription;

  public titulo: string = 'Cuestionarios';
  public boton: string = 'Crear cuestionario';
  public seccion: string = 'Cuestionarios';

  public estados$ = [] as Array<Estado>;
  public empresas$ = [] as Array<{ descripcion: string; id: number }>;
  public rol: number = 0;

  public panelOpenState: boolean = false;
  public form!: FormGroup;
  public displayedColumns!: string[];
  public dataSource = new MatTableDataSource<any>([]);
  private data = [] as Array<any>;

  @ViewChild(MatPaginator) public paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, { static: true })
  public expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) public sort!: MatSort;

  constructor(
    private _buttons: ButtonsEventService,
    private _cuestionario: AbmCuestionarioService,
    private _empresas: AbmEmpresaService,
    private _login: LoginService,
    private _styles: StylesService,
    private router: Router
  ) {
    this.form = new FormGroup({
      descripcion: new FormControl(null),
      id_empresa: new FormControl(null),
      id_estado: new FormControl(null),
    });

    this.displayedColumns = [
      'descripcion_cuestionario',
      'descripcion_empresa',
      'descripcion_planta',
      'descripcion_grupo',
      'planificado',
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

    this.getCuestionarios(params);
  }

  public open(row: any): void {
    this.router.navigate([`${this.url}/${row.id_cuestionario}`]);
  }

  public edit(row: any): void {
    this.router.navigate([`${this.url}/${row.id_cuestionario}`]);
  }

  public duplicate(row: any): void {
    this.router.navigate([`${this.url}/duplicar/${row.id_cuestionario}`]);
  }

  public create(): void {
    this.router.navigate([`${this.url}/nuevo`]);
  }

  private getEmpresas(id?: number): void {
    let param: { id: number } | null = null;

    if (id) param = { id: id };

    this._empresas.getEmpresas(param).subscribe((res: any) => {
      this.empresas$ = res;
      this.setEmpresa();
    });
  }

  private getCuestionarios(params: any): void {
    this._cuestionario
      .getCuestionariosByParams(params)
      .subscribe((res: any) => {
        this.data = res;
        this.filtrar();
      });
  }

  private filtrar(): void {
    if (this.rol > 1) {
      this.data = this.data.filter(
        (cue: any) => cue.id_empresa == this.empresa.id
      );
    }
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

  private setEmpresa(): void {
    if (this.empresas$) {
      if (this.empresas$.length === 1) {
        this.form.get('id_empresa')?.setValue(this.empresa.id);
        this.form.get('id_empresa')?.disable();
      }
    }
  }
}
