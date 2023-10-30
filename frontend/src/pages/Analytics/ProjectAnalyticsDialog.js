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
  },
  loadingCharts: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "center"
  }
};

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

const ProjectAnalyticsDialog = ({
  projectId,
  open,
  displayCurrency,
  closeAnalyticsDialog,
  storeDisplayCurrency,
  getExchangeRates,
  projectProjectedBudgets
}) => {
  // effect hook for displaying Project Analytics with (first) project currency
  useEffect(() => {
    if (projectProjectedBudgets[0]?.currencyCode) {
      storeDisplayCurrency(projectProjectedBudgets[0]?.currencyCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectProjectedBudgets[0]?.currencyCode, storeDisplayCurrency, open]);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={closeAnalyticsDialog}
      aria-labelledby="responsive-dialog-title"
      TransitionComponent={Transition}
    >
      <AppBar>
        <Toolbar style={styles.toolbar}>
          <IconButton
            color="inherit"
            onClick={closeAnalyticsDialog}
            data-test="close-analytics-button"
            aria-label="Close"
            size="large"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" color="inherit">
            {strings.analytics.project_analytics}
          </Typography>
          <form autoComplete="off" style={styles.dropdown}>
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
                IconComponent={(props) => <ArrowDropDownIcon {...props} style={{ color: "white" }} />}
                style={{ color: "white" }}
              >
                {getMenuItems(getCurrencies())}
              </Select>
            </FormControl>
          </form>
        </Toolbar>
      </AppBar>
      <div style={styles.container}>
        <ProjectAnalytics
          projectId={projectId}
          totalBudget={projectProjectedBudgets}
          getExchangeRates={getExchangeRates}
        />
      </div>
    </Dialog>
  );
};

const mapStateToProps = (state) => {
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

export default connect(mapStateToProps, mapDispatchToProps)(ProjectAnalyticsDialog);
