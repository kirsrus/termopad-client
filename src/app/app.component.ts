import {Component, OnInit} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {environment} from '../environments/environment';
import {MatDialog} from '@angular/material/dialog';
import {Temperature} from './temperature-box/temperature-box.component';
import {ServerService} from './services/server.service';
import {ConfigDto} from './dto/config';
import {ErrorDto} from './dto/error';
import {TermapadDto} from './dto/termapad';
import {TermapadPersonDto} from './dto/person';
import {DataSharingService} from './services/data-sharing.service';
import {TemperatureDto} from './dto/temperature';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Температурный режим';

  // Список термападов
  termapads: Temperature[] = [];

  // Через сколько секунд запись считается устаревшей (для устаревания данных на дисплее)
  olderSecond = 60;

  // Постоянное колличество термопадов на экране. Если нет нужного колличества рботающих
  // текмопадов, до этого колличества заполняются заглушки
  termopadsOnPage = 0;

  // Максимальная температура
  maxTemperature = 37.5;

  // Минимальная температура
  minTemperature = 35.0;

  constructor(
    public apollo: Apollo,
    public dialog: MatDialog,
    private serverService: ServerService,
    private dataSharingService: DataSharingService
  ) {
  }

  ngOnInit(): void {
    this.loadConfig();

    this.loadTermopads();
    this.subscribeTemperature();

    setInterval(() => {
      this.loadConfig();
    }, 10000);
  }

  // Загрузка общей конфигурации
  loadConfig(): void {
    this.serverService.configGet((config: ConfigDto) => {
      this.termopadsOnPage = config.termopadsOnPage;
      this.maxTemperature = Number(config.maxTemperature.toFixed(1));
      this.minTemperature = Number(config.minTemperature.toFixed(1));
    }, (error: ErrorDto) => {
      console.log('error: сервер недоступен: ' + error.message);
    });
  }

  // Загружает список термопадов
  loadTermopads(): void {
    this.serverService.termopadsList((termapads: TermapadDto[]) => {
      this.termapads = [];

      termapads.forEach(value => {
        this.termapads.push({
          createAt: new Date(),
          termopadID: value.id,
          termopadName: value.name,
          termopadDescription: value.description,
          termopadSudosID: 0,
          configAging: this.olderSecond,
          configMaxTemperature: this.maxTemperature,
          configMinTemperature: this.minTemperature,
          personOrganization: '',
          personDepartament: '',
          personImageURL: '',
          personNameFirst: '',
          personNameLast: '',
          personNameMiddle: '',
          personPostion: '',
          temperature: 0,
          temperatureDescription: '',
          temperatureImageURL: '',
          wigand: 0,
          wigandFasality: 0,
          wigandNumber: 0,
        });
      });

      // Добиваем колличество термопадов на странице до максимального их числа.
      // В шаблоне эти клетки будут как пустые затычки
      for (let i = termapads.length; i < this.termopadsOnPage; i++) {
        this.termapads.push({
          createAt: new Date(),
          termopadID: 0,
          termopadName: '',
          termopadDescription: '',
          termopadSudosID: 0,
          configAging: this.olderSecond,
          configMaxTemperature: this.maxTemperature,
          configMinTemperature: this.minTemperature,
          personOrganization: '',
          personDepartament: '',
          personImageURL: '',
          personNameFirst: '',
          personNameLast: '',
          personNameMiddle: '',
          personPostion: '',
          temperature: 0,
          temperatureDescription: '',
          temperatureImageURL: '',
          wigand: 0,
          wigandFasality: 0,
          wigandNumber: 0,
        });
      }

      // Заполняем данные в термопадах данными о последних персонах
      this.serverService.termopadsLastPerson((person: TermapadPersonDto[]) => {
        person.forEach(value => {
          this.termapads.filter(v => v.termopadID === value.termapadID).forEach(termopad => {
            termopad.temperature = value.temperature;
            termopad.temperatureImageURL = environment.address + '/' + environment.termperatureImageDir + '/' + value.temperatureImageURL;
            termopad.createAt = value.createdAt;
            termopad.wigand = value.wigand;
            termopad.wigandFasality = value.wigandFasality;
            termopad.wigandNumber = value.wigandNumber;
            termopad.personNameFirst = value.personNameFirst;
            termopad.personNameMiddle = value.personNameMiddle;
            termopad.personNameLast = value.personNameLast;
            termopad.personOrganization = value.personOrganization;
            termopad.personDepartament = value.personDepartament;
            termopad.personPostion = value.personPostion;
          });
        });
        // Инициируем обновление данных в компоненте отображения
        this.dataSharingService.isTrmapadsBoxUpdate.next(-1);
      }, (error: ErrorDto) => {
        console.log('error: ошибка чтения списка последних персон: ' + error.message);
      });
    }, (error: ErrorDto) => {
      console.log('error: ошибка чтения списка термападов: ' + error.message);
    });
  }

  // Подписка на получение термпературы от термападов
  subscribeTemperature(): void {
    this.serverService.temperatureSubscribe((temp: TemperatureDto) => {
      // Добавляем или изменяем данные о температуре
      this.termapads.filter(v => v.termopadID === temp.termapadID).forEach(termopad => {
        switch (temp.job) {
          // Добавление новой температуры
          case 'set':
            termopad.createAt = temp.updatedAt;
            termopad.wigand = temp.wigand;
            termopad.wigandFasality = temp.wigandFasality;
            termopad.wigandNumber = temp.wigandNumber;
            termopad.temperature = temp.temperature;
            termopad.temperatureImageURL = environment.address + '/image/' + temp.temperatureImageURL;
            termopad.personNameFirst = temp.personNameFirst;
            termopad.personNameMiddle = temp.personNameMiddle;
            termopad.personNameLast = temp.personNameLast;
            termopad.personOrganization = temp.personOrganization;
            termopad.personDepartament = temp.personDepartament;
            termopad.personPostion = temp.personPostion;
            break;
          // Обновление уже существующих данных
          case 'update':
            if (termopad.wigand === temp.wigand) {
              termopad.personNameFirst = temp.personNameFirst;
              termopad.personNameMiddle = temp.personNameMiddle;
              termopad.personNameLast = temp.personNameLast;
              termopad.personOrganization = temp.personOrganization;
              termopad.personDepartament = temp.personDepartament;
              termopad.personPostion = temp.personPostion;
            }
            break;
        }
        // Обновляем текущих бокс
        this.dataSharingService.isTrmapadsBoxUpdate.next(temp.termapadID);
      });
    }, (error: ErrorDto) => {
      console.log('error: ошибка получения температуры: ' + error.message);
    });
  }

}
