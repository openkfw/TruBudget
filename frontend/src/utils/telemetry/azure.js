import React from "react";
import { ClickAnalyticsPlugin } from "@microsoft/applicationinsights-clickanalytics-js";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { createBrowserHistory } from "history";

const browserHistory = createBrowserHistory({ basename: "" });
let reactPlugin = new ReactPlugin();

// *** Add the Click Analytics plug-in. ***
const clickPluginInstance = new ClickAnalyticsPlugin();
const clickPluginConfig = {
  autoCapture: true,
  dataTags: {
    useDefaultContentNameOrId: true
  }
};
let appInsights = new ApplicationInsights({
  config: {
    // TODO don't want to leave connString visible in repo
    connectionString: "CONNECTION_STRING_HERE",
    // *** Add the Click Analytics plug-in. ***
    extensions: [reactPlugin, clickPluginInstance],
    extensionConfig: {
      [reactPlugin.identifier]: { history: browserHistory },
      // *** Add the Click Analytics plug-in. ***
      [clickPluginInstance.identifier]: clickPluginConfig
    }
  }
});
appInsights.loadAppInsights();

export default function AzureTelemetry({ children }) {
  return <>{children}</>;
}
