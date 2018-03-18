const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Tweet = require("../models/tweet");

const SITE_TITLE = "Twitter Client";

const isAuthenticated = (req, res, next) => {
    if(req.session && req.session.authenticated) {
        next();
    } else {
        res.redirect("/auth/twitter");
    }
};

const serializeUser = ({ 
    id, 
    normalizedName: screen_name,
    displayName: name,
    avatar: profile_image_url
}) => {
    return JSON.stringify({ id, screen_name, name, profile_image_url });
};

const deserializeUser = (userJSON) => {
    const user = new User(JSON.parse(userJSON));
    return user;
};

module.exports = (twit) => {

    router.get("/", [isAuthenticated, (req, res) => {
        const user = deserializeUser(req.session.user);
        res.render("index", { 
            title: `${user.displayName} | ${SITE_TITLE}`, 
            name: user.name,
            avatar: user.avatar
        });
    }]);

    router.get("/auth/twitter", (req, res) => {

        twit.get("account/verify_credentials", (err, data, callback) => {
            //console.log(data);
            const user = new User(data);

            req.session.user = serializeUser(user);
            req.session.authenticated = true;
            res.redirect("/");
        
        });

    });

    router.get("/tweets", (req, res) => {
        twit.get("statuses/home_timeline", { count: 5 }, 
            (err, data, callback) => 
        {
            const tweets = data.map(tweet => new Tweet(tweet));
            res.json(tweets);
        });
    });

    return router;
};