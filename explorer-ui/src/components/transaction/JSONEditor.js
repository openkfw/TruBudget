import React, { Component } from "react";
import Box from "@mui/material/Box";
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";

export default class JSONEditorDemo extends Component {
  componentDidMount() {
    const options = {
      mode: "view",
      //   onChangeJSON: this.props.onChangeJSON,
    };

    this.jsoneditor = new JSONEditor(this.container, options);
    this.jsoneditor.set(this.props.json);
  }

  componentWillUnmount() {
    if (this.jsoneditor) {
      this.jsoneditor.destroy();
    }
  }

  componentDidUpdate() {
    this.jsoneditor.update(this.props.json);
  }

  render() {
    return (
      <Box
        sx={{ width: "100%", height: "100%" }}
        ref={(elem) => (this.container = elem)}
      />
    );
  }
}
