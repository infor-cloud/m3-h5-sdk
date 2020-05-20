import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { readConfig, writeConfig } from '../utils';

export interface LoginOptions {
   ionApiConfig: string;
   m3Url?: string;
   updateConfig?: boolean;
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
      return urlJoin(this.data.iu, this.getTenant());
   }

   getAuthUrl() {
      const url = new URL(urlJoin(this.data.pu, this.data.oa));
      url.searchParams.set('client_id', this.getClientId());
      url.searchParams.set('redirect_uri', this.getRedirectUri());
      url.searchParams.set('response_type', 'token');
      return url.toString();
   }
}

const WINDOW_WIDTH = 500;
const WINDOW_HEIGHT = 600;

export async function login(options: LoginOptions) {
   const config = readIonApiConfig(options.ionApiConfig);
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
   console.log('Waiting for ION API Token');
   const token = await waitForAccessToken(page, config);
   writeTokenToFile(token);
   console.log('Got ION API token');
   if (options.m3Url) {
      console.log(`Visiting '${options.m3Url}/mne' to get session cookie`);
      await page.goto(`${options.m3Url}/mne`);
      const cookies = await waitForMneCookies(page);
      writeCookiesToFile(cookies);
      console.log('Got M3 session cookie');
   }
   if (options.updateConfig) {
      console.log('Updating odin.json');
      updateOdinConfig(config, options.m3Url);
      console.log('odin.json has been updated');
   }
   await browser.close();

   if (options.m3Url) {
      console.log('Login successful! You can now run "odin serve --multi-tenant"');
   } else {
      console.log('Login successful! You can now run "odin serve --multi-tenant --ion-api"');
   }
}

function updateOdinConfig(ionApiConfig: IonApiConfig, m3Url?: string) {
   const odinConfig = readConfig();
   const ionTarget = setTarget('/ODIN_DEV_TENANT', ionApiConfig.getIonApiUrl());
   ionTarget.pathRewrite = { '^/ODIN_DEV_TENANT': '' };
   if (m3Url) {
      setTarget('/m3api-rest', m3Url);
      setTarget('/mne', m3Url);
      setTarget('/ca', m3Url);
   } else {
      setTarget('/m3api-rest', ionApiConfig.getIonApiUrl());
   }
   writeConfig(odinConfig);

   function setTarget(proxyPath: string, target: string) {
      console.log(`Update target ${proxyPath} -> ${target}`);
      const config = getPathConfig(proxyPath);
      config.target = target;
      return config;
   }

   function getPathConfig(proxyPath: string) {
      if (odinConfig.proxy && !Array.isArray(odinConfig.proxy)) {
         const pathConfig = odinConfig.proxy[proxyPath];
         if (typeof pathConfig !== 'string') {
            return pathConfig;
         }
      }
      throw new Error(`Could not get proxy config for path ${proxyPath}`);
   }
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

function urlJoin(...segments: string[]): string {
   return segments.map(segment => segment.replace(/(^\/|\/$)/g, '')).join('/');
}
