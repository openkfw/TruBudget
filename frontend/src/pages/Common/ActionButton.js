import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
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
  // eslint-disable-next-line no-useless-computed-key
  ["data-test"]: dataTest,
  iconButtonStyle
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
      >
        <div>
          <IconButton
            onClick={onClick}
            style={notVisible ? { ...styles.hide } : iconButtonStyle}
            disabled={disabled}
            data-test={dataTest}
          >
            {icon}
          </IconButton>
        </div>
      </Tooltip>
    </div>
  );
};

export default ActionButton;
