import React, { useState } from "react";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningOutlinedIcon from "@mui/icons-material/WarningOutlined";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Tooltip from "@mui/material/Tooltip";

export const CustomInfoTooltip = ({ title, iconType = "info" }) => {
  const [open, setOpen] = useState(false);

  const handleTooltipOpen = () => {
    setOpen(true);
  };
  const handleTooltipClose = () => {
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <Tooltip
        title={title}
        onOpen={handleTooltipOpen}
        onClose={handleTooltipClose}
        open={open}
        disableFocusListener
        disableHoverListener
      >
        {iconType === "info" ? (
          <InfoOutlinedIcon className="help-icon" onClick={handleTooltipOpen} />
        ) : (
          <WarningOutlinedIcon className="help-icon" onClick={handleTooltipOpen} />
        )}
      </Tooltip>
    </ClickAwayListener>
  );
};
