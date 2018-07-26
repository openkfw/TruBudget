import React from "react";

import Divider from "@material-ui/core/Divider";

import strings from "../../localizeStrings";
import ImageSelector from "../Common/ImageSelector";
import Budget from "../Common/Budget";
import Identifier from "../Common/Identifier";
import { toAmountString } from "../../helper";
import UserCreate from "./UserCreate";

const DashboardDialogContent = props => {
  return (
    <UserCreate {...props} />
  );
};

export default DashboardDialogContent;
