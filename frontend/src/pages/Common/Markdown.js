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

const Markdown = ({ text, onChangeFunc }) => {
  return (
    <MDXEditor
      markdown={text || ""}
      onChange={onChangeFunc}
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
