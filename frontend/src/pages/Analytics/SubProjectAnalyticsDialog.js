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
import { closeAnalyticsDialog, getExchangeRates, storeDisplayCurrency } from "./actions";
import SubProjectAnalytics from "./SubProjectAnalytics";

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

const SubProjectAnalyticsDialog = ({
  projectId,
  subProjectId,
  open,
  displayCurrency,
  closeAnalyticsDialog,
  storeDisplayCurrency,
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
      <Toolbar>
        <IconButton color="inherit" onClick={closeAnalyticsDialog} aria-label="Close">
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" color="inherit">
          Subproject Analytics
        </Typography>
        <form autoComplete="off" style={styles.dropdown}>
          <FormControl>
            <Select
              value={displayCurrency || "EUR"}
              onChange={e => {
                storeDisplayCurrency(e.target.value);
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
      <SubProjectAnalytics projectId={projectId} subProjectId={subProjectId} />
    </div>
  </Dialog>
);

const mapStateToProps = state => {
  return {
    open: state.getIn(["analytics", "dialogOpen"]),
    displayCurrency: state.getIn(["analytics", "currency"])
  };
};
const mapDispatchToProps = {
  closeAnalyticsDialog,
  storeDisplayCurrency,
  getExchangeRates
};
export default connect(mapStateToProps, mapDispatchToProps)(SubProjectAnalyticsDialog);
