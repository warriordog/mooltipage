export default {
    "typescript": {
        "rewritePaths": {
            "src/": "dist/"
        }
    },
    "files": [
        "src/test/**/*",
        "!src/test/_mocks/**/*",
        "!src/test/_util/**/*"
    ]
}