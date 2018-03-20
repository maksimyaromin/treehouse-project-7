const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Tweet = require("../models/tweet");
const Friend = require("../models/friend");

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
    avatar: profile_image_url,
    friendsCount: friends_count
}) => {
    return JSON.stringify({ id, screen_name, name, profile_image_url, friends_count });
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
            avatar: user.avatar,
            friends: user.friendsCount
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
            const tweets = data instanceof Array 
                ? data.map(tweet => new Tweet(tweet))
                : null;
            res.json(tweets);
        });
    });

    router.get("/friends", (req, res) => {
        const cursor = req.query.cursor || -1;
        twit.get("friends/list", { count: 5, cursor },
            (err, data, callback) => 
        {
            const friends = data.users instanceof Array
                ? data.users.map(friend => new Friend(friend)) 
                : null;
            res.json({ friends, cursor: data.next_cursor });
        });
    });

    router.get("/messages/:id", (req, res) => {
        const id = req.params.id;
        twit.get("/direct_messages/events/show", { id },
            (err, data, callback) => {
                res.json(data);
            });
    });

    return router;
};