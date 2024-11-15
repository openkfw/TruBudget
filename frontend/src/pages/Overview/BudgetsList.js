import React from "react";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/system";

import { toAmountString } from "../../helper";

const BudgetCircle = styled("span")(() => ({
  width: "1rem",
  height: "1rem",
  borderRadius: "50%",
  backgroundColor: "white",
  marginLeft: "1rem",
  fontSize: "0.625rem",
  textAlign: "center"
}));

const BudgetsList = ({ budgets }) => {
  return (
    <div>
      {budgets.map((b, i) => {
        return (
          <Box
            key={`projectedBudget-${i}`}
            sx={{
              marginBottom: budgets.length === 1 ? 0 : "0.5rem",
              "&:first-of-type": {
                marginTop: budgets.length === 1 ? 0 : "0.5rem"
              }
            }}
          >
            <Tooltip title={b.organization}>
              <Chip
                sx={(theme) => ({
                  color: theme.palette.darkGrey,
                  background: theme.palette.primaryBlue,
                  fontSize: "0.75rem",
                  fontWeight: "400",
                  lineHeight: "140%"
                })}
                icon={
                  <BudgetCircle>
                    <span style={{ marginLeft: "0.05rem" }}>{b.organization.slice(0, 1)}</span>
                  </BudgetCircle>
                }
                label={toAmountString(b.value, b.currencyCode, true)}
              />
            </Tooltip>
          </Box>
        );
      })}
    </div>
  );
};

export default BudgetsList;
