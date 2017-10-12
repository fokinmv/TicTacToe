import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgClass } from '@angular/common';

import { Game } from '../shared/game.class';
import { GameService } from '../shared/game.service';

@Component({
    moduleId: module.id,
    selector: 'app-gamefield',
    templateUrl: "./gamefield.component.html",
    styleUrls: ["./gamefield.component.css"]
})
export class GamefieldComponent implements OnInit{
    @ViewChild('gamePlace') public gamePlace:ElementRef;
    private canvas: any;

    cellSize = 50;
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
    ) 
    {
        //получаем gameToken из URL'а
        ar.params.subscribe(param => this.gameToken = param);
        //получаем User'а из URL'а
        ar.queryParams.subscribe(params => this.user = params.user);
    }
    ngOnInit(){
        this.game = this.gameService.getGame(this.gameToken);
        //не нравится. Таймер для обновления времени          
        setInterval(() => this.timer = Date.now() - this.game.gameCreateTime, 100);

        //обновляем каждые 2 секунды
        let timerGame = setInterval(() => {
            this.game = this.gameService.getGame(this.gameToken);

            this.ownerTurn = this.gameService.checkWhoTurn(this.gameToken, this.game.owner);
            this.opponentTurn = this.gameService.checkWhoTurn(this.gameToken, this.game.opponent
            );

            //проверяем, время с последней активности - если больше 5 минут - удаляем игру
            let timer5Min : number = 5*60*1000;
            if ((Date.now() - this.game.lastActivitesTime) > timer5Min) {
                alert('Игра закрыта из-за бездействия игроков более 5 минут');
                this.gameService.deleteGame(this.gameToken);
                this.router.navigate(['/']);
                clearInterval(timerGame);
            }

            //проверяем, может игра закончилась 
            if(this.game.gameResult != ""){
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
            console.log();
            this.drowX0(this.game.value, this.game.size);
        }, 2000);
        

    }
    ngAfterViewInit() {
        this.canvas = this.gamePlace.nativeElement;
        //рисуем игровое поле
        this.drawGameTable();
        //рисовать крестики/нолики если есть в поле такие
        this.drowX0(this.game.value, this.game.size);
    }
    gameFieldClick(event: any){
        console.log("Клик по игровому полю");
        if(this.gameService.checkAccess(this.gameToken, this.user)) {
            console.log("На игровое поле нажал Player1 или Player2");
            
            if (this.gameService.checkWhoTurn(this.gameToken, this.user)) {
                console.log("Ваш ход");
                // определяем ячейку, куда ткнули
                let coordinateCellX : number = this.gameService.defineCell(event.offsetX, this.cellSize);
                let coordinateCellY : number = this.gameService.defineCell(event.offsetY, this.cellSize);
                // вывод координаты выбранной ячейки в консоль
                console.log("X: " + coordinateCellX + " Y: " + coordinateCellY); 
                
                if (this.gameService.checkCellValue(this.gameToken,coordinateCellX, coordinateCellY)) {
                    if (this.user == this.game.owner) {
                        this.gameService.enterValueCell(this.gameToken, coordinateCellX, coordinateCellY, 'X');
                        this.drawX(coordinateCellX, coordinateCellY);
                        this.gameService.checkWin(this.gameToken, coordinateCellX, coordinateCellY, 'X');
                    }
                    if (this.user == this.game.opponent) {
                        this.gameService.enterValueCell(this.gameToken, coordinateCellX, coordinateCellY, '0');
                        this.draw0(coordinateCellX, coordinateCellY);
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

    drawGameTable() {
        console.log("Куку " + this.game.size + " " + this.cellSize);
        if (this.canvas.getContext) {
            let canvas = this.canvas;
            if (canvas.getContext) {
                var ctx = canvas.getContext('2d');

                canvas.width = this.game.size*this.cellSize + 1;
                canvas.height = this.game.size*this.cellSize + 1;
                //рисуем большую рамку
                let widthTable: number = this.game.size*this.cellSize;
                ctx.strokeRect(0,0,widthTable,widthTable);
                //рисуем ячейки
                for (let i: number = 0; i < this.game.size; i++)
                    for (let j: number = 0; j < this.game.size; j ++) {
                    ctx.strokeRect(1 + j*this.cellSize, 1 + i*this.cellSize, this.cellSize, this.cellSize);
                    }
            }
        }
    }



    drawX (coordinateCellX : number, coordinateCellY : number) {
        let centerCellX : number = this.gameService.defineCellCenter(coordinateCellX, this.cellSize);
        let centerCellY : number = this.gameService.defineCellCenter(coordinateCellY, this.cellSize);

        let line1Start1 = centerCellX-0.25*this.cellSize;
        let line1Start2 = centerCellY-0.25*this.cellSize;
        let line1Finish1 = centerCellX+0.25*this.cellSize;        
        let line1Finish2 = centerCellY+0.25*this.cellSize;

        let line2Start1 = centerCellX-0.25*this.cellSize;
        let line2Start2 = centerCellY+0.25*this.cellSize;
        let line2Finish1 = centerCellX+0.25*this.cellSize;
        let line2Finish2 = centerCellY-0.25*this.cellSize;
        
        if (this.canvas.getContext) {
            let canvas = this.canvas;
            if (canvas.getContext) {        
                var ctx = canvas.getContext('2d');
        
                ctx.beginPath();
                ctx.moveTo(line1Start1,line1Start2);
                ctx.lineTo(line1Finish1,line1Finish2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(line2Start1,line2Start2);
                ctx.lineTo(line2Finish1,line2Finish2);    
                ctx.stroke();
            }
        }
    }

    draw0 (coordinateCellX : number, coordinateCellY : number){
        let centerCellX = this.gameService.defineCellCenter(coordinateCellX, this.cellSize);
        let centerCellY = this.gameService.defineCellCenter(coordinateCellY, this.cellSize);        

        var radiusO = this.cellSize/4;

        if (this.canvas.getContext) {
            let canvas = this.canvas;
            if (canvas.getContext) {        
                var ctx = canvas.getContext('2d');

                ctx.beginPath();
                ctx.arc(centerCellX,centerCellY,radiusO,0,Math.PI*2,true);
                ctx.stroke();
            }
        }
    }

    drowX0(value : any, size : number){
        for(var i=0; i<size; i++){
            for(var j=0; j<size; j++){
                if (value[i][j] == 'X') this.drawX(j,i);
                if (value[i][j] == '0') this.draw0(j,i);
             };
         }
    };
}