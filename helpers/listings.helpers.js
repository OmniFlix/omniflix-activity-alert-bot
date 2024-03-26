
const { userData } = require('../models/user.model');
const { ActivityData } = require("../models/activity.model");
const { listingHelperMsg, delistingHelperMsg } = require("../src/template.js")
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.token);

String.prototype.fmt = function (hash) {
    var string = this, key; for (key in hash) string = string.replace(new RegExp('\\{' + key + '\\}', 'gm'), hash[key]); return string
}

let listingHelper = async (activity) => {
    let messageType;
    if (activity.type === 'MsgListNFT') {
        messageType = 'NFT Listings'
    }

    console.log(messageType)
    let user_chatId = []
    await userData.find({
        "isSubscribe": true,
        notificationTypes: { $ne: messageType },
        $or: [
            { collections: [] },
            { collections: activity.denom_id.id }
        ]
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result && result.length) {
            user_chatId.splice(0,)
            result.forEach(user => {
                user_chatId.push(user.userId)
            })
        } else {
            return console.log("no User subscribed")
        }
    }).clone()
    let parts = activity.nft_id.preview_uri ? activity.nft_id.preview_uri.split('/') : activity.nft_id.media_uri.split('/')
    console.log(parts[parts.length - 1])
    let msg = listingHelperMsg.message.fmt({ 
        IPFS_HASH: parts[parts.length - 1],
        ACTIVITYNFT_IDID: activity.nft_id.id, 
        DENOMID: activity.denom_id.id, 
        COLLECTION_NAME: activity.denom_id.name
    });
    let mediaUrl = listingHelperMsg.activity_url.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id });
    user_chatId.forEach(async (chatid) => {
        try {
            let options = {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Listed NFT", url: mediaUrl }
                        ]
                    ]
                }
            }
            if (activity.nft_id.nsfw){
                let previewUrl = 'https://f4.omniflix.market/assets/logos/og_image.png'
                options.caption = msg
                bot.telegram.sendPhoto(chatid, previewUrl, options)
                .then((res) => {})
                .catch((e) => {
                    if (e.response && e.response.error_code === 429) {
                        console.log('Too many requests');
                        setTimeout(() => {
                            bot.telegram.sendPhoto(chatid, previewUrl, options)
                        }, 3*1000)
                    } else {
                        throw e;
                    }
                })
            }
            else{
                bot.telegram.sendMessage(chatid, msg, options)
                .then((res) => {})
                .catch((e) => {
                    if (e.response && e.response.error_code === 429) {
                        console.log('Too many requests');
                        setTimeout(() => {
                            bot.telegram.sendMessage(chatid, msg, options)
                        }, 3*1000)
                    } else {
                        throw e;
                    }
                })
            }
        } catch (e) {
            if (e.response && e.response.error_code === 403) {
                console.log('Bot was blocked by the user');
                await User.findOneAndDelete({
                    userId: chatid
                })
            } else {
                throw e;
            }
        }
    })

    ActivityData.findOneAndUpdate({
        "_id": activity._id
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    })


}

let deListingHelper = async (activity) => {
    let user_chatIdOwner
    let user_omniflixAddressOwner

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.owner
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdOwner = result.userId
            user_omniflixAddressOwner = result.omniflixAddress

        } else {
            return console.log("DeListing NFT user not subscribed")
        }
    }).clone()

    if (user_omniflixAddressOwner != undefined && user_chatIdOwner != undefined) {
        let parts = activity.nft_id.preview_uri ? activity.nft_id.preview_uri.split('/') : activity.nft_id.media_uri.split('/')
        console.log(parts[parts.length - 1])
        let msg = delistingHelperMsg.message.fmt({ 
            IPFS_HASH: parts[parts.length - 1],
            ACTIVITYNFT_IDID: activity.nft_id.id, 
            DENOMID : activity.denom_id.id, 
            COLLECTION_NAME: activity.denom_id.name
        })
        let mediaUrl = delistingHelperMsg.url.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id })


        try {
            bot.telegram.sendMessage(user_chatIdOwner, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "NFT Delisted from MarketPlace", url: mediaUrl }
                        ]
                    ]
                }
            })
        } catch (e) {
            if (e.response && e.response.error_code === 403) {
                console.log('Bot was blocked by the user');
                await User.findOneAndUpdate({
                    userId: user_chatIdOwner
                }, {
                    $set: { isSubscribe: false }
                })
            } else {
                throw e;
            }
        }

        ActivityData.findOneAndUpdate({
            "_id": activity._id
        }, {
            $set: {
                "isNotified": true,
            }
        }, async (error) => {
            if (error) {
                return console.log(error)
            }
        })

    }
    ActivityData.findOneAndUpdate({
        "_id": activity._id
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    })
}


module.exports = {
    listingHelper,
    deListingHelper
}