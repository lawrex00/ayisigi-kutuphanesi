import slugify from "slugify";
import sanitizeHtml from "sanitize-html";

export function createSlug(title: string, wattpadId?: string | number): string {
  const base = slugify(title, { lower: true, strict: true, locale: "tr" });
  return wattpadId ? `${base}-${wattpadId}` : base;
}

export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "h1",
      "h2",
      "h3",
      "blockquote",
      "ul",
      "ol",
      "li",
      "hr",
    ],
    allowedAttributes: {},
    textFilter: (text) => text.replace(/\s+/g, " "),
  });
}

export function plainTextToHtml(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${sanitizeHtml(p, { allowedTags: [], allowedAttributes: {} })}</p>`)
    .join("\n");
}

export function formatReadingTime(minutes: number): string {
  if (minutes < 60) return `${minutes} dk okuma`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} sa ${mins} dk` : `${hours} saat`;
}

export function extractStoryId(url: string): string | null {
  const patterns = [
    /wattpad\.com\/story\/(\d+)/i,
    /wattpad\.com\/(\d+)/i,
    /^(\d+)$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
