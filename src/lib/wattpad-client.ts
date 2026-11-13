import https from "https";
import { sanitizeContent } from "./utils";

// Wattpad TLS / bölgesel engel ortamları için
if (process.env.WATTpad_SKIP_TLS_VERIFY !== "0") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export interface WattpadStorySummary {
  id: number;
  title: string;
  url: string;
  description: string;
  coverUrl: string | null;
  author: string;
  numParts: number;
}

export interface WattpadPart {
  id: number;
  title: string;
  order: number;
}

async function wattpadFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    return await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json, text/html, */*",
      },
      signal: controller.signal,
      // @ts-expect-error Node fetch agent
      agent: httpsAgent,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function isBlockedHtml(text: string): boolean {
  return text.includes("erisime_engellenmis") || text.includes("<html");
}

export async function fetchUserStories(
  username: string,
  limit = 100
): Promise<WattpadStorySummary[]> {
  const stories: WattpadStorySummary[] = [];
  let offset = 0;

  while (true) {
    const url = `https://www.wattpad.com/api/v3/users/${encodeURIComponent(username)}/stories?limit=${limit}&offset=${offset}&fields=stories(id,title,url,description,cover,numParts,user(name,username))`;
    const res = await wattpadFetch(url);
    const text = await res.text();

    if (!res.ok || isBlockedHtml(text)) {
      throw new Error(
        "Wattpad'e erişilemedi. VPN açık olmalı veya EPUB ile yükleyin. (Türkiye'de engelli olabilir.)"
      );
    }

    const data = JSON.parse(text) as {
      stories?: Array<{
        id: number;
        title: string;
        url: string;
        description?: string;
        cover?: string;
        numParts?: number;
        user?: { name?: string; username?: string };
      }>;
    };

    const batch = data.stories || [];
    if (batch.length === 0) break;

    for (const s of batch) {
      stories.push({
        id: s.id,
        title: s.title,
        url: s.url || `https://www.wattpad.com/story/${s.id}`,
        description: s.description || "",
        coverUrl: s.cover || null,
        author: s.user?.name || s.user?.username || username,
        numParts: s.numParts || 0,
      });
    }

    if (batch.length < limit) break;
    offset += limit;
    await sleep(1500);
  }

  return stories;
}

export async function fetchStoryDetails(
  storyId: number,
  options: { includeDrafts?: boolean } = {}
): Promise<{
  story: WattpadStorySummary;
  parts: WattpadPart[];
}> {
  const drafts = options.includeDrafts !== false ? 1 : 0;
  const fields =
    "id,title,url,description,cover,numParts,user(name,username),parts(id,title)";
  const url = `https://www.wattpad.com/api/v3/stories/${storyId}?drafts=${drafts}&mature=1&fields=${fields}`;
  const res = await wattpadFetch(url);
  const text = await res.text();

  if (!res.ok || isBlockedHtml(text)) {
    throw new Error(`Hikaye ${storyId} alınamadı`);
  }

  const data = JSON.parse(text) as {
    id: number;
    title: string;
    url: string;
    description?: string;
    cover?: string;
    numParts?: number;
    user?: { name?: string; username?: string };
    parts?: Array<{ id: number; title: string }>;
  };

  const parts = (data.parts || []).map((p, i) => ({
    id: p.id,
    title: p.title || `Bölüm ${i + 1}`,
    order: i + 1,
  }));

  return {
    story: {
      id: data.id,
      title: data.title,
      url: data.url || `https://www.wattpad.com/story/${data.id}`,
      description: data.description || "",
      coverUrl: data.cover || null,
      author: data.user?.name || data.user?.username || "Yazar",
      numParts: data.numParts || parts.length,
    },
    parts,
  };
}

export async function fetchPartContent(partId: number): Promise<string> {
  const url = `https://www.wattpad.com/apiv2/storytext?id=${partId}`;
  const res = await wattpadFetch(url);
  const text = await res.text();

  if (!res.ok || isBlockedHtml(text)) {
    throw new Error(`Bölüm ${partId} alınamadı`);
  }

  let html = text;
  try {
    const json = JSON.parse(text) as { text?: string };
    if (json.text) html = json.text;
  } catch {
    // düz HTML
  }

  return sanitizeContent(html);
}

export async function downloadCoverImage(coverUrl: string): Promise<Buffer | null> {
  try {
    const res = await wattpadFetch(coverUrl);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
