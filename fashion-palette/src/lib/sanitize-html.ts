// Final feedback B3: sanitize rich-text HTML saved from the product editor.
// Allowlist-based — strips scripts, unsafe embeds, inline event handlers and
// uncontrolled styling. Dependency-free so it runs on the server at save time.
// This is the authoritative pass; the storefront can render the result directly.

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "h2", "h3", "h4", "a", "blockquote",
]);

// Remove entire <script>/<style> blocks (including content) first.
function stripDangerousBlocks(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

function safeHref(value: string): string | null {
  const v = value.trim();
  // Allow only http(s), mailto and relative links; block javascript:, data:, etc.
  if (/^(https?:\/\/|mailto:|\/)/i.test(v)) return v;
  return null;
}

// Rebuild each tag, keeping only allowed tags and safe attributes.
function cleanTags(html: string): string {
  return html.replace(/<(\/?)([a-zA-Z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*)>/g, (_match, closing, rawName, rawAttrs) => {
    const name = rawName.toLowerCase();
    if (!ALLOWED_TAGS.has(name)) return "";
    if (closing) return `</${name}>`;

    // Only <a> keeps an attribute (href), and we force safe rel/target.
    if (name === "a") {
      const hrefMatch = /href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(rawAttrs);
      const raw = hrefMatch ? (hrefMatch[2] ?? hrefMatch[3] ?? hrefMatch[4] ?? "") : "";
      const href = safeHref(raw);
      if (!href) return "<a>";
      return `<a href="${href.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer nofollow">`;
    }
    // Drop all attributes (incl. style, class, on* handlers) from every other tag.
    return `<${name}>`;
  });
}

export function sanitizeHtml(input: string | null | undefined): string | null {
  if (!input) return input ?? null;
  let html = stripDangerousBlocks(String(input));
  html = cleanTags(html);
  // Collapse empty paragraphs the editor may leave behind.
  html = html.replace(/<p>\s*<\/p>/gi, "").trim();
  return html || null;
}
