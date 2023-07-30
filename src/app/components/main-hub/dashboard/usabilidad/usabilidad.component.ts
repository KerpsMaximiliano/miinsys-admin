import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ChartOptions } from 'chart.js';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-usabilidad',
  templateUrl: './usabilidad.component.html',
  styleUrls: ['./usabilidad.component.scss']
})
export class UsabilidadComponent implements OnInit {

  @ViewChild(MatExpansionPanel, {static: true}) expansionPanel!: MatExpansionPanel;

  titulo: string = "Usabilidad";
  seccion: string = "Estadísticas";


  //Chart
  public pieChartOptionsTipo: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsTipo = [ 'Respuestas A', 'Respuestas B', 'Respuestas C' ];
  public pieChartDatasetsTipo = [ {
    data: [ 300, 500, 100 ],
    backgroundColor: ['#0B057A', '#A170EF', '#F9DBBD', '#F2B111', '#A4A5A4'],
    hoverBackgroundColor: ['#03003a', '#583b87', '#9f846a', '#936e0f', '#606060'],
    borderColor: ['white', 'white', 'white', 'white', 'white'],
    hoverBorderColor: ['#0B057A', '#A170EF', '#F9DBBD', '#F2B111', '#A4A5A4'],
  } ];
  public pieChartLegendTipo = true;
  public pieChartPluginsTipo = [];

  //Chart 2
  public pieChartOptionsUsuario: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsUsuario = [ 'Usuario 1', 'Usuario 2', 'Usuario 3'];
  public pieChartDatasetsUsuario = [ {
    data: [ 18, 22, 9],
    backgroundColor: ['#0B057A', '#A170EF', '#F9DBBD', '#F2B111', '#A4A5A4'],
    hoverBackgroundColor: ['#03003a', '#583b87', '#9f846a', '#936e0f', '#606060'],
    borderColor: ['white', 'white', 'white', 'white', 'white'],
    hoverBorderColor: ['#0B057A', '#A170EF', '#F9DBBD', '#F2B111', '#A4A5A4'],
  } ];
  public pieChartLegendUsuario = true;
  public pieChartPluginsUsuario = [];

  //Chart 3
  public pieChartOptionsPlanta: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsPlanta = [ 'Pilar', 'Lanús', 'Caballito' ];
  public pieChartDatasetsPlanta = [ {
    data: [ 11, 27, 4 ],
    backgroundColor: ['#0B057A', '#A170EF', '#F9DBBD', '#F2B111', '#A4A5A4'],
    hoverBackgroundColor: ['#03003a', '#583b87', '#9f846a', '#936e0f', '#606060'],
    borderColor: ['white', 'white', 'white', 'white', 'white'],
    hoverBorderColor: ['#0B057A', '#A170EF', '#F9DBBD', '#F2B111', '#A4A5A4'],
  } ];
  public pieChartLegendPlanta = true;
  public pieChartPluginsPlanta = [];

  //Chart 4
  public pieChartOptionsGrupo: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsGrupo = [ 'Turno noche', 'Turno tarde', 'Turno mañana' ];
  public pieChartDatasetsGrupo = [ {
    data: [ 4, 14, 7 ],
    backgroundColor: ['#0B057A', '#A170EF', '#F9DBBD', '#F2B111', '#A4A5A4'],
    hoverBackgroundColor: ['#03003a', '#583b87', '#9f846a', '#936e0f', '#606060'],
    borderColor: ['white', 'white', 'white', 'white', 'white'],
    hoverBorderColor: ['#0B057A', '#A170EF', '#F9DBBD', '#F2B111', '#A4A5A4'],
  } ];
  public pieChartLegendGrupo = true;
  public pieChartPluginsGrupo = [];

  //Chart 5
  public pieChartOptionsCuestionario: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsCuestionario = [ 'Turno noche', 'Turno tarde', 'Turno mañana' ];
  public pieChartDatasetsCuestionario = [ {
    data: [ 4, 14, 7 ],
    backgroundColor: ['#0B057A', '#A170EF', '#F9DBBD', '#F2B111', '#A4A5A4'],
    hoverBackgroundColor: ['#03003a', '#583b87', '#9f846a', '#936e0f', '#606060'],
    borderColor: ['white', 'white', 'white', 'white', 'white'],
    hoverBorderColor: ['#0B057A', '#A170EF', '#F9DBBD', '#F2B111', '#A4A5A4'],
  } ];
  public pieChartLegendCuestionario = true;
  public pieChartPluginsCuestionario = [];


  /////////////
  searchForm: FormGroup = new FormGroup({
    empresa: new FormControl(null, Validators.required),
    fechaDesde: new FormControl(null),
    fechaHasta: new FormControl(null)
  });

  panelOpenState: boolean = false;
  empresas = [] as Array<{descripcion: string; id: number}>;
  planta: boolean = false;
  grupo: boolean = false;
  tipo: boolean = false;
  usuarios: boolean = false;
  cuestionario: boolean = false;

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
    this.empresasService.getEmpresas(null).subscribe(d => {
      this.empresas = d;
      this.filtrar();
    });
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
    this.planta = false;
    this.grupo = false;
    this.tipo = false;
    this.usuarios = false;
    this.cuestionario = false;
    this.dashboardService.getPorCuestionario(empresaId, fechaDesde, fechaHasta).subscribe(d => {
      //Por Cuestionario
      if(d.length == 0) {
        this.cuestionario = false;
      } else {
        this.loadGraph('cuestionario', d);
        this.cuestionario = true;
      };
    });
    this.dashboardService.getPorTipoRespuestas(empresaId, fechaDesde, fechaHasta).subscribe(d => {
      //Por Tipo de Respuesta
      if(d.cantidad_positivas == 0 && d.cantidad_negativas == 0) {
        this.tipo = false;
      } else {
        this.tipo = true;
        this.loadGraph('tipo', d);
      }
    });
    this.dashboardService.getPorUsuario(empresaId, fechaDesde, fechaHasta).subscribe(d => {
      //Por Usuario
      if(d.length == 0) {
        this.usuarios = false;
      } else {
        this.loadGraph('usuario', d);
        this.usuarios = true;
      };
    });
    this.dashboardService.getPorPlanta(empresaId, fechaDesde, fechaHasta).subscribe(d => {
      //Por Planta
      if(d.length == 0) {
        this.planta = false;
      } else {
        this.loadGraph('planta', d);
        this.planta = true;
      };
    });
    this.dashboardService.getPorGrupo(empresaId, fechaDesde, fechaHasta).subscribe(d => {
      //Por Grupo
      if(d.length == 0) {
        this.grupo = false;
      } else {
        this.loadGraph('grupo', d);
        this.grupo = true;
      };
    });
  }

  loadGraph(type: string, data: any) {
    let labels = [] as Array<string>;
    let finalData = [] as Array<number>;
    switch (type) {
      case 'cuestionario':
        data.forEach((user: { descripcion: any; cantidad: any; }) => {
          labels.push(user.descripcion);
          finalData.push(user.cantidad)
        });
        this.pieChartLabelsCuestionario = labels;
        this.pieChartDatasetsCuestionario[0].data = finalData;
        break;
      
      case 'tipo':
        this.pieChartLabelsTipo = ['Respuestas Negativas', 'Respuestas no Negativas'];
        this.pieChartDatasetsTipo[0].data = [data.cantidad_negativas, data.cantidad_positivas];
        break;
      
      case 'usuario':
        data.forEach((user: { apellido: string; nombre: string; cantidad: number; }) => {
          labels.push(user.apellido + ', ' + user.nombre);
          finalData.push(user.cantidad)
        });
        this.pieChartLabelsUsuario = labels;
        this.pieChartDatasetsUsuario[0].data = finalData;
        break;

      case 'planta':
        data.forEach((pl: { descripcion: any; cantidad: any; }) => {
          labels.push(pl.descripcion);
          finalData.push(pl.cantidad)
        });
        this.pieChartLabelsPlanta = labels;
        this.pieChartDatasetsPlanta[0].data = finalData;
        break;
      
      case 'grupo':
        data.forEach((gr: { descripcion: any; cantidad: any; }) => {
          labels.push(gr.descripcion);
          finalData.push(gr.cantidad)
        });
        this.pieChartLabelsGrupo = labels;
        this.pieChartDatasetsGrupo[0].data = finalData;
        break;
    }
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
