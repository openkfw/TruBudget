import React from "react";

import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Fab from "@mui/material/Fab";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Zoom from "@mui/material/Zoom";

const ScrollTop = (props) => {
  const { window } = props;

  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100
  });

  const handleClick = (event) => {
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
        className="scroll-top"
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
};

export default ScrollTop;
