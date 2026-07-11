import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.netwatchpro",
  appName: "NetWatch Pro",
  webDir: "dist",
  backgroundColor: "#050816",
  android: {
    allowMixedContent: true,
  },
};

export default config;
