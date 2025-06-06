const socket = io(API_URL, {
    withCredentials: true
})

const canvas = $("canvas")
const resultSpan = $("result")
const errorSpan = $("error")
const turnSpan = $("turn")

const ctx = canvas.getContext("2d")

const BG_COLOR = "#BEBAB6"
const LAST_COLOR = "#6C6660"

const W = canvas.width
const H = canvas.height
const CELL_S = 50

const MIN_SCALE = 0.2
const MAX_SCALE = 4

var gameState = null

var gameCode = ""

var playerNumber = -1

var username = ""
var opponentUsername = ""

var offsetX = 0
var offsetY = 0
var scale = 1

var isDragging = false
var wasDragging = false
var dragStart = { x: 0, y: 0 }

// canvas.addEventListener("click",  e => handleClick(e.x - canvas.getBoundingClientRect().left, e.y - canvas.getBoundingClientRect().top))

canvas.addEventListener("mousedown", e => {
    isDragging = true
    wasDragging = false
    dragStart.x = e.x - canvas.getBoundingClientRect().left
    dragStart.y = e.y - canvas.getBoundingClientRect().top
})
canvas.addEventListener("mousemove", e => {
    if (isDragging) {
        wasDragging = true

        const x = e.x - canvas.getBoundingClientRect().left
        const y = e.y - canvas.getBoundingClientRect().top

        offsetX += x - dragStart.x
        offsetY += y - dragStart.y

        dragStart = { x, y }

        draw()
    }
})
canvas.addEventListener("mouseup", e => {
    if (!wasDragging) {
        const x = e.x - canvas.getBoundingClientRect().left
        const y = e.y - canvas.getBoundingClientRect().top
        handleClick(x, y)
    }
    isDragging = false
    wasDragging = false
})
canvas.addEventListener("mouseleave", () => {
    isDragging = false
})

canvas.addEventListener("wheel", e => {
    e.preventDefault()
    
    const zoomIntensity = 0.1
    const zoom = 1 - Math.sign(e.deltaY) * zoomIntensity

    const newScale = scale * zoom

    if (newScale < MIN_SCALE || newScale > MAX_SCALE) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = (e.clientX - rect.left - offsetX) / scale
    const mouseY = (e.clientY - rect.top - offsetY) / scale

    offsetX -= mouseX * (zoom - 1) * scale
    offsetY -= mouseY * (zoom - 1) * scale

    scale = newScale

    draw()
})

canvas.addEventListener("contextmenu", e => e.preventDefault())

socket.on("gameState", newGameState => {
    gameState = JSON.parse(newGameState)
    draw()
})
socket.on("preInit", code => {
    gameCode = code
    playerNumber = 0
    draw()
})
socket.on("init", data => {
    gameState = JSON.parse(data)

    // sessionStorage.setItem("type", "rejoin")

    playerNumber *= -1 // if 0 then 0, if -1 (default) then 1 

    const u0 = gameState.usernames[0] || "Guest"
    const u1 = gameState.usernames[1] || "Guest";

    ([username, opponentUsername] = (playerNumber == 0 ? [u0, u1] : [u1, u0]))

    draw()
})
socket.on("joinGameError", msg => errorSpan.textContent = `Join error: ${msg}`)
socket.on("invalidMove", msg => errorSpan.textContent = `Invalid move: ${msg}`)

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
    ctx.lineWidth = 1 / scale
    ctx.strokeStyle = "black"
    ctx.beginPath()

    const startX = Math.floor(-offsetX / scale / CELL_S) - 1
    const endX = Math.ceil((W - offsetX) / scale / CELL_S) + 1
    const startY = Math.floor(-offsetY / scale / CELL_S) - 1
    const endY = Math.ceil((H - offsetY) / scale / CELL_S) + 1

    for (let i = startX; i <= endX; i++) {
        const x = Math.round(i * CELL_S) + 0.5 / scale
        ctx.moveTo(x, startY * CELL_S)
        ctx.lineTo(x, endY * CELL_S)
    }

    for (let j = startY; j <= endY; j++) {
        const y = Math.round(j * CELL_S) + 0.5 / scale
        ctx.moveTo(startX * CELL_S, y)
        ctx.lineTo(endX * CELL_S, y)
    }

    ctx.stroke()
}


function drawGame() {
    if (gameState.last.exists) {
        ctx.fillStyle = LAST_COLOR
        ctx.fillRect(gameState.last.x * CELL_S, gameState.last.y * CELL_S, CELL_S, CELL_S)
    }

    for (const xx of gameState.xes) { 
        ctx.fillStyle = "red"
        ctx.fillRect((xx.x + 0.25) * CELL_S, (xx.y + 0.25) * CELL_S, CELL_S / 2, CELL_S / 2)
    }

    for (const o of gameState.os) { 
        ctx.fillStyle = "blue"
        ctx.fillRect((o.x + 0.25) * CELL_S, (o.y + 0.25) * CELL_S, CELL_S / 2, CELL_S / 2)
    }
}

function draw() {
    ctx.save()

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, W, H)

    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    ctx.fillStyle = BG_COLOR
    ctx.fillRect(
        (Math.floor(-offsetX / scale / CELL_S) - 2) * CELL_S,
        (Math.floor(-offsetY / scale / CELL_S) - 2) * CELL_S,
        (Math.ceil(W / scale / CELL_S) + 4) * CELL_S,
        (Math.ceil(H / scale / CELL_S) + 4) * CELL_S
    )

    if (gameState) {
        drawGame()
        
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
                break
            case -1:
                const myChar = playerNumber == gameState.xNumber ? 'X' : 'O';
                const opponentChar = playerNumber == gameState.xNumber ? 'O' : 'X';

                resultSpan.textContent = `${myChar}: ${username} vs ${opponentChar}: ${opponentUsername}`
                break
            default:
                gameOver()
                break
        }

        const isSideX = gameState.xNumber == playerNumber
        // sideSpan.textContent = isSideX ? "X" : "O"

        turnSpan.textContent = (gameState.xTurn == isSideX) ? "YOUR TURN" : "OPPONENTS TURN"
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

    drawGrid()

    ctx.restore()
}
function handleClick(x, y) {
    if (x < 0 || y < 0 || x > W || y > H) return

    const gameX = Math.floor((x - offsetX) / scale / CELL_S)
    const gameY = Math.floor((y - offsetY) / scale / CELL_S)

    socket.emit("click", JSON.stringify({ x: gameX, y: gameY }))
}

function gameOver() {
    const win = (playerNumber == gameState.xNumber ? 0 : 1) == gameState.status
    
    if (gameState.status == 2) {
        resultSpan.textContent = "DRAW"
    } else {
        resultSpan.textContent = win ? "YOU WIN" : "YOU LOSE"
    }

    sessionStorage.setItem("type", "home")
}