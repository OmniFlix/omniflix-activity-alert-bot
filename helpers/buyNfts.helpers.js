const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.token);

const { userData } = require('../models/user.model');
const { ActivityData } = require("../models/activity.model");
const { buyNftHelperMsg, burnNftHelperMsg, mintONFTHelperMsg } = require("../src/template.js")

String.prototype.fmt = function (hash) {
    var string = this, key; for (key in hash) string = string.replace(new RegExp('\\{' + key + '\\}', 'gm'), hash[key]); return string
}


let buyNftHelper = async (activity) => {
    let user_chatIdBuyer
    let user_omniflixAddressBuyer
    let user_chatIdOwner
    let user_omniflixAddressOwner

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.buyer
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {

            user_chatIdBuyer = result.userId
            user_omniflixAddressBuyer = result.omniflixAddress

        } else {
            return console.log("Buy Nft Buyer not subscribed")
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
            return console.log("Transfer Nft Owner Not subscribed")
        }
    }).clone()

    if (user_omniflixAddressOwner != undefined && user_chatIdOwner != undefined) {

        let msg = buyNftHelperMsg.NftOwnerMsg.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id })
        let mediaUrl = buyNftHelperMsg.url.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id })
        try {
            if (activity.nft_id.nsfw){
                let previewUrl = 'https://f4.omniflix.market/assets/logos/og_image.png'
                bot.telegram.sendPhoto(user_chatIdOwner, previewUrl, {
                    caption: msg,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Nft Sold", url: mediaUrl }
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
                                { text: "Nft Sold", url: mediaUrl }
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

    }

    if (user_chatIdBuyer != undefined && user_omniflixAddressBuyer != undefined) {
        let msg = buyNftHelperMsg.NftBuyerMsg.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id })
        let mediaUrl = buyNftHelperMsg.url.fmt({ ACTIVITYNFT_IDID: activity.nft_id.id })
        try {
            if (activity.nft_id.nsfw){
                let previewUrl = 'https://f4.omniflix.market/assets/logos/og_image.png'
                bot.telegram.sendPhoto(user_chatIdBuyer, previewUrl, {
                    caption: msg,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "You Bought New NFT", url: mediaUrl }
                            ]
                        ]
                    }
                })
            }
            else{
                bot.telegram.sendMessage(user_chatIdBuyer, msg, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "You Bought New NFT", url: mediaUrl }
                            ]
                        ]
                    }
                })
            }
        } catch (e) {
            if (e.response && e.response.error_code === 403) {
                console.log('Bot was blocked by the user');
                await User.findOneAndUpdate({
                    userId: user_chatIdBuyer
                }, {
                    $set: { isSubscribe: false }
                })
            } else {
                throw e;
            }
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

let burnNftHelper = async (activity) => {
    let user_chatIdOwner
    let user_omniflixAddressOwner

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.denom_id.creator
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdOwner = result.userId
            user_omniflixAddressOwner = result.omniflixAddress

        } else {
            return console.log("Burn ONFT user not subscribed")
        }
    }).clone()

    if (user_omniflixAddressOwner != undefined && user_chatIdOwner != undefined) {

        let msg = burnNftHelperMsg.message.fmt({ ACTIVITYID: activity.id })
        let mediaUrl = burnNftHelperMsg.url.fmt({ ACTIVITYID: activity.id })

        try {
            bot.telegram.sendMessage(user_chatIdOwner, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Burned NFT", url: mediaUrl }
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

let mintONFTHelper = async (activity) => {
    try {
        let id = activity._id;

        let activityData = await ActivityData.findOne({ _id: id });
        if (!activityData) {
            console.log("Acitivity not found");
        }

        let creatorData = await userData.find({
            isSubscribe: true,
            omniflixAddress: activityData.creator

        })
        let ownerData = await userData.find({
            isSubscribe: true,
            omniflixAddress: activityData.owner
        })

        let nftId = activityData.id;

        if (creatorData.length) {
            creatorData.forEach(async (data) => {
                let msg = mintONFTHelperMsg.creatorMsg.fmt({ NFTID: nftId })
                let mediaUrl = mintONFTHelperMsg.url.fmt({ NFTID: nftId })
                let userId = data.userId;
                try {
                    if (activity.nsfw){
                        let previewUrl = 'https://f4.omniflix.market/assets/logos/og_image.png'
                        bot.telegram.sendPhoto(userId, previewUrl, {
                            caption: msg,
                            parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: "Minted New Nft", url: mediaUrl }
                                    ]
                                ]
                            }
                        })
                    }
                    else{
                        bot.telegram.sendMessage(userId, msg, {
                            parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: "Minted New Nft", url: mediaUrl }
                                    ]
                                ]
                            }
                        })
                    }
                } catch (e) {
                    if (e.response && e.response.error_code === 403) {
                        console.log('Bot was blocked by the user');
                        await User.findOneAndUpdate({
                            userId: userId
                        }, {
                            $set: { isSubscribe: false }
                        })
                    } else {
                        throw e;
                    }
                }

            })
        }


        if (ownerData.length) {
            ownerData.forEach(async (data) => {
                let msg = mintONFTHelperMsg.ownerMsg.fmt({ NFTID: nftId })
                let mediaUrl = mintONFTHelperMsg.url.fmt({ NFTID: nftId })
                let userId = data.userId;
                try {
                    if (activity.nsfw){
                        let previewUrl = 'https://f4.omniflix.market/assets/logos/og_image.png'
                        bot.telegram.sendPhoto(userId, previewUrl, {
                            caption: msg,
                            parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: "Minted New Nft", url: mediaUrl }
                                    ]
                                ]
                            }
                        })
                    }
                    else{
                        bot.telegram.sendMessage(userId, msg, {
                            parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: "Minted New Nft", url: mediaUrl }
                                    ]
                                ]
                            }
                        })
                    }
                } catch (e) {
                    if (e.response && e.response.error_code === 403) {
                        console.log('Bot was blocked by the user');
                        await User.findOneAndUpdate({
                            userId: userId
                        }, {
                            $set: { isSubscribe: false }
                        })
                    } else {
                        throw e;
                    }
                }

            })
        }

        await ActivityData.findOneAndUpdate({
            _id: id
        }, {
            $set: {
                isNotified: true
            }
        })

    } catch (error) {
        console.log(error);
    }
}

let burnNftClaimHelper = async (activity) => {
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
            return console.log("Burn ONFT user not subscribed")
        }
    }).clone()

    if (user_omniflixAddressOwner != undefined && user_chatIdOwner != undefined) {

        let msg = burnNftHelperMsg.message.fmt({ ACTIVITYID: activity.id })
        let mediaUrl = burnNftHelperMsg.url.fmt({ ACTIVITYID: activity.id })

        try {
            bot.telegram.sendMessage(user_chatIdOwner, msg, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Burned NFT", url: mediaUrl }
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
    buyNftHelper,
    burnNftHelper,
    mintONFTHelper,
    burnNftClaimHelper
}