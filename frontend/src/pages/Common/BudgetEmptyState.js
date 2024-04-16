import React from "react";

import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";

const BudgetEmptyState = (props) => {
  const { text } = props;
  return (
    <table>
      <tbody>
        <tr height="200vh">
          <td style={{ maxWidth: "200vw" }}>
            <img
              src="/images-for-empty-state/project-budget-empty-state.png"
              alt={strings.common.no_budget}
              width="150vw"
            />
          </td>
          <td>
            <Typography variant="subtitle1" sx={{ color: (theme) => theme.palette.grey.dark }}>
              {strings.common.no_budget}
            </Typography>
            <Typography variant="caption" sx={{ color: (theme) => theme.palette.grey.main }}>
              {text}
            </Typography>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default BudgetEmptyState;
