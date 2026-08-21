const util = require('minecraft-server-util');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const SERVER_IP = 'Notzz_aahil.aternos.me';
const SERVER_PORT = 25565; // Java ke liye 25565 (Bedrock ke liye 19132)

const CONFIG = {
    sessionCookie: 'uN7TSSB0to8h7eSoZ5ekTgtB3A1Va4fssSdjaKszNo59G1293euJPtlCH6DuY2DTmdpJYiM8Oa9GxeALss6ppH2ue2wFXaAWlyCw',
    serverCookie: 'OsNGHYUoKJu8co6g'
};

async function checkAndStart() {
    console.log(`[CHECK] Checking server status for ${SERVER_IP}...`);
    
    try {
        const response = await util.status(SERVER_IP, SERVER_PORT, { timeout: 5000 });
        console.log(`[ONLINE] Server pehle se chal raha hai! Players: ${response.players.online}/${response.players.max}`);
        process.exit(0);
    } catch (err) {
        console.log('[OFFLINE] Server offline hai! Starting browser to launch server...');
    }

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

        console.log('[AUTO-START] Aternos open ho raha hai...');
        await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2', timeout: 60000 });

        let currentUrl = page.url();
        if (currentUrl.includes('/servers')) {
            console.log('[AUTO-START] Server card click kar rahe hain...');
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
                console.log('[INFO] Koi queue nahi thi.');
            }
        }
    } catch (error) {
        console.error('[ERROR]', error.message);
    } finally {
        await browser.close();
        console.log('[AUTO-START] Process complete.');
    }
}

checkAndStart();
