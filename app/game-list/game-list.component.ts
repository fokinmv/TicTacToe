import { Component, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Game } from '../shared/game.class';
import { GameService } from '../shared/game.service';

@Component({
    moduleId: module.id,
    selector: "game-list",
    templateUrl: "./game-list.component.html",
    styleUrls: ["./game-list.component.css"]
})

export class GameListComponent {
    @ViewChild('oneGameArea') oneGameArea : ElementRef;

    games : Game[];
    @Input() userName : string;

    height : number;
    fontSize : number;

    constructor(
        private gameService : GameService,
        private route : ActivatedRoute,
        private router : Router)
    {
        this.games = [];
    }

    isReadyVisible : boolean = false;
    isPlayingVisible : boolean = false;
    isDoneVisible : boolean = false;

    ngOnInit() {
        this.games = this.gameService.getGameList();
        setInterval(() => {
            this.games = this.gameService.getGameList();

            if(this.gamesListNotEmpty(this.games)) {
                this.gameService.checkAndDeleteInactivityGamesByList();
            }
        }, 2000);
    }

    ngAfterViewInit() : void {
        setInterval(() => this.changeHeightAndFontSize(), 0);
    }

    join(game : Game) {
        let gameToken: any = this.gameService.joinGame(game, this.userName);
        
        if(gameToken) {
            this.router.navigate(
                ['/game', gameToken],
                {
                    queryParams : {
                        user : this.userName
                    }
                }
            )
        }
    }

    gamesListNotEmpty(games : Game[]) {
        return this.games.length > 0;
    }

    changeHeightAndFontSize() {
        let htmlBlockItemGame:HTMLElement|null = document.getElementById("oneGameArea");
        
        if (htmlBlockItemGame){
            this.height = Math.round(htmlBlockItemGame.offsetWidth);
            this.fontSize = Math.round(this.height/10);
        }
    }
}