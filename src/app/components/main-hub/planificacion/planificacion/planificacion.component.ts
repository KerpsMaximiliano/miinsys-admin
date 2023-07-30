import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Estado } from 'src/app/models/abm';
import { FilesService } from 'src/app/services/files.service';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { AbmUsuarioService } from '../../abm-usuario/abm-usuario.service';
import { ButtonsEventService } from '../../buttons-event.service';
import { AbmActividadService } from '../abm-actividad/abm-actividad.service';
import { PlanificacionService } from './planificacion.service';

@Component({
  selector: 'app-planificacion',
  templateUrl: './planificacion.component.html',
  styleUrls: ['./planificacion.component.scss']
})
export class PlanificacionComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, {static: true}) expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) sort!: MatSort;

  titulo: string = "Planificación";
  seccion: string = "Planificación";

  estados = [] as Array<any>;
  estadosBackup = [] as Array<any>; 
  empresas = [] as Array<{descripcion: string; id: number}>;

  panelOpenState: boolean = false;

  searchForm: FormGroup = new FormGroup({
    descripcion_actividad: new FormControl(null),
    id_empresa: new FormControl(null),
    rut_supervisor: new FormControl(null),
    rut_lider: new FormControl(null),
    fecha_planificada: new FormControl(null),
    fecha_realizada: new FormControl(null),
    id_actividad_estado: new FormControl(null)
  });

  displayedColumns = ['descripcion_actividad', 'descripcion_empresa', 'descripcion_cuestionario', 'rut_supervisor', 'rut_lider', 'descripcion_actividad_estado', 'fecha_planificada', 'fecha_realizada', 'info_gps', 'acciones'];
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
    private actividadService: AbmActividadService,
    private fileService: FilesService,
    private planificacionService: PlanificacionService
  ) {
    this.suscripcion = this.buttonsEventService.events.subscribe(
      (data: any) => {
        this.create()
      }
    )
  }

  addHoursToDate(date: Date, hours: number): Date {
    return new Date(new Date(date).setHours(date.getHours() + hours));
  }

  ngOnInit(): void {
    this.rolUsuario = Number(this.loginService.getRol());
    this.empresaUsuario = JSON.parse(this.loginService.getEmpresa()!);
    let currentDate = new Date();
    currentDate = this.addHoursToDate(currentDate, -3);
    if(this.rolUsuario > 1) {
      this.empresasService.getEmpresas({id: this.empresaUsuario.id}).subscribe(d => {
        this.empresas = d;
      });
      this.planificacionService.getPlanificacionesByParams({fecha_planificada: currentDate, id_empresa: this.empresaUsuario.id}).subscribe(d => {
        console.log(d);
        this.data = d;
        this.filtrar();
      });
    } else {
      this.empresasService.getEmpresas(null).subscribe(d => {
        this.empresas = d;
      });
      this.planificacionService.getPlanificacionesByParams({fecha_planificada: currentDate}).subscribe(d => {
        console.log(d);
        this.data = d;
        this.filtrar();
      });
    };
    
    this.actividadService.getEstadosActividad().subscribe(d => {
      this.estadosBackup = d;
      this.estados = d;
      //this.searchForm.get('id_actividad_estado')?.disable();
      console.log(d)
    });
    this.expansionPanel.open();
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  empresaChange(id: number) {
    // this.estados = this.estadosBackup.filter(es => es.id_empresa == id);
    // this.searchForm.get('id_actividad_estado')?.enable();
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
    console.log(params);
    this.planificacionService.getPlanificacionesByParams(params).subscribe(d => {
      console.log(d);
      this.data = d;
      this.filtrar();
    })
  }

  open(row: any) {
    this.actividadService.setMode("View");
    this.router.navigate(['dashboard/actividad/' + row.id_actividad]);
  }

  edit(row: any) {
    this.actividadService.setMode("Edit");
    this.router.navigate(['dashboard/actividad/' + row.id_actividad]);
  }

  create() {
    this.router.navigate(['dashboard/actividad/nuevo']);
  }

  filtrar() {
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

  downloadPDF(idPdf: number) {
    this.fileService.traerArchivo(idPdf, 4).subscribe(d => {
      var file = this.fileService.b64toBlob(d.file, 'application/pdf');
      var fileURL = URL.createObjectURL(file);
      //window.open(fileURL);
      var a = document.createElement('a');
      a.href = fileURL;
      a.target = '_blank';
      a.download = d.fileName;
      document.body.appendChild(a);
      a.click();
    })
  }

  get colours() {
    return this.stylesService.getStyle()
  }

}
