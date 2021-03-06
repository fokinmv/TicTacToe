import { Injectable } from '@angular/core';

import { Game } from './game';

@Injectable()
export class GameService {
  games: Game[] = [];

  signsQuantityForGameToken = 3;

  defaultOpponent = '';
  defaultGameResult  = '?';
  defaultState  = 'ready';
  gameInProcess  = 'playing';
  gameIsOver  = 'done';
  drawInGame  = 'draw';
  roleX  = 'X';
  role0  = '0';

  win = false;

  getGamesFromDb() {
      return window.localStorage.getItem('games');
  }

  getPasreGames() {
      const allGames: any = this.getGamesFromDb();
      let objectAllGames = JSON.parse(allGames);
      if (objectAllGames == null) {
          objectAllGames = [];
      }
      return objectAllGames;
  }

  saveGamesFromDb( data: any ): any {
      window.localStorage.setItem('games', JSON.stringify(data));
  }

  getGameList() {
      const objectAllGames = this.getPasreGames();
      objectAllGames.sort(function( a: any , b: any ){
          const c = a.state;
          const d = b.state;

          if ( c < d) {
              return 1;
              } else if (c > d) {
                  return -1;
              }
              return 0;
          }
      );
      return objectAllGames;
  }

  createGame( owner: string, size: number ) {
      const game = new Game (owner, this.defaultOpponent, size, Date.now(), Date.now(), this.defaultGameResult, this.defaultState);

      game.value = createMatrix(game.size);
      game.gameToken = generateGameToken(this.signsQuantityForGameToken);
      game.accessTokenPlayer1 = generateAccessToken();

      setHeaders(game.gameToken, game.accessTokenPlayer1);

      const objectAllGames = this.getPasreGames();
      objectAllGames.push(game);
      this.saveGamesFromDb(objectAllGames);
      return game.gameToken;
  }

  joinGame( game: Game, user: string ) {
      if ( user ) {
          if ((this.isOpponentEmpty(game)) && (this.gameIsNotOver(game))) {
              game.opponent = user;
              game.accessTokenPlayer2 = generateAccessToken();
              window.localStorage.setItem('accessTokenPlayer2', game.accessTokenPlayer2);
              game.state = this.gameInProcess;
              game.lastActivitesTime = Date.now();

              this.saveGame(game.gameToken, game);
          }
          return game.gameToken;
      }
  }

  saveGame( gameToken: any, game: Game) {
      const objectAllGames = this.getPasreGames();
      const newGameList: any = [];

      objectAllGames.forEach(function(item: Game, i: number, arr: any[]){
          if (item.gameToken === gameToken) {
              item = game;
          }
          newGameList.push(item);
      });
      this.saveGamesFromDb(newGameList);
  }

  saveGameChanges(gameTokenFromUrl: any, game: Game) {
      this.saveGame(gameTokenFromUrl.gameToken, game);
  }

  getGame(gameTokenFromUrl: any ) {
      const objectAllGames = this.getPasreGames();
      let neededGameItem: any;

      objectAllGames.forEach(function(item: Game, i: number, arr: any[]){
          if (item.gameToken === gameTokenFromUrl.gameToken) {
              neededGameItem = item;
          }
      });

      return neededGameItem;
  }

  deleteGame(gameTokenFromUrl: any ) {
      const objectAllGames = this.getPasreGames();
      const newGameList: any = [];

      objectAllGames.forEach(function(item: Game, i: number, arr: any[]){
          if (item.gameToken === gameTokenFromUrl.gameToken) {
              return;
          }
          newGameList.push(item);
      });
      this.saveGamesFromDb(newGameList);
  }

  checkAndDeleteInactivityGamesByList() {
      const objectAllGames = this.getPasreGames();

      const timer10Min = 10 * 60 * 1000;
      const newGameList: any = [];

      objectAllGames.forEach(function( item: Game, i: number, arr: any[]){
         if ((Date.now() - item.lastActivitesTime) < timer10Min) {
             newGameList.push(item);
          }
      });

      this.saveGamesFromDb(newGameList);
  }

  gameSurrender( gameToken: string, user: string ) {
      const game  = this.getGame(gameToken);

      if (game.owner === user) {
          game.state = this.gameIsOver;
          if (!this.isOpponentEmpty(game)) {
              game.gameResult = game.opponent;
          }
          this.saveGameChanges(gameToken, game);
      }
      if (game.opponent === user) {
          game.gameResult = game.owner;
          game.state = this.gameIsOver;
          this.saveGameChanges(gameToken, game);
      }
  }

  enterValueCell( gameToken: string, x: number, y: number, role: string) {
      const game  = this.getGame(gameToken);
      const matrix = game.value;
      matrix[y][x] = role;
      game.lastActivitesTime = Date.now();
      this.saveGameChanges(gameToken, game);
  }

  checkNullCell( gameToken: string ) {
      const game  = this.getGame(gameToken);
      const matrix = game.value;
      let result = false;

      for (let i = 0; i < game.size; i++) {
          for (let j = 0; j < game.size; j++) {
              if (matrix[i][j] == null) {
                  result = true;
              }
          }
      }

      if (result === false) {
          game.gameResult = this.drawInGame;
          game.state = this.gameIsOver;
      }
      this.saveGameChanges(gameToken, game);
  }

  checkWin( gameToken: string, x: number, y: number, role: string) {
      const game  = this.getGame(gameToken);
      const matrix = game.value;
      const size = game.size;

      this.win = false;

      this.checkWinRow(matrix, x, y, size, role);
      this.checkWinCollumn(matrix, x, y, size, role);
      this.checkWinDiagonalLeftUpRightDown(matrix, x, y, size, role);
      this.checkWinDiagonalLeftDownRightUp(matrix, x, y, size, role);

      if (this.win) {
          if (role === this.roleX) {
              game.gameResult = game.owner;
          }
          if (role === this.role0) {
              game.gameResult = game.opponent;
          }
          if (this.winnerDefineed(game)) {
              game.state = this.gameIsOver;
          }
      }
      this.saveGameChanges(gameToken, game);
  }

  checkCellValue( gameToken: string, x: number, y: number) {
      const game  = this.getGame(gameToken);
      const matrix = game.value;
      if (matrix[y][x] == null) {
          return true;
      }
  }

  checkAccess( gameToken: string, user: string) {
      const game  = this.getGame(gameToken);
      if ((user === game.owner) || (user === game.opponent)) {
          return true;
      }
  }

  checkWhoTurn ( gameToken: string, user: string): boolean | undefined {
      const game  = this.getGame(gameToken);
      const matrix = game.value;
      let counter = 0;

      for (let i = 0; i < game.size; i++) {
          for (let j = 0; j < game.size; j++) {
              if (matrix[i][j] != null) {
                  counter++;
              }
          }
      }

      if (this.isTurnOwner(counter, user, game)) {
          return true;
      }
      if (this.isTurnOpponent(counter, user, game)) {
          return true;
      }
  }

  isTurnOwner(counter: number, user: string, game: Game) {
      return ((counter % 2 === 0) && (user === game.owner));
  }

  isTurnOpponent(counter: number, user: string, game: Game) {
      return ((counter % 2 !== 0) && (user === game.opponent));
  }

  defineCell( coordinate: any, cellSize: number) {
      const cellNumber: number = Math.floor(coordinate / cellSize);
      return cellNumber;
  }

  isOpponentEmpty(game: Game) {
      return game.opponent === this.defaultOpponent;
  }

  gameIsNotOver(game: Game) {
      return game.state !== this.gameIsOver;
  }

  checkWinRow(matrix: any, x: number, y: number, size: number, role: string) {
    const rowLeft =
        (x - 2 >= 0 ) &&
        (matrix[y][x - 2] === role) &&
        (matrix[y][x - 1] === role) &&
        (matrix[y][x] === role);

    const rowCenter =
        (x - 1 >= 0 ) &&
        (x + 1 < size ) &&
        (matrix[y][x - 1] === role) &&
        (matrix[y][x] === role) &&
        (matrix[y][x + 1] === role);

    const rowRight =
        (x + 2 < size ) &&
        (matrix[y][x] === role) &&
        (matrix[y][x + 1] === role) &&
        (matrix[y][x + 2] === role);

    if (rowLeft || rowCenter || rowRight) {
        this.win = true;
    }
  }

  checkWinCollumn(matrix: any, x: number, y: number, size: number, role: string) {
    const collumnUp =
        (y - 2 >= 0 ) &&
        (matrix[y - 2][x] === role) &&
        (matrix[y - 1][x] === role) &&
        (matrix[y][x] === role);

    const collumnCenter =
        (y - 1 >= 0 ) &&
        (y + 1 < size ) &&
        (matrix[y - 1][x] === role) &&
        (matrix[y][x] === role) &&
        (matrix[y + 1][x] === role);

    const collumnDown =
        (y + 2 < size ) &&
        (matrix[y][x] === role) &&
        (matrix[y + 1][x] === role) &&
        (matrix[y + 2][x] === role);

    if (collumnUp || collumnCenter || collumnDown) {
        this.win = true;
    }
  }

  checkWinDiagonalLeftUpRightDown(matrix: any, x: number, y: number, size: number, role: string) {
    const diagonalLeft =
        (y - 2 >= 0 ) &&
        (x - 2 >= 0 ) &&
        (matrix[y - 2][x - 2] === role) &&
        (matrix[y - 1][x - 1] === role) &&
        (matrix[y][x] === role);

    const diagonalCenter =
        (y - 1 >= 0 ) &&
        (y + 1 < size ) &&
        (x - 1 >= 0 )  &&
        (x + 1 < size ) &&
        (matrix[y - 1][x - 1] === role) &&
        (matrix[y][x] === role) &&
        (matrix[y + 1][x + 1] === role);

    const diagonalRight =
        (y + 2 < size ) &&
        (x + 2 < size ) &&
        (matrix[y][x] === role) &&
        (matrix[y + 1][x + 1] === role) &&
        (matrix[y + 2][x + 2] === role);

    if (diagonalLeft || diagonalCenter || diagonalRight) {
        this.win = true;
    }
  }

  checkWinDiagonalLeftDownRightUp(matrix: any, x: number, y: number, size: number, role: string) {
    const diagonalLeft =
        (y - 2 >= 0 ) &&
        (x + 2 < size ) &&
        (matrix[y - 2][x + 2] === role) &&
        (matrix[y - 1][x + 1] === role) &&
        (matrix[y][x] === role);

    const diagonalCenter =
        (y - 1 >= 0 ) &&
        (y + 1 < size ) &&
        (x - 1 >= 0 )  &&
        (x + 1 < size ) &&
        (matrix[y - 1][x + 1] === role) &&
        (matrix[y][x] === role) &&
        (matrix[y + 1][x - 1] === role);

    const diagonalRight =
        (y + 2 < size ) &&
        (x - 2 >= 0 ) &&
        (matrix[y][x] === role) &&
        (matrix[y + 1][x - 1] === role) &&
        (matrix[y + 2][x - 2] === role);


    if (diagonalLeft || diagonalCenter || diagonalRight) {
        this.win = true;
    }
  }

  winnerDefineed(game: Game) {
      return ((game.gameResult === game.owner) || (game.gameResult === game.opponent));
  }
}

function createMatrix(size: number ) {
    const arr: any = [];
  for (let i = 0; i < size; i++) {
      arr[i] = [];
      for (let j = 0; j < size; j++) {
          arr[i][j] = null;
      }
  }
  return arr;
}

function generateGameToken( signsQuantityForGameToken: number ): string {
  let key = '';
  const keyAbc = 'abcdefghijklmnopqrstuvwxyz';
  const key123 = '0123456789';

  while (key.length < signsQuantityForGameToken) {
      key += keyAbc[Math.random() * keyAbc.length | 0];
  }
  while (key.length < 2 * signsQuantityForGameToken) {
      key += key123[Math.random() * key123.length | 0];
  }

  return key;
}

function generateAccessToken(): string {
  let key = '';
  const keyAbc123 = 'abcdefghijklmnopqrstuvwxyz0123456789';

  while ( key.length < 12 ) {
      key += keyAbc123[Math.random() * keyAbc123.length | 0];
  }

  return key;
}

function setHeaders(gameToken: string, accessTokenPlayer1: string) {
  window.localStorage.setItem('gameToken', gameToken);
  window.localStorage.setItem('accessTokenPlayer1', accessTokenPlayer1);
}
