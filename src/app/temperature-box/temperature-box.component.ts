import {Component, Input, OnInit} from '@angular/core';
import {DataSharingService} from '../services/data-sharing.service';
import {InputData as InpDataPerson, ModalPersonInfoComponent} from '../modal-person-info/modal-person-info.component';
import {MatDialog} from '@angular/material/dialog';
import {InputData as InpDataTermapad, ModalTermapadInfoComponent} from '../modal-termapad-info/modal-termapad-info.component';

// Описание температуры с термопада
export interface Temperature {
  // Время создания записи
  createAt: Date;
  // Идентификатор термопада
  termopadID: number;
  // Описание термпопада
  termopadDescription: string;
  // Название термопада
  termopadName: string;
  // Идентификатор термопада по системе СУДОС
  termopadSudosID: number;
  // Температура
  temperature: number;
  // URL изображения с термопада
  temperatureImageURL: string;
  // Описание изображения
  temperatureDescription: string;
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
  // Время старения данных (в секундах)
  configAging: number;
}

@Component({
  selector: 'app-temperature-box',
  templateUrl: './temperature-box.component.html',
  styleUrls: ['./temperature-box.component.scss']
})
export class TemperatureBoxComponent implements OnInit {

  @Input() temperature: Temperature;

  // Класс элемента в зависимости от переданной температуры
  baseClass = 'box-normal';

  // Вспомогательный стиль
  baseStyle = 'filter: opacity(100%) grayscale(0%);';

  // Индикатор, что данные устарели
  isAging = false;

  constructor(
    private dataSharingService: DataSharingService,
    public dialog: MatDialog) {
  }

  ngOnInit(): void {
    // Подписываемся на событие пересчёта всех боксов извне
    this.dataSharingService.isTrmapadsBoxUpdate.subscribe(termopadID => {
      // Обновляем данные только если передан 0 (все термопады), или номер конкретного термопада
      if (termopadID === -1 || termopadID === this.temperature.termopadID) {
        this.isAging = false;
        this.temperatureState();
        this.agingState();
      }
    });

    this.temperatureState();

    // Определение времени жизни данных для применения эффекта "тускнения". Проверяем каждую секунду.
    this.agingState();
    setInterval(() => this.agingState(), 1000);
  }

  // Выполнение процесса старения изображения
  private agingState(): void {
    if (!this.isAging && this.temperature.termopadID > 0) {
      const timeDiff = Math.abs((new Date()).getTime() - this.temperature.createAt.getTime());
      const diffSecond = Math.ceil(timeDiff / 1000);  // Разница в секундах
      if (diffSecond > this.temperature.configAging) {
        this.baseStyle = 'filter: opacity(70%) grayscale(85%);';
        this.isAging = true;
      } else {
        this.baseStyle = 'filter: opacity(100%) grayscale(0%);';
      }
    }
  }

  // Обновление боксов в зависимости от температуры
  private temperatureState(): void {
    // Определяем окантовку бокса в звасимости от границ температуры
    switch (true) {
      case this.temperature.temperature === 0:
        this.baseClass = 'box-default';
        break;
      case this.temperature.temperature >= this.temperature.configMaxTemperature:
        this.baseClass = 'box-danger';
        break;
      case this.temperature.temperature <= this.temperature.configMinTemperature:
        this.baseClass = 'box-hold';
        break;
      default:
        this.baseClass = 'box-normal';
    }
  }

  // Открытие диалогового окна с подробной информацией о персоне
  openPersonDetailWindow(): void {
    // Получаем ссылку на диалог и открываем его
    const dialogRef = this.dialog.open(ModalPersonInfoComponent, {
      // width: '1000px',
      data: {
        termopadID: this.temperature.termopadID,
        termopadDescription: this.temperature.termopadDescription,
        termopadName: this.temperature.termopadName,
        temperature: this.temperature.temperature,
        temperatureImageURL: this.temperature.temperatureImageURL,
        wigand: this.temperature.wigand,
        wigandFasality: this.temperature.wigandFasality,
        wigandNumber: this.temperature.wigandNumber,
        personImageURL: this.temperature.personImageURL,
        personNameLast: this.temperature.personNameLast,
        personNameMiddle: this.temperature.personNameMiddle,
        personNameFirst: this.temperature.personNameFirst,
        personOrganization: this.temperature.personOrganization,
        personDepartament: this.temperature.personDepartament,
        personPostion: this.temperature.personPostion,
        configMaxTemperature: this.temperature.configMaxTemperature,
        configMinTemperature: this.temperature.configMinTemperature,
      } as InpDataPerson,
    });

    // Подписывание на событие закрытия окна
    dialogRef.afterClosed().subscribe(() => {
      // console.log('Диалоговое окно закрылосью с результатом:', result);
    });
  }


  // Открытие диалогового окна с подробной информацией о термападе
  openTermapadDetailWindow(termopadID: number): void {
    // Получаем ссылку на диалог и открываем его
    const dialogRef = this.dialog.open(ModalTermapadInfoComponent, {
      // width: '1000px',
      data: {
        id: termopadID
      } as InpDataTermapad,
    });

    // Подписывание на событие закрытия окна
    dialogRef.afterClosed().subscribe(() => {
      // console.log('Диалоговое окно закрылосью с результатом:', result);
    });
  }

}
