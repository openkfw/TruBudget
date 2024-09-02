import config from "../config";

try {
  config();
  console.log("Environment variables are valid");
} catch (error) {
  console.error("Environment variables are not valid");
  console.error(error);
  process.exit(1);
}
