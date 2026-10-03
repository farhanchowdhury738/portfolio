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
    const targetId = sectionMap[sectionName] ? sectionMap[sectionName] : sectionMap.home;
    const activeName = sectionMap[sectionName] ? sectionName : "home";

    Object.values(sectionMap).forEach((id) => {
      const section = document.getElementById(id);
      section?.classList.toggle("hidden", id !== targetId);
    });

    // Highlight the current navigation item.
    document.querySelectorAll("[data-section-link]").forEach((link) => {
      const isActive = link.dataset.sectionLink === activeName;
      link.classList.toggle("text-indigo-500", isActive);
    });

    if (updateHash) {
      history.replaceState(null, "", `#${activeName}`);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    mobileMenu?.classList.add("hidden");
  }

  document.querySelectorAll("[data-section-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showSection(link.dataset.sectionLink);
    });
  });

  const initialSection = window.location.hash.replace("#", "");
  showSection(sectionMap[initialSection] ? initialSection : "home", false);

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
  