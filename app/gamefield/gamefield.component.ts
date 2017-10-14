import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgClass } from '@angular/common';

import { Game } from '../shared/game.class';
import { GameService } from '../shared/game.service';
import { PaintService } from '../shared/paint.service';

@Component({
    moduleId: module.id,
    selector: 'app-gamefield',
    templateUrl: "./gamefield.component.html",
    styleUrls: ["./gamefield.component.css"]
})
export class GamefieldComponent implements OnInit{
    @ViewChild('gamePlace') public gamePlace:ElementRef;
    private canvas: any;

    gameToken: any;
    game: Game;
    user: string;
    timer: number;

    ownerTurn: boolean | undefined = false;
    opponentTurn: boolean | undefined = false;

    constructor(
        private router: Router,
        private ar: ActivatedRoute,
        private gameService: GameService,
        private paintService: PaintService,
    ) 
    {
        //получаем gameToken из URL'а
        ar.params.subscribe(param => this.gameToken = param);
        //получаем User'а из URL'а
        ar.queryParams.subscribe(params => this.user = params.user);
    }
    ngOnInit(){
        this.game = this.gameService.getGame(this.gameToken);
        //таймер для обновления времени          
        setInterval(() => this.timer = Date.now() - this.game.gameCreateTime, 100);

        //обновляем каждые 2 секунды
        let timerGame = setInterval(() => {
            this.game = this.gameService.getGame(this.gameToken);

            //для индикации - чей ход
            this.ownerTurn = this.gameService.checkWhoTurn(this.gameToken, this.game.owner);
            this.opponentTurn = this.gameService.checkWhoTurn(this.gameToken, this.game.opponent);

            //проверяем, время с последней активности - если больше 5 минут - удаляем игру
            let timer5Min : number = 5*60*1000;
            if ((Date.now() - this.game.lastActivitesTime) > timer5Min) {
                this.gameService.deleteGame(this.gameToken);
                alert('Игра закрыта из-за бездействия игроков более 5 минут');
                this.router.navigate(['/']);
                clearInterval(timerGame);
            }

            //проверяем, может игра закончилась 
            if(this.game.gameResult != "?"){
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
                        alert('В этой игре победил игрок ' + this.game.gameResult);
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
        //рисуем игровое поле
        this.paintService.drawGameTable(this.canvas, this.game.size);
        //рисовать крестики/нолики, если есть в поле такие
        this.paintService.drawX0(this.canvas, this.game.value, this.game.size);
    }

    gameFieldClick(event: any){        
        if(this.gameService.checkAccess(this.gameToken, this.user)) {

            if (this.gameService.checkWhoTurn(this.gameToken, this.user)) {
                console.log("Ваш ход");

                // определяем координаты ячейку, куда ткнули
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
                //проверка наличия пустых клеток, вдруг ничья
                this.gameService.checkNullCell(this.gameToken);

            } else console.log("Сейчас не ваш ход!");
        } else console.log("На игровое поле нажал НАБЛЮДАТЕЛЬ");
    }
    exit(){
        console.log("ВЫХОД");
        this.gameService.gameSurrender(this.gameToken, this.user);
        this.router.navigate(['/']);
    }
}