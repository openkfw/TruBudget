import { expect } from "chai";
import { safeIdSchema, safePasswordSchema, safeStringSchema } from "./joiValidation";
import * as Joi from "joi";

const safeStringSchemaSchema = Joi.alternatives([safeStringSchema]);
const safeIdSchemaSchema = Joi.alternatives([safeIdSchema]);
const safePasswordSchemaSchema = Joi.alternatives([safePasswordSchema]);

describe("JoiValidation: Password", () => {
  it("Accept a correct Passwords", async () => {
    const pass = "Test1234";
    const controlValue = "Test1234";

    const { value, error } = Joi.validate(pass, safePasswordSchemaSchema);

    expect(value).to.equal(controlValue);
    expect(error).to.equal(null);
  });

  it("Should not accept a weak Password", async () => {
    const pass = "asdfasdf";

    const { value, error } = Joi.validate(pass, safePasswordSchemaSchema);

    expect(value).to.equal(undefined);
    expect(error.message).to.contain("fails to match the required pattern:");
  });

  it("Should not accept a short Password", async () => {
    const pass = "Test123";

    const { value, error } = Joi.validate(pass, safePasswordSchemaSchema);

    expect(value).to.equal(undefined);
    expect(error.message).to.contain("length must be at least 8 characters long");
  });

  it("Should not accept a Password with malicious code", async () => {
    const pass = "Test1234<script>";

    const { value } = Joi.validate(pass, safePasswordSchemaSchema);

    expect(value).to.equal("Test1234");
  });

  it("Should accept user creation with a correct Password", async () => {
  });
});

describe("JoiValidation: safe String", () => {
  it("Accept a safe String", async () => {
    const text = "Test 1234";
    const controlValue = "Test 1234";

    const { value, error } = Joi.validate(text, safeStringSchemaSchema);

    expect(value).to.equal(controlValue);
    expect(error).to.equal(null);
  });

  it("Accept orthographic characters string", async () => {
    const text = "Test–1234»«„“”''''";
    const controlValue = "Test–1234»«„“”''''";

    const { value, error } = Joi.validate(text, safeStringSchemaSchema);

    expect(value).to.equal(controlValue);
    expect(error).to.equal(null);
  });

  it("Accept a safe string with non latin characters 1/2", async () => {
    const text = "დამატებითი ინფორმაცია";
    const controlValue = "დამატებითი ინფორმაცია";
    const { value, error } = Joi.validate(text, safeStringSchemaSchema);
    expect(value).to.equal(controlValue);
    expect(error).to.equal(null);
  });

  it("Accept a safe string with non latin characters 2/2", async () => {
    const text = "صباح الخير";
    const controlValue = "صباح الخير";
    const { value, error } = Joi.validate(text, safeStringSchemaSchema);
    expect(value).to.equal(controlValue);
    expect(error).to.equal(null);
  });


  it("Not accept a malicious string", async () => {
    const text = "Test<script>alert(1)</script>1234";

    const { value } = Joi.validate(text, safeStringSchemaSchema);

    expect(value).to.equal("Test1234");
  });

  it("Accept a string including apostrophes", async () => {
    const text = "Test '1234' it`s an \"example\"";

    const { value, error } = Joi.validate(text, safeStringSchema);

    expect(value).to.equal(text);
    expect(error).to.equal(null);
  });

  it("Accept a safe Id", async () => {
    const text = "Test1234";
    const controlValue = "Test1234";

    const { value, error } = Joi.validate(text, safeIdSchemaSchema);

    expect(value).to.equal(controlValue);
    expect(error).to.equal(null);
  });

  it("Not accept a malicious Id", async () => {
    const text = "Test<script> alert(1) </script>1234";
    const { value } = Joi.validate(text, safeIdSchemaSchema);
    expect(value).to.equal("Test1234");
  });
});
