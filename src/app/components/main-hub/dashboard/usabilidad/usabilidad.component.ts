import { Component, OnInit, ViewChild } from '@angular/core';

// * Services.
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { DashboardService } from '../dashboard.service';

// * Forms.
import { FormControl, FormGroup, Validators } from '@angular/forms';

// * Material.
import { MatExpansionPanel } from '@angular/material/expansion';

// * Chart.
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-usabilidad',
  templateUrl: './usabilidad.component.html',
  styleUrls: ['./usabilidad.component.scss'],
})
export class UsabilidadComponent implements OnInit {
  private rol: number = 0;
  public empresa = {} as any;

  public titulo: string = 'Usabilidad';
  public seccion: string = 'Estadísticas';

  public planta: boolean = false;
  public grupo: boolean = false;
  public tipo: boolean = false;
  public usuarios: boolean = false;
  public cuestionario: boolean = false;

  public panelOpenState: boolean = false;
  public form!: FormGroup;
  public empresas$ = [] as Array<{ descripcion: string; id: number }>;

  //Chart
  public pieChartOptionsTipo: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsTipo = ['Respuestas A', 'Respuestas B', 'Respuestas C'];
  public pieChartDatasetsTipo = [
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
  public pieChartLegendTipo = true;
  public pieChartPluginsTipo = [];

  //Chart 2
  public pieChartOptionsUsuario: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsUsuario = ['Usuario 1', 'Usuario 2', 'Usuario 3'];
  public pieChartDatasetsUsuario = [
    {
      data: [18, 22, 9],
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
  public pieChartLegendUsuario = true;
  public pieChartPluginsUsuario = [];

  //Chart 3
  public pieChartOptionsPlanta: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsPlanta = ['Pilar', 'Lanús', 'Caballito'];
  public pieChartDatasetsPlanta = [
    {
      data: [11, 27, 4],
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
  public pieChartLegendPlanta = true;
  public pieChartPluginsPlanta = [];

  //Chart 4
  public pieChartOptionsGrupo: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsGrupo = ['Turno noche', 'Turno tarde', 'Turno mañana'];
  public pieChartDatasetsGrupo = [
    {
      data: [4, 14, 7],
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
  public pieChartLegendGrupo = true;
  public pieChartPluginsGrupo = [];

  //Chart 5
  public pieChartOptionsCuestionario: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabelsCuestionario = [
    'Turno noche',
    'Turno tarde',
    'Turno mañana',
  ];
  public pieChartDatasetsCuestionario = [
    {
      data: [4, 14, 7],
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
  public pieChartLegendCuestionario = true;
  public pieChartPluginsCuestionario = [];

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

    this._empresas.getEmpresas(null).subscribe((res: any) => {
      this.empresas$ = res;
      this.filtrar();
    });
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

    this.planta = false;
    this.grupo = false;
    this.tipo = false;
    this.usuarios = false;
    this.cuestionario = false;

    this._dashboard
      .getPorCuestionario(empresaId, fechaDesde, fechaHasta)
      .subscribe((d) => {
        //Por Cuestionario
        if (d.length == 0) {
          this.cuestionario = false;
        } else {
          this.loadGraph('cuestionario', d);
          this.cuestionario = true;
        }
      });
    this._dashboard
      .getPorTipoRespuestas(empresaId, fechaDesde, fechaHasta)
      .subscribe((d) => {
        //Por Tipo de Respuesta
        if (d.cantidad_positivas == 0 && d.cantidad_negativas == 0) {
          this.tipo = false;
        } else {
          this.tipo = true;
          this.loadGraph('tipo', d);
        }
      });
    this._dashboard
      .getPorUsuario(empresaId, fechaDesde, fechaHasta)
      .subscribe((d) => {
        //Por Usuario
        if (d.length == 0) {
          this.usuarios = false;
        } else {
          this.loadGraph('usuario', d);
          this.usuarios = true;
        }
      });
    this._dashboard
      .getPorPlanta(empresaId, fechaDesde, fechaHasta)
      .subscribe((d) => {
        //Por Planta
        if (d.length == 0) {
          this.planta = false;
        } else {
          this.loadGraph('planta', d);
          this.planta = true;
        }
      });
    this._dashboard
      .getPorGrupo(empresaId, fechaDesde, fechaHasta)
      .subscribe((d) => {
        //Por Grupo
        if (d.length == 0) {
          this.grupo = false;
        } else {
          this.loadGraph('grupo', d);
          this.grupo = true;
        }
      });
  }

  private loadGraph(type: string, data: any): void {
    let labels = [] as Array<string>;
    let finalData = [] as Array<number>;
    switch (type) {
      case 'cuestionario':
        data.forEach((user: { descripcion: any; cantidad: any }) => {
          labels.push(user.descripcion);
          finalData.push(user.cantidad);
        });
        this.pieChartLabelsCuestionario = labels;
        this.pieChartDatasetsCuestionario[0].data = finalData;
        break;

      case 'tipo':
        this.pieChartLabelsTipo = [
          'Respuestas Negativas',
          'Respuestas no Negativas',
        ];
        this.pieChartDatasetsTipo[0].data = [
          data.cantidad_negativas,
          data.cantidad_positivas,
        ];
        break;

      case 'usuario':
        data.forEach(
          (user: { apellido: string; nombre: string; cantidad: number }) => {
            labels.push(user.apellido + ', ' + user.nombre);
            finalData.push(user.cantidad);
          }
        );
        this.pieChartLabelsUsuario = labels;
        this.pieChartDatasetsUsuario[0].data = finalData;
        break;

      case 'planta':
        data.forEach((pl: { descripcion: any; cantidad: any }) => {
          labels.push(pl.descripcion);
          finalData.push(pl.cantidad);
        });
        this.pieChartLabelsPlanta = labels;
        this.pieChartDatasetsPlanta[0].data = finalData;
        break;

      case 'grupo':
        data.forEach((gr: { descripcion: any; cantidad: any }) => {
          labels.push(gr.descripcion);
          finalData.push(gr.cantidad);
        });
        this.pieChartLabelsGrupo = labels;
        this.pieChartDatasetsGrupo[0].data = finalData;
        break;
    }
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
