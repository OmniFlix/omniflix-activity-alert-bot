const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.token);
const date = require('date-and-time');

const { userData } = require('../models/user.model');
const { ActivityData } = require("../models/activity.model");
const { createAuctionMsg, cancelAuctionMsg, removeAuctionMsg, processBidAuctionHelperMsg, placeBidAuctionHelperMsg } = require("../src/template.js")


String.prototype.fmt = function (hash) {
    var string = this, key; for (key in hash) string = string.replace(new RegExp('\\{' + key + '\\}', 'gm'), hash[key]); return string
}


let createAuctionHelper = async (activity) => {
    let messageType;
    if (activity.type === 'MsgCreateAuction') {
        messageType = "New Auction Creation"
    }
    // console.log(activities)
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


    let msg = createAuctionMsg.message.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id, START_DATE: date.format(activity.start_time, 'ddd MMM YYYY at HH:MM [UTC]'), END_DATE: date.format(activity.end_time, 'ddd MMM YYYY at HH:MM [UTC]') })
    let mediaUrl = createAuctionMsg.url.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id })
    user_chatId.forEach(async (chatid) => {
        // console.log(user_chatId)

        try {
            if (activity.nft_id.nsfw){
                previewUrl = mediaUrl
                bot.telegram.sendPhoto(chatid, previewUrl, {
                    caption: msg,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "New Auction Created", url: mediaUrl }
                            ]
                        ]
                    }
                })
            }
            else{
                bot.telegram.sendMessage(chatid, msg, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "New Auction Created", url: mediaUrl }
                            ]
                        ]
                    }
                })
            }
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

let cancelAuctionHelper = async (activity) => {
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
            return console.log("Cancel Auction user not subscribed")
        }
    }).clone()


    if (user_omniflixAddressOwner != undefined && user_chatIdOwner != undefined) {

        let msg = cancelAuctionMsg.message.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id })
        let mediaUrl = cancelAuctionMsg.url.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id })
        try {
            if(activity.nft_id.nsfw){
                let previewUrl = mediaUrl
                bot.telegram.sendPhoto(user_chatIdOwner, previewUrl, {
                    caption: msg,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Auction Cancelled", url: mediaUrl }
                            ]
                        ]
                    }
                })
            }
            else{
                bot.telegram.sendMessage(user_chatIdOwner, msg, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Auction Cancelled", url: mediaUrl }
                            ]
                        ]
                    }
                })
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

let removeAuctionHelper = async (activity) => {

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
            return console.log("Cancel Auction user not subscribed")
        }
    }).clone()

    if (user_omniflixAddressOwner != undefined && user_chatIdOwner != undefined) {

        let msg = removeAuctionMsg.message.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id })
        let mediaUrl = removeAuctionMsg.url.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id })
        try {
            bot.telegram.sendMessage(user_chatIdOwner, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Auction Removed", url: mediaUrl }
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

let processBidAuctionHelper = async (activity) => {
    // console.log(activity)
    let user_chatIdBidder
    let user_omniflixAddressBidder
    let user_chatIdOwner
    let user_omniflixAddressOwner

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.bidder
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdBidder = result.userId
            user_omniflixAddressBidder = result.omniflixAddress

        } else {
            return console.log("Process bid Bidder not subscribed")
        }
    }).clone()

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
            return console.log("Process bid Owner Not subscribed")
        }
    }).clone()

    if (user_omniflixAddressBidder != undefined && user_chatIdBidder != undefined) {

        let msg = processBidAuctionHelperMsg.auctionWonMsg.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id })
        let mediaUrl = processBidAuctionHelperMsg.url.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id })
        try {
            if (activity.nft_id.nsfw){
                let previewUrl = mediaUrl
                bot.telegram.sendPhoto(user_chatIdBidder, previewUrl, {
                    caption: msg,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Auction Won", url: mediaUrl }
                            ]
                        ]
                    }
                })
            }
            else{
                bot.telegram.sendMessage(user_chatIdBidder, msg, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Auction Won", url: mediaUrl }
                            ]
                        ]
                    }
                })
            }
        } catch (e) {
            if (e.response && e.response.error_code === 403) {
                console.log('Bot was blocked by the user');
                await User.findOneAndUpdate({
                    userId: user_chatIdBidder
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

    if (user_omniflixAddressOwner != undefined && user_chatIdOwner != undefined) {

        let msg = processBidAuctionHelperMsg.auctionEndMsg.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id })
        let mediaUrl = processBidAuctionHelperMsg.url.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id })
        try {
            if (activity.nft_id.nsfw){
                let previewUrl = mediaUrl
                bot.telegram.sendPhoto(user_chatIdOwner, previewUrl, {
                    caption: msg,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Auction Ended", url: mediaUrl }
                            ]
                        ]
                    }
                })
            }
            else{
                bot.telegram.sendMessage(user_chatIdOwner, msg, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Auction Ended", url: mediaUrl }
                            ]
                        ]
                    }
                })
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

let placeBidAuctionHelper = async (activity) => {
    try {
        let activityData = await ActivityData.findOne({ _id: activity._id });
        if (!activityData) {
            console.log("Activity not found")
        }

        let nftId = activityData.nft_id.id;

        let ownerData = await userData.find({
            isSubscribe: true,
            omniflixAddress: activityData.nft_id.owner
        })

        if (ownerData.length) {

            ownerData.forEach(async (data) => {

                let ownerMsg = placeBidAuctionHelperMsg.ownerMsg.fmt({ NFTID: nftId })
                let mediaUrl = placeBidAuctionHelperMsg.url.fmt({ NFTID: nftId })
                try {
                    if (activity.nft_id.nsfw){
                        let previewUrl = mediaUrl
                        bot.telegram.sendPhoto(data.userId, previewUrl, {
                            caption: msg,
                            parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: "New Bid Placed", url: mediaUrl }
                                    ]
                                ]
                            }
                        })
                    }
                    else{
                        bot.telegram.sendMessage(data.userId, ownerMsg, {
                            parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: "New Bid Placed", url: mediaUrl }
                                    ]
                                ]
                            }
                        })
                    }
                } catch (e) {
                    if (e.response && e.response.error_code === 403) {
                        console.log('Bot was blocked by the user');
                        await User.findOneAndUpdate({
                            userId: data.userId
                        }, {
                            $set: { isSubscribe: false }
                        })
                    } else {
                        throw e;
                    }
                }
            })
        }
        
        let bidderData = await userData.find({
            isSubscribe: true,
            omniflixAddress: activityData.bidder
        })

        if (bidderData.length) {
            bidderData.forEach(async (data) => {

                let bidderMsg = placeBidAuctionHelperMsg.bidderMsg.fmt({ NFTID: nftId })
                let mediaUrl = placeBidAuctionHelperMsg.url.fmt({ NFTID: nftId })
                try {
                    if (activity.nft_id.nsfw){
                        let previewUrl = mediaUrl
                        bot.telegram.sendPhoto(data.userId, previewUrl, {
                            caption: msg,
                            parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: "You Placed New Bid", url: mediaUrl }
                                    ]
                                ]
                            }
                        })
                    }
                    else{
                        bot.telegram.sendMessage(data.userId, bidderMsg, {
                            parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: "You Placed New Bid", url: mediaUrl }
                                    ]
                                ]
                            }
                        })
                    }
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
        }

        let previousBidder = await ActivityData.find({
            auction_id: activityData.auction_id
        }).sort({ 'amount.amount': -1 }).limit(2);

        if (previousBidder.length > 1) {
            let previousBidderData = await userData.find({
                isSubscribe: true,
                omniflixAddress: previousBidder[1].bidder
            })
            if (previousBidderData.length) {
                previousBidderData.forEach(async (data) => {
                    if (previousBidderData) {
                        let previousBidderMsg = placeBidAuctionHelperMsg.previousBidderMsg.fmt({ NFTID: nftId })
                        let mediaUrl = placeBidAuctionHelperMsg.url.fmt({ NFTID: nftId })
                        try {
                            if (activity.nft_id.nsfw){
                                let previewUrl = mediaUrl
                                bot.telegram.sendPhoto(data.userId, previewUrl, {
                                    caption: msg,
                                    parse_mode: 'Markdown',
                                    reply_markup: {
                                        inline_keyboard: [
                                            [
                                                { text: "Bid Overbidden", url: mediaUrl }
                                            ]
                                        ]
                                    }
                                })
                            }
                            else{
                                bot.telegram.sendMessage(data.userId, previousBidderMsg, {
                                    parse_mode: 'Markdown',
                                    reply_markup: {
                                        inline_keyboard: [
                                            [
                                                { text: "Bid Overbidden", url: mediaUrl }
                                            ]
                                        ]
                                    }
                                })
                            }
                        } catch (e) {
                            if (e.response && e.response.error_code === 403) {
                                console.log('Bot was blocked by the user');
                                await User.findOneAndUpdate({
                                    userId: data.userId
                                }, {
                                    $set: { isSubscribe: false }
                                })
                            } else {
                                throw e;
                            }
                        }
                    }
                })
            }
            await ActivityData.findOneAndUpdate({
                _id: previousBidder[1]._id
            }, {
                $set: {
                    isNotified: true
                }
            })
        }

        await ActivityData.findOneAndUpdate({
            _id: activity._id
        }, {
            $set: {
                isNotified: true
            }
        })
        
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    createAuctionHelper,
    cancelAuctionHelper,
    removeAuctionHelper,
    processBidAuctionHelper,
    placeBidAuctionHelper
}

