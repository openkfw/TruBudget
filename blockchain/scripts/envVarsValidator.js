const { envVarsSchema } = require("../src/envVarsSchema");

const { error } = envVarsSchema.validate(process.env, { abortEarly: false });
if (error) {
  console.log(`Config validation error: ${error.message}`);
} else {
  console.log("Environment variables are valid.");
}
