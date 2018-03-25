
class Message {
    constructor({ id, myself, avatar, text, at, author, recipient }) {
        this.id = id;
        this.myself = myself;
        this.avatar = avatar;
        this.text = text;
        this.at = at;
        this.author = author;
        this.recipient = recipient;
    }
    getUserInfo(twit) {
        const id = this.myself ? this.recipient : this.author;
        return new Promise((resolve, reject) => {
            twit.get("users/show", { user_id: id },
                (err, data, callback) => 
                {
                    if(err) { return reject(err); }
                    if(!this.myself) this.avatar = data.profile_image_url;
                    this.conversationName = data.name;
                    resolve();
                });
        });
    }
    static release(eventDTO, user) {
        const myself = eventDTO.message_create.sender_id == user.id;
        const at = eventDTO.created_timestamp;
        const text = eventDTO.message_create.message_data.text;
        const recipient = eventDTO.message_create.target.recipient_id;
        if(!myself) {
            return new Message({
                id: eventDTO.id,
                myself,
                at,
                text,
                author: eventDTO.message_create.sender_id,
                recipient
            })
        }
        return new Message({
            id: eventDTO.id,
            myself,
            avatar: user.avatar,
            at,
            text,
            author: user.id,
            recipient
        })
    }
}
module.exports = Message;