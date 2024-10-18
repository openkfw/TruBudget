import React from "react";

import TextInput from "./TextInput";

import "./index.scss";

const Identifier = (props) => {
  return (
    <div className="identifier">
      <TextInput
        label={props.nameLabel}
        value={props.name}
        onChange={props.nameOnChange}
        data-test={props.commentId || "nameinput"}
        disabled={props.disabled}
      />

      <TextInput
        label={props.commentLabel}
        value={props.comment}
        onChange={props.commentOnChange}
        multiline={true}
        data-test={props.commentId || "commentinput"}
        disabled={props.disabled}
      />
    </div>
  );
};

export default Identifier;
