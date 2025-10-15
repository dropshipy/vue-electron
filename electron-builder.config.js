require("dotenv").config({ override: false });

const brand = process.env.APP_NAME || "tiksender"

const config = {
  appId: brand === "tiksender" ? "com.shopeepowertools.app" : "com.shopeeblast.app",
  productName: brand === 'tiksender' ? 'Shopee Power Tools App' : 'Shopeeblast App',
  directories: {
    buildResources: "./app-electron/assets/icons"
  },
  files: [
    "**/*"
  ],
  extraResources: [
    {
      "from": "resources/chrome",
      "to": "chrome"
    }
  ],
  win: {
    icon: `./app-electron/assets/icons/logo-${brand}.ico`,
    target: 'nsis',
    publish: [
      {
        provider: 'github',
        owner: 'dropshipy',
        repo: process.env.REPO || (brand === 'tiksender' ? 'vue-electron' : 'shopee-app-supsel')
      }
    ]
  },
  mac: {
    icon: `./app-electron/assets/icons/logo-${brand}.icns`,
    target: 'dmg',
    publish: [
      {
        provider: 'github',
        owner: 'dropshipy',
        repo: process.env.REPO || (brand === 'tiksender' ? 'shopee-app-mac' : 'shopee-app-supsel-mac')
      }
    ]
  },
};

module.exports = config;
