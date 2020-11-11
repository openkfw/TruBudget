import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";
import React, { useState } from "react";

import { formattedTag } from "../../helper";
import strings from "../../localizeStrings";

const styles = {
  container: {
    marginTop: "15px",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    justifyContent: "center"
  },
  input: {
    margin: "5px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "baseline"
  },
  tags: {
    margin: "5px"
  }
};

const displayTags = (tags, deleteTag) => {
  return tags !== undefined
    ? tags.map((tag, i) => (
        <Chip
          clickable={false}
          key={`${tag}-${i}`}
          label={`#${formattedTag(tag)}`}
          style={{ margin: "1px" }}
          component="span"
          onDelete={() => deleteTag(tag)}
          data-test="tageditor-tag"
        />
      ))
    : null;
};

const handleEnter = (e, action = () => {}) => {
  if (e.charCode === 13) {
    action();
  }
};

function addTagToList(currentTags, newTag, addProjectTag, setInvalidInput, setInvalidInputMessage, changeInput) {
  const validTagRegex = /^([A-Za-zÀ-ÿ0-9])*[A-Za-zÀ-ÿ0-9-_]+$/;
  if (currentTags !== undefined && currentTags.some(tag => formattedTag(tag) === formattedTag(newTag))) {
    setInvalidInputMessage(strings.common.tag_already_exists);
    setInvalidInput(true);
    return;
  }
  if (!validTagRegex.test(newTag)) {
    setInvalidInputMessage(strings.common.invalid_tag);
    setInvalidInput(true);
    return;
  } else {
    addProjectTag(newTag);
    setInvalidInput(false);
    changeInput("");
    return;
  }
}

function TagEditor({ projectTags, addProjectTag, removeProjectTag }) {
  const [input, changeInput] = useState("");
  const [invalidInput, setInvalidInput] = useState(false);
  const [invalidInputMessage, setInvalidInputMessage] = useState(strings.common.tag_already_exists);
  const validTagRegex = /^([A-Za-zÀ-ÿ0-9])*[A-Za-zÀ-ÿ0-9-_]+$/;

  return (
    <div style={styles.container}>
      <div style={styles.input}>
        <TextField
          value={input}
          label={strings.common.tag}
          onKeyPress={e =>
            handleEnter(e, () =>
              addTagToList(projectTags, input, addProjectTag, setInvalidInput, setInvalidInputMessage, changeInput)
            )
          }
          onChange={event => {
            if (event.target.value === "" || validTagRegex.test(event.target.value)) changeInput(event.target.value);
          }}
          multiline={false}
          inputProps={{ maxLength: "15" }}
          style={{ marginRight: "20px" }}
          error={invalidInput}
          helperText={!invalidInput ? strings.common.add_tag_text : invalidInputMessage}
          data-test="taginput"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            addTagToList(projectTags, input, addProjectTag, setInvalidInput, setInvalidInputMessage, changeInput)
          }
          data-test="add-tag-button"
        >
          {strings.common.add}
        </Button>
      </div>
      <div style={styles.tags} data-test="taglist">
        {displayTags(projectTags, value => removeProjectTag(value))}
      </div>
    </div>
  );
}

export default TagEditor;
