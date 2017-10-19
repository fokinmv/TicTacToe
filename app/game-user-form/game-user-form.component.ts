import { Component, Output } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { GameService } from '../shared/game.service';

@Component({
    moduleId: module.id,
    selector: "game-user-form",
    templateUrl: "./game-user-form.component.html",
    styleUrls: ["./game-user-form.component.css"]
})
export class GameUserForm {
    size: number = 3;
    sizes: number[] = [3, 4, 5, 6, 7, 8, 9];

    @Output() user: string = this.user;

    constructor(
        private gameService: GameService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    onSubmit() {
        let gameToken: string = this.gameService.createGame(this.user, this.size);
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
