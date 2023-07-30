import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FilesService } from 'src/app/services/files.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmCuestionarioService } from '../abm-cuestionario/abm-cuestionario.service';
import { AbmEmpresaService } from '../abm-empresa/abm-empresa.service';
import { GestionIncidenciasService } from './gestion-incidencias.service';
import { GestionIncidenciasModalComponent } from './modal/modal.component';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-gestion-incidencias',
  templateUrl: './gestion-incidencias.component.html',
  styleUrls: ['./gestion-incidencias.component.scss']
})
export class GestionIncidenciasComponent implements OnInit {

  titulo: string = "Incidencias";
  boton: string = "";
  seccion: string = "Gestion incidencias";

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, {static: true}) expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) sort!: MatSort;
  panelOpenState: boolean = false;

  incidenciaSearchForm: FormGroup = new FormGroup({
    id_empresa: new FormControl(null),
    descripcion: new FormControl(null),
    id_cuestionario: new FormControl(null),
    rut_responsable: new FormControl(null),
    rut_supervisor: new FormControl(null),
    id_estado: new FormControl(null),
    fecha_desde: new FormControl(null),
    fecha_hasta: new FormControl(null)
  });

  empresas: any = [];
  estados: any = [];
  cuestionarios: any = [];

  displayedColumns = ['descripcion_empresa', 'descripcion_accion', 'descripcion_cuestionario', 'responsable', 'supervisor', 'dias_abierto', 'fecha_alta', 'descripcion_estado', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  data = [] as Array<any>;

  rolUsuario: number = 0;
  empresaUsuario = {} as any;

  constructor(
    private stylesService: StylesService,
    private snackbar: MatSnackBar,
    private empresasService: AbmEmpresaService,
    private gestionIncidenciasService: GestionIncidenciasService,
    private cuestionarioService: AbmCuestionarioService,
    public dialog: MatDialog,
    private fileService: FilesService,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    //this.filtrar();
    this.rolUsuario = Number(this.loginService.getRol());
    this.empresaUsuario = JSON.parse(this.loginService.getEmpresa()!);
    if(this.rolUsuario > 1) {
      this.empresasService.getEmpresas({id: this.empresaUsuario.id}).subscribe(d => {
        this.empresas = d;
      });
      this.gestionIncidenciasService.getByParams({id_empresa: this.empresaUsuario.id}).subscribe(d => {
        console.log(d);
        this.data = d;
        this.filtrar();
      });
    } else {
      this.empresasService.getEmpresas(null).subscribe(d => {
        this.empresas = d;
      });
      this.gestionIncidenciasService.getByParams({}).subscribe(d => {
        console.log(d);
        this.data = d;
        this.filtrar();
      });
    };
    this.gestionIncidenciasService.getEstados().subscribe(d => {
      console.log(d);
      //this.estados = d;
    });
    
    this.incidenciaSearchForm.get('cuestionario')?.disable();
    this.expansionPanel.open();
  }

  clean() {
    this.incidenciaSearchForm.reset();
  }

  search() {
    let params = this.incidenciaSearchForm.getRawValue();
    Object.keys(params).forEach(key => {
      if(params[key] == null || (typeof params[key] == 'string' && params[key] == '')) {
        delete params[key]
      }
    });
    console.log(params);
    this.gestionIncidenciasService.getByParams(params).subscribe(d => {
      console.log(d);
      this.data = d;
      this.filtrar();
    })
  }

  empresaChange(event: any) {
    console.log(event.value);
    this.incidenciaSearchForm.get('cuestionario')?.setValue(null);
    this.incidenciaSearchForm.get('cuestionario')?.disable();
    this.cuestionarioService.getCuestionariosByParams({id_empresa: event.value}).subscribe(d => {
      console.log(d);
      this.cuestionarios = d;
      this.incidenciaSearchForm.get('cuestionario')?.enable();
    })
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

  downloadPDF(id: any) {
    console.log(id);
    this.fileService.traerArchivo(id, 4).subscribe(d => {
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

  downloadExtras(adjunto: any) {
    console.log(adjunto);
    this.fileService.traerArchivo(adjunto.id_file, 6).subscribe(d => {
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

  viewPlanCierre(incidencia: any) {
    //incidenciaPlanesCierre[0]
    console.log(incidencia);
    const dialogRef = this.dialog.open(GestionIncidenciasModalPlanDeCierreComponent, {
      width: '40%',
      data: {plan: incidencia.incidenciaPlanesCierre[0].plan, incidenciaTitulo: incidencia.descripcion_accion, fecha: incidencia.fecha_alta}
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  modifyAccion(data: any) {
    const dialogRef = this.dialog.open(GestionIncidenciasModalComponent, {
      width: '70%',
      data: {titulo: data.descripcion_accion, id: data.id_incidencia, idCuestionario: data.id_cuestionario}
    });

    dialogRef.afterClosed().subscribe(result => {
      setTimeout(() => {
        this.ngOnInit();
      }, 200);
      if(result) {
        
      }
    });
  }

  openSnackBar(message: string, action: string, className: string) {
    this.snackbar.open(message, action, {horizontalPosition: 'right', verticalPosition: 'top', panelClass: className});
  }

  get colours() {
    return this.stylesService.getStyle()
  }

}


@Component({
  selector: 'app-modal',
  template: `<h1 mat-dialog-title>Plan de Cierre - {{data.incidenciaTitulo}}</h1>
  <h2 mat-dialog-title>{{data.fecha | fechaRespuestaCuestionario}}</h2>
  <div mat-dialog-content>
    <p>{{data.plan}}</p>
  </div>
  <div mat-dialog-actions class="flex justify-end gap-4">
    <button mat-button (click)="onNoClick()" [style.background-color]="colours.warnButtonColor" class="text-white">Cerrar</button>
  </div>`
})

export class GestionIncidenciasModalPlanDeCierreComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<GestionIncidenciasModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {plan: string, incidenciaTitulo: string, fecha: any},
    private stylesService: StylesService,
  ) {}

  ngOnInit(): void {
    
  }

  onNoClick() {
    this.dialogRef.close(false);
  }

  get colours() {
    return this.stylesService.getStyle()
  }
}
