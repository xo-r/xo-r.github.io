const API_URL = "https://xo-r.duckdns.org:9201"
// const API_URL = "http://localhost:9201"

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