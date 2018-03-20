class User {
    constructor({
        screen_name: normalizedName,
        name: displayName,
        id,
        profile_image_url: avatar,
        friends_count: friendsCount
    }) {
        this.id = id;
        this.normalizedName = normalizedName;
        this.displayName = displayName;
        this.avatar = avatar;
        this.friendsCount = friendsCount;
    }
    get name() {
        return `@${this.normalizedName}`;
    }
};

module.exports = User;