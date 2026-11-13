(async function wattpadImportToSite() {
  const SITE = localStorage.getItem("wattpad_site") || "http://localhost:3000";

  function alertErr(msg) {
    alert("Hata: " + msg);
    console.error("[wattpad-import]", msg);
  }

  async function getStoryId() {
    const path = location.pathname;

    const storyMatch = path.match(/\/story\/(\d+)/);
    if (storyMatch) return storyMatch[1];

    const partMatch = path.match(/^\/(\d+)-/);
    if (partMatch) {
      const html = document.documentElement.innerHTML;
      const embedded =
        html.match(/"storyId"\s*:\s*(\d+)/) || html.match(/\/story\/(\d+)/);
      if (embedded) return embedded[1];

      const partId = partMatch[1];
      const endpoints = [
        `https://www.wattpad.com/api/v3/story_parts/${partId}?fields=groupId`,
        `https://www.wattpad.com/api/v3/parts/${partId}?fields=groupId`,
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          if (data.groupId) return String(data.groupId);
        } catch {
          // sonraki endpoint
        }
      }
    }

    const link = document.querySelector('a[href*="/story/"]');
    if (link) {
      const m = link.getAttribute("href")?.match(/\/story\/(\d+)/);
      if (m) return m[1];
    }

    throw new Error(
      "Hikaye bulunamadı. Kitabın ana sayfasına git veya bir bölüm sayfasında dene."
    );
  }

  async function fetchPartHtml(partId) {
    const res = await fetch(`https://www.wattpad.com/apiv2/storytext?id=${partId}`);
    const txt = await res.text();
    if (!res.ok) throw new Error(`Bölüm ${partId} alınamadı`);
    try {
      const json = JSON.parse(txt);
      if (json.text) return json.text;
    } catch {
      // düz HTML
    }
    return txt;
  }

  try {
    if (!location.hostname.includes("wattpad.com")) {
      alertErr("Bu araç yalnızca wattpad.com üzerinde çalışır.");
      return;
    }

    const storyId = await getStoryId();
    const pwd = prompt("Admin şifresi (Billy31?):");
    if (!pwd) return;

    const status = document.createElement("div");
    status.id = "wattpad-import-status";
    status.style.cssText =
      "position:fixed;z-index:999999;top:16px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#fff;padding:12px 20px;border-radius:12px;font:14px system-ui;box-shadow:0 4px 24px rgba(0,0,0,.4)";
    status.textContent = `Hikaye ${storyId} — bölümler çekiliyor...`;
    document.body.appendChild(status);

    const fields =
      "id,title,url,description,cover,user(name,username),parts(id,title)";
    const storyRes = await fetch(
      `https://www.wattpad.com/api/v3/stories/${storyId}?drafts=1&mature=1&fields=${fields}`
    );
    if (!storyRes.ok) throw new Error("Hikaye bilgisi alınamadı (VPN açık mı?)");
    const story = await storyRes.json();
    const parts = story.parts || [];
    if (!parts.length) throw new Error("Bu hikayede bölüm bulunamadı");

    const chapters = [];
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      status.textContent = `Bölüm ${i + 1}/${parts.length}: ${p.title || ""}`;
      const html = await fetchPartHtml(p.id);
      chapters.push({
        order: i + 1,
        title: p.title || `Bölüm ${i + 1}`,
        content: html,
      });
      await new Promise((r) => setTimeout(r, 800));
    }

    status.textContent = "Siteye kaydediliyor...";

    const saveRes = await fetch(`${SITE}/api/import/payload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": pwd,
      },
      body: JSON.stringify({
        title: story.title,
        author: story.user?.username || "Gozyasikullugu",
        summary: story.description || "",
        wattpadUrl: story.url || `https://www.wattpad.com/story/${storyId}`,
        wattpadId: storyId,
        chapters,
      }),
    });

    const data = await saveRes.json();
    if (!saveRes.ok) throw new Error(data.error || "Kayıt hatası");

    status.remove();
    alert(`✓ ${data.message}\n\nAdmin: ${SITE}/admin`);
  } catch (e) {
    const el = document.getElementById("wattpad-import-status");
    if (el) el.remove();
    alertErr(e instanceof Error ? e.message : String(e));
  }
})();
