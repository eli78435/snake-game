"use strict";

const Direction = {
    Up: 0,
    Right: 1,
    Down: 2,
    Left: 3
}

class BoardGame {
    constructor(canvas) {
        this.columns = 31;
        this.rows = 31;
        this.direction = Direction.Up;

        let centerC = (this.columns / 2) + 1
        let centerR = (this.rows / 2) - 1
        this.snake = [[centerC,centerR++], [centerC,centerR++], [centerC,8]]

        this.boardCanvas = canvas;
        this.running = true;
    }

    draw() {
        const cv = this.boardCanvas;
        const pixelWidth = cv.width;
        const pixelHeight = cv.height;

        const cellWidth = pixelWidth / this.columns;
        const cellHight = pixelHeight / this.rows;

        if(!cv.getContext) {
            console.error("Failed to draw move, can't get canvas context")
            return;
        }

        const ctx = cv.getContext('2d');
        ctx.clearRect(0, 0, pixelWidth, pixelHeight);
        ctx.fillStyle = "fff";

        this.snake.forEach(arr => {
            const c = arr[0];
            const r = arr[1];
            const topLeft = this.getCellLeftPosition(c, cellWidth);
            const topRight = this.getCellTopPosition(r, cellHight)
            ctx.fillRect(topLeft, topRight, cellWidth, cellHight);
        });
    }

    updateSnake() {
        const results = {
            "added": null,
            "removed": null
        };

        const [c, r] = this.snake[0];
    
        if(this.direction === Direction.Up) {
            const newCell = [c, r-1];
            this.snake.unshift(newCell);
            results.added = newCell;
        } else if(this.direction === Direction.Right) {
            const newCell = [c+1, r];
            this.snake.unshift(newCell);
            results.added = newCell;
        } else if(this.direction === Direction.Down) {
            const newCell = [c, r+1];
            this.snake.unshift(newCell);
            results.added = newCell;
        } else if(this.direction === Direction.Left) {
            const newCell = [c-1, r];
            this.snake.unshift(newCell);
            results.added = newCell;
        }
        
        results.removed = this.snake.pop();
        return results;
    }

    setDirection(direction) {
        this.direction = direction;
    }

    validate() {
        const [c, r] = this.snake[0];
        if(c < 0 || r < 0) {
            this.running = false;
        } else if(this.columns < c || this.rows < r) {
            this.running = false;
        }
    }

    anotate() {
        if(!this.running) {
            const gameOver = document.getElementById("gameOver");
            gameOver.style = "color: red"
        }
    }
    
    doMove() {
        if(this.running) {
            this.updateSnake();
            this.draw();
            this.validate();
            this.anotate();
        }
    }

    getCellLeftPosition(c, cellWidth) {
        return c * cellWidth;
    }

    getCellTopPosition(r, cellHight) {
        return r * cellHight;
    }
}

let mainBorder;


window.addEventListener("load", (event) => {  
    const boardCanvas = document.getElementById("mainCanvas");
    mainBorder = new BoardGame(boardCanvas)
    mainBorder.draw();

    const drawFunc = mainBorder.draw.bind(mainBorder);
    setInterval(drawFunc, 1000/60);

    const moveFunc = mainBorder.doMove.bind(mainBorder);
    setInterval(moveFunc, 150);

    console.log('end load event listener');
});

window.addEventListener("keydown", (event) => {
    if(event.type !== 'keydown')
        return;

    if(event.code === "ArrowUp") {
        mainBorder.setDirection(Direction.Up);
    } else if(event.code === "ArrowRight") {
        mainBorder.setDirection(Direction.Right);
    } else if(event.code === "ArrowDown") {
        mainBorder.setDirection(Direction.Down);
    } else if(event.code === "ArrowLeft") {
        mainBorder.setDirection(Direction.Left);
    }
});



