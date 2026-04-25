"use client";

import { useEffect, useId, useRef } from "react";

type RayEditorFieldProps = {
  name: string;
  placeholder?: string;
  fieldHintClassName?: string;
  textareaClassName?: string;
  initialValue?: string;
};

export function RayEditorField({
  name,
  placeholder,
  fieldHintClassName,
  textareaClassName,
  initialValue,
}: RayEditorFieldProps) {
  // Stable unique ID for the container element
  const reactId = useId();
  const containerId = `ray-editor-${reactId.replace(/:/g, "")}`;
  const hiddenRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    let destroyed = false;
    let editorInstance: { getContent(): string; destroy(): void } | null = null;

    import("@rohanyeole/ray-editor").then(({ RayEditor }) => {
      if (destroyed) return;

      const editor = new RayEditor(containerId, {
        theme: "light",
        markdownShortcuts: true,
        slashCommands: true,
        wordCount: true,
        toolbar: [
          ["bold", "italic", "underline", "strikethrough", "highlight"],
          ["headings", "blockquote", "callout"],
          ["orderedList", "unorderedList", "taskList"],
          ["codeBlock", "link", "table", "hr"],
          ["undo", "redo", "removeFormat", "markdownToggle", "showSource"],
        ],
        onChange: (html: string) => {
          if (hiddenRef.current) {
            hiddenRef.current.value = html;
          }
        },
      });

      editorInstance = editor;

      // Apply placeholder text via CSS data-placeholder if the API provides it
      const container = document.getElementById(containerId);
      if (container && placeholder) {
        const content = container.querySelector("[contenteditable]") as HTMLElement | null;
        if (content) {
          content.dataset.placeholder = placeholder;
        }
      }

      if (initialValue) {
        editor.setContent(initialValue);
        if (hiddenRef.current) {
          hiddenRef.current.value = initialValue;
        }
      }
    });

    return () => {
      destroyed = true;
      if (editorInstance) {
        try {
          editorInstance.destroy();
        } catch {
          // ignore
        }
        editorInstance = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={textareaClassName}>
      {/* Container div — Ray Editor mounts itself here using containerId */}
      <div id={containerId} style={{ minHeight: "22rem" }} />
      {/* Hidden input that carries the HTML to the Server Action */}
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={initialValue ?? ""} />
      {fieldHintClassName ? (
        <span className={fieldHintClassName}>
          Rich text editor — use the toolbar or type <code>/</code> for slash
          commands. Supports headings, lists, code blocks, tables, callouts and
          more.
        </span>
      ) : null}
    </div>
  );
}
