// Blog: a list of post titles; clicking one opens it as a Facebook-style post.
// Posts live in data/posts.json. No database needed.
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
  const when = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  let posts = [];
  try {
    const res = await fetch("data/posts.json");
    if (!res.ok) throw new Error("posts.json");
    posts = (await res.json()).sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
  } catch (e) {
    root.innerHTML =
      '<p class="text-sm text-zinc-500 dark:text-zinc-400">Posts could not be loaded.</p>';
    return;
  }

  const list = () => `
    <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
      ${posts
        .map(
          (p) => `
        <a href="#blog/${esc(p.slug)}" class="group flex items-center justify-between gap-4 py-6">
          <div>
            <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400">${esc(p.category || "Post")} · ${when(p.date)}</p>
            <h3 class="mt-2 text-lg font-bold group-hover:text-indigo-500">${esc(p.title)}</h3>
          </div>
          <span class="text-sm font-semibold text-zinc-500 group-hover:text-indigo-500 dark:text-zinc-400">Read →</span>
        </a>`,
        )
        .join("")}
    </div>`;

  const detail = (p) => `
    <a href="#blog" class="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-600 transition hover:text-indigo-500 dark:text-zinc-400">
      <i class="h-4 w-4" data-lucide="arrow-left"></i>All posts
    </a>
    <article class="mt-5 rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <header class="flex items-center gap-3">
        <span class="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <img src="images/farhan.png" alt="" class="h-full w-full origin-[51%_52%] scale-[1.7] object-cover object-top" />
        </span>
        <div>
          <p class="text-sm font-semibold">Farhan Chowdhury</p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">${when(p.date)} · ${esc(p.category || "Post")}</p>
        </div>
      </header>
      <h3 class="mt-5 text-xl font-bold">${esc(p.title)}</h3>
      <div class="mt-3 space-y-3 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
        ${(p.text || []).map((t) => `<p>${esc(t)}</p>`).join("")}
      </div>
      ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" class="mt-5 w-full rounded-2xl border border-zinc-200 object-cover dark:border-zinc-800" />` : ""}
      ${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener noreferrer" class="mt-5 inline-block text-sm font-semibold text-indigo-500 hover:underline">View project ↗</a>` : ""}
      <div class="mt-5 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <button type="button" data-share class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
          <i class="h-4 w-4" data-lucide="share-2"></i><span>Share</span>
        </button>
      </div>
    </article>`;

  function render() {
    const m = window.location.hash.match(/^#blog\/(.+)$/);
    const post = m && posts.find((p) => p.slug === decodeURIComponent(m[1]));
    root.innerHTML = post ? detail(post) : list();
    window.lucide && lucide.createIcons();
    if (post) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      root
        .querySelector("[data-share]")
        .addEventListener("click", async (e) => {
          const label = e.currentTarget.querySelector("span");
          const url = `${location.origin}${location.pathname}#blog/${post.slug}`;
          try {
            if (navigator.share)
              await navigator.share({ title: post.title, url });
            else {
              await navigator.clipboard.writeText(url);
              label.textContent = "Link copied";
              setTimeout(() => (label.textContent = "Share"), 1800);
            }
          } catch (err) {
            /* cancelled */
          }
        });
    }
  }

  render();
  window.addEventListener("hashchange", render);
  // Clicking "Blog" in the nav while reading a post should return to the list
  document.addEventListener("click", (e) => {
    if (e.target.closest('[data-section-link="blog"]')) setTimeout(render, 0);
  });
};
