const PROXY_CONFIG = {
   '/ca': {
      'target': '{M3_PLACEHOLDER}',
      'secure': false,
      'changeOrigin': true,
      'logLevel': 'debug'
   },
   '/m3api-rest': {
      'target': '{M3_PLACEHOLDER}',
      'secure': false,
      'changeOrigin': true,
      'logLevel': 'debug'
   },
   '/mne': {
      'target': '{M3_PLACEHOLDER}',
      'secure': false,
      'changeOrigin': true,
      'logLevel': 'debug'
   },
   '/ODIN_DEV_TENANT': {
      'target': '{IONAPI_PLACEHOLDER}',
      'secure': false,
      'changeOrigin': true,
      'pathRewrite': {
         '^/ODIN_DEV_TENANT': ''
      },
      'logLevel': 'debug'
   }
};

module.exports = PROXY_CONFIG;
