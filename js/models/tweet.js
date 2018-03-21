const User = require("./user");

class Tweet {
    constructor(tweetDTO) {
        const {
            id_str: id,
            favorited,
            created_at,
            retweeted,
            text
        } = tweetDTO;
        this.id = id;
        this.liked = favorited;
        this.at = new Date(created_at);
        this.retweeted = retweeted;
        this.isRetweet = !!tweetDTO.retweeted_status;
        this.text = text;

        let status;
        if(this.isRetweet) {
            status = tweetDTO.retweeted_status;
        } else {
            status = tweetDTO;
        }
        const { user, favorite_count, retweet_count } = status;
        
        this.author = new User(user);
        this.likes = favorite_count;
        this.retweets = retweet_count;

        if(this.isRetweet) {
            this.retweeter = new User(tweetDTO.user);
        }
    }
};

module.exports = Tweet;