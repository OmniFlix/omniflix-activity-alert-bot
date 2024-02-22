const { Markup } = require('telegraf');

const faqQuestions = [
    '1. How can I get new listing alerts?',
    "2. How to reactivate the alerts after muting?",
    '3. How can I custom update the notifications?',
    '4. How can i join the FlixFam?',
    '5. Other ways to stay updated?',
    '6. Support for Buzz Bot?',
];

const faqAnswers = [
    "Subscribe with /subscribe to start receiving NFT listing alerts.",
    "Type /interested & select the notifications you’d like to reactivate.",
    "Tailor your notifications by activating/removing notifications using /interested and /notinterested command.",
    "Engage and participate on [Twitter](https://twitter.com/OmniFlixNetwork), [Telegram](https://t.me/OmniFlixNetwork), [Discord](https://discord.com/invite/6gdQ4yZSTC) & [Reddit](https://www.reddit.com/r/OmniFlix/).",
    "Follow our blog for regular updates and news from the Flixverse.",
    "For assistance, reach out to us on [Telegram](https://t.me/OmniFlixNetwork) or [Discord](https://discord.com/invite/6gdQ4yZSTC)."
]

const guideQuestions = [
    '1. Starting Your Own NFT Collection on OmniFlix',
    "2. Creating a Channel on OmniFlix TV",
    "3. How to get $FLIX Tokens",
    "4. Participating in NFT Auctions",
    "5. Watching Interactive Content on OmniFlix TV",
    "6. Transferring NFTs on OmniFlix",
    "7. Listing NFTs for Sale on OmniFlix Market",
]
const guideAnswers = [
    "Watch this step-by-step guide to create, mint, and list your NFTs. [Link](https://www.youtube.com/playlist?list=PL-9HgHlIigVPwFHr1KcYZjLtyTykPP9IX)",
    "Checkout this walkthrough to launch your channel and publish interactive content. [Link](https://omniflix.tv/iv/659d430459f3c03dc376c69a)",
    "You can swap $FLIX tokens on [Osmosis](app.osmosis.zone) or [Astrovault](astrovault.io)  by swapping them from cosmos denoms.",
    "Visit [Auctions](omniflix.market/marketplace/auctions) select an NFT, and place your bid to participate.",
    "Browse and select interactive videos on [OmniFlix TV](OmniFlix.tv). Sign in with your wallet for full interaction.",
    "Follow this tutorial to learn how to transfer NFTs to others on OmniFlix Market. [Tutorial](https://www.youtube.com/watch?v=qaZKrQuFeZ4)",
    "List your NFTs on OmniFlix Market by following this walkthrough [Link](https://www.youtube.com/watch?v=MdTvO853S7Y)"
]

const faq = (ctx) => {
    const keyboard = [];
    let row = [];
    faqQuestions.forEach((_, index) => {
        row.push(Markup.button.callback(index + 1, `selectf_${index}`));
        if ((index + 1) % 6 === 0 || index === faqQuestions.length - 1) {
            keyboard.push(row);
            row = []; 
        }
    });
    let tex =  '***Select a question number to get the answer:***\n\n'+faqQuestions.join('\n')
    console.log(keyboard)
    ctx.reply(
        tex, {
            parse_mode: 'Markdown',
            link_preview_options: {
                is_disabled: true
            },
            reply_markup: {
                inline_keyboard: keyboard
            }
        }
    )
}

let faqHandler = (ctx) =>{
    const callbackData = ctx.callbackQuery.data;
    console.log(callbackData)
    
    if (/^selectf_/.test(callbackData)) {
        const index = callbackData.replace('selectf_', '');
        ctx.reply(
            '***'+faqQuestions[index]+'***\n'+faqAnswers[index], 
            {
                link_preview_options: {
                    is_disabled: true
                },
                parse_mode: 'Markdown'
            }
        )
    }
}

let guides = (ctx) => {
    
    const keyboard = [];
    let row = [];

    guideQuestions.forEach((_, index) => {
        row.push(Markup.button.callback(index + 1, `selectg_${index}`));
        if ((index + 1) % 6 === 0 || index === guideQuestions.length - 1) {
            keyboard.push(row);
            row = []; 
        }
    });
    let tex = '***These are some helpful questions to get you around..\nPlease select a question number to get the answer:***\n\n'+guideQuestions.join('\n')
    console.log(keyboard)
    ctx.reply(
        tex, {
            parse_mode: 'Markdown',
            link_preview_options: {
                is_disabled: true
            },
            reply_markup: {
                inline_keyboard: keyboard
            }
        }
    );
}

const guideHandler = (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    
    if (/^selectg_/.test(callbackData)) {
        const index = callbackData.replace('selectg_', '');
        ctx.reply(
            '***'+guideQuestions[index]+'***\n'+guideAnswers[index], 
            {
                link_preview_options: {
                    is_disabled: true
                },
                parse_mode: 'Markdown'
            }
        )
    }
}

module.exports = {
    faq,
    faqHandler,
    guides,
    guideHandler,

}