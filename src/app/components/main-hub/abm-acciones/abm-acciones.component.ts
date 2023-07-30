import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Estado } from 'src/app/models/abm';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../abm-empresa/abm-empresa.service';
import { AbmUsuarioService } from '../abm-usuario/abm-usuario.service';
import { ButtonsEventService } from '../buttons-event.service';
import { AbmAccionesService } from './abm-acciones.service';

@Component({
  selector: 'app-abm-acciones',
  templateUrl: './abm-acciones.component.html',
  styleUrls: ['./abm-acciones.component.scss']
})
export class AbmAccionesComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, {static: true}) expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) sort!: MatSort;

  titulo: string = "Acciones";
  boton: string = "Crear acción";
  seccion: string = "Acción incidencias";

  estados = [] as Array<Estado>;
  empresas = [] as Array<{descripcion: string; id: number}>;
  cuestionarios = [] as Array<any>;

  panelOpenState: boolean = false;

  searchForm: FormGroup = new FormGroup({
    descripcion: new FormControl(null),
    id_empresa: new FormControl(null),
    id_estado: new FormControl(null),
    id_cuestionario: new FormControl(null),
    rut_responsable: new FormControl(null)
  });

  displayedColumns = ['descripcion', 'descripcion_empresa', 'descripcion_cuestionario', 'descripcion_pregunta', 'id_estado', 'acciones'];
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
    private loginService: LoginService,
    private accionesService: AbmAccionesService
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
        this.searchForm.get('id_cuestionario')?.disable();
      });
    } else {
      this.empresasService.getEmpresas(null).subscribe(d => {
        this.empresas = d;
        this.searchForm.get('id_cuestionario')?.disable();
      });
    };
    this.accionesService.getAccionesByParams({}).subscribe(d => {
      console.log(d);
      this.data = d;
      //this.data = [];
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
    this.accionesService.getAccionesByParams(params).subscribe(d => {
      this.data = d;
      console.log(this.data);
      this.filtrar();
    });
  }

  open(row: any) {
    this.accionesService.setMode("View");
    this.router.navigate(['dashboard/acciones/' + row.id_accion]);
  }

  edit(row: any) {
    this.accionesService.setMode("Edit");
    this.router.navigate(['dashboard/acciones/' + row.id_accion]);
  }

  create() {
    this.router.navigate(['dashboard/acciones/nueva']);
  }

  empresaChange(event: any) {
    console.log(event.value);
    this.searchForm.get('id_cuestionario')?.setValue(null);
    this.searchForm.get('id_cuestionario')?.disable();
    this.accionesService.getPreguntasCriticasPorEmpresa(event.value).subscribe(d => {
      console.log(d);
      this.cuestionarios = d;
      this.searchForm.get('id_cuestionario')?.enable();
    })
  }

  filtrar() {
    if(this.rolUsuario > 1) {
      this.data = this.data.filter(acc => acc.id_empresa == this.empresaUsuario.id);
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
