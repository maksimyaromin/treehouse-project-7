const User = require("./user");

class Tweet {
    constructor(tweetDTO) {
        const {
            id,
            favorite_count,
            favorited,
            created_at,
            retweet_count,
            retweeted,
            text
        } = tweetDTO;
        this.id = id;
        this.likes = favorite_count;
        this.liked = favorited;
        this.at = new Date(created_at);
        this.retweets = retweet_count;
        this.retweeted = retweeted;
        this.isRetweet = !!tweetDTO.retweeted_status;
        this.text = text;

        const author = this.isRetweet
            ? tweetDTO.retweeted_status.user
            : tweetDTO.user;
        
        this.author = new User(author);
        if(this.isRetweet) {
            this.retweeter = new User(tweetDTO.user);
        }
    }
};

module.exports = Tweet;