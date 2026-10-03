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

async function loadCertificates() {
  const container = document.getElementById("certificates-list");

  // Certificate section not loaded yet / not found
  if (!container) return;

  try {
    const response = await fetch("data/certificates.json");

    if (!response.ok) {
      throw new Error("Failed to load certificates.json");
    }

    const certificates = await response.json();

    container.innerHTML = certificates
      .map(
        (certificate) => `
          <div class="ml-7">

            <!-- Title + Logo -->
            <div class="flex items-center gap-3">
              <img
                src="${certificate.logo}"
                alt="${certificate.organization} logo" loading="lazy" width="40" height="40"
                class="h-10 w-10 shrink-0 rounded-lg object-contain"
              />

              <h4 class="text-lg font-bold">
                ${certificate.title}
              </h4>
            </div>

            <!-- Organization -->
            <p class="mt-1 text-base text-zinc-500 dark:text-zinc-400">
              ${certificate.organization}
            </p>

            <!-- Date -->
            <p class="mt-1 text-base font-medium text-indigo-500 dark:text-indigo-400">
              ${certificate.date}
            </p>

            <!-- Credential -->
            <a
              href="${certificate.credential}"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-400 px-3.5 py-1.5 text-sm font-semibold text-zinc-700 transition hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-500 dark:text-zinc-300 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
            >
              Show credential
              <i class="h-4 w-4" data-lucide="external-link"></i>
            </a>

            <!-- Skills -->
            ${
              certificate.skills
                ? `
                  <p class="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
                    <span class="font-bold">Skills:</span>
                    ${certificate.skills}
                  </p>
                `
                : ""
            }

          </div>
        `,
      )
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
    const response = await fetch("data/volunteering.json");

    if (!response.ok) {
      throw new Error("Failed to load volunteering.json");
    }

    const volunteering = await response.json();

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
// LOAD PROJECTS FROM JSON
// ============================================================

function projectCard(project) {
  const initials = project.title
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const link = (href, label, primary) =>
    href
      ? `<a href="${href}" target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center rounded-full border px-3.5 py-1.5 transition ${
             primary
               ? "border-transparent bg-zinc-900 text-white hover:bg-indigo-500 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-500 dark:hover:text-white"
               : "border-zinc-300 hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700"
           }">${label} ↗</a>`
      : "";

  return `
    <article class="group rounded-3xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div class="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-100 to-zinc-100 text-4xl font-bold tracking-tight text-indigo-300 dark:from-indigo-950 dark:to-zinc-800 dark:text-indigo-800">
        ${
          project.image
            ? `<img src="${project.image}" alt="${project.title}" loading="lazy" class="h-full w-full object-cover object-top" />`
            : initials
        }
      </div>
      <div class="pt-5">
        <div class="flex flex-wrap gap-1.5">
          ${project.technologies
            .map(
              (t) =>
                `<span class="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">${t}</span>`,
            )
            .join("")}
        </div>
        <h3 class="mt-3 text-xl font-bold">${project.title}</h3>
        <p class="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">${project.description}</p>
        <div class="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
          ${link(project.liveDemo, "Live Demo", true)}
          ${link(project.github, "GitHub", false)}
          ${link(project.caseStudy, "Case Study", false)}
        </div>
      </div>
    </article>`;
}

async function loadProjects() {
  try {
    const response = await fetch("data/projects.json");
    if (!response.ok) throw new Error("Failed to load projects.json");
    const projects = await response.json();
    const featured = projects.filter((p) => p.featured === true);

    const render = (container, list) => {
      if (container) container.innerHTML = list.map(projectCard).join("");
    };

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
  ]);

  // Load certificates after resume section is loaded
  await loadCertificates();

  // Load loadVolunteering after resume section is loaded
  await loadVolunteering();

  // Load loadVolunteering after resume section is loaded
  await loadProjects();

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

  const initialSection = window.location.hash.replace("#", "");

  showSection(sectionMap[initialSection] ? initialSection : "home", false);

  // Back / forward buttons and manual hash changes
  window.addEventListener("hashchange", () => {
    const name = window.location.hash.replace("#", "");
    showSection(sectionMap[name] ? name : "home", false);
  });
}

// ============================================================
// START PORTFOLIO
// ============================================================

loadPortfolio().catch((error) => {
  console.error("Portfolio loading error:", error);
});
