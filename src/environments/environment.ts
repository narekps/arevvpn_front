// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  APP_NAME: 'ArevVPN',
  APP_SLOGAN: 'Вечная связь. Без границ.',
  API_URL: 'http://vpn.ru',
  CAPTCHA_ENABLED: true,
  CAPTCHA_SITEKEY: 'ysc1_7etY8dIbr1ev0dXBI6wNyYcmyOI0z3T3EtH5MVGr2579ab3f',
  TOAST_DURATION: 3000,
  TOAST_ERROR_DURATION: 10000,

  SUPPORT_MAIL: 'help@arevvpn.ru',
  TRIAL_PERIOD_DAYS: 5,

  TELEGRAM: {
    BOT_NAME: 'test_ArevVPNbot',
    SUPPORT_USERNAME: 'ArevVPNSupport',
  },

  HAPP: {
    Android: "https://play.google.com/store/apps/details?id=com.happproxy",
    AndroidAPK: "https://github.com/Happ-proxy/happ-android/releases/latest/download/Happ.apk",
    IOS: "https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973",
    MacOS: "https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973?platform=mac",
    Windows: "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/setup-Happ.x64.exe",
    LinuxDeb: "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/Happ.linux.x64.deb",
    LinuxRpm: "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/Happ.linux.x64.rpm",
    LinuxPkg: "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/Happ.linux.x64.pkg.tar.zst",
    AndroidTV: "https://play.google.com/store/apps/details?id=com.happproxy",
    AppleTV: "https://apps.apple.com/us/app/happ-proxy-utility-for-tv/id6748297274",
  },

  IP: {
    NAME: 'ИП Погосян Нарек Суренович',
    INN: '501813774951',
    OGRNIP: '325774600252975',
    ADDRESS: 'г. Видное, ул. Сухановская, д. 23, кв. 214',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

