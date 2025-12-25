const fs = require("fs");
const path = require("path");
const os = require("os");

const androidDir = path.join(__dirname, "..", "android");
const localPropertiesPath = path.join(androidDir, "local.properties");

function getAndroidSdkPath() {
  // Check ANDROID_HOME or ANDROID_SDK_ROOT environment variables first
  if (process.env.ANDROID_HOME) {
    return process.env.ANDROID_HOME;
  }
  if (process.env.ANDROID_SDK_ROOT) {
    return process.env.ANDROID_SDK_ROOT;
  }

  // Default locations based on OS
  const homeDir = os.homedir();
  if (process.platform === "win32") {
    return path.join(homeDir, "AppData", "Local", "Android", "Sdk");
  } else if (process.platform === "darwin") {
    return path.join(homeDir, "Library", "Android", "sdk");
  } else {
    return path.join(homeDir, "Android", "Sdk");
  }
}

function main() {
  const sdkPath = getAndroidSdkPath();

  // Create android directory if it doesn't exist
  if (!fs.existsSync(androidDir)) {
    fs.mkdirSync(androidDir, { recursive: true });
    console.log("Created android directory");
  }

  // Convert path to use forward slashes or escaped backslashes for local.properties
  const sdkPathForProperties = sdkPath.replace(/\\/g, "\\\\");

  const localPropertiesContent = `sdk.dir=${sdkPathForProperties}\n`;

  fs.writeFileSync(localPropertiesPath, localPropertiesContent);
  console.log(`Created local.properties with sdk.dir=${sdkPath}`);
}

main();
