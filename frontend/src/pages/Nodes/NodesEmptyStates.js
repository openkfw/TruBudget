import React from "react";

import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";

const NewOrganizationsEmptyState = () => {
  return (
    <table className="empty-state-table">
      <tbody>
        <tr>
          <td width="200vw">
            <img
              src="images-for-empty-state/organization-empty-state.png"
              alt={strings.common.no_organizations}
              width="150vw"
            />
          </td>
          <td>
            <Typography variant="body2" className="caption">
              {strings.common.no_organizations}
            </Typography>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const ExistingNodesEmptyState = () => {
  return (
    <table className="empty-state-table">
      <tbody>
        <tr>
          <td width="200vw">
            <img
              src="images-for-empty-state/nodes-for-orga-empty-state.png"
              alt={strings.common.no_nodes}
              width="150vw"
            />
          </td>
          <td>
            <Typography variant="body2" className="caption">
              {strings.common.no_nodes}
            </Typography>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const DeclinedNodesEmptyState = () => {
  return (
    <table className="empty-state-table">
      <tbody>
        <tr>
          <td width="200vw">
            <img
              src="images-for-empty-state/nodes-for-orga-empty-state.png"
              alt="No declined nodes found"
              width="150vw"
            />
          </td>
          <td>
            <Typography variant="body2" className="caption">
              No declined nodes found
            </Typography>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export { NewOrganizationsEmptyState, ExistingNodesEmptyState, DeclinedNodesEmptyState };
