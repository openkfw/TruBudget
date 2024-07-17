import React, { useCallback, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import { Link } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

import strings from "../../localizeStrings";

import ActionButton from "./ActionButton";

import "./NewDropdown.scss";

const Dropdown = (props) => {
  const {
    value,
    children,
    id = "default",
    floatingLabel,
    onChange,
    style,
    disabled,
    error,
    errorText,
    className,
    formClassName,
    clearableSelection
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const resetSelection = useCallback(() => {
    onChange("");
    setIsOpen(false);
    return false;
  }, [onChange]);

  return (
    <form className={formClassName} autoComplete="off">
      <div className="dropdown-container">
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
            <div className="dropdown-close-button-container">
              {!!clearableSelection && (
                <div>
                  <Link onClick={resetSelection} component="button" underline="none">
                    {strings.common.clear_selection}
                  </Link>
                </div>
              )}

              <div className="close-button">
                <ActionButton
                  ariaLabel="close"
                  data-test={"close-select"}
                  onClick={() => setIsOpen(false)}
                  title={strings.common.close}
                  className="icon-button-style"
                  icon={<CloseIcon className="close-button-size" />}
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
