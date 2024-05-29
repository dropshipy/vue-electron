require("dotenv").config();
const { join } = require("path");

module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: [join(__dirname, "resources", "chrome")],
    // icon: `./app-electron/assets/icons/logo-${process.env.APP_NAME}`,
    icon: `./app-electron/assets/icons/logo-supportseller`, // "tiksender" || "supportseller"
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["win32", "darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
  ],
};
