import { InlineKeyboard } from "grammy";
import { MenuOptions } from "./types";

/**
 * This function generates an inline keyboard menu based on the specified menu type.
 * It provides different options for primary, exam, and board menus, each containing
 * specific buttons related to obtaining examination results and accessing additional resources.
 * @param {string} menuType - The type of menu to generate ('primary', 'exam', or 'board').
 * @returns {InlineKeyboard} An inline keyboard representing the specified menu type.
 */
export default function menu(menuType: string): InlineKeyboard {
    // Define different menus with specific options
    const menus: MenuOptions = {
        'primary': new InlineKeyboard()
            .text('🔍 Get Your Board Result', 'result').row()
            .text('🤝 Help', 'help')
            .url('👤 Author', 'https://github.com/Prantadas').row(),
        'exam': new InlineKeyboard()
            .text('HSC/Alim/Equivalent', 'hsc').row()
            .text('JSC/JDC', 'jsc')
            .text('SSC / Dakhil', 'ssc').row()
            .text('SSC(Vocational)', 'ssc_voc')
            .text('HSC/Alim', 'hsc').row()
            .text('HSC(Vocational)', 'hsc_voc')
            .text('HSC(BM)', 'hsc_hbm').row()
            .text('Diploma in Commerce', 'hsc_dic')
            .text('Diploma in Business Studies', 'hsc'),
        'board': new InlineKeyboard()
            .text('Barisal', 'barisal')
            .text('Chittagong', 'chittagong').row()
            .text('Comilla', 'comilla')
            .text('Dhaka', 'dhaka').row()
            .text('Dinajpur', 'dinajpur')
            .text('Jessore', 'jessore').row()
            .text('Mymensingh', 'mymensingh')
            .text('Rajshahi', 'rajshahi').row()
            .text('Sylhet', 'sylhet')
            .text('Madrasah', 'madrasah').row()
            .text('Technical', 'tec')
            .text('DIBS(Dhaka)', 'dibs').row()
    };

    // Return the specified menu type; if no type is provided, return the primary menu
    if (!menuType) return menus['primary'];
    else return menus[menuType];
};
