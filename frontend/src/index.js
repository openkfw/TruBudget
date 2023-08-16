import React from "react";
import { createRoot } from "react-dom/client";

import "./logging/console";

import TraceProvider from "./utils/telemetry/tracing";
import App from "./App";

const root = createRoot(document.getElementById("root"));

root.render(
  <TraceProvider>
    <App />
  </TraceProvider>
);
