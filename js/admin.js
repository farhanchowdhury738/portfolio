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
  const KEY_POSTS = "portfolio_posts";

  // In-memory state
  let projectsState = [];
  let certsState = [];
  let expState = [];
  let volState = [];
  let skillsState = [];
  let profileState = {};
  let aboutState = {};
  let postsState = [];

  // Editor instance references for clean lifecycle management
  let modalEditorInstance = null;
  let aboutEditorInstance = null;

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
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let payload = null;
      const rawText = await response.text();
      if (rawText) {
        try {
          payload = JSON.parse(rawText);
        } catch (parseErr) {
          console.error(`Invalid JSON response from /api/${endpoint}:`, rawText);
          showToast(`Error: invalid server response saving ${filename}`);
          return false;
        }
      }

      if (response.ok && (!payload || payload.success !== false)) {
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(data));
          } catch (e) {}
        }
        showToast(`Saved to data/${filename}!`);
        return true;
      } else {
        const errDetail = (payload && payload.error) || rawText || `HTTP ${response.status}`;
        console.error(`Failed to save to server (/api/${endpoint}):`, response.status, errDetail);
        showToast(`Server error (${response.status}): could not save ${filename}`);
        return false;
      }
    } catch (error) {
      console.error(`Network error saving to /api/${endpoint}:`, error);
      showToast(`Save failed: server unreachable (${filename} not saved)`);
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
      } catch (e) {}
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
      } catch (e) {}
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
      } catch (e) {}
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
      } catch (e) {}
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
      } catch (e) {}
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
      } catch (e) {}
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
      } catch (e) {}
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

  window.getPortfolioPosts = async function () {
    try {
      const res = await fetch("data/posts.json", { cache: "no-store" });
      if (res.ok) {
        postsState = await res.json();
        if (!Array.isArray(postsState)) postsState = [];
        localStorage.setItem(KEY_POSTS, JSON.stringify(postsState));
        return postsState;
      }
    } catch (e) {
      console.warn("Could not fetch fresh posts.json, checking cache...", e);
    }
    const cached = localStorage.getItem(KEY_POSTS);
    if (cached) {
      try {
        postsState = JSON.parse(cached);
        if (!Array.isArray(postsState)) postsState = [];
        return postsState;
      } catch (e) {}
    }
    try {
      const res = await fetch("data/posts.json");
      postsState = await res.json();
      if (!Array.isArray(postsState)) postsState = [];
    } catch (e) {
      console.error("Error fetching posts.json", e);
      postsState = [];
    }
    return postsState;
  };

  // Synchronous getter for already loaded state or cache
  function getCachedProfile() {
    if (profileState && Object.keys(profileState).length > 0) return profileState;
    const cached = localStorage.getItem(KEY_PROFILE);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return profileState;
  }

  function getCachedAbout() {
    if (aboutState && Object.keys(aboutState).length > 0) return aboutState;
    const cached = localStorage.getItem(KEY_ABOUT);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return aboutState;
  }

  function getCachedPosts() {
    if (postsState && Array.isArray(postsState)) return postsState;
    const cached = localStorage.getItem(KEY_POSTS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {}
    }
    return [];
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
    const p2El = document.getElementById("profile-about-p2");
    const p3El = document.getElementById("profile-about-p3");
    const aboutContainer = p1El?.parentElement;

    if (aboutContainer) {
      aboutContainer.querySelectorAll("[data-extra-about-paragraph]").forEach((el) => el.remove());
      aboutContainer.querySelectorAll("[data-about-rich-description]").forEach((el) => el.remove());
    }

    const richText = window.PortfolioRichText;
    const hasRichDescription = typeof about.description === "string" && about.description.trim().length > 0;

    if (hasRichDescription && p1El && aboutContainer) {
      const rendered = richText
        ? richText.render(about.description)
        : { html: esc(about.description), rich: false };
      let richHost = document.getElementById("profile-about-description");
      if (!richHost) {
        richHost = document.createElement("div");
        richHost.id = "profile-about-description";
        richHost.dataset.aboutRichDescription = "true";
        p1El.before(richHost);
      }
      richHost.className = `rich-text-content text-base leading-8 text-zinc-600 dark:text-zinc-400${rendered.rich ? "" : " whitespace-pre-line"}`;
      richHost.innerHTML = rendered.html;
      p1El.classList.add("hidden");
      if (p2El) p2El.classList.add("hidden");
      if (p3El) p3El.classList.add("hidden");
    } else {
      if (p1El) {
        p1El.classList.remove("hidden");
        if (about.p1 !== undefined) p1El.textContent = about.p1 || "";
      }
      if (p2El) {
        if (about.p2 && about.p2.trim()) {
          p2El.textContent = about.p2;
          p2El.classList.remove("hidden");
        } else {
          p2El.textContent = "";
          p2El.classList.add("hidden");
        }
      }
      if (p3El) {
        if (about.p3 && about.p3.trim()) {
          p3El.textContent = about.p3;
          p3El.classList.remove("hidden");
        } else {
          p3El.textContent = "";
          p3El.classList.add("hidden");
        }
      }

      const extraParagraphs = Array.isArray(about.paragraphs)
        ? about.paragraphs.slice(2)
        : [];
      if (aboutContainer && extraParagraphs.length > 0) {
        if (p3El) p3El.classList.add("hidden");
        let lastEl = p2El || p1El;
        extraParagraphs.forEach((paragraph) => {
          if (!paragraph || !paragraph.trim()) return;
          const p = document.createElement("p");
          p.dataset.extraAboutParagraph = "true";
          p.className = "mt-4 text-base leading-8 text-justify text-zinc-600 dark:text-zinc-400";
          p.textContent = paragraph;
          lastEl?.after(p);
          lastEl = p;
        });
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
            `<span class="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-xs font-medium dark:border-zinc-800 dark:bg-zinc-900">${esc(tag)}</span>`,
        )
        .join("");
    }

    // Apply Tech Focus badges if present
    const techFocusArr = Array.isArray(about.techFocus) && about.techFocus.length
      ? about.techFocus
      : null;
    if (techFocusArr) {
      const homeTechHost =
        document.getElementById("home-tech-focus") ||
        document.querySelector("#home .mt-14.flex.flex-wrap.gap-2");
      if (homeTechHost) {
        homeTechHost.innerHTML = techFocusArr
          .map(
            (badge) =>
              `<span class="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900">${esc(badge)}</span>`,
          )
          .join("");
      }
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

    if (modalEditorInstance && typeof modalEditorInstance.destroy === "function") {
      modalEditorInstance.destroy();
      modalEditorInstance = null;
    }

    titleEl.textContent = title;
    bodyEl.innerHTML = formHtml;
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    if (window.lucide) lucide.createIcons();

    const form = bodyEl.querySelector("form");
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        if (modalEditorInstance && typeof modalEditorInstance.sync === "function") {
          modalEditorInstance.sync();
        }
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
    if (modalEditorInstance && typeof modalEditorInstance.destroy === "function") {
      modalEditorInstance.destroy();
      modalEditorInstance = null;
    }
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
    container.innerHTML = projectsState.map((p, idx) => `
      <div class="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900">
        <span class="flex h-7 min-w-[28px] shrink-0 items-center justify-center rounded-lg bg-indigo-50 px-2 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">#${idx + 1}</span>
        <div class="flex shrink-0 flex-col gap-0.5">
          <button type="button" data-admin-move-project-up="${idx}" ${idx === 0 ? "disabled" : ""} title="Move Up" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-20 dark:hover:bg-zinc-800"><i class="h-3 w-3" data-lucide="chevron-up"></i></button>
          <button type="button" data-admin-move-project-down="${idx}" ${idx === projectsState.length - 1 ? "disabled" : ""} title="Move Down" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-20 dark:hover:bg-zinc-800"><i class="h-3 w-3" data-lucide="chevron-down"></i></button>
        </div>
        <div class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" class="h-full w-full object-cover" />` : `<i class="h-5 w-5 text-zinc-400" data-lucide="image"></i>`}
        </div>
        <h4 class="min-w-0 flex-1 truncate text-sm font-bold">${esc(p.title || "Untitled Project")}</h4>
        <div class="flex shrink-0 items-center gap-2">
          <button type="button" data-admin-edit-project="${idx}" class="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700 dark:text-zinc-300">Edit</button>
          <button type="button" data-admin-delete-project="${idx}" class="rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">Delete</button>
        </div>
      </div>`).join("");
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
    container.innerHTML = expState.map((item, idx) => `
      <div class="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900">
        <span class="flex h-7 min-w-[28px] shrink-0 items-center justify-center rounded-lg bg-indigo-50 px-2 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">#${idx + 1}</span>
        <div class="flex shrink-0 flex-col gap-0.5">
          <button type="button" data-admin-move-exp-up="${idx}" ${idx === 0 ? "disabled" : ""} title="Move Up" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-20 dark:hover:bg-zinc-800"><i class="h-3 w-3" data-lucide="chevron-up"></i></button>
          <button type="button" data-admin-move-exp-down="${idx}" ${idx === expState.length - 1 ? "disabled" : ""} title="Move Down" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-20 dark:hover:bg-zinc-800"><i class="h-3 w-3" data-lucide="chevron-down"></i></button>
        </div>
        <h4 class="min-w-0 flex-1 truncate text-sm font-bold">${esc(item.title || "Untitled Experience")}</h4>
        <div class="flex shrink-0 items-center gap-2">
          <button type="button" data-admin-edit-exp="${idx}" class="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700 dark:text-zinc-300">Edit</button>
          <button type="button" data-admin-delete-exp="${idx}" class="rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">Delete</button>
        </div>
      </div>`).join("");
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
    container.innerHTML = volState.map((item, idx) => `
      <div class="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900">
        <span class="flex h-7 min-w-[28px] shrink-0 items-center justify-center rounded-lg bg-indigo-50 px-2 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">#${idx + 1}</span>
        <div class="flex shrink-0 flex-col gap-0.5">
          <button type="button" data-admin-move-vol-up="${idx}" ${idx === 0 ? "disabled" : ""} title="Move Up" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-20 dark:hover:bg-zinc-800"><i class="h-3 w-3" data-lucide="chevron-up"></i></button>
          <button type="button" data-admin-move-vol-down="${idx}" ${idx === volState.length - 1 ? "disabled" : ""} title="Move Down" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-20 dark:hover:bg-zinc-800"><i class="h-3 w-3" data-lucide="chevron-down"></i></button>
        </div>
        <h4 class="min-w-0 flex-1 truncate text-sm font-bold">${esc(item.title || "Untitled Volunteering")}</h4>
        <div class="flex shrink-0 items-center gap-2">
          <button type="button" data-admin-edit-vol="${idx}" class="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700 dark:text-zinc-300">Edit</button>
          <button type="button" data-admin-delete-vol="${idx}" class="rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">Delete</button>
        </div>
      </div>`).join("");
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
    container.innerHTML = skillsState.map((group, idx) => `
      <div class="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900">
        <span class="flex h-7 min-w-[28px] shrink-0 items-center justify-center rounded-lg bg-indigo-50 px-2 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">#${idx + 1}</span>
        <div class="flex shrink-0 flex-col gap-0.5">
          <button type="button" data-admin-move-skill-up="${idx}" ${idx === 0 ? "disabled" : ""} title="Move Up" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-20 dark:hover:bg-zinc-800"><i class="h-3 w-3" data-lucide="chevron-up"></i></button>
          <button type="button" data-admin-move-skill-down="${idx}" ${idx === skillsState.length - 1 ? "disabled" : ""} title="Move Down" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-20 dark:hover:bg-zinc-800"><i class="h-3 w-3" data-lucide="chevron-down"></i></button>
        </div>
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"><i class="h-5 w-5" data-lucide="${esc(group.icon || "code-2")}"></i></div>
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <h4 class="truncate text-sm font-bold">${esc(group.category || "Untitled Skill")}</h4>
          <span class="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">${(group.skills || []).length} skills</span>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <button type="button" data-admin-edit-skill="${idx}" class="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700 dark:text-zinc-300">Edit</button>
          <button type="button" data-admin-delete-skill="${idx}" class="rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">Delete</button>
        </div>
      </div>`).join("");
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

  function parseBadgeInput(rawValue) {
    const seen = new Set();
    return String(rawValue || "")
      .split(",")
      .map((item) => item.trim())
      .filter((item) => {
        if (!item) return false;
        const key = item.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function renderBadgeChips(containerId, inputId, badgeKind) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    if (!container || !input) return;
    const badges = parseBadgeInput(input.value);
    container.innerHTML = `
      ${badges
        .map(
          (badge, idx) => `
          <span class="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            <button type="button" data-badge-edit="${badgeKind}" data-badge-idx="${idx}" title="Click to edit badge" class="hover:text-indigo-600 dark:hover:text-indigo-400">${esc(badge)}</button>
            <button type="button" data-badge-remove="${badgeKind}" data-badge-idx="${idx}" aria-label="Remove ${esc(badge)}" title="Remove badge" class="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-zinc-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400">×</button>
          </span>`,
        )
        .join("")}
      <button type="button" data-badge-add="${badgeKind}" class="inline-flex items-center gap-1 rounded-full border border-dashed border-indigo-400 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500/60 dark:text-indigo-400 dark:hover:bg-indigo-950/40">+ Add Badge</button>
    `;
  }

  function renderAboutDynamicFields(about) {
    const richText = window.PortfolioRichText;
    const editorHost = document.getElementById("admin-about-editor-container");
    if (editorHost && richText) {
      const initialAboutHtml = richText.aboutToRichHtml(about);
      if (!aboutEditorInstance || !editorHost.querySelector('[data-rich-role="editor"]')) {
        editorHost.innerHTML = richText.createEditorMarkup({
          idPrefix: "admin-about",
          label: "About Description",
          name: "description",
          placeholder: "Write your complete About description here...",
          helperText: "Use the toolbar to format your About description. Formatting is saved to data/about.json and shown on the public About section.",
          minHeightClass: "min-h-[220px]",
          value: initialAboutHtml,
        });
        aboutEditorInstance = richText.mountEditor({
          idPrefix: "admin-about",
          initialValue: initialAboutHtml,
          form: document.getElementById("admin-about-form"),
        });
      } else {
        aboutEditorInstance.setValue(initialAboutHtml);
      }
    }

    const cardsHost = document.getElementById("admin-quick-details-container");
    if (cardsHost) {
      const cards = Array.isArray(about.quickDetails) && about.quickDetails.length
        ? about.quickDetails
        : [
          { label: "Studying (Card)", value: about.studying || "", key: "studying" },
          { label: "Based In (Card)", value: about.based || "", key: "based" },
          { label: "Focus Areas (Card)", value: about.focus || "", key: "focus" }
        ];
      cardsHost.innerHTML = cards.map((card, index) => `
        <div class="grid gap-3 sm:grid-cols-[1fr_2fr_auto] items-end rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
          <div><label class="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Card ${index + 1} Title</label>
          <input data-quick-detail-label="${index}" class="mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" value="${String(card.label || "").replace(/&/g,"&amp;").replace(/"/g,"&quot;")}" /></div>
          <div><label class="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Card Value</label>
          <input data-quick-detail-value="${index}" class="mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" value="${String(card.value || "").replace(/&/g,"&amp;").replace(/"/g,"&quot;")}" /></div>
          ${index > 2 ? `<button type="button" data-remove-quick-detail="${index}" class="mb-2 text-xs font-semibold text-rose-500">Remove</button>` : `<span></span>`}
        </div>`).join("");
    }
  }

  function populateAboutForm() {
    const about = getCachedAbout();
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "";
    };
    setVal("admin-about-title", about.title || "About me");
    setVal("admin-about-studying", about.studying);
    setVal("admin-about-based", about.based);
    setVal("admin-about-focus", about.focus);
    setVal("admin-about-interests", Array.isArray(about.interests) ? about.interests.join(", ") : "");
    const defaultTechFocus = ["PHP", "JavaScript", "React", "Next.js", "Python", "R", "MySQL", "dotnet", "Tailwind CSS"];
    const techFocusList = Array.isArray(about.techFocus) && about.techFocus.length
      ? about.techFocus
      : defaultTechFocus;
    setVal("admin-about-tech-focus", techFocusList.join(", "));
    renderAboutDynamicFields(about);
    renderBadgeChips("admin-about-interests-chips", "admin-about-interests", "interests");
    renderBadgeChips("admin-about-tech-focus-chips", "admin-about-tech-focus", "techFocus");
  }

  // ==========================================================
  // PROJECT FORM MODAL (UNIFIED RICH TEXT DESCRIPTION)
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
      description: "",
      details: [""],
      features: [],
      image: "",
      liveDemo: "",
      github: "",
      featured: false,
    };

    const richText = window.PortfolioRichText;
    const initialDescription = richText ? richText.projectToRichHtml(p) : (p.description || "");
    const editorBlockHtml = richText
      ? richText.createEditorMarkup({
          idPrefix: "admin-project",
          label: "Description (Overview & Key Features)",
          name: "description",
          placeholder: "Write the project overview, detailed description, and key features here...",
          helperText: "Use the toolbar to format the project description and key features. Saved formatting is displayed on the public project details popup.",
          minHeightClass: "min-h-[220px]",
          value: initialDescription,
        })
      : `<div><label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Description</label><textarea name="description" rows="5" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">${esc(initialDescription)}</textarea></div>`;

    const formHtml = `
      <form class="space-y-4" id="admin-project-form">
        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Project Title *</label>
            <input name="title" required value="${esc(p.title || "")}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Category *</label>
            <input name="category" required value="${esc(p.category || "Web Application")}" placeholder="e.g. Web Application, Data Science, Robotics" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Display Rank (1 = Top)</label>
            <input name="rank" type="number" min="1" max="${maxRank}" value="${currentRank}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-semibold" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Technologies (comma-separated)</label>
          <input name="technologies" value="${esc((p.technologies || []).join(", "))}" placeholder="React, Node.js, Tailwind CSS" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Start Timeline</label>
            <input name="start" value="${esc(p.timeline ? p.timeline.start || "" : "")}" placeholder="e.g. Jan 2026" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">End Timeline</label>
            <input name="end" value="${esc(p.timeline ? p.timeline.end || "" : "")}" placeholder="e.g. Present, or May 2026" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Live Demo URL</label>
            <input name="liveDemo" type="url" value="${esc(p.liveDemo || "")}" placeholder="https://..." class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">GitHub URL</label>
            <input name="github" type="url" value="${esc(p.github || "")}" placeholder="https://github.com/..." class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Image Path / URL</label>
          <input name="image" value="${esc(p.image || "")}" placeholder="images/project.png" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>

        ${editorBlockHtml}

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
      if (modalEditorInstance) modalEditorInstance.sync();
      const fd = new FormData(form);
      const titleVal = (fd.get("title") || "").trim();
      if (!titleVal) return false;

      const techArr = (fd.get("technologies") || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const descHtml = (fd.get("description") || "").trim();
      const plainLines = richText ? richText.toPlainLines(descHtml) : (descHtml ? [descHtml] : []);

      // Preserve any unrelated custom fields on existing project records
      const baseProj = isEdit && p && typeof p === "object" ? { ...p } : {};
      const newProj = {
        ...baseProj,
        id: isEdit ? p.id || editIndex + 1 : Date.now(),
        title: titleVal,
        category: (fd.get("category") || "").trim() || "Web Application",
        technologies: techArr,
        timeline: {
          start: (fd.get("start") || "").trim(),
          end: (fd.get("end") || "").trim(),
        },
        description: descHtml,
        details: plainLines.length ? plainLines : [""],
        features: [],
        image: (fd.get("image") || "").trim(),
        liveDemo: (fd.get("liveDemo") || "").trim(),
        github: (fd.get("github") || "").trim(),
        featured: fd.get("featured") === "on",
      };

      const targetRank = Math.max(1, Math.min(parseInt(fd.get("rank"), 10) || 1, maxRank));
      const targetIndex = targetRank - 1;

      const nextProjects = [...projectsState];
      if (isEdit) {
        nextProjects.splice(editIndex, 1);
        nextProjects.splice(targetIndex, 0, newProj);
      } else {
        nextProjects.splice(targetIndex, 0, newProj);
      }

      const saved = await saveToServer("save-projects", "projects.json", nextProjects, KEY_PROJECTS);
      if (!saved) return false;

      projectsState = nextProjects;
      renderAdminProjects();

      // Refresh live portfolio views
      if (window.loadProjects) await window.loadProjects();
      showToast(`Saved "${newProj.title}" at Rank #${targetRank}`);
      return true;
    });

    if (richText) {
      modalEditorInstance = richText.mountEditor({
        idPrefix: "admin-project",
        initialValue: initialDescription,
        form: document.getElementById("admin-project-form"),
      });
    }
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
          <input name="title" required value="${esc(c.title || "")}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Issuing Organization *</label>
            <input name="organization" required value="${esc(c.organization || "")}" placeholder="e.g. HackerRank, MathWorks, Cisco" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Display Rank (1 = Top)</label>
            <input name="rank" type="number" min="1" max="${maxRank}" value="${currentRank}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-semibold" />
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Issue Date</label>
            <input name="date" value="${esc(c.date || "")}" placeholder="e.g. May 2025" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Skills / Topics Covered</label>
            <input name="skills" value="${esc(c.skills || "")}" placeholder="e.g. Java, C++, Networking" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Credential Verification URL</label>
          <input name="credential" type="url" value="${esc(c.credential || "")}" placeholder="https://..." class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Logo Image Path / URL</label>
          <input name="logo" value="${esc(c.logo || "")}" placeholder="images/hackerrank.png" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
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

      const nextCerts = [...certsState];
      if (isEdit) {
        nextCerts.splice(editIndex, 1);
        nextCerts.splice(targetIndex, 0, newCert);
      } else {
        nextCerts.splice(targetIndex, 0, newCert);
      }

      const saved = await saveToServer("save-certificates", "certificates.json", nextCerts, KEY_CERTS);
      if (!saved) return false;

      certsState = nextCerts;
      renderAdminCertificates();

      if (window.loadCertificates) await window.loadCertificates();
      showToast(`Saved "${newCert.title}" at Rank #${targetRank}`);
      return true;
    });
  }

  // ==========================================================
  // VOLUNTEERING FORM MODAL (SHARED RICH TEXT EDITOR)
  // ==========================================================

  function openVolFormModal(vol = null, editIndex = -1) {
    const isEdit = editIndex >= 0;
    const title = isEdit ? `Edit Volunteering: ${vol.title}` : "Add Volunteering Experience";
    const maxRank = isEdit ? volState.length : volState.length + 1;
    const currentRank = isEdit ? editIndex + 1 : 1;

    const v = vol || {
      title: "",
      time: "",
      description: [],
    };

    const richText = window.PortfolioRichText;
    const initialVolHtml = richText ? richText.pointsToRichHtml(v) : "";
    const editorBlockHtml = richText
      ? richText.createEditorMarkup({
          idPrefix: "admin-vol",
          label: "Description",
          name: "description",
          placeholder: "Write volunteering responsibilities, achievements, or bullet points...",
          helperText: "Use the toolbar to format the volunteering description. Formatting is saved to data/volunteering.json and shown on the public Resume page.",
          minHeightClass: "min-h-[180px]",
          value: initialVolHtml,
        })
      : `<div><label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Description</label><textarea name="description" rows="4" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">${esc(initialVolHtml)}</textarea></div>`;

    const formHtml = `
      <form class="space-y-4" id="admin-vol-form">
        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Organization / Role Title *</label>
          <input name="title" required value="${esc(v.title || "")}" placeholder="e.g. IEEE AIUB Student Branch" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Time Period *</label>
            <input name="time" required value="${esc(v.time || "")}" placeholder="e.g. Mar 2025 — Present" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Display Rank (1 = Top)</label>
            <input name="rank" type="number" min="1" max="${maxRank}" value="${currentRank}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-semibold" />
          </div>
        </div>

        ${editorBlockHtml}

        <div class="flex items-center justify-end gap-3 pt-4">
          <button type="button" data-admin-cancel class="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
          <button type="submit" class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500">${isEdit ? "Update Volunteering" : "Add Volunteering"}</button>
        </div>
      </form>
    `;

    openAdminModal(title, formHtml, async (form) => {
      if (modalEditorInstance) modalEditorInstance.sync();
      const fd = new FormData(form);
      const descHtml = (fd.get("description") || "").trim();

      const baseVol = isEdit && v && typeof v === "object" ? { ...v } : {};
      const newVol = {
        ...baseVol,
        title: (fd.get("title") || "").trim(),
        time: (fd.get("time") || "").trim(),
        description: descHtml,
      };

      if (!newVol.title || !newVol.time) return false;

      const targetRank = Math.max(1, Math.min(parseInt(fd.get("rank"), 10) || 1, maxRank));
      const targetIndex = targetRank - 1;

      const nextVol = [...volState];
      if (isEdit) {
        nextVol.splice(editIndex, 1);
        nextVol.splice(targetIndex, 0, newVol);
      } else {
        nextVol.splice(targetIndex, 0, newVol);
      }

      const saved = await saveToServer("save-volunteering", "volunteering.json", nextVol, KEY_VOL);
      if (!saved) return false;

      volState = nextVol;
      renderAdminVolunteering();

      if (window.loadVolunteering) await window.loadVolunteering();
      showToast(`Saved "${newVol.title}" at Rank #${targetRank}`);
      return true;
    });

    if (richText) {
      modalEditorInstance = richText.mountEditor({
        idPrefix: "admin-vol",
        initialValue: initialVolHtml,
        form: document.getElementById("admin-vol-form"),
      });
    }
  }

  // ==========================================================
  // EXPERIENCE FORM MODAL (SHARED RICH TEXT EDITOR)
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
      description: [],
    };

    const richText = window.PortfolioRichText;
    const initialExpHtml = richText ? richText.pointsToRichHtml(v) : "";
    const editorBlockHtml = richText
      ? richText.createEditorMarkup({
          idPrefix: "admin-exp",
          label: "Description",
          name: "description",
          placeholder: "Write work experience responsibilities, achievements, or bullet points...",
          helperText: "Use the toolbar to format the experience description. Formatting is saved to data/experience.json and shown on the public Resume page.",
          minHeightClass: "min-h-[180px]",
          value: initialExpHtml,
        })
      : `<div><label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Description</label><textarea name="description" rows="4" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">${esc(initialExpHtml)}</textarea></div>`;

    const formHtml = `
      <form class="space-y-4" id="admin-exp-form">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Job Title / Role *</label>
            <input name="title" required value="${esc(v.title || "")}" placeholder="e.g. Web Team Member" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Company / Organization *</label>
            <input name="company" required value="${esc(v.company || "")}" placeholder="e.g. IEEE AIUB Student Branch" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Time Period *</label>
            <input name="time" required value="${esc(v.time || "")}" placeholder="e.g. Mar 2025 — Present" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Display Rank (1 = Top)</label>
            <input name="rank" type="number" min="1" max="${maxRank}" value="${currentRank}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-semibold" />
          </div>
        </div>

        ${editorBlockHtml}

        <div class="flex items-center justify-end gap-3 pt-4">
          <button type="button" data-admin-cancel class="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
          <button type="submit" class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500">${isEdit ? "Update Experience" : "Add Experience"}</button>
        </div>
      </form>
    `;

    openAdminModal(title, formHtml, async (form) => {
      if (modalEditorInstance) modalEditorInstance.sync();
      const fd = new FormData(form);
      const descHtml = (fd.get("description") || "").trim();

      const baseExp = isEdit && v && typeof v === "object" ? { ...v } : {};
      const newExp = {
        ...baseExp,
        title: (fd.get("title") || "").trim(),
        company: (fd.get("company") || "").trim(),
        time: (fd.get("time") || "").trim(),
        description: descHtml,
      };

      if (!newExp.title || !newExp.company || !newExp.time) return false;

      const targetRank = Math.max(1, Math.min(parseInt(fd.get("rank"), 10) || 1, maxRank));
      const targetIndex = targetRank - 1;

      const nextExp = [...expState];
      if (isEdit) {
        nextExp.splice(editIndex, 1);
        nextExp.splice(targetIndex, 0, newExp);
      } else {
        nextExp.splice(targetIndex, 0, newExp);
      }

      const saved = await saveToServer("save-experience", "experience.json", nextExp, KEY_EXP);
      if (!saved) return false;

      expState = nextExp;
      renderAdminExperience();

      if (window.loadExperience) await window.loadExperience();
      showToast(`Saved "${newExp.title}" at Rank #${targetRank}`);
      return true;
    });

    if (richText) {
      modalEditorInstance = richText.mountEditor({
        idPrefix: "admin-exp",
        initialValue: initialExpHtml,
        form: document.getElementById("admin-exp-form"),
      });
    }
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
          <input name="category" required value="${esc(s.category || "")}" placeholder="e.g. Cloud & DevOps, Mobile Development" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Lucide Icon Name</label>
          <input name="icon" value="${esc(s.icon || "code-2")}" placeholder="code-2, globe, brain, database, terminal, cpu, layers..." class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          <p class="mt-1 text-xs text-zinc-400">Standard Lucide icon identifier (e.g. code-2, globe, brain, database, terminal, shield)</p>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Skills (Comma-separated)</label>
          <textarea name="skills" rows="3" placeholder="React, Node.js, Express, Next.js" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">${esc((s.skills || []).join(", "))}</textarea>
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

      const nextSkills = [...skillsState];
      if (isEdit) {
        nextSkills[editIndex] = newGroup;
      } else {
        nextSkills.push(newGroup);
      }

      const saved = await saveToServer("save-skills", "skills.json", nextSkills, KEY_SKILLS);
      if (!saved) return false;

      skillsState = nextSkills;
      renderAdminSkills();

      if (window.loadSkills) await window.loadSkills();
      showToast(`Saved "${newGroup.category}"`);
      return true;
    });
  }

  // ==========================================================
  // BLOG POST FORM MODAL (SHARED RICH TEXT EDITOR)
  // ==========================================================

  function openPostFormModal(post = null, editIndex = -1) {
    const isEdit = editIndex >= 0;
    const title = isEdit ? `Edit Post: ${post.title}` : "Add New Blog Post";
    const maxRank = isEdit ? postsState.length : postsState.length + 1;
    const currentRank = isEdit ? editIndex + 1 : 1;

    const p = post || {
      id: Date.now(),
      slug: "",
      title: "",
      date: new Date().toISOString().split("T")[0],
      category: "General",
      description: "",
      images: [],
      visibility: "public",
      featured: false,
      projectUrl: "",
    };

    const richText = window.PortfolioRichText;
    const initialPostDesc = p.description || (Array.isArray(p.text) ? p.text.join("\n\n") : p.text || "");
    const editorBlockHtml = richText
      ? richText.createEditorMarkup({
          idPrefix: "admin-post",
          label: "Description (Full content for detail page)",
          name: "description",
          placeholder: "Write your full blog post content here...",
          helperText: "Use the toolbar to format the post. Formatting is saved with the post and shown on the public detail page.",
          minHeightClass: "min-h-[220px]",
          value: initialPostDesc,
        })
      : `<div><label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Description</label><textarea name="description" rows="5" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">${esc(initialPostDesc)}</textarea></div>`;

    const formHtml = `
      <form class="space-y-4" id="admin-post-form">
        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Post Title *</label>
          <input name="title" required value="${esc(p.title || "")}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Category</label>
            <input name="category" value="${esc(p.category || "General")}" placeholder="e.g. Web Development, Data Science" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Publication Date</label>
            <input name="date" type="date" value="${esc(p.date || "")}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Display Rank (1 = Top)</label>
            <input name="rank" type="number" min="1" max="${maxRank}" value="${currentRank}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-semibold" />
          </div>
        </div>

        <div class="border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div class="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label class="text-sm font-medium text-zinc-700 dark:text-zinc-300" for="admin-post-images">Images</label>
            <input type="file" id="admin-post-images" name="images" accept="image/*" multiple class="block max-w-full text-xs text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300" />
          </div>
          <div id="admin-post-image-previews" class="flex flex-wrap gap-2"></div>
          <p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Click × to mark an image for removal. Changes are applied when you save.</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Visibility</label>
            <select name="visibility" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
              <option value="public" ${p.visibility === "public" ? "selected" : ""}>Public</option>
              <option value="private" ${p.visibility === "private" ? "selected" : ""}>Private</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Featured</label>
            <select name="featured" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
              <option value="false" ${p.featured === false ? "selected" : ""}>No</option>
              <option value="true" ${p.featured === true ? "selected" : ""}>Yes</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Project URL (Optional)</label>
            <input name="projectUrl" type="url" value="${esc(p.projectUrl || "")}" placeholder="https://..." class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
        </div>

        ${editorBlockHtml}

        <div id="admin-post-form-status" class="hidden text-xs font-medium"></div>

        <div class="flex items-center justify-end gap-3 pt-4">
          <button type="button" data-admin-cancel class="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
          <button type="submit" class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500">${isEdit ? "Update Post" : "Add Post"}</button>
        </div>
      </form>
    `;

    openAdminModal(title, formHtml, async (form) => {
      if (modalEditorInstance) modalEditorInstance.sync();
      const fd = new FormData(form);
      const titleVal = fd.get("title").trim();
      if (!titleVal) return false;

      const newImages = [];
      const retainedPaths = retainedImages.map((item) => item.src);
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          if (!file.type.startsWith("image/")) continue;
          const reader = new FileReader();
          await new Promise((resolve) => {
            reader.onload = () => resolve();
            reader.readAsDataURL(file);
          });
          const base64Data = reader.result.replace(/^data:.*?;base64,/, "");
          const ext = getImageExtension(reader.result, file.name);
          newImages.push({ data: base64Data, name: `${newImages.length + 1}.${ext}`, originalName: file.name });
        }
      }

      const slug = slugify(titleVal);
      const newPost = {
        id: isEdit ? (p.id || editIndex + 1) : Date.now(),
        slug: slug,
        title: titleVal,
        date: fd.get("date") || new Date().toISOString().split("T")[0],
        category: fd.get("category").trim() || "General",
        description: fd.get("description").trim(),
        images: [], // will be populated after upload
        visibility: fd.get("visibility") || "public",
        featured: fd.get("featured") === "true",
        projectUrl: fd.get("projectUrl").trim(),
      };

      const targetRank = Math.max(1, Math.min(parseInt(fd.get("rank"), 10) || 1, maxRank));
      const targetIndex = targetRank - 1;

      // Upload new images if any
      let uploadedPaths = [...retainedPaths];
      if (newImages.length > 0) {
        try {
          const statusEl = document.getElementById("admin-post-form-status");
          if (statusEl) {
            statusEl.textContent = "Uploading images...";
            statusEl.className = "text-xs font-medium text-indigo-600 dark:text-indigo-400 block";
          }
          const res = await fetch("/api/upload-blog-images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug: newPost.slug, title: newPost.title, images: newImages, startIndex: retainedPaths.length }),
          });
          const json = await res.json();
          if (res.ok && json.success && json.paths) {
            uploadedPaths = [...retainedPaths, ...json.paths];
            if (statusEl) {
              statusEl.textContent = `Uploaded ${json.paths.length} image(s)`;
              statusEl.className = "text-xs font-medium text-emerald-600 dark:text-emerald-400 block";
            }
          } else {
            throw new Error(json.error || "Image upload failed");
          }
        } catch (e) {
          console.error("Image upload error:", e);
          const statusEl = document.getElementById("admin-post-form-status");
          if (statusEl) {
            statusEl.textContent = `Image upload failed: ${e.message}`;
            statusEl.className = "text-xs font-medium text-rose-500 block";
          }
          return false;
        }
      }

      newPost.images = uploadedPaths;

      if (isEdit && p.slug === newPost.slug) {
        const removedPaths = (Array.isArray(p.images) ? p.images : []).filter((imagePath) => !retainedPaths.includes(imagePath));
        if (removedPaths.length) {
          try {
            const deleteRes = await fetch("/api/delete-blog-images", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paths: removedPaths }),
            });
            const deleteJson = await deleteRes.json();
            if (!deleteRes.ok || !deleteJson.success) throw new Error(deleteJson.error || "Could not remove selected images");
          } catch (e) {
            console.error("Selected image deletion failed:", e);
            const statusEl = document.getElementById("admin-post-form-status");
            if (statusEl) {
              statusEl.textContent = `Could not remove image(s): ${e.message}`;
              statusEl.className = "text-xs font-medium text-rose-500 block";
            }
            return false;
          }
        }
      }

      const nextPosts = [...postsState];
      if (isEdit) {
        // Delete old images if slug changed
        if (p.slug && p.slug !== newPost.slug) {
          try {
            await fetch("/api/delete-blog-images", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug: p.slug }),
            });
          } catch (e) {
            console.warn("Old images cleanup failed:", e);
          }
        }
        nextPosts.splice(editIndex, 1);
        nextPosts.splice(targetIndex, 0, newPost);
      } else {
        nextPosts.splice(targetIndex, 0, newPost);
      }

      const saved = await saveToServer("save-posts", "posts.json", nextPosts, KEY_POSTS);
      if (!saved) return false;

      postsState = nextPosts;
      renderAdminPosts();

      if (window.loadBlog) await window.loadBlog();
      showToast(`Saved "${newPost.title}" at Rank #${targetRank}`);
      return true;
    });

    // Compact existing/new image previews; deletions are deferred until Update Post.
    const imageInput = document.getElementById("admin-post-images");
    const previewHost = document.getElementById("admin-post-image-previews");
    let retainedImages = (Array.isArray(p.images) ? p.images : []).filter(Boolean).map((src) => ({ src, kind: "existing" }));
    let selectedFiles = [];

    const renderImagePreviews = () => {
      if (!previewHost) return;
      const entries = [
        ...retainedImages.map((item, index) => ({ ...item, key: `existing-${index}` })),
        ...selectedFiles.map((file, index) => ({ src: URL.createObjectURL(file), file, kind: "new", key: `new-${index}` }))
      ];
      // Release temporary preview URLs from the previous render.
      previewHost.querySelectorAll("img[data-object-url]").forEach((img) => URL.revokeObjectURL(img.src));
      previewHost.innerHTML = entries.map((item) => `
        <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800" title="${esc(item.kind === "new" ? item.file.name : item.src.split("/").pop())}">
          <img src="${item.src.startsWith("blob:") ? item.src : esc(item.src)}" alt="Blog image preview" class="h-full w-full object-cover" ${item.kind === "new" ? 'data-object-url="true"' : ""} />
          <button type="button" data-remove-blog-image="${item.key}" aria-label="Remove image" class="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/80 text-[11px] font-bold leading-none text-white shadow hover:bg-rose-600">×</button>
          <span class="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-[8px] text-white">${item.kind === "new" ? "New" : "Saved"}</span>
        </div>`).join("");
    };

    if (imageInput) {
      imageInput.addEventListener("change", () => {
        selectedFiles = [...selectedFiles, ...Array.from(imageInput.files || []).filter((file) => file.type.startsWith("image/"))];
        imageInput.value = "";
        renderImagePreviews();
      });
    }
    if (previewHost) {
      previewHost.addEventListener("click", (event) => {
        const button = event.target.closest("[data-remove-blog-image]");
        if (!button) return;
        const key = button.dataset.removeBlogImage;
        if (key.startsWith("existing-")) retainedImages.splice(Number(key.slice(9)), 1);
        else if (key.startsWith("new-")) selectedFiles.splice(Number(key.slice(4)), 1);
        renderImagePreviews();
      });
    }
    renderImagePreviews();

    if (richText) {
      modalEditorInstance = richText.mountEditor({
        idPrefix: "admin-post",
        initialValue: initialPostDesc,
        form: document.getElementById("admin-post-form"),
      });
    }
  }

  function slugify(name) {
    return String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "post";
  }

  function getImageExtension(dataUrl, name) {
    const match = String(dataUrl).match(/^data:(image\/[^;]+);base64,/);
    if (match) {
      const mime = match[1];
      if (mime === "image/png") return "png";
      if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
      if (mime === "image/webp") return "webp";
      if (mime === "image/gif") return "gif";
    }
    const ext = name ? name.split(".").pop().toLowerCase() : "";
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return ext === "jpeg" ? "jpg" : ext;
    return "jpg";
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );
  }

  // ==========================================================
  // RENDER ADMIN POSTS LIST
  // ==========================================================

  function renderAdminPosts() {
    const container = document.getElementById("admin-posts-list");
    const countBadge = document.getElementById("admin-posts-count");
    if (countBadge) countBadge.textContent = postsState.length;
    if (!container) return;
    if (postsState.length === 0) {
      container.innerHTML = `<p class="py-10 text-center text-sm text-zinc-500">No posts found. Click "Add Post" to create one.</p>`;
      return;
    }
    container.innerHTML = postsState.map((post, idx) => {
      const imgs = Array.isArray(post.images) ? post.images.filter(Boolean) : [];
      return `
        <div class="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900">
          <span class="flex h-7 min-w-[28px] shrink-0 items-center justify-center rounded-lg bg-indigo-50 px-2 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">#${idx + 1}</span>
          <div class="flex shrink-0 flex-col gap-0.5">
            <button type="button" data-admin-move-post-up="${idx}" ${idx === 0 ? "disabled" : ""} title="Move Up" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-20 dark:hover:bg-zinc-800"><i class="h-3 w-3" data-lucide="chevron-up"></i></button>
            <button type="button" data-admin-move-post-down="${idx}" ${idx === postsState.length - 1 ? "disabled" : ""} title="Move Down" class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-20 dark:hover:bg-zinc-800"><i class="h-3 w-3" data-lucide="chevron-down"></i></button>
          </div>
          <div class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
            ${imgs.length ? `<img src="${esc(imgs[0])}" alt="${esc(post.title)}" class="h-full w-full object-cover" />` : `<i class="h-5 w-5 text-zinc-400" data-lucide="image"></i>`}
          </div>
          <h4 class="min-w-0 flex-1 truncate text-sm font-bold">${esc(post.title || "Untitled Blog")}</h4>
          <div class="flex shrink-0 items-center gap-2">
            <button type="button" data-admin-edit-post="${idx}" class="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700 dark:text-zinc-300">Edit</button>
            <button type="button" data-admin-delete-post="${idx}" class="rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">Delete</button>
          </div>
        </div>`;
    }).join("");
    if (window.lucide) lucide.createIcons();
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
      renderAdminPosts();
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

    // Bind authentication controls BEFORE loading data.
    const loginForm = document.getElementById("admin-login-form");
    const pwdInput = document.getElementById("admin-password-input");
    const authError = document.getElementById("admin-auth-error");
    const togglePwdBtn = document.getElementById("admin-toggle-pwd-btn");

    if (loginForm) {
      loginForm.onsubmit = (e) => {
        e.preventDefault();

        const entered = pwdInput?.value ?? "";
        if (entered === ADMIN_PASSWORD) {
          sessionStorage.setItem(AUTH_KEY, "true");
          if (authError) {
            authError.textContent = "";
            authError.classList.add("hidden");
          }
          if (pwdInput) {
            pwdInput.classList.remove("border-rose-500");
            pwdInput.value = "";
          }
          updateAuthUI();
          showToast("Admin access granted!");
        } else {
          if (authError) {
            authError.textContent = "Incorrect password. Please try again.";
            authError.classList.remove("hidden");
          }
          if (pwdInput) {
            pwdInput.classList.add("border-rose-500");
            pwdInput.focus();
            pwdInput.select();
          }
        }
      };
    }

    if (togglePwdBtn && pwdInput) {
      togglePwdBtn.onclick = (e) => {
        e.preventDefault();
        const showPassword = pwdInput.type === "password";
        pwdInput.type = showPassword ? "text" : "password";
        togglePwdBtn.setAttribute("aria-pressed", String(showPassword));
        togglePwdBtn.setAttribute(
          "aria-label",
          showPassword ? "Hide password" : "Show password"
        );
        togglePwdBtn.innerHTML = showPassword
          ? '<i class="h-4 w-4" data-lucide="eye-off"></i>'
          : '<i class="h-4 w-4" data-lucide="eye"></i>';
        if (window.lucide) window.lucide.createIcons();
      };
    }

    // Load initial data without allowing a data-loading error to disable login.
    try {
      await Promise.all([
        window.getPortfolioProjects(),
        window.getPortfolioCertificates(),
        window.getPortfolioExperience(),
        window.getPortfolioVolunteering(),
        window.getPortfolioSkills(),
        window.getPortfolioProfile(),
        window.getPortfolioAbout(),
        window.getPortfolioPosts(),
      ]);

      // Apply saved profile and about content to the site.
      await window.applyProfileContent();
      await window.applyAboutContent();
    } catch (error) {
      console.error("Admin panel data initialization failed:", error);
      if (authError) {
        authError.textContent =
          "Some admin data could not load. Check the local server and JSON files.";
        authError.classList.remove("hidden");
      }
    }

    // Logout button
    document.getElementById("admin-logout-btn")?.addEventListener("click", () => {
      sessionStorage.removeItem(AUTH_KEY);
      updateAuthUI();
      showToast("Admin locked.");
    });

    // Check current auth status
    updateAuthUI();

    // Top-level Admin tabs
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
        if (targetTab === "resume") activateResumeTab("certificates");
        if (targetTab === "profile") activateProfileTab("sidebar");
        if (window.lucide) lucide.createIcons();
      };
    });

    // Resume sub-tabs keep Certificates, Experience, Volunteering and Skills under one parent.
    function activateResumeTab(target) {
      document.querySelectorAll("[data-admin-resume-tab]").forEach((btn) => {
        const active = btn.dataset.adminResumeTab === target;
        btn.classList.toggle("border-indigo-500", active);
        btn.classList.toggle("text-indigo-500", active);
        btn.classList.toggle("border-transparent", !active);
        btn.classList.toggle("text-zinc-500", !active);
      });
      document.querySelectorAll(".admin-resume-pane").forEach((pane) => {
        pane.classList.toggle("hidden", pane.id !== `admin-tab-${target}`);
      });
      if (window.lucide) lucide.createIcons();
    }
    document.querySelectorAll("[data-admin-resume-tab]").forEach((btn) => {
      btn.addEventListener("click", () => activateResumeTab(btn.dataset.adminResumeTab));
    });

    // Profile sub-tabs: Sidebar and About.
    function activateProfileTab(target) {
      document.querySelectorAll("[data-admin-profile-tab]").forEach((btn) => {
        const active = btn.dataset.adminProfileTab === target;
        btn.classList.toggle("border-indigo-500", active);
        btn.classList.toggle("text-indigo-500", active);
        btn.classList.toggle("border-transparent", !active);
        btn.classList.toggle("text-zinc-500", !active);
      });
      document.querySelectorAll(".admin-profile-pane").forEach((pane) => {
        pane.classList.toggle("hidden", pane.id !== `admin-profile-pane-${target}`);
      });
      if (window.lucide) lucide.createIcons();
    }
    document.querySelectorAll("[data-admin-profile-tab]").forEach((btn) => {
      btn.addEventListener("click", () => activateProfileTab(btn.dataset.adminProfileTab));
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

        const saved = await saveToServer("save-profile", "profile.json", updated, KEY_PROFILE);
        if (!saved) return;
        profileState = updated;
        window.applyProfileContent();
      };
    }

    // Profile picture upload handler
    const profilePicInput = document.getElementById("admin-profile-pic-input");
    const profilePicBtn = document.getElementById("admin-upload-profile-pic-btn");
    const profilePicStatus = document.getElementById("admin-profile-pic-status");
    if (profilePicBtn && profilePicInput) {
      profilePicBtn.addEventListener("click", async () => {
        const file = profilePicInput.files?.[0];
        if (!file) { showToast("Please choose an image first."); return; }
        if (!file.type.startsWith("image/")) { showToast("Please select a valid image."); return; }
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const response = await fetch("/api/upload-profile-pic", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ data: event.target.result, filename: file.name })
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || "Upload failed");
            showToast("Profile picture replaced!");
            if (profilePicStatus) {
              profilePicStatus.textContent = "Profile picture replaced successfully.";
              profilePicStatus.className = "mt-2 text-xs font-semibold text-emerald-600 block";
            }
            profilePicInput.value = "";
          } catch (error) {
            console.error(error);
            showToast("Profile picture upload failed. Check server support.");
            if (profilePicStatus) {
              profilePicStatus.textContent = error.message;
              profilePicStatus.className = "mt-2 text-xs font-semibold text-rose-500 block";
            }
          }
        };
        reader.readAsDataURL(file);
      });
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

    document.getElementById("admin-add-quick-detail-btn")?.addEventListener("click", () => {
      const cards = Array.from(document.querySelectorAll("[data-quick-detail-label]")).map((el, index) => ({
        label: el.value,
        value: document.querySelector(`[data-quick-detail-value="${index}"]`)?.value || ""
      }));
      cards.push({ label: "", value: "" });
      const currentDesc = aboutEditorInstance ? aboutEditorInstance.getValue() : getCachedAbout().description;
      renderAboutDynamicFields({ ...getCachedAbout(), description: currentDesc, quickDetails: cards });
    });
    document.getElementById("admin-quick-details-container")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-quick-detail]");
      if (!button) return;
      const index = Number(button.dataset.removeQuickDetail);
      const cards = Array.from(document.querySelectorAll("[data-quick-detail-label]")).map((el, i) => ({
        label: el.value,
        value: document.querySelector(`[data-quick-detail-value="${i}"]`)?.value || ""
      }));
      if (index > 2) cards.splice(index, 1);
      const currentDesc = aboutEditorInstance ? aboutEditorInstance.getValue() : getCachedAbout().description;
      renderAboutDynamicFields({ ...getCachedAbout(), description: currentDesc, quickDetails: cards });
    });

    // Interactive Badge Editors for Interest and Tech Focus inside About Form
    const interestsInput = document.getElementById("admin-about-interests");
    const techFocusInput = document.getElementById("admin-about-tech-focus");
    interestsInput?.addEventListener("input", () => {
      renderBadgeChips("admin-about-interests-chips", "admin-about-interests", "interests");
    });
    techFocusInput?.addEventListener("input", () => {
      renderBadgeChips("admin-about-tech-focus-chips", "admin-about-tech-focus", "techFocus");
    });

    const handleBadgeChipClick = (event) => {
      const addBtn = event.target.closest("[data-badge-add]");
      if (addBtn) {
        const kind = addBtn.dataset.badgeAdd;
        const inputEl = document.getElementById(kind === "techFocus" ? "admin-about-tech-focus" : "admin-about-interests");
        const chipsId = kind === "techFocus" ? "admin-about-tech-focus-chips" : "admin-about-interests-chips";
        if (!inputEl) return;
        const entered = window.prompt(`Add new ${kind === "techFocus" ? "Tech Focus" : "Interest"} badge:`);
        if (entered && entered.trim()) {
          const list = parseBadgeInput(inputEl.value);
          const additions = parseBadgeInput(entered);
          const merged = parseBadgeInput([...list, ...additions].join(", "));
          inputEl.value = merged.join(", ");
          renderBadgeChips(chipsId, inputEl.id, kind);
        }
        return;
      }

      const editBtn = event.target.closest("[data-badge-edit]");
      if (editBtn) {
        const kind = editBtn.dataset.badgeEdit;
        const idx = Number(editBtn.dataset.badgeIdx);
        const inputEl = document.getElementById(kind === "techFocus" ? "admin-about-tech-focus" : "admin-about-interests");
        const chipsId = kind === "techFocus" ? "admin-about-tech-focus-chips" : "admin-about-interests-chips";
        if (!inputEl) return;
        const list = parseBadgeInput(inputEl.value);
        if (idx < 0 || idx >= list.length) return;
        const updatedVal = window.prompt("Edit badge:", list[idx]);
        if (updatedVal !== null) {
          if (updatedVal.trim()) {
            list[idx] = updatedVal.trim();
          } else {
            list.splice(idx, 1);
          }
          inputEl.value = parseBadgeInput(list.join(", ")).join(", ");
          renderBadgeChips(chipsId, inputEl.id, kind);
        }
        return;
      }

      const removeBtn = event.target.closest("[data-badge-remove]");
      if (removeBtn) {
        const kind = removeBtn.dataset.badgeRemove;
        const idx = Number(removeBtn.dataset.badgeIdx);
        const inputEl = document.getElementById(kind === "techFocus" ? "admin-about-tech-focus" : "admin-about-interests");
        const chipsId = kind === "techFocus" ? "admin-about-tech-focus-chips" : "admin-about-interests-chips";
        if (!inputEl) return;
        const list = parseBadgeInput(inputEl.value);
        if (idx >= 0 && idx < list.length) {
          list.splice(idx, 1);
          inputEl.value = list.join(", ");
          renderBadgeChips(chipsId, inputEl.id, kind);
        }
      }
    };

    document.getElementById("admin-about-interests-chips")?.addEventListener("click", handleBadgeChipClick);
    document.getElementById("admin-about-tech-focus-chips")?.addEventListener("click", handleBadgeChipClick);

    // About Form Submit (Direct to data/about.json)
    const aboutForm = document.getElementById("admin-about-form");
    if (aboutForm) {
      aboutForm.onsubmit = async (e) => {
        e.preventDefault();
        if (aboutEditorInstance) aboutEditorInstance.sync();

        const interestsRaw = document.getElementById("admin-about-interests")?.value.trim() || "";
        const interestsArr = parseBadgeInput(interestsRaw);

        const techFocusInputEl = document.getElementById("admin-about-tech-focus");
        const existingAbout = getCachedAbout() || {};
        const techFocusArr = techFocusInputEl
          ? parseBadgeInput(techFocusInputEl.value)
          : Array.isArray(existingAbout.techFocus)
            ? existingAbout.techFocus
            : [];

        const richText = window.PortfolioRichText;
        const descInput = document.getElementById("admin-about-description-input");
        const descriptionHtml = aboutEditorInstance
          ? aboutEditorInstance.getValue()
          : descInput
            ? descInput.value.trim()
            : existingAbout.description || "";

        const plainParagraphs = richText
          ? richText.toPlainLines(descriptionHtml)
          : descriptionHtml
            ? [descriptionHtml]
            : [];

        const quickDetails = Array.from(document.querySelectorAll("[data-quick-detail-label]")).map((el, index) => ({
          label: el.value.trim(),
          value: document.querySelector(`[data-quick-detail-value="${index}"]`)?.value.trim() || ""
        })).filter((card) => card.label || card.value);

        const updatedAbout = {
          ...existingAbout,
          title: document.getElementById("admin-about-title")?.value.trim() || "About me",
          description: descriptionHtml,
          p1: plainParagraphs[0] || "",
          p2: plainParagraphs[1] || "",
          p3: plainParagraphs[2] || "",
          paragraphs: plainParagraphs,
          studying: quickDetails[0]?.value ?? existingAbout.studying ?? "",
          based: quickDetails[1]?.value ?? existingAbout.based ?? "",
          focus: quickDetails[2]?.value ?? existingAbout.focus ?? "",
          quickDetails,
          interests: interestsArr,
          ...(techFocusInputEl || existingAbout.techFocus ? { techFocus: techFocusArr } : {}),
        };

        const saved = await saveToServer("save-about", "about.json", updatedAbout, KEY_ABOUT);
        if (!saved) return;
        aboutState = updatedAbout;
        populateAboutForm();
        await window.applyAboutContent();
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

    document.getElementById("admin-add-post-btn")?.addEventListener("click", () => {
      openPostFormModal();
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
          const nextProjects = [...projectsState];
          nextProjects.splice(idx, 1);
          const saved = await saveToServer("save-projects", "projects.json", nextProjects, KEY_PROJECTS);
          if (!saved) return;
          projectsState = nextProjects;
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
          const nextProjects = [...projectsState];
          const item = nextProjects.splice(idx, 1)[0];
          nextProjects.splice(idx - 1, 0, item);
          const saved = await saveToServer("save-projects", "projects.json", nextProjects, KEY_PROJECTS);
          if (!saved) return;
          projectsState = nextProjects;
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
          const nextProjects = [...projectsState];
          const item = nextProjects.splice(idx, 1)[0];
          nextProjects.splice(idx + 1, 0, item);
          const saved = await saveToServer("save-projects", "projects.json", nextProjects, KEY_PROJECTS);
          if (!saved) return;
          projectsState = nextProjects;
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
          const nextCerts = [...certsState];
          const item = nextCerts.splice(idx, 1)[0];
          nextCerts.splice(idx - 1, 0, item);
          const saved = await saveToServer("save-certificates", "certificates.json", nextCerts, KEY_CERTS);
          if (!saved) return;
          certsState = nextCerts;
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
          const nextCerts = [...certsState];
          const item = nextCerts.splice(idx, 1)[0];
          nextCerts.splice(idx + 1, 0, item);
          const saved = await saveToServer("save-certificates", "certificates.json", nextCerts, KEY_CERTS);
          if (!saved) return;
          certsState = nextCerts;
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
          const nextCerts = [...certsState];
          nextCerts.splice(idx, 1);
          const saved = await saveToServer("save-certificates", "certificates.json", nextCerts, KEY_CERTS);
          if (!saved) return;
          certsState = nextCerts;
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
          const nextExp = [...expState];
          const item = nextExp.splice(idx, 1)[0];
          nextExp.splice(idx - 1, 0, item);
          const saved = await saveToServer("save-experience", "experience.json", nextExp, KEY_EXP);
          if (!saved) return;
          expState = nextExp;
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
          const nextExp = [...expState];
          const item = nextExp.splice(idx, 1)[0];
          nextExp.splice(idx + 1, 0, item);
          const saved = await saveToServer("save-experience", "experience.json", nextExp, KEY_EXP);
          if (!saved) return;
          expState = nextExp;
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
          const nextExp = [...expState];
          nextExp.splice(idx, 1);
          const saved = await saveToServer("save-experience", "experience.json", nextExp, KEY_EXP);
          if (!saved) return;
          expState = nextExp;
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
          const nextVol = [...volState];
          const item = nextVol.splice(idx, 1)[0];
          nextVol.splice(idx - 1, 0, item);
          const saved = await saveToServer("save-volunteering", "volunteering.json", nextVol, KEY_VOL);
          if (!saved) return;
          volState = nextVol;
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
          const nextVol = [...volState];
          const item = nextVol.splice(idx, 1)[0];
          nextVol.splice(idx + 1, 0, item);
          const saved = await saveToServer("save-volunteering", "volunteering.json", nextVol, KEY_VOL);
          if (!saved) return;
          volState = nextVol;
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
          const nextVol = [...volState];
          nextVol.splice(idx, 1);
          const saved = await saveToServer("save-volunteering", "volunteering.json", nextVol, KEY_VOL);
          if (!saved) return;
          volState = nextVol;
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
          const nextSkills = [...skillsState];
          const item = nextSkills.splice(idx, 1)[0];
          nextSkills.splice(idx - 1, 0, item);
          const saved = await saveToServer("save-skills", "skills.json", nextSkills, KEY_SKILLS);
          if (!saved) return;
          skillsState = nextSkills;
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
          const nextSkills = [...skillsState];
          const item = nextSkills.splice(idx, 1)[0];
          nextSkills.splice(idx + 1, 0, item);
          const saved = await saveToServer("save-skills", "skills.json", nextSkills, KEY_SKILLS);
          if (!saved) return;
          skillsState = nextSkills;
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
          const nextSkills = [...skillsState];
          nextSkills.splice(idx, 1);
          const saved = await saveToServer("save-skills", "skills.json", nextSkills, KEY_SKILLS);
          if (!saved) return;
          skillsState = nextSkills;
          renderAdminSkills();
          if (window.loadSkills) await window.loadSkills();
        }
        return;
      }

      // Reorder / Move Post Up
      const movePostUpBtn = e.target.closest("[data-admin-move-post-up]");
      if (movePostUpBtn) {
        const idx = Number(movePostUpBtn.dataset.adminMovePostUp);
        if (idx > 0) {
          const nextPosts = [...postsState];
          const item = nextPosts.splice(idx, 1)[0];
          nextPosts.splice(idx - 1, 0, item);
          const saved = await saveToServer("save-posts", "posts.json", nextPosts, KEY_POSTS);
          if (!saved) return;
          postsState = nextPosts;
          renderAdminPosts();
          if (window.loadBlog) await window.loadBlog();
          showToast(`Moved "${item.title}" up to Rank #${idx}`);
        }
        return;
      }

      // Reorder / Move Post Down
      const movePostDownBtn = e.target.closest("[data-admin-move-post-down]");
      if (movePostDownBtn) {
        const idx = Number(movePostDownBtn.dataset.adminMovePostDown);
        if (idx < postsState.length - 1) {
          const nextPosts = [...postsState];
          const item = nextPosts.splice(idx, 1)[0];
          nextPosts.splice(idx + 1, 0, item);
          const saved = await saveToServer("save-posts", "posts.json", nextPosts, KEY_POSTS);
          if (!saved) return;
          postsState = nextPosts;
          renderAdminPosts();
          if (window.loadBlog) await window.loadBlog();
          showToast(`Moved "${item.title}" down to Rank #${idx + 2}`);
        }
        return;
      }

      // Edit Post
      const editPostBtn = e.target.closest("[data-admin-edit-post]");
      if (editPostBtn) {
        const idx = Number(editPostBtn.dataset.adminEditPost);
        openPostFormModal(postsState[idx], idx);
        return;
      }

      // Delete Post
      const delPostBtn = e.target.closest("[data-admin-delete-post]");
      if (delPostBtn) {
        const idx = Number(delPostBtn.dataset.adminDeletePost);
        const post = postsState[idx];
        if (confirm(`Are you sure you want to delete "${post?.title}"? This will also delete its images.`)) {
          const nextPosts = [...postsState];
          nextPosts.splice(idx, 1);
          const saved = await saveToServer("save-posts", "posts.json", nextPosts, KEY_POSTS);
          if (!saved) return;

          // Delete images from server after JSON update succeeds
          if (post?.slug) {
            try {
              await fetch("/api/delete-blog-images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: post.slug }),
              });
            } catch (e) {
              console.warn("Image deletion failed:", e);
            }
          }
          postsState = nextPosts;
          renderAdminPosts();
          if (window.loadBlog) await window.loadBlog();
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
          posts: { data: postsState, file: "posts.json", icon: "newspaper" },
        };
        const entry = dataMap[type];
        if (!entry) return;

        const jsonStr = JSON.stringify(entry.data, null, 2);
        const itemCount = Array.isArray(entry.data) ? entry.data.length : Object.keys(entry.data).length;
        const sizeKB = (new Blob([jsonStr]).size / 1024).toFixed(1);

        // Syntax highlight JSON
        function highlightJSON(json) {
          const escHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return escHtml(json).replace(
            /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            (match) => {
              let cls = "text-amber-600 dark:text-amber-400"; // number
              if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                  cls = "text-indigo-600 dark:text-indigo-400 font-semibold"; // key
                  match = match.replace(/:$/, "") + ":";
                } else {
                  cls = "text-emerald-600 dark:text-emerald-400"; // string
                }
              } else if (/true|false/.test(match)) {
                cls = "text-violet-600 dark:text-violet-400"; // boolean
              } else if (/null/.test(match)) {
                cls = "text-rose-500 dark:text-rose-400 italic"; // null
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

    bindDownload("admin-export-projects-btn", "projects.json", () => projectsState);
    bindDownload("admin-export-certs-btn", "certificates.json", () => certsState);
    bindDownload("admin-export-exp-btn", "experience.json", () => expState);
    bindDownload("admin-export-vol-btn", "volunteering.json", () => volState);
    bindDownload("admin-export-skills-btn", "skills.json", () => skillsState);
    bindDownload("admin-download-profile-btn", "profile.json", () => profileState);
    bindDownload("admin-export-prof-btn", "profile.json", () => profileState);
    bindDownload("admin-download-about-btn", "about.json", () => aboutState);
    bindDownload("admin-export-about-btn", "about.json", () => aboutState);
    bindDownload("admin-export-posts-btn", "posts.json", () => postsState);

    if (window.lucide) lucide.createIcons();
  };
})();
