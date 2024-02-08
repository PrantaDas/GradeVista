import tg from "./bot";
import log from "./logger";

/**
 * This function initializes the Telegram bot by calling the `tg()` function from the "bot" module.
 * It also sets up event listeners to gracefully handle SIGTERM and SIGINT signals, ensuring the bot stops
 * properly when the process receives termination signals. Additionally, it sets up event listeners to handle
 * uncaught exceptions by logging the error stack and restarting the bot.
 */
function mainf() {
    // Initialize the Telegram bot
    const bot = tg();

    // Gracefully handle SIGTERM signal
    process.once('SIGTERM', () => bot.stop());

    // Gracefully handle SIGINT signal
    process.once('SIGINT', () => bot.stop());
}

// Event listener for process exit
process.once('exit', (message) => {
    // Log the exit message with the exit code
    log.info(`=> Exit, code ${message}`);
});

// Event listener for uncaught exceptions
process.once('uncaughtException', (err) => {
    // Log the error stack
    log.info(err.stack);
    // Restart the main function
    mainf();
});

// Start the main function
mainf();
