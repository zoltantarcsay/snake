const cellSize = 10;
const canvas = document.querySelector('#canvas');
const scoreElement = document.querySelector('#score');
const canvasWidth = 480 / cellSize;
const canvasHeight = 320 / cellSize;

const RIGHT = {x: 1, y: 0};
const DOWN = {x: 0, y: 1};
const LEFT = {x: -1, y: 0};
const UP = {x: 0, y: -1};

function makeFood() {
    const x = Math.floor(Math.random() * 100) % canvasWidth;
    const y = Math.floor(Math.random() * 100) % canvasHeight;

    return new SnakeCell(x, y);
}

class SnakeCell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.cell = document.createElement('div');
        this.cell.classList.add('snake-cell');
        this.cell.style.left = x * cellSize + 'px';
        this.cell.style.top = y * cellSize + 'px';
        canvas.appendChild(this.cell);
    }

    equals(cell) {
        return this.x === cell.x && this.y === cell.y;
    }

    destroy() {
        canvas.removeChild(this.cell);
    }

}

class Snake {
    constructor(initialSize, speed = 100) {
        this.score = 0;
        this.destroyed = false;
        this.food = makeFood();
        this.cells = [];
        this.direction = RIGHT;
        this.speed = speed;
        this.interval = setInterval(() => snake.move(), this.speed);
        this.onEat = null;

        for (let i = 0; i < initialSize; i++) {
            const cell = new SnakeCell(Math.floor(canvasHeight / 2) + i, Math.floor(canvasWidth / 2));
            this.cells.unshift(cell);
        }
    }

    grow() {
        const head = this.cells[0];

        let x = head.x + this.direction.x;
        let y = head.y + this.direction.y;

        // avoid leaving the canvas

        if (x >= canvasWidth) {
            x = 0;
        }

        if (x < 0) {
            x = canvasWidth - 1;
        }

        if (y >= canvasHeight) {
            y = 0;
        }

        if (y < 0) {
            y = canvasHeight - 1;
        }

        const newHead = new SnakeCell(x, y);
        this.cells.unshift(newHead);
        return newHead;
    }

    move() {
        // eat
        this.eat();

        // move
        this.cells.pop().destroy();
        const head = this.grow();

        // check if the snake has crashed into itself and die
        for (let i = 1; i < this.cells.length; i++) {
            if (head.equals(this.cells[i])) {
                this.destroy();
            }
        }
    }

    eat() {
        let head = this.cells[0];
        if (head.equals(this.food)) {
            this.grow();
            this.food.destroy();
            this.food = makeFood();
            this.score++;
            if (typeof this.onEat === 'function') {
                this.onEat.call(this, this.score);
            }
        }
    }

    turn(direction) {
        if (
            (this.direction === UP && direction !== DOWN) ||
            (this.direction === DOWN && direction !== UP) ||
            (this.direction === LEFT && direction !== RIGHT) ||
            (this.direction === RIGHT && direction !== LEFT)
        ) {
            this.direction = direction;
        }

    }

    destroy() {
        if (!this.destroyed) {
            this.destroyed = true;
            this.food.destroy();
            this.cells.forEach(cell => cell.destroy());
            clearInterval(this.interval);
        }
    }
}


let snake;

window.addEventListener('keyup', event => {
    if (event.which === 37) {
        snake.turn(LEFT);
    }

    if (event.which === 38) {
        snake.turn(UP);
    }

    if (event.which === 39) {
        snake.turn(RIGHT);
    }

    if (event.which === 40) {
        snake.turn(DOWN);
    }
});

function init() {
    if (snake) {
        snake.destroy();
    }

    snake = new Snake(5);
    snake.onEat = score => scoreElement.textContent = score;
}
