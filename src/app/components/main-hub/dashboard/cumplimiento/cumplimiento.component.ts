import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ChartOptions } from 'chart.js';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-cumplimiento',
  templateUrl: './cumplimiento.component.html',
  styleUrls: ['./cumplimiento.component.scss'],
})
export class CumplimientoComponent implements OnInit {
  private rol: number = 0;
  private empresa = {} as any;

  public titulo: string = 'Cumplimiento';
  public seccion: string = 'Estadísticas';

  public form!: FormGroup;
  public panelOpenState: boolean = false;
  public empresas$ = [] as Array<{ descripcion: string; id: number }>;
  public showGraph: boolean = false;

  //Chart
  public pieChartOptionsPlanificadasVsRealizadas: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsPlanificadasVsRealizadas = [
    'Respuestas A',
    'Respuestas B',
    'Respuestas C',
  ];
  public pieChartDatasetsPlanificadasVsRealizadas = [
    {
      data: [300, 500, 100],
      backgroundColor: ['#0B057A', '#A170EF', '#F9DBBD', '#F2B111', '#A4A5A4'],
      hoverBackgroundColor: [
        '#03003a',
        '#583b87',
        '#9f846a',
        '#936e0f',
        '#606060',
      ],
      borderColor: ['white', 'white', 'white', 'white', 'white'],
      hoverBorderColor: ['#0B057A', '#A170EF', '#F9DBBD', '#F2B111', '#A4A5A4'],
    },
  ];
  public pieChartLegendPlanificadasVsRealizadas = true;
  public pieChartPluginsPlanificadasVsRealizadas = [];

  @ViewChild(MatExpansionPanel, { static: true })
  public expansionPanel!: MatExpansionPanel;

  constructor(
    private _dashboard: DashboardService,
    private _empresas: AbmEmpresaService,
    private _login: LoginService,
    private _styles: StylesService
  ) {
    this.setForm();
  }

  ngOnInit(): void {
    let empresa: string | null = this._login.getEmpresa();
    if (empresa !== null) this.empresa = JSON.parse(empresa);

    let rol: string | null = this._login.getRol();
    if (rol !== null) this.rol = Number(this._login.getRol());

    this.rol > 1 ? this.getEmpresa({ id: this.empresa.id }) : this.getEmpresa();

    this.expansionPanel.open();
  }

  public get colours(): any {
    return this._styles.getStyle();
  }

  public clean(): void {
    this.form.reset();
  }

  public search(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    let empresaId = this.form.get('id_empresa')?.value;
    let fechaDesde = this.form.get('fechaDesde')?.value;
    let fechaHasta = this.form.get('fechaHasta')?.value;

    this._dashboard
      .getPlanificadasRealizadas(empresaId, fechaDesde, fechaHasta)
      .subscribe((res: any) => {
        this.loadGraph(res);
      });
  }

  private loadGraph(data: any): void {
    if (data.cantidad_planificaciones === 0 && data.cantidad_realizadas === 0) {
      return;
      this.showGraph = false;
    }

    this.pieChartLabelsPlanificadasVsRealizadas = [
      'Planificadas',
      'Realizadas',
    ];

    this.pieChartDatasetsPlanificadasVsRealizadas[0].data = [
      data.cantidad_planificaciones,
      data.cantidad_realizadas,
    ];

    this.showGraph = true;
  }

  private filtrar(): void {
    if (this.rol > 1) {
      this.empresas$ = this.empresas$.filter(
        (emp) => emp.id == this.empresa.id
      );

      let date = new Date();
      this.form.get('id_empresa')?.setValue(this.empresa.id);
      this.form.get('fecha_desde')?.setValue(date);
      this.form.get('fecha_hasta')?.setValue(date);
      this.search();
      this.setEmpresa();
    }
  }

  private getEmpresa(id?: { id: number }): void {
    let params: { id: number } | null = null;
    if (id) params = id;
    this._empresas.getEmpresas(params).subscribe((res: any) => {
      this.empresas$ = res;
      this.filtrar();
    });
  }

  private setForm(): void {
    this.form = new FormGroup({
      id_empresa: new FormControl(null, Validators.required),
      fecha_desde: new FormControl(null),
      fecha_hasta: new FormControl(null),
    });
  }

  private setEmpresa(): void {
    if (this.empresas$) {
      if (this.empresas$.length === 1) {
        this.form.get('id_empresa')?.setValue(this.empresa.id);
        this.form.get('id_empresa')?.disable();
      }
    }
  }
}
