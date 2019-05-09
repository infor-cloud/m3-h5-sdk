const fs = require('fs-extra');
const path = require('path');

checkIONAPIAuthentication = function (proxyResponse, incomingMessage, serverResponse) {
   const authResponse = proxyResponse.headers['www-authenticate'];
   if (authResponse && authResponse.includes('error')) {
      console.log('ION API authentication failed ' + authResponse);
      // Force update of reading tokenfile
      tokenExpirationTimestamp = new Date();
      return false;
   }
   return true;
};

readAuthHeaderFile = function () {
   const projectRoot = process.cwd();
   const filePath = path.resolve(projectRoot, 'authorizationheader.json');
   try {
      return fs.readJsonSync(filePath);
   }
   catch (error) {
      console.log('The ION API Token file not found. ' + error);
      return undefined;
   }
}

var tokenExpirationTimestamp = new Date();
var tokenIONAPI = '';

setIONAPIToken = function (clientRequest, incomingMessage, serverResponse) {
   if (new Date() >= tokenExpirationTimestamp) {
      console.log('Authorization header file must be read.')
      const json = readAuthHeaderFile();
      if (json) {
         try {
            tokenIONAPI = json.authorizationHeader;
            tokenExpirationTimestamp = new Date(json.expirationTimestamp);
            console.log('Header = ' + tokenIONAPI);
            console.log('Expires = ' + tokenExpirationTimestamp);
         }
         catch (error) {
            console.log('Failed to access the ION API Token . ' + error);
         }
      }
      else {
         console.log('The ION API Token is missing.')
      }
   }
   try {
      clientRequest.setHeader('Authorization', tokenIONAPI);
   }
   catch (error) {
      console.log('Failed to set the ION API Token to the Authorization header. ' + error);
   }
};

readCookieHeaderFile = function () {
   const projectRoot = process.cwd();
   const filePath = path.resolve(projectRoot, 'cookieheader.json');
   console.log('readCookieHeader: filepath: ' + filePath);
   try {
      return fs.readFileSync(filePath).toString();
   }
   catch (error) {
      console.log('The ION API Token file not found. ' + error);
      return undefined;
   }
}

var mneCookies = '';
var validCookies = false;
setMNECookies = function (clientRequest, incomingMessage, serverResponse) {
   if (!validCookies) {
      console.log('Cookie header file must be read.');
      const cookieString = readCookieHeaderFile();
      console.log('Cookie = ' + cookieString);
      if (cookieString) {
         mneCookies = cookieString;
         validCookies = true;
      }
   }

   try {
      clientRequest.setHeader('cookie', mneCookies);
   }
   catch (error) {
      console.log('Failed to set the cookies to the Cookie header. ' + error);
      mneCookies = '';
      validCookies = false;
   }
}

onError = function (src, err, response) {
   console.log('onError ' + src + ' ' + new Date().toTimeString());
   console.log(err);
}

const PROXY_CONFIG = [
   {
      context: ['/ca'],
      target: 'https://qac-ionapi.qac.awsdev.infor.com/M3DEVAPPFSH_TST',
      secure: false,
      changeOrigin: true,
      logLevel: 'debug',
      pathRewrite: {
         '^/ca': '/IDM'
      },
      onProxyReq: function (proxyReq, req, res) {
         setIONAPIToken(proxyReq);
      },
      onProxyRes: function (proxyReq, req, res) {
         checkIONAPIAuthentication(proxyReq);
      },
      onError: function (err, req, res) {
         onError('IDM-REST', err, res);
      }
   },
   {
      context: ['/mne'],
      target: 'https://m3devapp.m3cedev.awsdev.infor.com',
      secure: false,
      changeOrigin: true,
      logLevel: 'debug',
      onProxyReq: function (proxyReq, req, res) {
         setMNECookies(proxyReq);
      },
      onError: function (err, req, res) {
         onError('MNE', err, res);
         validCookies = false;
      }
   },
   {
      context: ['/m3api-rest'],
      target: 'https://qac-ionapi.qac.awsdev.infor.com/M3DEVAPPFSH_TST',
      secure: false,
      changeOrigin: true,
      pathRewrite: {
         '^/m3api-rest': '/M3/m3api-rest'
      },
      logLevel: 'debug',
      onProxyReq: function (proxyReq, req, res) {
         setIONAPIToken(proxyReq, req, res);
      },
      onProxyRes: function (proxyRes, req, res) {
         checkIONAPIAuthentication(proxyRes);
      },
      onError: function (err, req, res) {
         onError('M3API-REST', err, res);
      }
   },
   {
      context: ['/ODIN_DEV_TENANT'],
      target: 'https://qac-ionapi.qac.awsdev.infor.com/M3DEVAPPFSH_TST',
      secure: false,
      changeOrigin: true,
      pathRewrite: {
         '^/ODIN_DEV_TENANT': ''
      },
      logLevel: 'debug',
      onProxyReq: function (proxyReq, req, res) {
         setIONAPIToken(proxyReq);
      },
      onProxyRes: function (proxyRes, req, res) {
         checkIONAPIAuthentication(proxyRes);
      },
      onError: function (err, req, res) {
         onError('ION-API', err, res);
      }
   }
];

module.exports = PROXY_CONFIG;
