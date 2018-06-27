import React from "react";

import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import ContentAdd from "@material-ui/icons/Add";
import HistoryIcon from "@material-ui/icons/Reorder";

import SubProjectTable from "./SubProjectTable";

const SubProjects = props => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%"
      }}
    >
      <Card>
        <SubProjectTable {...props} />
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
          onClick={() => props.openHistory(props.projectId)}
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
