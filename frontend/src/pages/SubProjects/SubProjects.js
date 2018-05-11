import React from "react";
import Card from "material-ui/Card";
import Button from "material-ui/Button";
import ContentAdd from "@material-ui/icons/Add";
import HistoryIcon from "@material-ui/icons/Reorder";

import { ACMECorpLightgreen, ACMECorpDarkBlue } from "../../colors.js";
// import ChangeLog from "../Notifications/ChangeLog";

import SubProjectsTable from "./SubProjectsTable";
// import SubProjectCreation from "./SubProjectCreation";

const SubProjects = props => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%"
      }}
    >
      <Card>
        {/* <SubProjectCreation {...props} /> */}

        <SubProjectsTable {...props} />
        {/* <ChangeLog {...props} /> */}
      </Card>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          alignItems: "center",
          top: "16px",
          right: "-26px"
        }}
      >
        <Button
          disabled={!props.canCreateSubProject}
          onClick={props.showSubprojectDialog}
          variant="fab"
          color="primary"
          style={{
            position: "relative",
            zIndex: 20
          }}
        >
          <ContentAdd />
        </Button>
        <Button
          mini={true}
          onClick={() => props.openHistory()}
          variant="fab"
          style={{
            position: "relative",
            marginTop: "8px"
          }}
        >
          <HistoryIcon />
        </Button>
      </div>
    </div>
  );
};

export default SubProjects;
