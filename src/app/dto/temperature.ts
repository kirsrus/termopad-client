// Температура, определённая на термопаде
export class TemperatureDto {
  // Идентификатор термопада
  termapadID: number;
  // Задача обновления: set или update
  job: string;
  // Время обновления
  updatedAt: Date;
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
}

// Метрика для таблицы (табличного)
export class TemperatureMetricDto {
  // Значение температуры
  t: number;
  // Дата и время
  d: Date;
}

// Метрика для графика (графика)
export class TemperatureMetricDeltaDto {
  // Максимальное значение температуры
  tMax: number;
  // Минимальное значение температуры
  tMin: number;
  // Дата и время
  d: Date;
}

// Метрики для описания замеров температуры с дельтой по дням
export class TemperaturePersonDto {
  // Дата и время
  d: Date;
  // Температура
  t: number;
  // Номер иганда
  w: number;
  // Максимальное значение температуры
  tMax: number;
  // Минимальное значение температуры
  tMin: number;
  // Изображение
  i: string;
  // Идентификатор термапада
  tI: number;
  // Имя термопада
  tN: string;
}

export class TemperatureTermopadDto {
  // Дата и время
  date: Date;
  // Температура
  temperature: number;
  // Максимальное значение температуры
  temperatureMax: number;
  // Минимальное значение температуры
  temperatureMin: number;
  // Изображение
  image: string;
  // Номер Виганда
  wigand: number;
  // Фамилия персоны
  lastName: string;
  // Отчество персоны
  middleName: string;
  // Фамилия персоны
  firstName: string;
}
