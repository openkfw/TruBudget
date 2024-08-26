import * as dotenv from "dotenv";
// Load environment variables
dotenv.config();

import config from "../config";

if (config()) {
  console.log("Environment variables are valid");
}
