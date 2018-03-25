const http = require("http");
const express = require("express");
const servStatic = require("serve-static");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MemoryStore = require("session-memory-store")(session);
const path = require("path");
const winston = require("winston");
const expressWinston = require("express-winston");
const bodyParser = require("body-parser");

const config = require("./config");
const Twit = require("twit");

const app = express();
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set("json spaces", 40);

app.use(servStatic(path.join(__dirname, "assets")));
app.use(cookieParser());
app.use(session({ 
    secret: "treehouse",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 2 * 60 * 1000 },
    store: new MemoryStore({ expires: 2 * 60 * 1000 })
}));
app.use(expressWinston.logger({
    transports: [
        new winston.transports.File({
            filename: "logs/list.log",
            colorize: true
        })
    ],
    expressFormat: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", require("./js/routes")(
    new Twit(config)
));
app.use((req, res, next) => {
    res.status(404).render("error", {
        title: "Ups! Not Found",
        code: 404,
        message: "Запрошенная вами страница не найдена"
    });
});  
app.use((err, req, res, next) => {
    res.status(500).render("error", {
        title: "Ups! Server Error",
        code: res.statusCode,
        message: err.message
    });
});

http.createServer(app).listen(app.get("port"), () => {
    console.log(`Serving: localhost ${app.get("port")}`);
});