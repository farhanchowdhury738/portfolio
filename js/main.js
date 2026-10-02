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

  initializePortfolio();
}

// ============================================================
// EXISTING PORTFOLIO FUNCTIONALITY
// ============================================================

function initializePortfolio() {
  // Render Lucide icons after the HTML is loaded.
  lucide.createIcons();

  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  // Persist theme
  if (
    localStorage.theme === "dark" ||
    (!('theme' in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }

  themeToggle?.addEventListener("click", () => {
    html.classList.toggle("dark");
    localStorage.theme = html.classList.contains("dark") ? "dark" : "light";
  });

  mobileMenuBtn?.addEventListener("click", () => {
    mobileMenu?.classList.toggle("hidden");
  });

  document.querySelectorAll("#mobileMenu a").forEach((link) => {
    link.addEventListener("click", () => mobileMenu?.classList.add("hidden"));
  });

  // ==========================================================
  // SHOW / HIDE ALL PROJECTS
  // ==========================================================

  const viewAllProjects = document.getElementById("viewAllProjects");
  const viewAllProjectsMobile = document.getElementById("viewAllProjectsMobile");
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
      viewAllProjectsMobile.textContent = isHidden ? "Show less ↑" : "View all →";
    }
  }

  viewAllProjects?.addEventListener("click", toggleProjects);
  viewAllProjectsMobile?.addEventListener("click", toggleProjects);
}

loadPortfolio().catch((error) => {
  console.error("Portfolio loading error:", error);
});
