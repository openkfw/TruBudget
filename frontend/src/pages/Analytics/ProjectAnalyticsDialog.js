import { FormControl, MenuItem, Select } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import Slide from "@material-ui/core/Slide";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import CloseIcon from "@material-ui/icons/Close";
import React from "react";
import { connect } from "react-redux";

import { getCurrencies } from "../../helper";
import { closeAnalyticsDialog, getExchangeRates, storeProjectCurrency } from "./actions";
import ProjectAnalytics from "./ProjectAnalytics";

const styles = {
  container: {
    marginTop: "68px"
  },
  toolbar: {
    display: "flex"
  },
  dropdown: {
    marginLeft: "auto",
    marginTop: "0"
  }
};

function getMenuItems(currencies) {
  return currencies.map((currency, index) => {
    return (
      <MenuItem key={index} value={currency.value}>
        {currency.primaryText}
      </MenuItem>
    );
  });
}

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

const ProjectAnalyticsDialog = ({
  projectId,
  open,
  projectCurrency,
  closeAnalyticsDialog,
  storeProjectCurrency,
  getExchangeRates
}) => (
  <Dialog
    fullScreen
    open={open}
    onClose={closeAnalyticsDialog}
    aria-labelledby="responsive-dialog-title"
    TransitionComponent={Transition}
  >
    <AppBar>
      <Toolbar style={styles.toolbar}>
        <IconButton color="inherit" onClick={closeAnalyticsDialog} aria-label="Close">
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" color="inherit">
          Project Analytics
        </Typography>
        <form autoComplete="off" style={styles.dropdown}>
          <FormControl>
            <Select
              value={projectCurrency || "EUR"}
              onChange={e => {
                storeProjectCurrency(e.target.value);
                getExchangeRates(e.target.value);
              }}
              inputProps={{
                name: "currencies",
                id: "currencies"
              }}
              IconComponent={props => <ArrowDropDownIcon {...props} style={{ color: "white" }} />}
              style={{ color: "white" }}
            >
              {getMenuItems(getCurrencies())}
            </Select>
          </FormControl>
        </form>
      </Toolbar>
    </AppBar>
    <div style={styles.container}>
      <ProjectAnalytics projectId={projectId} />
    </div>
  </Dialog>
);

const mapStateToProps = state => {
  return {
    open: state.getIn(["analytics", "dialogOpen"]),
    projectCurrency: state.getIn(["analytics", "project", "currency"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    closeAnalyticsDialog: () => dispatch(closeAnalyticsDialog()),
    storeProjectCurrency: currency => dispatch(storeProjectCurrency(currency)),
    getExchangeRates: currency => dispatch(getExchangeRates(currency))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectAnalyticsDialog);
