const gameCodeInput = $("gameCode")

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

$("joinGameFriendly").onclick = () => {
    if (!validateCode(gameCodeInput.value)) {
        $("gameCodeError").innerText = "Invalid game code"
        return
    }

    enterGame(gameCodeInput.value)
}

$("createGame").onclick = () => {
    sessionStorage.setItem("type", "create")
    sessionStorage.removeItem("code")
    window.location.href = "/g/"
}

$("joinGameRanked").onclick = () => {
    sessionStorage.setItem("type", "ranked")
    sessionStorage.removeItem("code")
    window.location.href = "/g/"
}

$("joinGameRandom").onclick = () => {
    sessionStorage.setItem("type", "random")
    sessionStorage.removeItem("code")
    window.location.href = "/g/"
}