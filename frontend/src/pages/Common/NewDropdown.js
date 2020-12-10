import React, { useState } from "react";
import strings from "../../localizeStrings";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import ActionButton from "./ActionButton";
import CloseIcon from "@material-ui/icons/Close";

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
  }
};

const Dropdown = props => {
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
    errorText
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <form autoComplete="off" style={formStyle}>
      <div style={styles.flexContainer}>
        <FormControl disabled={disabled} style={style} data-test={`dropdown-${id}`} error={error || false}>
          <InputLabel htmlFor={id}>{floatingLabel}</InputLabel>
          <Select
            value={value}
            onChange={v => {
              if (v.target.value) {
                onChange(v.target.value);
              }
            }}
            open={isOpen}
            onOpen={() => setIsOpen(true)}
            onClick={() => setIsOpen(false)}
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
                  data-test={"close-select"}
                  onClick={() => setIsOpen(false)}
                  title={strings.common.close}
                  iconButtonStyle={{ width: 15, height: 15 }}
                  icon={<CloseIcon style={styles.closeButtonSize} />}
                />
              </div>
            </div>
            {children}
          </Select>
          <FormHelperText>{error ? errorText : ""}</FormHelperText>
        </FormControl>
      </div>
    </form>
  );
};

export default Dropdown;
