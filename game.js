(
    () => {
        var _ = self.ConnectBoardView = function (connectBoard, playerManager) {
            this.connectBoard = connectBoard;
            this.height = connectBoard.length;
            this.width = connectBoard[0].length;
            this.isGameOver = false;
            this.showError = false;
            this.playerManager = playerManager;
        };

        _.prototype = {
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
                        cell.addEventListener('click', executeTurn);
                        row.appendChild(cell);
                    }
                }
            },

            executeTurn: function (event) {
                if (isGameOver)
                    return;

                var placedPosition = placeGamePiece(event.target, this.playerManager.currentPlayer);
                if (!placedPosition) { return; }

                if (this.connectBoard.calculateWinAny(placedPosition, currentPlayer.id)) {
                    return endGame();
                } else {
                    this.playerManager.togglePlayer();
                    displayCurrentPlayer(this.playerManager.currentPlayer);
                }
            },

            placeGamePiece: function (element, currentPlayer) {
                const position = getPosition(element);
                const columnNumber = position[0];

                const placedPosition = this.board.placeGamePieceInColumn(columnNumber, currentPlayer.id);

                if (placedPosition) {
                    const cell = getCellByPosition(placedPosition[0], placedPosition[1]);
                    cell.classList.add(playerColor);
                }

                return placedPosition;
            },

            getCellByPosition: function (x, y) {
                return document.querySelector(`[position='${x}${y}'`);
            },

            getPosition: function (element) {
                return element.getAttribute('position');
            },

            endGame: function () {
                const gameMessageElement = document.getElementById('game-message');
                gameMessageElement.classList.add(currentPlayer.color);
                gameMessageElement.innerHTML = `CONGRATULATIONS ${currentPlayer.name}!!`;

                isGameOver = true;
            },

            displayCurrentPlayer: function (currentPlayer) {
                const gameMessageElement = document.getElementById('game-message');
                const nameElement = document.getElementById('player-name');

                gameMessageElement.classList.remove(currentPlayer.color);
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
        this.board;
    };

    _.prototype = {
        createBoard: function () {
            this.board = new Array(this.height);
            for (let i = 0; i < this.width; i++) {
                this.board[i] = new Array(this.width).fill(0); //0 = empty; 1 = player1; 2 = player2
            }
        },

        placeGamePieceInColumn: function (columnIndex, playerId) {
            for (let i = (height - 1); i >= 0; i--) {
                if (this.board[columnIndex, i] == 0) { //0 = empty; 1 = player1; 2 = player2;
                    this.board[columnIndex, i] = playerId;
                    return `${columnNumber}${i}`;
                }
            }

            return "";
        },

        calculateWinAny: function (startingPoint, playerId) {
            const x = startingPoint[0];
            const y = startingPoint[1];
            return (calculateWinHorizontal(x, y, playerId) ||
                calculateWinVertical(x, y, playerId) ||
                calculateBackSlash(x, y, playerId) ||
                calculateForwardSlash(x, y, playerId))
        },

        calculateWinHorizontal: function (x, y, playerId) {
            const startingX = x;
            let numInARow = 1;

            while (doesCellMatchPlayer(--x, y, playerId)) {
                numInARow++;
            }

            x = startingX;

            while (doesCellMatchPlayer(++x, y, playerId)) {
                numInARow++;
            }

            return numInARow >= 4;
        },

        calculateWinVertical: function (x, y, playerId) {
            const startingY = y;
            let numInARow = 1;

            while (doesCellMatchPlayer(x, --y, playerId)) {
                numInARow++;
            }

            y = startingY;

            while (doesCellMatchPlayer(x, ++y, playerId)) {
                numInARow++;
            }

            return numInARow >= 4;
        },

        calculateWinBackSlash: function (x, y, playerId) {
            const startingX = x;
            const startingY = y;
            let numInARow = 1;

            while (doesCellMatchPlayer(--x, --y, playerId)) {
                numInARow++;
            }

            y = startingY;
            x = startingX;

            while (doesCellMatchPlayer(++x, ++y, playerId)) {
                numInARow++;
            }

            return numInARow >= 4;
        },

        calculateWinForwardSlash: function (x, y, playerId) {
            const startingX = x;
            const startingY = y;
            let numInARow = 1;

            while (doesCellMatchPlayer(++x, --y, playerId)) {
                numInARow++;
            }

            y = startingY;
            x = startingX;

            while (doesCellMatchPlayer(--x, ++y, playerId)) {
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

(() => {
    var _ = self.Player = function (id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
    };

    _.prototype = {};
})();

(() => {
    var _ = self.PlayerManager = function (players) {
        this.players = players;
        this.currentPlayer = players[0];
    }

    _.prototype = {
        togglePlayer: function () {
            const newIndex = this.currentPlayer.id === this.players[0].id ? 1 : 0;
            this.currentPlayer = players[newIndex];
        },
    }
})();

const height = 6;
const width = 8;

const players = [
    new Player({
        id: 0,
        name: 'Abbott1',
        color: 'red'
    }),
    new Player({
        id: 1,
        name: 'Costello2',
        color: 'blue'
    })
];

const playerManager = new PlayerManager(players);
const board = new ConnectBoard({ height: height, width: width });
board.createBoard();
const boardView = new ConnectBoardView(board, playerManager);
boardView.displayBoard();
