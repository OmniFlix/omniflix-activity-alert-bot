const { userData } = require('../models/user.model');
const { ActivityData } = require("../models/activity.model");
const { transferNftHelperMsg } = require("../src/template.js")

const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.token);

String.prototype.fmt = function (hash) {
    var string = this, key; for (key in hash) string = string.replace(new RegExp('\\{' + key + '\\}', 'gm'), hash[key]); return string
}


let transferNftHelper = async (activity) => {
    let user_chatIdSender
    let user_omniflixAddressSender
    let user_chatIdRecipient
    let user_omniflixAddressRecipient

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.recipient
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdRecipient = result.userId
            user_omniflixAddressRecipient = result.omniflixAddress

        } else {
            return console.log("Transfer Nft Recipient not subscribed")
        }
    }).clone()

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.sender
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdSender = result.userId
            user_omniflixAddressSender = result.omniflixAddress
        } else {
            return console.log("Transfer Nft Owner Not subscribed")
        }
    }).clone()


    let parts = activity.preview_uri ? activity.preview_uri.split('/') : activity.media_uri.split('/')
    console.log(parts[parts.length - 1])
    if (user_omniflixAddressSender != undefined && user_chatIdSender != undefined) {
        let msg = transferNftHelperMsg.senderMsg.fmt({ 
            IPFS_HASH: parts[parts.length - 1],
            ACTIVITYID: activity.id, 
            DENOMID: activity.denom_id.id, 
            COLLECTION_NAME: activity.denom_id.name 
        })
        let mediaUrl = transferNftHelperMsg.url.fmt({ ACTIVITYID: activity.id })
        try {
            bot.telegram.sendMessage(user_chatIdSender, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: " NFT Transferred", url: mediaUrl }
                        ]
                    ]
                }
            })
        } catch (e) {
            if (e.response && e.response.error_code === 403) {
                console.log('Bot was blocked by the user');
                await User.findOneAndUpdate({
                    userId: user_chatIdSender
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

    if (user_chatIdRecipient != undefined && user_omniflixAddressRecipient != undefined) {

        let msg = transferNftHelperMsg.receiverMsg.fmt({ ACTIVITYID: activity.id , IPFS_HASH: parts[parts.length - 1]})
        let mediaUrl = transferNftHelperMsg.url.fmt({ ACTIVITYID: activity.id })
        try {
            bot.telegram.sendMessage(user_chatIdRecipient, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "NFT Received", url: mediaUrl }
                        ]
                    ]
                }
            })
        } catch (e) {
            if (e.response && e.response.error_code === 403) {
                console.log('Bot was blocked by the user');
                await User.findOneAndUpdate({
                    userId: user_chatIdRecipient
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
    transferNftHelper,
}