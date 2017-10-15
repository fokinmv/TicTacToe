import { Component, Input, OnInit } from '@angular/core';

import { Game } from '../shared/game.class';

@Component({
    moduleId: module.id,
    selector: "game-item",
    templateUrl: "./game-item.component.html",
    styleUrls: ["./game-item.component.css"]
})

export class GameItemComponent implements OnInit{
    @Input() game: Game;
    timer: number;
    winnerOwner: string;
    winnerOpponent: string;

    ngOnInit(){
        if(this.game.gameResult == this.game.owner) this.winnerOwner = "Win";
        if((this.game.opponent != "") && (this.game.gameResult == this.game.opponent)) this.winnerOpponent = "Win";
        
        //интервал для реализации таймера на иконке игры
        setInterval(() => this.timer = Date.now() - this.game.gameCreateTime, 100);
    }
}

