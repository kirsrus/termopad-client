import {Injectable} from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import {GraphQLError} from 'graphql';
import {ConfigDto} from '../dto/config';
import {ErrorDto} from '../dto/error';
import {TermapadDto} from '../dto/termapad';
import {TermapadPersonDto} from '../dto/person';
import {TemperatureDto, TemperaturePersonDto, TemperatureTermopadDto} from '../dto/temperature';


// Интерфейс общения с севрером
export interface IServer {
  // Получение текущей конфигурации
  configGet: (callback: (c: ConfigDto) => void, error: (e: ErrorDto) => void) => void;
  // Описание термопада
  termopad: (id: number, callback: (t: TermapadDto) => void, error: (e: ErrorDto) => void) => void;
  // Загрузка списка термопадов
  termopadsList: (callback: (t: TermapadDto[]) => void, error: (e: ErrorDto) => void) => void;
  // Получение последних проверившихся на термопаде персон (для первого запуска страницы)
  termopadsLastPerson: (callback: (t: TermapadPersonDto[]) => void, error: (e: ErrorDto) => void) => void;
  // Подписка на появления данных о температуре
  temperatureSubscribe: (callback: (t: TemperatureDto) => void, error: (e: ErrorDto) => void) => void;
  // Запрос метрик для указанной персоны wigand за период days (со смещением offsetDays) и сжатием compact
  personLog: (
    wigand: number,
    days: number,
    offsetDays: number,
    compact: boolean,
    callback: (t: TemperaturePersonDto[]) => void, error: (e: ErrorDto) => void) => void;
  // Запрос метрик для указанного термопада d за период days (со смещением offsetDays) и сжатием compact
  termopadLog: (
    id: number,
    days: number,
    offsetDays: number,
    compact: boolean,
    callback: (t: TemperatureTermopadDto[]) => void, error: (e: ErrorDto) => void) => void;
}

// Конфигурация (GraphQL)
export interface DataQueryConfig {
  config: {
    termopadsOnPage: number;
    maxTemperature: number;
    minTemperature: number;
  };
}

// Описание термапада (GraphQL)
interface DataQueryTermopad {
  termopad: {
    id: string;
    crateAt: string;
    address: string;
    sudosID: number;
    name: string;
    description: string;
    maxTemperature: number;
    minTemperature: number;
  };
}


// Список с описанием термопадов (GraphQL)
interface DataQueryTermopadList {
  termopads: {
    id: string;
    crateAt: string;
    address: string;
    name: string;
    description: string;
    maxTemperature: number;
    minTemperature: number;
  }[];
}

// Данные о последних персон, замерявшихся на термопадах
interface DataQueryTermopasLastPerson {
  lastPersons: {
    // Идентификатор термопада
    id: string;
    updateAt: string;
    image: string;
    wigand: string;
    wigandFasality: string;
    wigandNumber: string;
    temperature: number;
    nameFirst: string;
    nameMiddle: string;
    nameLast: string;
    organization: string;
    departament: string;
    postion: string;
  }[];
}

// Данные о температуре пришадшие по подписке (GraphQL)
interface DataQueryTemperature {
  temperatureChanged: {
    id: string;
    job: string;  // set или update
    update: string;
    name: string;
    temperature: number;
    image?: string;
    wigand: string;
    wigandFasality: string;
    wigandNumber: string;
    nameFirst?: string;
    nameMiddle?: string;
    nameLast?: string;
    organization?: string;
    departament?: string;
    postion?: string;
  };
}

// Данные о температуре из лога по персонам
interface DataQueryTemperaturePersonLog {
  personLog: {
    date: string;
    temperature: number;
    temperatureMax: number;
    temperatureMin: number;
    image: string;
    pWigand: number;
    tID: number;
    tName: string;
  }[];
}

interface DataQueryTemperatureTermopadLog {
  termopadLog: {
    date: string;
    temperature: number;
    temperatureMax: number;
    temperatureMin: number;
    image: string;
    pWigand: number;
    pLastName: string;
    pMiddleName: string;
    pFirstName: string;
  }[];
}


@Injectable({
  providedIn: 'root'
})
export class ServerService implements IServer {

  constructor(private apollo: Apollo) {
  }

  // Конвертирует представление даты от сервера формата "2021.01.02 17:15:41" в формат "2021-01-02T17:15:41"
  // и переводом в тип Data
  private static dateConvert(date: string): Date {
    return new Date(date.replace(/\./gi, '-').replace(' ', 'T'));
  }

  // Получение текущей конфигурации
  configGet(callback: (c: ConfigDto) => void, error: (e: ErrorDto) => void): void {
    this.apollo.query<DataQueryConfig>({
      query: gql`
        query {
          config {
            termopadsOnPage
            maxTemperature
            minTemperature
          }
        }
    `,
      fetchPolicy: 'no-cache',
    }).subscribe(({data}) => {
      if (data) {
        const {config} = data;
        const result: ConfigDto = {
          termopadsOnPage: config.termopadsOnPage,
          maxTemperature: config.maxTemperature,
          minTemperature: config.minTemperature,
        };
        callback(result);
      }
    }, (err: GraphQLError) => {
      const result: ErrorDto = {
        message: err.message
      };
      error(result);
    });
  }

  // Загрузка списка термопадов
  termopadsList(callback: (t: TermapadDto[]) => void, error: (e: ErrorDto) => void): void {
    this.apollo.query<DataQueryTermopadList>({
      query: gql`
        query  {
          termopads {
            id
            address
            name
            description
            maxTemperature
            minTemperature
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).subscribe(({data}) => {
      if (data) {
        const {termopads} = data;
        const result: TermapadDto[] = [];
        termopads.forEach(value => {
          result.push({
            id: parseInt(value.id, 10),
            sudosID: 0,
            address: value.address,
            description: value.description,
            name: value.name,
          });
        });
        callback(result);
      }
    }, (err: GraphQLError) => {
      const result: ErrorDto = {
        message: err.message
      };
      error(result);
    });
  }

  // Получение последних проверившихся на термопаде персон (для первого запуска страницы)
  termopadsLastPerson(callback: (t: TermapadPersonDto[]) => void, error: (e: ErrorDto) => void): void {
    this.apollo.query<DataQueryTermopasLastPerson>({
      query: gql`
        query {
          lastPersons {
            id
            updateAt
            image
            wigand
            wigandFasality
            wigandNumber
            temperature
            nameFirst
            nameMiddle
            nameLast
            organization
            departament
            postion
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).subscribe(({data}) => {
      if (data) {
        const {lastPersons} = data;
        const result: TermapadPersonDto[] = [];
        lastPersons.forEach(value => {
          result.push({
            createdAt: ServerService.dateConvert(value.updateAt),
            updatedAt: ServerService.dateConvert(value.updateAt),
            termapadID: parseInt(value.id, 10),
            temperature: value.temperature,
            temperatureDescription: '',
            temperatureImageURL: value.image,
            wigand: parseInt(value.wigand, 10),
            wigandFasality: parseInt(value.wigandFasality, 10),
            wigandNumber: parseInt(value.wigandNumber, 10),
            personImageURL: '',
            personNameFirst: value.nameFirst,
            personNameMiddle: value.nameMiddle,
            personNameLast: value.nameLast,
            personOrganization: value.organization,
            personDepartament: value.departament,
            personPostion: value.postion,
          });
        });
        callback(result);
      }
    }, (err: GraphQLError) => {
      const result: ErrorDto = {
        message: err.message
      };
      error(result);
    });
  }

  // Подписка на появления данных о температуре
  temperatureSubscribe(callback: (t: TemperatureDto) => void, error: (e: ErrorDto) => void): void {
    this.apollo.subscribe<DataQueryTemperature>({
      query: gql`
        subscription {
          temperatureChanged {
            id
            update
            job
            temperature
            wigand
            wigandFasality
            wigandNumber
            image
            nameFirst
            nameMiddle
            nameLast
            organization
            departament
            postion
          }
        }
      `,
      fetchPolicy: 'no-cache',
    }).subscribe(({data}) => {
      if (data) {
        const temp = data.temperatureChanged;
        const result: TemperatureDto = {
          termapadID: parseInt(temp.id, 10),
          job: temp.job,
          updatedAt: ServerService.dateConvert(temp.update),
          temperature: temp.temperature,
          temperatureImageURL: temp.image,
          wigand: parseInt(temp.wigand, 10),
          wigandFasality: parseInt(temp.wigandFasality, 10),
          wigandNumber: parseInt(temp.wigandNumber, 10),
          personImageURL: '',
          personNameLast: temp.nameLast,
          personNameMiddle: temp.nameMiddle,
          personNameFirst: temp.nameFirst,
          personOrganization: temp.organization,
          personDepartament: temp.departament,
          personPostion: temp.postion,
        };

        callback(result);
      }
    }, (err: GraphQLError) => {
      const result: ErrorDto = {
        message: err.message
      };
      error(result);
    });
  }

  // Запрос метриков для таблицы для указанной персоны wigand за период days (со смещением offsetDays) и сжатием compact.
  personLog(
    wigand: number,
    days: number,
    offsetDays: number,
    compact: boolean,
    callback: (t: TemperaturePersonDto[]) => void,
    error: (e: ErrorDto) => void
  ): void {
    this.apollo.query<DataQueryTemperaturePersonLog>({
      query: gql`
        query GetPersonLog($id: ID!, $days: Int!, $offsetDays: Int!, $compact: Boolean!) {
          personLog(id: $id, days: $days, offsetDays: $offsetDays, compact: $compact) {
            date
            temperature
            temperatureMax
            temperatureMin
            image
            pWigand
            tID
            tName
          }
        }
      `,
      fetchPolicy: 'no-cache',
      variables: {
        id: wigand.toString(),
        days,
        offsetDays,
        compact,
      }
    }).subscribe(({data}) => {
      if (data) {
        const {personLog} = data;
        const result: TemperaturePersonDto[] = [];
        personLog.forEach(value => {
          result.push({
            d: ServerService.dateConvert(value.date),
            t: Number((value.temperature).toFixed(1)),
            w: value.pWigand,
            tMax: Number((value.temperatureMax).toFixed(1)),
            tMin: Number((value.temperatureMin).toFixed(1)),
            i: value.image,
            tI: value.tID,
            tN: value.tName,
          });
        });
        callback(result);
      }
    }, (err: GraphQLError) => {
      const result: ErrorDto = {
        message: err.message
      };
      error(result);
    });
  }

  // Запрос метрик для указанного термопада d за период days (со смещением offsetDays) и сжатием compact
  termopadLog(
    id: number,
    days: number,
    offsetDays: number,
    compact: boolean,
    callback: (t: TemperatureTermopadDto[]) => void,
    error: (e: ErrorDto) => void): void {
    this.apollo.query<DataQueryTemperatureTermopadLog>({
      query: gql`
        query GetTermopadLog($id: ID!, $days: Int!, $offsetDays: Int!, $compact: Boolean!) {
          termopadLog(id: $id, days: $days, offsetDays: $offsetDays, compact: $compact) {
            date
            temperature
            temperatureMax
            temperatureMin
            image
            tName
            pWigand
            pLastName
            pMiddleName
            pFirstName
          }
        }
      `,
      fetchPolicy: 'no-cache',
      variables: {
        id: id.toString(),
        days,
        offsetDays,
        compact,
      }
    }).subscribe(({data}) => {
      if (data) {
        const {termopadLog} = data;
        const result: TemperatureTermopadDto[] = [];
        termopadLog.forEach(value => {
          result.push({
            date: ServerService.dateConvert(value.date),
            temperature: Number((value.temperature).toFixed(1)),
            temperatureMax: Number((value.temperatureMax).toFixed(1)),
            temperatureMin: Number((value.temperatureMin).toFixed(1)),
            image: value.image,
            wigand: value.pWigand,
            lastName: value.pLastName,
            middleName: value.pMiddleName,
            firstName: value.pFirstName,
          });
        });
        callback(result);
      }
    }, (err: GraphQLError) => {
      const result: ErrorDto = {
        message: err.message
      };
      error(result);
    });
  }

  // Описание термопада
  termopad(id: number, callback: (t: TermapadDto) => void, error: (e: ErrorDto) => void): void {
    this.apollo.query<DataQueryTermopad>({
      query: gql`
        query GetTermopad($id: ID!){
          termopad(id: $id) {
            id
            address
            sudosID
            name
            description
          }
        }
      `,
      fetchPolicy: 'no-cache',
      variables: {
        id: id.toString(),
      }
    }).subscribe(({data}) => {
      if (data) {
        const {termopad} = data;
        const result: TermapadDto = {
          id: parseInt(termopad.id, 10),
          address: termopad.address,
          sudosID: termopad.sudosID,
          name: termopad.name,
          description: termopad.description,
        };
        callback(result);
      }
    }, (err: GraphQLError) => {
      const result: ErrorDto = {
        message: err.message
      };
      error(result);
    });
  }

}
