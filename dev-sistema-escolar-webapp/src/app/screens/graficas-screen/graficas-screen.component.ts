import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { EventosAcademicosService } from 'src/app/services/eventos-academicos.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss'],
})
export class GraficasScreenComponent implements OnInit {
  // Variables de datos
  public total_user: any = {};
  public totalUsuarios: any = {};
  public total_eventos: any = {};
  public totalEventos: any = {};

  // ==========================================
  // CONFIGURACIÓN DE COLORES
  // ==========================================
  // Azul cielo vibrante (Se ve excelente en fondo negro y bien en blanco)
  private textColor = '#29B6F6';
  // Gris suave y transparente para la rejilla (discreto)
  private gridColor = 'rgba(128, 128, 128, 0.2)';

  // ==========================================
  // CONFIGURACIÓN DE GRÁFICAS
  // ==========================================

  // 1. Histograma (Line Chart)
  lineChartData = {
    labels: ['Talleres', 'Seminarios', 'Conferencias', 'Concursos'],
    datasets: [
      {
        data: [] as number[],
        label: 'Registro de Eventos',
        backgroundColor: '#F88406',
        borderColor: '#F88406',
        pointBackgroundColor: '#fff',
      },
    ],
  };
  // Usamos 'any' para evitar conflictos de tipos estrictos
  lineChartOption: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: this.textColor, font: { weight: 'bold' } },
        grid: { color: this.gridColor }
      },
      y: {
        ticks: { color: this.textColor, font: { weight: 'bold' } },
        grid: { color: this.gridColor }
      }
    },
    plugins: {
      legend: { labels: { color: this.textColor } },
      datalabels: { color: this.textColor, anchor: 'end', align: 'end' }
    }
  };
  lineChartPlugins = [DatalabelsPlugin];

  // 2. Barras (Bar Chart)
  barChartData = {
    labels: ['Talleres', 'Seminarios', 'Conferencias', 'Concursos'],
    datasets: [
      {
        data: [] as number[],
        label: 'Eventos Académicos',
        backgroundColor: ['#F88406', '#FCFF44', '#82D3FB', '#FB82F5'],
      },
    ],
  };
  barChartOption: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: this.textColor, font: { weight: 'bold' } },
        grid: { color: this.gridColor }
      },
      y: {
        ticks: { color: this.textColor, font: { weight: 'bold' } },
        grid: { color: this.gridColor }
      }
    },
    plugins: {
      legend: { labels: { color: this.textColor } },
      datalabels: { color: this.textColor, anchor: 'end', align: 'end' }
    }
  };
  barChartPlugins = [DatalabelsPlugin];

  // 3. Circular (Pie Chart)
  pieChartData = {
    labels: ['Administradores', 'Alumnos', 'Maestros'],
    datasets: [
      {
        data: [] as number[],
        label: 'Registro de usuarios',
        backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731'],
        borderColor: 'transparent',
      },
    ],
  };
  pieChartOption: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: this.textColor } },
      datalabels: { color: '#231F20', font: { weight: 'bold' } } // Negro sobre los colores brillantes del pie
    }
  };
  pieChartPlugins = [DatalabelsPlugin];

  // 4. Dona (Doughnut Chart)
  doughnutChartData = {
    labels: ['Administradores', 'Alumnos', 'Maestros'],
    datasets: [
      {
        data: [] as number[],
        label: 'Registro de usuarios',
        backgroundColor: ['#F88406', '#FCFF44', '#31E7E7'],
        borderColor: 'transparent',
      },
    ],
  };
  doughnutChartOption: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: this.textColor } },
      datalabels: { color: '#231F20', font: { weight: 'bold' } }
    }
  };
  doughnutChartPlugins = [DatalabelsPlugin];

  constructor(
    private administradoresServices: AdministradoresService,
    private eventosService: EventosAcademicosService
  ) {}

  ngOnInit(): void {
    this.obtenerTotalUsers();
    this.obtenerTotalEventos();
  }

  // ==========================================
  // OBTENCIÓN DE DATOS
  // ==========================================

  public obtenerTotalUsers() {
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response) => {
        this.total_user = response;
        this.totalUsuarios = [
          this.total_user.admins,
          this.total_user.alumnos,
          this.total_user.maestros,
        ];
        this.graficaUsuarios();
      },
      (error) => {
        console.log('Error usuarios: ', error);
      }
    );
  }

  public obtenerTotalEventos() {
    this.eventosService.getTotalEventos().subscribe(
      (response) => {
        this.total_eventos = response;
        this.totalEventos = [
          this.total_eventos.talleres,
          this.total_eventos.seminarios,
          this.total_eventos.conferencias,
          this.total_eventos.concurso,
        ];
        this.graficaEventos();
      },
      (error) => {
        console.log('Error eventos: ', error);
      }
    );
  }

  private graficaEventos(): void {
    this.lineChartData = { ...this.lineChartData, datasets: [{ ...this.lineChartData.datasets[0], data: this.totalEventos }] };
    this.barChartData = { ...this.barChartData, datasets: [{ ...this.barChartData.datasets[0], data: this.totalEventos }] };
  }

  private graficaUsuarios(): void {
    this.doughnutChartData = { ...this.doughnutChartData, datasets: [{ ...this.doughnutChartData.datasets[0], data: this.totalUsuarios }] };
    this.pieChartData = { ...this.pieChartData, datasets: [{ ...this.pieChartData.datasets[0], data: this.totalUsuarios }] };
  }
}
