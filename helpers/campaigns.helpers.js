const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.token);
const date = require('date-and-time');
const { userData } = require('../models/user.model');
const { ActivityData } = require("../models/activity.model");
const { createCampaignMsg, cancelCampaignMsg, endCampaignMsg, claimCampaignMsg, campaignTransferNftHelperMsg, streamSendHelperMsg, StopStreamMsg, claimStreamedAmountMsg, depositCampaignMsg } = require('../src/template');
String.prototype.fmt = function (hash) {
    var string = this, key; for (key in hash) string = string.replace(new RegExp('\\{' + key + '\\}', 'gm'), hash[key]); return string
}

let MsgCreateCampaignHelper = async (activity) => {
    let messageType;
    if (activity.type === 'MsgCreateCampaignHelper') {
        messageType = "Campaign Creation"
    }
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
    console.log(user_chatId)


    let msg = createCampaignMsg.message.fmt({ ACTIVITYNFT_IDID: activity.id, START_DATE: date.format(activity.start_time, 'ddd MMM YYYY at SS:SS [UTC]'), END_DATE: date.format(activity.end_time, 'ddd MMM YYYY at SS:SS [UTC]') })
    let mediaUrl = createCampaignMsg.url.fmt({ ACTIVITYNFT_IDID: activity.id })
    user_chatId.forEach(async (chatid) => {
        try {
            bot.telegram.sendMessage(chatid, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "New Campaign Created", url: mediaUrl }
                        ]
                    ]
                }
            })
        } catch (e) {
            if (e.response && e.response.error_code === 403) {
                console.log('Bot was blocked by the user');
                await User.findOneAndUpdate({
                    userId: chatid
                }, {
                    $set: { isSubscribe: false }
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

let MsgCancelCampaignHelper = async (activity) => {
    let user_chatIdOwner
    let user_omniflixAddressOwner

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.creator
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdOwner = result.userId
            user_omniflixAddressOwner = result.omniflixAddress

        } else {
            return console.log("Cancel Campaign user not subscribed")
        }
    }).clone()


    if (user_omniflixAddressOwner != undefined && user_chatIdOwner != undefined) {

        let msg = cancelCampaignMsg.message.fmt({ ACTIVITYNFT_IDID: activity.id })
        let mediaUrl = cancelCampaignMsg.url.fmt({ ACTIVITYNFT_IDID: activity.id })

        try {
            bot.telegram.sendMessage(user_chatIdOwner, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Campaign Cancelled", url: mediaUrl }
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

let MsgDepositCampaignHelper = async (activity) => {
    let user_chatIdOwner
    let user_omniflixAddressOwner

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.creator
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdOwner = result.userId
            user_omniflixAddressOwner = result.omniflixAddress

        } else {
            return console.log("Deposit Campaign user not subscribed")
        }
    }).clone()


    if (user_omniflixAddressOwner != undefined && user_chatIdOwner != undefined) {

        let msg = depositCampaignMsg.message.fmt({ ACTIVITYNFT_IDID: activity.id })
        let mediaUrl = depositCampaignMsg.url.fmt({ ACTIVITYNFT_IDID: activity.id })

        try {
            bot.telegram.sendMessage(user_chatIdOwner, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Deposit Campaign", url: mediaUrl }
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

let endCampaignHelper = async (activity) => {
    let messageType;
    if (activity.type === 'EndCampaign') {
        messageType = "End Campaign"
    }
    let user_chatId = []
    await userData.find({
        "isSubscribe": true,
        notificationTypes: { $ne: messageType },
        $or: [
            { collections: [] },
            { collections: activity.denom.id }
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
    console.log(user_chatId)


    let msg = endCampaignMsg.message.fmt({ ACTIVITYNFT_IDID: activity.id })
    let mediaUrl = endCampaignMsg.url.fmt({ ACTIVITYNFT_IDID: activity.id })
    user_chatId.forEach(async (chatid) => {
        try {
            bot.telegram.sendMessage(chatid, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Campaign Ended", url: mediaUrl }
                        ]
                    ]
                }
            })
        } catch (e) {
            if (e.response && e.response.error_code === 403) {
                console.log('Bot was blocked by the user');
                await User.findOneAndUpdate({
                    userId: chatid
                }, {
                    $set: { isSubscribe: false }
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

let MsgClaimCampaignHelper = async (activity) => {
    let user_chatIdOwner
    let user_omniflixAddressOwner

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.claimer
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdOwner = result.userId
            user_omniflixAddressOwner = result.omniflixAddress

        } else {
            return console.log("Claim Campaign user not subscribed")
        }
    }).clone()


    if (user_omniflixAddressOwner != undefined && user_chatIdOwner != undefined) {

        let msg = claimCampaignMsg.message.fmt({ ACTIVITYNFT_IDID: activity.id })
        let mediaUrl = claimCampaignMsg.url.fmt({ ACTIVITYNFT_IDID: activity.id })

        try {
            let options = {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Claimed from Campaign", url: mediaUrl }
                        ]
                    ]
                }
            }
            if (activity.nft.nsfw) {
                let previewUrl = 'https://f4.omniflix.market/assets/logos/og_image.png'
                options.caption = msg
                bot.telegram.sendPhoto(user_chatIdOwner, previewUrl, options)
            }
            else {
                bot.telegram.sendMessage(user_chatIdOwner, msg, options)
            }
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

let campaignTransferNftHelper = async (activity) => {
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
            return console.log("Campaign Transfer Nft Recipient not subscribed")
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
            return console.log("Campaign Transfer Nft Owner Not subscribed")
        }
    }).clone()


    if (user_omniflixAddressSender != undefined && user_chatIdSender != undefined) {

        let msg = campaignTransferNftHelperMsg.senderMsg.fmt({ ACTIVITYID: activity.id })
        let mediaUrl = campaignTransferNftHelperMsg.url.fmt({ ACTIVITYID: activity.id })
        try {
            if(activity.nsfw){
                let previewUrl = 'https://f4.omniflix.market/assets/logos/og_image.png'
                bot.telegram.sendPhoto(user_chatIdSender, previewUrl, {
                    caption: msg,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "NFT Transferred", url: mediaUrl }
                            ]
                        ]
                    }
                })
            }
            else{
                bot.telegram.sendMessage(user_chatIdSender, msg, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "NFT Transferred", url: mediaUrl }
                            ]
                        ]
                    }
                })
            }
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

        let msg = campaignTransferNftHelperMsg.receiverMsg.fmt({ ACTIVITYID: activity.id })
        let mediaUrl = campaignTransferNftHelperMsg.url.fmt({ ACTIVITYID: activity.id })
        try {
            bot.telegram.sendMessage(user_chatIdRecipient, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "NFT Receved", url: mediaUrl }
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

let MsgStreamSendHelper = async (activity) => {
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
            return console.log("Stream Recipient not subscribed")
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
            return console.log("Stream Sender Not subscribed")
        }
    }).clone()


    if (user_omniflixAddressSender != undefined && user_chatIdSender != undefined) {

        let msg = streamSendHelperMsg.senderMsg.fmt({ ACTIVITYID: activity.id })
        let mediaUrl = streamSendHelperMsg.url.fmt({ ACTIVITYID: activity.id })
        try {
            bot.telegram.sendMessage(user_chatIdSender, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Stream Send", url: mediaUrl }
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

        let msg = streamSendHelperMsg.receiverMsg.fmt({ ACTIVITYID: activity.id })
        let mediaUrl = streamSendHelperMsg.url.fmt({ ACTIVITYID: activity.id })
        try {
            bot.telegram.sendMessage(user_chatIdRecipient, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Stream Receved", url: mediaUrl }
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

let MsgStreamCreatedHelper = async (activity) => {
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
            return console.log("Stream Recipient not subscribed")
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
            return console.log("Stream Sender Not subscribed")
        }
    }).clone()


    if (user_omniflixAddressSender != undefined && user_chatIdSender != undefined) {

        let msg = streamSendHelperMsg.senderMsg.fmt({ ACTIVITYID: activity.id })
        let mediaUrl = streamSendHelperMsg.url.fmt({ ACTIVITYID: activity.id })
        try {
            bot.telegram.sendMessage(user_chatIdSender, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Stream Send", url: mediaUrl }
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

        let msg = streamSendHelperMsg.receiverMsg.fmt({ ACTIVITYID: activity.id })
        let mediaUrl = streamSendHelperMsg.url.fmt({ ACTIVITYID: activity.id })
        try {
            bot.telegram.sendMessage(user_chatIdRecipient, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Stream Receved", url: mediaUrl }
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

let MsgStopStreamHelper = async (activity) => {
    let user_chatIdOwner
    let user_omniflixAddressOwner

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.sender
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdOwner = result.userId
            user_omniflixAddressOwner = result.omniflixAddress

        } else {
            return console.log("Claim Campaign user not subscribed")
        }
    }).clone()


    if (user_omniflixAddressOwner != undefined && user_chatIdOwner != undefined) {

        let msg = StopStreamMsg.message.fmt({ ACTIVITYNFT_IDID: activity.id })
        let mediaUrl = StopStreamMsg.url.fmt({ ACTIVITYNFT_IDID: activity.id })

        try {
            bot.telegram.sendMessage(user_chatIdOwner, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Stream Stopped!", url: mediaUrl }
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

let MsgClaimStreamedAmountHelper = async (activity) => {
    let user_chatIdOwner
    let user_omniflixAddressOwner

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.claimer
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdOwner = result.userId
            user_omniflixAddressOwner = result.omniflixAddress

        } else {
            return console.log("Claim Campaign user not subscribed")
        }
    }).clone()

    activity = activity.toObject()
    if (user_omniflixAddressOwner != undefined && user_chatIdOwner != undefined) {

        let msg = claimStreamedAmountMsg.message.fmt({ ACTIVITYNFT_IDID: activity.id, AMOUNT: (activity.amount.amount / 1000000) })
        let mediaUrl = claimStreamedAmountMsg.url.fmt({ ACTIVITYNFT_IDID: activity.id })

        try {
            bot.telegram.sendMessage(user_chatIdOwner, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Claimed Amount From Stream", url: mediaUrl }
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
    MsgCreateCampaignHelper,
    MsgCancelCampaignHelper,
    MsgDepositCampaignHelper,
    endCampaignHelper,
    MsgClaimCampaignHelper,
    campaignTransferNftHelper,
    MsgStreamSendHelper,
    MsgStopStreamHelper,
    MsgClaimStreamedAmountHelper,
    MsgStreamCreatedHelper
}