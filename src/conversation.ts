import { unlinkSync } from "fs";
import { InputFile } from "grammy";
import menu from "./menu";
import Scrapper from "./scrapper";
import { MyContext, MyConversation, ScrapperPayload } from "./types";

/**
 * This function is responsible for handling the conversation flow to obtain user input
 * and initiate the scraping process to retrieve examination results. It prompts the user
 * for their name, choice of exam, passing year, exam board, roll number, and registration
 * number. After gathering the necessary information, it processes the response, initiates
 * the scraping process, and sends the obtained result document to the user.
 * @param {MyConversation} conversation - The conversation context for managing the interaction flow.
 * @param {MyContext} ctx - The context object representing the current message context.
 * @returns {Promise<void>} A promise indicating the completion of the result retrieval process.
 */
export async function getResult(conversation: MyConversation, ctx: MyContext) {
    let name: string = '';

    // Prompt the user for their name
    await ctx.reply("Whats your name learner?");
    const nameData = await conversation.wait();
    name = nameData.update.message?.text || 'User';

    // Prompt the user to choose an exam
    await ctx.reply("<b>Choose Exam </b>", {
        reply_markup: menu('exam'),
        parse_mode: 'HTML'
    });
    const exam = await conversation.wait();
    const examName = exam?.update?.callback_query?.data || undefined;

    // Prompt the user for the passing year
    await ctx.reply("<b>Input the passing year, Eg: 2010</b>", { parse_mode: 'HTML' });
    const passYear = await conversation.wait();
    const year = passYear.update.message?.text;

    // Prompt the user to choose a board
    await ctx.reply("<b>Choose Board</b>", {
        reply_markup: menu('board'),
        parse_mode: 'HTML'
    });
    const board = await conversation.wait();
    const examBoard = board.update.callback_query?.data;

    // Prompt the user for their roll number
    await ctx.reply("<b>Input Your Roll number</b>", { parse_mode: 'HTML' });
    const roll = await conversation.wait();
    const rollNo = roll.update.message?.text;

    // Prompt the user for their registration number
    await ctx.reply("<b>Input your registration number</b>", { parse_mode: 'HTML' });
    const reg = await conversation.wait();
    const regNo = reg.update.message?.text;

    // Prepare the payload with user input data
    const payload: ScrapperPayload = {
        examName,
        year,
        examBoard,
        rollNo,
        regNo
    };

    // Inform the user about processing their response
    await ctx.reply("Processing your response....");

    // Initialize the scrapper with the provided payload
    const scrapper = new Scrapper(payload);
    // Initialize a browser instance
    const browser = await scrapper.init();
    // Navigate to the relevant page and retrieve result files
    const files: string = await scrapper.navigate(browser);

    // If result files are obtained
    if (files) {
        // Create an input file from the result files
        const resPdf = new InputFile(files);
        // Send the result document to the user
        await ctx.replyWithDocument(resPdf);
        // Send a good luck message to the user
        await ctx.reply('Best of luck! 🍀');
        // Remove the temporary files
        unlinkSync(files);
        unlinkSync(files.split('.')[0] + '.png');
    } else {
        // If something went wrong during result retrieval, inform the user
        await ctx.reply('Something went wrong with the server, please try again');
    }
};
