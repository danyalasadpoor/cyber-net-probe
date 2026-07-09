import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.netwatch.pro",
  appName: "NetWatch Pro",
  webDir: "dist",
  backgroundColor: "#050816",
  android: {
    allowMixedContent: true,
  },
  plugins: {
    CapacitorSQLite: {
      androidIsEncryption: false,
      androidBiometric: { biometricAuth: false },
    },
  },
};

export default config;
