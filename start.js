const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

const CONFIG = {
    sessionCookie: 'uN7TSSB0to8h7eSoZ5ekTgtB3A1Va4fssSdjaKszNo59G1293euJPtlCH6DuY2DTmdpJYiM8Oa9GxeALss6ppH2ue2wFXaAWlyCw',
    serverCookie: 'OsNGHYUoKJu8co6g'
};

async function startServer() {
    console.log('[AUTO-START] Browser open ho raha hai...');
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1280,800'
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36');

        await page.setCookie(
            { name: 'ATERNOS_SESSION', value: CONFIG.sessionCookie, domain: '.aternos.org' },
            { name: 'ATERNOS_SERVER', value: CONFIG.serverCookie, domain: '.aternos.org' }
        );

        console.log('[AUTO-START] Aternos direct server page open kar rahe hain...');
        await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2', timeout: 60000 });

        let currentUrl = page.url();
        console.log('[INFO] Current URL:', currentUrl);

        // Agar servers list page par redirect ho gaya, toh targeted card click karo
        if (currentUrl.includes('/servers')) {
            console.log('[AUTO-START] Clicking Notzz_aahil server card...');
            await page.evaluate(() => {
                const cards = Array.from(document.querySelectorAll('.server-body, .server'));
                for (const card of cards) {
                    if (card.innerText.includes('Notzz_aahil') || card.innerText.includes('OsNGHYUoKJu8co6g')) {
                        card.click();
                        break;
                    }
                }
            });
            await new Promise(r => setTimeout(r, 6000));
        }

        console.log('[AUTO-START] Start button check kar rahe hain...');
        await page.waitForSelector('#start', { visible: true, timeout: 30000 });

        const startBtn = await page.$('#start');
        if (startBtn) {
            await startBtn.click();
            console.log('[SUCCESS] Server START button click ho gaya!');

            try {
                await page.waitForSelector('#confirm', { visible: true, timeout: 10000 });
                const confirmBtn = await page.$('#confirm');
                if (confirmBtn) {
                    await confirmBtn.click();
                    console.log('[SUCCESS] Queue confirm ho gaya!');
                }
            } catch (e) {
                console.log('[INFO] Queue confirm nahi chahiye tha.');
            }
        }
    } catch (error) {
        console.error('[ERROR]', error.message);
    } finally {
        await browser.close();
        console.log('[AUTO-START] Process complete.');
    }
}

app.get('/', (req, res) => {
    res.send('Aternos Bot is Running!');
});

app.get('/start', async (req, res) => {
    startServer();
    res.send('Starting server triggered...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startServer();
});
