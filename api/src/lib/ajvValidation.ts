import Ajv from "ajv";
import { isProductionEnvironment } from "config";
import * as sanitizeHtml from "sanitize-html";

export const addValidationFormats = (ajv: Ajv): void => {
  ajv.addFormat("safeStringFormat", {
    type: "string",
    validate: (str) =>
      str.trim().match(/^([\p{L}\p{N}\p{P}\p{M}\p{S}\p{Zs}]*)$/u) != null && str.length <= 250,
  });

  ajv.addFormat("safeStringWithEmptyFormat", {
    type: "string",
    validate: (str) =>
      str === "" || str.trim().match(/^([\p{L}\p{N}\p{P}\p{M}\p{S}\p{Zs}]*)$/u) != null,
  });

  ajv.addFormat("safeIdFormat", {
    type: "string",
    validate: (id) =>
      sanitizeHtml(id.trim()).match(/^([A-Za-zÀ-ÿ0-9-_]*)$/) != null && id.length <= 50,
  });

  ajv.addFormat("safePasswordFormat", {
    type: "string",
    validate: (pwd) =>
      isProductionEnvironment()
        ? sanitizeHtml(pwd.trim(), {
            allowedTags: [],
            allowedAttributes: {},
          }).match(/^(?=.*[A-Za-zÀ-ÿ].*)(?=.*[0-9].*)([A-Za-zÀ-ÿ0-9-_!?@#$&*,.:/()[\] ])*$/) !=
            null && pwd.length >= 8
        : typeof sanitizeHtml(pwd.trim()) === "string",
  });

  ajv.addFormat("notificationIdFormat", {
    type: "string",
    validate: (id) => id.length <= 36,
  });

  ajv.addFormat("projectIdFormat", {
    type: "string",
    validate: (id) => id.length <= 32,
  });
  ajv.addFormat("subprojectIdFormat", {
    type: "string",
    validate: (id) => id.length <= 32,
  });
  ajv.addFormat("workflowitemIdFormat", {
    type: "string",
    validate: (id) => id.length <= 32,
  });
  ajv.addFormat("userRecordIdFormat", {
    type: "string",
    validate: (id) => id.length <= 32,
  });
  ajv.addFormat("moneyAmountFormat", {
    type: "string",
    validate: (a) => a.match(/^-?\s?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/) != null,
  });
  ajv.addFormat("conversionRateFormat", {
    type: "string",
    validate: (c) => c.match(/^[0-9]+(\.[0-9]+)?$/) != null,
  });
  ajv.addFormat("base64DocumentFormat", {
    type: "string",
    validate: (b) => b.length <= 67000000,
  });
};
