import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {

  // Событие для инициализации обнолвения интерфейсов термобоксов. Передётся идентификатор
  // обновляемого термопада или 0 для обновления всех термопадов.
  // -1 - обновить все боксы
  // 0 - игнорируется
  // N - обновить конкретрый бокс
  public isTrmapadsBoxUpdate: BehaviorSubject<number> = new BehaviorSubject<number>(0);
}
