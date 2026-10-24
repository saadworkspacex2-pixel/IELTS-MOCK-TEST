"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";

type FormatRange = {
  id: number;
  start: number;
  end: number;
  bold: boolean;
  italic: boolean;
  highlight: string | null;
};
type SelectionBox = { x: number; y: number; start: number; end: number } | null;

type FormatAction =
  | { kind: "bold" }
  | { kind: "italic" }
  | { kind: "highlight"; color: string | null };

const HIGHLIGHT_COLORS = [
  { value: "#FDE68A", label: "হলুদ" },
  { value: "#BBF7D0", label: "সবুজ" },
  { value: "#BFDBFE", label: "নীল" },
  { value: "#FBCFE8", label: "গোলাপি" },
  { value: "#FED7AA", label: "কমলা" },
];

const sameStyle = (a: Omit<FormatRange, "id" | "start" | "end">, b: Omit<FormatRange, "id" | "start" | "end">) =>
  a.bold === b.bold && a.italic === b.italic && a.highlight === b.highlight;

const hasStyle = (style: Omit<FormatRange, "id" | "start" | "end">) => style.bold || style.italic || Boolean(style.highlight);

export default function HighlightablePassage({ text }: { text: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [formats, setFormats] = useState<FormatRange[]>([]);
  const [selection, setSelection] = useState<SelectionBox>(null);

  const onSelect = () => {
    const browserSelection = window.getSelection();
    const root = container.current;
    if (!browserSelection || !root || browserSelection.isCollapsed || browserSelection.rangeCount === 0) {
      setSelection(null);
      return;
    }
    const range = browserSelection.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }
    const chosen = range.toString();
    if (chosen.trim().length < 1) {
      setSelection(null);
      return;
    }
    const before = range.cloneRange();
    before.selectNodeContents(root);
    before.setEnd(range.startContainer, range.startOffset);
    const start = before.toString().length;
    const end = start + chosen.length;
    const rect = range.getBoundingClientRect();
    setSelection({
      x: clamp(rect.left + rect.width / 2, 114, window.innerWidth - 114),
      y: rect.top < 72 ? rect.bottom + 10 : rect.top - 48,
      start,
      end,
    });
  };

  const applyFormat = (action: FormatAction) => {
    if (!selection) return;
    const { start, end } = selection;
    const allSelectedHave = (key: "bold" | "italic") => {
      const breaks = new Set<number>([start, end]);
      formats.forEach((format) => {
        if (format.end > start && format.start < end) {
          breaks.add(Math.max(start, format.start));
          breaks.add(Math.min(end, format.end));
        }
      });
      const sorted = [...breaks].sort((a, b) => a - b);
      return sorted.slice(0, -1).every((point, index) => {
        const current = formats.find((format) => format.start <= point && format.end >= sorted[index + 1]);
        return Boolean(current?.[key]);
      });
    };
    const toggledValue = action.kind === "bold" || action.kind === "italic" ? !allSelectedHave(action.kind) : false;

    setFormats((previous) => {
      const boundaries = new Set<number>([0, text.length, start, end]);
      previous.forEach((format) => {
        boundaries.add(format.start);
        boundaries.add(format.end);
      });
      const points = [...boundaries].sort((a, b) => a - b);
      const next: FormatRange[] = [];
      for (let index = 0; index < points.length - 1; index += 1) {
        const from = points[index];
        const to = points[index + 1];
        if (to <= from) continue;
        const current = previous.find((format) => format.start <= from && format.end >= to);
        const style = {
          bold: current?.bold ?? false,
          italic: current?.italic ?? false,
          highlight: current?.highlight ?? null,
        };
        if (from < end && to > start) {
          if (action.kind === "bold") style.bold = toggledValue;
          if (action.kind === "italic") style.italic = toggledValue;
          if (action.kind === "highlight") style.highlight = action.color;
        }
        if (!hasStyle(style)) continue;
        const last = next[next.length - 1];
        if (last && last.end === from && sameStyle(last, style)) {
          last.end = to;
        } else {
          next.push({ id: Date.now() + index, start: from, end: to, ...style });
        }
      }
      return next;
    });
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const rendered = useMemo((): ReactNode => {
    const nodes: ReactNode[] = [];
    let cursor = 0;
    for (const format of formats) {
      if (format.start > cursor) nodes.push(text.slice(cursor, format.start));
      nodes.push(
        <span
          key={format.id}
          className="rounded-[2px] px-0.5"
          style={{
            backgroundColor: format.highlight ?? undefined,
            fontWeight: format.bold ? 700 : undefined,
            fontStyle: format.italic ? "italic" : undefined,
            boxShadow: format.highlight ? "inset 0 -1px 0 rgba(71,85,105,.22)" : undefined,
          }}
        >
          {text.slice(format.start, format.end)}
        </span>,
      );
      cursor = format.end;
    }
    if (cursor < text.length) nodes.push(text.slice(cursor));
    return nodes;
  }, [formats, text]);

  const selectedFormats = selection
    ? formats.filter((format) => format.end > selection.start && format.start < selection.end)
    : [];
  const boldActive = selectedFormats.length > 0 && selectedFormats.every((format) => format.bold);
  const italicActive = selectedFormats.length > 0 && selectedFormats.every((format) => format.italic);

  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-stone-500">Word-style tools: টেক্সট সিলেক্ট করে <b>B</b>, <i>I</i> অথবা ৫টি রঙের Highlight ব্যবহার করুন</p>
        {formats.length > 0 && (
          <button type="button" onClick={() => { setFormats([]); setSelection(null); }} className="skeuo-key rounded-md px-2.5 py-1 text-[11px] font-bold text-[#6C757D]">
            ফরম্যাট মুছুন
          </button>
        )}
      </div>
      <div
        ref={container}
        onMouseUp={onSelect}
        onTouchEnd={onSelect}
        onKeyUp={onSelect}
        className="whitespace-pre-line text-[16px] font-normal leading-8 text-slate-800 selection:bg-yellow-100"
      >
        {rendered}
      </div>
      {selection && (
        <div
          className="skeuo-key fixed z-[140] flex max-w-[calc(100vw-20px)] items-center gap-1 rounded-xl p-1.5 shadow-xl"
          style={{ left: selection.x, top: selection.y, transform: "translateX(-50%)" }}
          role="toolbar"
          aria-label="নির্বাচিত টেক্সট ফরম্যাট করুন"
        >
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat({ kind: "bold" })} className={`grid h-8 w-8 place-items-center rounded-lg font-serif text-base font-bold ${boldActive ? "bg-slate-900 text-white" : "hover:bg-slate-100"}`} aria-label="Bold">B</button>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat({ kind: "italic" })} className={`grid h-8 w-8 place-items-center rounded-lg font-serif text-base italic ${italicActive ? "bg-slate-900 text-white" : "hover:bg-slate-100"}`} aria-label="Italic">I</button>
          <span className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden="true" />
          {HIGHLIGHT_COLORS.map((color) => (
            <button key={color.value} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat({ kind: "highlight", color: color.value })} className="grid h-8 w-7 place-items-center rounded-lg hover:bg-slate-100" aria-label={`${color.label} হাইলাইট`} title={`${color.label} হাইলাইট`}>
              <span className="h-4 w-4 rounded-sm border border-black/15" style={{ backgroundColor: color.value }} />
            </button>
          ))}
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat({ kind: "highlight", color: null })} className="ml-0.5 rounded-md px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100" title="হাইলাইট সরান">×</button>
        </div>
      )}
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
