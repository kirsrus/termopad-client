import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import dateFormat from 'dateformat';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {BaseChartDirective, Color, Label} from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import {ServerService} from '../services/server.service';
import {TemperaturePersonDto} from '../dto/temperature';
import {ErrorDto} from '../dto/error';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {environment} from '../../environments/environment';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';


// Интерфейс входящего сообщения
export interface InputData {
  // Идентификатор термопада
  termopadID: number;
  // Описание термпопада
  termopadDescription: string;
  // Название термопада
  termopadName: string;
  // Температура
  temperature: number;
  // URL изображения с термопада
  temperatureImageURL: string;
  // Общий номер виганда
  wigand: number;
  // Фасалити номер виганда
  wigandFasality: number;
  // Номер виганда
  wigandNumber: number;
  // Фотография персоны из сиситемы СУДОС
  personImageURL: string;
  // Фамилия персоны
  personNameLast: string;
  // Отчетсов персоны
  personNameMiddle: string;
  // Имя персоны
  personNameFirst: string;
  // Организация
  personOrganization: string;
  // Отдел
  personDepartament: string;
  // Должность
  personPostion: string;
  // Максимальная температура
  configMaxTemperature: number;
  // Минимальная температура
  configMinTemperature: number;
}

// Данные для вывода в табличном виде
export interface TableData {
  // Дата и время события
  time: string;
  // Имя термапада
  termapad: string;
  // Номер виганда
  wigand: number;
  // Изображение замера
  image: string;
  // Температура
  termerature: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './modal-person-info.component.html',
  styleUrls: ['./modal-person-info.component.scss']
})
export class ModalPersonInfoComponent implements OnInit {

  // Заголовок окна
  titleFIO = 'Ф.И.О.';
  titlePosition = 'организация и должность';
  personImg = '/assets/blank.gif';

  // Ссылка на изображение персоны
  personSrc = '/assets/foto-not-found-0.jpeg';

  // Рабочие объекты таблицы

  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  tableColumns = ['time', 'termapad', 'termerature'];  // Список видимых колонок
  tableData = new MatTableDataSource([] as TableData[]);  // Данные для таблицы хостов

  // Рабочие объекты графика

  // Значения по Y (сколько элементов, столько и линий). Зависит от Label (не будет
  // Label, будет показан только первый участок)
  public lineChartData: ChartDataSets[] = [
    // data - массив значений. По умолчанию делаем пустым. Сопоставляется с lineChartLabels
    {data: [], label: 'Максимальная температура'},
    {data: [], label: 'Минимальная температура'},
  ];

  // Значение по X, которая должна соответсвовать еденицам в ChartDataSets.
  // Т.е. даты взятия температур. Сопоставляется с data.
  public lineChartLabels: Label[] = [];

  public lineChartColors: Color[] = [
    // Линия высокой температуры
    {
      backgroundColor: 'rgba(148,159,177,0.2)',
      // borderColor: 'rgba(148,159,177,1)',
      borderColor: 'rgb(202,126,136)',  // Заполнение самой линии
      // pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(0,0,0,0.5)',  // Заполнене точек пересечений
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
      // pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    // Линия низакой температуры
    {
      backgroundColor: 'rgba(148,159,177,0.2)',
      // borderColor: 'rgba(148,159,177,1)',
      borderColor: 'rgb(116,115,174)',  // Заполнение самой линии
      // pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(0,0,0,0.5)',  // Заполнене точек пересечений
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
      // pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
  ];

  // Тип графика. `line` - плавная линия, `bar` - столбики
  public lineChartType: ChartType = 'line';

  // Показывать "легенду" с описанием линий (и возможностью их скрытия)
  public lineChartLegend = true;

  // Массив доступных опций, который настраивает дополнительные элементы графика.
  // Здась складывается тип ChartOptions и поле "annotation" (только если оно используется через
  // импорт плагина chartjs-plugin-annotation, поэтом можно это поле исключить)
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    // "Отзывчивость" (не понятно, что делает)
    responsive: true,

    scales: {
      xAxes: [{
        id: 'x-axis-0',
        position: 'bottom',
      }],
      yAxes: [{
        id: 'y-axis-0',
        position: 'left', // Позиция оси с этим id (здесь пось слева, т.е. Y)
        // Указываем минимально и максимальные деления на оси для этого id (кажое
        // поле опционально, если не указать - буедт подсчитано автоматичкски)
        ticks: {
          // min: 31,
          // max: 47,
        }
      }],
    },

    // Настройка плагина `chartjs-plugin-annotation` для вывода ограничительных линий
    annotation: {
      drawTime: 'beforeDatasetsDraw',  // Позволят отрисовать линию до графика (график наложится сверху)
      annotations: [
        {
          type: 'box',  // Тип линии
          mode: 'horizontal',  // Расположение
          yScaleID: 'y-axis-0',
          yMax: 37.5,
          yMin: 36.6,
          borderWidth: 2,  // Толщина линии
          backgroundColor: 'rgba(255,0,0,0.3)',
        },
        {
          type: 'box',  // Тип линии
          mode: 'horizontal',  // Расположение
          yScaleID: 'y-axis-0',
          yMax: 35.0,
          yMin: 34.0,
          borderWidth: 2,  // Толщина линии
          backgroundColor: 'rgba(0,0,255,0.3)',
        }
      ]
    }

  };

  // Подключения плагина `chartjs-plugin-annotation` для вывода ограничительных линий на график
  public lineChartPlugins = [pluginAnnotations];

  // Ссылка непосредственно на график
  @ViewChild(BaseChartDirective, {static: true}) chart: BaseChartDirective;

  constructor(
    public dialogRef: MatDialogRef<ModalPersonInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InputData,
    private serverService: ServerService
  ) {
  }

  ngOnInit(): void {

    this.personSrc = this.data.temperatureImageURL;
    this.personImg = environment.address + '/person/' + this.data.wigand;

    // Определение заголовков. Массив используется для простоты объединения при отсутсвующем элемента

    const titleFIO: string[] = [
      this.data.personNameLast,
      this.data.personNameFirst,
      this.data.personNameMiddle
    ];
    this.titleFIO = titleFIO.filter(v => v !== '').join(' ');

    const titlePosigion: string[] = [
      this.data.personOrganization,
      this.data.personDepartament,
      this.data.personPostion
    ];
    this.titlePosition = titlePosigion.filter(v => v !== '').join(', ');

    // Получение данных о температурах за день для графика

    this.serverService.personLog(this.data.wigand, 30, 0, true, (t: TemperaturePersonDto[]) => {
      this.chart.hideDataset(0, true);
      this.lineChartData[0].data = [];
      this.lineChartData[1].data = [];
      this.lineChartLabels = [];
      t.forEach(value => {
        // Заполняем данные графика
        this.lineChartData[0].data.push(value.tMax);
        this.lineChartData[1].data.push(value.tMin);
        this.lineChartLabels.push(dateFormat(value.d, 'yyyy-mm-dd'));
      });
      // Перерисовываем график
      this.chart.update();
      this.chart.hideDataset(0, false);
      this.chart.hideDataset(1, false);
    }, (error: ErrorDto) => {
      console.log('error: ошибка чтения списка метрик для графика для персоны', this.data.wigand, ':', error.message);
    });

    // Получение данных о времени и температуре для таблицы

    this.tableData.paginator = this.paginator;
    this.tableData.sort = this.sort;

    this.serverService.personLog(this.data.wigand, 30, 0, false, (t: TemperaturePersonDto[]) => {
      const data: TableData[] = [];
      t.forEach(value => {
        // Заполняем данные таблицы
        data.push(
          {
            time: dateFormat(value.d, 'yyyy-mm-dd HH:MM:ss'),
            termapad: value.tN,
            wigand: value.w,
            image: value.i,
            termerature: value.t
          }
        );
      });
      // Перерисовываем таблицу
      data.reverse();
      this.tableData.data = data;

      this.table.renderRows();
    }, (error: ErrorDto) => {
      console.log('error: ошибка чтения списка метрик для таблицы для персоны', this.data.wigand, ':', error.message);
    });

    // Ограничительные линии

    this.lineChartOptions.annotation.annotations[0].yMin = this.data.configMaxTemperature;
    this.lineChartOptions.annotation.annotations[0].yMax = this.data.configMaxTemperature + 0.01;

    this.lineChartOptions.annotation.annotations[1].yMin = this.data.configMinTemperature - 0.01;
    this.lineChartOptions.annotation.annotations[1].yMax = this.data.configMinTemperature;
  }

  // Нажатие клавиши OK в шаблоне
  onOkClick(): void {
    this.dialogRef.close();
  }

  // Установка цвета текста в ячейке в зависимости от температуры
  colorTemp(temp: number): string {
    switch (true) {
      case temp >= this.data.configMaxTemperature:
        return 'red';
      case temp <= this.data.configMinTemperature:
        return 'blue';
      default:
        return 'green';
    }
  }

  // Показать изображение персоны
  showPerson(wigand: number, image: string): void {
    this.personSrc = environment.address + `/image/` + image;
    this.personImg = environment.address + '/person/' + wigand;
  }

  // Смени изображений между собой
  rotateImage(): void {
    const personSrc = this.personSrc;
    const personImg = this.personImg;
    this.personImg = personSrc;
    this.personSrc = personImg;
  }
}
