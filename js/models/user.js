class User {
    constructor({
        screen_name: normalizedName,
        name: displayName,
        id,
        profile_image_url: avatar,
        friends_count: friendsCount,
        profile_background_image_url: background
    }) {
        this.id = id;
        this.normalizedName = normalizedName;
        this.displayName = displayName;
        this.avatar = avatar;
        this.friendsCount = friendsCount;
        this.background = background;
    }
    get name() {
        return `@${this.normalizedName}`;
    }
};

module.exports = User;