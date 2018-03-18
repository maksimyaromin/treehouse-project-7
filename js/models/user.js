class User {
    constructor({
        screen_name: normalizedName,
        name: displayName,
        id,
        profile_image_url: avatar
    }) {
        this.id = id;
        this.normalizedName = normalizedName;
        this.displayName = displayName;
        this.avatar = avatar;
    }
    get name() {
        return `@${this.normalizedName}`;
    }
};

module.exports = User;