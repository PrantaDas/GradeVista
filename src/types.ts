import { ConversationFlavor, type Conversation } from "@grammyjs/conversations";
import { MenuFlavor } from "@grammyjs/menu";
import { Context, InlineKeyboard } from "grammy";

export type MyContext = Context & ConversationFlavor & MenuFlavor;

export type MyConversation = Conversation<MyContext>;

export interface MenuOptions {
    [key: string]: InlineKeyboard;
};

export type ScrapperPayload = {
    examName: string | undefined;
    year: string | undefined;
    examBoard: string | undefined;
    rollNo: string | undefined;
    regNo: string | undefined;
};