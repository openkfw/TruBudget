import React, { forwardRef, useEffect } from "react";
import { connect } from "react-redux";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon from "@mui/icons-material/Close";
import AppBar from "@mui/material/AppBar";
import Dialog from "@mui/material/Dialog";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slide from "@mui/material/Slide";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { getCurrencies } from "../../helper";
import strings from "../../localizeStrings";

import { closeAnalyticsDialog, getExchangeRates, storeDisplayCurrency } from "./actions";
import SubProjectAnalytics from "./SubProjectAnalytics";

import "./index.scss";

function getMenuItems(currencies) {
  return currencies.map((currency, index) => {
    return (
      <MenuItem key={index} data-test={`currency-menuitem-${currency.value}`} value={currency.value}>
        {currency.primaryText}
      </MenuItem>
    );
  });
}

const Transition = forwardRef((props, ref) => <Slide direction="up" {...props} ref={ref} />);

const SubProjectAnalyticsDialog = ({
  projectId,
  subProjectId,
  open,
  displayCurrency,
  closeAnalyticsDialog,
  storeDisplayCurrency,
  getExchangeRates,
  projectedBudgets,
  subprojectCurrency
}) => {
  // effect hook for displaying SubProject Analytics with (first) project currency
  useEffect(() => {
    if (subprojectCurrency) {
      storeDisplayCurrency(subprojectCurrency);
    }
  }, [storeDisplayCurrency, subprojectCurrency]);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={closeAnalyticsDialog}
      aria-labelledby="responsive-dialog-title"
      TransitionComponent={Transition}
    >
      <AppBar>
        <Toolbar>
          <IconButton
            data-test="close-analytics-button"
            color="inherit"
            onClick={closeAnalyticsDialog}
            aria-label="Close"
            size="large"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" color="inherit">
            {strings.analytics.subproject_analytics}
          </Typography>
          <form autoComplete="off" className="dropdown">
            <FormControl>
              <Select
                variant="standard"
                value={displayCurrency || "EUR"}
                onChange={(e) => {
                  storeDisplayCurrency(e.target.value);
                  getExchangeRates(e.target.value);
                }}
                inputProps={{
                  name: "currencies",
                  id: "currencies"
                }}
                data-test="select-currencies"
                IconComponent={(props) => <ArrowDropDownIcon {...props} className="white-icon" />}
                className="white-currency"
              >
                {getMenuItems(getCurrencies())}
              </Select>
            </FormControl>
          </form>
        </Toolbar>
      </AppBar>
      <div className="dialog-container">
        <SubProjectAnalytics
          projectId={projectId}
          subProjectId={subProjectId}
          projectedBudgets={projectedBudgets}
          getExchangeRates={getExchangeRates}
        />
      </div>
    </Dialog>
  );
};

const mapStateToProps = (state) => {
  return {
    open: state.getIn(["analytics", "dialogOpen"]),
    displayCurrency: state.getIn(["analytics", "currency"]),
    subprojectCurrency: state.getIn(["analytics", "subproject", "currency"])
  };
};
const mapDispatchToProps = {
  closeAnalyticsDialog,
  storeDisplayCurrency,
  getExchangeRates
};
export default connect(mapStateToProps, mapDispatchToProps)(SubProjectAnalyticsDialog);
