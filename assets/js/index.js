
const updateTimeline = () => {
    const context = $(".app--tweet--list");

    const make = (tweet) => {
        const at = moment(tweet.at);
        console.log(at);
        return `
            <li>
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

    fetch("/tweets", { credentials: "same-origin" })
        .then((response) => {
            return response.json();
        })
        .then(tweets => {
            const html = tweets.map(tweet => make(tweet)).join("");
            context.html(html);
        });
};

$(document).ready(() => {

    moment.updateLocale('en', {
        relativeTime : {
            past: "%s ago",
            s: "a few seconds",
            ss: "%ds",
            m:  "a minute",
            mm: "%dm",
            h:  "1h",
            hh: "%dh",
            d:  "a day",
            dd: "%dd",
            M:  "a month",
            MM: "%dm",
            y:  "a year",
            yy: "%dy"
        }
    });
    updateTimeline();

});