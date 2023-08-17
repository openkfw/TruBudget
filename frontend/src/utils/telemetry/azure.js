import React from "react";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { createBrowserHistory } from "history";
const browserHistory = createBrowserHistory({ basename: "" });
let reactPlugin = new ReactPlugin();
// *** Add the Click Analytics plug-in. ***
/* var clickPluginInstance = new ClickAnalyticsPlugin();
   var clickPluginConfig = {
     autoCapture: true
}; */
let appInsights = new ApplicationInsights({
  config: {
    connectionString: "<APP INSIGHTS CONNECTION STRING>",
    // *** If you're adding the Click Analytics plug-in, delete the next line. ***
    extensions: [reactPlugin],
    // *** Add the Click Analytics plug-in. ***
    // extensions: [reactPlugin, clickPluginInstance],
    extensionConfig: {
      [reactPlugin.identifier]: { history: browserHistory }
      // *** Add the Click Analytics plug-in. ***
      // [clickPluginInstance.identifier]: clickPluginConfig
    }
  }
});
appInsights.loadAppInsights();

export default function AzureTelemetry({ children }) {
  return <>{children}</>;
}
