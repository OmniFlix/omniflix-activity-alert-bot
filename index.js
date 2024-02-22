const { Telegraf } = require('telegraf');
const dotenv = require('dotenv').config()
const connectDB = require("./config/db");

const { HelpMsg,StartMsg, joinBot,aboutBot, aboutOmniflix } = require('./src/template');
const {  messageCMD } = require('./src/subscribe');
const { unSubscribeCMD } = require('./src/unsubscribe');
// uncomment this to fetch data

const { mainSchedulerData } = require('./src/mainJobScheduler');
const { InteractiveVideoSchedulerData } = require('./src/send_IV_notification');
const { activityFetch } = require('./src/activityFetching');
const { interactiveVideoFetch } = require('./src/interactiveVideoFetching');
const { channelsFetch } = require('./src/channelsFetching');
const { notificationNotIntrestedIn, toggleHandler, notificationIntrestedIn} = require('./src/notificationNotIntrestedIn');
const { subscribedCollectionNotification, unSubscribedCollectionNotification } = require('./src/addEnalbeCollection');
const { changeAddress } = require('./src/addressChange');
const { subscribedChannelsNotification, unSubscribedChannelsNotification } = require('./src/addOrRemoveChannels');
const { faq, faqHandler, guides, guideHandler } = require('./src/faqAndGuides')

String.prototype.fmt = function (hash) {
    var string = this, key; for (key in hash) string = string.replace(new RegExp('\\{' + key + '\\}', 'gm'), hash[key]); return string
}


connectDB()

const bot = new Telegraf(process.env.token);

bot.command('start',async (ctx) =>{
    console.time(`Processing update ${ctx.update.message.update_id}`);
    let userName = ctx.update.message.from.username
   await ctx.reply(StartMsg.fmt({ USER_NAME:userName})) 
   console.timeEnd(`Processing update ${ctx.update.message.update_id}`);
})
bot.command('about',async (ctx) =>{
    console.time(`Processing update ${ctx.update.message.update_id}`);

   await ctx.reply(aboutBot) 
   console.timeEnd(`Processing update ${ctx.update.message.update_id}`);
})
bot.command('omniflix',async (ctx) =>{
    console.time(`Processing update ${ctx.update.message.update_id}`);
   await ctx.reply(aboutOmniflix) 
   console.timeEnd(`Processing update ${ctx.update.message.update_id}`);
})
bot.command('join',async (ctx) =>{
    console.time(`Processing update ${ctx.update.message.update_id}`);
   await ctx.reply(joinBot) 
   console.timeEnd(`Processing update ${ctx.update.message.update_id}`);
})
bot.command('help',async (ctx) =>{
    console.time(`Processing update ${ctx.update.message.update_id}`);
   await ctx.reply(HelpMsg) 
   console.timeEnd(`Processing update ${ctx.update.message.update_id}`);
})
  
bot.command('unsubscribe',unSubscribeCMD)

bot.command('subscribe', (ctx) => {
    ctx.reply('Send your OmniFlix account address')
})
bot.command('changeaddress', changeAddress);
bot.command('notinterested', notificationNotIntrestedIn);
bot.command('interested', notificationIntrestedIn);
bot.command('addcollection', subscribedCollectionNotification);
bot.command('removecollection', unSubscribedCollectionNotification);
bot.command('subscribechannel', subscribedChannelsNotification);
bot.command('unsubscribechannel', unSubscribedChannelsNotification);
bot.command('faq', faq);
bot.command('guides', guides);
bot.action(/selectf_.+/, faqHandler)
bot.action(/selectg_.+/, guideHandler)
bot.action(/toggle_.+/, toggleHandler)

bot.on('message', messageCMD )
bot.launch();
console.log("App is running")
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));