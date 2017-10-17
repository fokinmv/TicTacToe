import { Game } from './game.class';

export class GameService {
    games: Game[] = [];

    signsQuantityForGameToken : number = 3;

    defaultOpponent : string = "";
    defaultGameResult : string = "?";
    defaultState : string = "ready";


    getGamesFromDb(){
        return window.localStorage.getItem("games");
    }

    getPasreGames(){
        let allGames: any = this.getGamesFromDb();
        return JSON.parse(allGames);
    }

    saveGamesFromDb( data : any ) : any {
        window.localStorage.setItem("games", JSON.stringify(data));
    }

    getGameList() {
        let objectAllGames = this.getPasreGames();

        if (objectAllGames == null) {
            objectAllGames = [];
        }

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

    createGame( owner : string, size : number ){
        let game = new Game (owner,this.defaultOpponent,size,Date.now(),Date.now(),this.defaultGameResult,this.defaultState);
  
        game.value = createMatrix(game.size);

        game.gameToken = generateGameToken(this.signsQuantityForGameToken);
        game.accessTokenPlayer1 = generateAccessToken();

        //Якобы хэдэр с гейм токеном и аксесс токеном
        window.localStorage.setItem("gameToken", game.gameToken);
        window.localStorage.setItem("accessTokenPlayer1", game.accessTokenPlayer1);

        //добавляем новую игру в спиcок игр
        let objectAllGames = this.getPasreGames();
        if (objectAllGames == null) objectAllGames = [];
        objectAllGames.push(game);

        this.saveGamesFromDb(objectAllGames);

        return game.gameToken;
    }

    joinGame( game : Game, user : string ){
        if( user ) {
            //Добавляем второго игрока
            if( !game.opponent ) { 
                
                game.opponent = user;

                game.accessTokenPlayer2 = generateAccessToken();
                window.localStorage.setItem("accessTokenPlayer2", game.accessTokenPlayer2);

                game.state = "playing";
                game.lastActivitesTime = Date.now();
                //добавляем изменения о игре
                let objectAllGames = this.getPasreGames();
                let newGameList : any = [];

                objectAllGames.forEach(function( item : Game, i : number, arr : any[]){
                    if(item.gameToken === game.gameToken) item = game;
                    newGameList.push(item);  
                });
                this.saveGamesFromDb(newGameList);
            }

            return game.gameToken;
        }
    }

    getGame( gameTokenFromUrl : any ) {
        let objectAllGames = this.getPasreGames();
        let neededGameItem : any;
        
        objectAllGames.forEach(function( item : Game, i : number, arr : any[]){
            if(item.gameToken == gameTokenFromUrl.gameToken) neededGameItem = item;
        });

        return neededGameItem;
    }

    saveGame( gameTokenFromUrl : any, game : Game) {
        let objectAllGames = this.getPasreGames();
        let newGameList : any = [];

        objectAllGames.forEach(function( item : Game, i : number, arr : any[]){
            if(item.gameToken == gameTokenFromUrl.gameToken) item = game;
            newGameList.push(item);
        });
        
        this.saveGamesFromDb(newGameList);
    }

    deleteGame( gameTokenFromUrl : any ){
        let objectAllGames = this.getPasreGames();
        let newGameList : any = [];

        objectAllGames.forEach(function( item : Game, i : number, arr : any[]){
            if(item.gameToken == gameTokenFromUrl.gameToken) return;
            newGameList.push(item);
        });

        this.saveGamesFromDb(newGameList);
    }

    checkAndDeleteInactivityGamesByList() {

        let objectAllGames = this.getPasreGames();

        let timer10Min : number = 10*60*1000;
        let newGameList : any = [];

        objectAllGames.forEach(function( item : Game, i : number, arr : any[]){
           if((Date.now() - item.lastActivitesTime) < timer10Min) newGameList.push(item);
        });

        this.saveGamesFromDb(newGameList);
    }

    gameSurrender( gameToken : string, user : string ){
        
        let game  = this.getGame(gameToken);
        
        if(game.owner == user) game.gameResult = game.opponent;
        if(game.opponent == user) game.gameResult = game.owner;

        game.state = "done";

        this.saveGame(gameToken, game);
    }

    defineCell( coordinate : any, cellSize : number) {
        let cellNumber : number = Math.floor(coordinate/cellSize);
        return cellNumber;
    };

    enterValueCell( gameToken : string, x : number, y : number, role : string){
        
        let game  = this.getGame(gameToken);

        let matrix = game.value;        
        matrix[y][x] = role;//x и y наоборот, так как в матрице первый индекс по вертикали, второй по горизонтали

        game.lastActivitesTime = Date.now();

        this.saveGame(gameToken, game);

    };

    checkCellValue( gameToken : string, x : number, y : number){

        let game  = this.getGame(gameToken);
        let matrix = game.value;
        if (matrix[y][x] == null) return true;

    };

    checkAccess( gameToken : string, user : string) {
        
        let game  = this.getGame(gameToken);
        if((user===game.owner) || (user===game.opponent)) return true;

    }

    checkWhoTurn ( gameToken : string, user : string) : boolean | undefined {

        let game  = this.getGame(gameToken);
        let matrix = game.value;
        let counter:number = 0;

        for(let i : number = 0; i<game.size; i++){
            for(let j = 0; j < game.size; j++){
                if (matrix[i][j] != null) counter++;
            }
        }
        //если число значений в поле 0 или четное и ходит player1, то ход крестиков
        if ((counter % 2 == 0) && (user == game.owner)) return true;
        //если число значений в поле нечетное и ходит player2, то ход ноликов
        if ((counter % 2 != 0) && (user == game.opponent)) return true;
        
    }

    checkWin( gameToken : string, x : number, y : number, role : string){

        let game  = this.getGame(gameToken);
        let matrix = game.value;

        let size = game.size;
        let win = false;

        //проверяем строки
        if ((x - 2 >= 0 ) && (matrix[y][x - 2] == role) && (matrix[y][x - 1] == role) && (matrix[y][x] == role)) win = true;
        if ((x - 1 >= 0 ) && (x + 1 < size ) && (matrix[y][x - 1] == role) && (matrix[y][x] == role) && (matrix[y][x + 1] == role)) win = true;
        if ((x + 2 < size ) && (matrix[y][x] == role) && (matrix[y][x + 1] == role) && (matrix[y][x + 2] == role)) win = true;
        
        //проверяем столбцы
        if ((y - 2 >= 0 ) && (matrix[y - 2][x] == role) && (matrix[y - 1][x] == role) && (matrix[y][x] == role)) win = true;
        if ((y - 1 >= 0 ) && (y + 1 < size ) && (matrix[y - 1][x] == role) && (matrix[y][x] == role) && (matrix[y + 1][x] == role)) win = true;
        if ((y + 2 < size ) && (matrix[y][x] == role) && (matrix[y + 1][x] == role) && (matrix[y + 2][x] == role)) win = true;

        //проверяем диагональ слева сверху в право вниз
        if ((y - 2 >= 0 ) && (x - 2 >= 0 ) && (matrix[y - 2][x - 2] == role) && (matrix[y - 1][x - 1] == role) && (matrix[y][x] == role)) win = true;
        if ((y - 1 >= 0 ) && (y + 1 < size ) && (x - 1 >= 0 )  && (x + 1 < size ) && (matrix[y - 1][x - 1] == role) && (matrix[y][x] == role) && (matrix[y + 1][x + 1] == role)) win = true;
        if ((y + 2 < size ) && (x + 2 < size ) && (matrix[y][x] == role) && (matrix[y + 1][x + 1] == role) && (matrix[y + 2][x + 2] == role)) win = true;
        
        //проверяем диагональ слева снизу в право сверх
        if ((y - 2 >= 0 ) && (x + 2 < size ) && (matrix[y -2][x + 2] == role) && (matrix[y - 1][x + 1] == role) && (matrix[y][x] == role)) win = true;
        if ((y - 1 >= 0 ) && (y + 1 < size ) && (x - 1 >= 0 )  && (x + 1 < size ) && (matrix[y - 1][x + 1] == role) && (matrix[y][x] == role) && (matrix[y + 1][x - 1] == role)) win = true;
        if ((y + 2 < size ) && (x - 2 >= 0 ) && (matrix[y][x] == role) && (matrix[y + 1][x - 1] == role) && (matrix[y + 2][x - 2] == role)) win = true;

        if(win) {
            //если появился победитель вписываем его в gameResult и переводим статус игры в done
            if(role == "X") game.gameResult = game.owner;
            if(role == "0") game.gameResult = game.opponent;
            if((game.gameResult == game.owner) || (game.gameResult == game.opponent)) game.state = "done";
        }
        this.saveGame(gameToken, game);
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
            game.gameResult = "draw";
            game.state = "done";
        }
        this.saveGame(gameToken, game);
    };

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

function generateGameToken( signsNumber : number ) : string {
    let key : string = "";
    let keyAbc : string = "abcdefghijklmnopqrstuvwxyz";
    let key123 : string = "0123456789";

    while(key.length < signsNumber)
        key += keyAbc[Math.random() * keyAbc.length|0];
    while(key.length < 2*signsNumber)
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
