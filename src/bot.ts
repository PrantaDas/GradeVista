import { Bot, session } from "grammy";
import config from "./config";
import { MyContext } from "./types";
import { conversations, createConversation } from "@grammyjs/conversations";
import log from "./logger";
import menu from "./menu";
import { helpMessage } from "./constants";
import { getResult } from "./conversation";

/**
 * This function initializes and configures a Telegram bot using the Grammy library.
 * It creates a bot instance, sets up session management, and defines various commands and event handlers.
 * The bot provides functionalities such as starting the conversation, displaying help messages,
 * and handling callback queries.
 * @returns {Bot<MyContext>} An instance of the Telegram bot.
 */
export default function tg() {
    // Retrieve the bot token from the configuration
    const BOT_TOKEN = config.BOT_TOKEN;
    // Ensure the bot token is provided
    if (!BOT_TOKEN) throw new Error("Bot token is required");

    // Initialize a new instance of the Telegram bot
    const bot = new Bot<MyContext>(BOT_TOKEN);

    // Log environment loading and bot startup
    log.info("=> All envs are loaded");
    log.info("=> Bot started");

    // Define the main function responsible for bot setup and command/event handling
    const main = () => {
        // Manage user sessions
        bot.use(session({ initial: () => ({}) }));

        // Enable conversation handling
        bot.use(conversations());

        // Register the conversation handler for obtaining results
        bot.use(createConversation(getResult));

        // Handle the '/start' command
        bot.command("start", async (ctx) => {
            // Reply with a menu and keyboard options
            await ctx.reply("<code>&#9; &#9; &#9;Options&#9; &#9; &#9; &#9;</code>", {
                reply_markup: menu('primary'),
                parse_mode: 'HTML'
            });
        });

        // Handle the '/help' command
        bot.command("help", async (ctx) => {
            // Reply with a help message
            await ctx.reply(helpMessage.trim(), { parse_mode: 'HTML' });
        });

        // Handle callback queries
        bot.on('callback_query', async (ctx) => {
            // If the callback query is for help, reply with the help message
            if (ctx.update.callback_query.data === 'help') return await ctx.reply(helpMessage.trim(), { parse_mode: 'HTML' });
            // Otherwise, initiate the 'getResult' conversation
            await ctx.conversation.enter('getResult');
        });

        // Handle all other messages
        bot.hears(/.*/, (ctx) => {
            // Log the received message context
            console.log(ctx);
        });

        // Start the bot
        bot.start();
    };

    // Execute the main function and handle any errors
    try {
        main();
    } catch (err) {
        // Log the error and attempt to restart the main function
        console.log(err);
        main();
    }

    // Return the bot instance
    return bot;
}
