// Shared rich-text helpers and reusable editor component for the Admin Panel
// (Blog, Projects, Resume Experience, Resume Volunteering, and Profile About)
// and public detail/section renderers.
// Content is treated as untrusted HTML: only the formatting subset below is
// kept, and every link is validated before rendering.
(function () {
  const ALLOWED_TAGS = new Set([
    "P", "BR", "STRONG", "B", "EM", "I", "U", "H2", "H3",
    "A", "UL", "OL", "LI", "FONT", "DIV", "SPAN",
  ]);
  const DROP_TAGS = new Set([
    "SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "TEMPLATE", "NOSCRIPT",
    "SVG", "MATH", "LINK", "META", "BASE", "FORM", "INPUT", "BUTTON",
    "TEXTAREA", "SELECT", "OPTION", "IMG", "VIDEO", "AUDIO", "SOURCE",
    "TRACK", "CANVAS", "MAP", "AREA", "PICTURE", "XMP", "PLAINTEXT",
    "FRAME", "FRAMESET", "APPLET",
  ]);
  const RICH_TAG_RE = /<\/?(?:p|br|strong|b|em|i|u|h2|h3|a|ul|ol|li|div|span|font)\b[^>]*>/i;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  }

  function isRichHtml(value) {
    return RICH_TAG_RE.test(String(value ?? ""));
  }

  function safeHref(value) {
    const href = String(value ?? "").trim();
    if (!href) return "";
    const compact = href.replace(/[\u0000-\u0020\u007f-\u009f\u00a0]+/g, "");
    if (!compact) return "";
    if (/^(?:javascript|data|vbscript|file|blob|filesystem):/i.test(compact)) return "";
    const protocol = compact.match(/^([a-z][a-z0-9+.-]*):/i);
    if (protocol && !/^(?:https?|mailto|tel)$/i.test(protocol[1])) return "";
    return href;
  }

  function isSafeHref(value) {
    return Boolean(safeHref(value));
  }

  function cleanChildren(parent) {
    Array.from(parent.childNodes).forEach((node) => {
      if (node.nodeType === 3) return;
      if (node.nodeType !== 1) {
        node.remove();
        return;
      }

      const tag = node.tagName.toUpperCase();
      if (!ALLOWED_TAGS.has(tag)) {
        if (DROP_TAGS.has(tag)) {
          node.remove();
          return;
        }
        cleanChildren(node);
        while (node.firstChild) parent.insertBefore(node.firstChild, node);
        node.remove();
        return;
      }

      const href = tag === "A" ? safeHref(node.getAttribute("href")) : "";
      const fontSize = tag === "FONT" ? node.getAttribute("size") : "";
      Array.from(node.attributes).forEach((attribute) => {
        node.removeAttribute(attribute.name);
      });

      if (tag === "A") {
        if (!href) {
          cleanChildren(node);
          while (node.firstChild) parent.insertBefore(node.firstChild, node);
          node.remove();
          return;
        }
        node.setAttribute("href", href);
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }

      if (tag === "FONT" && /^[2-5]$/.test(String(fontSize || ""))) {
        node.setAttribute("size", fontSize);
      }

      cleanChildren(node);
    });
  }

  function sanitize(value) {
    const html = String(value ?? "");
    if (!html) return "";
    const doc = new DOMParser().parseFromString(
      `<div id="portfolio-rich-root">${html}</div>`,
      "text/html",
    );
    const root = doc.getElementById("portfolio-rich-root");
    if (!root) return "";
    cleanChildren(root);
    return root.innerHTML;
  }

  function toEditorHtml(value) {
    if (Array.isArray(value)) {
      const items = value.map((item) => String(item ?? "").trim()).filter(Boolean);
      if (!items.length) return "";
      if (items.length === 1 && isRichHtml(items[0])) return sanitize(items[0]);
      return `<ul>${items.map((item) => `<li>${isRichHtml(item) ? sanitize(item) : escapeHtml(item)}</li>`).join("")}</ul>`;
    }
    const raw = String(value ?? "").replace(/\r\n?/g, "\n");
    if (!raw) return "";
    if (isRichHtml(raw)) return sanitize(raw);
    return escapeHtml(raw).replace(/\n/g, "<br>");
  }

  function toPlainText(value) {
    if (Array.isArray(value)) {
      return value.map((item) => toPlainText(item)).filter(Boolean).join(" ");
    }
    const raw = String(value ?? "");
    if (!isRichHtml(raw)) return raw;
    const spaced = sanitize(raw)
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/(?:p|div|h2|h3|li|ul|ol)>/gi, " ");
    const doc = new DOMParser().parseFromString(`<div>${spaced}</div>`, "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  }

  function toPlainLines(value) {
    if (Array.isArray(value)) {
      return value.map((item) => toPlainText(item)).filter(Boolean);
    }
    const raw = String(value ?? "");
    if (!raw.trim()) return [];
    if (!isRichHtml(raw)) {
      return raw
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    }
    const cleaned = sanitize(raw)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(?:p|div|h2|h3|li)>/gi, "\n");
    const doc = new DOMParser().parseFromString(`<div>${cleaned}</div>`, "text/html");
    return (doc.body.textContent || "")
      .split(/\r?\n/)
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }

  function editorToStorage(value) {
    const cleaned = sanitize(value);
    if (!cleaned) return "";
    const probe = document.createElement("div");
    probe.innerHTML = cleaned;
    if (!probe.textContent.replace(/\u200b/g, "").trim()) return "";
    return cleaned;
  }

  function render(value) {
    if (Array.isArray(value)) {
      const items = value.map((item) => String(item ?? "").trim()).filter(Boolean);
      if (!items.length) return { html: "", rich: false };
      if (items.length === 1 && isRichHtml(items[0])) {
        return { html: sanitize(items[0]), rich: true };
      }
      const listHtml = `<ul>${items.map((item) => `<li>${isRichHtml(item) ? sanitize(item) : escapeHtml(item)}</li>`).join("")}</ul>`;
      return { html: listHtml, rich: true };
    }
    const raw = String(value ?? "");
    if (!raw.trim()) return { html: "", rich: false };
    if (!isRichHtml(raw)) return { html: escapeHtml(raw), rich: false };
    return { html: sanitize(raw), rich: true };
  }

  // Convert legacy project fields (details[] + features[]) or new unified description into editor/display HTML
  function projectToRichHtml(project) {
    if (!project || typeof project !== "object") return "";
    if (typeof project.description === "string" && project.description.trim()) {
      return toEditorHtml(project.description);
    }
    const details = Array.isArray(project.details)
      ? project.details.map((d) => String(d ?? "").trim()).filter(Boolean)
      : typeof project.details === "string" && project.details.trim()
        ? [project.details.trim()]
        : [];
    const features = Array.isArray(project.features)
      ? project.features.map((f) => String(f ?? "").trim()).filter(Boolean)
      : typeof project.features === "string" && project.features.trim()
        ? [project.features.trim()]
        : [];

    if (details.length === 1 && isRichHtml(details[0]) && features.length === 0) {
      return sanitize(details[0]);
    }

    const parts = [];
    details.forEach((paragraph) => {
      if (isRichHtml(paragraph)) {
        parts.push(sanitize(paragraph));
      } else {
        parts.push(`<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`);
      }
    });
    if (features.length > 0) {
      parts.push(`<h3>Key Features</h3>`);
      parts.push(
        `<ul>${features
          .map((feature) => `<li>${isRichHtml(feature) ? sanitize(feature) : escapeHtml(feature)}</li>`)
          .join("")}</ul>`
      );
    }
    return parts.join("");
  }

  // Convert legacy Experience / Volunteering description (array of points or HTML string) into editor/display HTML
  function pointsToRichHtml(entryOrPoints) {
    if (!entryOrPoints) return "";
    if (typeof entryOrPoints === "object" && !Array.isArray(entryOrPoints)) {
      if (typeof entryOrPoints.descriptionHtml === "string" && entryOrPoints.descriptionHtml.trim()) {
        return toEditorHtml(entryOrPoints.descriptionHtml);
      }
      return pointsToRichHtml(entryOrPoints.description);
    }
    if (typeof entryOrPoints === "string") {
      const trimmed = entryOrPoints.trim();
      if (!trimmed) return "";
      if (isRichHtml(trimmed)) return sanitize(trimmed);
      const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length > 1) {
        return `<ul>${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>`;
      }
      return `<p>${escapeHtml(trimmed)}</p>`;
    }
    if (Array.isArray(entryOrPoints)) {
      const items = entryOrPoints.map((d) => String(d ?? "").trim()).filter(Boolean);
      if (!items.length) return "";
      if (items.length === 1 && isRichHtml(items[0])) {
        return sanitize(items[0]);
      }
      return `<ul>${items.map((item) => `<li>${isRichHtml(item) ? sanitize(item) : escapeHtml(item)}</li>`).join("")}</ul>`;
    }
    return "";
  }

  // Convert legacy About data (p1, p2, p3, paragraphs[] or unified description) into editor/display HTML
  function aboutToRichHtml(about) {
    if (!about || typeof about !== "object") return "";
    if (typeof about.description === "string" && about.description.trim()) {
      return toEditorHtml(about.description);
    }
    const rawParagraphs =
      Array.isArray(about.paragraphs) && about.paragraphs.length
        ? about.paragraphs
        : [about.p1 || "", about.p2 || "", ...(about.p3 ? [about.p3] : [])];
    const valid = rawParagraphs.map((p) => String(p ?? "").trim()).filter(Boolean);
    if (!valid.length) return "";
    if (valid.length === 1 && isRichHtml(valid[0])) {
      return sanitize(valid[0]);
    }
    return valid
      .map((p) => (isRichHtml(p) ? sanitize(p) : `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`))
      .join("");
  }

  // Build HTML markup for the shared Rich Text Editor matching the Blog editor visual design
  function createEditorMarkup(options = {}) {
    const idPrefix = String(options.idPrefix || "admin-rich");
    const label = String(options.label || "Description");
    const name = String(options.name || "description");
    const placeholder = String(options.placeholder || "Write your description here...");
    const helperText =
      options.helperText !== undefined
        ? String(options.helperText || "")
        : "Use the toolbar to format the content. Formatting is saved and shown on the public page.";
    const minHeightClass = String(options.minHeightClass || "min-h-[220px]");
    const initialValue = String(options.value ?? "");

    const labelId = `${idPrefix}-description-label`;
    const toolbarId = `${idPrefix}-editor-toolbar`;
    const blockId = `${idPrefix}-block`;
    const fontSizeId = `${idPrefix}-font-size`;
    const placeholderId = `${idPrefix}-description-placeholder`;
    const editorId = `${idPrefix}-description-editor`;
    const inputId = `${idPrefix}-description-input`;

    return `
      <div data-rich-editor-root="${escapeHtml(idPrefix)}">
        <label id="${escapeHtml(labelId)}" class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">${escapeHtml(label)}</label>
        <div class="mt-1 overflow-hidden rounded-xl border border-zinc-300 bg-zinc-50 focus-within:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-800">
          <div id="${escapeHtml(toolbarId)}" data-rich-role="toolbar" role="toolbar" aria-label="${escapeHtml(label)} formatting" aria-controls="${escapeHtml(editorId)}" class="rich-editor-toolbar flex flex-wrap items-center gap-1 border-b border-zinc-200 bg-white/70 p-2 dark:border-zinc-700 dark:bg-zinc-900/60">
            <div class="flex items-center gap-0.5" role="group" aria-label="History">
              <button type="button" data-editor-cmd="undo" aria-label="Undo" title="Undo" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-600 transition hover:border-zinc-200 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700 dark:focus-visible:ring-offset-zinc-900">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg>
              </button>
              <button type="button" data-editor-cmd="redo" aria-label="Redo" title="Redo" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-600 transition hover:border-zinc-200 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700 dark:focus-visible:ring-offset-zinc-900">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 14 5-5-5-5" /><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" /></svg>
              </button>
            </div>
            <span aria-hidden="true" class="mx-0.5 hidden h-5 w-px shrink-0 bg-zinc-200 sm:block dark:bg-zinc-700"></span>
            <div class="flex items-center gap-1" role="group" aria-label="Text style">
              <select id="${escapeHtml(blockId)}" data-rich-role="block" aria-label="Text style" title="Text style" class="h-8 min-w-[112px] rounded-lg border border-zinc-300 bg-white px-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
                <option value="p">Paragraph</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
              </select>
              <select id="${escapeHtml(fontSizeId)}" data-rich-role="font-size" aria-label="Font size" title="Font size" class="h-8 min-w-[92px] rounded-lg border border-zinc-300 bg-white px-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
                <option value="">Font size</option>
                <option value="2">14 px</option>
                <option value="3">16 px</option>
                <option value="4">18 px</option>
                <option value="5">20 px</option>
              </select>
            </div>
            <span aria-hidden="true" class="mx-0.5 hidden h-5 w-px shrink-0 bg-zinc-200 sm:block dark:bg-zinc-700"></span>
            <div class="flex items-center gap-0.5" role="group" aria-label="Text formatting">
              <button type="button" data-editor-cmd="bold" aria-label="Bold" aria-pressed="false" title="Bold" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-xs font-bold text-zinc-600 transition hover:border-zinc-200 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700 dark:focus-visible:ring-offset-zinc-900">B</button>
              <button type="button" data-editor-cmd="italic" aria-label="Italic" aria-pressed="false" title="Italic" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-xs font-semibold italic text-zinc-600 transition hover:border-zinc-200 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700 dark:focus-visible:ring-offset-zinc-900">I</button>
              <button type="button" data-editor-cmd="underline" aria-label="Underline" aria-pressed="false" title="Underline" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-xs font-semibold underline text-zinc-600 transition hover:border-zinc-200 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700 dark:focus-visible:ring-offset-zinc-900">U</button>
            </div>
            <span aria-hidden="true" class="mx-0.5 hidden h-5 w-px shrink-0 bg-zinc-200 sm:block dark:bg-zinc-700"></span>
            <div class="flex items-center gap-0.5" role="group" aria-label="Lists">
              <button type="button" data-editor-cmd="insertUnorderedList" aria-label="Bullet list" aria-pressed="false" title="Bullet list" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-600 transition hover:border-zinc-200 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700 dark:focus-visible:ring-offset-zinc-900">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></svg>
              </button>
              <button type="button" data-editor-cmd="insertOrderedList" aria-label="Numbered list" aria-pressed="false" title="Numbered list" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-600 transition hover:border-zinc-200 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700 dark:focus-visible:ring-offset-zinc-900">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 6h11M10 12h11M10 18h11" /><path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>
              </button>
            </div>
            <span aria-hidden="true" class="mx-0.5 hidden h-5 w-px shrink-0 bg-zinc-200 sm:block dark:bg-zinc-700"></span>
            <div class="flex items-center gap-0.5" role="group" aria-label="Links">
              <button type="button" data-editor-cmd="createLink" aria-label="Insert link" title="Insert link" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-600 transition hover:border-zinc-200 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700 dark:focus-visible:ring-offset-zinc-900">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
              </button>
              <button type="button" data-editor-cmd="unlink" aria-label="Remove link" title="Remove link" class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-600 transition hover:border-zinc-200 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700 dark:focus-visible:ring-offset-zinc-900">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18.84 12.25 1.72-1.71c1.95-1.96 1.95-5.12 0-7.07s-5.12-1.95-7.07 0L11.8 5.16" /><path d="m5.17 11.75-1.71 1.71c-1.96 1.95-1.96 5.12 0 7.07s5.12 1.95 7.07 0l1.71-1.71" /><path d="M8 2v3M2 8h3M16 19v3M19 16h3" /></svg>
              </button>
            </div>
          </div>
          <div class="relative">
            <div id="${escapeHtml(placeholderId)}" data-rich-role="placeholder" aria-hidden="true" class="pointer-events-none absolute left-3.5 top-3 text-sm text-zinc-400 dark:text-zinc-500">${escapeHtml(placeholder)}</div>
            <div id="${escapeHtml(editorId)}" data-rich-role="editor" contenteditable="true" role="textbox" aria-multiline="true" aria-labelledby="${escapeHtml(labelId)}" class="rich-text-content max-h-[60vh] ${escapeHtml(minHeightClass)} w-full overflow-y-auto overflow-x-hidden px-3.5 py-3 text-sm leading-7 text-zinc-900 focus:outline-none dark:text-zinc-100"></div>
          </div>
          <input type="hidden" name="${escapeHtml(name)}" id="${escapeHtml(inputId)}" data-rich-role="input" value="${escapeHtml(initialValue)}" />
        </div>
        ${helperText ? `<p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">${escapeHtml(helperText)}</p>` : ""}
      </div>
    `;
  }

  // Mount and initialize a Rich Text Editor instance with clean event management and lifecycle methods
  function mountEditor(options = {}) {
    const idPrefix = String(options.idPrefix || "admin-rich");
    const rootEl =
      options.root ||
      document.querySelector(`[data-rich-editor-root="${idPrefix}"]`) ||
      document;

    const editor =
      options.editor ||
      document.getElementById(`${idPrefix}-description-editor`) ||
      rootEl.querySelector?.('[data-rich-role="editor"]');
    const editorInput =
      options.input ||
      document.getElementById(`${idPrefix}-description-input`) ||
      rootEl.querySelector?.('[data-rich-role="input"]');
    const placeholder =
      options.placeholder ||
      document.getElementById(`${idPrefix}-description-placeholder`) ||
      rootEl.querySelector?.('[data-rich-role="placeholder"]');
    const toolbar =
      options.toolbar ||
      document.getElementById(`${idPrefix}-editor-toolbar`) ||
      rootEl.querySelector?.('[data-rich-role="toolbar"]');
    const blockSelect =
      options.blockSelect ||
      document.getElementById(`${idPrefix}-block`) ||
      rootEl.querySelector?.('[data-rich-role="block"]');
    const fontSizeSelect =
      options.fontSizeSelect ||
      document.getElementById(`${idPrefix}-font-size`) ||
      rootEl.querySelector?.('[data-rich-role="font-size"]');

    if (!editor) {
      return {
        getValue: () => "",
        setValue: () => {},
        sync: () => "",
        destroy: () => {},
      };
    }

    // If an instance was already mounted on this editor element, clean it up first
    if (typeof editor._portfolioRichDestroy === "function") {
      editor._portfolioRichDestroy();
    }

    const controller = new AbortController();
    const signal = controller.signal;
    let savedRange = null;

    function syncValue() {
      const val = editorToStorage(editor.innerHTML);
      if (editorInput) {
        editorInput.value = val;
      }
      if (typeof options.onChange === "function") {
        options.onChange(val);
      }
      return val;
    }

    function setPlaceholderVisibility() {
      if (!placeholder) return;
      const hasContent = editor.textContent.replace(/\u200b/g, "").trim().length > 0;
      placeholder.classList.toggle("hidden", hasContent);
    }

    function saveSelection() {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (editor.contains(range.commonAncestorContainer)) {
        savedRange = range.cloneRange();
      }
    }

    function restoreSelection() {
      editor.focus();
      if (!savedRange) return;
      const selection = window.getSelection();
      if (!selection) return;
      try {
        selection.removeAllRanges();
        selection.addRange(savedRange);
      } catch (e) {
        const fallback = document.createRange();
        fallback.selectNodeContents(editor);
        fallback.collapse(false);
        selection.removeAllRanges();
        selection.addRange(fallback);
      }
    }

    function normalizeBlockName(value) {
      return String(value || "").toLowerCase().replace(/[<>]/g, "").trim();
    }

    function updateToolbarState() {
      if (toolbar) {
        toolbar.querySelectorAll("[data-editor-cmd]").forEach((button) => {
          const cmd = button.dataset.editorCmd;
          if (!["bold", "italic", "underline", "insertUnorderedList", "insertOrderedList"].includes(cmd)) return;
          try {
            button.setAttribute("aria-pressed", String(document.queryCommandState(cmd)));
          } catch (e) {
            button.setAttribute("aria-pressed", "false");
          }
        });
      }
      let currentBlock = "";
      try {
        currentBlock = normalizeBlockName(document.queryCommandValue("formatBlock"));
      } catch (e) {}
      if (blockSelect) {
        blockSelect.value = currentBlock === "h2" || currentBlock === "h3" ? currentBlock : "p";
      }
      if (fontSizeSelect) {
        let size = "";
        try {
          size = String(document.queryCommandValue("fontSize") || "");
        } catch (e) {}
        const hasOption = size && fontSizeSelect.querySelector(`option[value="${size}"]`);
        fontSizeSelect.value = hasOption ? size : "";
      }
      setPlaceholderVisibility();
    }

    function prepareCommand() {
      editor.focus();
      try {
        document.execCommand("styleWithCSS", false, false);
      } catch (e) {}
    }

    function applyBlock(block) {
      if (!block) return;
      prepareCommand();
      restoreSelection();
      try {
        document.execCommand("formatBlock", false, `<${block}>`);
      } catch (e) {
        document.execCommand("formatBlock", false, block);
      }
      syncValue();
      updateToolbarState();
    }

    function applyFontSize(size) {
      if (!size) return;
      prepareCommand();
      restoreSelection();
      document.execCommand("fontSize", false, size);
      syncValue();
      updateToolbarState();
    }

    function applyLink() {
      prepareCommand();
      restoreSelection();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      // Check if cursor is inside an existing link when selection is collapsed
      let existingAnchor = null;
      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;
      if (node.nodeType === 3) node = node.parentElement;
      if (node && node.closest) {
        const candidate = node.closest("a");
        if (candidate && editor.contains(candidate)) {
          existingAnchor = candidate;
        }
      }

      if (selection.isCollapsed && !existingAnchor) return;

      const defaultUrl = existingAnchor ? existingAnchor.getAttribute("href") || "https://" : "https://";
      const entered = window.prompt("Enter the link URL:", defaultUrl);
      if (entered === null) return;
      let href = entered.trim();
      if (!href) return;
      if (!/^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith("/") && !href.startsWith("#") && !href.startsWith(".")) {
        href = `https://${href}`;
      }
      if (!isSafeHref(href)) {
        window.alert("Unsafe link. Only http, https, mailto, and tel links are allowed.");
        return;
      }

      if (existingAnchor && selection.isCollapsed) {
        existingAnchor.setAttribute("href", href);
        existingAnchor.setAttribute("target", "_blank");
        existingAnchor.setAttribute("rel", "noopener noreferrer");
      } else {
        restoreSelection();
        document.execCommand("createLink", false, href);
      }
      syncValue();
      updateToolbarState();
    }

    function removeLink() {
      prepareCommand();
      restoreSelection();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;
      if (node.nodeType === 3) node = node.parentElement;
      const anchor = node && node.closest ? node.closest("a") : null;
      if (anchor && editor.contains(anchor)) {
        const anchorRange = document.createRange();
        anchorRange.selectNodeContents(anchor);
        selection.removeAllRanges();
        selection.addRange(anchorRange);
      }
      document.execCommand("unlink");
      syncValue();
      updateToolbarState();
    }

    function runCommand(cmd) {
      if (cmd === "createLink") {
        applyLink();
        return;
      }
      if (cmd === "unlink") {
        removeLink();
        return;
      }
      prepareCommand();
      restoreSelection();
      document.execCommand(cmd);
      syncValue();
      updateToolbarState();
    }

    function setValue(newValue) {
      const formatted = toEditorHtml(newValue ?? "");
      editor.innerHTML = formatted;
      savedRange = null;
      syncValue();
      updateToolbarState();
    }

    function getValue() {
      return syncValue();
    }

    // Initialize content from options.initialValue or hidden input value
    const initialContent =
      options.initialValue !== undefined
        ? options.initialValue
        : editorInput
          ? editorInput.value || ""
          : "";
    setValue(initialContent);

    editor.addEventListener(
      "input",
      () => {
        syncValue();
        updateToolbarState();
      },
      { signal }
    );
    editor.addEventListener(
      "keyup",
      () => {
        saveSelection();
        updateToolbarState();
      },
      { signal }
    );
    editor.addEventListener(
      "mouseup",
      () => {
        saveSelection();
        updateToolbarState();
      },
      { signal }
    );
    editor.addEventListener("focus", saveSelection, { signal });
    editor.addEventListener(
      "click",
      (event) => {
        const anchor = event.target.closest("a");
        if (anchor) event.preventDefault();
      },
      { signal }
    );
    editor.addEventListener(
      "paste",
      (event) => {
        event.preventDefault();
        const text = (event.clipboardData || window.clipboardData).getData("text/plain");
        document.execCommand("insertText", false, text);
        syncValue();
        updateToolbarState();
      },
      { signal }
    );

    if (toolbar) {
      toolbar.addEventListener(
        "mousedown",
        (event) => {
          saveSelection();
          if (event.target.closest("button")) event.preventDefault();
        },
        { signal }
      );
      toolbar.addEventListener(
        "click",
        (event) => {
          const commandButton = event.target.closest("[data-editor-cmd]");
          if (!commandButton) return;
          event.preventDefault();
          runCommand(commandButton.dataset.editorCmd);
        },
        { signal }
      );
    }

    if (blockSelect) {
      blockSelect.addEventListener("mousedown", saveSelection, { signal });
      blockSelect.addEventListener(
        "change",
        () => {
          applyBlock(blockSelect.value);
        },
        { signal }
      );
    }

    if (fontSizeSelect) {
      fontSizeSelect.addEventListener("mousedown", saveSelection, { signal });
      fontSizeSelect.addEventListener(
        "change",
        () => {
          if (fontSizeSelect.value) applyFontSize(fontSizeSelect.value);
        },
        { signal }
      );
    }

    const parentForm = options.form || editor.closest("form");
    if (parentForm) {
      parentForm.addEventListener("submit", syncValue, { signal });
    }

    function destroy() {
      controller.abort();
      delete editor._portfolioRichDestroy;
    }

    editor._portfolioRichDestroy = destroy;

    return {
      editor,
      input: editorInput,
      getValue,
      setValue,
      sync: syncValue,
      destroy,
    };
  }

  window.PortfolioRichText = {
    sanitize,
    toEditorHtml,
    toPlainText,
    toPlainLines,
    editorToStorage,
    render,
    escapeHtml,
    isRichHtml,
    isSafeHref,
    projectToRichHtml,
    pointsToRichHtml,
    aboutToRichHtml,
    createEditorMarkup,
    mountEditor,
  };
})();

// Blog implementation - Facebook-style post feed with pagination and details page
window.loadBlog = async function () {
  const root = document.getElementById("blog-feed");
  if (!root) return;

  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  const when = (d) => {
    try {
      return new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return d || "";
    }
  };

  let allPosts = [];
  try {
    const res = await fetch("data/posts.json", { cache: "no-store" });
    if (!res.ok) throw new Error("posts.json");
    const data = await res.json();
    allPosts = (Array.isArray(data) ? data : [])
      .filter((p) => (p.visibility || "public") === "public")
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (e) {
    root.innerHTML =
      '<p class="text-sm text-zinc-500 dark:text-zinc-400">Posts could not be loaded.</p>';
    return;
  }

  let currentPage = 1;
  const postsPerPage = 6;

  function getPostsForPage(page) {
    const start = (page - 1) * postsPerPage;
    return allPosts.slice(start, start + postsPerPage);
  }

  function getTotalPages() {
    return Math.max(1, Math.ceil(allPosts.length / postsPerPage));
  }

  function renderPagination(page) {
    const totalPages = getTotalPages();
    if (totalPages <= 1) return "";
    let html = '<div class="mt-8 flex flex-wrap items-center justify-center gap-1.5">';
    html += `<button data-blog-page="${Math.max(1, page - 1)}" class="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 ${page === 1 ? "pointer-events-none opacity-50" : ""}">Previous</button>`;
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 6) {
        if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
          html += `<button data-blog-page="${i}" class="rounded-lg px-3 py-1.5 text-sm font-medium ${i === page ? "bg-indigo-600 text-white" : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"}">${i}</button>`;
        } else if (i === page - 2 || i === page + 2) {
          html += '<span class="px-2 text-zinc-400">…</span>';
        }
      } else {
        html += `<button data-blog-page="${i}" class="rounded-lg px-3 py-1.5 text-sm font-medium ${i === page ? "bg-indigo-600 text-white" : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"}">${i}</button>`;
      }
    }
    html += `<button data-blog-page="${Math.min(totalPages, page + 1)}" class="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 ${page === totalPages ? "pointer-events-none opacity-50" : ""}">Next</button>`;
    html += "</div>";
    return html;
  }

function renderList(page) {
  const posts = getPostsForPage(page);

  if (allPosts.length === 0) {
    return '<p class="text-sm text-zinc-500 dark:text-zinc-400">No posts yet.</p>';
  }

  return `
    <div class="grid gap-6 md:grid-cols-2">
      ${posts
        .map((p) => {
          const imgs = Array.isArray(p.images)
            ? p.images.filter(Boolean)
            : [];

          const desc =
            p.description ||
            (Array.isArray(p.text) ? p.text.join(" ") : p.text || "");

          const plainDesc = window.PortfolioRichText
            ? window.PortfolioRichText.toPlainText(desc)
            : String(desc || "");

          const preview =
            plainDesc.length > 200 ? plainDesc.substring(0, 197) + "..." : plainDesc;

          return `
            <article class="group flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">

              <header class="flex items-center gap-3 p-5 pb-0">
                <span class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src="images/farhan.png"
                    alt="Farhan Chowdhury"
                    class="h-full w-full origin-[51%_52%] scale-[1.7] object-cover object-top"
                  />
                </span>

                <div class="min-w-0">
                  <p class="text-sm font-semibold">Farhan Chowdhury</p>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">
                    ${when(p.date)} ·
                    <span class="inline-flex items-center gap-1">
                      <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                      Public
                    </span>
                  </p>
                </div>

                ${
                  p.featured
                    ? '<span class="ml-auto rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">Featured</span>'
                    : ""
                }
              </header>

              <div class="p-5">
                <h3 class="text-lg font-bold leading-snug">${esc(p.title)}</h3>
                <p class="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">${esc(preview)}</p>
              </div>

              ${
                imgs.length > 0
                  ? `
                    <div class="grid grid-cols-3 gap-0.5 px-5">
                      ${imgs.slice(0, 3).map((img, idx) => {
                        const isLast = idx === 2 && imgs.length > 3;

                        return `
                          <button
                            type="button"
                            data-blog-img="${esc(img)}"
                            class="relative block aspect-[4/3] w-full overflow-hidden"
                          >
                            <img
                              src="${esc(img)}"
                              alt="${esc(p.title)}"
                              loading="lazy"
                              class="h-full w-full object-cover"
                            />

                            ${
                              isLast
                                ? `
                                  <span class="absolute inset-0 flex items-center justify-center bg-black/60 text-lg font-semibold text-white">
                                    +${imgs.length - 3}
                                  </span>
                                `
                                : ""
                            }
                          </button>
                        `;
                      }).join("")}
                    </div>
                  `
                  : ""
              }

              <div class="mt-auto flex items-center justify-between p-5 text-sm">
                <span class="text-zinc-500 dark:text-zinc-400">
                  ${imgs.length} ${imgs.length === 1 ? "Photo" : "Photos"}
                </span>

                <a
                  href="/blog/${esc(p.slug || "")}"
                  data-blog-viewmore
                  class="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  View More →
                </a>
              </div>

            </article>
          `;
        })
        .join("")}
    </div>

    ${renderPagination(page)}
  `;
}

  function openLightbox(images, startIndex) {
    if (!images || images.length === 0) return;
    let idx = startIndex || 0;
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4";
    overlay.innerHTML = `
      <button type="button" data-lb-close class="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
      <button type="button" data-lb-prev class="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
      <button type="button" data-lb-next class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
      <img data-lb-img src="${esc(images[idx])}" alt="" class="max-h-[90vh] max-w-[90vw] object-contain" />
    `;
    document.body.appendChild(overlay);
    document.body.classList.add("overflow-hidden");
    const imgEl = overlay.querySelector("[data-lb-img]");
    function update() { imgEl.src = images[idx]; }
    overlay.querySelector("[data-lb-close]").onclick = () => { overlay.remove(); document.body.classList.remove("overflow-hidden"); document.removeEventListener("keydown", onKey); };
    overlay.querySelector("[data-lb-prev]").onclick = () => { idx = (idx - 1 + images.length) % images.length; update(); };
    overlay.querySelector("[data-lb-next]").onclick = () => { idx = (idx + 1) % images.length; update(); };
    function onKey(e) { if (e.key === "Escape") overlay.querySelector("[data-lb-close]").click(); if (e.key === "ArrowLeft") overlay.querySelector("[data-lb-prev]").click(); if (e.key === "ArrowRight") overlay.querySelector("[data-lb-next]").click(); }
    document.addEventListener("keydown", onKey);
    overlay.onclick = (e) => { if (e.target === overlay) overlay.querySelector("[data-lb-close]").click(); };
  }

  function renderDetail(post) {
    const imgs = Array.isArray(post.images) ? post.images.filter(Boolean) : (post.image ? [post.image] : []);
    const desc = post.description || (Array.isArray(post.text) ? post.text.join("\n\n") : post.text || "");
    const renderedDesc = window.PortfolioRichText
      ? window.PortfolioRichText.render(desc)
      : { html: esc(desc), rich: false };
    const url = `${location.origin}/blog/${post.slug || ""}`;
    return `
      <div class="mb-6">
        <a href="/blog" data-blog-back class="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-600 transition hover:text-indigo-500 dark:text-zinc-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Back to Blog
        </a>
      </div>
      <article class="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <header class="flex items-center gap-3">
          <span class="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <img src="images/farhan.png" alt="Farhan Chowdhury" class="h-full w-full origin-[51%_52%] scale-[1.7] object-cover object-top" />
          </span>
          <div>
            <p class="text-sm font-semibold">Farhan Chowdhury</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">${when(post.date)} · Public</p>
          </div>
        </header>
        <h1 class="mt-6 text-2xl font-bold sm:text-3xl">${esc(post.title)}</h1>
        <div class="rich-text-content mt-4${renderedDesc.rich ? "" : " whitespace-pre-line"} break-words text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">${renderedDesc.html}</div>
        ${imgs.length > 0
          ? `<div class="mt-6 grid gap-2 sm:grid-cols-2">
              ${imgs.map((img, idx) => `<button type="button" data-blog-detail-img="${idx}" data-blog-detail-all='${esc(JSON.stringify(imgs))}' class="block overflow-hidden rounded-2xl"><img src="${esc(img)}" alt="" loading="lazy" class="h-full w-full object-cover" /></button>`).join("")}
            </div>
            <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">${imgs.length} ${imgs.length === 1 ? "image" : "images"}</p>`
          : ""}
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" data-blog-share class="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> Share Post </button>
          ${post.projectUrl ? `<a href="${esc(post.projectUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">View Project ↗</a>` : ""}
        </div>
      </article>
    `;
  }

  function render() {
    const path = window.location.pathname || "/";
    const m = path.match(/^\/blog\/(.+)\/?$/);
    if (m) {
      const slug = decodeURIComponent(m[1]);
      const post = allPosts.find((p) => p.slug === slug) || allPosts.find((p) => p.id && String(p.id) === slug);
      if (post) {
        root.innerHTML = renderDetail(post);
        window.lucide && window.lucide.createIcons && window.lucide.createIcons();
        root.querySelector("[data-blog-share]")?.addEventListener("click", async (e) => {
          const btn = e.currentTarget;
          const url = `${location.origin}/blog/${post.slug}`;
          try {
            await navigator.clipboard.writeText(url);
            const old = btn.innerHTML;
            btn.textContent = "Link Copied!";
            setTimeout(() => (btn.innerHTML = old), 1800);
          } catch (err) {
            const fallback = document.createElement("textarea");
            fallback.value = url;
            fallback.style.position = "fixed";
            fallback.style.opacity = "0";
            document.body.appendChild(fallback);
            fallback.select();
            const copied = document.execCommand("copy");
            fallback.remove();
            if (copied) {
              const old = btn.innerHTML;
              btn.textContent = "Link Copied!";
              setTimeout(() => (btn.innerHTML = old), 1800);
            }
          }
        });
        root.querySelectorAll("[data-blog-detail-img]").forEach((btn) => {
          btn.addEventListener("click", () => {
            try {
              const all = JSON.parse(btn.dataset.blogDetailAll.replace(/&quot;/g, '"'));
              const idx = Number(btn.dataset.blogDetailImg);
              openLightbox(all, idx);
            } catch {}
          });
        });
        // scroll to blog section
        const blogSection = document.getElementById("blog");
        if (blogSection) {
          const offset = blogSection.getBoundingClientRect().top + window.pageYOffset - 100;
          window.scrollTo({ top: offset, behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }
    }
    // list view
    root.innerHTML = renderList(currentPage);
    window.lucide && window.lucide.createIcons && window.lucide.createIcons();
    root.querySelectorAll("[data-blog-page]").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentPage = Number(btn.dataset.blogPage) || 1;
        render();
        const blogSection = document.getElementById("blog");
        if (blogSection) {
          const offset = blogSection.getBoundingClientRect().top + window.pageYOffset - 100;
          window.scrollTo({ top: offset, behavior: "smooth" });
        }
      });
    });
    root.querySelectorAll("[data-blog-img]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const img = btn.dataset.blogImg;
        openLightbox([img], 0);
      });
    });
  }

  render();
  if (!window._blogGlobalListenersBound) {
    window._blogGlobalListenersBound = true;
    window.addEventListener("popstate", () => {
      if (window.loadBlog) window.loadBlog();
    });
    document.addEventListener("click", (e) => {
      const viewMore = e.target.closest("[data-blog-viewmore]");
      if (viewMore) {
        e.preventDefault();
        history.pushState(null, "", viewMore.getAttribute("href"));
        if (window.loadBlog) window.loadBlog();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const back = e.target.closest("[data-blog-back]");
      if (back) {
        e.preventDefault();
        history.pushState(null, "", "/blog");
        if (window.loadBlog) window.loadBlog();
        return;
      }
      if (e.target.closest('[data-section-link="blog"]')) {
        setTimeout(() => {
          if (window.loadBlog) window.loadBlog();
        }, 0);
      }
    });
  }
};
