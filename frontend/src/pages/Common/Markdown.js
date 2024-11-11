import React from "react";
import {
  BoldItalicUnderlineToggles,
  CreateLink,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  MDXEditor,
  toolbarPlugin,
  UndoRedo
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";

const Markdown = ({ markdown, onChangeFunc }) => {
  return (
    <MDXEditor
      markdown={markdown || "TODO: TABLE VIEW EDIT FAILS"}
      onChange={(markdown) => onChangeFunc(markdown)}
      plugins={[
        toolbarPlugin({
          toolbarContents: () => (
            <>
              {" "}
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <ListsToggle />
              <CreateLink />
            </>
          )
        }),
        linkDialogPlugin(),
        listsPlugin(),
        linkPlugin()
      ]}
    />
  );
};

export default Markdown;
