import { Component, Output } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { GameService } from '../shared/game.service';

@Component({
  selector: 'app-game-user-form',
  templateUrl: './game-user-form.component.html',
  styleUrls: ['./game-user-form.component.css']
})
export class GameUserFormComponent {
  size = 3;
  sizes = [3, 4, 5, 6, 7, 8, 9];

  @Output() user: string = this.user;

  constructor(
    private gameService: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  onSubmit() {
    const gameToken: string = this.gameService.createGame(this.user, this.size);
    this.router.navigate(
      ['/game', gameToken],
      {
        queryParams : {
          user : this.user
        }
      }
    );
  }
}
