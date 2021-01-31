import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {ServerService} from '../services/server.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TermapadDto} from '../dto/termapad';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {BaseChartDirective, Color, Label} from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import {TemperatureTermopadDto} from '../dto/temperature';
import dateFormat from 'dateformat';
import {ErrorDto} from '../dto/error';
import {ConfigDto} from '../dto/config';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {environment} from '../../environments/environment';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';


// Интерфейс входящего сообщения
export interface InputData {
  // Идентификатор термапада
  id: number;
}

// Данные для вывода в табличном виде
export interface TableData {
  // Дата и время события
  time: string;
  // Виганд пользователя
  wigand: number;
  // Изображение
  image: string;
  // Имя термапада
  name: string;
  // Температура
  termerature: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './modal-termapad-info.component.html',
  styleUrls: ['./modal-termapad-info.component.scss']
})
export class ModalTermapadInfoComponent implements OnInit {

  // Изображение персоны из от СУДОС
  personImg = '/assets/blank.gif';

  // Описание свойств термапада
  termapad: TermapadDto = {
    id: 0,
    sudosID: 0,
    address: '',
    name: '',
    description: '',
  };

  // Конфигурация программы
  config: ConfigDto = {
    termopadsOnPage: 0,
    maxTemperature: 39.0,
    minTemperature: 33.0,
  };

  // Ссылка на изображение персоны
  personSrc = '/assets/foto-not-found-0.jpeg';

  // Рабочие объекты таблицы

  tableData = new MatTableDataSource([] as TableData[]);
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  tableColumns = ['time', 'termapad', 'termerature'];  // Список видимых колонок

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
    public dialogRef: MatDialogRef<ModalTermapadInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public inputData: InputData,
    private serverService: ServerService
  ) {
  }

  ngOnInit(): void {


    // Конфигурация программы
    this.serverService.configGet(c => {
      this.config = c;
      // Ограничительные линии
      this.lineChartOptions.annotation.annotations[0].yMin = c.maxTemperature;
      this.lineChartOptions.annotation.annotations[0].yMax = c.maxTemperature + 0.01;
      this.lineChartOptions.annotation.annotations[1].yMin = c.minTemperature - 0.01;
      this.lineChartOptions.annotation.annotations[1].yMax = c.minTemperature;
    }, e => {
      console.log(`ошибка получения конфигурации программы: ${e}`);
    });

    // Загружаем данные о термападе
    this.serverService.termopad(this.inputData.id, t => {
      this.termapad.id = this.inputData.id;
      this.termapad.address = t.address;
      this.termapad.sudosID = t.sudosID;
      this.termapad.name = t.name;
      this.termapad.description = t.description;
    }, e => {
      console.log(`ошибка получения данных о термападе ${this.inputData.id}: ${e}`);
    });

    // Получение данных о температурах за день для графика

    this.serverService.termopadLog(this.inputData.id, 30, 0, true, (t: TemperatureTermopadDto[]) => {
      this.lineChartData[0].data = [];
      this.lineChartData[1].data = [];
      this.lineChartLabels = [];
      t.forEach(value => {
        // Заполняем данные графика
        this.lineChartData[0].data.push(value.temperatureMax);
        this.lineChartData[1].data.push(value.temperatureMin);
        this.lineChartLabels.push(dateFormat(value.date, 'yyyy-mm-dd'));
      });
      // Перерисовываем график
      this.chart.update();
    }, (error: ErrorDto) => {
      console.log('error: ошибка чтения списка метрик для графика для термапада', this.inputData.id, ':', error.message);
    });


    // Получение данных о времени и температуре для таблицы

    this.tableData.paginator = this.paginator;
    this.tableData.sort = this.sort;

    this.serverService.termopadLog(this.inputData.id, 30, 0, false, (t: TemperatureTermopadDto[]) => {
      const data: TableData[] = [];
      t.forEach(value => {
        data.push(
          {
            time: dateFormat(value.date, 'yyyy-mm-dd HH:MM:ss'),
            wigand: value.wigand,
            image: value.image,
            name: value.lastName + ' ' + value.middleName + ' ' + value.firstName,
            termerature: value.temperature
          }
        );
      });

      data.reverse();
      this.tableData.data = data;

      // Перерисовываем таблицу
      this.table.renderRows();
    }, (error: ErrorDto) => {
      console.log('error: ошибка чтения списка метрик для таблицы для термапада', this.inputData.id, ':', error.message);
    });

    // Ограничительные линии

    this.lineChartOptions.annotation.annotations[0].yMin = this.config.maxTemperature;
    this.lineChartOptions.annotation.annotations[0].yMax = this.config.maxTemperature + 0.01;

    this.lineChartOptions.annotation.annotations[1].yMin = this.config.minTemperature - 0.01;
    this.lineChartOptions.annotation.annotations[1].yMax = this.config.minTemperature;

  }

  // Нажатие клавиши OK в шаблоне
  onOkClick(): void {
    this.dialogRef.close();
  }

  // Установка цвета текста в ячейке в зависимости от температуры
  colorTemp(temp: number): string {
    switch (true) {
      case temp >= this.config.maxTemperature:
        return 'red';
      case temp <= this.config.minTemperature:
        return 'blue';
      default:
        return 'green';
    }
  }

  // Показать изображение персоны
  showPerson(wiand: number, image: string): void {
    this.personSrc = environment.address + `/image/` + image;
    this.personImg = environment.address + '/person/' + wiand;
  }

  // Смени изображений между собой
  rotateImage(): void {
    const personSrc = this.personSrc;
    const personImg = this.personImg;
    this.personImg = personSrc;
    this.personSrc = personImg;
  }

  applyFilter(filterValue: string): void {
    this.tableData.filter = filterValue.trim().toLowerCase();

    if (this.tableData.paginator) {
      this.tableData.paginator.firstPage();
    }
  }
}
