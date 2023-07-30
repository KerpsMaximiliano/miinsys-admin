import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { Chart } from 'chart.js';
import { ChartData, ChartDataset } from 'chart.js/dist/types/index';

@Component({
  selector: 'app-abm-turno-jornada',
  templateUrl: './abm-turno-jornada.component.html',
  styleUrls: ['./abm-turno-jornada.component.scss']
})
export class AbmTurnoJornadaComponent implements OnInit {

  titulo: string = "Grilla de Turnos/Jornadas";
  boton: string = "Crear turno/jornada";
  seccion: string = "Turnos/Jornadas";

  //Chart
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabels = [ 'Respuestas A', 'Respuestas B', 'Respuestas C' ];
  public pieChartDatasets = [ {
    data: [ 300, 500, 100 ]
  } ];
  public pieChartLegend = true;
  public pieChartPlugins = [];

  //Chart 2
  public pieChartOptionsTwo: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsTwo = [ 'Usuario 1', 'Usuario 2', 'Usuario 3', 'Usuario 4' ];
  public pieChartDatasetsTwo = [ {
    data: [ 18, 22, 9, 35 ],
    backgroundColor: ['limegreen', 'lightgray', 'lightblue', 'pink'],
    hoverBackgroundColor: ['green', 'gray', 'blue', 'red'],
    borderColor: ['white', 'white', 'white', 'white'],
    hoverBorderColor: ['limegreen', 'lightgray', 'lightblue', 'pink'],
  } ];
  public pieChartLegendTwo = true;
  public pieChartPluginsTwo = [];

  //Chart 3
  public pieChartOptionsThree: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsThree = [ 'Pilar', 'Lanús', 'Caballito' ];
  public pieChartDatasetsThree = [ {
    data: [ 11, 27, 4 ],
    backgroundColor: ['limegreen', 'lightgray', 'lightblue'],
    hoverBackgroundColor: ['green', 'gray', 'blue'],
    borderColor: ['white', 'white', 'white'],
    hoverBorderColor: ['limegreen', 'lightgray', 'lightblue'],
  } ];
  public pieChartLegendThree = true;
  public pieChartPluginsThree = [];

  //Chart 4
  public pieChartOptionsFour: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsFour = [ 'Turno noche', 'Turno tarde', 'Turno mañana' ];
  public pieChartDatasetsFour = [ {
    data: [ 4, 14, 7 ],
    backgroundColor: ['limegreen', 'lightgray', 'lightblue'],
    hoverBackgroundColor: ['green', 'gray', 'blue'],
    borderColor: ['white', 'white', 'white'],
    hoverBorderColor: ['limegreen', 'lightgray', 'lightblue'],
  } ];
  public pieChartLegendFour = true;
  public pieChartPluginsFour = [];

  //Chart 5
  public pieChartOptionsFive: ChartOptions<'bar'> = {
    responsive: false,
  };
  public pieChartLabelsFive = [ 'Cuestionario 1', 'Cuestionario 2', 'Cuestionario 3' ];
  public pieChartDatasetsFive = [ {
    data: [ 11, 39, 113 ],
    backgroundColor: ['limegreen', 'lightgray', 'lightblue'],
    hoverBackgroundColor: ['green', 'gray', 'blue'],
    borderColor: ['white', 'white', 'white'],
    hoverBorderColor: ['limegreen', 'lightgray', 'lightblue'],
  } ];
  public pieChartLegendFive = true;
  public pieChartPluginsFive = [];

  constructor() { }

  ngOnInit(): void {
    
  }

}
