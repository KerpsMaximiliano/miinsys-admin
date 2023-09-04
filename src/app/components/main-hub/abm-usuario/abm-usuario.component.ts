import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// * Services.
import { AbmEmpresaService } from '../abm-empresa/abm-empresa.service';
import { AbmUsuarioService } from './abm-usuario.service';
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
  selector: 'app-abm-usuario',
  templateUrl: './abm-usuario.component.html',
  styleUrls: ['./abm-usuario.component.scss'],
})
export class AbmUsuarioComponent implements OnInit, OnDestroy {
  private rol: number = 0;
  private empresa = {} as any;
  private data = [] as Array<any>;

  public titulo: string = 'Usuarios';
  public boton: string = 'Crear usuario';
  public seccion: string = 'Usuarios';
  public botonExtra: boolean = true;

  public suscripcion: Subscription;

  public panelOpenState: boolean = false;
  public empresas$ = [] as Array<{ descripcion: string; id: number }>;
  public estados$ = [] as Array<Estado>;

  public form!: FormGroup;

  public displayedColumns!: string[];
  public dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) public paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, { static: true })
  public expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) public sort!: MatSort;

  constructor(
    private _buttons: ButtonsEventService,
    private _empresas: AbmEmpresaService,
    private _login: LoginService,
    private _styles: StylesService,
    private _usuarios: AbmUsuarioService,
    private router: Router
  ) {
    this.form = new FormGroup({
      firstName: new FormControl(null),
      lastName: new FormControl(null),
      rut: new FormControl(null),
      email: new FormControl(null),
      id_estado: new FormControl(null),
      id_empresa: new FormControl(null),
    });

    this.displayedColumns = [
      'firstName',
      'lastName',
      'rut',
      'email',
      'id_estado',
      'descripcion_empresa',
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

    this.getUsuarios(params);
  }

  private getUsuarios(params: any): void {
    this._usuarios.getUsersByParams(params).subscribe((res: any) => {
      this.data = res;
      this.filtrar();
    });
  }

  public create(): void {
    this.router.navigate([`dashboard/usuario/nuevo`]);
  }

  public open(row: any): void {
    this._usuarios.setMode('View');
    this.router.navigate([`dashboard/usuario/${row.rut}`]);
  }

  public edit(row: any): void {
    this._usuarios.setMode('Edit');
    this.router.navigate([`dashboard/usuario/${row.rut}`]);
  }

  private filtrar(): void {
    if (this.rol > 1) {
      this.data = this.data.filter(
        (user: any) =>
          user.usuarioEmpresa.find(
            (ue: { emp_id: any }) => ue.emp_id == this.empresa.id
          ) != undefined
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
}
