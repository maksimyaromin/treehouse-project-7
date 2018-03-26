const express = require("express");
const router = express.Router();

/* Connection of simple models, which describe entities required for the application. 
    The models are written for orderliness, but one can surely do without it. */
const User = require("../models/user");
const Tweet = require("../models/tweet");
const Friend = require("../models/friend");
const Message = require("../models/message");

const SITE_TITLE = "Twitter Client";

/* In the example of simple authentication the  attribute 'authenticated' is put into user session. 
    The function checks for the attribute and if not found redirects to the authorization page . */
const isAuthenticated = (req, res, next) => {
    if(req.session && req.session.authenticated) {
        next();
    } else {
        res.redirect("/auth/twitter");
    }
};

/* Simple user serialization functions in JSON and deserialization JSON in model User. Made for orderliness. */
const serializeUser = ({ 
    id, 
    normalizedName: screen_name,
    displayName: name,
    avatar: profile_image_url,
    friendsCount: friends_count,
    background: profile_background_image_url
}) => {
    return JSON.stringify({ id, screen_name, name, profile_image_url, friends_count, profile_background_image_url });
};

const deserializeUser = (userJSON) => {
    const user = new User(JSON.parse(userJSON));
    return user;
};

/* Routing table */
module.exports = (twit) => {

    router.get("/", [isAuthenticated, (req, res) => {
        const user = deserializeUser(req.session.user);
        res.render("index", { 
            title: `${user.displayName} | ${SITE_TITLE}`, 
            name: user.name,
            avatar: user.avatar,
            friends: user.friendsCount,
            background: user.background
        });
    }]);

    router.get("/signout", (req, res) => {
        req.session.destroy(err => {
            res.render("logout", {
                title: "Bye!"
            });
        });
    });

    router.get("/auth/twitter", (req, res, next) => {
        twit.get("account/verify_credentials", (err, data, callback) => {
            /* Here and after if the request to Twitter API has ended with an obvious error, then this error is 
			flown further down the table to the middleware 500 */
            if(err) return next(err);
            const user = new User(data);

            /* If API returns user data successfully, then write his model in the session and put an attribute
                of successful authorization */
            req.session.user = serializeUser(user);
            req.session.authenticated = true;
            res.redirect("/");
        });
    });

    router.get("/tweets", (req, res, next) => {
        twit.get("statuses/home_timeline", { count: 5 }, 
            (err, data, callback) => 
        {
            if(err) return next(err);
            const tweets = data instanceof Array 
                ? data.map(tweet => new Tweet(tweet))
                : null;
            res.json(tweets);
        });
    });

    router.get("/friends", (req, res, next) => {
        const cursor = req.query.cursor || -1;
        twit.get("friends/list", { count: 5, cursor },
            (err, data, callback) => 
        {
            if(err) return next(err);
            const friends = data.users instanceof Array
                ? data.users.map(friend => new Friend(friend)) 
                : null;
            res.json({ friends, cursor: data.next_cursor });
        });
    });

    router.get("/messages", (req, res, next) => {
        const user = deserializeUser(req.session.user);
        twit.get("/direct_messages/events/list", { count: 5 },
            (err, data, callback) => {
                if(err) return next(err);
                const messages = data.events.map(event => Message.release(event, user));
                const tasks = messages.map(message => message.getUserInfo(twit));
                Promise.all(tasks)
                    .then(() => {
                        res.json(messages);
                    })
                    .catch(err => next(err));
            });
    });

    /* Calling api methods does not generate an obvious error in most cases, but returns error response.  
        This function checks the response status and returns corresponding characteristic to the client. In case
        when done = false client receives alert with all error massages. This way is rather clumsy, and might be used 
        only for demonstration purposes*/
    const apiResponse = (data, res) => {
        const { errors } = data;
        if(errors) {
            const message = errors.reduce((text, error) => {
                return text + " " + error.message;
            }, "");
            res.json({ done: false, message });
        } else {
            res.json({ done: true });
        }
    };

    router.post("/api/like", (req, res) => {
        twit.post("/favorites/create", { id: req.body.id },
            (err, data, callback) => apiResponse(data, res));
    });

    router.post("/api/unlike", (req, res) => {
        twit.post("/favorites/destroy", { id: req.body.id },
            (err, data, callback) => apiResponse(data, res));
    });

    router.post("/api/retweet", (req, res) => {
        twit.post("/statuses/retweet/:id", { id: req.body.id },
            (err, data, callback) => apiResponse(data, res));
    });

    router.post("/api/unretweet", (req, res) => {
        twit.post("/statuses/unretweet/:id", { id: req.body.id },
            (err, data, callback) => apiResponse(data, res));
    });

    router.post("/api/reply", (req, res) => {
        twit.post("/statuses/update", {
            status: `@${req.body.username} ${req.body.message}`,
            in_reply_to_status_id: req.body.id
        }, (err, data, callback) => apiResponse(data, res));
    });

    router.post("/api/tweet", (req, res) => {
        twit.post("/statuses/update", {
            status: req.body.message
        }, (err, data, callback) => apiResponse(data, res));
    });

    router.post("/api/follow", (req, res) => {
        twit.post("/friendships/create", {
            user_id: req.body.id
        }, (err, data, callback) => apiResponse(data, res));
    });

    router.post("/api/unfollow", (req, res) => {
        twit.post("/friendships/destroy", {
            user_id: req.body.id
        }, (err, data, callback) => apiResponse(data, res));
    });

    return router;
};