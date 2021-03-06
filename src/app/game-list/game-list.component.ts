import { Component, Input, Output, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Game } from '../shared/game';
import { GameService } from '../shared/game.service';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.css']
})

export class GameListComponent implements OnInit {
  @ViewChild('oneGameArea') oneGameArea: ElementRef;

      games: Game[];
      @Input() userName: string;

      regularExpression: any = /^[\S][а-яёa-z0-9_-\s]{0,}/i;

      height: number;
      fontSize: number;

      proportionFontSize = 10;

  constructor(
    private gameService: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.games = [];
  }

  isReadyVisible = false;
  isPlayingVisible = false;
  isDoneVisible = false;

  ngOnInit() {
    this.games = this.gameService.getGameList();
    setInterval(() => {
      this.games = this.gameService.getGameList();

      if (this.gamesListNotEmpty(this.games)) {
        this.gameService.checkAndDeleteInactivityGamesByList();
      }
    }, 2000);
  }

  ngAfterViewInit(): void {
    setInterval(() => this.changeHeightAndFontSize(), 0);
  }

  join(game: Game) {
    if (this.userName.match(this.regularExpression)) {
      const gameToken: any = this.gameService.joinGame(game, this.userName);
      if (gameToken) {
        this.router.navigate(
          ['/game', gameToken],
          {
            queryParams : {
              user : this.userName
            }
          }
        );
      }
    }
  }

  gamesListNotEmpty(games: Game[]) {
    return this.games.length > 0;
  }

  changeHeightAndFontSize() {
    const htmlBlockItemGame: HTMLElement|null = document.getElementById('oneGameArea');

    if (htmlBlockItemGame) {
      this.height = Math.round(htmlBlockItemGame.offsetWidth);
      this.fontSize = Math.round(this.height / this.proportionFontSize);
    }
  }
}
