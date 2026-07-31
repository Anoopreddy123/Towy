const fs = require('fs');
const path = require('path');

const shimDir = path.join(__dirname, '..', 'node_modules', 'react-native-worklets');
const pluginFile = path.join(shimDir, 'plugin.js');
const packageFile = path.join(shimDir, 'package.json');

// Create directory if it doesn't exist
if (!fs.existsSync(shimDir)) {
  fs.mkdirSync(shimDir, { recursive: true });
}

// Create plugin.js shim
fs.writeFileSync(pluginFile, "module.exports = require('react-native-worklets-core/plugin');\n");

// Create package.json for the shim
const packageJson = {
  name: "react-native-worklets",
  // Reanimated 4.1.x validates `react-native-worklets` version in the 0.5.x–0.8.x range.
  // This is a shim that forwards to react-native-worklets-core; keep it in a compatible semver range.
  version: "0.8.0",
  description: "Shim package that forwards to react-native-worklets-core (for Reanimated compatibility).",
  license: "MIT",
  main: "plugin.js",
  private: true
};
fs.writeFileSync(packageFile, JSON.stringify(packageJson, null, 2) + '\n');

console.log('✅ Created react-native-worklets shim');

