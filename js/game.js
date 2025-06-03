const socket = io(API_URL, {
    withCredentials: true
})

const canvas = $("canvas")
const resultSpan = $("result")
// const sideSpan = $("side")
const turnSpan = $("turn")

const ctx = canvas.getContext("2d")

const BG_COLOR = "#BEBAB6"
const LAST_COLOR = "#6C6660"

const W = canvas.width
const H = canvas.height
const CELL_S = 50

var gameCode = ""

var playerNumber = -1

var username = ""
var opponentUsername = ""

document.onclick = e => handleClick(e.x - canvas.getBoundingClientRect().left, e.y - canvas.getBoundingClientRect().top)

socket.on("gameState", gameState => {
    draw(JSON.parse(gameState))
})
socket.on("preInit", code => {
    gameCode = code
    playerNumber = 0
    draw()
})
socket.on("init", data => {
    const gameState = JSON.parse(data)

    // sessionStorage.setItem("type", "rejoin")

    playerNumber *= -1 // if 0 then 0, if -1 (default) then 1 

    const u0 = gameState.usernames[0] || "Guest"
    const u1 = gameState.usernames[1] || "Guest";

    ([username, opponentUsername] = (playerNumber == 0 ? [u0, u1] : [u1, u0]))

    draw(gameState)
})
socket.on("joinGameError", msg => document.write(msg))

if (sessionStorage.getItem("type") == "create") {
    socket.emit("createGame")
} else if (sessionStorage.getItem("type") == "home") {
    location.href = "/"
} else if (sessionStorage.getItem("type") != "rejoin") {
    socket.emit("joinGame", JSON.stringify({
        type: sessionStorage.getItem("type"),
        code: sessionStorage.getItem("code")
    }))
}

function drawGrid() {
    ctx.lineWidth = 1
    ctx.strokeStyle = "BLACK"
    ctx.beginPath()
    ctx.translate(0.5, 0.5)

    for (var i = 1; i < W / CELL_S; i++) {
        ctx.moveTo(i * CELL_S, 0)
        ctx.lineTo(i * CELL_S, H)
    }
    for (var j = 1; j < H / CELL_S; j++) {
        ctx.moveTo(0, j * CELL_S)
        ctx.lineTo(W, j * CELL_S)
    }

    ctx.stroke()
    ctx.translate(-0.5, -0.5)
}

function drawGame(gameState) {
    if (gameState.last.exists) {
        ctx.fillStyle = LAST_COLOR
        ctx.fillRect(gameState.last.x * CELL_S + 1, gameState.last.y * CELL_S + 1, CELL_S - 1, CELL_S - 1)
    }

    for (xx of gameState.xes) { 
        ctx.fillStyle = "red"
        ctx.fillRect(xx.x * CELL_S + 1, xx.y * CELL_S + 1, CELL_S/2 - 1, CELL_S/2 - 1)
    }

    for (o of gameState.os) { 
        ctx.fillStyle = "blue"
        ctx.fillRect(o.x * CELL_S + 1, o.y * CELL_S + 1, CELL_S/2 - 1, CELL_S/2 - 1)
    }
}

function draw(gameState = null) {
    ctx.fillStyle = BG_COLOR
    ctx.fillRect(0, 0, W, H)

    drawGrid()

    if (gameState) {
        switch (gameState.status) {
            case -2:
                switch (sessionStorage.getItem("type")) {
                    case "create":
                        resultSpan.textContent = "GAME CODE: " + gameCode
                        break
                    case "ranked":
                        resultSpan.textContent = "WAITING IN RANKED QUEUE..."
                        break
                    case "random":
                        resultSpan.textContent = "WAITING IN RANDOM QUEUE..."
                        break
                }
            case -1:
                const myChar = playerNumber == gameState.xNumber ? 'X' : 'O';
                const opponentChar = playerNumber == gameState.xNumber ? 'O' : 'X';

                resultSpan.textContent = `${myChar}: ${username} vs ${opponentChar}: ${opponentUsername}`
                break
            default:
                gameOver(gameState)
                break
        }

        const isSideX = gameState.xNumber == playerNumber
        // sideSpan.textContent = isSideX ? "X" : "O"

        turnSpan.textContent = (gameState.xTurn == isSideX) ? "YOUR TURN" : "OPPONENTS TURN"

        drawGame(gameState)
    } else {
        switch (sessionStorage.getItem("type")) {
            case "create":
                resultSpan.textContent = "GAME CODE: " + gameCode
                break
            case "ranked":
                resultSpan.textContent = "WAITING IN RANKED QUEUE..."
                break
            case "random":
                resultSpan.textContent = "WAITING IN RANDOM QUEUE..."
                break
        }
    }
}
function handleClick(x, y) {
    if (x < 0 || y < 0 || x > W || y > H) return

    var xx = Math.floor(x / CELL_S)
    var yy = Math.floor(y / CELL_S)

    socket.emit("click", JSON.stringify({ x: xx, y: yy }))
}

function gameOver(gameState) {
    const win = (playerNumber == gameState.xNumber ? 0 : 1) == gameState.status
    
    if (gameState.status == -2) {
        resultSpan.textContent = "DRAW"
    } else {
        resultSpan.textContent = win ? "YOU WIN" : "YOU LOSE"
    }

    sessionStorage.setItem("type", "home")
}