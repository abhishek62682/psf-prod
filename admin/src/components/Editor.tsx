import { useMemo, useRef } from "react";
import JoditEditor from "jodit-react";
import "jodit/es2021/jodit.min.css";

interface EditorProps {
  content: string;
  setContent: (html: string) => void;
  placeholder?: string;
}

export default function Editor({ content, setContent, placeholder = "Start typing..." }: EditorProps) {
  const editor = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder,
      height: 220,
      // Force every inserted link to open safely in a new tab.
      link: {
        processVideoLink: false,
        openInNewTabCheckbox: true,
        noFollowCheckbox: true,
      },
      buttons: [
        "bold", "italic", "underline", "|",
        "ul", "ol", "|",
        "link", "image", "|",
        "align", "|",
        "undo", "redo",
      ],
      toolbarAdaptive: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
    }),
    [placeholder]
  );

  return (
    <JoditEditor
      ref={editor}
      value={content}
      config={config}
      onBlur={(newContent) => setContent(newContent)}
    />
  );
}
