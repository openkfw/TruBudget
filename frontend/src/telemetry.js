import { ClickAnalyticsPlugin } from "@microsoft/applicationinsights-clickanalytics-js";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";

import config from "./config";

const azureMonitorConnString =
  window?.injectedEnv?.REACT_APP_APPLICATIONINSIGHTS_CONNECTION_STRING || config.telemetry.azureMonitorConnectionString;

const clickPluginInstance = new ClickAnalyticsPlugin();
const clickPluginConfig = {
  autoCapture: true
};

export const reactPlugin = new ReactPlugin();

export let appInsights = null;

if (config.envMode === "production" && azureMonitorConnString) {
  appInsights = new ApplicationInsights({
    config: {
      connectionString: azureMonitorConnString,
      enableAutoRouteTracking: true,
      extensions: [reactPlugin, clickPluginInstance],
      extensionConfig: {
        [clickPluginInstance.identifier]: clickPluginConfig
      }
      // enableDebug: true
    }
  });
  appInsights.loadAppInsights();
  appInsights.trackPageView();
}
