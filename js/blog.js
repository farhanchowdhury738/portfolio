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

          const preview =
            desc.length > 200 ? desc.substring(0, 197) + "..." : desc;

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
                  href="#blog/${esc(p.slug || "")}"
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
    const url = `${location.origin}${location.pathname}#blog/${post.slug || ""}`;
    return `
      <div class="mb-6">
        <a href="#blog" data-blog-back class="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-600 transition hover:text-indigo-500 dark:text-zinc-400">
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
        <div class="mt-4 whitespace-pre-line text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">${esc(desc)}</div>
        ${imgs.length > 0
          ? `<div class="mt-6 grid gap-2 sm:grid-cols-2">
              ${imgs.map((img, idx) => `<button type="button" data-blog-detail-img="${idx}" data-blog-detail-all='${esc(JSON.stringify(imgs))}' class="block overflow-hidden rounded-2xl"><img src="${esc(img)}" alt="" loading="lazy" class="h-full w-full object-cover" /></button>`).join("")}
            </div>
            <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">${imgs.length} ${imgs.length === 1 ? "image" : "images"}</p>`
          : ""}
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" data-blog-share class="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> Share Post / Copy Link</button>
          ${post.projectUrl ? `<a href="${esc(post.projectUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">View Project ↗</a>` : ""}
        </div>
      </article>
    `;
  }

  function render() {
    const hash = window.location.hash || "";
    const m = hash.match(/^#blog\/(.+)$/);
    if (m) {
      const slug = decodeURIComponent(m[1]);
      const post = allPosts.find((p) => p.slug === slug) || allPosts.find((p) => p.id && String(p.id) === slug);
      if (post) {
        root.innerHTML = renderDetail(post);
        window.lucide && window.lucide.createIcons && window.lucide.createIcons();
        root.querySelector("[data-blog-share]")?.addEventListener("click", async (e) => {
          const btn = e.currentTarget;
          const url = `${location.origin}${location.pathname}#blog/${post.slug}`;
          try {
            if (navigator.share) {
              await navigator.share({ title: post.title, url });
            } else {
              await navigator.clipboard.writeText(url);
              const old = btn.innerHTML;
              btn.innerHTML = "Link Copied";
              setTimeout(() => (btn.innerHTML = old), 1500);
            }
          } catch (err) {}
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
  window.addEventListener("hashchange", render);
  document.addEventListener("click", (e) => {
    if (e.target.closest('[data-section-link="blog"]')) {
      setTimeout(() => { currentPage = 1; render(); }, 0);
    }
  });
};
