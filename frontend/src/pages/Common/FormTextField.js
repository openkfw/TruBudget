import React from "react";
import { ErrorMessage } from "formik";

import TextInputWithIcon from "./TextInputWithIcon";

const FormTextField = ({ icon, name, value, error, onChange, onBlur, id, label, ...props }) => {
  return (
    <TextInputWithIcon
      name={name}
      style={{ width: "50%" }}
      label={label}
      value={value}
      margin="normal"
      error={error}
      id={id}
      icon={icon}
      onChange={onChange}
      onBlur={onBlur}
      helperText={<ErrorMessage name={name}>{(msg) => <span style={{ color: "red" }}>{msg}</span>}</ErrorMessage>}
      {...props}
    />
  );
};
export default FormTextField;
