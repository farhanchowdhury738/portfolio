// ============================================================
// LOAD PORTFOLIO COMPONENTS & SECTIONS
// ============================================================

async function loadFile(targetId, file) {
  const response = await fetch(file);

  if (!response.ok) {
    throw new Error(`Could not load ${file}`);
  }

  document.getElementById(targetId).innerHTML = await response.text();
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
                alt="${certificate.organization}"
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
            <p class="mt-1 text-base font-medium text-indigo-400">
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
                class="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-4 border-zinc-950 bg-indigo-400 shadow-[0_0_0_2px_rgba(129,140,248,0.12)]"
              ></div>

              <!-- Title -->
              <h4 class="text-lg font-bold">
                ${item.title}
              </h4>

              <!-- Time -->
              <p class="mt-2 text-base font-medium text-indigo-400">
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
    mobileMenu?.classList.toggle("hidden");
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

    // ========================================================
    // HIGHLIGHT ACTIVE NAVIGATION ITEM
    // ========================================================

    document.querySelectorAll("[data-section-link]").forEach((link) => {
      const isActive = link.dataset.sectionLink === activeName;

      link.classList.toggle("text-indigo-500", isActive);
    });

    // ========================================================
    // UPDATE URL HASH
    // ========================================================

    if (updateHash) {
      history.replaceState(null, "", `#${activeName}`);
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

  // ==========================================================
  // SHOW / HIDE ALL PROJECTS
  // ==========================================================

  const viewAllProjects = document.getElementById("viewAllProjects");

  const viewAllProjectsMobile = document.getElementById(
    "viewAllProjectsMobile",
  );

  const extraProjects = document.querySelectorAll(".extra-project");

  function toggleProjects() {
    const isHidden = extraProjects[0]?.classList.contains("hidden");

    extraProjects.forEach((project) => {
      project.classList.toggle("hidden", !isHidden);
    });

    if (viewAllProjects) {
      viewAllProjects.textContent = isHidden ? "Show less ↑" : "View all →";
    }

    if (viewAllProjectsMobile) {
      viewAllProjectsMobile.textContent = isHidden
        ? "Show less ↑"
        : "View all →";
    }
  }

  viewAllProjects?.addEventListener("click", toggleProjects);

  viewAllProjectsMobile?.addEventListener("click", toggleProjects);
}

// ============================================================
// START PORTFOLIO
// ============================================================

loadPortfolio().catch((error) => {
  console.error("Portfolio loading error:", error);
});
