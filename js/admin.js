// ============================================================
// ADMIN DASHBOARD & CONTENT MANAGEMENT SYSTEM
// Protected by password: farhan@
// Direct file sync to data/*.json via server API
// ============================================================

(function () {
  const ADMIN_PASSWORD = "farhan@";
  const AUTH_KEY = "portfolio_admin_auth";

  // Storage Keys
  const KEY_PROJECTS = "portfolio_projects";
  const KEY_CERTS = "portfolio_certificates";
  const KEY_EXP = "portfolio_experience";
  const KEY_VOL = "portfolio_volunteering";
  const KEY_SKILLS = "portfolio_skills";
  const KEY_PROFILE = "portfolio_profile";
  const KEY_ABOUT = "portfolio_about";

  // In-memory state
  let projectsState = [];
  let certsState = [];
  let expState = [];
  let volState = [];
  let skillsState = [];
  let profileState = {};
  let aboutState = {};

  // Utility: Show Toast Notification
  function showToast(message) {
    const toast = document.getElementById("admin-toast");
    const msg = document.getElementById("admin-toast-msg");
    if (!toast || !msg) return;
    msg.textContent = message;
    toast.classList.remove("opacity-0", "translate-y-10");
    toast.classList.add("opacity-100", "translate-y-0");

    setTimeout(() => {
      toast.classList.remove("opacity-100", "translate-y-0");
      toast.classList.add("opacity-0", "translate-y-10");
    }, 2800);
  }

  // Utility: Download JSON file
  function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  }

  // Utility: Copy to Clipboard
  async function copyToClipboard(text, label = "Data") {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard!`);
    } catch (err) {
      console.error(err);
      showToast("Failed to copy. Please try again.");
    }
  }

  // Helper: Save to server API directly on disk
  async function saveToServer(endpoint, filename, data, storageKey) {
    // 1. Update localStorage cache
    localStorage.setItem(storageKey, JSON.stringify(data));

    // 2. Persist to actual physical file on disk via server
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showToast(`Saved to data/${filename}!`);
        return true;
      } else {
        const errText = await response.text();
        console.error(`Failed to save to server (/api/${endpoint}):`, response.status, errText);
        showToast(`Server error ${response.status}: not saved to disk`);
        return false;
      }
    } catch (error) {
      console.warn("Server save API unreachable (check if node server.js is running):", error);
      showToast(`Saved in browser only (server offline)`);
      return false;
    }
  }

  // ==========================================================
  // DATA ACCESS HELPERS
  // ==========================================================

  window.getPortfolioProjects = async function () {
    try {
      const res = await fetch("data/projects.json", { cache: "no-store" });
      if (res.ok) {
        projectsState = await res.json();
        localStorage.setItem(KEY_PROJECTS, JSON.stringify(projectsState));
        return projectsState;
      }
    } catch (e) {
      console.warn("Could not fetch fresh projects.json, checking cache...", e);
    }
    const cached = localStorage.getItem(KEY_PROJECTS);
    if (cached) {
      try {
        projectsState = JSON.parse(cached);
      } catch (e) { }
    }
    return projectsState;
  };

  window.getPortfolioCertificates = async function () {
    try {
      const res = await fetch("data/certificates.json", { cache: "no-store" });
      if (res.ok) {
        certsState = await res.json();
        localStorage.setItem(KEY_CERTS, JSON.stringify(certsState));
        return certsState;
      }
    } catch (e) {
      console.warn("Could not fetch fresh certificates.json, checking cache...", e);
    }
    const cached = localStorage.getItem(KEY_CERTS);
    if (cached) {
      try {
        certsState = JSON.parse(cached);
      } catch (e) { }
    }
    return certsState;
  };

  window.getPortfolioExperience = async function () {
    try {
      const res = await fetch("data/experience.json", { cache: "no-store" });
      if (res.ok) {
        expState = await res.json();
        localStorage.setItem(KEY_EXP, JSON.stringify(expState));
        return expState;
      }
    } catch (e) {
      console.warn("Could not fetch fresh experience.json, checking cache...", e);
    }
    const cached = localStorage.getItem(KEY_EXP);
    if (cached) {
      try {
        expState = JSON.parse(cached);
      } catch (e) { }
    }
    return expState;
  };

  window.getPortfolioVolunteering = async function () {
    try {
      const res = await fetch("data/volunteering.json", { cache: "no-store" });
      if (res.ok) {
        volState = await res.json();
        localStorage.setItem(KEY_VOL, JSON.stringify(volState));
        return volState;
      }
    } catch (e) {
      console.warn("Could not fetch fresh volunteering.json, checking cache...", e);
    }
    const cached = localStorage.getItem(KEY_VOL);
    if (cached) {
      try {
        volState = JSON.parse(cached);
      } catch (e) { }
    }
    return volState;
  };

  window.getPortfolioSkills = async function () {
    try {
      const res = await fetch("data/skills.json", { cache: "no-store" });
      if (res.ok) {
        skillsState = await res.json();
        localStorage.setItem(KEY_SKILLS, JSON.stringify(skillsState));
        return skillsState;
      }
    } catch (e) {
      console.warn("Could not fetch fresh skills.json, checking cache...", e);
    }
    const cached = localStorage.getItem(KEY_SKILLS);
    if (cached) {
      try {
        skillsState = JSON.parse(cached);
        return skillsState;
      } catch (e) { }
    }
    try {
      const res = await fetch("data/skills.json");
      skillsState = await res.json();
    } catch (e) {
      console.error("Error fetching skills.json", e);
      skillsState = [
        {
          category: "Programming Languages",
          icon: "code-2",
          skills: ["PHP", "JavaScript", "Python", "R", "C / C++"],
        },
        {
          category: "Web Technologies",
          icon: "globe",
          skills: ["React", "Next.js", "Tailwind CSS", "Node.js", "REST APIs", "HTML5 & CSS3"],
        },
        {
          category: "Data Science & AI",
          icon: "brain",
          skills: ["Machine Learning", "Data Analysis", "Pandas", "NumPy", "Scikit-Learn", "NLP"],
        },
        {
          category: "Databases & Tools",
          icon: "database",
          skills: ["MySQL", "Git & GitHub", "Docker", "VS Code", "Postman", "Linux"],
        },
      ];
    }
    return skillsState;
  };

  window.getPortfolioProfile = async function () {
    try {
      const res = await fetch("data/profile.json", { cache: "no-store" });
      if (res.ok) {
        profileState = await res.json();
        localStorage.setItem(KEY_PROFILE, JSON.stringify(profileState));
        return profileState;
      }
    } catch (e) {
      console.warn("Could not fetch fresh profile.json, checking cache...", e);
    }
    const cached = localStorage.getItem(KEY_PROFILE);
    if (cached) {
      try {
        profileState = JSON.parse(cached);
        return profileState;
      } catch (e) { }
    }
    try {
      const res = await fetch("data/profile.json");
      profileState = await res.json();
    } catch (e) {
      console.error("Error fetching profile.json", e);
      profileState = {
        name: "Farhan Chowdhury",
        role: "Bsc in CSE",
        desc: "I build practical software projects and explore web development, AI, data science, and modern technologies.",
        email: "farhanchowdhury7389@gmail.com",
        location: "Bangladesh",
        github: "https://github.com/farhanchowdhury738/",
        linkedin: "https://www.linkedin.com/in/farhanchowdhury738/",
        heroHeadline: "Exploring technology by building real things.",
        heroIntro: "I'm a Computer Science student and developer interested in web development, software engineering, data science, and AI. I enjoy turning ideas into practical solutions and learning by building.",
      };
    }
    return profileState;
  };

  window.getPortfolioAbout = async function () {
    try {
      const res = await fetch("data/about.json", { cache: "no-store" });
      if (res.ok) {
        aboutState = await res.json();
        localStorage.setItem(KEY_ABOUT, JSON.stringify(aboutState));
        return aboutState;
      }
    } catch (e) {
      console.warn("Could not fetch fresh about.json, checking cache...", e);
    }
    const cached = localStorage.getItem(KEY_ABOUT);
    if (cached) {
      try {
        aboutState = JSON.parse(cached);
        return aboutState;
      } catch (e) { }
    }
    try {
      const res = await fetch("data/about.json");
      aboutState = await res.json();
    } catch (e) {
      console.error("Error fetching about.json", e);
      aboutState = {
        title: "About me",
        p1: "I'm a Computer Science student at American International University-Bangladesh (AIUB) with a strong interest in software development and modern technology. I enjoy building practical web applications, exploring data science and machine learning, and learning new tools through hands-on projects.",
        p2: "My approach is simple: learn by building, understand how things work, and turn ideas into useful solutions. I'm continuously improving my skills across web development, software engineering, AI, and data-driven technologies.",
        p3: "",
        studying: "B.Sc. in CSE, AIUB",
        based: "Bangladesh",
        focus: "Web, Data Science, AI",
        interests: [
          "Software Development",
          "Web Development",
          "Data Science",
          "AI & Machine Learning",
        ],
      };
    }
    return aboutState;
  };

  // Synchronous getter for already loaded state or cache
  function getCachedProfile() {
    if (profileState && Object.keys(profileState).length > 0) return profileState;
    const cached = localStorage.getItem(KEY_PROFILE);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { }
    }
    return profileState;
  }

  function getCachedAbout() {
    if (aboutState && Object.keys(aboutState).length > 0) return aboutState;
    const cached = localStorage.getItem(KEY_ABOUT);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { }
    }
    return aboutState;
  }

  window.applyProfileContent = async function () {
    const prof = await window.getPortfolioProfile();
    if (!prof) return;

    const nameEl = document.getElementById("profile-name");
    if (nameEl && prof.name) nameEl.textContent = prof.name;

    const roleEl = document.getElementById("profile-role");
    if (roleEl && prof.role) roleEl.textContent = prof.role;

    const descEl = document.getElementById("profile-desc");
    if (descEl && prof.desc) descEl.textContent = prof.desc;

    const emailEl = document.getElementById("profile-email");
    if (emailEl && prof.email) {
      emailEl.textContent = prof.email;
      const emailLink = emailEl.closest("a");
      if (emailLink) emailLink.href = `mailto:${prof.email}`;
    }

    const locEl = document.getElementById("profile-location");
    if (locEl && prof.location) locEl.textContent = prof.location;

    const ghEl = document.getElementById("profile-github");
    if (ghEl && prof.github) ghEl.href = prof.github;

    const inEl = document.getElementById("profile-linkedin");
    if (inEl && prof.linkedin) inEl.href = prof.linkedin;

    const heroHeadlineEl = document.getElementById("profile-hero-headline");
    if (heroHeadlineEl && prof.heroHeadline) {
      heroHeadlineEl.innerHTML = `Exploring technology by <span class="text-indigo-500"> building real things. </span>`;
    }

    const heroIntroEl = document.getElementById("profile-hero-intro");
    if (heroIntroEl && prof.heroIntro) heroIntroEl.textContent = prof.heroIntro;
  };

  window.applyAboutContent = async function () {
    const about = await window.getPortfolioAbout();
    if (!about) return;

    const titleEl = document.getElementById("profile-about-title");
    if (titleEl && about.title) titleEl.textContent = about.title;

    const p1El = document.getElementById("profile-about-p1");
    if (p1El && about.p1) p1El.textContent = about.p1;

    const p2El = document.getElementById("profile-about-p2");
    if (p2El && about.p2) p2El.textContent = about.p2;

    const p3El = document.getElementById("profile-about-p3");
    if (p3El) {
      if (about.p3 && about.p3.trim()) {
        p3El.textContent = about.p3;
        p3El.classList.remove("hidden");
      } else {
        p3El.classList.add("hidden");
      }
    }

    const studyingEl = document.getElementById("profile-studying");
    if (studyingEl && about.studying) studyingEl.textContent = about.studying;

    const basedEl = document.getElementById("profile-based");
    if (basedEl && about.based) basedEl.textContent = about.based;

    const focusEl = document.getElementById("profile-focus");
    if (focusEl && about.focus) focusEl.textContent = about.focus;

    const interestsContainer = document.getElementById("profile-interests");
    if (interestsContainer && Array.isArray(about.interests)) {
      interestsContainer.innerHTML = about.interests
        .map(
          (tag) =>
            `<span class="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-xs font-medium dark:border-zinc-800 dark:bg-zinc-900">${tag}</span>`,
        )
        .join("");
    }
  };

  // ==========================================================
  // MODAL MANAGEMENT
  // ==========================================================

  function openAdminModal(title, formHtml, onSave) {
    const modal = document.getElementById("admin-modal");
    const titleEl = document.getElementById("admin-modal-title");
    const bodyEl = document.getElementById("admin-modal-body");
    const closeBtn = document.getElementById("admin-modal-close-btn");

    if (!modal || !bodyEl) return;

    titleEl.textContent = title;
    bodyEl.innerHTML = formHtml;
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    if (window.lucide) lucide.createIcons();

    const form = bodyEl.querySelector("form");
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const success = await onSave(form);
        if (success !== false) {
          closeAdminModal();
        }
      };
    }

    const cancelBtn = bodyEl.querySelector("[data-admin-cancel]");
    if (cancelBtn) {
      cancelBtn.onclick = () => closeAdminModal();
    }

    closeBtn.onclick = () => closeAdminModal();
    modal.onclick = (e) => {
      if (e.target === modal) closeAdminModal();
    };
  }

  function closeAdminModal() {
    const modal = document.getElementById("admin-modal");
    if (!modal) return;
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  // ==========================================================
  // RENDER ADMIN LISTS
  // ==========================================================

  function renderAdminProjects() {
    const container = document.getElementById("admin-projects-list");
    const countBadge = document.getElementById("admin-projects-count");
    if (countBadge) countBadge.textContent = projectsState.length;
    if (!container) return;

    if (projectsState.length === 0) {
      container.innerHTML = `<p class="py-10 text-center text-sm text-zinc-500">No projects found. Click "Add Project" to create one.</p>`;
      return;
    }

    container.innerHTML = projectsState
      .map((p, idx) => {
        const techs = (p.technologies || []).slice(0, 3).join(", ");
        return `
        <div class="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
          <div class="flex items-start gap-4">
            <!-- Rank Indicator & Reorder Arrows -->
            <div class="flex items-center gap-1.5">
              <span class="flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-indigo-50 px-2 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" title="Current Rank: #${idx + 1}">
                #${idx + 1}
              </span>
              <div class="flex flex-col gap-0.5">
                <button
                  type="button"
                  data-admin-move-project-up="${idx}"
                  ${idx === 0 ? "disabled" : ""}
                  title="Move Up in Rank"
                  class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:opacity-20 disabled:pointer-events-none dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
                >
                  <i class="h-3 w-3" data-lucide="chevron-up"></i>
                </button>
                <button
                  type="button"
                  data-admin-move-project-down="${idx}"
                  ${idx === projectsState.length - 1 ? "disabled" : ""}
                  title="Move Down in Rank"
                  class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:opacity-20 disabled:pointer-events-none dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
                >
                  <i class="h-3 w-3" data-lucide="chevron-down"></i>
                </button>
              </div>
            </div>

            <div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
              ${p.image
            ? `<img src="${p.image}" alt="${p.title}" class="h-full w-full object-cover" />`
            : `<span class="text-xs font-bold text-zinc-400">#${idx + 1}</span>`
          }
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="text-base font-bold">${p.title}</h4>
                ${p.featured
            ? `<span class="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">Featured</span>`
            : ""
          }
                <span class="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-800">${p.category || "General"}</span>
              </div>
              <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                ${techs ? `Tech: ${techs}` : "No tech listed"} · ${p.timeline ? `${p.timeline.start || ""} - ${p.timeline.end || ""}` : ""}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              data-admin-edit-project="${idx}"
              class="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700 dark:text-zinc-300"
            >
              Edit
            </button>
            <button
              type="button"
              data-admin-delete-project="${idx}"
              class="rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
            >
              Delete
            </button>
          </div>
        </div>
      `;
      })
      .join("");

    if (window.lucide) lucide.createIcons();
  }

  // ==========================================================
  // RENDER ADMIN CERTIFICATES (WITH RANK & REORDER)
  // ==========================================================

  function renderAdminCertificates() {
    const container = document.getElementById("admin-certs-list");
    const countBadge = document.getElementById("admin-certs-count");
    if (countBadge) countBadge.textContent = certsState.length;
    if (!container) return;

    if (certsState.length === 0) {
      container.innerHTML = `<p class="py-10 text-center text-sm text-zinc-500">No certificates found. Click "Add Certificate" to create one.</p>`;
      return;
    }

    container.innerHTML = certsState
      .map(
        (c, idx) => `
        <div class="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
          <div class="flex items-center gap-3">
            <!-- Rank Indicator & Reorder Arrows -->
            <div class="flex items-center gap-1.5">
              <span class="flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-indigo-50 px-2 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" title="Current Rank: #${idx + 1}">
                #${idx + 1}
              </span>
              <div class="flex flex-col gap-0.5">
                <button
                  type="button"
                  data-admin-move-cert-up="${idx}"
                  ${idx === 0 ? "disabled" : ""}
                  title="Move Up in Rank"
                  class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:opacity-20 disabled:pointer-events-none dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
                >
                  <i class="h-3 w-3" data-lucide="chevron-up"></i>
                </button>
                <button
                  type="button"
                  data-admin-move-cert-down="${idx}"
                  ${idx === certsState.length - 1 ? "disabled" : ""}
                  title="Move Down in Rank"
                  class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:opacity-20 disabled:pointer-events-none dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
                >
                  <i class="h-3 w-3" data-lucide="chevron-down"></i>
                </button>
              </div>
            </div>

            <!-- Logo -->
            <div class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
              ${c.logo
            ? `<img src="${c.logo}" alt="${c.organization}" class="h-8 w-8 object-contain" />`
            : `<i class="h-5 w-5 text-indigo-500" data-lucide="award"></i>`
          }
            </div>

            <!-- Details -->
            <div>
              <h4 class="text-base font-bold">${c.title}</h4>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">${c.organization} · ${c.date || "No date"}${c.skills ? ` · Skills: ${c.skills}` : ""}</p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              data-admin-edit-cert="${idx}"
              class="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700 dark:text-zinc-300"
            >
              Edit
            </button>
            <button
              type="button"
              data-admin-delete-cert="${idx}"
              class="rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
            >
              Delete
            </button>
          </div>
        </div>
      `,
      )
      .join("");

    if (window.lucide) lucide.createIcons();
  }

  // ==========================================================
  // RENDER ADMIN EXPERIENCE (WITH RANK & REORDER)
  // ==========================================================

  function renderAdminExperience() {
    const container = document.getElementById("admin-exp-list");
    const countBadge = document.getElementById("admin-exp-count");
    if (countBadge) countBadge.textContent = expState.length;
    if (!container) return;

    if (expState.length === 0) {
      container.innerHTML = `<p class="py-10 text-center text-sm text-zinc-500">No experience entries found. Click "Add Experience" to create one.</p>`;
      return;
    }

    container.innerHTML = expState
      .map(
        (v, idx) => `
        <div class="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
          <div class="flex items-center gap-3">
            <!-- Rank Indicator & Reorder Arrows -->
            <div class="flex items-center gap-1.5">
              <span class="flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-indigo-50 px-2 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" title="Current Rank: #${idx + 1}">
                #${idx + 1}
              </span>
              <div class="flex flex-col gap-0.5">
                <button
                  type="button"
                  data-admin-move-exp-up="${idx}"
                  ${idx === 0 ? "disabled" : ""}
                  title="Move Up in Rank"
                  class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:opacity-20 disabled:pointer-events-none dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
                >
                  <i class="h-3 w-3" data-lucide="chevron-up"></i>
                </button>
                <button
                  type="button"
                  data-admin-move-exp-down="${idx}"
                  ${idx === expState.length - 1 ? "disabled" : ""}
                  title="Move Down in Rank"
                  class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:opacity-20 disabled:pointer-events-none dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
                >
                  <i class="h-3 w-3" data-lucide="chevron-down"></i>
                </button>
              </div>
            </div>

            <!-- Details -->
            <div>
              <h4 class="text-base font-bold">${v.title}${v.company ? ` <span class="font-normal text-zinc-500">|</span> ${v.company}` : ""}</h4>
              <p class="text-xs font-medium text-indigo-500 dark:text-indigo-400">${v.time}</p>
              <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${(v.description || []).length} bullet point(s)</p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              data-admin-edit-exp="${idx}"
              class="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700 dark:text-zinc-300"
            >
              Edit
            </button>
            <button
              type="button"
              data-admin-delete-exp="${idx}"
              class="rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
            >
              Delete
            </button>
          </div>
        </div>
      `,
      )
      .join("");

    if (window.lucide) lucide.createIcons();
  }

  // ==========================================================
  // RENDER ADMIN VOLUNTEERING (WITH RANK & REORDER)
  // ==========================================================

  function renderAdminVolunteering() {
    const container = document.getElementById("admin-vol-list");
    const countBadge = document.getElementById("admin-vol-count");
    if (countBadge) countBadge.textContent = volState.length;
    if (!container) return;

    if (volState.length === 0) {
      container.innerHTML = `<p class="py-10 text-center text-sm text-zinc-500">No volunteering entries found. Click "Add Volunteering" to create one.</p>`;
      return;
    }

    container.innerHTML = volState
      .map(
        (v, idx) => `
        <div class="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
          <div class="flex items-center gap-3">
            <!-- Rank Indicator & Reorder Arrows -->
            <div class="flex items-center gap-1.5">
              <span class="flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-indigo-50 px-2 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" title="Current Rank: #${idx + 1}">
                #${idx + 1}
              </span>
              <div class="flex flex-col gap-0.5">
                <button
                  type="button"
                  data-admin-move-vol-up="${idx}"
                  ${idx === 0 ? "disabled" : ""}
                  title="Move Up in Rank"
                  class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:opacity-20 disabled:pointer-events-none dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
                >
                  <i class="h-3 w-3" data-lucide="chevron-up"></i>
                </button>
                <button
                  type="button"
                  data-admin-move-vol-down="${idx}"
                  ${idx === volState.length - 1 ? "disabled" : ""}
                  title="Move Down in Rank"
                  class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:opacity-20 disabled:pointer-events-none dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
                >
                  <i class="h-3 w-3" data-lucide="chevron-down"></i>
                </button>
              </div>
            </div>

            <!-- Details -->
            <div>
              <h4 class="text-base font-bold">${v.title}</h4>
              <p class="text-xs font-medium text-indigo-500 dark:text-indigo-400">${v.time}</p>
              <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${(v.description || []).length} bullet point(s)</p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              data-admin-edit-vol="${idx}"
              class="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700 dark:text-zinc-300"
            >
              Edit
            </button>
            <button
              type="button"
              data-admin-delete-vol="${idx}"
              class="rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
            >
              Delete
            </button>
          </div>
        </div>
      `,
      )
      .join("");

    if (window.lucide) lucide.createIcons();
  }

  // ==========================================================
  // RENDER ADMIN SKILLS
  // ==========================================================

  function renderAdminSkills() {
    const container = document.getElementById("admin-skills-list");
    const countBadge = document.getElementById("admin-skills-count");
    if (countBadge) countBadge.textContent = skillsState.length;
    if (!container) return;

    if (skillsState.length === 0) {
      container.innerHTML = `<p class="py-10 text-center text-sm text-zinc-500">No skill categories found. Click "Add Skill Category" to create one.</p>`;
      return;
    }

    container.innerHTML = skillsState
      .map(
        (group, idx) => `
        <div class="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
          <div class="flex items-start gap-3">
            <!-- Rank / Position & Reorder Arrows -->
            <div class="flex items-center gap-1.5">
              <span class="flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-indigo-50 px-2 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                #${idx + 1}
              </span>
              <div class="flex flex-col gap-0.5">
                <button
                  type="button"
                  data-admin-move-skill-up="${idx}"
                  ${idx === 0 ? "disabled" : ""}
                  title="Move Up"
                  class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:opacity-20 disabled:pointer-events-none dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
                >
                  <i class="h-3 w-3" data-lucide="chevron-up"></i>
                </button>
                <button
                  type="button"
                  data-admin-move-skill-down="${idx}"
                  ${idx === skillsState.length - 1 ? "disabled" : ""}
                  title="Move Down"
                  class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:opacity-20 disabled:pointer-events-none dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
                >
                  <i class="h-3 w-3" data-lucide="chevron-down"></i>
                </button>
              </div>
            </div>

            <!-- Icon -->
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <i class="h-5 w-5" data-lucide="${group.icon || "code-2"}"></i>
            </div>

            <!-- Details -->
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-base font-bold">${group.category}</h4>
                <span class="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${(group.skills || []).length} skills</span>
              </div>
              <div class="mt-2 flex flex-wrap gap-1.5">
                ${(group.skills || [])
            .map(
              (s) =>
                `<span class="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">${s}</span>`,
            )
            .join("")}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              data-admin-edit-skill="${idx}"
              class="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700 dark:text-zinc-300"
            >
              Edit
            </button>
            <button
              type="button"
              data-admin-delete-skill="${idx}"
              class="rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
            >
              Delete
            </button>
          </div>
        </div>
      `,
      )
      .join("");

    if (window.lucide) lucide.createIcons();
  }

  // ==========================================================
  // POPULATE FORMS
  // ==========================================================

  function populateProfileForm() {
    const prof = getCachedProfile();
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "";
    };

    setVal("admin-prof-name", prof.name);
    setVal("admin-prof-role", prof.role);
    setVal("admin-prof-desc", prof.desc);
    setVal("admin-prof-email", prof.email);
    setVal("admin-prof-location", prof.location);
    setVal("admin-prof-github", prof.github);
    setVal("admin-prof-linkedin", prof.linkedin);
    setVal("admin-prof-hero-headline", prof.heroHeadline);
    setVal("admin-prof-hero-intro", prof.heroIntro);
  }

  function populateAboutForm() {
    const about = getCachedAbout();
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "";
    };

    setVal("admin-about-title", about.title || "About me");
    setVal("admin-about-p1", about.p1);
    setVal("admin-about-p2", about.p2);
    setVal("admin-about-p3", about.p3);
    setVal("admin-about-studying", about.studying);
    setVal("admin-about-based", about.based);
    setVal("admin-about-focus", about.focus);
    setVal(
      "admin-about-interests",
      Array.isArray(about.interests) ? about.interests.join(", ") : "",
    );
  }

  // ==========================================================
  // PROJECT FORM MODAL
  // ==========================================================

  function openProjectFormModal(project = null, editIndex = -1) {
    const isEdit = editIndex >= 0;
    const title = isEdit ? `Edit Project: ${project.title}` : "Add New Project";
    const maxRank = isEdit ? projectsState.length : projectsState.length + 1;
    const currentRank = isEdit ? editIndex + 1 : 1;

    const p = project || {
      title: "",
      category: "Web Application",
      technologies: [],
      timeline: { start: "", end: "" },
      details: [""],
      features: [],
      image: "",
      liveDemo: "",
      github: "",
      featured: false,
    };

    const formHtml = `
      <form class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Project Title *</label>
            <input name="title" required value="${p.title || ""}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Category *</label>
            <input name="category" required value="${p.category || "Web Application"}" placeholder="e.g. Web Application, Data Science, Robotics" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Display Rank (1 = Top)</label>
            <input name="rank" type="number" min="1" max="${maxRank}" value="${currentRank}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-semibold" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Technologies (comma-separated)</label>
          <input name="technologies" value="${(p.technologies || []).join(", ")}" placeholder="React, Node.js, Tailwind CSS" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Start Timeline</label>
            <input name="start" value="${p.timeline ? p.timeline.start || "" : ""}" placeholder="e.g. Jan 2026" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">End Timeline</label>
            <input name="end" value="${p.timeline ? p.timeline.end || "" : ""}" placeholder="e.g. Present, or May 2026" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Live Demo URL</label>
            <input name="liveDemo" type="url" value="${p.liveDemo || ""}" placeholder="https://..." class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">GitHub URL</label>
            <input name="github" type="url" value="${p.github || ""}" placeholder="https://github.com/..." class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Image Path / URL</label>
          <input name="image" value="${p.image || ""}" placeholder="images/project.png" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Detailed Description (One paragraph per line)</label>
          <textarea name="details" rows="3" placeholder="Paragraph 1...&#10;Paragraph 2..." class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">${(p.details || []).join("\n")}</textarea>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Key Features (One feature per line)</label>
          <textarea name="features" rows="3" placeholder="Feature 1&#10;Feature 2" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">${(p.features || []).join("\n")}</textarea>
        </div>

        <div class="flex items-center gap-2">
          <input type="checkbox" id="admin-proj-featured" name="featured" ${p.featured ? "checked" : ""} class="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" />
          <label for="admin-proj-featured" class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Feature this project on the Home page</label>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4">
          <button type="button" data-admin-cancel class="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
          <button type="submit" class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500">${isEdit ? "Update Project" : "Add Project"}</button>
        </div>
      </form>
    `;

    openAdminModal(title, formHtml, async (form) => {
      const fd = new FormData(form);
      const titleVal = fd.get("title").trim();
      if (!titleVal) return false;

      const techArr = fd
        .get("technologies")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const detailsArr = fd
        .get("details")
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean);

      const featuresArr = fd
        .get("features")
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const newProj = {
        id: isEdit ? p.id || editIndex + 1 : Date.now(),
        title: titleVal,
        category: fd.get("category").trim() || "Web Application",
        technologies: techArr,
        timeline: {
          start: fd.get("start").trim(),
          end: fd.get("end").trim(),
        },
        details: detailsArr.length ? detailsArr : [""],
        features: featuresArr,
        image: fd.get("image").trim(),
        liveDemo: fd.get("liveDemo").trim(),
        github: fd.get("github").trim(),
        featured: fd.get("featured") === "on",
      };

      const targetRank = Math.max(1, Math.min(parseInt(fd.get("rank"), 10) || 1, maxRank));
      const targetIndex = targetRank - 1;

      if (isEdit) {
        projectsState.splice(editIndex, 1);
        projectsState.splice(targetIndex, 0, newProj);
      } else {
        projectsState.splice(targetIndex, 0, newProj);
      }

      await saveToServer("save-projects", "projects.json", projectsState, KEY_PROJECTS);
      renderAdminProjects();

      // Refresh live portfolio views
      if (window.loadProjects) await window.loadProjects();
      showToast(`Saved "${newProj.title}" at Rank #${targetRank}`);
      return true;
    });
  }

  // ==========================================================
  // CERTIFICATE FORM MODAL (WITH DIRECT RANK MODIFICATION)
  // ==========================================================

  function openCertFormModal(cert = null, editIndex = -1) {
    const isEdit = editIndex >= 0;
    const title = isEdit ? `Edit Certificate: ${cert.title}` : "Add New Certificate";
    const maxRank = isEdit ? certsState.length : certsState.length + 1;
    const currentRank = isEdit ? editIndex + 1 : 1;

    const c = cert || {
      title: "",
      organization: "",
      date: "",
      logo: "",
      credential: "",
      skills: "",
    };

    const formHtml = `
      <form class="space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Certificate Title *</label>
          <input name="title" required value="${c.title || ""}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Issuing Organization *</label>
            <input name="organization" required value="${c.organization || ""}" placeholder="e.g. HackerRank, MathWorks, Cisco" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Display Rank (1 = Top)</label>
            <input name="rank" type="number" min="1" max="${maxRank}" value="${currentRank}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-semibold" />
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Issue Date</label>
            <input name="date" value="${c.date || ""}" placeholder="e.g. May 2025" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Skills / Topics Covered</label>
            <input name="skills" value="${c.skills || ""}" placeholder="e.g. Java, C++, Networking" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Credential Verification URL</label>
          <input name="credential" type="url" value="${c.credential || ""}" placeholder="https://..." class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Logo Image Path / URL</label>
          <input name="logo" value="${c.logo || ""}" placeholder="images/hackerrank.png" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4">
          <button type="button" data-admin-cancel class="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
          <button type="submit" class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500">${isEdit ? "Update Certificate" : "Add Certificate"}</button>
        </div>
      </form>
    `;

    openAdminModal(title, formHtml, async (form) => {
      const fd = new FormData(form);
      const newCert = {
        title: fd.get("title").trim(),
        organization: fd.get("organization").trim(),
        date: fd.get("date").trim(),
        logo: fd.get("logo").trim(),
        credential: fd.get("credential").trim(),
        skills: fd.get("skills").trim(),
      };

      if (!newCert.title || !newCert.organization) return false;

      const targetRank = Math.max(1, Math.min(parseInt(fd.get("rank"), 10) || 1, maxRank));
      const targetIndex = targetRank - 1;

      if (isEdit) {
        certsState.splice(editIndex, 1);
        certsState.splice(targetIndex, 0, newCert);
      } else {
        certsState.splice(targetIndex, 0, newCert);
      }

      await saveToServer("save-certificates", "certificates.json", certsState, KEY_CERTS);
      renderAdminCertificates();

      if (window.loadCertificates) await window.loadCertificates();
      showToast(`Saved "${newCert.title}" at Rank #${targetRank}`);
      return true;
    });
  }

  // ==========================================================
  // VOLUNTEERING FORM MODAL (WITH DIRECT RANK MODIFICATION)
  // ==========================================================

  function openVolFormModal(vol = null, editIndex = -1) {
    const isEdit = editIndex >= 0;
    const title = isEdit ? `Edit Volunteering: ${vol.title}` : "Add Volunteering Experience";
    const maxRank = isEdit ? volState.length : volState.length + 1;
    const currentRank = isEdit ? editIndex + 1 : 1;

    const v = vol || {
      title: "",
      time: "",
      description: [""],
    };

    const formHtml = `
      <form class="space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Organization / Role Title *</label>
          <input name="title" required value="${v.title || ""}" placeholder="e.g. IEEE AIUB Student Branch" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Time Period *</label>
            <input name="time" required value="${v.time || ""}" placeholder="e.g. Mar 2025 — Present" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Display Rank (1 = Top)</label>
            <input name="rank" type="number" min="1" max="${maxRank}" value="${currentRank}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-semibold" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Description Points (One bullet per line)</label>
          <textarea name="description" rows="4" placeholder="Organized technical workshops and seminars&#10;Managed participant registration" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">${(v.description || []).join("\n")}</textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4">
          <button type="button" data-admin-cancel class="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
          <button type="submit" class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500">${isEdit ? "Update Volunteering" : "Add Volunteering"}</button>
        </div>
      </form>
    `;

    openAdminModal(title, formHtml, async (form) => {
      const fd = new FormData(form);
      const descArr = fd
        .get("description")
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean);

      const newVol = {
        title: fd.get("title").trim(),
        time: fd.get("time").trim(),
        description: descArr,
      };

      if (!newVol.title || !newVol.time) return false;

      const targetRank = Math.max(1, Math.min(parseInt(fd.get("rank"), 10) || 1, maxRank));
      const targetIndex = targetRank - 1;

      if (isEdit) {
        volState.splice(editIndex, 1);
        volState.splice(targetIndex, 0, newVol);
      } else {
        volState.splice(targetIndex, 0, newVol);
      }

      await saveToServer("save-volunteering", "volunteering.json", volState, KEY_VOL);
      renderAdminVolunteering();

      if (window.loadVolunteering) await window.loadVolunteering();
      showToast(`Saved "${newVol.title}" at Rank #${targetRank}`);
      return true;
    });
  }

  // ==========================================================
  // EXPERIENCE FORM MODAL (WITH DIRECT RANK MODIFICATION)
  // ==========================================================

  function openExpFormModal(exp = null, editIndex = -1) {
    const isEdit = editIndex >= 0;
    const title = isEdit ? `Edit Experience: ${exp.title}` : "Add Work Experience";
    const maxRank = isEdit ? expState.length : expState.length + 1;
    const currentRank = isEdit ? editIndex + 1 : 1;

    const v = exp || {
      title: "",
      company: "",
      time: "",
      description: [""],
    };

    const formHtml = `
      <form class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Job Title / Role *</label>
            <input name="title" required value="${v.title || ""}" placeholder="e.g. Web Team Member" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Company / Organization *</label>
            <input name="company" required value="${v.company || ""}" placeholder="e.g. IEEE AIUB Student Branch" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Time Period *</label>
            <input name="time" required value="${v.time || ""}" placeholder="e.g. Mar 2025 — Present" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Display Rank (1 = Top)</label>
            <input name="rank" type="number" min="1" max="${maxRank}" value="${currentRank}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-semibold" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Description Points (One bullet per line)</label>
          <textarea name="description" rows="4" placeholder="Maintain and support the branch website&#10;Coordinate events with the Event Team" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">${(v.description || []).join("\n")}</textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4">
          <button type="button" data-admin-cancel class="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
          <button type="submit" class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500">${isEdit ? "Update Experience" : "Add Experience"}</button>
        </div>
      </form>
    `;

    openAdminModal(title, formHtml, async (form) => {
      const fd = new FormData(form);
      const descArr = fd
        .get("description")
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean);

      const newExp = {
        title: fd.get("title").trim(),
        company: fd.get("company").trim(),
        time: fd.get("time").trim(),
        description: descArr,
      };

      if (!newExp.title || !newExp.company || !newExp.time) return false;

      const targetRank = Math.max(1, Math.min(parseInt(fd.get("rank"), 10) || 1, maxRank));
      const targetIndex = targetRank - 1;

      if (isEdit) {
        expState.splice(editIndex, 1);
        expState.splice(targetIndex, 0, newExp);
      } else {
        expState.splice(targetIndex, 0, newExp);
      }

      await saveToServer("save-experience", "experience.json", expState, KEY_EXP);
      renderAdminExperience();

      if (window.loadExperience) await window.loadExperience();
      showToast(`Saved "${newExp.title}" at Rank #${targetRank}`);
      return true;
    });
  }

  // ==========================================================
  // SKILL FORM MODAL
  // ==========================================================

  function openSkillFormModal(skill = null, editIndex = -1) {
    const isEdit = editIndex >= 0;
    const title = isEdit ? `Edit Skill Category: ${skill.category}` : "Add Skill Category";

    const s = skill || {
      category: "",
      icon: "code-2",
      skills: [],
    };

    const formHtml = `
      <form class="space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Category Name *</label>
          <input name="category" required value="${s.category || ""}" placeholder="e.g. Cloud & DevOps, Mobile Development" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Lucide Icon Name</label>
          <input name="icon" value="${s.icon || "code-2"}" placeholder="code-2, globe, brain, database, terminal, cpu, layers..." class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          <p class="mt-1 text-xs text-zinc-400">Standard Lucide icon identifier (e.g. code-2, globe, brain, database, terminal, shield)</p>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Skills (Comma-separated)</label>
          <textarea name="skills" rows="3" placeholder="React, Node.js, Express, Next.js" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">${(s.skills || []).join(", ")}</textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4">
          <button type="button" data-admin-cancel class="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
          <button type="submit" class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500">${isEdit ? "Update Category" : "Add Category"}</button>
        </div>
      </form>
    `;

    openAdminModal(title, formHtml, async (form) => {
      const fd = new FormData(form);
      const categoryVal = fd.get("category").trim();
      if (!categoryVal) return false;

      const skillsArr = fd
        .get("skills")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const newGroup = {
        category: categoryVal,
        icon: fd.get("icon").trim() || "code-2",
        skills: skillsArr,
      };

      if (isEdit) {
        skillsState[editIndex] = newGroup;
      } else {
        skillsState.push(newGroup);
      }

      await saveToServer("save-skills", "skills.json", skillsState, KEY_SKILLS);
      renderAdminSkills();

      if (window.loadSkills) await window.loadSkills();
      showToast(`Saved "${newGroup.category}"`);
      return true;
    });
  }

  // ==========================================================
  // AUTHENTICATION LOGIC
  // ==========================================================

  function checkAuth() {
    return sessionStorage.getItem(AUTH_KEY) === "true";
  }

  function updateAuthUI() {
    const isAuthed = checkAuth();
    const gate = document.getElementById("admin-auth-gate");
    const content = document.getElementById("admin-dashboard-content");

    if (!gate || !content) return;

    if (isAuthed) {
      gate.classList.add("hidden");
      content.classList.remove("hidden");
      renderAdminProjects();
      renderAdminCertificates();
      renderAdminExperience();
      renderAdminVolunteering();
      renderAdminSkills();
      populateProfileForm();
      populateAboutForm();
    } else {
      gate.classList.remove("hidden");
      content.classList.add("hidden");
    }

    if (window.lucide) lucide.createIcons();
  }

  // ==========================================================
  // INITIALIZE ADMIN PANEL
  // ==========================================================

  window.initAdminPanel = async function () {
    const adminSection = document.getElementById("admin");
    if (!adminSection) return;

    // Load initial states
    await Promise.all([
      window.getPortfolioProjects(),
      window.getPortfolioCertificates(),
      window.getPortfolioExperience(),
      window.getPortfolioVolunteering(),
      window.getPortfolioSkills(),
      window.getPortfolioProfile(),
      window.getPortfolioAbout(),
    ]);

    // Apply saved profile and about content to site
    await window.applyProfileContent();
    await window.applyAboutContent();

    // Setup password login form
    const loginForm = document.getElementById("admin-login-form");
    const pwdInput = document.getElementById("admin-password-input");
    const authError = document.getElementById("admin-auth-error");
    const togglePwdBtn = document.getElementById("admin-toggle-pwd-btn");

    if (loginForm) {
      loginForm.onsubmit = (e) => {
        e.preventDefault();
        const entered = pwdInput?.value;

        if (entered === ADMIN_PASSWORD) {
          sessionStorage.setItem(AUTH_KEY, "true");
          if (authError) authError.classList.add("hidden");
          if (pwdInput) pwdInput.value = "";
          updateAuthUI();
          showToast("Admin access granted!");
        } else {
          if (authError) authError.classList.remove("hidden");
          if (pwdInput) {
            pwdInput.classList.add("border-rose-500");
            pwdInput.focus();
          }
        }
      };
    }

    if (togglePwdBtn && pwdInput) {
      togglePwdBtn.onclick = () => {
        const isPwd = pwdInput.type === "password";
        pwdInput.type = isPwd ? "text" : "password";
        togglePwdBtn.innerHTML = isPwd
          ? `<i class="h-4 w-4" data-lucide="eye-off"></i>`
          : `<i class="h-4 w-4" data-lucide="eye"></i>`;
        if (window.lucide) lucide.createIcons();
      };
    }

    // Logout button
    document.getElementById("admin-logout-btn")?.addEventListener("click", () => {
      sessionStorage.removeItem(AUTH_KEY);
      updateAuthUI();
      showToast("Admin locked.");
    });

    // Check current auth status
    updateAuthUI();

    // Setup Tabs
    const tabButtons = document.querySelectorAll("[data-admin-tab]");
    tabButtons.forEach((btn) => {
      btn.onclick = () => {
        const targetTab = btn.dataset.adminTab;

        tabButtons.forEach((b) => {
          const isActive = b === btn;
          b.classList.toggle("border-indigo-500", isActive);
          b.classList.toggle("text-indigo-500", isActive);
          b.classList.toggle("border-transparent", !isActive);
          b.classList.toggle("text-zinc-500", !isActive);
        });

        document.querySelectorAll(".admin-tab-pane").forEach((pane) => {
          pane.classList.toggle("hidden", pane.id !== `admin-tab-${targetTab}`);
        });

        if (window.lucide) lucide.createIcons();
      };
    });

    // Profile Form Submit (Direct to data/profile.json)
    const profileForm = document.getElementById("admin-profile-form");
    if (profileForm) {
      profileForm.onsubmit = async (e) => {
        e.preventDefault();
        const updated = {
          name: document.getElementById("admin-prof-name")?.value.trim(),
          role: document.getElementById("admin-prof-role")?.value.trim(),
          desc: document.getElementById("admin-prof-desc")?.value.trim(),
          email: document.getElementById("admin-prof-email")?.value.trim(),
          location: document.getElementById("admin-prof-location")?.value.trim(),
          github: document.getElementById("admin-prof-github")?.value.trim(),
          linkedin: document.getElementById("admin-prof-linkedin")?.value.trim(),
          heroHeadline: document.getElementById("admin-prof-hero-headline")?.value.trim() || "Exploring technology by building real things.",
          heroIntro: document.getElementById("admin-prof-hero-intro")?.value.trim(),
        };

        profileState = updated;
        await saveToServer("save-profile", "profile.json", profileState, KEY_PROFILE);
        window.applyProfileContent();
      };
    }

    // CV Upload & Replace Handler
    const cvFileInput = document.getElementById("admin-cv-file-input");
    const uploadCvBtn = document.getElementById("admin-upload-cv-btn");
    const cvStatus = document.getElementById("admin-cv-status");

    if (uploadCvBtn && cvFileInput) {
      uploadCvBtn.onclick = async () => {
        const file = cvFileInput.files && cvFileInput.files[0];
        if (!file) {
          showToast("Please choose a PDF file first.");
          if (cvStatus) {
            cvStatus.textContent = "Please select a PDF file first.";
            cvStatus.className = "mt-2 text-xs font-semibold text-rose-500 block";
          }
          return;
        }

        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
          showToast("Only PDF files are supported!");
          if (cvStatus) {
            cvStatus.textContent = "Please select a valid PDF file.";
            cvStatus.className = "mt-2 text-xs font-semibold text-rose-500 block";
          }
          return;
        }

        uploadCvBtn.disabled = true;
        const originalText = uploadCvBtn.innerHTML;
        uploadCvBtn.innerHTML = `<i class="h-3.5 w-3.5 animate-spin" data-lucide="loader-2"></i> Uploading...`;
        if (window.lucide) lucide.createIcons();

        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const base64Data = event.target.result;
            try {
              const res = await fetch("/api/upload-cv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: base64Data, filename: "Farhan-chowdhury-CV.pdf" }),
              });
              const json = await res.json();
              if (res.ok && json.success) {
                showToast("CV replaced successfully!");
                if (cvStatus) {
                  cvStatus.textContent = `Successfully updated Farhan-chowdhury-CV.pdf (${(file.size / 1024).toFixed(1)} KB)`;
                  cvStatus.className = "mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 block";
                }
                cvFileInput.value = "";
              } else {
                throw new Error(json.error || "Upload failed");
              }
            } catch (err) {
              console.error(err);
              showToast("Failed to upload CV file.");
              if (cvStatus) {
                cvStatus.textContent = `Upload error: ${err.message}`;
                cvStatus.className = "mt-2 text-xs font-semibold text-rose-500 block";
              }
            } finally {
              uploadCvBtn.disabled = false;
              uploadCvBtn.innerHTML = originalText;
              if (window.lucide) lucide.createIcons();
            }
          };
          reader.readAsDataURL(file);
        } catch (e) {
          uploadCvBtn.disabled = false;
          uploadCvBtn.innerHTML = originalText;
          if (window.lucide) lucide.createIcons();
          showToast("Error reading file.");
        }
      };
    }

    // About Form Submit (Direct to data/about.json)
    const aboutForm = document.getElementById("admin-about-form");
    if (aboutForm) {
      aboutForm.onsubmit = async (e) => {
        e.preventDefault();
        const interestsRaw = document.getElementById("admin-about-interests")?.value.trim() || "";
        const interestsArr = interestsRaw
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean);

        const updatedAbout = {
          title: document.getElementById("admin-about-title")?.value.trim() || "About me",
          p1: document.getElementById("admin-about-p1")?.value.trim(),
          p2: document.getElementById("admin-about-p2")?.value.trim(),
          p3: document.getElementById("admin-about-p3")?.value.trim() || "",
          studying: document.getElementById("admin-about-studying")?.value.trim(),
          based: document.getElementById("admin-about-based")?.value.trim(),
          focus: document.getElementById("admin-about-focus")?.value.trim(),
          interests: interestsArr,
        };

        aboutState = updatedAbout;
        await saveToServer("save-about", "about.json", aboutState, KEY_ABOUT);
        window.applyAboutContent();
      };
    }

    // Add item buttons
    document.getElementById("admin-add-project-btn")?.addEventListener("click", () => {
      openProjectFormModal();
    });

    document.getElementById("admin-add-cert-btn")?.addEventListener("click", () => {
      openCertFormModal();
    });

    document.getElementById("admin-add-exp-btn")?.addEventListener("click", () => {
      openExpFormModal();
    });

    document.getElementById("admin-add-vol-btn")?.addEventListener("click", () => {
      openVolFormModal();
    });

    document.getElementById("admin-add-skill-btn")?.addEventListener("click", () => {
      openSkillFormModal();
    });

    // Global click delegate for dynamic list items
    adminSection.addEventListener("click", async (e) => {
      // Edit / Delete Project
      const editProjBtn = e.target.closest("[data-admin-edit-project]");
      if (editProjBtn) {
        const idx = Number(editProjBtn.dataset.adminEditProject);
        openProjectFormModal(projectsState[idx], idx);
        return;
      }

      const delProjBtn = e.target.closest("[data-admin-delete-project]");
      if (delProjBtn) {
        const idx = Number(delProjBtn.dataset.adminDeleteProject);
        if (confirm(`Are you sure you want to delete "${projectsState[idx]?.title}"?`)) {
          projectsState.splice(idx, 1);
          await saveToServer("save-projects", "projects.json", projectsState, KEY_PROJECTS);
          renderAdminProjects();
          if (window.loadProjects) await window.loadProjects();
        }
        return;
      }

      // Reorder / Move Project Up
      const moveProjectUpBtn = e.target.closest("[data-admin-move-project-up]");
      if (moveProjectUpBtn) {
        const idx = Number(moveProjectUpBtn.dataset.adminMoveProjectUp);
        if (idx > 0) {
          const item = projectsState.splice(idx, 1)[0];
          projectsState.splice(idx - 1, 0, item);
          await saveToServer("save-projects", "projects.json", projectsState, KEY_PROJECTS);
          renderAdminProjects();
          if (window.loadProjects) await window.loadProjects();
          showToast(`Moved "${item.title}" up to Rank #${idx}`);
        }
        return;
      }

      // Reorder / Move Project Down
      const moveProjectDownBtn = e.target.closest("[data-admin-move-project-down]");
      if (moveProjectDownBtn) {
        const idx = Number(moveProjectDownBtn.dataset.adminMoveProjectDown);
        if (idx < projectsState.length - 1) {
          const item = projectsState.splice(idx, 1)[0];
          projectsState.splice(idx + 1, 0, item);
          await saveToServer("save-projects", "projects.json", projectsState, KEY_PROJECTS);
          renderAdminProjects();
          if (window.loadProjects) await window.loadProjects();
          showToast(`Moved "${item.title}" down to Rank #${idx + 2}`);
        }
        return;
      }

      // Reorder / Move Certificate Up
      const moveCertUpBtn = e.target.closest("[data-admin-move-cert-up]");
      if (moveCertUpBtn) {
        const idx = Number(moveCertUpBtn.dataset.adminMoveCertUp);
        if (idx > 0) {
          const item = certsState.splice(idx, 1)[0];
          certsState.splice(idx - 1, 0, item);
          await saveToServer("save-certificates", "certificates.json", certsState, KEY_CERTS);
          renderAdminCertificates();
          if (window.loadCertificates) await window.loadCertificates();
          showToast(`Moved "${item.title}" up to Rank #${idx}`);
        }
        return;
      }

      // Reorder / Move Certificate Down
      const moveCertDownBtn = e.target.closest("[data-admin-move-cert-down]");
      if (moveCertDownBtn) {
        const idx = Number(moveCertDownBtn.dataset.adminMoveCertDown);
        if (idx < certsState.length - 1) {
          const item = certsState.splice(idx, 1)[0];
          certsState.splice(idx + 1, 0, item);
          await saveToServer("save-certificates", "certificates.json", certsState, KEY_CERTS);
          renderAdminCertificates();
          if (window.loadCertificates) await window.loadCertificates();
          showToast(`Moved "${item.title}" down to Rank #${idx + 2}`);
        }
        return;
      }

      // Edit Certificate
      const editCertBtn = e.target.closest("[data-admin-edit-cert]");
      if (editCertBtn) {
        const idx = Number(editCertBtn.dataset.adminEditCert);
        openCertFormModal(certsState[idx], idx);
        return;
      }

      // Delete Certificate
      const delCertBtn = e.target.closest("[data-admin-delete-cert]");
      if (delCertBtn) {
        const idx = Number(delCertBtn.dataset.adminDeleteCert);
        if (confirm(`Are you sure you want to delete "${certsState[idx]?.title}"?`)) {
          certsState.splice(idx, 1);
          await saveToServer("save-certificates", "certificates.json", certsState, KEY_CERTS);
          renderAdminCertificates();
          if (window.loadCertificates) await window.loadCertificates();
        }
        return;
      }

      // Reorder / Move Experience Up
      const moveExpUpBtn = e.target.closest("[data-admin-move-exp-up]");
      if (moveExpUpBtn) {
        const idx = Number(moveExpUpBtn.dataset.adminMoveExpUp);
        if (idx > 0) {
          const item = expState.splice(idx, 1)[0];
          expState.splice(idx - 1, 0, item);
          await saveToServer("save-experience", "experience.json", expState, KEY_EXP);
          renderAdminExperience();
          if (window.loadExperience) await window.loadExperience();
          showToast(`Moved "${item.title}" up to Rank #${idx}`);
        }
        return;
      }

      // Reorder / Move Experience Down
      const moveExpDownBtn = e.target.closest("[data-admin-move-exp-down]");
      if (moveExpDownBtn) {
        const idx = Number(moveExpDownBtn.dataset.adminMoveExpDown);
        if (idx < expState.length - 1) {
          const item = expState.splice(idx, 1)[0];
          expState.splice(idx + 1, 0, item);
          await saveToServer("save-experience", "experience.json", expState, KEY_EXP);
          renderAdminExperience();
          if (window.loadExperience) await window.loadExperience();
          showToast(`Moved "${item.title}" down to Rank #${idx + 2}`);
        }
        return;
      }

      // Edit Experience
      const editExpBtn = e.target.closest("[data-admin-edit-exp]");
      if (editExpBtn) {
        const idx = Number(editExpBtn.dataset.adminEditExp);
        openExpFormModal(expState[idx], idx);
        return;
      }

      // Delete Experience
      const delExpBtn = e.target.closest("[data-admin-delete-exp]");
      if (delExpBtn) {
        const idx = Number(delExpBtn.dataset.adminDeleteExp);
        if (confirm(`Are you sure you want to delete "${expState[idx]?.title}"?`)) {
          expState.splice(idx, 1);
          await saveToServer("save-experience", "experience.json", expState, KEY_EXP);
          renderAdminExperience();
          if (window.loadExperience) await window.loadExperience();
        }
        return;
      }

      // Reorder / Move Volunteering Up
      const moveVolUpBtn = e.target.closest("[data-admin-move-vol-up]");
      if (moveVolUpBtn) {
        const idx = Number(moveVolUpBtn.dataset.adminMoveVolUp);
        if (idx > 0) {
          const item = volState.splice(idx, 1)[0];
          volState.splice(idx - 1, 0, item);
          await saveToServer("save-volunteering", "volunteering.json", volState, KEY_VOL);
          renderAdminVolunteering();
          if (window.loadVolunteering) await window.loadVolunteering();
          showToast(`Moved "${item.title}" up to Rank #${idx}`);
        }
        return;
      }

      // Reorder / Move Volunteering Down
      const moveVolDownBtn = e.target.closest("[data-admin-move-vol-down]");
      if (moveVolDownBtn) {
        const idx = Number(moveVolDownBtn.dataset.adminMoveVolDown);
        if (idx < volState.length - 1) {
          const item = volState.splice(idx, 1)[0];
          volState.splice(idx + 1, 0, item);
          await saveToServer("save-volunteering", "volunteering.json", volState, KEY_VOL);
          renderAdminVolunteering();
          if (window.loadVolunteering) await window.loadVolunteering();
          showToast(`Moved "${item.title}" down to Rank #${idx + 2}`);
        }
        return;
      }

      // Edit Volunteering
      const editVolBtn = e.target.closest("[data-admin-edit-vol]");
      if (editVolBtn) {
        const idx = Number(editVolBtn.dataset.adminEditVol);
        openVolFormModal(volState[idx], idx);
        return;
      }

      // Delete Volunteering
      const delVolBtn = e.target.closest("[data-admin-delete-vol]");
      if (delVolBtn) {
        const idx = Number(delVolBtn.dataset.adminDeleteVol);
        if (confirm(`Are you sure you want to delete "${volState[idx]?.title}"?`)) {
          volState.splice(idx, 1);
          await saveToServer("save-volunteering", "volunteering.json", volState, KEY_VOL);
          renderAdminVolunteering();
          if (window.loadVolunteering) await window.loadVolunteering();
        }
        return;
      }

      // Move Skill Up
      const moveSkillUpBtn = e.target.closest("[data-admin-move-skill-up]");
      if (moveSkillUpBtn) {
        const idx = Number(moveSkillUpBtn.dataset.adminMoveSkillUp);
        if (idx > 0) {
          const item = skillsState.splice(idx, 1)[0];
          skillsState.splice(idx - 1, 0, item);
          await saveToServer("save-skills", "skills.json", skillsState, KEY_SKILLS);
          renderAdminSkills();
          if (window.loadSkills) await window.loadSkills();
          showToast(`Moved "${item.category}" up`);
        }
        return;
      }

      // Move Skill Down
      const moveSkillDownBtn = e.target.closest("[data-admin-move-skill-down]");
      if (moveSkillDownBtn) {
        const idx = Number(moveSkillDownBtn.dataset.adminMoveSkillDown);
        if (idx < skillsState.length - 1) {
          const item = skillsState.splice(idx, 1)[0];
          skillsState.splice(idx + 1, 0, item);
          await saveToServer("save-skills", "skills.json", skillsState, KEY_SKILLS);
          renderAdminSkills();
          if (window.loadSkills) await window.loadSkills();
          showToast(`Moved "${item.category}" down`);
        }
        return;
      }

      // Edit Skill Category
      const editSkillBtn = e.target.closest("[data-admin-edit-skill]");
      if (editSkillBtn) {
        const idx = Number(editSkillBtn.dataset.adminEditSkill);
        openSkillFormModal(skillsState[idx], idx);
        return;
      }

      // Delete Skill Category
      const delSkillBtn = e.target.closest("[data-admin-delete-skill]");
      if (delSkillBtn) {
        const idx = Number(delSkillBtn.dataset.adminDeleteSkill);
        if (confirm(`Are you sure you want to delete category "${skillsState[idx]?.category}"?`)) {
          skillsState.splice(idx, 1);
          await saveToServer("save-skills", "skills.json", skillsState, KEY_SKILLS);
          renderAdminSkills();
          if (window.loadSkills) await window.loadSkills();
        }
        return;
      }

      // View JSON — open modal with syntax-highlighted file content
      const viewJsonBtn = e.target.closest("[data-view-json]");
      if (viewJsonBtn) {
        const type = viewJsonBtn.dataset.viewJson;
        const dataMap = {
          projects: { data: projectsState, file: "projects.json", icon: "folder-git-2" },
          certificates: { data: certsState, file: "certificates.json", icon: "award" },
          experience: { data: expState, file: "experience.json", icon: "briefcase" },
          volunteering: { data: volState, file: "volunteering.json", icon: "heart-handshake" },
          skills: { data: skillsState, file: "skills.json", icon: "code-2" },
          profile: { data: profileState, file: "profile.json", icon: "user" },
          about: { data: aboutState, file: "about.json", icon: "file-text" },
        };
        const entry = dataMap[type];
        if (!entry) return;

        const jsonStr = JSON.stringify(entry.data, null, 2);
        const itemCount = Array.isArray(entry.data) ? entry.data.length : Object.keys(entry.data).length;
        const sizeKB = (new Blob([jsonStr]).size / 1024).toFixed(1);

        // Syntax highlight JSON
        function highlightJSON(json) {
          const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return esc(json).replace(
            /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            (match) => {
              let cls = "text-amber-600 dark:text-amber-400";       // number
              if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                  cls = "text-indigo-600 dark:text-indigo-400 font-semibold"; // key
                  match = match.replace(/:$/, "") + ":";
                } else {
                  cls = "text-emerald-600 dark:text-emerald-400";   // string
                }
              } else if (/true|false/.test(match)) {
                cls = "text-violet-600 dark:text-violet-400";       // boolean
              } else if (/null/.test(match)) {
                cls = "text-rose-500 dark:text-rose-400 italic";    // null
              }
              return `<span class="${cls}">${match}</span>`;
            }
          );
        }

        const highlighted = highlightJSON(jsonStr);

        const viewHtml = `
          <div class="space-y-4">
            <!-- File info bar -->
            <div class="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800/60">
              <div class="flex items-center gap-2.5">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <i class="h-4 w-4" data-lucide="${entry.icon}"></i>
                </div>
                <div>
                  <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">data/${entry.file}</p>
                  <p class="text-[11px] text-zinc-500 dark:text-zinc-400">${itemCount} ${Array.isArray(entry.data) ? "item" : "field"}${itemCount !== 1 ? "s" : ""} · ${sizeKB} KB</p>
                </div>
              </div>
              <button type="button" id="admin-view-json-copy-btn" class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400">
                <i class="h-3.5 w-3.5" data-lucide="copy"></i> Copy
              </button>
            </div>

            <!-- JSON content -->
            <pre class="max-h-[60vh] overflow-auto rounded-2xl border border-zinc-200 bg-white p-5 text-[13px] leading-6 dark:border-zinc-700 dark:bg-zinc-950" style="tab-size:2"><code>${highlighted}</code></pre>
          </div>
        `;

        const modal = document.getElementById("admin-modal");
        const titleEl = document.getElementById("admin-modal-title");
        const bodyEl = document.getElementById("admin-modal-body");
        const closeBtn = document.getElementById("admin-modal-close-btn");

        if (!modal || !bodyEl) return;

        titleEl.textContent = entry.file;
        bodyEl.innerHTML = viewHtml;
        modal.classList.remove("hidden");
        document.body.classList.add("overflow-hidden");

        // Copy button inside modal
        document.getElementById("admin-view-json-copy-btn")?.addEventListener("click", () => {
          copyToClipboard(jsonStr, entry.file);
        });

        closeBtn.onclick = () => {
          modal.classList.add("hidden");
          document.body.classList.remove("overflow-hidden");
        };
        modal.onclick = (ev) => {
          if (ev.target === modal) {
            modal.classList.add("hidden");
            document.body.classList.remove("overflow-hidden");
          }
        };

        if (window.lucide) lucide.createIcons();
        return;
      }
    });

    // Download JSON Buttons
    const bindDownload = (btnId, filename, getData) => {
      document.getElementById(btnId)?.addEventListener("click", () => {
        downloadJSON(filename, getData());
      });
    };

    bindDownload("admin-download-projects-btn", "projects.json", () => projectsState);
    bindDownload("admin-export-projects-btn", "projects.json", () => projectsState);
    bindDownload("admin-download-certs-btn", "certificates.json", () => certsState);
    bindDownload("admin-export-certs-btn", "certificates.json", () => certsState);
    bindDownload("admin-download-exp-btn", "experience.json", () => expState);
    bindDownload("admin-export-exp-btn", "experience.json", () => expState);
    bindDownload("admin-download-vol-btn", "volunteering.json", () => volState);
    bindDownload("admin-export-vol-btn", "volunteering.json", () => volState);
    bindDownload("admin-download-skills-btn", "skills.json", () => skillsState);
    bindDownload("admin-export-skills-btn", "skills.json", () => skillsState);
    bindDownload("admin-download-profile-btn", "profile.json", () => profileState);
    bindDownload("admin-export-prof-btn", "profile.json", () => profileState);
    bindDownload("admin-download-about-btn", "about.json", () => aboutState);
    bindDownload("admin-export-about-btn", "about.json", () => aboutState);

    // Export All JSON
    document.getElementById("admin-export-all-btn")?.addEventListener("click", () => {
      downloadJSON("projects.json", projectsState);
      setTimeout(() => downloadJSON("certificates.json", certsState), 200);
      setTimeout(() => downloadJSON("experience.json", expState), 300);
      setTimeout(() => downloadJSON("volunteering.json", volState), 400);
      setTimeout(() => downloadJSON("skills.json", skillsState), 600);
      setTimeout(() => downloadJSON("profile.json", profileState), 800);
      setTimeout(() => downloadJSON("about.json", aboutState), 1000);
    });

    if (window.lucide) lucide.createIcons();
  };
})();
