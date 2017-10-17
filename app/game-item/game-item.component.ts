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
    winnerIndication: string = "Win";

    ngOnInit(){
        if(this.game.gameResult == this.game.owner) {
            this.winnerOwner = this.winnerIndication;
        }

        if((this.game.opponent != "") && (this.game.gameResult == this.game.opponent)) {
            this.winnerOpponent = this.winnerIndication;
        }
        
        setInterval(() => this.refreshGameTimerOnList(this.game), 100);
    }

    refreshGameTimerOnList(game : Game){
        this.timer = Date.now() - this.game.gameCreateTime;
    }
}

