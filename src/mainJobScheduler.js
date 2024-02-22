let request = require("request")
var cron = require('node-cron');
const dotenv = require('dotenv').config()
const { ActivityData } = require("../models/activity.model");
const { 
    createAuctionHelper, 
    cancelAuctionHelper, 
    removeAuctionHelper, 
    processBidAuctionHelper, 
    placeBidAuctionHelper 
} = require("../helpers/auctions.helpers");
const { listingHelper, deListingHelper } = require("../helpers/listings.helpers");
const { transferNftHelper } = require("../helpers/transferNft.helper");
const { 
    buyNftHelper, 
    burnNftHelper, 
    mintONFTHelper, 
    burnNftClaimHelper 
} = require("../helpers/buyNfts.helpers");
const { 
    updateDenomHelper, 
    transferDenomHelper, 
    createDenomHelper 
} = require("../helpers/denoms.helper");
const https = require('https')
const { userData } = require('../models/user.model');
const { 
    bulkAuction, 
    bulkListingNft, 
    bulkAuctionCancel, 
    bulkAuctionRemoved, 
    bulkDeListingNft, 
    bulkBurnNft, 
    bulkMinting, 
    bulkTransfer, 
    bulkProcessBid, 
    bulkPlaceBid, 
    bulkBuyNft, 
    bulkUpdateCollection, 
    bulkTransferCollection, 
    bulkCreateCollection, 
    bulkCreateCampaign, 
    bulkCancelCampaign, 
    bulkDepositCampaign, 
    bulkEndCampaign 
} = require("../helpers/bulkNotification.helper");
const { 
    MsgCreateCampaignHelper, 
    MsgCancelCampaignHelper, 
    MsgDepositCampaignHelper, 
    MsgClaimCampaignHelper, 
    endCampaignHelper, 
    campaignTransferNftHelper, 
    MsgStreamSendHelper, 
    MsgStopStreamHelper, 
    MsgClaimStreamedAmountHelper, 

    MsgStreamCreatedHelper 
} = require("../helpers/campaigns.helpers");



let MainScheduler = async () => {
    try {
        let verifiedCollection = []
        let url = `${process.env.DATALAYER_COLLECTION_URL}/collections?sortBy=created_at&order=desc&withNFTs=true&limit=1000`
        let options = { json: true };

        request(url, options, async (error, res, body) => {
            if (error) {
                return console.log(error)
            } else if (!error && res.statusCode == 200) {
                let collections = body.result.list
                verifiedCollection.splice(0,)
                collections.forEach(collection => {
                    verifiedCollection.push(collection.id)
                })
                // console.log(verifiedCollection)


                await ActivityData.find({
                    "isNotified": false
                }, {}, {
                    sort: {
                        created_at: 'desc'
                    },
                    limit: 1
                }, async (error, activities) => {

                    if (error) {
                        console.log(error)
                    } else if (activities && activities.length) {
                        activities.forEach(async (activity) => {
                            await ActivityData.count({
                                "block": activity.block,
                                "type": activity.type,
                                "isNotified": false,
                            }, async (error, totalCount) => {

                                if (error) {
                                    console.log(error)
                                } else if (totalCount > 3) {

                                    if (activity.type == "MsgCreateAuction") {
                                        bulkAuction(activity, totalCount)
                                    } else if (activity.type == "MsgListNFT") {
                                        bulkListingNft(activity, totalCount)

                                    } else if (activity.type == "MsgCancelAuction") {
                                        bulkAuctionCancel(activity, totalCount)

                                    } else if (activity.type == "RemoveAuction") {
                                        bulkAuctionRemoved(activity, totalCount)

                                    } else if (activity.type == "MsgDeListNFT") {
                                        bulkDeListingNft(activity, totalCount)

                                    } else if (activity.type == "MsgBurnONFT") {
                                        bulkBurnNft(activity, totalCount)


                                    } else if (activity.type == "MsgMintONFT") {
                                        bulkMinting(activity, totalCount)

                                    } else if (activity.type == "MsgTransferONFT") {
                                        bulkTransfer(activity, totalCount)

                                    } else if (activity.type == "ProcessBid") {
                                        bulkProcessBid(activity, totalCount)

                                    } else if (activity.type == "MsgPlaceBid") {
                                        bulkPlaceBid(activity, totalCount)

                                    } else if (activity.type == "MsgBuyNFT") {
                                        bulkBuyNft(activity, totalCount)

                                    } else if (activity.type == "MsgCreateDenom") {
                                        bulkCreateCollection(activity, totalCount)

                                    } else if (activity.type == "MsgUpdateDenom") {
                                        bulkUpdateCollection(activity, totalCount)

                                    } else if (activity.type == "MsgTransferDenom") {
                                        bulkTransferCollection(activity, totalCount)

                                    } else if (activity.type == "MsgCreateCampaign") {
                                        bulkCreateCampaign(activity, totalCount)
                                    } else if (activity.type == "MsgCancelCampaign") {
                                        bulkCancelCampaign(activity, totalCount)
                                    } else if (activity.type == "MsgDepositCampaign") {
                                        bulkDepositCampaign(activity, totalCount)
                                    } else if (activity.type == "EndCampaign") {
                                        bulkEndCampaign(activity, totalCount)
                                    }
                                    
                                } else {
                                    if (activity.type == "MsgListNFT" || activity.type == "MsgCreateAuction") {
                                        let denom = activity.denom_id.id ? activity.denom_id.id : activity.denom.id;
                                        if (verifiedCollection.includes(denom)) {
                                            if (activity.type == "MsgCreateAuction") {
                                                createAuctionHelper(activity)
                                            } else if (activity.type == "MsgListNFT") {
                                                listingHelper(activity)
                                            } else if (activity.type == "MsgCancelAuction") {
                                                cancelAuctionHelper(activity)
                                            } else if (activity.type == "RemoveAuction") {
                                                removeAuctionHelper(activity)
                                            } else if (activity.type == "ProcessBid") {
                                                processBidAuctionHelper(activity)
                                            } else if (activity.type == "MsgPlaceBid") {
                                                placeBidAuctionHelper(activity)
                                            } else if (activity.type == "MsgTransferONFT") {
                                                transferNftHelper(activity)
                                            } else if (activity.type == "MsgBuyNFT") {
                                                buyNftHelper(activity)
                                            } else if (activity.type == "MsgDeListNFT") {
                                                deListingHelper(activity)
                                            } else if (activity.type == "MsgBurnONFT") {
                                                burnNftHelper(activity)
                                            } else if (activity.type == "MsgCreateDenom") {
                                                createDenomHelper(activity)
                                            } else if (activity.type == "MsgUpdateDenom") {
                                                updateDenomHelper(activity)
                                            } else if (activity.type == "MsgTransferDenom") {
                                                transferDenomHelper(activity)
                                            } else if (activity.type == "MsgMintONFT") {
                                                mintONFTHelper(activity)
                                            } else if (activity.type == "MsgCreateCampaign") {
                                                MsgCreateCampaignHelper(activity)
                                            } else if (activity.type == "MsgCancelCampaign") {
                                                MsgCancelCampaignHelper(activity)
                                            } else if (activity.type == "MsgDepositCampaign") {
                                                MsgDepositCampaignHelper(activity)
                                            } else if (activity.type == "MsgClaim") {
                                                MsgClaimCampaignHelper(activity)
                                            } else if (activity.type == "EndCampaign") {
                                                endCampaignHelper(activity)
                                            } else if (activity.type == "TransferNft") {
                                                campaignTransferNftHelper(activity)
                                            } else if (activity.type == "STREAM_PAYMENT_TYPE_CONTINUOUS") {
                                                MsgStreamSendHelper(activity)
                                            } else if (activity.type == "STREAM_PAYMENT_TYPE_DELAYED") {
                                                MsgStreamSendHelper(activity)
                                            } else if (activity.type == "MsgStopStream") {
                                                MsgStopStreamHelper(activity)
                                            } else if (activity.type == "CLAIM") {
                                                MsgClaimStreamedAmountHelper(activity)
                                            } else if (activity.type == "BurnNft") {
                                                burnNftClaimHelper(activity)
                                            } else if (activity.type == "StreamCreated") {
                                                MsgStreamCreatedHelper(activity)
                                            }
                                        } else {
                                            return console.log("Collection Not Verified")
                                        }
                                    } else {
                                        if (activity.type == "MsgCreateAuction") {
                                            createAuctionHelper(activity)
                                        } else if (activity.type == "MsgListNFT") {
                                            listingHelper(activity)
                                        } else if (activity.type == "MsgCancelAuction") {

                                            cancelAuctionHelper(activity)
                                        } else if (activity.type == "RemoveAuction") {
                                            removeAuctionHelper(activity)
                                        } else if (activity.type == "ProcessBid") {
                                            processBidAuctionHelper(activity)
                                        } else if (activity.type == "MsgPlaceBid") {
                                            placeBidAuctionHelper(activity)
                                        } else if (activity.type == "MsgTransferONFT") {
                                            transferNftHelper(activity)
                                        } else if (activity.type == "MsgBuyNFT") {
                                            buyNftHelper(activity)
                                        } else if (activity.type == "MsgDeListNFT") {
                                            deListingHelper(activity)
                                        } else if (activity.type == "MsgBurnONFT") {
                                            burnNftHelper(activity)
                                        } else if (activity.type == "MsgCreateDenom") {
                                            createDenomHelper(activity)
                                        } else if (activity.type == "MsgUpdateDenom") {
                                            updateDenomHelper(activity)
                                        } else if (activity.type == "MsgTransferDenom") {
                                            transferDenomHelper(activity)
                                        } else if (activity.type == "MsgMintONFT") {
                                            mintONFTHelper(activity)
                                        } else if (activity.type == "MsgCreateCampaign") {
                                            MsgCreateCampaignHelper(activity)
                                        } else if (activity.type == "MsgCancelCampaign") {
                                            MsgCancelCampaignHelper(activity)
                                        } else if (activity.type == "MsgDepositCampaign") {
                                            MsgDepositCampaignHelper(activity)
                                        } else if (activity.type == "MsgClaim") {
                                            MsgClaimCampaignHelper(activity)
                                        } else if (activity.type == "EndCampaign") {
                                            endCampaignHelper(activity)
                                        } else if (activity.type == "TransferNft") {
                                            campaignTransferNftHelper(activity)
                                        } else if (activity.type == "STREAM_PAYMENT_TYPE_CONTINUOUS") {
                                            MsgStreamSendHelper(activity)
                                        } else if (activity.type == "STREAM_PAYMENT_TYPE_DELAYED") {
                                            MsgStreamSendHelper(activity)
                                        } else if (activity.type == "MsgStopStream") {
                                            MsgStopStreamHelper(activity)
                                        } else if (activity.type == "CLAIM") {
                                            MsgClaimStreamedAmountHelper(activity)
                                        } else if (activity.type == "BurnNft") {
                                            burnNftClaimHelper(activity)
                                        } else if (activity.type == "StreamCreated") {
                                            MsgStreamCreatedHelper(activity)
                                        }

                                    }
                                }
                            }).clone()

                        })

                    }
                }).clone()
            } else {
                return console.log("No Collection Present")
            }
        })
    } catch (e) {
        console.log(e)
    }
}

let mainSchedulerData = cron.schedule('*/15 * * * * *', MainScheduler)

module.exports = {
    mainSchedulerData
}