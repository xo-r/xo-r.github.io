const gameCodeInput = $("gameCode")
const rightPane = $("rightPane")

function validateCode(code) {
    return code.length == 6 && /^[A-Za-z0-9]*$/.test(code)
}

function enterGame(code) {
    if (!validateCode(code)) {
        location.href = "/"
        return
    }

    sessionStorage.setItem("type", "friendly")
    sessionStorage.setItem("code", code.toUpperCase())
    window.location.href = "/g/"
}

function game(type) {
    sessionStorage.setItem("type", type)
    sessionStorage.removeItem("code")
    window.location.href = "/g/"
}

$("joinGameFriendly").onclick = () => {
    if (!validateCode(gameCodeInput.value)) {
        $("gameCodeError").innerText = "Invalid game code"
        return
    }

    enterGame(gameCodeInput.value)
}
$("createGame").onclick = () => game("create")
$("joinGameClassic").onclick = () => game("classic")
$("joinGameBlitz").onclick = () => game("blitz")
$("joinGameRandom").onclick = () => game("random")

fetch(API_URL + "/api/recent", {
    method: "GET",
    credentials: "include",
    headers: {
        "Content-Type": "application/json"
    }
}).then(res => {
    if (res.status == 200) {
        res.text().then(text => rightPane.innerHTML = text)
    } else {
        rightPane.innerHTML = `
            log in
        `
    }
})