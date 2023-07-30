import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Empresa, Estado } from 'src/app/models/abm';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { ButtonsEventService } from '../buttons-event.service';
import { AbmEmpresaService } from './abm-empresa.service';

@Component({
  selector: 'app-abm-empresa',
  templateUrl: './abm-empresa.component.html',
  styleUrls: ['./abm-empresa.component.scss']
})
export class AbmEmpresaComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatExpansionPanel, {static: true}) expansionPanel!: MatExpansionPanel;
  @ViewChild(MatSort) sort!: MatSort;


  titulo: string = "Empresas";
  boton: string = "Crear empresa";
  seccion: string = "Empresas";

  panelOpenState: boolean = false;

  searchForm: FormGroup = new FormGroup({
    razonSocial: new FormControl(null),
    RUT: new FormControl(null),
    estado: new FormControl(null)
  });

  displayedColumns = ['descripcion', 'rut_empresa', 'id_estado', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  estados = [] as Array<Estado>;

  suscripcion: Subscription;

  rolUsuario: number = 0;
  empresaUsuario = {} as any;

  constructor(
    private stylesService: StylesService,
    private router: Router,
    private buttonsEventService: ButtonsEventService,
    private abmEmpresaService: AbmEmpresaService,
    private snackbar: MatSnackBar,
    private loginService: LoginService
  ) {
    this.suscripcion = this.buttonsEventService.events.subscribe(
      (data: any) => {
        this.create()
      }
    );
  }

  ngOnInit(): void {
    this.rolUsuario = Number(this.loginService.getRol());
    this.empresaUsuario = JSON.parse(this.loginService.getEmpresa()!);
    if(this.rolUsuario > 1) {
      this.abmEmpresaService.setMode("Edit");
      this.router.navigate(['dashboard/empresa/' + this.empresaUsuario.id]);
    }
    this.estados = JSON.parse(localStorage.getItem('estados')!);
    this.abmEmpresaService.getEmpresas(null).subscribe(d => {
      console.log(d);
      this.loadTable(d);
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
    let model: Empresa = {
      id: 0,
      descripcion: this.searchForm.get('razonSocial')?.value,
      //id_estado: (this.searchForm.get('estado')?.value == null) ? 0 : Number(this.searchForm.get('estado')?.value),
      userName: ""
    };
    if(this.searchForm.get('estado')?.value != null && this.searchForm.get('estado')?.value != 'todos') {
      model.id_estado = Number(this.searchForm.get('estado')?.value)
    };
    if(this.searchForm.get('RUT')?.value != null && this.searchForm.get('RUT')?.value != '') {
      model.rut = Number(this.searchForm.get('RUT')?.value)
    };
    this.abmEmpresaService.getEmpresas(model).subscribe(d => {
      this.loadTable(d);
    });
  }

  open(row: any) {
    this.abmEmpresaService.setMode("View");
    this.router.navigate(['dashboard/empresa/' + row.id]);
  }

  edit(row: any) {
    this.abmEmpresaService.setMode("Edit");
    this.router.navigate(['dashboard/empresa/' + row.id]);
  }

  create() {
    this.router.navigate(['dashboard/empresa/nueva']);
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
