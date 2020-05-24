(function () {
    var _ = self.ConnectBoardView = function (connectBoard, playerManager) {
        this.connectBoard = connectBoard;
        this.board = connectBoard.board;
        this.height = connectBoard.height;
        this.width = connectBoard.width;
        this.isGameOver = false;
        this.showError = false;
        this.playerManager = playerManager;
        this.drawColor = 'orange';
        this.restartGameEventHandler = this.restartGame.bind(this);
        this.startGame();
    };

    _.prototype = {

        startGame: function () {
            this.displayBoard();
            this.displayInitialPlayer(null, this.currentPlayer());
            this.displayReplayButton();
        },

        restartGame: function () {
            this.resetAll();
            this.startGame();
        },

        resetAll: function () {
            this.removeEventListeners();
            this.resetBoard();
            const oldPlayer = this.currentPlayer();
            this.playerManager.resetCurrentPlayer();
            const newPlayer = this.currentPlayer();
            this.displayInitialPlayer(oldPlayer, newPlayer);
            this.isGameOver = false;
        },

        resetBoard: function () {
            this.connectBoard.board = this.connectBoard.board.map(row => row.map(cell => cell = 0));
            const board = document.getElementById('board');
            board.innerHTML = "";
        },

        removeEventListeners: function () {
            const button = document.getElementById('replay-button');
            button.removeEventListener('click', this.restartGameEventHandler);
        },

        displayBoard: function () {
            const gameBoard = document.getElementById('board');
            const tbody = document.createElement('tbody');
            gameBoard.appendChild(tbody);

            for (let i = 0; i < this.height; i++) {
                const row = document.createElement('tr');
                tbody.appendChild(row);
                for (let j = 0; j < this.width; j++) {
                    const cell = document.createElement('td');
                    cell.setAttribute('position', j.toString() + i.toString());
                    cell.className = 'cell';
                    cell.addEventListener('click', this.executeTurn.bind(this), false);
                    row.appendChild(cell);
                }
            }
        },

        displayReplayButton: function () {
            const button = document.getElementById('replay-button');
            button.addEventListener('click', this.restartGameEventHandler, false);
            button.innerHTML = "Reset";
        },

        currentPlayer: function () {
            return this.playerManager.currentPlayer;
        },

        placeGamePiece: function (element, currentPlayer) {
            const position = this.getPosition(element);
            const columnNumber = position[0];

            const placedPosition = this.connectBoard.placeGamePieceInColumn(columnNumber, currentPlayer.id);

            if (placedPosition) {
                const cell = this.getCellByPosition(placedPosition[0], placedPosition[1]);
                cell.classList.add(currentPlayer.color);
            }

            return placedPosition;
        },

        executeTurn: function (event) {
            if (this.isGameOver)
                return;

            var placedPosition = this.placeGamePiece(event.target, this.currentPlayer());

            if (!placedPosition) { return; }

            if (this.connectBoard.calculateWinAny(placedPosition, this.currentPlayer().id)) {
                this.endGame(true, this.currentPlayer());
            } else if (this.connectBoard.calculateIsDraw()) {
                this.endGame(false, this.currentPlayer())
            }
            else {
                const oldPlayer = this.currentPlayer();
                this.playerManager.togglePlayer();
                this.displayCurrentPlayer(oldPlayer, this.currentPlayer());
            }
        },

        getCellByPosition: function (x, y) {
            return document.querySelector(`[position='${x}${y}'`);
        },

        getPosition: function (element) {
            return element.getAttribute('position');
        },

        endGame(didSomeoneWin, currentPlayer) {
            this.isGameOver = true;

            didSomeoneWin
                ? this.displayWinner(currentPlayer)
                : this.displayDraw(currentPlayer.color);

            const replayElement = document.getElementById('replay-button');
            replayElement.innerHTML = "Play Again?";
        },

        displayDraw: function (currentPlayerColor) {
            const gameMessageElement = document.getElementById('game-message');
            const instructionElement = document.getElementById('player-instruction');
            const nameElement = document.getElementById('player-name');

            gameMessageElement.classList.remove(currentPlayerColor);
            gameMessageElement.classList.add(this.drawColor);
            instructionElement.innerHTML = 'DRAW';
            nameElement.innerHTML = '';
        },

        displayWinner: function (currentPlayer) {
            const gameMessageElement = document.getElementById('game-message');
            gameMessageElement.classList.add(currentPlayer.color);

            const instructionElement = document.getElementById('player-instruction')
            instructionElement.innerHTML = ` Wins!!`;
        },

        displayInitialPlayer: function (oldPlayer, currentPlayer) { 
            const gameMessageElement = document.getElementById('game-message');
            gameMessageElement.classList.remove(this.drawColor);

            this.displayCurrentPlayer(oldPlayer, currentPlayer);
            const instructionElement = document.getElementById('player-instruction');
            instructionElement.innerHTML = "'s Turn";
        },

        displayCurrentPlayer: function (oldPlayer, currentPlayer) {
            const gameMessageElement = document.getElementById('game-message');
            const nameElement = document.getElementById('player-name');

            if (oldPlayer) {
                gameMessageElement.classList.remove(oldPlayer.color);
            }

            gameMessageElement.classList.add(currentPlayer.color);
            nameElement.innerHTML = currentPlayer.name;
        }
    };
}
)();

(() => {
    var _ = self.ConnectBoard = function (dimensions) {
        this.height = dimensions.height;
        this.width = dimensions.width;
        this.board = this.createBoard();
    };

    _.prototype = {
        createBoard: function () {
            const board = new Array(this.width);
            for (let i = 0; i < this.width; i++) {
                board[i] = new Array(this.height).fill(0); //0 = empty; 1 = player1; 2 = player2
            }

            return board;
        },

        /* something is broken here */
        placeGamePieceInColumn: function (columnIndex, playerId) {
            for (let i = (this.height - 1); i >= 0; i--) {
                if (this.board[columnIndex][i] == 0) { //0 = empty; 1 = player1; 2 = player2;
                    this.board[columnIndex][i] = playerId;
                    return `${columnIndex}${i}`;
                }
            }
            return "";
        },

        calculateWinAny: function (startingPoint, playerId) {
            const x = startingPoint[0];
            const y = startingPoint[1];
            return (this.calculateWinHorizontal(x, y, playerId) ||
                this.calculateWinVertical(x, y, playerId) ||
                this.calculateWinBackSlash(x, y, playerId) ||
                this.calculateWinForwardSlash(x, y, playerId))
        },

        calculateIsDraw: function () {
            return !this.board.some(row => row.some(column => column == 0));
        },

        calculateWinHorizontal: function (x, y, playerId) {
            const startingX = x;
            let numInARow = 1;

            while (this.doesCellMatchPlayer(--x, y, playerId)) {
                numInARow++;
            }

            x = startingX;

            while (this.doesCellMatchPlayer(++x, y, playerId)) {
                numInARow++;
            }

            return numInARow >= 4;
        },

        calculateWinVertical: function (x, y, playerId) {
            const startingY = y;
            let numInARow = 1;

            while (this.doesCellMatchPlayer(x, --y, playerId)) {
                numInARow++;
            }

            y = startingY;

            while (this.doesCellMatchPlayer(x, ++y, playerId)) {
                numInARow++;
            }

            return numInARow >= 4;
        },

        calculateWinBackSlash: function (x, y, playerId) {
            const startingX = x;
            const startingY = y;
            let numInARow = 1;

            while (this.doesCellMatchPlayer(--x, --y, playerId)) {
                numInARow++;
            }

            y = startingY;
            x = startingX;

            while (this.doesCellMatchPlayer(++x, ++y, playerId)) {
                numInARow++;
            }

            return numInARow >= 4;
        },

        calculateWinForwardSlash: function (x, y, playerId) {
            const startingX = x;
            const startingY = y;
            let numInARow = 1;

            while (this.doesCellMatchPlayer(++x, --y, playerId)) {
                numInARow++;
            }

            y = startingY;
            x = startingX;

            while (this.doesCellMatchPlayer(--x, ++y, playerId)) {
                numInARow++;
            }

            return numInARow >= 4;
        },

        doesCellMatchPlayer: function (x, y, playerId) {
            if (x < 0 || x === this.width || y < 0 || y === this.height) {
                return false;
            }
            return this.board[x][y] == playerId;
        },
    };
})();

(function () {
    var _ = self.Player = function ({ id, name, color }) {
        this.id = id;
        this.name = name;
        this.color = color;
    };

    _.prototype = {};
})();

(function () {
    var _ = self.PlayerManager = function (players) {
        this.players = players;
        this.currentPlayer = players[0];
    }

    _.prototype = {
        togglePlayer: function () {
            const newIndex = this.currentPlayer.id === this.players[0].id ? 1 : 0;
            this.currentPlayer = players[newIndex];
        },
        currentPlayer: function () {
            return this.currentPlayer;
        },
        resetCurrentPlayer: function () {
            this.currentPlayer = players[0];
        }
    }
})();

const height = 6;
const width = 8;

const players = [
    new Player({
        id: 1,
        name: 'Abbott1',
        color: 'red'
    }),
    new Player({
        id: 2,
        name: 'Costello2',
        color: 'blue'
    })
];

const playerManager = new PlayerManager(players);
const board = new ConnectBoard({ height: height, width: width });
const boardView = new ConnectBoardView(board, playerManager);
