import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React from "react";

const styles = {
  actionButton: {
    width: "25%"
  },
  hide: {
    opacity: 0
  }
};

const ActionButton = ({
  notVisible,
  onClick,
  icon,
  title,
  id,
  // eslint-disable-next-line no-useless-computed-key
  ["data-test"]: dataTest,
  iconButtonStyle,
  iconButtonClassName,
  alignTooltip = "bottom-end"
}) => {
  const disabled = notVisible;
  return (
    <div style={styles.actionButton}>
      <Tooltip
        id={"tooltip-" + title}
        title={notVisible ? "" : title}
        disableFocusListener={disabled}
        disableHoverListener={disabled}
        disableTouchListener={disabled}
        placement={alignTooltip}
      >
        <div>
          <IconButton
            onClick={onClick}
            style={notVisible ? { ...styles.hide } : iconButtonStyle}
            className={notVisible ? null : iconButtonClassName}
            disabled={disabled}
            data-test={dataTest}
            id={id}
            size="large"
          >
            {icon}
          </IconButton>
        </div>
      </Tooltip>
    </div>
  );
};

export default ActionButton;
