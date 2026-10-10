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
  const KEY_VOL = "portfolio_volunteering";
  const KEY_PROFILE = "portfolio_profile";

  // In-memory state
  let projectsState = [];
  let certsState = [];
  let volState = [];
  let profileState = {};

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
      }
    } catch (error) {
      console.warn("Server save API unreachable, saved to browser cache:", error);
    }

    showToast(`Saved in browser cache.`);
    return false;
  }

  // ==========================================================
  // DATA ACCESS HELPERS
  // ==========================================================

  window.getPortfolioProjects = async function () {
    const cached = localStorage.getItem(KEY_PROJECTS);
    if (cached) {
      try {
        projectsState = JSON.parse(cached);
        return projectsState;
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }
    const res = await fetch("data/projects.json");
    projectsState = await res.json();
    return projectsState;
  };

  window.getPortfolioCertificates = async function () {
    const cached = localStorage.getItem(KEY_CERTS);
    if (cached) {
      try {
        certsState = JSON.parse(cached);
        return certsState;
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }
    const res = await fetch("data/certificates.json");
    certsState = await res.json();
    return certsState;
  };

  window.getPortfolioVolunteering = async function () {
    const cached = localStorage.getItem(KEY_VOL);
    if (cached) {
      try {
        volState = JSON.parse(cached);
        return volState;
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }
    const res = await fetch("data/volunteering.json");
    volState = await res.json();
    return volState;
  };

  window.getPortfolioProfile = function () {
    const cached = localStorage.getItem(KEY_PROFILE);
    if (cached) {
      try {
        profileState = JSON.parse(cached);
        return profileState;
      } catch (e) {
        console.error("Profile parse error", e);
      }
    }
    profileState = {
      name: "Farhan Chowdhury",
      role: "Bsc in CSE",
      desc: "I build practical software projects and explore web development, AI, data science, and modern technologies.",
      email: "farhanchowdhury7389@gmail.com",
      location: "Bangladesh",
      github: "https://github.com/farhanchowdhury738/",
      linkedin: "https://www.linkedin.com/in/farhanchowdhury738/",
      heroIntro:
        "I'm a Computer Science student and developer interested in web development, software engineering, data science, and AI. I enjoy turning ideas into practical solutions and learning by building.",
      aboutP1:
        "I'm a Computer Science student at American International University-Bangladesh (AIUB) with a strong interest in software development and modern technology. I enjoy building practical web applications, exploring data science and machine learning, and learning new tools through hands-on projects.",
      aboutP2:
        "My approach is simple: learn by building, understand how things work, and turn ideas into useful solutions. I'm continuously improving my skills across web development, software engineering, AI, and data-driven technologies.",
      studying: "B.Sc. in CSE, AIUB",
      based: "Bangladesh",
      focus: "Web, Data Science, AI",
    };
    return profileState;
  };

  window.applyProfileContent = function () {
    const prof = window.getPortfolioProfile();
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

    const heroIntroEl = document.getElementById("profile-hero-intro");
    if (heroIntroEl && prof.heroIntro) heroIntroEl.textContent = prof.heroIntro;

    const p1El = document.getElementById("profile-about-p1");
    if (p1El && prof.aboutP1) p1El.textContent = prof.aboutP1;

    const p2El = document.getElementById("profile-about-p2");
    if (p2El && prof.aboutP2) p2El.textContent = prof.aboutP2;

    const studyingEl = document.getElementById("profile-studying");
    if (studyingEl && prof.studying) studyingEl.textContent = prof.studying;

    const basedEl = document.getElementById("profile-based");
    if (basedEl && prof.based) basedEl.textContent = prof.based;

    const focusEl = document.getElementById("profile-focus");
    if (focusEl && prof.focus) focusEl.textContent = prof.focus;
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
            <div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
              ${
                p.image
                  ? `<img src="${p.image}" alt="${p.title}" class="h-full w-full object-cover" />`
                  : `<span class="text-xs font-bold text-zinc-400">#${idx + 1}</span>`
              }
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="text-base font-bold">${p.title}</h4>
                ${
                  p.featured
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
      .map((c, idx) => `
        <div class="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
          <div class="flex items-center gap-4">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
              ${
                c.logo
                  ? `<img src="${c.logo}" alt="${c.organization}" class="h-8 w-8 object-contain" />`
                  : `<i class="h-5 w-5 text-indigo-500" data-lucide="award"></i>`
              }
            </div>
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
      `)
      .join("");

    if (window.lucide) lucide.createIcons();
  }

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
      .map((v, idx) => `
        <div class="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
          <div>
            <h4 class="text-base font-bold">${v.title}</h4>
            <p class="text-xs font-medium text-indigo-500 dark:text-indigo-400">${v.time}</p>
            <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">${(v.description || []).length} description point(s)</p>
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
      `)
      .join("");

    if (window.lucide) lucide.createIcons();
  }

  function populateProfileForm() {
    const prof = window.getPortfolioProfile();
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
    setVal("admin-prof-hero-intro", prof.heroIntro);
    setVal("admin-prof-about-p1", prof.aboutP1);
    setVal("admin-prof-about-p2", prof.aboutP2);
    setVal("admin-prof-studying", prof.studying);
    setVal("admin-prof-based", prof.based);
    setVal("admin-prof-focus", prof.focus);
  }

  // ==========================================================
  // PROJECT FORM MODAL
  // ==========================================================

  function openProjectFormModal(project = null, editIndex = -1) {
    const isEdit = editIndex >= 0;
    const title = isEdit ? `Edit Project: ${project.title}` : "Add New Project";

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
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Project Title *</label>
            <input name="title" required value="${p.title || ""}" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Category *</label>
            <input name="category" required value="${p.category || "Web Application"}" placeholder="e.g. Web Application, Data Science, Robotics" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
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
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">GitHub Repository URL</label>
            <input name="github" type="url" value="${p.github || ""}" placeholder="https://github.com/..." class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Image Path or URL</label>
          <input name="image" value="${p.image || ""}" placeholder="images/projects/your-image.png" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Overview / Details (1 paragraph or separate by newline)</label>
          <textarea name="details" rows="2" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">${(p.details || []).join("\n")}</textarea>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Key Features (One feature per line)</label>
          <textarea name="features" rows="3" placeholder="User authentication&#10;Real-time dashboard&#10;Responsive UI" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">${(p.features || []).join("\n")}</textarea>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <input type="checkbox" name="featured" id="modal-project-featured" ${p.featured ? "checked" : ""} class="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" />
          <label for="modal-project-featured" class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Feature this project on the Home Page</label>
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

      if (isEdit) {
        projectsState[editIndex] = newProj;
      } else {
        projectsState.unshift(newProj);
      }

      await saveToServer("save-projects", "projects.json", projectsState, KEY_PROJECTS);
      renderAdminProjects();

      // Refresh live portfolio views
      if (window.loadProjects) await window.loadProjects();
      return true;
    });
  }

  // ==========================================================
  // CERTIFICATE FORM MODAL
  // ==========================================================

  function openCertFormModal(cert = null, editIndex = -1) {
    const isEdit = editIndex >= 0;
    const title = isEdit ? `Edit Certificate: ${cert.title}` : "Add New Certificate";

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

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Issuing Organization *</label>
            <input name="organization" required value="${c.organization || ""}" placeholder="e.g. HackerRank, MathWorks, Cisco" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Issue Date</label>
            <input name="date" value="${c.date || ""}" placeholder="e.g. May 2025" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Skills / Topics Covered</label>
          <input name="skills" value="${c.skills || ""}" placeholder="e.g. Java, C++, Machine Learning" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
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

      if (isEdit) {
        certsState[editIndex] = newCert;
      } else {
        certsState.unshift(newCert);
      }

      await saveToServer("save-certificates", "certificates.json", certsState, KEY_CERTS);
      renderAdminCertificates();

      if (window.loadCertificates) await window.loadCertificates();
      return true;
    });
  }

  // ==========================================================
  // VOLUNTEERING FORM MODAL
  // ==========================================================

  function openVolFormModal(vol = null, editIndex = -1) {
    const isEdit = editIndex >= 0;
    const title = isEdit ? `Edit Volunteering: ${vol.title}` : "Add Volunteering Experience";

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

        <div>
          <label class="block text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">Time Period *</label>
          <input name="time" required value="${v.time || ""}" placeholder="e.g. Mar 2025 — Present" class="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
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

      if (isEdit) {
        volState[editIndex] = newVol;
      } else {
        volState.unshift(newVol);
      }

      await saveToServer("save-volunteering", "volunteering.json", volState, KEY_VOL);
      renderAdminVolunteering();

      if (window.loadVolunteering) await window.loadVolunteering();
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
      renderAdminVolunteering();
      populateProfileForm();
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
      window.getPortfolioVolunteering(),
    ]);

    // Apply saved profile content to site
    window.applyProfileContent();

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

    // Profile Form Submit
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
          heroIntro: document.getElementById("admin-prof-hero-intro")?.value.trim(),
          aboutP1: document.getElementById("admin-prof-about-p1")?.value.trim(),
          aboutP2: document.getElementById("admin-prof-about-p2")?.value.trim(),
          studying: document.getElementById("admin-prof-studying")?.value.trim(),
          based: document.getElementById("admin-prof-based")?.value.trim(),
          focus: document.getElementById("admin-prof-focus")?.value.trim(),
        };

        profileState = updated;
        await saveToServer("save-profile", "profile.json", profileState, KEY_PROFILE);
        window.applyProfileContent();
      };
    }

    // Add item buttons
    document.getElementById("admin-add-project-btn")?.addEventListener("click", () => {
      openProjectFormModal();
    });

    document.getElementById("admin-add-cert-btn")?.addEventListener("click", () => {
      openCertFormModal();
    });

    document.getElementById("admin-add-vol-btn")?.addEventListener("click", () => {
      openVolFormModal();
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

      // Edit / Delete Certificate
      const editCertBtn = e.target.closest("[data-admin-edit-cert]");
      if (editCertBtn) {
        const idx = Number(editCertBtn.dataset.adminEditCert);
        openCertFormModal(certsState[idx], idx);
        return;
      }

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

      // Edit / Delete Volunteering
      const editVolBtn = e.target.closest("[data-admin-edit-vol]");
      if (editVolBtn) {
        const idx = Number(editVolBtn.dataset.adminEditVol);
        openVolFormModal(volState[idx], idx);
        return;
      }

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

      // Copy JSON
      const copyJsonBtn = e.target.closest("[data-copy-json]");
      if (copyJsonBtn) {
        const type = copyJsonBtn.dataset.copyJson;
        if (type === "projects") copyToClipboard(JSON.stringify(projectsState, null, 2), "Projects JSON");
        else if (type === "certificates") copyToClipboard(JSON.stringify(certsState, null, 2), "Certificates JSON");
        else if (type === "volunteering") copyToClipboard(JSON.stringify(volState, null, 2), "Volunteering JSON");
        else if (type === "profile") copyToClipboard(JSON.stringify(profileState, null, 2), "Profile JSON");
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
    bindDownload("admin-download-vol-btn", "volunteering.json", () => volState);
    bindDownload("admin-export-vol-btn", "volunteering.json", () => volState);
    bindDownload("admin-download-profile-btn", "profile.json", () => profileState);
    bindDownload("admin-export-prof-btn", "profile.json", () => profileState);

    // Export All JSON
    document.getElementById("admin-export-all-btn")?.addEventListener("click", () => {
      downloadJSON("projects.json", projectsState);
      setTimeout(() => downloadJSON("certificates.json", certsState), 200);
      setTimeout(() => downloadJSON("volunteering.json", volState), 400);
      setTimeout(() => downloadJSON("profile.json", profileState), 600);
    });

    if (window.lucide) lucide.createIcons();
  };
})();
