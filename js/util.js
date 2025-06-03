const API_URL = "http://localhost:3000"

const $ = id => document.getElementById(id)

async function auth(redirectStatus, href, then = () => {}) {
    const res = await fetch(API_URL + "/auth", {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        }
    })

    if (res.status == redirectStatus) {
        location.href = href
    } else {
        then(await res.text())
    }
}