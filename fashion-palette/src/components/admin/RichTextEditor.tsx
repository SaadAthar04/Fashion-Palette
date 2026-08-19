"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Link2, Undo2, Redo2, RemoveFormatting, Eye, Pencil } from "lucide-react";

// Final feedback B3: safe rich-text editor for product descriptions. Headings,
// bold/italic, bullet + numbered lists, links, undo/redo, clear formatting and a
// preview. Output HTML is sanitized again server-side on save. Dependency-free
// (uses the built-in editing commands) so it works on desktop and mobile.
export default function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState(false);

  // Initialise once from the incoming value; afterwards the DOM is the source of
  // truth (avoids caret jumps on every keystroke).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    ref.current?.focus();
    emit();
  };

  const addLink = () => {
    const url = window.prompt("Link URL (https://…)");
    if (url) exec("createLink", url);
  };

  const Btn = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} title={title} className="p-2 hover:bg-white rounded text-primary/80 hover:text-accent transition-colors">
      {children}
    </button>
  );

  return (
    <div className="border border-border/60 rounded">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-surface px-1.5 py-1">
        <Btn onClick={() => exec("formatBlock", "H2")} title="Heading"><Heading2 className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec("formatBlock", "H3")} title="Subheading"><Heading3 className="w-4 h-4" /></Btn>
        <span className="w-px h-5 bg-border mx-1" />
        <Btn onClick={() => exec("bold")} title="Bold"><Bold className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec("italic")} title="Italic"><Italic className="w-4 h-4" /></Btn>
        <span className="w-px h-5 bg-border mx-1" />
        <Btn onClick={() => exec("insertUnorderedList")} title="Bullet list"><List className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec("insertOrderedList")} title="Numbered list"><ListOrdered className="w-4 h-4" /></Btn>
        <Btn onClick={addLink} title="Insert link"><Link2 className="w-4 h-4" /></Btn>
        <span className="w-px h-5 bg-border mx-1" />
        <Btn onClick={() => exec("removeFormat")} title="Clear formatting"><RemoveFormatting className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec("undo")} title="Undo"><Undo2 className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec("redo")} title="Redo"><Redo2 className="w-4 h-4" /></Btn>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-primary/80 hover:text-accent"
        >
          {preview ? <><Pencil className="w-3.5 h-3.5" /> Edit</> : <><Eye className="w-3.5 h-3.5" /> Preview</>}
        </button>
      </div>

      {preview ? (
        <div
          className="prose prose-sm max-w-none p-4 min-h-[160px] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h2]:font-semibold [&_h3]:font-semibold text-[13px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: value || "<p class='text-muted'>Nothing to preview yet.</p>" }}
        />
      ) : (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          className="p-4 min-h-[160px] text-[13px] leading-relaxed focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h2]:font-semibold [&_h2]:text-base [&_h3]:font-semibold [&_h3]:text-sm"
        />
      )}
    </div>
  );
}
