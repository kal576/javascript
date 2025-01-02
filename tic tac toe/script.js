// DOM Element Selectors
const landingPage = document.querySelector(".landing");
const gamePage = document.querySelector(".game-page");
const playerForm = document.querySelector(".players");
const board = document.querySelector(".board");
const msg = document.querySelector(".msg");
const restart = document.querySelector(".restart");
const startGame = document.querySelector(".btn");
const home = document.querySelector(".home");
const singlePlayer = document.querySelector(".single");
const multiPlayer = document.querySelector(".multi");
const gameMode = document.querySelector(".game-mode");
const Difficulty = document.querySelector(".difficulty");

let player1Name = "";
let player2Name = "";
let player1Score = 0;
let player2Score = 0;
let currentPlayer = "X";
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let isSinglePlayer = false;
let difficulty = "easy"; // default difficulty

// Winning combinations
const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [0, 4, 8],
];

// Handle player names submission
playerForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Get player names
    player1Name = document.getElementById("player1").value.trim() || "Player 1";
    player2Name = document.getElementById("player2").value.trim() || "Player 2";

    // Update message and show game page
    msg.textContent = `${player1Name}'s turn (X)...`;
    showGame();
});

// Function to fade out landing page and show game page
function showGame() {
    landingPage.style.opacity = "0"; // Fade out landing page
    setTimeout(() => {
        landingPage.style.display = "none";
        gamePage.style.display = "block"; // Show game page
        setTimeout(() => {
            gamePage.style.opacity = "1";
        }, 20);
    }, 500);

    createBoard(); // Initialize the game board
}

// Function to show landing page when multiplayer is selected
function showLandingPage() {
    gameMode.style.opacity = "0";
    setTimeout(() => {
        gameMode.style.display = "none"; // hide game-mode page
        landingPage.style.display = "block"; // show landing page
       // playerForm.style.display = "block";
        setTimeout(() => {
            landingPage.style.opacity = "1";
        }, 20);
    }, 500);
}

// Function to display difficulty page
function showDifficulty() {
    gameMode.style.opacity = "0";
    setTimeout(() => {
        gameMode.style.display = "none"; // hide game-mode page
        Difficulty.style.display = "flex"; // show difficulty page
        setTimeout(() => {
            Difficulty.style.opacity = "1";
        }, 20);
    }, 500);
}

// Function to show game page after difficulty level is selected
function showGamePage() {
    Difficulty.style.opacity = "0";
    setTimeout(() => {
        Difficulty.style.display = "none"; // hide difficulty page
        gamePage.style.display = "block"; // show game page
        setTimeout(() => {
            gamePage.style.opacity = "1";
        }, 20);
    }, 500);

    createBoard();
}

// Initialize the game board
function createBoard() {
    board.innerHTML = ""; // Clear the board

    // Create new cells and append them
    gameState.forEach((_cell, index) => {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        cellElement.dataset.index = index;

        // Add click event listener to each cell
        cellElement.addEventListener("click", handleCellClick);
        board.appendChild(cellElement);
    });

    // Check if cells are being created properly
   // console.log(board.children.length); // Debugging: log the number of cells
}

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedIndex = parseInt(clickedCell.dataset.index);

    if (gameState[clickedIndex] !== "" || !gameActive) {
        return; // Ignore clicks on filled cells or inactive game
    }

    // Update game state
    gameState[clickedIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;

    if (checkWinner()) {
        highlightWinner();
        msg.textContent = `${currentPlayer} wins!`;
        gameActive = false;
        return;
    }

    if (!gameState.includes("")) {
        msg.textContent = "It's a draw!";
        highlightDraw();
        gameActive = false;
        return;
    }

    // Switch turns
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    msg.textContent = `${currentPlayer === "X" ? player1Name : player2Name}'s turn (${currentPlayer})...`;

    // Trigger computer's turn if it's single-player mode and it's the computer's turn
    if (isSinglePlayer === true && currentPlayer === "O") {
        computer(); // Call the computer move function
    }
}

// Functions for computer moves

// Easy level
document.querySelector(".easy").addEventListener("click", () => {
  //  difficulty = "easy";
    showGamePage();
    easy();
});

// Normal level
document.querySelector(".normal").addEventListener("click", () => {
  //  difficulty = "normal";
    showGamePage();
    normal();
});

// Hard level
document.querySelector(".hard").addEventListener("click", () => {
   // difficulty = "hard";
    showGamePage();
    hard();
});

// Easy mode: the computer selects cells at random
function easy() {
    const emptyCells = gameState.map((cell, index) => (cell === "" ? index : -1)).filter(index => index !== -1);
    const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    makeMove(randomMove);
    computer(easy);
}

// Normal mode: the computer tries to win or block the player from winning
function normal() {
    const winningMove = findWinningMove("O"); // tries to win
    if (winningMove !== -1) {
        makeMove(winningMove);
        return;
    }

    const blockMove = findWinningMove("X"); // finds the winning move of player and tries to block it
    if (blockMove !== -1) {
        makeMove(blockMove);
        return;
    }

    easy(); // if there is no winning or losing move, choose a random cell
    computer(normal);
}

// Checks whether it is possible for the opponent to win
function findWinningMove(player) {
    for (let combo of winningCombos) {
        const emptyCell = combo.find(index => gameState[index] === "");
        if (emptyCell !== undefined) {
            const count = combo.filter(index => gameState[index] === player).length;
            if (count === 2) {
                return emptyCell; // if the opponent has 2 cells of the three, it returns the empty cell
            }
        }
    }
    return -1; // no winning move
}

// Hard level using minimax algorithm
function hard() {
    const bestMove = minimax(gameState, "O");
    makeMove(bestMove.index);
    computer(hard);
}

// Minimax algorithm
function minimax(board, player) {
    const availableMoves = board.map((cell, index) => cell === "" ? index : -1).filter(index => index !== -1);

    // Check for a winner or draw
    if (checkWinner()) {
        return { score: player === "O" ? -10 : 10 }; // Winning/losing score
    }

    if (!board.includes("")) {
        return { score: 0 }; // Draw
    }

    const moves = [];
    for (let move of availableMoves) {
        const newBoard = [...board];
        newBoard[move] = player;
        const score = minimax(newBoard, player === "O" ? "X" : "O").score;
        moves.push({ index: move, score });
    }

    return player === "O"
        ? moves.reduce((best, move) => (move.score > best.score ? move : best))
        : moves.reduce((best, move) => (move.score < best.score ? move : best));
}

function computer() {
    if (!gameActive || currentPlayer === "X") {
        return; // Prevent moves when the game is over or it's not the computer's turn
    }

    // Set a delay based on difficulty
    const delay = difficulty === "hard" ? 1000 : 500; // Increase delay for hard mode
    setTimeout(() => {
        switch (difficulty) {
            case "easy":
                easy(); // Easy difficulty: random moves
                break;
            case "normal":
                normal(); // Normal difficulty: tries to win/block
                break;
            case "hard":
                hard(); // Hard difficulty: uses minimax algorithm
                break;
        }

        // Check if the computer has won
        if (checkWinner()) {
            highlightWinner();
            msg.textContent = `${player2Name} (Computer) wins!!`;
            gameActive = false;
            return;
        }

        // Check for draw
        if (!gameState.includes("")) {
            msg.textContent = "It's a draw!!";
            highlightDraw();
            return;
        }

        // Switch to player 1's turn
        currentPlayer = "X";
        msg.textContent = `${player1Name}'s turn (X)...`;
    }, delay);
}

// Check if a player has won
function checkWinner() {
    return winningCombos.some((combination) => {
        if (combination.every((index) => gameState[index] === currentPlayer)) {
            updateScore(currentPlayer); // Update the score
            return true;
        }
        return false;
    });
}


// Highlight the winning combination
function highlightWinner() {
    winningCombos.forEach((combination) => {
        if (combination.every((index) => gameState[index] === currentPlayer)) {
            combination.forEach((index) => {
                const cell = board.children[index];
                cell.classList.add("winning");
            });
        }
    });
}

function highlightDraw() {
    for (let i = 0; i < board.children.length; i++) {
        board.children[i].style.backgroundColor = "lightblue";
    }
}

function updateScore(winner) {
    winner === "X" ? player1Score++ : player2Score++;
displayScores();
}

function displayScores() {
    document.querySelector(".player1-score").textContent = `${player1Name}: ${player1Score}`;
    document.querySelector(".player2-score").textContent = `${player2Name}: ${player2Score}`;
}

// Resetting the game
function resetGame() {
    gameState = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;
    board.innerHTML = ""; // Clear the board
    msg.textContent = "";

    // Reset scores if necessary
   // player1Score = 0;
    //player2Score = 0;
    displayScores();
}


// Choose playing mode

// Single player
singlePlayer.addEventListener("click", () => {
    player1Name = prompt("Enter your name: ", "Player"); // Prompt player for their name

    if (!player1Name || player1Name.trim() === "") {
        player1Name = "Player";
    }

    player2Name = "Computer"; // Default name for the computer

    isSinglePlayer === true; // Set to single-player mode

    // Transition to the difficulty selection page
    setTimeout(() => {
        gameMode.style.opacity = "0"; // Fade out game mode
        setTimeout(() => {
            showDifficulty(); // Show difficulty page after fading out
        }, 20);
    }, 500);
});

// Two-player
multiPlayer.addEventListener("click", () => {
    isSinglePlayer = false;
    showLandingPage();
});

// Go to home page
home.addEventListener("click", () => {
    gamePage.style.opacity = "0"; // Fade out game page

    setTimeout(() => {
        gamePage.style.display = "none";
        landingPage.style.display = "none"; // don't Show game page
        gameMode.style.display = "flex"; // show game mode

        setTimeout(() => {
            gameMode.style.opacity = "1";
        }, 20);
    }, 500);

    // Reset game state
    player1Score = 0;
    player2Score = 0;
    resetGame();
   
});

// Restart the game
restart.addEventListener("click", () => {
    resetGame();
    msg.textContent = `${player1Name}'s turn (X)...`;
    createBoard();
});

// Back to game mode
document.querySelector(".back").addEventListener("click", () => {
    landingPage.style.opacity = "0";
    gamePage.style.opacity = "0";

    setTimeout(() => {
        landingPage.style.opacity = "none";
        gamePage.style.opacity = "none";
        gameMode.style.display = "flex";
        setTimeout(() => {
            gameMode.style.opacity = "1";
        }, 20);
    }, 500);
});

// Show the game page when Start Game button is clicked
startGame.addEventListener("click", () => {
    showGame();
});
