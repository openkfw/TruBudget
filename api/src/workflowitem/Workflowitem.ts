import Joi = require("joi");

export interface Workflowitem {
  id: string;
  creationUnixTs: string;
  displayName: string;
  exchangeRate?: string;
  billingDate?: string;
  amount?: string;
  currency?: string;
  amountType: "N/A" | "disbursed" | "allocated";
  description: string;
  status: "open" | "closed";
  assignee?: string;
  documents?: Document[];
}

const schema = Joi.object().keys({
  id: Joi.string().required(),
  creationUnixTs: Joi.date().timestamp("unix").required(),
  displayName: Joi.string().required(),
  exchangeRate?: Joi.string(),
  //TODO set proper date format
  billingDate?: Joi.string(),
  amount?: Joi.string(),
  currency?: Joi.string(),
  amountType: Joi.string().valid("N/A" , "disbursed" , "allocated"),
  description: string,
  status: "open" | "closed",
  assignee?: string,
  documents?: Document[],
});
