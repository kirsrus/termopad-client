import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatDialogModule} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';


const materialComponents = [
  MatTableModule,  // Таблицы
  MatButtonModule,  // Для отображения кнопок button
  MatMenuModule,  // Для меню mat-menu-trigger-for
  MatToolbarModule,   // Для вывода виджета mat-toolbar
  MatIconModule,  // Для вывода иконок mat-icon
  MatCardModule,  // Корточки
  MatGridListModule,  // Grid
  MatDialogModule,  // Модальные диалоги
  BrowserAnimationsModule,
  MatTabsModule, // Модуль табуляции
  MatPaginatorModule, // Разбивка на страницы
  MatSortModule,
  MatFormFieldModule,
  MatInputModule,
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    materialComponents
  ],
  exports: [materialComponents]
})
export class MaterialModule {
}
