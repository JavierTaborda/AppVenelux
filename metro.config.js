const { getDefaultConfig } = require("expo/metro-config");

const { withNativeWind } = require("nativewind/metro");
const config = getDefaultConfig(__dirname);
//for imports web ignore
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: "./global.css" });