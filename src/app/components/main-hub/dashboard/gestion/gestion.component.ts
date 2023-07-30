import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ChartOptions } from 'chart.js';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { DashboardService } from '../dashboard.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.scss']
})
export class GestionComponent implements OnInit {

  @ViewChild(MatExpansionPanel, {static: true}) expansionPanel!: MatExpansionPanel;

  titulo: string = "Gestion";
  seccion: string = "Estadísticas";

  //Chart
  public pieChartOptionsIncidenciasPorEstado: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsIncidenciasPorEstado = [ 'Respuestas A', 'Respuestas B', 'Respuestas C' ];
  public pieChartDatasetsIncidenciasPorEstado = [ {
    data: [ 300, 500, 100 ],
    backgroundColor: ['#0B057A', '#A170EF', '#F9DBBD', '#F2B111', '#A4A5A4'],
    hoverBackgroundColor: ['#03003a', '#583b87', '#9f846a', '#936e0f', '#606060'],
    borderColor: ['white', 'white', 'white', 'white', 'white'],
    hoverBorderColor: ['#0B057A', '#A170EF', '#F9DBBD', '#F2B111', '#A4A5A4'],
  } ];
  public pieChartLegendIncidenciasPorEstado = true;
  public pieChartPluginsIncidenciasPorEstado = [];

  /////////////
  searchForm: FormGroup = new FormGroup({
    empresa: new FormControl(null),
    fechaDesde: new FormControl(null),
    fechaHasta: new FormControl(null)
  });

  panelOpenState: boolean = false;
  empresas = [] as Array<{descripcion: string; id: number}>;
  showGraph: boolean = false;

  rolUsuario: number = 0;
  empresaUsuario = {} as any;

  constructor(
    private stylesService: StylesService,
    private dashboardService: DashboardService,
    private empresasService: AbmEmpresaService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.rolUsuario = Number(this.loginService.getRol());
    this.empresaUsuario = JSON.parse(this.loginService.getEmpresa()!);
    if(this.rolUsuario > 1) {
      this.empresasService.getEmpresas({id: this.empresaUsuario.id}).subscribe(d => {
        this.empresas = d;
        this.filtrar();
      });
    } else {
      this.empresasService.getEmpresas(null).subscribe(d => {
        this.empresas = d;
        this.filtrar();
      });
    };
    this.expansionPanel.open();
  }

  clean() {
    this.searchForm.reset();
  }

  search() {
    this.searchForm.markAllAsTouched();
    if(this.searchForm.invalid) {
      return;
    };
    let fechaDesde = this.searchForm.get('fechaDesde')?.value;
    let fechaHasta = this.searchForm.get('fechaHasta')?.value;
    let empresaId = this.searchForm.get('empresa')?.value;
    this.dashboardService.getIncidenciasPorEstado(empresaId, fechaDesde, fechaHasta).subscribe(d => {
      //Incidencias Por Estado
      if(d.length == 0) {
        this.showGraph = false;
      } else {
        this.showGraph = true;
        this.loadGraph(d);
      }
    });
  }

  loadGraph(data: any) {
    let labels = [] as Array<string>;
    let finalData = [] as Array<number>;
    data.forEach((d: { descripcion: string; cantidad: number; }) => {
      labels.push(d.descripcion);
      finalData.push(d.cantidad)
    });
    this.pieChartLabelsIncidenciasPorEstado = labels;
    this.pieChartDatasetsIncidenciasPorEstado[0].data = finalData;
  }

  filtrar() {
    if(this.rolUsuario > 1) {
      this.empresas = this.empresas.filter(emp => emp.id == this.empresaUsuario.id);
      function addHoursToDate(date: Date, hours: number): Date {
        return new Date(new Date(date).setHours(date.getHours() + hours));
      };
      let date = new Date();
      this.searchForm.get('fechaDesde')?.setValue(date);
      this.searchForm.get('fechaHasta')?.setValue(date);
      this.searchForm.get('empresa')?.setValue(this.empresaUsuario.id);
      this.search();
    }
  }

  get colours() {
    return this.stylesService.getStyle()
  }

}
