import { Component, OnInit, ViewChild } from '@angular/core';

// * Services.
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { DashboardService } from '../dashboard.service';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';

// * Forms.
import { FormControl, FormGroup, Validators } from '@angular/forms';

// * Material.
import { MatExpansionPanel } from '@angular/material/expansion';

// * Chart.
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.scss'],
})
export class GestionComponent implements OnInit {
  private rol: number = 0;
  private empresa = {} as any;

  public titulo: string = 'Gestion';
  public seccion: string = 'Estadísticas';

  public panelOpenState: boolean = false;
  public form!: FormGroup;
  public empresas$ = [] as Array<{ descripcion: string; id: number }>;
  public showGraph: boolean = false;

  //Chart
  public pieChartOptionsIncidenciasPorEstado: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsIncidenciasPorEstado = [
    'Respuestas A',
    'Respuestas B',
    'Respuestas C',
  ];
  public pieChartDatasetsIncidenciasPorEstado = [
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
  public pieChartLegendIncidenciasPorEstado = true;
  public pieChartPluginsIncidenciasPorEstado = [];

  @ViewChild(MatExpansionPanel, { static: true })
  public expansionPanel!: MatExpansionPanel;

  constructor(
    private _styles: StylesService,
    private _dashboard: DashboardService,
    private _empresas: AbmEmpresaService,
    private _login: LoginService
  ) {
    this.setForm();
  }

  ngOnInit(): void {
    let empresa: string | null = this._login.getEmpresa();
    if (empresa !== null) this.empresa = JSON.parse(empresa);

    let rol: string | null = this._login.getRol();
    if (rol !== null) this.rol = Number(this._login.getRol());

    this.rol > 1
      ? this.getEmpresa({ id: this.empresa.id })
      : this.getEmpresa(null);

    this.expansionPanel.open();
  }

  public get colours(): any {
    return this._styles.getStyle();
  }

  public clean(): void {
    this.form.reset();
    this.setEmpresa();
  }

  public search(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    let fechaDesde = this.form.get('fecha_desde')?.value;
    let fechaHasta = this.form.get('fecha_hasta')?.value;
    let empresaId = this.form.get('id_empresa')?.value;

    this._dashboard
      .getIncidenciasPorEstado(empresaId, fechaDesde, fechaHasta)
      .subscribe((res: any) => {
        if (res.length == 0) {
          this.showGraph = false;
        } else {
          this.showGraph = true;
          this.loadGraph(res);
        }
      });
  }

  private loadGraph(data: any): void {
    let labels = [] as Array<string>;
    let finalData = [] as Array<number>;
    data.forEach((d: { descripcion: string; cantidad: number }) => {
      labels.push(d.descripcion);
      finalData.push(d.cantidad);
    });
    this.pieChartLabelsIncidenciasPorEstado = labels;
    this.pieChartDatasetsIncidenciasPorEstado[0].data = finalData;
  }

  private filtrar(): void {
    if (this.rol > 1) {
      this.empresas$ = this.empresas$.filter(
        (emp) => emp.id == this.empresa.id
      );

      let date = new Date();
      this.form.get('fecha_desde')?.setValue(date);
      this.form.get('fecha_hasta')?.setValue(date);
      this.form.get('id_empresa')?.setValue(this.empresa.id);
      this.search();
      this.setEmpresa();
    }
  }

  private getEmpresa(id: { id: number } | null): void {
    this._empresas.getEmpresas(id).subscribe((res: any) => {
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
