import React, { Component } from "react";

import TextInput from "./TextInput";

import "./index.scss";

class Identifier extends Component {
  render() {
    return (
      <div className="identifier">
        <TextInput
          label={this.props.nameLabel}
          value={this.props.name}
          onChange={this.props.nameOnChange}
          data-test={this.props.commentId || "nameinput"}
          disabled={this.props.disabled}
          maxLengthValue={75}
        />

        <TextInput
          label={this.props.commentLabel}
          value={this.props.comment}
          onChange={this.props.commentOnChange}
          multiline={true}
          data-test={this.props.commentId || "commentinput"}
          disabled={this.props.disabled}
          maxLengthValue={75}
        />
      </div>
    );
  }
}

export default Identifier;
