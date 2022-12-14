"use strict";

const Direction = {
    Up: 0,
    Right: 1,
    Down: 2,
    Left: 3
}

class SnakeGame {
    constructor(canvasElement, scoreElement, bestScoreElement) {
        this.columns = 27;
        this.rows = 27;

        this.direction = Direction.Up;
        this.suggestedDirection = this.direction
        this.boardCanvasElement = canvasElement;
        this.scoreElement = scoreElement;
        this.bestScoreElement = bestScoreElement;
        this.bsetScore = 0;
        this.score = 0;

        const bestScoreFromCache = localStorage.getItem('bsetScore');
        if(bestScoreFromCache) {
            this.bsetScore = bestScoreFromCache
        }

        this.init();
    }

    init = () => {
        this.direction = Direction.Up;
        this.suggestedDirection = this.direction
        this.score = 0;

        let centerC = Math.floor((this.columns / 2) + 1);
        let centerR = Math.floor((this.rows / 2) - 1);
        this.snake = [[centerC,centerR++], [centerC,centerR++], [centerC,centerR]];
        this.stones = [];
        this.running = true;

        const gameOver = document.getElementById("header_gameOver");
        gameOver.style = "color: transparent";
    }

    draw() {
        const cv = this.boardCanvasElement;
        const pixelWidth = cv.width;
        const pixelHeight = cv.height;

        const cellWidth = pixelWidth / this.columns;
        const cellHight = pixelHeight / this.rows;

        if(!cv.getContext) {
            console.error("Failed to draw move, can't get canvas context");
            return;
        }

        const ctx = cv.getContext('2d');
        ctx.clearRect(0, 0, pixelWidth, pixelHeight);
        ctx.fillStyle = "fff";

        this.snake.forEach(arr => {
            const c = arr[0];
            const r = arr[1];
            const topLeft = this.getCellLeftPosition(c, cellWidth);
            const topRight = this.getCellTopPosition(r, cellHight);
            ctx.fillRect(topLeft, topRight, cellWidth, cellHight);
        });

        this.stones.forEach(arr => {
            const c = arr[0];
            const r = arr[1];
            const topLeft = this.getCellLeftPosition(c, cellWidth);
            const topRight = this.getCellTopPosition(r, cellHight);
            ctx.fillRect(topLeft, topRight, cellWidth, cellHight);
        });

        this.scoreElement.innerText = this.score;
        this.bestScoreElement.innerText = this.bsetScore;
    }

    updateSnake() {
        const newCell = this.getNextCell();
        this.moveAndEat(newCell);
    }

    getNextCell() {
        const [c, r] = this.snake[0];

        if(this.direction === Direction.Up) {
            const newCell = [c, r-1];
            return newCell;
        } else if(this.direction === Direction.Right) {
            const newCell = [c+1, r];
            return newCell;
        } else if(this.direction === Direction.Down) {
            const newCell = [c, r+1];
            return newCell;
        } else if(this.direction === Direction.Left) {
            const newCell = [c-1, r];
            return newCell;
        }

        throw new Error(`next cell option ${this.direction} is not supported`);
    }

    moveAndEat(newCell) {
        const [c, r] = newCell;

        let remoeTail = true;
        const existingStoneIndex = this.stones.findIndex(item => item[0] === c && item[1] === r);
        if(existingStoneIndex !== -1) {
            this.stones.splice(existingStoneIndex, 1);
            remoeTail = false;
            this.score++;
        }

        this.snake.unshift(newCell);

        if(remoeTail) {
            this.snake.pop();
        }
    }

    setDirection(direction) {
        const logInputNotValid = (d) => console.trace(`input not valid. direction: ${d}, current direction: ${this.direction}`);

        if(this.direction == Direction.Up && direction == Direction.Down) {
            logInputNotValid(direction);
            return;
        }
        else if(this.direction == Direction.Left && direction == Direction.Right){
            logInputNotValid(direction);
            return;
        }
        else if(this.direction == Direction.Right && direction == Direction.Left){
            logInputNotValid(direction);
            return;
        }
        else if(this.direction == Direction.Down && direction == Direction.Up){
            logInputNotValid(direction);
            return;
        }

        this.suggestedDirection = direction;
    }

    setDirections(directions) {
        directions.forEach(d => this.setDirection(d));
    }

    validate() {
        const [c, r] = this.snake[0];
        if(c < 0 || r < 0) {
            this.running = false;
            this.updateBestScore();
            return;
        } else if(this.columns <= c || this.rows <= r) {
            this.running = false;
            this.updateBestScore();
            return;
        }

        const [sc, sr] = this.getNextCell();
        const indexInSnake = this.snake.findIndex(item => item[0] === sc && item[1] === sr);
        if(indexInSnake != -1) {
            this.running = false;
            this.updateBestScore();
            return;
        }
    }

    updateBestScore() {
        this.bsetScore = Math.max(this.score, this.bsetScore);
        localStorage.setItem('bsetScore', this.bsetScore)
    }

    anotate() {
        if(!this.running) {
            const gameOver = document.getElementById("header_gameOver");
            gameOver.style = "color: red";
        }
    }
    
    doMove = () => {
        if(this.running) {
            console.info(`move: ${this.direction} -> ${this.suggestedDirection}`);
            this.direction = this.suggestedDirection;

            this.updateSnake();
            this.draw();
            this.validate();
            this.anotate();
        }
    }

    addStone = () => {
        if(this.running) {
            console.info('add stone');
            
            const valid = false;
            while(! valid) {
                const col = Math.floor(Math.random() *  this.columns);
                const row = Math.floor(Math.random() *  this.rows);

                const indexInSnake = this.snake.findIndex(item => item[0] === col && item[1] === row);
                if(indexInSnake === -1) {
                    const indexInStones = this.stones.findIndex(item => item[0] === col && item[1] === row);
                    if(indexInStones === -1) {
                        this.stones.push([col, row]);
                        break;
                    }
                }
            }
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
    const scoreElement = document.getElementById("scoreValue");
    const bestScoreElement = document.getElementById("bsetScoreValue");
    mainBorder = new SnakeGame(boardCanvas, scoreElement, bestScoreElement);
    mainBorder.draw();

    const startAgainBtn = document.getElementById("startAgainButton");
    startAgainBtn.addEventListener('click', (event) => {
        mainBorder.init()
    });

    const drawFunc = mainBorder.draw.bind(mainBorder);
    setInterval(drawFunc, 1000/60);

    setInterval(mainBorder.doMove, 120);

    setInterval(mainBorder.addStone, 2000);

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
    } else if(event.code === 'KeyR') {
        mainBorder.init();
    }
});

window.addEventListener("touchstart", (event) => {
    const boardCanvas = document.getElementById("mainCanvas");
    if(event?.target === boardCanvas && event?.changedTouches?.length === 1) {
        const x = event.changedTouches[0].clientX;
        const y = event.changedTouches[0].clientY;

        const canvasLeft = boardCanvas.offsetLeft;
        const canvasTop = boardCanvas.offsetTop;
        const canvasWidth = boardCanvas.clientWidth;
        const canvasHeight = boardCanvas.clientHeight;

        // const moveTopWeight = y - canvasTop;
        // const moveRightWeight = (canvasLeft + canvasWidth) - x;
        // const moveBottomWeight = (canvasTop + canvasHeight) - y;
        // const moveLeftWeight = x - canvasLeft;

        const cellWidht =  canvasWidth / mainBorder.columns;
        const cellHeight = canvasHeight / mainBorder.rows;
        const snakePositionX = cellWidht * mainBorder.snake[0][0];
        const snakePositionY = cellHeight * mainBorder.snake[0][1];

        const snakeAbsPositionX = snakePositionX + canvasLeft;
        const snakeAbsPositionY = snakePositionY + canvasTop;

        const moveTopWeight = snakeAbsPositionY - y;
        const moveRightWeight = x - snakeAbsPositionX;
        const moveBottomWeight = y - snakeAbsPositionY;
        const moveLeftWeight = snakeAbsPositionX - x;
        
        const directions = [
            {"direction": Direction.Up, "weight": moveTopWeight},
            {"direction": Direction.Right, "weight": moveRightWeight},
            {"direction": Direction.Down, "weight": moveBottomWeight},
            {"direction": Direction.Left, "weight": moveLeftWeight},
        ]
            .filter(({direction, weight}) => weight > 0)
            .sort((a, b) => a.weight < b.weight ? -1 : 1)
            .slice(0, 2)
            .map(d => d.direction);

        mainBorder.setDirections(directions);
    }
});

