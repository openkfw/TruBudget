import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import React from "react";
import { toAmountString } from "../../helper";

const BudgetsList = ({ budgets }) => {
  return (
    <div>
      {budgets.map((b, i) => {
        return (
          <Box
            key={`projectedBudget-${i}`}
            sx={{
              marginBottom: "8px"
            }}
          >
            <Tooltip title={b.organization}>
              <Chip
                avatar={<Avatar>{b.organization.slice(0, 1)}</Avatar>}
                label={toAmountString(b.value, b.currencyCode)}
              />
            </Tooltip>
          </Box>
        );
      })}
    </div>
  );
};

export default BudgetsList;
