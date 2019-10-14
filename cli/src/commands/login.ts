import { writeFile } from 'fs';
import { tmpdir } from 'os';
import { resolve } from 'path';
import { Cookie, launch, Page } from 'puppeteer';
import { readConfig } from '../utils';

export async function login() {
   const browser = await launch({
      headless: false,
      defaultViewport: null,
      args: [
         '--window-size=500,500',
         `--app=${getTenantUrl()}`
      ],
   });
   try {
      const [page] = await browser.pages();
      const cookie = await loginCloud(page);
      await writeCookieToFile(cookie);
   } finally {
      await browser.close();
   }
}

async function loginCloud(page: Page) {
   await page.goto(getTenantUrl());
   await page.goto(getM3Url());
   return waitForSessionId(page);
}

async function waitForSessionId(page: Page) {
   return new Promise<string>((resolve, reject) => {
      const intervalId = setInterval(async () => {
         try {
            const cookies = await getAllCookies(page);
            const sessionCookie = cookies.find(mneSessionCookie);
            if (sessionCookie) {
               const mneCookies = cookies
                  .filter(({ path }) => path === '/' || path === '/mne')
                  .map(({ name, value }) => `${name}=${value};`)
                  .join(' ');
               clearInterval(intervalId);
               resolve(mneCookies);
            }
         } catch (error) {
            clearInterval(intervalId);
            reject(error);
         }
      }, 1000);
   });

   async function getAllCookies(_page: Page): Promise<Cookie[]> {
      const getAllCookiesResponse = await (_page as any)._client.send('Network.getAllCookies');
      return getAllCookiesResponse.cookies;
   }

   function mneSessionCookie(cookie: Cookie) {
      return cookie.path === '/mne' && cookie.name === 'JSESSIONID';
   }
}

async function writeCookieToFile(cookie: string) {
   return new Promise<void>((resolvePromise, rejectPromise) => {
      const filePath = resolve(tmpdir(), 'cookieheader.json');
      writeFile(filePath, cookie, (error) => {
         if (error) {
            rejectPromise(error);
         } else {
            resolvePromise();
         }
      });
   });
}

function getM3Url() {
   const config = readConfig();
   const m3Url = config.m3Url;
   if (!m3Url || !m3Url.length) {
      throw new Error('No M3 URL is configured.');
   }
   return `${m3Url}/mne/infor`;
}

function getTenantUrl() {
   const config = readConfig();
   const tenantUrl = config.tenantUrl;
   if (!tenantUrl || !tenantUrl.length) {
      throw new Error("No Tenant URL is configured.");
   }
   return tenantUrl;
}
