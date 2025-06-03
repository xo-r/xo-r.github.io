auth(200, "/profile", () => {
    document.body.style.visibility = "visible"
})

$("registerForm").addEventListener("submit", async e => {
    e.preventDefault()

    const data = Object.fromEntries(new FormData(e.target))

    const res = await fetch(API_URL + "/auth/register", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })

    if (res.ok) {
        location.href = "/profile"
    } else {
        $("registerError").innerText = "Register failed: " + await res.text()
    }
})