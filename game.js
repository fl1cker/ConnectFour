(
    () => {
        /* Initialization */
        var height = 6;
        var width = 8;
        var isGameOver = false;
        var showError = false;

        createBoard(height, width);
        var players = createPlayers();
        var currentPlayer = players[0];
        addNewPlayer();

        function createPlayers() {
            const player1 = {
                id: 0,
                name: 'Abbott',
                color: 'red'
            }
            const player2 = {
                id: 1,
                name: 'Costello',
                color: 'blue'
            }

            return [player1, player2];
        }

        function createBoard(height, width) {
            const gameBoard = document.getElementById('board');
            const tbody = document.createElement('tbody');
            gameBoard.appendChild(tbody);

            for (let i = 0; i < height; i++) {
                const row = document.createElement('tr');
                tbody.appendChild(row);
                for (let j = 0; j < width; j++) {
                    const cell = document.createElement('td');
                    cell.setAttribute('position', j.toString() + i.toString());
                    cell.className = 'cell';
                    cell.classList.add('empty');
                    cell.addEventListener('click', executeTurn);
                    row.appendChild(cell);
                }
            }
        }

        /* Logic */
        function executeTurn(event) {
            if (isGameOver)
                return;

            if (showError) {
                setError('');
            }

            var placedPosition = placeGamePiece(event.target);
        
            if (calculateWin(placedPosition, currentPlayer.color)) {
                return endGame();
            } else {
                clearOldPlayer();
                togglePlayer();
                addNewPlayer();
            }
        }

        function setError(message) {
            if (!message) {
                document.getElementById('error-message').innerHTML = '';
                showError = false;
            } else {
                document.getElementById('error-message').innerHTML = message;
                showError = true;
            }
        }

        function calculateWin(startingPoint, color) {
            const x = startingPoint[0];
            const y = startingPoint[1];
            if (calculateLeftRight(x, y, color) ||
                calculateUpDown(x, y, color) ||
                calculateBackSlash(x, y, color) ||
                calculateForwardSlash(x, y, color)) {
                endGame();
                return true;
            }
        }

        function calculateLeftRight(x, y, color) {
            const startingX = x;
            let numInARow = 1;

            while (doesMatch(--x, y, color)) {
                numInARow++;
            }

            x = startingX;

            while (doesMatch(++x, y, color)) {
                numInARow++;
            }

            return numInARow >= 4;
        }

        function calculateUpDown(x, y, color) {
            const startingY = y;
            let numInARow = 1;

            while (doesMatch(x, --y, color)) {
                numInARow++;
            }

            y = startingY;

            while (doesMatch(x, ++y, color)) {
                numInARow++;
            }

            return numInARow >= 4;
        }

        function calculateBackSlash(x, y, color) {
            const startingX = x;
            const startingY = y;
            let numInARow = 1;

            while (doesMatch(--x, --y, color)) {
                numInARow++;
            }

            y = startingY;
            x = startingX;

            while (doesMatch(++x, ++y, color)) {
                numInARow++;
            }

            return numInARow >= 4;
        }

        function calculateForwardSlash(x, y, color) {
            const startingX = x;
            const startingY = y;
            let numInARow = 1;

            while (doesMatch(++x, --y, color)) {
                numInARow++;
            }

            y = startingY;
            x = startingX;

            while (doesMatch(--x, ++y, color)) {
                numInARow++;
            }

            return numInARow >= 4;
        }

        function doesMatch(x, y, color) {
            if (x < 0 || x === width || y < 0 || y === height) {
                return false;
            }
            const cell = getCellByPosition(x, y);
            const result = cell.classList.contains(color);
            return result;
        }

        /* Handle Game */
        function placeGamePiece(element) {
            const position = getPosition(element);
            const columnNumber = position[0];

            for (let i = (height - 1); i >= 0; i--) {
                const cell = getCellByPosition(columnNumber, i);
                if (cell.classList.contains('empty')) {
                    cell.classList.remove('empty');
                    cell.classList.add(currentPlayer.color);
                    return `${columnNumber}${i}`;
                }
            }
        }

        function getCellByPosition(x, y) {
            return document.querySelector(`[position='${x}${y}'`);
        }

        function getPosition(element) {
            return element.getAttribute('position');
        }

        function endGame() {
            const gameMessageElement = document.getElementById('game-message');
            gameMessageElement.classList.add(currentPlayer.color);
            gameMessageElement.innerHTML = `CONGRATULATIONS ${currentPlayer.name}!!`;

            isGameOver = true;
        }

        /* Handle Players */
        function togglePlayer() {
            const newIndex = currentPlayer.id === players[0].id ? 1 : 0;
            currentPlayer = players[newIndex];
        }

        function clearOldPlayer() {
            const gameMessageElement = document.getElementById('game-message');
            gameMessageElement.classList.remove(currentPlayer.color);
        }

        function addNewPlayer() {
            const gameMessageElement = document.getElementById('game-message');
            gameMessageElement.classList.add(currentPlayer.color);

            const nameElement = document.getElementById('player-name');
            nameElement.innerHTML = currentPlayer.name;
        }
    }
)();