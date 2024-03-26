const { ActivityData } = require("../models/activity.model");
const { userData } = require('../models/user.model');
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.token);


let bulkMinting = async (activity, totalCount) => {
    let msg = `***You Minted **${totalCount}** Nfts.***`
    let user_chatIdCreator

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.creator
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdCreator = result.userId
            try {
                bot.telegram.sendMessage(user_chatIdCreator, msg, {
                    parse_mode: 'Markdown'
                })
            } catch (e) {
                if (e.response && e.response.error_code === 403) {
                    console.log('Bot was blocked by the user');
                    await User.findOneAndUpdate({
                        userId: user_chatIdCreator
                    }, {
                        $set: { isSubscribe: false }
                    })
                } else {
                    throw e;
                }
            }
        } else {
            return console.log("Bulk Mint Nft Owner Not subscribed")
        }
    }).clone()



    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkTransfer = async (activity, totalCount) => {
    let msg = `***You Transfered **${totalCount}** Nfts.***`

    let user_chatIdSender

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.sender
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdSender = result.userId
            try {
                bot.telegram.sendMessage(user_chatIdSender, msg, {
                    parse_mode: 'Markdown',
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
        } else {
            return console.log("Transfer Nft Owner Not subscribed")
        }
    }).clone()

    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkListingNft = async (activity, totalCount) => {
    let msg = `**${totalCount}** ***New Listings On MarketPlace.***\n[View on Omniflix Market](https://omniflix.market/marketplace/collectNow)`
    
    let messageType;
    if(activity.type === 'MsgListNFT') {
        messageType = 'Multiple NFT Listings';
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
    console.log('bukllisting ',user_chatId)
    user_chatId.forEach(async (chatid) => {
        try {
            bot.telegram.sendMessage(chatid, msg, {
                parse_mode: 'Markdown'
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


    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkDeListingNft = async (activity, totalCount) => {
    let msg = `**${totalCount}** ***Nfts DeListed From MarketPlace.***`

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

        try {
            bot.telegram.sendMessage(user_chatIdOwner, msg, {
                parse_mode: 'Markdown'
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
        await ActivityData.updateMany({
            type: activity.type,
            block: activity.block
        }, {
            $set: {
                "isNotified": true,
            }
        }, async (error) => {
            if (error) {
                return console.log(error)
            }
        }).clone()
    }
}

let bulkBurnNft = async (activity, totalCount) => {
    let msg = `***You Burned **${totalCount}** Nfts.***`

    let user_chatIdCreator

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.denom_id.creator
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdCreator = result.userId
            try {
                bot.telegram.sendMessage(user_chatIdCreator, msg, {
                    parse_mode: 'Markdown'
                })
            } catch (e) {
                if (e.response && e.response.error_code === 403) {
                    console.log('Bot was blocked by the user');
                    await User.findOneAndUpdate({
                        userId: user_chatIdCreator
                    }, {
                        $set: { isSubscribe: false }
                    })
                } else {
                    throw e;
                }
            }
        } else {
            return console.log("Bulk Burn Nft Owner Not subscribed")
        }
    }).clone()


    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkAuction = async (activity, totalCount) => {
    let msg = ` **${totalCount}** ***New Bulk Auction Listed On MarketPlace.***\n[View on Omniflix Market](https://omniflix.market/nft)`
    let messageType;
    if(activity.type === 'MsgCreateAuction') {
        messageType = 'Multiple Auctions Creation';
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
    user_chatId.forEach(async (chatid) => {
        try {
            bot.telegram.sendMessage(chatid, msg, {
                parse_mode: 'Markdown'
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

    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkAuctionCancel = async (activity, totalCount, user_chatId) => {
    let msg = `**${totalCount}** *** Auction Cancel From MarketPlace.***`

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.owner
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            let user_chatIdOwner = result.userId
            try {
                bot.telegram.sendMessage(user_chatIdOwner, msg, {
                    parse_mode: 'Markdown'
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
        } else {
            return console.log("Bulk Process Bid Nft Owner Not subscribed")
        }
    }).clone()

    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkAuctionRemoved = async (activity, totalCount, user_chatId) => {
    let msg = `**${totalCount}** ***Auctions Removed From MarketPlace.***`

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.owner
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            let user_chatIdOwner = result.userId
            try {
                bot.telegram.sendMessage(user_chatIdOwner, msg, {
                    parse_mode: 'Markdown'
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
        } else {
            return console.log("Bulk Process Bid Nft Owner Not subscribed")
        }
    }).clone()


    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkProcessBid = async (activity, totalCount) => {
    let msg = `***You Won **${totalCount}** Auctions.***`

    let user_chatIdBidder

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.bidder
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdBidder = result.userId
            try {
                bot.telegram.sendMessage(user_chatIdBidder, msg, {
                    parse_mode: 'Markdown'
                })
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
        } else {
            return console.log("Bulk Process Bid Nft Owner Not subscribed")
        }
    }).clone()


    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkPlaceBid = async (activity, totalCount) => {
    let msg = `***You Place **${totalCount}** bids.***`
    let user_chatIdBidder

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.bidder
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdBidder = result.userId
            try {
                bot.telegram.sendMessage(user_chatIdBidder, msg, {
                    parse_mode: 'Markdown'
                })
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
        } else {
            return console.log("Bulk Place Bid Nft Owner Not subscribed")
        }
    }).clone()


    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkBuyNft = async (activity, totalCount) => {
    let msg = `***You Bought **${totalCount}** Nfts.***`
    let user_chatIdBuyer

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.buyer
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdBuyer = result.userId
            try {
                bot.telegram.sendMessage(user_chatIdBuyer, msg, {
                    parse_mode: 'Markdown'
                })
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
        } else {
            return console.log("Bulk Buy Nft Owner Not subscribed")
        }
    }).clone()



    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkCreateCollection = async (activity, totalCount) => {
    let msg = `***You Created **${totalCount}** Collections.***`

    let user_chatIdCreator

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.creator
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdCreator = result.userId
            try {
                bot.telegram.sendMessage(user_chatIdCreator, msg, {
                    parse_mode: 'Markdown'
                })
            } catch (e) {
                if (e.response && e.response.error_code === 403) {
                    console.log('Bot was blocked by the user');
                    await User.findOneAndUpdate({
                        userId: user_chatIdCreator
                    }, {
                        $set: { isSubscribe: false }
                    })
                } else {
                    throw e;
                }
            }
        } else {
            return console.log("Bulk Collection Create Owner Not subscribed")
        }
    }).clone()



    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkTransferCollection = async (activity, totalCount) => {
    let msg = `***You Transfered **${totalCount}** Collections.***`

    let user_chatIdCreator

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.creator
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdCreator = result.userId
            try {
                bot.telegram.sendMessage(user_chatIdCreator, msg, {
                    parse_mode: 'Markdown'
                })
            } catch (e) {
                if (e.response && e.response.error_code === 403) {
                    console.log('Bot was blocked by the user');
                    await User.findOneAndUpdate({
                        userId: user_chatIdCreator
                    }, {
                        $set: { isSubscribe: false }
                    })
                } else {
                    throw e;
                }
            }
        } else {
            return console.log("Bulk Collection Transfer Owner Not subscribed")
        }
    }).clone()

    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkUpdateCollection = async (activity, totalCount) => {
    let msg = `***You Updated **${totalCount}** Collections.***`

    let user_chatIdCreator

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.creator
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdCreator = result.userId
            try {
                bot.telegram.sendMessage(user_chatIdCreator, msg, {
                    parse_mode: 'Markdown'
                })
            } catch (e) {
                if (e.response && e.response.error_code === 403) {
                    console.log('Bot was blocked by the user');
                    await User.findOneAndUpdate({
                        userId: user_chatIdCreator
                    }, {
                        $set: { isSubscribe: false }
                    })
                } else {
                    throw e;
                }
            }
        } else {
            return console.log("Bulk Collection Update Owner Not subscribed")
        }
    }).clone()



    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkCreateCampaign = async (activity, totalCount) => {
    let msg = `***You Created **${totalCount}** Campaigns.***`

    let user_chatIdCreator

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.creator
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdCreator = result.userId
            try {
                bot.telegram.sendMessage(user_chatIdCreator, msg, {
                    parse_mode: 'Markdown'
                })
            } catch (e) {
                if (e.response && e.response.error_code === 403) {
                    console.log('Bot was blocked by the user');
                    await User.findOneAndUpdate({
                        userId: user_chatIdCreator
                    }, {
                        $set: { isSubscribe: false }
                    })
                } else {
                    throw e;
                }
            }
        } else {
            return console.log("Bulk Camapign Created Owner Not subscribed")
        }
    }).clone()



    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkCancelCampaign = async (activity, totalCount) => {
    let msg = `***You Canceled **${totalCount}** Campaigns.***`

    let user_chatIdCreator

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.creator
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdCreator = result.userId
            try {
                bot.telegram.sendMessage(user_chatIdCreator, msg, {
                    parse_mode: 'Markdown'
                })
            } catch (e) {
                if (e.response && e.response.error_code === 403) {
                    console.log('Bot was blocked by the user');
                    await User.findOneAndUpdate({
                        userId: user_chatIdCreator
                    }, {
                        $set: { isSubscribe: false }
                    })
                } else {
                    throw e;
                }
            }
        } else {
            return console.log("Bulk Camapign Canceled Owner Not subscribed")
        }
    }).clone()



    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkDepositCampaign = async (activity, totalCount) => {
    let msg = `***You Deposit **${totalCount}** Campaigns.***`

    let user_chatIdCreator

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.creator
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdCreator = result.userId
            try {
                bot.telegram.sendMessage(user_chatIdCreator, msg, {
                    parse_mode: 'Markdown'
                })
            } catch (e) {
                if (e.response && e.response.error_code === 403) {
                    console.log('Bot was blocked by the user');
                    await User.findOneAndUpdate({
                        userId: user_chatIdCreator
                    }, {
                        $set: { isSubscribe: false }
                    })
                } else {
                    throw e;
                }
            }
        } else {
            return console.log("Bulk Camapign Deposit Owner Not subscribed")
        }
    }).clone()



    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

let bulkEndCampaign = async (activity, totalCount) => {
    let msg = `*** Total **${totalCount}** Campaigns Ended.***`

    let user_chatIdCreator

    await userData.findOne({
        "isSubscribe": true,
        "omniflixAddress": activity.creator
    }, async (error, result) => {
        if (error) {
            return console.log(error)
        } else if (result) {
            user_chatIdCreator = result.userId
            try {
                bot.telegram.sendMessage(user_chatIdCreator, msg, {
                    parse_mode: 'Markdown'
                })
            } catch (e) {
                if (e.response && e.response.error_code === 403) {
                    console.log('Bot was blocked by the user');
                    await User.findOneAndUpdate({
                        userId: user_chatIdCreator
                    }, {
                        $set: { isSubscribe: false }
                    })
                } else {
                    throw e;
                }
            }
        } else {
            return console.log("Bulk Camapign End Owner Not subscribed")
        }
    }).clone()



    await ActivityData.updateMany({
        type: activity.type,
        block: activity.block
    }, {
        $set: {
            "isNotified": true,
        }
    }, async (error) => {
        if (error) {
            return console.log(error)
        }
    }).clone()
}

module.exports = {
    bulkAuction,
    bulkListingNft,
    bulkAuctionCancel,
    bulkAuctionRemoved,
    bulkDeListingNft,
    bulkBurnNft,
    bulkMinting,
    bulkTransfer,
    bulkCreateCollection,
    bulkTransferCollection,
    bulkUpdateCollection,
    bulkProcessBid,
    bulkPlaceBid,
    bulkBuyNft,
    bulkCreateCampaign,
    bulkCancelCampaign,
    bulkDepositCampaign,
    bulkEndCampaign,
}