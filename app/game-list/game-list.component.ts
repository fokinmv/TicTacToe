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
    @ViewChild('oneGameArea') oneGameArea:ElementRef;

    games: Game[];
    @Input() userName: string;

    height:number = 290;
    fontSize:number = 29;

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
            //проверять и удалять игры с бездействием 10 минут только если есть хотя бы одна игра
            if(this.games.length > 0) this.gameService.checkAndDeleteInactivityGamesByList();
        }, 2000);
    }

    ngAfterViewInit(): void {
        //изменяем высоту блока и шрифт содержимого в зависимости от ширины блока одной игры
        setInterval(() => {
            let htmlBlockItemGame:HTMLElement|null = document.getElementById("oneGameArea");
            if (htmlBlockItemGame){
                this.height = Math.round(htmlBlockItemGame.offsetWidth);
                this.fontSize = Math.round(this.height/10);
            }
        },0);
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