import React from "react";
import { connect } from "react-redux";
import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";

import { closeAnalyticsDialog } from "./actions";
import ProjectAnalytics from "./ProjectAnalytics";

const styles = {
  container: {
    marginTop: "68px"
  }
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

const ProjectAnalyticsDialog = ({ projectId, open, closeAnalyticsDialog }) => (
  <Dialog
    fullScreen
    open={open}
    onClose={closeAnalyticsDialog}
    aria-labelledby="responsive-dialog-title"
    TransitionComponent={Transition}
  >
    <AppBar>
      <Toolbar>
        <IconButton color="inherit" onClick={closeAnalyticsDialog} aria-label="Close">
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" color="inherit">
          Project Analytics
        </Typography>
      </Toolbar>
    </AppBar>
    <div style={styles.container}>
      <ProjectAnalytics projectId={projectId} />
    </div>
  </Dialog>
);

const mapStateToProps = state => {
  return { open: state.getIn(["analytics", "dialogOpen"]) };
};

const mapDispatchToProps = { closeAnalyticsDialog };

export default connect(mapStateToProps, mapDispatchToProps)(ProjectAnalyticsDialog);
