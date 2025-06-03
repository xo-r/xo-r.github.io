auth(401, "/login", (res) => {
    const data = JSON.parse(res)

    document.body.style.visibility = "visible"

    $("username").innerText = data.username
    $("email").innerText = data.email
    $("isAdmin").innerText = data.isAdmin
})

$("logout").onclick = async () => {
    const res = await fetch(API_URL + "/auth", {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        }
    })

    if (res.ok) {
        location.href = "/"
    } else {
        $("logoutError").innerText = "Logout failed: " + await res.text()
    }
}