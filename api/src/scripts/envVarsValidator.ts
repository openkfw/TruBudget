import { envVarsSchema } from "../envVarsSchema";

const { error } = envVarsSchema.validate(process.env, { abortEarly: false });
if (error) {
  console.log(error.message);
} else {
  console.log("[]");
}
