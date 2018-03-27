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
const fs = require("fs");

const config = require("./config");
const Twit = require("twit");

const app = express();
app.set("port", process.env.PORT || 3000);
/* All views must be in the views folder at the project root */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set("json spaces", 40);

/* All static files (css, pictures, etc.) must be in the assets folder at the project root */
app.use(servStatic(path.join(__dirname, "assets")));
app.use(cookieParser());
/* To imitate user authorization express sessions, which are stored in memory for 2 minutes  are used. This first 
    of all is needed to imitate the operation of the "Sign Out" button and get the user data 
	for the application in each request, where it is needed */
app.use(session({ 
    secret: "treehouse",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 2 * 60 * 1000 },
    store: new MemoryStore({ expires: 2 * 60 * 1000 })
}));
/* Simple request logger. In real application you might want to configure it in a different way */
const logs = path.join(__dirname, "logs");
if(!fs.existsSync(logs)) { fs.mkdirSync(logs); }
app.use(expressWinston.logger({
    transports: [
        new winston.transports.File({
            filename: path.join(logs, "list.log"),
            colorize: true
        })
    ],
    expressFormat: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/* Route settings. This requires an object instance Twit */
app.use("/", require("./js/routes")(
    new Twit(config)
));
/* Handler (middleware) 404 Not Found */
app.use((req, res, next) => {
    res.status(404).render("error", {
        title: "Ups! Not Found",
        code: 404,
        message: "The page you requested was not found"
    });
});  
/* Handler (middleware) 500 Server Error */
app.use((err, req, res, next) => {
    res.status(500).render("error", {
        title: "Ups! Server Error",
        code: res.statusCode,
        message: err.message
    });
});
/* HTTP server start*/
http.createServer(app).listen(app.get("port"), () => {
    console.log(`Serving: localhost ${app.get("port")}`);
});