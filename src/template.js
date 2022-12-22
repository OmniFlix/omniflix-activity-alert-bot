
let HelpMsg =
  `
    HERE ARE THE AVAILABLE COMMANDS AND THEIR UTILITY
     /about - About the bot
     /omniflix - About OmniFlix Network
	   /subscribe - subscribe with your OmniFlix account address to get notificaations \ne.g:(/subscribe omniflix1rtwjj6qfn62emyghhgfhhtjedv3kgd9j20tx)
	   /unsubscribe - unsubscribe updates
     /join - join the bot and subscribe to get personalized updates
     `
let aboutBot = `Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
let aboutOmniflix =`Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna aliqua`
let joinBot = `connect the bot to get personal message. Click the link below.\n@blockeater_bot\nand type /help or /subscribe.\nGet all updates`

let createAuctionMsg = `***New Auction Listed On MarketPlace***  
https://omniflix.market/nft/{ACTIVITYNFT_IDID}  
The Auction is starting at:  
***{START_DATE}***  
and the Auction is ending at:  
***{END_DATE}***` ;


let cancelAuctionMsg = ` ***Auction Cancelled.***  
https://omniflix.market/nft/{ACTIVITYNFT_IDID}`;

let removeAuctionMsg = ` ***Auction Removed From Marketplace.***  
https://omniflix.market/nft/{ACTIVITYNFT_IDID}`;



let processBidAuctionHelperMsg = {
  auctionWonMsg: ` **Congratulations**  
***You Won the Following Auction:***  
https://omniflix.market/nft/{ACTIVITYNFT_IDID}`,

  auctionEndMsg: ` ***The Auction has Ended :***  
https://omniflix.market/nft/{ACTIVITYNFT_IDID}`

}



let placeBidAuctionHelperMsg = {
  ownerMsg: ` ***New bid placed on your auction.***  
https://omniflix.market/nft/{NFTID}`,

  bidderMsg: ` ***You have placed a new bid.***  
https://omniflix.market/nft/{NFTID}`,

  previousBidderMsg: ` ***Your Bid has been overbidden. ***  
https://omniflix.market/nft/{NFTID}`

}



let buyNftHelperMsg = {
  NftOwnerMsg: ` ***Nft Sold***:  https://omniflix.market/nft/{ACTIVITYNFT_IDID}`,
  NftBuyerMsg: ` ***You Bought New NFT***  https://omniflix.market/nft/{ACTIVITYNFT_IDID}`

}



let burnNftHelperMsg = ` *** You Delisting Following Nft From MarketPlace.***  
https://omniflix.market/nft/{ACTIVITYID}`


let mintONFTHelperMsg = {
  creatorMsg: `***You have minted a new NFT***  
https://omniflix.market/nft/{NFTID)`,

  ownerMsg: `***A new NFT was minted in you account***  
https://omniflix.market/nft/{NFTID}`


}

let transferDenomHelperMsg = {
  senderMsg: `***You have transferred this collection to***  
{ACTIVITYDATARECIPIENT}  
https://omniflix.market/collection/{DENOMID}`,

  receiverMsg: `***You have received the below collection from ***   
{ACTIVITYDATACREATOR}  
https://omniflix.market/collection/{DENOMID}`


}


let updateDenomHelperMsg = `***Your collection has been updated***  
**Symbol:  {SYMBOL}**  
**Name:  {NAME} **  
https://omniflix.market/collection/{DENOMID}`;


let listingHelperMsg = ` ***New fixed-price listing on OmniFlix Market.***  
https://omniflix.market/nft/{ACTIVITYNFT_IDID}`


let delistingHelperMsg = ` *** You delisted the following NFT from OmniFlix Market.***  
https://omniflix.market/nft/{ACTIVITYNFT_IDID}`



let transferNftHelperMsg = {
  senderMsg: ` ***You transferred the NFT.***  
https://omniflix.market/nft/{ACTIVITYID}`,

  receiverMsg: ` ***You received a new NFT in your Account***  
https://omniflix.market/nft/{ACTIVITYID}`


}

module.exports = {
  HelpMsg,
  joinBot,
  aboutBot,
  aboutOmniflix,
  createAuctionMsg,
  cancelAuctionMsg,
  removeAuctionMsg,
  processBidAuctionHelperMsg,
  placeBidAuctionHelperMsg,
  buyNftHelperMsg,
  burnNftHelperMsg,

  mintONFTHelperMsg,
  transferDenomHelperMsg,
  updateDenomHelperMsg,
  listingHelperMsg,
  delistingHelperMsg,
  transferNftHelperMsg
}
