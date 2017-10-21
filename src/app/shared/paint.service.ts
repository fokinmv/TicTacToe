import { Injectable } from '@angular/core';

import { Game } from './game';

@Injectable()
export class PaintService {

      cellSize = 50;
      roleX = 'X';
      role0 = '0';
      indentation = 0.25;

      private canvas: any;

      drawGameTable( canvas: any, gameSize: number ) {
          this.canvas = canvas;

          if (this.canvas.getContext) {
            const canvas = this.canvas;
              if (canvas.getContext) {
                const ctx = this.canvas.getContext('2d');

                  this.canvas.width = gameSize * this.cellSize + 1;
                  this.canvas.height = gameSize * this.cellSize + 1;

                  const widthTable: number = gameSize * this.cellSize;

                  ctx.clearRect(0, 0, widthTable, widthTable);

                  ctx.strokeRect(0, 0, widthTable, widthTable);

                  for (let i = 0; i < gameSize; i++) {
                      for (let j = 0; j < gameSize; j ++) {
                          ctx.strokeRect(1 + j * this.cellSize, 1 + i * this.cellSize, this.cellSize, this.cellSize);
                      }
                  }
              }
          }
      }

      drawX( canvas: any, coordinateCellX: number, coordinateCellY: number ) {

        const centerCellX: number = this.defineCellCenter(coordinateCellX, this.cellSize);
        const centerCellY: number = this.defineCellCenter(coordinateCellY, this.cellSize);

        const line1Start1 = centerCellX - this.indentation * this.cellSize;
        const line1Start2 = centerCellY - this.indentation * this.cellSize;
        const line1Finish1 = centerCellX + this.indentation * this.cellSize;
        const line1Finish2 = centerCellY + this.indentation * this.cellSize;

        const line2Start1 = centerCellX - this.indentation * this.cellSize;
        const line2Start2 = centerCellY + this.indentation * this.cellSize;
        const line2Finish1 = centerCellX + this.indentation * this.cellSize;
        const line2Finish2 = centerCellY - this.indentation * this.cellSize;

          if (this.canvas.getContext) {
            const canvas = this.canvas;
              if (canvas.getContext) {
                const ctx = canvas.getContext('2d');

                  ctx.beginPath();
                  ctx.moveTo(line1Start1, line1Start2);
                  ctx.lineTo(line1Finish1, line1Finish2);
                  ctx.stroke();
                  ctx.beginPath();
                  ctx.moveTo(line2Start1, line2Start2);
                  ctx.lineTo(line2Finish1, line2Finish2);
                  ctx.stroke();
              }
          }
      }

      draw0 (canvas: any, coordinateCellX: number, coordinateCellY: number) {
        const centerCellX = this.defineCellCenter(coordinateCellX, this.cellSize);
        const centerCellY = this.defineCellCenter(coordinateCellY, this.cellSize);

        const radiusO = this.cellSize * this.indentation;

        if (this.canvas.getContext) {
            const canvas = this.canvas;
            if (canvas.getContext) {
                const ctx = canvas.getContext('2d');

                ctx.beginPath();
                ctx.arc(centerCellX, centerCellY, radiusO, 0, Math.PI * 2, true);
                ctx.stroke();
            }
        }
      }

      drawX0(canvas: any, value: any, size: number) {
          for (let i = 0; i < size; i++) {
              for (let j = 0; j < size; j++) {
                  if (value[i][j] === this.roleX) {
                      this.drawX(canvas, j, i);
                  }
                  if (value[i][j] === this.role0) {
                      this.draw0(canvas, j, i);
                  }
               }
           }
      }

      defineCellCenter(cellNumber: number, cellSize: number) {
          const cellCenter = (cellNumber + 0.5) * cellSize;
          return cellCenter;
      }
  }
