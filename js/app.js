(function () {
  const SUPPORTED = ["vi", "en"];
  const common = CV_DATA.common;
  let lang = detectLang();

  function detectLang() {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (SUPPORTED.includes(fromUrl)) return fromUrl;
    try {
      const saved = localStorage.getItem("lang");
      if (SUPPORTED.includes(saved)) return saved;
    } catch (e) {}
    return (navigator.language || "vi").toLowerCase().startsWith("vi") ? "vi" : "en";
  }

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const get = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  const tags = (items) => `<ul class="tags">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

  const ICONS = {
    mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="m22 6-10 7L2 6"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    ext: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/>',
  };
  const icon = (name, size = 18) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
  const shortUrl = (url) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

  function contacts(cv) {
    return [
      { icon: "mail", label: "Email", value: common.email, href: `mailto:${common.email}` },
      { icon: "phone", label: lang === "vi" ? "Điện thoại" : "Phone", value: common.phone, href: `tel:${common.phone.replace(/\s/g, "")}` },
      { icon: "linkedin", label: "LinkedIn", value: shortUrl(common.linkedin), href: common.linkedin },
      { icon: "github", label: "GitHub", value: shortUrl(common.github), href: common.github },
      { icon: "globe", label: "Website", value: shortUrl(common.website), href: common.website },
      { icon: "pin", label: lang === "vi" ? "Địa điểm" : "Location", value: cv.location },
    ].filter((c) => c.value);
  }

  function renderTerminal(cv) {
    const k = (s) => `<span class="t-key">"${esc(s)}"</span>`;
    const v = (s) => `<span class="t-str">"${esc(s)}"</span>`;
    const n = (s) => `<span class="t-num">${esc(s)}</span>`;
    const stack = cv.skills.slice(0, 3).flatMap((g) => g.items.slice(0, 2));
    return [
      `<span class="t-muted">$</span> curl -s api.dev/v1/me | jq`,
      `{`,
      `  ${k("name")}: ${v(common.name)},`,
      `  ${k("role")}: ${v(cv.title)},`,
      `  ${k("location")}: ${v(cv.location)},`,
      `  ${k("experience_years")}: ${n(common.yearsOfExperience)},`,
      `  ${k("stack")}: [`,
      stack.map((s, i) => `    ${v(s)}${i < stack.length - 1 ? "," : ""}`).join("\n"),
      `  ],`,
      `  ${k("open_to_work")}: <span class="t-bool">true</span>`,
      `}`,
      `<span class="t-muted">$</span> <span class="cursor"></span>`,
    ].join("\n");
  }

  function render() {
    const cv = CV_DATA[lang];
    const ui = UI_STRINGS[lang];

    document.documentElement.lang = lang;
    document.title = `${common.name} · ${ui.pageTitle}`;

    // Static UI strings
    document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = get(ui, el.dataset.i18n) ?? ""));
    document.querySelectorAll("[data-i18n-title]").forEach((el) => (el.title = get(ui, el.dataset.i18nTitle)));
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", get(ui, el.dataset.i18nAria)));
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const key = el.dataset.bind;
      el.textContent = cv[key] ?? common[key] ?? "";
    });
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));

    // Hero
    $("#heroMeta").innerHTML = contacts(cv)
      .filter((c) => ["pin", "mail", "github", "linkedin"].includes(c.icon))
      .map((c) =>
        c.href
          ? `<li><a href="${esc(c.href)}" target="_blank" rel="noopener">${icon(c.icon, 16)}<span>${esc(c.value)}</span></a></li>`
          : `<li>${icon(c.icon, 16)}<span>${esc(c.value)}</span></li>`
      )
      .join("");
    $("#terminal").innerHTML = renderTerminal(cv);
    $("#stats").innerHTML = cv.stats
      .map((s) => `<li><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></li>`)
      .join("");

    // About
    $("#aboutText").innerHTML = cv.about.map((p) => `<p>${esc(p)}</p>`).join("");
    $("#facts").innerHTML = cv.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("");

    // Skills
    $("#skillsGrid").innerHTML = cv.skills
      .map((s) => `<article class="card skill-card"><h3 class="card-title">${esc(s.group)}</h3>${tags(s.items)}</article>`)
      .join("");

    // Experience
    $("#timeline").innerHTML = cv.experience
      .map(
        (job) => `
        <li class="timeline-item">
          <div class="timeline-period mono">${esc(job.period)}</div>
          <article class="card">
            <header class="job-head">
              <h3>${esc(job.role)}</h3>
              <p class="job-company">${esc(job.company)} <span>· ${esc(job.location)}</span></p>
            </header>
            <p class="job-desc">${esc(job.description)}</p>
            <ul class="bullets">${job.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
            ${tags(job.stack)}
          </article>
        </li>`
      )
      .join("");

    // Projects
    $("#projectsGrid").innerHTML = cv.projects
      .map(
        (p) => `
        <article class="card project-card">
          <header class="project-head">
            <h3>${esc(p.name)}</h3>
            ${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener" aria-label="${esc(p.name)}">${icon("ext", 18)}</a>` : ""}
          </header>
          <p>${esc(p.description)}</p>
          <ul class="checks">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
          ${tags(p.stack)}
        </article>`
      )
      .join("");

    // Education / certifications / languages
    $("#educationList").innerHTML = cv.education
      .map((e) => `<li><strong>${esc(e.school)}</strong><span>${esc(e.degree)}</span><small class="mono">${esc(e.period)}${e.detail ? " · " + esc(e.detail) : ""}</small></li>`)
      .join("");
    $("#certList").innerHTML = cv.certifications
      .map((c) => `<li><strong>${esc(c.name)}</strong><small class="mono">${esc(c.issuer)} · ${esc(c.year)}</small></li>`)
      .join("");
    $("#langList").innerHTML = cv.languages
      .map((l) => `<li><strong>${esc(l.name)}</strong><span>${esc(l.level)}</span></li>`)
      .join("");

    // Contact
    $("#contactGrid").innerHTML = contacts(cv)
      .map((c) => {
        const inner = `<span class="contact-icon">${icon(c.icon, 20)}</span><span><small>${esc(c.label)}</small><strong>${esc(c.value)}</strong></span>`;
        return c.href
          ? `<a class="card contact-card" href="${esc(c.href)}" target="_blank" rel="noopener">${inner}</a>`
          : `<div class="card contact-card">${inner}</div>`;
      })
      .join("");
  }

  function setLang(next) {
    if (!SUPPORTED.includes(next) || next === lang) return;
    lang = next;
    try { localStorage.setItem("lang", lang); } catch (e) {}
    const url = new URL(location.href);
    url.searchParams.set("lang", lang);
    history.replaceState(null, "", url);
    render();
  }

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
  }

  async function handleDownload(btn) {
    const target = btn.dataset.download === "current" ? lang : btn.dataset.download;
    if (btn.disabled) return;
    btn.disabled = true;
    btn.classList.add("loading");
    try {
      await CvDocx.downloadCvDocx(target);
    } catch (err) {
      console.error(err);
      toast(UI_STRINGS[lang].downloadError);
    } finally {
      btn.disabled = false;
      btn.classList.remove("loading");
    }
  }

  function currentTheme() {
    const t = document.documentElement.dataset.theme;
    if (t) return t;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  // Events
  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  document.querySelectorAll("[data-download]").forEach((b) => b.addEventListener("click", () => handleDownload(b)));

  $("#themeToggle").addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  const nav = $("#nav");
  const menuBtn = $("#menuToggle");
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

  // Highlight the nav link for the section in view
  const links = [...nav.querySelectorAll("a")];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  links.forEach((a) => {
    const sec = document.querySelector(a.getAttribute("href"));
    if (sec) observer.observe(sec);
  });

  $("#year").textContent = new Date().getFullYear();
  render();
})();
