import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgClass } from '@angular/common';

import { Game } from '../shared/game.class';
import { GameService } from '../shared/game.service';
import { PaintService } from '../shared/paint.service';

@Component({
    moduleId: module.id,
    selector: 'app-game-field',
    templateUrl: "./game-field.component.html",
    styleUrls: ["./game-field.component.css"]
})
export class GameFieldComponent implements OnInit{
    @ViewChild('gamePlace') public gamePlace:ElementRef;
    private canvas: any;

    gameToken: any;
    game: Game;
    user: string;
    timer: number;

    ownerTurn: boolean | undefined = false;
    opponentTurn: boolean | undefined = false;

    timer5Min : number = 5*60*1000;
    defaultGameResult : string = "?";

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private gameService: GameService,
        private paintService: PaintService,
    ) 
    {
        this.getGameTokenFromUrl(activatedRoute);
        this.getUserFromQueryParams(activatedRoute);
    }

    ngOnInit(){
        this.game = this.gameService.getGame(this.gameToken);
        setInterval(() => this.refreshGameTimer(this.game), 100);

        let timerGame = setInterval(() => {
            this.game = this.gameService.getGame(this.gameToken);
            this.indicationWhoWillTurn(this.game);

            if (this.checkLastActivitesTime(this.game)) {
                this.gameService.deleteGame(this.gameToken);
                alert('Игра закрыта из-за бездействия игроков более 5 минут');
                this.router.navigate(['/']);
                clearInterval(timerGame);
            }

            if(this.isGameOver(this.game)) {
                switch (this.game.gameResult) {
                    case "draw":
                        alert('В этой игре никто не победил - Ничья');
                        this.router.navigate(['/']);
                        clearInterval(timerGame);
                        break;

                    case this.game.owner:
                        alert('В этой игре победил игрок ' + this.game.gameResult);
                        this.router.navigate(['/']);
                        clearInterval(timerGame);
                        break;

                    case this.game.opponent:
                        if (this.game.opponent != "") {
                            alert('В этой игре победил игрок ' + this.game.gameResult);
                        }
                        this.router.navigate(['/']);
                        clearInterval(timerGame);
                        break;
                }       
            }

            this.paintService.drawX0(this.canvas, this.game.value, this.game.size);
        }, 2000);
    }

    ngAfterViewInit() {
        this.canvas = this.gamePlace.nativeElement;
        this.paintService.drawGameTable(this.canvas, this.game.size);
        this.paintService.drawX0(this.canvas, this.game.value, this.game.size);
    }

    gameFieldClick(event: any) {
        if(this.gameService.checkAccess(this.gameToken, this.user)) {

            if (this.gameService.checkWhoTurn(this.gameToken, this.user)) {
                let coordinateCellX : number = this.gameService.defineCell(event.offsetX, this.paintService.cellSize);
                let coordinateCellY : number = this.gameService.defineCell(event.offsetY, this.paintService.cellSize);
                
                if (this.gameService.checkCellValue(this.gameToken,coordinateCellX, coordinateCellY)) {
                    if (this.user == this.game.owner) {
                        this.gameService.enterValueCell(this.gameToken, coordinateCellX, coordinateCellY, 'X');
                        this.paintService.drawX(this.canvas,coordinateCellX,coordinateCellY);
                        this.gameService.checkWin(this.gameToken, coordinateCellX, coordinateCellY, 'X');
                    }
                    if (this.user == this.game.opponent) {
                        this.gameService.enterValueCell(this.gameToken, coordinateCellX, coordinateCellY, '0');
                        this.paintService.draw0(this.canvas,coordinateCellX,coordinateCellY);
                        this.gameService.checkWin(this.gameToken, coordinateCellX, coordinateCellY, '0');
                    }
                }
                this.gameService.checkNullCell(this.gameToken);

            }
        }
    }

    exit() {
        this.gameService.gameSurrender(this.gameToken, this.user);
        this.router.navigate(['/']);
    }

    getGameTokenFromUrl(activatedRoute : any) {
        activatedRoute.params.subscribe((param : any) => this.gameToken = param);
    }

    getUserFromQueryParams(activatedRoute : any) {
        activatedRoute.queryParams.subscribe((params : any) => this.user = params.user);
    }

    refreshGameTimer(game : Game) {
        this.timer = Date.now() - this.game.gameCreateTime;
    }

    indicationWhoWillTurn(game : Game) {
        this.ownerTurn = this.gameService.checkWhoTurn(this.gameToken, this.game.owner);
        this.opponentTurn = this.gameService.checkWhoTurn(this.gameToken, this.game.opponent);
    }

    checkLastActivitesTime(game : Game) {
        return (Date.now() - this.game.lastActivitesTime) > this.timer5Min;
    }

    isGameOver(game : Game) {
        return this.game.gameResult != this.defaultGameResult;
    }
}

