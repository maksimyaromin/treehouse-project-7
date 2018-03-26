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
/* Все представления должны находиться в папке views в корне проекта */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set("json spaces", 40);

/* Все статические файлы (css, картинки и т. д.) должны находиться в папке assets в корне проекта */
app.use(servStatic(path.join(__dirname, "assets")));
app.use(cookieParser());
/* Для эмитации "авторизации" пользователя используются сессии express, хранящиеся в памяти 2 минуты. Это нужно в первую
    очередь для того, чтобы сэмитировать работу кнопки "Sign Out" и получать для приложения данные о пользователе
    в каждом запросе, где это необходимо */
app.use(session({ 
    secret: "treehouse",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 2 * 60 * 1000 },
    store: new MemoryStore({ expires: 2 * 60 * 1000 })
}));
/* Просто логгер запросов. В реальном приложении вы вероятно захотите его сконфигурировать по-другому */
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
/* Настройка маршрутов. Для этого требуется экземпляр объекта Twit */
app.use("/", require("./js/routes")(
    new Twit(config)
));
/* Обработчик (middleware) 404 Not Found */
app.use((req, res, next) => {
    res.status(404).render("error", {
        title: "Ups! Not Found",
        code: 404,
        message: "Запрошенная вами страница не найдена"
    });
});  
/* Обработчик (middleware) 500 Server Error */
app.use((err, req, res, next) => {
    res.status(500).render("error", {
        title: "Ups! Server Error",
        code: res.statusCode,
        message: err.message
    });
});
/* Запуск HTTP сервера */
http.createServer(app).listen(app.get("port"), () => {
    console.log(`Serving: localhost ${app.get("port")}`);
});