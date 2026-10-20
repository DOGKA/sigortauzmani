"use client";

import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState } from "react";
import "./blog-editor.css";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

type Mode = "visual" | "html";

export default function RichEditor({ value, onChange }: RichEditorProps) {
  const [mode, setMode] = useState<Mode>("visual");
  const [html, setHtml] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image.configure({ allowBase64: false }),
      TableKit.configure({ table: { resizable: false } }),
    ],
    content: value,
    editorProps: { attributes: { class: "blog-editor__content" } },
    onUpdate: ({ editor: current }) => {
      const next = current.getHTML();
      setHtml(next);
      onChange(next);
    },
  });

  function switchMode(next: Mode) {
    if (next === mode || !editor) return;
    if (next === "visual") editor.commands.setContent(html, { emitUpdate: false });
    else setHtml(editor.getHTML());
    setMode(next);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setUploadError(null);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/blog/gorsel", { method: "POST", body: form });
    const data = await response.json();
    setUploading(false);
    if (!response.ok) {
      setUploadError(data.error ?? "Görsel yüklenemedi.");
      return;
    }
    const alt = window.prompt("Görselin kısa açıklaması (erişilebilirlik ve SEO için):", "") ?? "";
    if (mode === "html") {
      const tag = `<img src="${data.url}" alt="${alt.replace(/"/g, "&quot;")}">`;
      const next = `${html}\n<p>${tag}</p>`;
      setHtml(next);
      onChange(next);
      return;
    }
    editor?.chain().focus().setImage({ src: data.url, alt }).run();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-sky-400 focus-within:ring-3 focus-within:ring-sky-100">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        {mode === "visual" && editor && <Toolbar editor={editor} />}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-50"
        >
          {uploading ? "Yükleniyor…" : "Görsel ekle"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void uploadImage(file);
          }}
        />
        <div className="ml-auto flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
          {(["visual", "html"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => switchMode(item)}
              className={`rounded-md px-2.5 py-1 ${mode === item ? "bg-sky-600 text-white" : "text-slate-500 hover:text-slate-700"}`}
            >
              {item === "visual" ? "Görsel" : "HTML"}
            </button>
          ))}
        </div>
      </div>

      {uploadError && <p className="border-b border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">{uploadError}</p>}

      {mode === "visual" ? (
        <EditorContent editor={editor} />
      ) : (
        <textarea
          value={html}
          onChange={(event) => {
            setHtml(event.target.value);
            onChange(event.target.value);
          }}
          spellCheck={false}
          className="block min-h-[520px] w-full resize-y bg-slate-950 p-4 font-mono text-[13px] leading-6 text-slate-100 outline-none"
        />
      )}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      link: e.isActive("link"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      table: e.isActive("table"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Bağlantı adresi (boş bırakırsanız kaldırılır):", previous ?? "https://");
    if (url === null) return;
    if (!url.trim() || url.trim() === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  const chain = () => editor.chain().focus();

  return (
    <>
      <Tool label="Başlık 2" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
        H2
      </Tool>
      <Tool label="Başlık 3" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
        H3
      </Tool>
      <Divider />
      <Tool label="Kalın" active={state.bold} onClick={() => chain().toggleBold().run()}>
        <b>B</b>
      </Tool>
      <Tool label="İtalik" active={state.italic} onClick={() => chain().toggleItalic().run()}>
        <i>I</i>
      </Tool>
      <Tool label="Altı çizili" active={state.underline} onClick={() => chain().toggleUnderline().run()}>
        <u>U</u>
      </Tool>
      <Tool label="Bağlantı" active={state.link} onClick={setLink}>
        Link
      </Tool>
      <Divider />
      <Tool label="Madde listesi" active={state.bullet} onClick={() => chain().toggleBulletList().run()}>
        • Liste
      </Tool>
      <Tool label="Numaralı liste" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}>
        1. Liste
      </Tool>
      <Tool label="Alıntı" active={state.quote} onClick={() => chain().toggleBlockquote().run()}>
        “ ”
      </Tool>
      <Divider />
      {state.table ? (
        <>
          <Tool label="Satır ekle" onClick={() => chain().addRowAfter().run()}>+ Satır</Tool>
          <Tool label="Sütun ekle" onClick={() => chain().addColumnAfter().run()}>+ Sütun</Tool>
          <Tool label="Satırı sil" onClick={() => chain().deleteRow().run()}>− Satır</Tool>
          <Tool label="Sütunu sil" onClick={() => chain().deleteColumn().run()}>− Sütun</Tool>
          <Tool label="Tabloyu sil" onClick={() => chain().deleteTable().run()}>Tabloyu sil</Tool>
        </>
      ) : (
        <Tool
          label="Tablo ekle"
          onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          Tablo
        </Tool>
      )}
      <Divider />
      <Tool label="Geri al" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
        ↶
      </Tool>
      <Tool label="Yinele" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
        ↷
      </Tool>
    </>
  );
}

function Tool({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`min-w-8 rounded-lg px-2 py-1.5 text-xs font-semibold transition disabled:opacity-30 ${
        active ? "bg-sky-100 text-sky-700" : "text-slate-600 hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />;
}
