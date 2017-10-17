import { Game } from './game.class';

export class GameService {
    games: Game[] = [];

    signsQuantityForGameToken : number = 3;

    defaultOpponent : string = "";
    defaultGameResult : string = "?";
    defaultState : string = "ready";
    gameInProcess : string = "playing";
    gameIsOver : string = "done";
    drawInGame : string = "draw";
    roleX : string = "X";
    role0 : string = "0";

    win : boolean = false;

    getGamesFromDb(){
        return window.localStorage.getItem("games");
    }

    getPasreGames(){
        let allGames: any = this.getGamesFromDb();
        let objectAllGames = JSON.parse(allGames)
        if (objectAllGames == null) {
            objectAllGames = [];
        }
        return objectAllGames;
    }

    saveGamesFromDb( data : any ) : any {
        window.localStorage.setItem("games", JSON.stringify(data));
    }

    getGameList() {
        let objectAllGames = this.getPasreGames();
        objectAllGames.sort(function( a : any , b : any ){
            let c = a.state;
            let d = b.state;

            if( c < d){
                return 1;
                } else if (c > d) {
                    return -1;
                }
                return 0;
            }
        )
        return objectAllGames;
    }

    createGame( owner : string, size : number ) {
        let game = new Game (owner,this.defaultOpponent,size,Date.now(),Date.now(),this.defaultGameResult,this.defaultState);
  
        game.value = createMatrix(game.size);
        game.gameToken = generateGameToken(this.signsQuantityForGameToken);
        game.accessTokenPlayer1 = generateAccessToken();

        setHeaders(game.gameToken, game.accessTokenPlayer1);

        let objectAllGames = this.getPasreGames();
        objectAllGames.push(game);
        this.saveGamesFromDb(objectAllGames);
        return game.gameToken;
    }

    joinGame( game : Game, user : string ) {
        if( user ) {
            if(this.isOpponentEmpty(game)) {
                game.opponent = user;
                game.accessTokenPlayer2 = generateAccessToken();
                window.localStorage.setItem("accessTokenPlayer2", game.accessTokenPlayer2);
                game.state = this.gameInProcess;
                game.lastActivitesTime = Date.now();

                this.saveGame(game.gameToken, game);
            }
            return game.gameToken;
        }
    }

    saveGame( gameToken : any, game : Game) {
        let objectAllGames = this.getPasreGames();
        let newGameList : any = [];

        objectAllGames.forEach(function( item : Game, i : number, arr : any[]){
            if(item.gameToken == gameToken) {
                item = game;
            }
            newGameList.push(item);
        });
        this.saveGamesFromDb(newGameList);
    }

    saveGameChanges( gameTokenFromUrl : any, game : Game) {
        this.saveGame(gameTokenFromUrl.gameToken, game);
    }

    getGame( gameTokenFromUrl : any ) {
        let objectAllGames = this.getPasreGames();
        let neededGameItem : any;
        
        objectAllGames.forEach(function( item : Game, i : number, arr : any[]){
            if(item.gameToken == gameTokenFromUrl.gameToken) {
                neededGameItem = item;
            }
        });

        return neededGameItem;
    }

    deleteGame( gameTokenFromUrl : any ){
        let objectAllGames = this.getPasreGames();
        let newGameList : any = [];

        objectAllGames.forEach(function( item : Game, i : number, arr : any[]){
            if(item.gameToken == gameTokenFromUrl.gameToken) {
                return;
            }
            newGameList.push(item);
        });
        this.saveGamesFromDb(newGameList);
    }

    checkAndDeleteInactivityGamesByList() {
        let objectAllGames = this.getPasreGames();

        let timer10Min : number = 10*60*1000;
        let newGameList : any = [];

        objectAllGames.forEach(function( item : Game, i : number, arr : any[]){
           if((Date.now() - item.lastActivitesTime) < timer10Min) {
               newGameList.push(item);
            }
        });

        this.saveGamesFromDb(newGameList);
    }

    gameSurrender( gameToken : string, user : string ){
        let game  = this.getGame(gameToken);

        if(game.owner == user) {
            game.gameResult = game.opponent;
            game.state = this.gameIsOver;
            this.saveGameChanges(gameToken, game);
        }
        if(game.opponent == user) {
            game.gameResult = game.owner;
            game.state = this.gameIsOver;
            this.saveGameChanges(gameToken, game);
        }
    }

    enterValueCell( gameToken : string, x : number, y : number, role : string){
        let game  = this.getGame(gameToken);
        let matrix = game.value;        
        matrix[y][x] = role;
        game.lastActivitesTime = Date.now();
        this.saveGameChanges(gameToken, game);
    };

    checkNullCell( gameToken : string ){
        let game  = this.getGame(gameToken);
        let matrix = game.value;
        let result = false;
        
        for(var i=0; i<game.size; i++){
            for(var j=0; j<game.size; j++){
                if(matrix[i][j] == null) result = true;
            }
        }

        if(result == false) {
            game.gameResult = this.drawInGame;
            game.state = this.gameIsOver;
        }
        this.saveGameChanges(gameToken, game);
    };

    checkWin( gameToken : string, x : number, y : number, role : string){
        
        let game  = this.getGame(gameToken);
        let matrix = game.value;
        
        let size = game.size;

        this.checkWinRow(matrix, x, y, size, role);
        this.checkWinCollumn(matrix, x, y, size, role);
        this.checkWinDiagonalLeftUpRightDown(matrix, x, y, size, role);
        this.checkWinDiagonalLeftDownRightUp(matrix, x, y, size, role);

        if(this.win) {
            if (role == this.roleX) {
                game.gameResult = game.owner;
            }
            if (role == this.role0) {
                game.gameResult = game.opponent;
            }
            if(this.winnerDefineed(game)) {
                game.state = this.gameIsOver;
            }
        }
        this.saveGameChanges(gameToken, game);
    };

    checkCellValue( gameToken : string, x : number, y : number){
        let game  = this.getGame(gameToken);
        let matrix = game.value;
        if (matrix[y][x] == null) {
            return true;
        }
    };

    checkAccess( gameToken : string, user : string) {
        let game  = this.getGame(gameToken);
        if((user===game.owner) || (user===game.opponent)) {
            return true;
        }
    }

    checkWhoTurn ( gameToken : string, user : string) : boolean | undefined {
        let game  = this.getGame(gameToken);
        let matrix = game.value;
        let counter : number = 0;

        for(let i : number = 0; i<game.size; i++) {
            for(let j = 0; j < game.size; j++) {
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

    isTurnOwner(counter : number, user : string, game : Game) {
        return ((counter % 2 == 0) && (user == game.owner));
    }

    isTurnOpponent(counter : number, user : string, game : Game) {
        return ((counter % 2 != 0) && (user == game.opponent));
    }

    defineCell( coordinate : any, cellSize : number) {
        let cellNumber : number = Math.floor(coordinate/cellSize);
        return cellNumber;
    };

    isOpponentEmpty(game : Game) {
        return game.opponent == this.defaultOpponent;
    };

    checkWinRow(matrix : any, x : number, y : number, size : number, role : string) {
        if ((x - 2 >= 0 ) && (matrix[y][x - 2] == role) && (matrix[y][x - 1] == role) && (matrix[y][x] == role)){
            this.win = true;
        }
        if ((x - 1 >= 0 ) && (x + 1 < size ) && (matrix[y][x - 1] == role) && (matrix[y][x] == role) && (matrix[y][x + 1] == role)) {
            this.win = true;
        }
        if ((x + 2 < size ) && (matrix[y][x] == role) && (matrix[y][x + 1] == role) && (matrix[y][x + 2] == role)) {
            this.win = true;
        }
    }

    checkWinCollumn(matrix : any, x : number, y : number, size : number, role : string) {
        if ((y - 2 >= 0 ) && (matrix[y - 2][x] == role) && (matrix[y - 1][x] == role) && (matrix[y][x] == role)) {
            this.win = true;
        }
        if ((y - 1 >= 0 ) && (y + 1 < size ) && (matrix[y - 1][x] == role) && (matrix[y][x] == role) && (matrix[y + 1][x] == role)) {
            this.win = true;
        }
        if ((y + 2 < size ) && (matrix[y][x] == role) && (matrix[y + 1][x] == role) && (matrix[y + 2][x] == role)) {
            this.win = true;
        }
    }

    checkWinDiagonalLeftUpRightDown(matrix : any, x : number, y : number, size : number, role : string) {
        if ((y - 2 >= 0 ) && (x - 2 >= 0 ) && (matrix[y - 2][x - 2] == role) && (matrix[y - 1][x - 1] == role) && (matrix[y][x] == role)) {
            this.win = true;
        }
        if ((y - 1 >= 0 ) && (y + 1 < size ) && (x - 1 >= 0 )  && (x + 1 < size ) && (matrix[y - 1][x - 1] == role) && (matrix[y][x] == role) && (matrix[y + 1][x + 1] == role)) {
            this.win = true;
        }
        if ((y + 2 < size ) && (x + 2 < size ) && (matrix[y][x] == role) && (matrix[y + 1][x + 1] == role) && (matrix[y + 2][x + 2] == role)) {
            this.win = true;
        }
    }

    checkWinDiagonalLeftDownRightUp(matrix : any, x : number, y : number, size : number, role : string) {
        if ((y - 2 >= 0 ) && (x + 2 < size ) && (matrix[y -2][x + 2] == role) && (matrix[y - 1][x + 1] == role) && (matrix[y][x] == role)) {
            this.win = true;
        }
        if ((y - 1 >= 0 ) && (y + 1 < size ) && (x - 1 >= 0 )  && (x + 1 < size ) && (matrix[y - 1][x + 1] == role) && (matrix[y][x] == role) && (matrix[y + 1][x - 1] == role)) {
            this.win = true;
        }
        if ((y + 2 < size ) && (x - 2 >= 0 ) && (matrix[y][x] == role) && (matrix[y + 1][x - 1] == role) && (matrix[y + 2][x - 2] == role)) {
            this.win = true;
        }
    }

    winnerDefineed(game : Game){
        return ((game.gameResult == game.owner) || (game.gameResult == game.opponent));
    }
}

function createMatrix( size : number ){
    let arr: any = [];
    for(let i=0; i<size; i++){
        arr[i] = [];
        for(let j=0; j<size; j++){
            arr[i][j] = null;
        }
    }
    return arr;
};

function generateGameToken( signsQuantityForGameToken : number ) : string {
    let key : string = "";
    let keyAbc : string = "abcdefghijklmnopqrstuvwxyz";
    let key123 : string = "0123456789";

    while(key.length < signsQuantityForGameToken)
        key += keyAbc[Math.random() * keyAbc.length|0];
    while(key.length < 2*signsQuantityForGameToken)
    key += key123[Math.random() * key123.length|0];

    return key;
};

function generateAccessToken() : string{
    let key : string = "";
    let keyAbc123 : string = "abcdefghijklmnopqrstuvwxyz0123456789";

    while( key.length < 12 )
    key += keyAbc123[Math.random() * keyAbc123.length|0];

    return key;
};

function setHeaders(gameToken : string, accessTokenPlayer1 : string) {
    window.localStorage.setItem("gameToken", gameToken);
    window.localStorage.setItem("accessTokenPlayer1", accessTokenPlayer1);
}