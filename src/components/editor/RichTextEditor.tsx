"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import { createLowlight, common } from "lowlight";
import { useRef, useState } from "react";

const lowlight = createLowlight(common);

const LANGUAGES = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
];

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarBtn({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-xs font-medium transition ${
        active
          ? "bg-indigo-600 text-white"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="mx-1 h-4 w-px bg-zinc-700" />;
}

type RichTextEditorProps = {
  name: string;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string;
};

export default function RichTextEditor({
  name,
  placeholder = "Write your content...",
  disabled = false,
  defaultValue = "",
}: RichTextEditorProps) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [, setTick] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    content: defaultValue,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: "plaintext" }),
      Placeholder.configure({ placeholder }),
    ],
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "rich-editor min-h-[200px] px-3 py-3 text-sm text-zinc-200 focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      if (hiddenRef.current) {
        const html = editor.getHTML();
        hiddenRef.current.value = html === "<p></p>" ? "" : html;
      }
      setTick((t) => t + 1);
    },
    onSelectionUpdate() {
      setTick((t) => t + 1);
    },
    onTransaction() {
      setTick((t) => t + 1);
    },
  });

  const inCodeBlock = editor?.isActive("codeBlock") ?? false;
  const codeLanguage =
    editor?.getAttributes("codeBlock").language ?? "plaintext";

  return (
    <div
      className={`overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 focus-within:border-indigo-500 ${
        disabled ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-800 bg-zinc-950/40 px-1.5 py-1">
        {/* Text style */}
        <ToolbarBtn
          onClick={() => editor?.chain().focus().toggleBold().run()}
          // active={editor?.isActive("bold")}
          title="Bold"
        >
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          // active={editor?.isActive("italic")}
          title="Italic"
        >
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          // active={editor?.isActive("underline")}
          title="Underline"
        >
          <span className="underline">U</span>
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          // active={editor?.isActive("strike")}
          title="Strikethrough"
        >
          <span className="line-through">S</span>
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor?.chain().focus().toggleCode().run()}
          // active={editor?.isActive("code")}
          title="Inline code"
        >
          {"<>"}
        </ToolbarBtn>

        <Sep />

        {/* Headings */}
        <ToolbarBtn
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
          // active={editor?.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          H1
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          // active={editor?.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
          // active={editor?.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarBtn>

        <Sep />

        {/* Lists & blocks */}
        <ToolbarBtn
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          // active={editor?.isActive("bulletList")}
          title="Bullet list"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="2" cy="4" r="1.3" />
            <rect x="5" y="3.3" width="9" height="1.4" rx="0.7" />
            <circle cx="2" cy="8" r="1.3" />
            <rect x="5" y="7.3" width="9" height="1.4" rx="0.7" />
            <circle cx="2" cy="12" r="1.3" />
            <rect x="5" y="11.3" width="9" height="1.4" rx="0.7" />
          </svg>
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          // active={editor?.isActive("orderedList")}  
          title="Ordered list"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
            <text x="0" y="5.5" fontSize="5" fontFamily="monospace">1.</text>
            <rect x="5" y="3.3" width="9" height="1.4" rx="0.7" />
            <text x="0" y="9.5" fontSize="5" fontFamily="monospace">2.</text>
            <rect x="5" y="7.3" width="9" height="1.4" rx="0.7" />
            <text x="0" y="13.5" fontSize="5" fontFamily="monospace">3.</text>
            <rect x="5" y="11.3" width="9" height="1.4" rx="0.7" />
          </svg>
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          // active={editor?.isActive("blockquote")}
          title="Blockquote"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 3.5a1 1 0 011-1h2.5a1 1 0 011 1V7a1 1 0 01-1 1H3.5L2 10V3.5zM9 3.5a1 1 0 011-1h2.5a1 1 0 011 1V7a1 1 0 01-1 1h-2L9 10V3.5z" />
          </svg>
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          // active={editor?.isActive("codeBlock")}
          title="Code block"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 4L1 8l4 4M11 4l4 4-4 4" />
          </svg>
        </ToolbarBtn>

        {/* Language dropdown — only when cursor is in a code block */}
        {inCodeBlock && (
          <>
            <Sep />
            <select
              value={codeLanguage}
              onChange={(e) =>
                editor
                  ?.chain()
                  .focus()
                  .updateAttributes("codeBlock", { language: e.target.value })
                  .run()
              }
              className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 outline-none focus:border-indigo-500 cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Hidden input carries the HTML into FormData on submit */}
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={defaultValue} />
    </div>
  );
}
