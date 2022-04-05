import React from "react";

import { makeStyles } from "@mui/styles";
import Fab from "@mui/material/Fab";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Zoom from "@mui/material/Zoom";

const useStyles = makeStyles(theme => ({
  root: {
    position: "fixed",
    bottom: theme.spacing(5),
    right: theme.spacing(5)
  }
}));

const ScrollTop = props => {
  const { window } = props;
  const classes = useStyles();

  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100
  });

  const handleClick = event => {
    const anchor = (event.target.ownerDocument || document).querySelector("#back-to-top");

    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <Zoom in={trigger}>
      <Fab
        color="primary"
        aria-label="scroll back to top"
        data-test="backToTop-button"
        onClick={handleClick}
        className={classes.root}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
};

export default ScrollTop;
