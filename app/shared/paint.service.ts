import { Game } from './game.class';

export class PaintService {

    cellSize : number = 50; 
    roleX : string = "X";
    role0 : string = "0";
    indentation : number = 0.25;

    private canvas: any;

    drawGameTable( canvas : any, gameSize : number ) {
        this.canvas = canvas;

        if (this.canvas.getContext) {
            let canvas = this.canvas;
            if (canvas.getContext) {
                var ctx = this.canvas.getContext('2d');
        
                this.canvas.width = gameSize*this.cellSize + 1;
                this.canvas.height = gameSize*this.cellSize + 1;

                let widthTable: number = gameSize*this.cellSize;
                ctx.strokeRect(0,0,widthTable,widthTable);

                for (let i: number = 0; i < gameSize; i++)
                    for (let j: number = 0; j < gameSize; j ++) {
                        ctx.strokeRect(1 + j*this.cellSize, 1 + i*this.cellSize, this.cellSize, this.cellSize);
                    }
            }
        }
    }

    drawX( canvas : any, coordinateCellX : number, coordinateCellY : number ) {

        let centerCellX : number = this.defineCellCenter(coordinateCellX, this.cellSize);
        let centerCellY : number = this.defineCellCenter(coordinateCellY, this.cellSize);

        let line1Start1 = centerCellX-this.indentation*this.cellSize;
        let line1Start2 = centerCellY-this.indentation*this.cellSize;
        let line1Finish1 = centerCellX+this.indentation*this.cellSize;        
        let line1Finish2 = centerCellY+this.indentation*this.cellSize;

        let line2Start1 = centerCellX-this.indentation*this.cellSize;
        let line2Start2 = centerCellY+this.indentation*this.cellSize;
        let line2Finish1 = centerCellX+this.indentation*this.cellSize;
        let line2Finish2 = centerCellY-this.indentation*this.cellSize;
        
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

    draw0 (canvas : any, coordinateCellX : number, coordinateCellY : number) {
        let centerCellX = this.defineCellCenter(coordinateCellX, this.cellSize);
        let centerCellY = this.defineCellCenter(coordinateCellY, this.cellSize);        

        var radiusO = this.cellSize*this.indentation;

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

    drawX0(canvas : any, value : any, size : number){
        for(var i=0; i<size; i++){
            for(var j=0; j<size; j++){
                if (value[i][j] == this.roleX) this.drawX(canvas,j,i);
                if (value[i][j] == this.role0) this.draw0(canvas,j,i);
             };
         }
    };

    defineCellCenter(cellNumber : number, cellSize : number) {
        let cellCenter = (cellNumber+0.5)*cellSize;
        return cellCenter;
    }
}