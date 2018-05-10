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
          helperText={this.props.nameHintText}
          value={this.props.name}
          onChange={this.props.nameOnChange}
          aria-label="nameinput"
        />

        <TextInput
          label={this.props.commentLabel}
          helperText={this.props.commentHintText}
          value={this.props.comment}
          onChange={this.props.commentOnChange}
          multiLine={true}
          aria-label="commentinput"
        />
      </div>
    );
  }
}

export default Identifier;
