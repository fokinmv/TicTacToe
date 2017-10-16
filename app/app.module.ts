import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { GameUserForm } from './game-user-form/game-user-form.component';
import { GameListComponent } from './game-list/game-list.component';
import { GameItemComponent } from './game-item/game-item.component';
import { GameService } from './shared/game.service';
import { PaintService } from './shared/paint.service';
import { GameFieldComponent } from './game-field/game-field.component';

const appRoutes = [
    { path: '', component: GameUserForm },
    { path: 'game/:gameToken', component: GameFieldComponent }
];

@NgModule({
    declarations: [
        AppComponent,
        GameUserForm,
        GameListComponent,
        GameItemComponent,
        GameFieldComponent
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
export class AppModule {}