
const updateTimeline = () => {
    const context = $(".app--tweet--list");

    const make = (tweet) => {
        const at = moment(tweet.at);
        return `
            <li class="tweet" data-uid="${tweet.id}">
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

    const changeLikes = (context, number) => {
        let count = parseInt(context.text(), 10) || 0;
        count += number;
        context.text(count ? count : "");
    };

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
            } 
        });
    };

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
            } 
        });
    };

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
        });
};

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
                        <ul class="app--tweet--actions circle--list--inline">
                            <li>
                                <a class="app--direct-message">
                                    <span class="tooltip">Direct message</span>
                                    <svg viewBox="0 0 38 28">
                                        <use xlink:href="./images/sprite.svg#letter" x="0px" y="0px"></use>
                                    </svg>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div class="circle--fluid--cell">
                        ${friend.following 
                            ? `<a class="button button-text">Unfollow</a>` 
                            : `<a class="button">Follow</a>`
                        }
                    </div>
                </div>
            </li>`).appendTo(context);

    };

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

//1458071713
const loadMessages = (id = 1458071713) => {

    fetch(`/messages/${id}`, { credentials: "same-origin" })
        .then(response => {
            return response.json();
        })
        .then(response => {
            console.log(response);
        });

};

const openMessages = () => {
    const messages = $(".messages"),
        messagesHeader = $(".messages-header"),
        timeline = $(".timeline"),
        timelineHeader = $(".timeline-header");

    timelineHeader.addClass("grid-33").removeClass("grid-66");
    timeline.addClass("grid-33").removeClass("grid-66");
    messagesHeader.addClass("grid-33").show();
    messages.addClass("grid-33").show();
};

const closeMessages = () => {
    const messages = $(".messages"),
        messagesHeader = $(".messages-header"),
        timeline = $(".timeline"),
        timelineHeader = $(".timeline-header");

    timelineHeader.addClass("grid-66").removeClass("grid-33");
    timeline.addClass("grid-66").removeClass("grid-33");
    messagesHeader.hide().removeClass("grid-33");
    messages.hide().removeClass("grid-33");
};

$(document).ready(() => {

    moment.updateLocale('en', {
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
    updateTimeline();
    //updateFriend();
    //loadMessages();
});