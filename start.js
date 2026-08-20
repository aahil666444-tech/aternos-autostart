const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const CONFIG = {
    sessionCookie: 'uN7TSSB0to8h7eSoZ5ekTgtB3A1Va4fssSdjaKszNo59G1293euJPtlCH6DuY2DTmdpJYiM8Oa9GxeALss6ppH2ue2wFXaAWlyCw',
    serverCookie: 'OsNGHYUoKJu8co6g'
};

async function startServer() {
    console.log('[AUTO-START] Browser open ho raha hai...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        await page.setCookie(
            { name: 'ATERNOS_SESSION', value: CONFIG.sessionCookie, domain: '.aternos.org' },
            { name: 'ATERNOS_SERVER', value: CONFIG.serverCookie, domain: '.aternos.org' }
        );

        console.log('[AUTO-START] Aternos server page open kar rahe hain...');
        await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2' });

        const startBtn = await page.$('#start');
        if (startBtn) {
            await startBtn.click();
            console.log('[SUCCESS] Server START button click ho gaya!');

            await new Promise(resolve => setTimeout(resolve, 3000));
            const confirmBtn = await page.$('#confirm');
            if (confirmBtn) {
                await confirmBtn.click();
                console.log('[SUCCESS] Queue confirm ho gaya!');
            }
        } else {
            console.log('[INFO] Start button nahi mila (Server online/starting hai).');
        }
    } catch (error) {
        console.error('[ERROR]', error.message);
    } finally {
        await browser.close();
        console.log('[AUTO-START] Process complete.');
    }
}

startServer();
