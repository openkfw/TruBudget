import React, { useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

import strings from "../../localizeStrings";

import ActionButton from "./ActionButton";

const styles = {
  closeButtonContainer: {
    marginTop: -8,
    display: "flex",
    justifyContent: "flex-end"
  },
  closeButton: { marginLeft: 10 },
  closeButtonSize: { fontSize: 15 },
  flexContainer: {
    display: "flex",
    height: "100%",
    alignItems: "flex-end"
  },
  itemContainer: { maxHeight: "35vh", overflow: "auto", boxShadow: "none" }
};

const Dropdown = (props) => {
  const {
    value,
    children,
    id = "default",
    floatingLabel,
    onChange,
    style,
    disabled,
    formStyle,
    error,
    errorText,
    className
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <form autoComplete="off" style={formStyle}>
      <div style={styles.flexContainer}>
        <FormControl
          disabled={disabled}
          style={style}
          className={className}
          data-test={`dropdown-${id}`}
          error={error || false}
        >
          <InputLabel>{floatingLabel}</InputLabel>
          <Select
            variant="standard"
            label={floatingLabel}
            value={value}
            onChange={(v) => {
              if (v.target.value) {
                onChange(v.target.value);
                setIsOpen(false);
              }
            }}
            open={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            inputProps={{
              name: id,
              id
            }}
            MenuProps={{
              MenuListProps: {
                "data-test": "dropdown_selectList"
              }
            }}
            SelectDisplayProps={{ "data-test": `dropdown-${id}-click`, "data-disabled": disabled }}
          >
            <div style={styles.closeButtonContainer}>
              <div style={styles.closeButton}>
                <ActionButton
                  ariaLabel="close"
                  data-test={"close-select"}
                  onClick={() => setIsOpen(false)}
                  title={strings.common.close}
                  className="icon-button-style"
                  icon={<CloseIcon style={styles.closeButtonSize} />}
                />
              </div>
            </div>
            {/* TODO refactor to this:
             <Box style={styles.itemContainer}>{children}</Box>

             This way, the DropDown has a maximal height and the close button is visible.
             If you do this, every <MenuItem> must have an onClick method to select itself (see PermissionSelection)
             */}
            {children}
          </Select>
          <FormHelperText>{error ? errorText : ""}</FormHelperText>
        </FormControl>
      </div>
    </form>
  );
};

export default Dropdown;
