
/* The function for counting the characters of the entered message */
const lettersCounter = (inputContext) => {
    const counterContext = inputContext.parent().find(".app--tweet--char");
    const limit = 140;
    inputContext.on("input", e => {
        const counted = limit - e.target.value.length;
        counterContext.text(counted);
    });
};

/* Function of opening the dialog window (to answer on twit) */
const openWindow = (content, behaviour) => {
    const context = $(
        `<div class="window">
            <div class="window-overlay"></div>
            <div class="window-content">${content}</div>
        </div>`).appendTo($("body"))
            .one("animationend oAnimationEnd mozAnimationEnd webkitAnimationEnd", () => {
                $(document.body).on("click.window", () => {
                    closeWindow();
                });
                context.find(".action--close").on("click", closeWindow);
                context.find(".window-content").on("click.window", e => e.stopPropagation());
                if(typeof behaviour === "function") {
                    behaviour(context);
                }
            });

    const closeWindow = () => {
        context.addClass("close-window").one("animationend oAnimationEnd mozAnimationEnd webkitAnimationEnd", () => {
            $(document.body).off("click.window");
            context.remove();
        });
    };
};

/* Timeline update function */
const updateTimeline = () => {
    const context = $(".app--tweet--list");

    /* HTML generation of a single twit based on the model */
    const make = (tweet) => {
        const at = moment(tweet.at);
        return `
            <li class="tweet" data-uid="${tweet.id}">
                ${tweet.isRetweet
                    ? 
                        `<div class="app--tweet--retweet">
                            <svg viewBox="0 0 38 28">
                                <use xlink:href="./images/sprite.svg#retweet" x="0px" y="0px"></use>
                            </svg>
                            <span>Retweeted by</span>
                            <strong>${tweet.retweeter.displayName}</strong>
                        </div>`
                    : ""}
                <strong class="app--tweet--timestamp">${at.fromNow(true)}</strong>
                <a class="app--tweet--author">
                    <div class="app--avatar" style="background-image: url(${tweet.author.avatar})">
                        <img src="${tweet.author.avatar}" alt="@${tweet.author.normalizedName}" />
                    </div>
                    <h4>${tweet.author.displayName}</h4> @${tweet.author.normalizedName}
                </a>
                <p>${tweet.text}</p>
                <ul class="app--tweet--actions circle--list--inline">
                    <li>
                        <a class="app--reply">
                            <span class="tooltip">Reply</span>
                            <svg viewBox="0 0 38 28">
                                <use xlink:href="./images/sprite.svg#reply" x="0px" y="0px"></use>
                            </svg>
                        </a>
                    </li>
                    <li>
                        <a class="app--retweet${tweet.retweeted ? " app--retweet--done" : ""}">
                            <span class="tooltip">${tweet.retweeted ? "Cancel retweet" : "Retweet"}</span>
                            <svg viewBox="0 0 38 28">
                                <use xlink:href="./images/sprite.svg#retweet" x="0px" y="0px"></use>
                            </svg>
                            <strong>${tweet.retweets ? tweet.retweets : ""}</strong>
                        </a>
                    </li>
                    <li>
                        <a class="app--like${tweet.liked ? " app--like--done" : ""}">
                            <span class="tooltip">${tweet.liked ? "Dislike" : "Like"}</span>
                            <svg viewBox="0 0 38 28">
                                <use xlink:href="./images/sprite.svg#like" x="0px" y="0px"></use>
                            </svg>
                            <strong>${tweet.likes ? tweet.likes : ""}</strong>
                        </a>
                    </li>
                </ul>
            </li>`;
    };

    /* Update likes quantity */
    const changeLikes = (context, number) => {
        let count = parseInt(context.text(), 10) || 0;
        count += number;
        context.text(count ? count : "");
    };

    /* Put Like on twit */
    const like = (target, tweetContext) => {
        fetch(`/api/like`, {
            credentials: "same-origin",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: tweetContext.data("uid") })
        }).then(response => {
            return response.json();
        }).then(response => {
            if(response.done) {
                target.addClass("app--like--done");
                changeLikes(target.find("strong"), 1);
            } else {
                alert(response.message);
            }
        });
    };

    /* Delete Like */
    const unlike = (target, tweetContext) => {
        fetch(`/api/unlike`, {
            credentials: "same-origin",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: tweetContext.data("uid") })
        }).then(response => {
            return response.json();
        }).then(response => {
            if(response.done) {
                target.removeClass("app--like--done");
                changeLikes(target.find("strong"), -1);
            } else {
                alert(response.message);
            }
        });
    };

    /* Retwit twit */
    const retweet = (target, tweetContext) => {
        fetch(`/api/retweet`, {
            credentials: "same-origin",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: tweetContext.data("uid") })
        }).then(response => {
            return response.json();
        }).then(response => {
            if(response.done) {
                updateTimeline();
            } else {
                alert(response.message);
            }
        });
    };

    /* Cancel retwit */
    const unretweet = (target, tweetContext) => {
        fetch(`/api/unretweet`, {
            credentials: "same-origin",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: tweetContext.data("uid") })
        }).then(response => {
            return response.json();
        }).then(response => {
            if(response.done) {
                updateTimeline();
            } else {
                alert(response.message);
            }
        });
    };

    /* Download 5 last twits to timeline with fetch api and set handlers on like, retwit and 
        answer buttons */
    fetch("/tweets", { credentials: "same-origin" })
        .then((response) => {
            return response.json();
        })
        .then(tweets => {
            const html = tweets.map(tweet => make(tweet)).join("");
            context.html(html);

            context.find(".app--like").off("click").on("click", e => {
                e.preventDefault();
                const target = $(e.target).closest("a");
                const tweetContext = target.closest("li.tweet");
                target.hasClass("app--like--done")
                    ? unlike(target, tweetContext)
                    : like(target, tweetContext);
            });

            context.find(".app--retweet").off("click").on("click", e => {
                e.preventDefault();
                const target = $(e.target).closest("a");
                const tweetContext = target.closest("li.tweet");
                target.hasClass("app--retweet--done")
                    ? unretweet(target, tweetContext)
                    : retweet(target, tweetContext);
            });

            context.find(".app--reply").off("click").on("click", e => {
                e.preventDefault();
                const target = $(e.target).closest("a");
                const tweetContext = target.closest("li.tweet");

                const tweetHTML = tweetContext.clone();
                tweetHTML.find(".app--tweet--actions").remove();
                const id = tweetHTML.data("uid");
                const tweet = tweets.find(item => item.id === id);
                const content = `
                    <div class="reply-modal">
                        <header class="reply-header">
                            <h3>Reply to ${tweet.author.displayName}</h3>
                            <span class="action--close"></span>
                        </header>
                        <div class="reply-tweet">
                            ${tweetHTML.html()}
                        </div>
                        <div class="reply-tweet--form">
                            <div class="reply--users">
                                Answer @${tweet.author.normalizedName} ${tweet.isRetweet
                                    ? `and @${tweet.retweeter.normalizedName}`
                                    : ""
                                }
                            </div>
                            <div class="reply--content">
                                <form>
                                    <div class="app--tweet--post">
                                        <textarea maxlength="140" class="circle--textarea--input" id="reply-textarea" name="reply" placeholder="Twit back"></textarea>
                                        <strong class="app--tweet--char" id="tweet-char-reply">140</strong>
                                    </div>
                                    <div class="app--tweet--button">
                                        <button id="btnReply" class="button-primary">Reply</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>`;
                openWindow(content, context => {
                    const textarea = context.find(".circle--textarea--input");
                    lettersCounter(textarea);

                    $("#btnReply").off("click").on("click", e => {
                        e.preventDefault();
                        const tweetMessage = context.find("#reply-textarea").val();
                        if(!tweetMessage) {
                            return alert("Enter text to send twit");
                        }
                        fetch("/api/reply", {
                            credentials: "same-origin",
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ 
                                id,
                                message: tweetMessage,
                                username: tweet.author.normalizedName,
                            })
                        }).then(response => {
                            return response.json();
                        }).then(response => {
                            if(response.done) {
                                $(document.body).trigger("click.window");
                                updateTimeline();
                            } else {
                                alert(response.message);
                            } 
                        });
                    });
                });
            });
        });
};

/* Update the list of your followings */
const updateFriend = (cursor = -1) => {
    const context = $(".app--user--list");

    const push = (friend) => {
        const hasContact = context.find(`[data-uid="${friend.id}"]`);
        if(hasContact.length) {
            return;
        }
        const contact = $(`
            <li data-uid="${friend.id}">
                <div class="circle--fluid">
                    <div class="circle--fluid--cell circle--fluid--primary">
                        <a class="app--tweet--author">
                            <div class="app--avatar" style="background-image: url(${friend.avatar})">
                                <img src="${friend.avatar}" />
                            </div>
                            <h4>${friend.displayName}</h4>
                            <p>@${friend.normalizedName}</p>
                        </a>
                    </div>
                    <div class="circle--fluid--cell follow--buttons">
                        ${friend.following 
                            ? `<a id="btnUnfollow" class="button button-text">Unfollow</a>` 
                            : `<a id="btnFollow" class="button">Follow</a>`
                        }
                    </div>
                </div>
            </li>`).appendTo(context);
        const friendship = (e, isFollow) => {
            e.preventDefault();
            const userContext = $(e.target).closest("li");
            const id = userContext.data("uid");
            const method = isFollow ? "/api/follow" : "/api/unfollow";
            fetch(method, {
                credentials: "same-origin",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id })
            }).then(response => {
                return response.json();
            }).then(response => {
                if(response.done) {
                    const buttonsContext = userContext.find(".follow--buttons");
                    buttonsContext.html("");
                    const button = $(isFollow 
                        ? `<a id="btnUnfollow" class="button button-text">Unfollow</a>`
                        : `<a id="btnFollow" class="button">Follow</a>`).appendTo(buttonsContext);
                    button.off("click").on("click", e => friendship(e, !isFollow));
                    const friendsCount = +$("#friends").text() || 0;
                    $("#friends").text(friendsCount + (isFollow ? 1 : -1));
                } else {
                    alert(response.message);
                }
            });
        };
        contact.find("#btnUnfollow").off("click").on("click", e => friendship(e, false));
        contact.find("#btnFollow").off("click").on("click", e => friendship(e, true));
    };

    /* Your follower can be uploaded in portions of 5. If this function is available, then at the end of the 
        list there will be a button "More" */
    const makeNext = (cursor) => {
        const nextButton = $(`
            <li class="circle--more">
                <a class="button button-text">More</a>
            </li>`).appendTo(context);
        nextButton.off("click").on("click", e => {
            e.preventDefault();
            nextButton.remove();
            updateFriend(cursor);
        });
    };

    fetch(`/friends?cursor=${cursor}`, { credentials: "same-origin" })
        .then(response => {
            return response.json();
        })
        .then(response => {
            if(response.friends) {
                response.friends.forEach(friend => push(friend));
            }
            if(response.cursor) {
                makeNext(response.cursor);
            }
        });

};

/* Set handlers on twit field */
const initTweet = () => {
    const textareaContext = $("#tweet-textarea");
    lettersCounter(textareaContext);

    $("#btnTweet").off("click").on("click", e => {
        e.preventDefault();
        const tweetMessage = textareaContext.val();
        if(!tweetMessage) {
            return alert("Enter text to send twit");
        }
        fetch("/api/tweet", {
            credentials: "same-origin",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                message: tweetMessage
            })
        }).then(response => {
            return response.json();
        }).then(response => {
            if(response.done) {
                textareaContext.val("");
                updateTimeline();
            } else {
                alert(response.message);
            } 
        });
    });
};  

/* Download and display 5 last massages */
const updateMessages = () => {
    const context = $(".app--message--list");

    const makeMessage = (message, groupContext) => {
        const at = moment(+message.at);
        $(`
            <li class="${message.myself 
                ? "app--message--me" : "app--message"
            }">
                <div class="app--avatar" style="background-image: url(${message.avatar})">
                <img src="${message.avatar}" />
                </div>
                <p class="app--message--text">${message.text}</p>
                <p class="app--message--timestamp">${at.fromNow(true)}</p>
            </li>`).appendTo(groupContext);
    };

    const makeGroup = (group) => {
        const groupContext = $(`
            <li>
                <h3>Conversation with <a>${group[0]}</a></h3>
                <ul class="app--message--conversation"></ul>
            </li>`).appendTo(context).find(".app--message--conversation");
        for (const message of group[1]) {
            makeMessage(message, groupContext);
        }
    };

    fetch("/messages", { credentials: "same-origin" })
        .then((response) => {
            return response.json();
        })
        .then(messages => {
            if(!messages) { return; }
            /* Display messages by groups where key is a person you twit with. */
            const groups = new Map();
            for (const message of messages) {
                if(groups.has(message.conversationName)) {
                    groups.get(message.conversationName)
                        .push(message);
                } else {
                    groups.set(message.conversationName, [ message ]);
                }
            }
            for (const group of groups) {
                makeGroup(group);
            }
        });
};

$(document).ready(() => {

    moment.updateLocale("en", {
        relativeTime : {
            past: "%s ago",
            s: "1s", ss: "%ds",
            m:  "1m", mm: "%dm",
            h:  "1h", hh: "%dh",
            d:  "1d", dd: "%dd",
            M:  "1m", MM: "%dm",
            y:  "1y", yy: "%dy"
        }
    });
    /* After application initializing, call all the main functions */
    initTweet();
    updateTimeline();
    updateFriend();
    updateMessages();
});