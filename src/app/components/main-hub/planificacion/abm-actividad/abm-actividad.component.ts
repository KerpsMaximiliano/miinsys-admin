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
import { AbmActividadService } from './abm-actividad.service';

@Component({
  selector: 'app-abm-actividad',
  templateUrl: './abm-actividad.component.html',
  styleUrls: ['./abm-actividad.component.scss']
})
export class AbmActividadComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, {static: true}) expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) sort!: MatSort;

  titulo: string = "Actividad";
  boton: string = "Crear actividad";
  seccion: string = "Actividad";

  estados = [] as Array<Estado>;
  empresas = [] as Array<{descripcion: string; id: number}>;

  panelOpenState: boolean = false;

  searchForm: FormGroup = new FormGroup({
    descripcion_actividad: new FormControl(null),
    id_empresa: new FormControl(null),
    rut_supervisor: new FormControl(null),
    rut_lider: new FormControl(null),
    id_estado: new FormControl(null)
  });

  displayedColumns = ['descripcion', 'descripcion_empresa', 'rut_responsable', 'rut_lider', 'id_estado', 'acciones'];
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
    private fileService: FilesService
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
    };
    this.actividadService.getActividadesByParams({}).subscribe(d => {
      console.log(d);
      this.data = d;
      this.filtrar();
    });
    // this.abmUsuarioService.getUsersByParams({}).subscribe(d => {
    //   console.log(d);
    //   this.data = d;
    //   this.filtrar();
    // });
    // setTimeout(() => {
    //   this.data = [
    //     {id: 1, actividad: "Actividad 1", cliente: "Empresa 1", supervisor: "Supervisor 1", responsable: "Responsable 1", estado: 1, fechaPlanificacion: "25/1/2023", fechaRealizado: "25/1/2023", gps: "Ciudad 1"},
    //     {id: 2, actividad: "Actividad 2", cliente: "Empresa 2", supervisor: "Supervisor 2", responsable: "Responsable 2", estado: 2, fechaPlanificacion: "25/1/2023", fechaRealizado: "25/1/2023", gps: "Ciudad 2"},
    //     {id: 3, actividad: "Actividad 3", cliente: "Empresa 3", supervisor: "Supervisor 3", responsable: "Responsable 3", estado: 3, fechaPlanificacion: "25/1/2023", fechaRealizado: "25/1/2023", gps: "Ciudad 3"},
    //     {id: 4, actividad: "Actividad 4", cliente: "Empresa 4", supervisor: "Supervisor 4", responsable: "Responsable 4", estado: 4, fechaPlanificacion: "25/1/2023", fechaRealizado: "25/1/2023", gps: "Ciudad 4"}
    //   ];
    //   this.filtrar();
    // }, 1);
    
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
    console.log(params);
    this.actividadService.getActividadesByParams(params).subscribe(d => {
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

  duplicate(row: any) {
    this.router.navigate(['dashboard/actividad/duplicar/' + row.id_actividad]);
  }

  create() {
    this.router.navigate(['dashboard/actividad/nuevo']);
  }

  filtrar() {
    if(this.rolUsuario > 1) {
      this.data = this.data.filter(act => act.id_empresa == this.empresaUsuario.id);
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
