import React from "react";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

const styles = {
  actionButton: {
    width: "25%"
  },
  hide: {
    opacity: 0
  }
};

const ActionButton = ({
  ariaLabel,
  notVisible,
  onClick,
  icon,
  title = "",
  id,
  // eslint-disable-next-line no-useless-computed-key
  ["data-test"]: dataTest,
  iconButtonStyle,
  alignTooltip = "bottom-end"
}) => {
  const disabled = notVisible;
  const tooltipAlignAttributes = Array.isArray(alignTooltip)
    ? {
        slotProps: {
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: alignTooltip
                }
              }
            ]
          }
        }
      }
    : { placement: alignTooltip };

  return (
    <div style={styles.actionButton}>
      <Tooltip
        id={"tooltip-" + title}
        title={notVisible ? "" : title}
        disableFocusListener={disabled || title === ""}
        disableHoverListener={disabled || title === ""}
        disableTouchListener={disabled || title === ""}
        {...tooltipAlignAttributes}
      >
        <div>
          <IconButton
            aria-label={ariaLabel}
            onClick={onClick}
            style={notVisible ? { ...styles.hide } : iconButtonStyle}
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
