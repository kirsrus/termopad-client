// Описание персоны на термопаде
export class TermapadPersonDto {
  // Время создания записи
  createdAt: Date;
  // Время последнего обновления данных
  updatedAt: Date;
  // Идентификатор термопада
  termapadID: number;
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
  // Отед
  personDepartament: string;
  // Должность
  personPostion: string;
}
