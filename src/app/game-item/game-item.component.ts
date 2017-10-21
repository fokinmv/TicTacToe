import { Component, Input, OnInit } from '@angular/core';

import { Game } from '../shared/game';

@Component({
  selector: 'app-game-item',
  templateUrl: './game-item.component.html',
  styleUrls: ['./game-item.component.css']
})

export class GameItemComponent implements OnInit {
  @Input() game: Game;
  timer: number;
  winnerOwner: string;
  winnerOpponent: string;
  winnerIndication = 'Win';
  defaultOpponent = '';

  ngOnInit() {
    if (this.isOwnerWin(this.game)) {
      this.winnerOwner = this.winnerIndication;
    }

    if ((this.isGameOpponentExist(this.game)) && (this.isOpponentWin(this.game))) {
      this.winnerOpponent = this.winnerIndication;
    }

    setInterval(() => this.refreshGameTimerOnList(this.game), 100);
  }

  refreshGameTimerOnList(game: Game) {
    this.timer = Date.now() - this.game.gameCreateTime;
  }

  isOwnerWin(game: Game) {
    return this.game.gameResult === this.game.owner;
  }

  isOpponentWin(game: Game) {
    return this.game.gameResult === this.game.opponent;
  }

  isGameOpponentExist(game: Game) {
    return this.game.opponent !== this.defaultOpponent;
  }
}
