// ============================================================
// LOAD PORTFOLIO COMPONENTS & SECTIONS
// ============================================================

async function loadFile(targetId, file) {
  const target = document.getElementById(targetId);
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Could not load ${file}`);
    target.innerHTML = await response.text();
  } catch (error) {
    console.error(error);
    target.innerHTML =
      '<p class="py-10 text-sm text-zinc-500 dark:text-zinc-400">This section could not be loaded. Please refresh the page.</p>';
  }
}

// ============================================================
// LOAD CERTIFICATES FROM JSON
// ============================================================
// LOAD CERTIFICATES FROM JSON (COMPACT MINIMALIST BADGE CARDS)
// ============================================================

async function loadCertificates() {
  const container = document.getElementById("certificates-list");

  // Certificate section not loaded yet / not found
  if (!container) return;

  try {
    const certificates = window.getPortfolioCertificates
      ? await window.getPortfolioCertificates()
      : await (await fetch("data/certificates.json")).json();

    container.innerHTML = certificates
      .map((certificate) => {
        const skillsList = certificate.skills
          ? certificate.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        return `
          <article
            class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:border-indigo-400/80 hover:bg-white hover:shadow-md hover:shadow-indigo-500/5 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:hover:border-indigo-500/60 dark:hover:bg-zinc-900/90 dark:hover:shadow-indigo-500/10"
          >
            <!-- Top Subtle Indigo Gradient Highlight on Hover -->
            <div
              class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent transition-all duration-300 group-hover:via-indigo-500"
            ></div>

            <div>
              <!-- Header: Logo, Issuer, Date -->
              <div class="flex items-center justify-between gap-2.5">
                <div class="flex min-w-0 items-center gap-2.5">
                  <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200/70 bg-zinc-50/80 p-1 transition-transform duration-300 group-hover:scale-105 group-hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-800/80 dark:group-hover:border-indigo-800"
                  >
                    ${
                      certificate.logo
                        ? `<img src="${certificate.logo}" alt="${certificate.organization}" loading="lazy" class="h-full w-full object-contain" />`
                        : `<i class="h-4 w-4 text-indigo-500" data-lucide="award"></i>`
                    }
                  </div>
                  <span
                    class="truncate text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                  >
                    ${certificate.organization}
                  </span>
                </div>

                <span
                  class="shrink-0 rounded-full bg-zinc-100/90 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-400"
                >
                  ${certificate.date}
                </span>
              </div>

              <!-- Title -->
              <h4
                class="mt-3 text-sm font-bold leading-snug tracking-tight text-zinc-900 transition-colors duration-200 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400"
              >
                ${certificate.title}
              </h4>

              <!-- Skills / Topics Tags -->
              ${
                skillsList.length
                  ? `
                    <div class="mt-2.5 flex flex-wrap gap-1">
                      ${skillsList
                        .map(
                          (skill) => `
                          <span
                            class="inline-flex items-center gap-1 rounded-md border border-zinc-200/70 bg-zinc-50/80 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300"
                          >
                            <span class="h-1 w-1 rounded-full bg-indigo-500/70"></span>
                            ${skill}
                          </span>
                        `,
                        )
                        .join("")}
                    </div>
                  `
                  : ""
              }
            </div>

            <!-- Footer: Credential Link -->
            <div
              class="mt-3.5 flex items-center justify-end border-t border-zinc-100/80 pt-2.5 dark:border-zinc-800/60"
            >
              ${
                certificate.credential
                  ? `
                    <a
                      href="${certificate.credential}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      aria-label="View credential for ${certificate.title}"
                    >
                      <span>Show Credential</span>
                      <i
                        class="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        data-lucide="arrow-up-right"
                      ></i>
                    </a>
                  `
                  : ""
              }
            </div>
          </article>
        `;
      })
      .join("");

    // Render Lucide icons after certificates are created
    lucide.createIcons();
  } catch (error) {
    console.error("Certificates Error:", error);
  }
}

// ============================================================
// LOAD VOLUNTEERING FROM JSON
// ============================================================

async function loadVolunteering() {
  const container = document.getElementById("volunteering-list");

  if (!container) return;

  try {
    const volunteering = window.getPortfolioVolunteering
      ? await window.getPortfolioVolunteering()
      : await (await fetch("data/volunteering.json")).json();

    // Timeline line
    container.innerHTML = `
      <div
        class="absolute left-[6px] top-[7px] bottom-[7px] w-px bg-zinc-300 dark:bg-zinc-700"
      ></div>

      ${volunteering
        .map(
          (item, index) => `
            <div
              class="relative ${
                index !== volunteering.length - 1 ? "pb-10" : ""
              } pl-12"
            >

              <!-- Timeline Dot -->
              <div
                class="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-4 border-zinc-50 bg-indigo-400 dark:border-zinc-950 shadow-[0_0_0_2px_rgba(129,140,248,0.12)]"
              ></div>

              <!-- Title -->
              <h4 class="text-lg font-bold">
                ${item.title}
              </h4>

              <!-- Time -->
              <p class="mt-2 text-base font-medium text-indigo-500 dark:text-indigo-400">
                ${item.time}
              </p>

              <!-- Description -->
              <ul
                class="mt-4 space-y-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400"
              >
                ${item.description
                  .map((description) => `<li>• ${description}</li>`)
                  .join("")}
              </ul>

            </div>
          `,
        )
        .join("")}
    `;
  } catch (error) {
    console.error("Volunteering Error:", error);
  }
}

// ============================================================
// LOAD EXPERIENCE FROM JSON
// ============================================================

async function loadExperience() {
  const container = document.getElementById("experience-list");

  if (!container) return;

  try {
    const experience = window.getPortfolioExperience
      ? await window.getPortfolioExperience()
      : await (await fetch("data/experience.json")).json();

    if (!experience || experience.length === 0) {
      container.innerHTML = `
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No experience added yet.</p>
      `;
      return;
    }

    // Timeline line
    container.innerHTML = `
      <div
        class="absolute left-[6px] top-[7px] bottom-[7px] w-px bg-zinc-300 dark:bg-zinc-700"
      ></div>

      ${experience
        .map(
          (item, index) => `
            <div
              class="relative ${
                index !== experience.length - 1 ? "pb-10" : ""
              } pl-12"
            >

              <!-- Timeline Dot -->
              <div
                class="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-4 border-zinc-50 bg-indigo-400 dark:border-zinc-950 shadow-[0_0_0_2px_rgba(129,140,248,0.12)]"
              ></div>

              <!-- Title -->
              <h4 class="text-lg font-bold">
                ${item.title}${item.company ? ` <span class="font-normal text-zinc-500 dark:text-zinc-400">|</span> <span class="font-semibold text-zinc-700 dark:text-zinc-300">${item.company}</span>` : ""}
              </h4>

              <!-- Time -->
              <p class="mt-2 text-base font-medium text-indigo-500 dark:text-indigo-400">
                ${item.time}
              </p>

              <!-- Description -->
              <ul
                class="mt-4 space-y-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400"
              >
                ${(item.description || [])
                  .map((desc) => `<li>• ${desc}</li>`)
                  .join("")}
              </ul>

            </div>
          `,
        )
        .join("")}
    `;
  } catch (error) {
    console.error("Experience Error:", error);
    container.innerHTML = `
      <p class="text-sm text-zinc-500 dark:text-zinc-400">Experience could not be loaded.</p>
    `;
  }
}

// ============================================================
// LOAD SKILLS FROM JSON (COMPACT MODERN UI)
// ============================================================

async function loadSkills() {
  const container = document.getElementById("skills-list");
  if (!container) return;

  try {
    const skillsData = window.getPortfolioSkills
      ? await window.getPortfolioSkills()
      : await (await fetch("data/skills.json")).json();

    container.innerHTML = skillsData
      .map(
        (group) => `
        <div class="group relative rounded-2xl border border-zinc-200/90 bg-white/70 p-4 shadow-sm backdrop-blur-xs transition hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-indigo-500/40">
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-500 group-hover:text-white dark:bg-indigo-950/60 dark:text-indigo-400">
                <i class="h-3.5 w-3.5" data-lucide="${group.icon || "code-2"}"></i>
              </div>
              <h4 class="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                ${group.category}
              </h4>
            </div>
            <span class="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              ${(group.skills || []).length}
            </span>
          </div>

          <div class="flex flex-wrap gap-1.5">
            ${(group.skills || [])
              .map(
                (skill) => `
                <span class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/70 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:border-indigo-300 hover:bg-white hover:text-indigo-600 dark:border-zinc-800/90 dark:bg-zinc-950/60 dark:text-zinc-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-400">
                  <span class="h-1.5 w-1.5 rounded-full bg-indigo-500/80"></span>
                  ${skill}
                </span>
              `,
              )
              .join("")}
          </div>
        </div>
      `,
      )
      .join("");

    if (window.lucide) lucide.createIcons();
  } catch (error) {
    console.error("Skills loading error:", error);
  }
}
window.loadSkills = loadSkills;
window.loadExperience = loadExperience;
window.loadVolunteering = loadVolunteering;
window.loadCertificates = loadCertificates;

// ============================================================
// LOAD PROJECTS FROM JSON
// ============================================================

const escapeHTML = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const BTN =
  "inline-flex items-center rounded-full border px-3.5 py-1.5 transition";
const BTN_PRIMARY =
  "border-transparent bg-zinc-900 text-white hover:bg-indigo-500 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-500 dark:hover:text-white";
const BTN_OUTLINE =
  "border-zinc-300 hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700";

function projectCard(project, index) {
  const initials = project.title
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const link = (href, label, primary) =>
    href
      ? `<a href="${href}" target="_blank" rel="noopener noreferrer"
           class="${BTN} ${primary ? BTN_PRIMARY : BTN_OUTLINE}">${label} ↗</a>`
      : "";

  return `
    <article class="flex h-full flex-col group rounded-3xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div class="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-100 to-zinc-100 text-4xl font-bold tracking-tight text-indigo-300 dark:from-indigo-950 dark:to-zinc-800 dark:text-indigo-800">
        ${
          project.image
            ? `<img src="${project.image}" alt="${project.title}" loading="lazy"/>`
            : initials
        }
      </div>
      <div class="flex flex-1 flex-col pt-5">
        <div class="flex flex-wrap gap-1.5">
          ${project.technologies
            .map(
              (t) =>
                `<span class="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">${t}</span>`,
            )
            .join("")}
        </div>
        <h3 class="mt-3 text-xl font-bold">${project.title}</h3>
        
        <!-- for showing description in the project card -->
        <!-- <p class="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">${project.description}</p> -->

        <div class="mt-auto pt-5 flex flex-wrap gap-2 text-sm font-semibold">
          <button type="button" data-project-details="${index}" class="${BTN} ${BTN_PRIMARY}">View Details</button>

          <!-- ${link(project.liveDemo, "Live Demo", false)} -->
          <!-- ${link(project.github, "GitHub", false)} -->
          <!-- ${link(project.caseStudy, "Case Study", false)} -->
        </div>
      </div>
    </article>`;
}

// ---------- Details pop-up ----------
let projectModalKeyHandler = null;
let projectModalOpener = null;

function closeProjectModal() {
  document.getElementById("project-modal")?.remove();
  document.body.classList.remove("overflow-hidden");

  if (projectModalKeyHandler) {
    document.removeEventListener("keydown", projectModalKeyHandler);
  }

  projectModalKeyHandler = null;
  projectModalOpener?.focus();
  projectModalOpener = null;
}

function openProjectModal(project, opener) {
  closeProjectModal();
  projectModalOpener = opener || null;

  const paragraphs = project.details?.length ? project.details : [];

  const meta = [
    [
      "Timeline",
      project.timeline?.start && project.timeline?.end
        ? `${project.timeline.start} → ${project.timeline.end}`
        : null,
    ],
    ["Category", project.category],
  ].filter(([, v]) => v);

  const links = [
    ["Live Demo", project.liveDemo, true],
    ["GitHub", project.github],
  ]
    .filter(([, href]) => href)
    .map(
      ([label, href, primary]) =>
        `<a href="${escapeHTML(
          href,
        )}" target="_blank" rel="noopener noreferrer" class="${BTN} ${
          primary ? BTN_PRIMARY : BTN_OUTLINE
        }">${label} ↗</a>`,
    )
    .join("");

  const overlay = document.createElement("div");
  overlay.id = "project-modal";

  overlay.className =
    "fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6";

  overlay.innerHTML = `
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      class="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white p-6 text-zinc-900 shadow-2xl dark:bg-zinc-900 dark:text-zinc-100 sm:rounded-3xl sm:p-8"
    >

      ${
        project.image
          ? `<img
              src="${escapeHTML(project.image)}"
              alt="${escapeHTML(project.title)}"
              class="mb-6 max-h-[50vh] w-full rounded-2xl border border-zinc-200 bg-zinc-100 object-contain dark:border-zinc-800 dark:bg-zinc-800"
            />`
          : ""
      }

      <h3
        id="project-modal-title"
        class="text-2xl font-bold tracking-tight"
      >
        ${escapeHTML(project.title)}
      </h3>

      <!-- Technologies -->
      <div class="mt-3 flex flex-wrap gap-1.5">
        ${(project.technologies || [])
          .map(
            (t) =>
              `<span class="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">${escapeHTML(
                t,
              )}</span>`,
          )
          .join("")}
      </div>

      <!-- Timeline & Category -->
      ${
        meta.length
          ? `
            <dl class="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              ${meta
                .map(
                  ([k, v]) =>
                    `<div class="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
                      <dt class="text-zinc-500 dark:text-zinc-400">
                        ${escapeHTML(k)}
                      </dt>
                      <dd class="mt-0.5 font-semibold">
                        ${escapeHTML(v)}
                      </dd>
                    </div>`,
                )
                .join("")}
            </dl>
          `
          : ""
      }

      <!-- About Project -->
      ${
        paragraphs.length
          ? `
            <section class="mt-6">
              <h4 class="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                About Project
              </h4>

              <div class="mt-3 space-y-3 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
                ${paragraphs.map((p) => `<p>${escapeHTML(p)}</p>`).join("")}
              </div>
            </section>
          `
          : ""
      }

      <!-- Key Features -->
      ${
        project.features?.length
          ? `
            <section class="mt-6">
              <h4 class="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Key Features
              </h4>

              <ul class="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
                ${project.features
                  .map((f) => `<li>${escapeHTML(f)}</li>`)
                  .join("")}
              </ul>
            </section>
          `
          : ""
      }

      <!-- Back button + Project Links -->
      <div class="mt-7 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
        <button
          type="button"
          data-close
          class="${BTN} ${BTN_OUTLINE}"
        >
          ← Back
        </button>

        ${
          links
            ? `<div class="flex flex-wrap gap-2">
                ${links}
              </div>`
            : ""
        }
      </div>
    </div>
  `;

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.closest("[data-close]")) {
      closeProjectModal();
    }
  });

  projectModalKeyHandler = (e) => {
    if (e.key === "Escape") {
      closeProjectModal();
    }
  };

  document.addEventListener("keydown", projectModalKeyHandler);

  document.body.appendChild(overlay);
  document.body.classList.add("overflow-hidden");

  overlay.querySelector("[data-close]")?.focus();
}

async function loadProjects() {
  try {
    const projects = window.getPortfolioProjects
      ? await window.getPortfolioProjects()
      : await (await fetch("data/projects.json")).json();
    window._currentProjectsList = projects;
    const featured = projects.filter((p) => p.featured === true);

    const render = (container, list) => {
      if (container)
        container.innerHTML = list
          .map((p) => projectCard(p, projects.indexOf(p)))
          .join("");
    };

    // One click handler for every "View Details" button (Home + Projects page)
    if (!window._projectDetailsListenerAttached) {
      document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-project-details]");
        if (btn && window._currentProjectsList)
          openProjectModal(window._currentProjectsList[Number(btn.dataset.projectDetails)], btn);
      });
      window._projectDetailsListenerAttached = true;
    }

    const categorySelect = document.getElementById("project-category");
    const projectsGrid = document.getElementById("projectsGrid");

    if (categorySelect) {
      const categories = [...new Set(projects.map((p) => p.category))];
      categorySelect.innerHTML = `
        <option value="featured">Featured Projects</option>
        <option value="all">All Projects</option>
        ${categories.map((c) => `<option value="${c}">${c}</option>`).join("")}`;
      categorySelect.value = "all";

      categorySelect.addEventListener("change", () => {
        const value = categorySelect.value;
        render(
          projectsGrid,
          value === "featured"
            ? featured
            : value === "all"
              ? projects
              : projects.filter((p) => p.category === value),
        );
        lucide.createIcons();
      });
    }

    render(projectsGrid, projects);
    render(document.getElementById("featured-projects-list"), featured);
    lucide.createIcons();
  } catch (error) {
    console.error("Projects Error:", error);
  }
}

// ============================================================
// LOAD ALL PORTFOLIO COMPONENTS
// ============================================================

async function loadPortfolio() {
  await Promise.all([
    loadFile("navbar", "components/navbar.html"),
    loadFile("sidebar", "components/sidebar.html"),
    loadFile("footer", "components/footer.html"),
    loadFile("home-section", "sections/home.html"),
    loadFile("about-section", "sections/about.html"),
    loadFile("projects-section", "sections/projects.html"),
    loadFile("resume-section", "sections/resume.html"),
    loadFile("blog-section", "sections/blog.html"),
    loadFile("contact-section", "sections/contact.html"),
    loadFile("admin-section", "sections/admin.html"),
  ]);

  // Load certificates after resume section is loaded
  await loadCertificates();

  // Load experience after resume section is loaded
  await loadExperience();

  // Load volunteering after resume section is loaded
  await loadVolunteering();

  // Load skills after resume section is loaded
  await loadSkills();

  // Load projects
  await loadProjects();

  // Initialize admin panel and apply profile & about content
  if (window.initAdminPanel) await window.initAdminPanel();
  if (window.applyProfileContent) window.applyProfileContent();
  if (window.applyAboutContent) window.applyAboutContent();

  // Blog feed (likes / comments)
  if (window.loadBlog) await window.loadBlog();

  // Initialize all portfolio functionality
  initializePortfolio();
}

// ============================================================
// EXISTING PORTFOLIO FUNCTIONALITY
// ============================================================

function initializePortfolio() {
  // Render Lucide icons after HTML is loaded
  lucide.createIcons();

  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  // ==========================================================
  // PERSIST THEME
  // ==========================================================

  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }

  // ==========================================================
  // THEME TOGGLE
  // ==========================================================

  themeToggle?.addEventListener("click", () => {
    html.classList.toggle("dark");

    localStorage.theme = html.classList.contains("dark") ? "dark" : "light";
  });

  // ==========================================================
  // MOBILE MENU
  // ==========================================================

  mobileMenuBtn?.addEventListener("click", () => {
    const isHidden = mobileMenu?.classList.toggle("hidden");
    mobileMenuBtn.setAttribute("aria-expanded", String(!isHidden));
  });

  // ==========================================================
  // SINGLE-VIEW NAVIGATION
  // ==========================================================

  const sectionMap = {
    home: "home-section",
    about: "about-section",
    projects: "projects-section",
    resume: "resume-section",
    blog: "blog-section",
    contact: "contact-section",
    admin: "admin-section",
  };

  function showSection(sectionName, updateHash = true) {
    const targetId = sectionMap[sectionName]
      ? sectionMap[sectionName]
      : sectionMap.home;

    const activeName = sectionMap[sectionName] ? sectionName : "home";

    // Show / hide sections
    Object.values(sectionMap).forEach((id) => {
      const section = document.getElementById(id);

      section?.classList.toggle("hidden", id !== targetId);
    });

    const activeSection = document.getElementById(targetId);
    activeSection?.classList.remove("section-fade");
    void activeSection?.offsetWidth;
    activeSection?.classList.add("section-fade");

    // ========================================================
    // HIGHLIGHT ACTIVE NAVIGATION ITEM
    // ========================================================

    document.querySelectorAll("[data-section-link]").forEach((link) => {
      const isActive = link.dataset.sectionLink === activeName;

      link.classList.toggle("text-indigo-500", isActive);

      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    // ========================================================
    // UPDATE URL HASH
    // ========================================================

    if (updateHash && window.location.hash !== `#${activeName}`) {
      history.pushState(null, "", `#${activeName}`);
    }

    // ========================================================
    // SCROLL TO TOP
    // ========================================================

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Close mobile menu
    mobileMenu?.classList.add("hidden");
    mobileMenuBtn?.setAttribute("aria-expanded", "false");
  }

  // ==========================================================
  // NAVIGATION CLICK EVENTS
  // ==========================================================

  document.querySelectorAll("[data-section-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      showSection(link.dataset.sectionLink);
    });
  });

  // ==========================================================
  // INITIAL SECTION
  // ==========================================================

  const initialSection = window.location.hash.replace("#", "").split("/")[0];

  showSection(sectionMap[initialSection] ? initialSection : "home", false);

  // Back / forward buttons and manual hash changes
  window.addEventListener("hashchange", () => {
    const name = window.location.hash.replace("#", "").split("/")[0];
    showSection(sectionMap[name] ? name : "home", false);
  });

  // ==========================================================
  // CONTACT FORM SUBMISSION
  // ==========================================================

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("contact-name")?.value.trim() || "";
      const email = document.getElementById("contact-email")?.value.trim() || "";
      const message = document.getElementById("contact-message")?.value.trim() || "";

      const subject = encodeURIComponent(`Portfolio Message from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      
      window.location.href = `mailto:farhanchowdhury7389@gmail.com?subject=${subject}&body=${body}`;
    });
  }
}

// ============================================================
// START PORTFOLIO
// ============================================================

loadPortfolio().catch((error) => {
  console.error("Portfolio loading error:", error);
});
