# Build a Twitter Interface

Here I present to your kind attention my version of implementation of the Treehouse Task, building a Twitter Interface .

To start the application one should register in [Twitter App Manager](https://apps.twitter.com/) and have all the token needed. One should write all this token into config.js file of the application root. File format:
```js
    module.exports = {
        consumer_key: "",
        consumer_secret: "",
        access_token: "",
        access_token_secret: ""
    };  
```
The application downloads to your timeline 5 last twits, 5 of your followings (there is an opportunity to download on portions) and 5 last twits which were sent to you or by you. Although this is not required by the task, I made all the buttons presented on the layout active. With a help of my application one can put like, retwit and write twit back. Also you can unfollow and follow again unless the page is updated.

According to task requirements one can sent a new twit to timeline using the interface. Also the header displays your twitter background.

I used only your layout as it is required. Well, I added a couple of styles. An ability to use someone else's layout is for sure one of the most important developer's knowledges. But if you let a developer write its own layout then you can probably receive a one better layout which you can use further.  But this is my growling for sure.

To start an application one first of all needs to create config.js file. And then  run the following commands in console:
```shell
    npm install
    npm start
```
or
```shell
    npm install
    node app.js
```

### I hope you will enjoy it. Max Eremin