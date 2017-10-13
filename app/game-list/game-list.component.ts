import { Component, Input, Output } from '@angular/core';
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
    games: Game[];
    @Input() userName: string;

    constructor(
        private gameService: GameService,
        private route: ActivatedRoute,
        private router: Router)
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
            //проверять игры с бездействием 10 минут
            if(this.games.length > 0) this.gameService.checkAndDeleteInactivityGamesByList();
        }, 2000);
    }

    join(game: Game) {
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
}