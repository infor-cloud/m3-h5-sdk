import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

export interface LoginOptions {
   config: string;
}

interface RawIonApiConfig {
   /**
    * Tenant
    */
   ti: string;
   /**
    * Application name
    */
   cn: string;
   dt: string;
   /**
    * client_id
    */
   ci: string;
   /**
    * client_secret
    */
   cs: string;
   /**
    * ION API host
    */
   iu: string;
   /**
    * Auth provider URL
    */
   pu: string;
   /**
    * Authorization path
    */
   oa: string;
   ot: string;
   or: string;
   /**
    * redirect_uri
    */
   ru: string;
   ev: string;
   v: string;
}

class IonApiConfig {
   constructor(private data: RawIonApiConfig) { }

   getTenant() {
      return this.data.ti;
   }

   getClientId() {
      return this.data.ci;
   }

   getRedirectUri() {
      return this.data.ru;
   }

   getIonApiUrl() {
      return path.join(this.data.iu, this.getTenant());
   }

   getAuthUrl() {
      const url = new URL(path.join(this.data.pu, this.data.oa));
      url.searchParams.set('client_id', this.getClientId());
      url.searchParams.set('redirect_uri', this.getRedirectUri());
      url.searchParams.set('response_type', 'token');
      return url.toString();
   }
}

const WINDOW_WIDTH = 500;
const WINDOW_HEIGHT = 600;

export async function login(options: LoginOptions) {
   const config = readIonApiConfig(options.config);
   console.log('A browser will pop up where you will be asked to sign in and approve the authorization request.');
   const browser = await puppeteer.launch({
      headless: false,
      args: [
         `--app=${config.getAuthUrl()}`,
         `--window-size=${WINDOW_WIDTH},${WINDOW_HEIGHT}`,
      ],
      defaultViewport: {
         width: WINDOW_WIDTH,
         height: WINDOW_HEIGHT,
      },
   });
   const [page] = await browser.pages();
   const token = await waitForAccessToken(page, config);
   await page.goto('TODO-CONFIGURE-URL-TO-M3/mne');
   await page.waitFor(10000);
   const cookies = await waitForMneCookies(page);
   console.log('Cookies:', cookies);
   await browser.close();
   writeTokenToFile(token);
   writeCookiesToFile(cookies);
}

async function waitForAccessToken(page: puppeteer.Page, config: IonApiConfig): Promise<Token> {
   // Wait for the redirect after successful login
   const response = await page.waitForResponse(resp => resp.headers().location?.startsWith(config.getRedirectUri()), { timeout: 0 });
   // Redirect URI looks like: configuredRedirectUri/#access_token=....&token_type=...expires_in=...
   const hash = (new URL(response.headers().location)).hash;
   const redirectParams: Record<string, string> = hash.replace(/^#/, '').split('&').reduce((params, keyvalueString) => {
      const [key, value] = keyvalueString.split('=');
      return { ...params, [key]: value };
   }, {});
   return redirectParams as unknown as Token;
}

function writeTokenToFile(token: Token) {
   // File paths & content should match mtauth.ts
   const filePath = path.resolve(os.tmpdir(), 'authorizationheader.json');
   const content = {
      authorizationHeader: `${token.token_type} ${token.access_token}`,
      // expirationTimestamp: token.expires_in,
   };
   fs.writeJsonSync(filePath, content);
}

function writeCookiesToFile(cookies: puppeteer.Cookie[]) {
   // File paths & content should match mtauth.ts
   const filePath = path.resolve(os.tmpdir(), 'cookieheader.json');
   const content = cookies.map(({ name, value }) => `${name}=${value};`).join(' ');
   fs.writeFileSync(filePath, content);
}

function readIonApiConfig(configPath: string): IonApiConfig {
   const data: RawIonApiConfig = fs.readJSONSync(configPath);
   return new IonApiConfig(data);
}

interface Token {
   access_token: string;
   token_type: string;
   expires_in: string;
}

async function waitForMneCookies(page: puppeteer.Page): Promise<puppeteer.Cookie[]> {
   return new Promise<puppeteer.Cookie[]>((resolvePromise, rejectPromise) => {
      const intervalId = setInterval(async () => {
         try {
            const cookies = await getAllCookies(page);
            const sessionCookie = cookies.find(mneSessionCookie);
            if (sessionCookie) {
               clearInterval(intervalId);
               resolvePromise(cookies);
            }
         } catch (error) {
            clearInterval(intervalId);
            rejectPromise(error);
         }
      }, 1000);
   });

   async function getAllCookies(_page: puppeteer.Page): Promise<puppeteer.Cookie[]> {
      const getAllCookiesResponse = await (_page as any)._client.send('Network.getAllCookies');
      return getAllCookiesResponse.cookies;
   }

   function mneSessionCookie(cookie: puppeteer.Cookie) {
      return cookie.path === '/mne' && cookie.name === 'JSESSIONID';
   }
}
