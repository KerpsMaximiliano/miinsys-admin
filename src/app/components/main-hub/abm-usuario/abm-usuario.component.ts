import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Estado, UsuarioSearchParams } from 'src/app/models/abm';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../abm-empresa/abm-empresa.service';
import { ButtonsEventService } from '../buttons-event.service';
import { AbmUsuarioService } from './abm-usuario.service';

@Component({
  selector: 'app-abm-usuario',
  templateUrl: './abm-usuario.component.html',
  styleUrls: ['./abm-usuario.component.scss']
})
export class AbmUsuarioComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, {static: true}) expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) sort!: MatSort;

  titulo: string = "Usuarios";
  boton: string = "Crear usuario";
  seccion: string = "Usuarios";
  botonExtra: boolean = true;

  estados = [] as Array<Estado>;
  empresas = [] as Array<{descripcion: string; id: number}>;

  panelOpenState: boolean = false;

  searchForm: FormGroup = new FormGroup({
    firstName: new FormControl(null),
    lastName: new FormControl(null),
    rut: new FormControl(null),
    email: new FormControl(null),
    id_estado: new FormControl(null),
    id_empresa: new FormControl(null)
  });

  displayedColumns = ['firstName', 'lastName', 'rut', 'email', 'id_estado', 'descripcion_empresa', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  data = [] as Array<any>;

  suscripcion: Subscription;

  rolUsuario: number = 0;
  empresaUsuario = {} as any;

  constructor(
    private stylesService: StylesService,
    private router: Router,
    private buttonsEventService: ButtonsEventService,
    private abmUsuarioService: AbmUsuarioService,
    private empresasService: AbmEmpresaService,
    private loginService: LoginService
  ) {
    this.suscripcion = this.buttonsEventService.events.subscribe(
      (data: any) => {
        this.create()
      }
    )
  }

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
    }
    this.abmUsuarioService.getUsersByParams({}).subscribe(d => {
      console.log(d);
      this.data = d;
      this.filtrar();
    });
    this.estados = JSON.parse(localStorage.getItem('estados')!);
    this.expansionPanel.open();
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  clean() {
    this.searchForm.reset();
  }

  search() {
    let params = this.searchForm.getRawValue();
    Object.keys(params).forEach(key => {
      if(params[key] == null || (typeof params[key] == 'string' && params[key] == '')) {
        delete params[key]
      }
    });
    this.abmUsuarioService.getUsersByParams(params).subscribe(d => {
      this.data = d;
      this.filtrar();
    });
  }

  open(row: any) {
    this.abmUsuarioService.setMode("View");
    this.router.navigate(['dashboard/usuario/' + row.rut]);
  }

  edit(row: any) {
    this.abmUsuarioService.setMode("Edit");
    this.router.navigate(['dashboard/usuario/' + row.rut]);
  }

  create() {
    this.router.navigate(['dashboard/usuario/nuevo']);
  }

  filtrar() {
    if(this.rolUsuario > 1) {
      this.data = this.data.filter(user => user.usuarioEmpresa.find((ue: { emp_id: any; }) => ue.emp_id == this.empresaUsuario.id) != undefined);
    }
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

  get colours() {
    return this.stylesService.getStyle()
  }

}
