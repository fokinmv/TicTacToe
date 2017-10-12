import { Game } from './game.class';

export class GameService {

    games: Game[] = [];

    getGamesFromDb(){
        return window.localStorage.getItem("games");
    }

    saveGamesFromDb(data:any):any{
        window.localStorage.setItem("games", JSON.stringify(data));
    }

    getGameList() {
        
        let allGames: any = this.getGamesFromDb();
        let gamesToJson = JSON.parse(allGames);

        if (gamesToJson == null) gamesToJson = [];

        //сортировка по state - сначала ready, потом playing, потом done
        gamesToJson.sort(function(a:any,b:any){
            let c = a.state;
            let d = b.state;

            if( c < d){
                return 1;
                } else if (c > d) {
                    return -1;
                }
                return 0;
            })

        this.games = gamesToJson;

        return this.games;
    }

    createGame(owner:string, size:number){
        let game = new Game (owner,"",size,Date.now(),Date.now(),"?","ready");
  
        //создаём матрицу игрового поля с пустыми значениями
        game.value = createMatrix(game.size);
        //генерируем gameToken вида abc123, где n число букв и цифр в строке, которые потом складываем
        let n = 3;
        game.gameToken = generateGameToken(n);
        //генерируем accessTokenPlayer1 - токен доступа для создающего игру
        game.accessTokenPlayer1 = generateAccessToken();

        //Якобы хэдэр с гейм токеном и аксесс токеном
        window.localStorage.setItem("gameToken", game.gameToken);
        window.localStorage.setItem("accessTokenPlayer1", game.accessTokenPlayer1);

        //добавляем новую игру в спикок игр - типа на сервер с бд
        console.log("Получили = " + this.getGamesFromDb());
        let allGames: any = this.getGamesFromDb();
        //console.log("Получили от localStorage до добавления " + allGames);
        

        let gamesToJson = JSON.parse(allGames);
        //console.log("Получили от localStorage до добавления, после JSON.parse " + gamesToJson);
        
        if (gamesToJson == null) gamesToJson = [];

        //console.log("Добавляем игру " + game);

        gamesToJson.push(game);

        //console.log("Получили после push " + gamesToJson);

        //window.localStorage.setItem("games", JSON.stringify(gamesToJson));\
        this.saveGamesFromDb(gamesToJson);

        //console.log("Получили setItem " + window.localStorage.getItem("games"));

        //this.games.push(game);

        console.log("Перед ретёрном - " + game.gameToken);
        return game.gameToken;
        
    }

    joinGame(game: Game, user:string){
        if(user) {
            console.log("Ткнули по игре " + game.gameToken);

            //Добавляем второго игрока, если второйигрок уже есть - просто возвращаем геймТокен, 
            //чтобы можно было присоединиться к игре в режиме наблюдателя
            if(!game.opponent) { game.opponent = user;
                //генерируем accessTokenPlayer2 - токен доступа для создающего игру
                game.accessTokenPlayer2 = generateAccessToken();
                window.localStorage.setItem("accessTokenPlayer2", game.accessTokenPlayer2);
                //при появлении второго игрока - переводим статус игры в playing
                game.state = "playing";
                //меняем время последней активности в игре
                game.lastActivitesTime = Date.now();
                //добавляем изменения о игре
                //Достаем из локалсторадж все игры

                let allGames: any = this.getGamesFromDb();
                let gamesToJson = JSON.parse(allGames);

                let newGameList : any = [];
                //ищем в массиве из локалсторадж игру с нашим геймтокеном, если геймтокены совпадают,
                //то меняем весь объект игры на новый, с добавл. оппонентом и аксТок2
                gamesToJson.forEach(function(item:Game, i:number, arr: any[]){
                    if(item.gameToken === game.gameToken) item = game;
                    newGameList.push(item);  
                });
                //window.localStorage.setItem("games", JSON.stringify(newGameList));
                this.saveGamesFromDb(newGameList);

            }
            return game.gameToken;
        }
    }

    getGame(gameTokenFromUrl:any) {
        //console.log("Мы зашли в getGame " + gameTokenFromUrl);
        let allGames: any = this.getGamesFromDb();
        let gamesToJson = JSON.parse(allGames);

        let neededGameItem : any;
        
        gamesToJson.forEach(function(item:Game, i:number, arr: any[]){
            if(item.gameToken == gameTokenFromUrl.gameToken) neededGameItem = item;
           // console.log("Мы нашли игру - " + JSON.stringify(neededGameItem));
        });

        return neededGameItem;
    }

    saveGame(gameTokenFromUrl:any, game : Game) {
        let allGames: any = this.getGamesFromDb();
        let gamesToJson = JSON.parse(allGames);
        let newGameList : any = [];

        gamesToJson.forEach(function(item:Game, i:number, arr: any[]){
            if(item.gameToken == gameTokenFromUrl.gameToken) item = game;
            newGameList.push(item);
        });
        //window.localStorage.setItem("games", JSON.stringify(newGameList));
        this.saveGamesFromDb(newGameList);
    }

    deleteGame(gameTokenFromUrl:any){
        let allGames: any = this.getGamesFromDb();
        let gamesToJson = JSON.parse(allGames);
        let newGameList : any = [];

        gamesToJson.forEach(function(item:Game, i:number, arr: any[]){
            if(item.gameToken == gameTokenFromUrl.gameToken) return;
            newGameList.push(item);
        });
        //window.localStorage.setItem("games", JSON.stringify(newGameList));
        this.saveGamesFromDb(newGameList);
    }

    gameSurrender(gameTokenFromUrl:string, user:string){
        
        let game  = this.getGame(gameTokenFromUrl);
        
        if(game.owner == user) game.gameResult = game.opponent;
        if(game.opponent == user) game.gameResult = game.owner;

        game.state = "done";

        this.saveGame(gameTokenFromUrl, game);
    }

    defineCell(coordinate: any, cellSize: number) {
        let cellNumber : number = Math.floor(coordinate/cellSize);
        return cellNumber;
    };

    defineCellCenter(cellNumber: number, cellSize: number) {
        let cellCenter = (cellNumber+0.5)*cellSize;
        return cellCenter;
    };

    enterValueCell(gameTokenFromUrl:string, x : number, y : number, role : string){
        
        let game  = this.getGame(gameTokenFromUrl);

        let matrix = game.value;        
        matrix[y][x] = role;//x и y наоборот, так как в матрице первый индекс по вертикали, второй по горизонтали
        //меняем время последней активности в игре
        game.lastActivitesTime = Date.now();
        //записать игру
        this.saveGame(gameTokenFromUrl, game);

    };

    checkCellValue(gameTokenFromUrl:string, x : number, y : number){

        let game  = this.getGame(gameTokenFromUrl);
        let matrix = game.value;
        if (matrix[y][x] == null) return true;

    };

    checkAccess(gameTokenFromUrl:string, user: string) {
        
        let game  = this.getGame(gameTokenFromUrl);
        if((user===game.owner) || (user===game.opponent)) return true;

    }

    checkWhoTurn (gameTokenFromUrl:string, user: string) : boolean | undefined{

        let game  = this.getGame(gameTokenFromUrl);
        let matrix = game.value;
        let counter:number = 0;

        for(let i:number=0; i<game.size; i++){
            for(let j=0; j<game.size; j++){
                if (matrix[i][j] != null) counter++;
            }
        }
        //если число значений в поле 0 или четное и ходит player1, то ход крестиков
        if ((counter % 2 == 0) && (user == game.owner)) return true;
        //если число значений в поле нечетное и ходит player2, то ход ноликов
        if ((counter % 2 != 0) && (user == game.opponent)) return true;
        
    }

    checkWin(gameTokenFromUrl:string, x : number, y : number, role: string){

        let game  = this.getGame(gameTokenFromUrl);
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
        this.saveGame(gameTokenFromUrl, game);
    };

    checkNullCell(gameTokenFromUrl:string){

        let game  = this.getGame(gameTokenFromUrl);
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
        this.saveGame(gameTokenFromUrl, game);
    };

}

function createMatrix(size:number){
    let arr: any = [];
    for(let i=0; i<size; i++){
        arr[i] = [];
        for(let j=0; j<size; j++){
            arr[i][j] = null;
        }
    }
    return arr;
};

function generateGameToken(n:number):string{
    let key:string = "";
    let keyAbc:string = "abcdefghijklmnopqrstuvwxyz";
    let key123:string = "0123456789";

    while(key.length < n)
        key += keyAbc[Math.random() * keyAbc.length|0];
    while(key.length < 2*n)
    key += key123[Math.random() * key123.length|0];

    return key;
};

function generateAccessToken():string{
    let key:string = "";
    let keyAbc123:string = "abcdefghijklmnopqrstuvwxyz0123456789";

    while(key.length < 12)
    key += keyAbc123[Math.random() * keyAbc123.length|0];

    return key;
};
