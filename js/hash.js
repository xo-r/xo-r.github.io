const hash = location.hash

if (hash.startsWith("#") && hash.length > 1) {
    enterGame(hash.substring(1))
}