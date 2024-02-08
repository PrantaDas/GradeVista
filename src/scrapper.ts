import puppeteer from "puppeteer";
import config from "./config";
import { ScrapperPayload } from "./types";
import { existsSync, mkdirSync } from "fs";
import path from "path";

/**
 * This class represents a web scraper designed to navigate to a website, input examination
 * details provided by the user, and scrape examination result data. It utilizes Puppeteer
 * to automate web interactions and extract result information. The class initializes with
 * a base URL and examination payload, and provides methods to initialize a Puppeteer browser
 * instance and navigate to the relevant pages to scrape result data.
 */
class Scrapper {
    private readonly baseUrl: string;
    private data: ScrapperPayload;
    public tempData: ScrapperPayload | null = null;
    private driver: any;
    private readonly directory: string = 'downloads';

    /**
     * Constructs a new instance of the Scrapper class with the provided examination payload.
     * @param {ScrapperPayload} payload - The payload containing examination details.
     */
    constructor(payload: ScrapperPayload) {
        this.baseUrl = config.BASE_URL;
        this.data = payload;
        // Ensure the downloads directory exists
        if (!existsSync(this.directory)) mkdirSync(path.join(process.cwd(), this.directory));
    }

    /**
     * Initializes a Puppeteer browser instance and sets up viewport settings.
     * @returns {Promise<any>} A promise resolving to the Puppeteer browser instance.
     */
    async init() {
        const browser = await puppeteer.launch({ headless: 'new', args: ['--start-maximized'] });
        this.driver = await browser.newPage();
        this.driver.setViewport({
            width: 1920,
            height: 1080,
        });
        return browser;
    }

    /**
     * Navigates to the examination result website, inputs examination details, and scrapes result data.
     * @param {any} browser - The Puppeteer browser instance.
     * @returns {Promise<string>} A promise resolving to the full path of the scraped result PDF file.
     */
    async navigate(browser: any) {
        this.tempData = this.data;
        // Navigate to the base URL
        await this.driver.goto(this.baseUrl, {
            waitUntil: "networkidle2"
        });

        // Select examination, year, and board
        await this.driver.waitForSelector("select[name='exam']");
        await this.driver.select('select[name="exam"]', this.tempData.examName);

        await this.driver.waitForSelector("select[name='year']");
        await this.driver.select("select[name='year']", this.tempData.year);

        await this.driver.waitForSelector("select[name='board']");
        await this.driver.select("select[name='board']", this.tempData.examBoard);

        // Input roll number and registration number
        await this.driver.waitForSelector("input[name='roll']");
        await this.driver.$eval("input[name='roll']", (el: any, roll: string | undefined) => {
            el.value = roll;
        }, this.tempData?.rollNo);

        await this.driver.waitForSelector("input[name='reg']");
        await this.driver.$eval("input[name='reg']", (el: any, regNo: string | undefined) => {
            el.value = regNo;
        }, this.tempData?.regNo);

        // Calculate the sum of values and input it
        const expression = await this.driver.$x('//td[contains(text(),"+")]');
        const text = await this.driver.evaluate((el: any) => el.textContent, expression[0]);
        const result = text.split('+').filter(Boolean).map((t: string) => t.trim()).reduce((acc: any, val: any) => Number(acc) + Number(val), 0);

        await this.driver.waitForSelector("input[name='value_s']");
        await this.driver.type("input[name='value_s']", result.toString());

        // Click on the submit button
        await this.driver.click("input[name=button2]");

        // Wait for the page to load
        await new Promise((r) => setTimeout(r, 3000));

        // Capture screenshot of the result table
        const tbodyBoundingBox = await this.driver.$eval('tbody', (el: any) => {
            const { x, y, width, height } = el.getBoundingClientRect();
            return { x, y, width, height };
        });

        // Set file paths for screenshot and PDF
        const screenshotFullPath = path.join(process.cwd(), this.directory, `${this.data.rollNo}.png`);
        const pdfFullPath = path.join(process.cwd(), this.directory, `${this.data.rollNo}.pdf`);

        // Capture screenshot of the result table and save as PNG
        await this.driver.screenshot({
            path: screenshotFullPath,
            clip: tbodyBoundingBox,
        });

        // Convert screenshot to PDF
        await this.driver.pdf({
            path: pdfFullPath,
            width: tbodyBoundingBox.width,
            height: tbodyBoundingBox.height,
        });

        // Close the browser
        await browser.close();

        // Return the full path of the PDF file
        return pdfFullPath;
    }
}

export default Scrapper;
