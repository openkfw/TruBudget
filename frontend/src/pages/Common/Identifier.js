import React, { Component } from "react";

import TextInput from "./TextInput";

const styles = {
  inputDiv: {
    marginTop: 15,
    marginBottom: 15,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  }
};

class Identifier extends Component {
  render() {
    return (
      <div style={styles.inputDiv}>
        <TextInput
          label={this.props.nameLabel}
          value={this.props.name}
          onChange={this.props.nameOnChange}
          data-test={this.props.commentId || "nameinput"}
          disabled={this.props.disabled}
        />

        <TextInput
          label={this.props.commentLabel}
          value={this.props.comment}
          onChange={this.props.commentOnChange}
          multiline={true}
          data-test={this.props.commentId || "commentinput"}
          disabled={this.props.disabled}
        />
      </div>
    );
  }
}

export default Identifier;
