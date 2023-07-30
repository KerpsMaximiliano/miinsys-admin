import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
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
import { ButtonsEventService } from '../buttons-event.service';
import { AbmCuestionarioService } from './abm-cuestionario.service';

@Component({
  selector: 'app-abm-cuestionario',
  templateUrl: './abm-cuestionario.component.html',
  styleUrls: ['./abm-cuestionario.component.scss']
})
export class AbmCuestionarioComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, {static: true}) expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) sort!: MatSort;

  titulo: string = "Cuestionarios";
  boton: string = "Crear cuestionario";
  seccion: string = "Cuestionarios";

  panelOpenState: boolean = false;
  searchForm: FormGroup = new FormGroup({
    descripcion: new FormControl(null),
    id_empresa: new FormControl(null),
    id_estado: new FormControl(null)
  });
  empresas = [] as Array<{descripcion: string; id: number}>;
  displayedColumns = ['descripcion_cuestionario', 'descripcion_empresa','descripcion_planta', 'descripcion_grupo', 'planificado', 'id_estado', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  data = [] as Array<any>;
  suscripcion: Subscription;
  estados = [] as Array<Estado>;

  rolUsuario: number = 0;
  empresaUsuario = {} as any;

  constructor(
    private stylesService: StylesService,
    private router: Router,
    private buttonsEventService: ButtonsEventService,
    private empresasService: AbmEmpresaService,
    private cuestionarioService: AbmCuestionarioService,
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
    this.estados = JSON.parse(localStorage.getItem('estados')!);
    this.cuestionarioService.getCuestionariosByParams({}).subscribe(d => {
      console.log(d)
      this.data = d;
      this.filtrar();
    });
    this.expansionPanel.open();
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  clean() {
    this.searchForm.reset();
  }

  search() {
    console.log(this.searchForm.getRawValue());
    let params = this.searchForm.getRawValue();
    Object.keys(params).forEach(key => {
      if(params[key] == null || (typeof params[key] == 'string' && params[key] == '')) {
        delete params[key]
      }
    });
    this.cuestionarioService.getCuestionariosByParams(params).subscribe(d => {
      this.data = d;
      this.filtrar();
    })
  }

  open(row: any) {
    //this.abmEmpresaService.setMode("View");
    this.router.navigate(['dashboard/cuestionario/' + row.id_cuestionario]);
  }

  edit(row: any) {
    //this.abmEmpresaService.setMode("Edit");
    this.router.navigate(['dashboard/cuestionario/' + row.id_cuestionario]);
  }

  duplicate(row: any) {
    this.router.navigate(['dashboard/cuestionario/duplicar/' + row.id_cuestionario]);
  }

  create() {
    this.router.navigate(['dashboard/cuestionario/nuevo']);
  }

  filtrar() {
    if(this.rolUsuario > 1) {
      this.data = this.data.filter(cue => cue.id_empresa == this.empresaUsuario.id);
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
    return this.stylesService.getStyle();
  }

}
