import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { GameUserFormComponent } from './game-user-form/game-user-form.component';
import { GameFieldComponent } from './game-field/game-field.component';
import { GameItemComponent } from './game-item/game-item.component';
import { GameListComponent } from './game-list/game-list.component';

import { GameService } from './shared/game.service';
import { PaintService } from './shared/paint.service';

const appRoutes = [
  { path: '', component: GameUserFormComponent },
  { path: 'game/:gameToken', component: GameFieldComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    GameUserFormComponent,
    GameFieldComponent,
    GameItemComponent,
    GameListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [
    GameService,
    PaintService,
],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
