import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Estado } from 'src/app/models/abm';
import { StylesService } from 'src/app/services/styles.service';
import { ButtonsEventService } from '../buttons-event.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AbmEmpresaService } from '../abm-empresa/abm-empresa.service';
import { AbmListaDatosService } from './abm-lista-datos.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-abm-grilla-datos',
  templateUrl: './abm-grilla-datos.component.html',
  styleUrls: ['./abm-grilla-datos.component.scss']
})
export class AbmGrillaDatosComponent implements OnInit, OnDestroy {

  /////////////////////////////////

  grillaMock = [
    {id: 1, listaName: "Lista 1", empresa: "Optimal", id_estado: 1},
    {id: 2, listaName: "Lista 2", empresa: "IMEL", id_estado: 1},
    {id: 3, listaName: "Lista 3", empresa: "DERK", id_estado: 3},
    {id: 4, listaName: "Lista 4", empresa: "DERK", id_estado: 1},
    {id: 5, listaName: "Lista 5", empresa: "Optimal", id_estado: 1},
    {id: 6, listaName: "Lista 6", empresa: "Optimal", id_estado: 1},
    {id: 7, listaName: "Lista 7", empresa: "IMEL", id_estado: 3}
  ]

  /////////////////////////////////

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, {static: true}) expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) sort!: MatSort;

  titulo: string = "Lista de datos";
  boton: string = "Crear nueva lista";
  seccion: string = "Lista de Datos";

  estados = [] as Array<Estado>;
  empresas = [] as Array<{descripcion: string; id: number}>;

  panelOpenState: boolean = false;

  suscripcion: Subscription;

  searchForm: FormGroup = new FormGroup({
    descripcion: new FormControl(null),
    empresa: new FormControl(null),
    estado: new FormControl(null)
  });

  displayedColumns = ['descripcion', 'descripcion_empresa', 'estado', 'fecha_alta', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  data = [] as Array<any>;

  rolUsuario: number = 0;
  empresaUsuario = {} as any;

  constructor(
    private stylesService: StylesService,
    private router: Router,
    private buttonsEventService: ButtonsEventService,
    private empresasService: AbmEmpresaService,
    private listaDatosService: AbmListaDatosService,
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
    this.estados = JSON.parse(localStorage.getItem('estados')!);
    if(this.rolUsuario > 1) {
      this.empresasService.getEmpresas({id: this.empresaUsuario.id}).subscribe(d => {
        this.empresas = d;
      });
    } else {
      this.empresasService.getEmpresas(null).subscribe(d => {
        this.empresas = d;
      });
    };
    this.listaDatosService.getListaByParams({}).subscribe(d => {
      this.data = d;
      this.filtrar();
      console.log(d)
    })
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
    this.listaDatosService.getListaByParams(params).subscribe(d => {
      this.data = d;
      this.filtrar();
    })
  }

  create() {
    this.router.navigate(['dashboard/lista-datos/nueva']);
  }

  open(row: any) {
    this.listaDatosService.setMode("View");
    this.router.navigate(['dashboard/lista-datos/' + row.id_lista_datos]);
  }

  edit(row: any) {
    this.listaDatosService.setMode("Edit");
    this.router.navigate(['dashboard/lista-datos/' + row.id_lista_datos]);
  }

  filtrar() {
    if(this.rolUsuario > 1) {
      this.data = this.data.filter(lst => lst.empresa == this.empresaUsuario.id);
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
