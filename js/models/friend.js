const User = require("./user");

class Friend extends User {
    constructor(friendDTO) {
        super(friendDTO);
        const { following } = friendDTO;
        this.following = following;
    }
};

module.exports = Friend;