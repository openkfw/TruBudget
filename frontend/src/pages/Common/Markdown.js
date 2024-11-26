import React from "react";
import {
  BoldItalicUnderlineToggles,
  CreateLink,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  MDXEditor,
  quotePlugin,
  toolbarPlugin,
  UndoRedo
} from "@mdxeditor/editor";

import strings from "../../localizeStrings";

import "@mdxeditor/editor/style.css";

const Markdown = ({ text, onChangeFunc, readOnly, paste, clipboard }) => {
  const ref = React.useRef(null);
  return (
    <>
      {clipboard ? (
        <button
          onClick={() => {
            ref.current?.focus(() => ref.current?.insertMarkdown(clipboard));
            paste();
          }}
        >
          {strings.clipboard.paste}
        </button>
      ) : null}
      <MDXEditor
        ref={ref}
        markdown={text || ""}
        onChange={onChangeFunc}
        readOnly={readOnly}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          linkDialogPlugin(),
          linkPlugin(),
          quotePlugin(),
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
          })
        ]}
      />
    </>
  );
};

export default Markdown;
