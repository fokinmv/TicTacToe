export class Game {
    gameToken: string;
    value: any[][];
    accessTokenPlayer1: string;
    accessTokenPlayer2: string;

    constructor(
        public owner: string,
        public opponent: string,
        public size: number,
        public gameCreateTime: number,
        public lastActivitesTime: number,
        public gameResult: string,
        public state: string
    ) {}
}
