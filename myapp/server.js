const app = require("./app");
const http = require("http");

http.createServer(app).listen(3000, () => {
    console.log("Server is listening http://localhost:3000");
})