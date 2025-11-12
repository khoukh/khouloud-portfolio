document.addEventListener("DOMContentLoaded", () => {
  const desktop = document.querySelector(".desktop");
  if (!desktop) {
    console.warn("windows.js: .desktop element not found. Make sure your HTML has <section class='desktop'>");
    return;
  }

  let zIndexCounter = 100;

  let safariWindows = [];
  let safariVisible = true;
  let notesWindow = null;
  let notesVisible = true;
  let messagesWindow = null;
  let finderWindow = null; // added

  let safariToggleState = "default";

  const projects = [
    { id: "project-1", title: "Tableau Project", url: "projects/project-1.html" },
    { id: "project-2", title: "R Project", url: "projects/project-2.html" },
    { id: "project-3", title: "Python Project", url: "projects/project-3.html" },
    { id: "project-4", title: "PowerBI Project", url: "projects/project-4.html" },
  ];

  const px = v => (typeof v === "number" ? v : parseInt(v, 10) || 0);

  function bringToFront(el) {
    if (!el) return;
    zIndexCounter = Math.max(zIndexCounter, Number(el.style.zIndex) || zIndexCounter);
    el.style.zIndex = ++zIndexCounter;
  }

  // ---------------- SAFARI PROJECT WINDOWS ----------------
  function spawnProjectWindows() {
    safariWindows.forEach(w => {
      if (typeof w._cleanup === "function") w._cleanup();
      w.remove();
    });
    safariWindows = [];

    const desktopWidth = window.innerWidth;
    const desktopHeight = window.innerHeight;
    const dockHeight = 100;
    const padding = 60;
    const usableHeight = desktopHeight - dockHeight - padding;
    const limit = Math.min(4, projects.length);

    for (let i = 0; i < limit; i++) {
      const project = projects[i];
      let left = padding, top = padding, width = 400, height = 300;

      if (i === 0) {
        width = Math.min(Math.round(desktopWidth * 0.45), desktopWidth - (padding * 2));
        height = Math.min(Math.round(usableHeight * 0.45), usableHeight - (padding * 2));
      } else if (i === 1) {
        width = Math.min(Math.round(desktopWidth * 0.45), desktopWidth - (padding * 2));
        height = Math.min(Math.round(usableHeight * 0.45), usableHeight - (padding * 2));
        top = Math.round(padding + (usableHeight * 0.5));
      } else if (i === 2) {
        width = Math.round(desktopWidth * 0.35);
        height = Math.round(usableHeight * 0.44);
        left = Math.round(desktopWidth * 0.5);
      } else if (i === 3) {
        width = Math.round(desktopWidth * 0.35);
        height = Math.round(usableHeight * 0.38);
        left = Math.round(desktopWidth * 0.5);
        top = Math.round(padding + (usableHeight * 0.5));
      }

      createWindowForProject(project, i, { left, top, width, height });
    }
    safariVisible = true;
    safariToggleState = "default";
  }

  function createWindowForProject(project, index, opts = {}) {
    const { left = 100, top = 100, width = 400, height = 300 } = opts;

    const win = document.createElement("div");
    win.className = "window safari-window";
    win.dataset.projectId = project.id;

    Object.assign(win.style, {
      position: "absolute",
      left: left + "px",
      top: top + "px",
      width: width + "px",
      height: height + "px",
      zIndex: ++zIndexCounter,
      visibility: "visible",
      pointerEvents: "auto"
    });

    win.innerHTML = `
      <div class="window-header">
        <div class="window-buttons">
          <span class="close" title="Close"></span>
          <span class="minimize" title="Minimize"></span>
          <span class="maximize" title="Open project"></span>
        </div>
        <div class="safari-url-bar">${project.title}</div>
      </div>
      <div class="window-content">
        <iframe src="${project.url}" frameborder="0"></iframe>
      </div>
      <div class="resize-handle top" data-handle="top"></div>
      <div class="resize-handle right" data-handle="right"></div>
      <div class="resize-handle bottom" data-handle="bottom"></div>
      <div class="resize-handle left" data-handle="left"></div>
      <div class="resize-handle top-left" data-handle="top-left"></div>
      <div class="resize-handle top-right" data-handle="top-right"></div>
      <div class="resize-handle bottom-left" data-handle="bottom-left"></div>
      <div class="resize-handle bottom-right" data-handle="bottom-right"></div>
    `;

    desktop.appendChild(win);
    safariWindows.push(win);
    attachWindowBehaviors(win, project);

    win.style.transform = "scale(0.9)";
    win.style.opacity = "0";
    setTimeout(() => {
      win.style.transition = "all 260ms cubic-bezier(.2,.9,.2,1)";
      win.style.transform = "scale(1)";
      win.style.opacity = "1";
    }, 30 * index);

    return win;
  }

  // ---------------- ATTACH WINDOW BEHAVIORS ----------------
  function attachWindowBehaviors(win, project = {}) {
    const minW = 220, minH = 140;

    function onClose(e) {
      e.stopPropagation();
      if (typeof win._cleanup === "function") win._cleanup();
      win.remove();
      safariWindows = safariWindows.filter(w => w !== win);
      if (win === messagesWindow) messagesWindow = null;
      if (win === notesWindow) notesWindow = null;
      if (win === finderWindow) finderWindow = null;
    }

    function onMaximize(e) {
      e.stopPropagation();
      if (project && project.url) {
        window.location.href = project.url;
      } else {
        bringToFront(win);
      }
    }

    function bringFront() {
      bringToFront(win);
    }

    const header = win.querySelector(".window-header");
    let dragState = null;

    function onHeaderPointerDown(e) {
      if (e.button !== 0) return;
      e.preventDefault();
      bringFront();
      dragState = {
        startX: e.clientX, startY: e.clientY,
        origLeft: px(win.style.left || win.offsetLeft), origTop: px(win.style.top || win.offsetTop)
      };
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp, { once: true });
    }

    function onPointerMove(e) {
      if (dragState) {
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        win.style.left = (dragState.origLeft + dx) + "px";
        win.style.top = (dragState.origTop + dy) + "px";
      } else if (win._resize) {
        handleResize(e);
      }
    }

    function onPointerUp() {
      dragState = null;
      if (win._resize) win._resize = null;
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    }

    function onHandlePointerDown(e) {
      e.preventDefault();
      bringFront();
      const handle = e.currentTarget.dataset.handle;
      const rect = win.getBoundingClientRect();
      win._resize = { handle, startX: e.clientX, startY: e.clientY, origRect: rect };
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp, { once: true });
    }

    function handleResize(e) {
      if (!win._resize) return;
      const r = win._resize.origRect;
      const dx = e.clientX - win._resize.startX;
      const dy = e.clientY - win._resize.startY;
      let newLeft = r.left, newTop = r.top, newWidth = r.width, newHeight = r.height;
      const h = win._resize.handle;

      if (h.includes("right")) newWidth = Math.max(minW, r.width + dx);
      if (h.includes("bottom")) newHeight = Math.max(minH, r.height + dy);
      if (h.includes("left")) { newWidth = Math.max(minW, r.width - dx); newLeft = r.left + dx; }
      if (h.includes("top")) { newHeight = Math.max(minH, r.height - dy); newTop = r.top + dy; }

      win.style.width = Math.round(newWidth) + "px";
      win.style.height = Math.round(newHeight) + "px";
      win.style.left = Math.round(newLeft) + "px";
      win.style.top = Math.round(newTop) + "px";
    }

    const handles = win.querySelectorAll(".resize-handle");
    handles.forEach(h => h.addEventListener("pointerdown", onHandlePointerDown));
    if (header) header.addEventListener("pointerdown", onHeaderPointerDown);

    const closeBtn = win.querySelector(".close");
    const maximizeBtn = win.querySelector(".maximize");

    if (closeBtn) closeBtn.addEventListener("click", onClose);
    if (maximizeBtn) maximizeBtn.addEventListener("click", onMaximize);

    win.addEventListener("pointerdown", bringFront);

    win._cleanup = () => {
      if (closeBtn) closeBtn.removeEventListener("click", onClose);
      if (maximizeBtn) maximizeBtn.removeEventListener("click", onMaximize);
      win.removeEventListener("pointerdown", bringFront);
      if (header) header.removeEventListener("pointerdown", onHeaderPointerDown);
      handles.forEach(h => h.removeEventListener("pointerdown", onHandlePointerDown));
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };
  }

  // ---------------- NOTES WINDOW ----------------
  function spawnNotesWindow() {
    if (notesWindow) {
      bringToFront(notesWindow);
      notesWindow.style.visibility = "visible";
      notesWindow.style.pointerEvents = "auto";
      notesVisible = true;
      return;
    }

    notesWindow = document.createElement("div");
    notesWindow.className = "window notes-window";
    Object.assign(notesWindow.style, {
      position: "absolute",
      right: "20px",
      top: "300px",
      width: "350px",
      height: "500px",
      zIndex: ++zIndexCounter
    });

    notesWindow.innerHTML = `
      <div class="notes-inner">
        <div class="notes-header">
          <div class="window-buttons">
            <span class="close"></span>
            <span class="minimize"></span>
            <span class="maximize"></span>
          </div>
          <span class="title"> Quick Tour </span>
          <span>•••</span>
        </div>
       <div class="notes-content">
    <h2>Welcome to my little digital world</h2>
    <p><span class="highlight">I'm Khouloud, a marketing&data analyst based in Paris </span></p>
    <p>Here’s how to explore without getting lost:</p>

    <div class="note-tips">
      <div class="tip">
        <div>
          <strong>Safari tabs</strong>
          <p>Click around. Each window opens a different project.</p>
        </div>
      </div>

      <div class="tip">
        <div>
          <strong>Finder</strong>
          <p>If you click the finder app you'll find everyhting you need to know about me.</p>
        </div>
      </div>

      <div class="tip">
        <div>
          <strong>Messages</strong>
          <p>That’s your line to me — go ahead, say hi.</p>
        </div>
      </div>

    </div>

    <p class="end-note">Pro tip: drag, resize, explore.</p>
  </div>
    
        <div class="notes-footer">
          <span><img src="assets/icons/checklist.png" alt="Checklist"></span>
          <span><img src="assets/icons/paperclip.png" alt="PaperClip"></span>
          <span><img src="assets/icons/pen.png" alt="Pen"></span>
          <span><img src="assets/icons/pencil.png" alt="Pencil"></span>
        </div>
        <div class="resize-handle top" data-handle="top"></div>
        <div class="resize-handle right" data-handle="right"></div>
        <div class="resize-handle bottom" data-handle="bottom"></div>
        <div class="resize-handle left" data-handle="left"></div>
        <div class="resize-handle top-left" data-handle="top-left"></div>
        <div class="resize-handle top-right" data-handle="top-right"></div>
        <div class="resize-handle bottom-left" data-handle="bottom-left"></div>
        <div class="resize-handle bottom-right" data-handle="bottom-right"></div>
      </div>
    `;
    desktop.appendChild(notesWindow);
    attachWindowBehaviors(notesWindow);
    notesVisible = true;
  }

  // ---------------- MESSAGES WINDOW ----------------
  function spawnMessagesWindow() {
    if (messagesWindow) {
      bringToFront(messagesWindow);
      messagesWindow.style.display = "block";
      messagesWindow.style.visibility = "visible";
      messagesWindow.style.pointerEvents = "auto";
      return;
    }

    const win = document.createElement("div");
    win.className = "window messages-window";
    Object.assign(win.style, {
      position: "absolute",
      left: "120px",
      top: "140px",
      width: "1000px",
      height: "650px",
      zIndex: ++zIndexCounter,
      visibility: "visible",
      pointerEvents: "auto"
    });

    win.innerHTML = `
      <div class="window-header">
        <div class="window-buttons">
          <span class="close"></span>
          <span class="minimize"></span>
          <span class="maximize"></span>
        </div>
        <div class="safari-url-bar">Contact</div>
      </div>
      <div class="window-content" style="width:100%; height:calc(100% - 40px); overflow:hidden;">
        <iframe src="contact.html" style="border:none; width:100%; height:100%;"></iframe>
      </div>
      <div class="resize-handle top" data-handle="top"></div>
      <div class="resize-handle right" data-handle="right"></div>
      <div class="resize-handle bottom" data-handle="bottom"></div>
      <div class="resize-handle left" data-handle="left"></div>
      <div class="resize-handle top-left" data-handle="top-left"></div>
      <div class="resize-handle top-right" data-handle="top-right"></div>
      <div class="resize-handle bottom-left" data-handle="bottom-left"></div>
      <div class="resize-handle bottom-right" data-handle="bottom-right"></div>
    `;

    desktop.appendChild(win);
    messagesWindow = win;
    attachWindowBehaviors(win, { url: "contact.html" });
    bringToFront(win);
  }

  // ---------------- FINDER WINDOW ----------------
  function spawnFinderWindow() {
    if (finderWindow) {
      bringToFront(finderWindow);
      finderWindow.style.display = "block";
      finderWindow.style.visibility = "visible";
      finderWindow.style.pointerEvents = "auto";
      return;
    }

    const win = document.createElement("div");
    win.className = "window finder-window";
    Object.assign(win.style, {
      position: "flex",
      left: "120px",
      top: "140px",
      width: "1200px",
      height: "700px",
      zIndex: ++zIndexCounter,
      visibility: "visible",
      pointerEvents: "auto"
    });

    win.innerHTML = `
      <div class="window-header">
        <div class="window-buttons">
          <span class="close"></span>
          <span class="minimize"></span>
          <span class="maximize"></span>
        </div>
        <div class="safari-url-bar">About Me</div>
      </div>
      <div class="window-content" style="width:100%; height:calc(100% - 40px); overflow:auto;">
        <iframe src="aboutme.html" style="border:none; width:100%; height:100%;"></iframe>
      </div>
      <div class="resize-handle top" data-handle="top"></div>
      <div class="resize-handle right" data-handle="right"></div>
      <div class="resize-handle bottom" data-handle="bottom"></div>
      <div class="resize-handle left" data-handle="left"></div>
      <div class="resize-handle top-left" data-handle="top-left"></div>
      <div class="resize-handle top-right" data-handle="top-right"></div>
      <div class="resize-handle bottom-left" data-handle="bottom-left"></div>
      <div class="resize-handle bottom-right" data-handle="bottom-right"></div>
    `;

    desktop.appendChild(win);
    finderWindow = win;
    attachWindowBehaviors(win, { url: "aboutme.html" });
    bringToFront(win);
  }

  // ---------------- SPAWN ON LOAD ----------------
  setTimeout(spawnNotesWindow, 700);
  setTimeout(spawnProjectWindows, 1200);

  // ---------------- DOCK ICONS ----------------
  const safariIcon = document.querySelector('.dock-icon[data-app="Safari"]');
  if (safariIcon) {
    safariIcon.addEventListener("click", () => {
      if (safariWindows.length === 0) {
        spawnProjectWindows();
        return;
      }
      safariVisible = !safariVisible;
      safariWindows.forEach(w => {
        w.style.visibility = safariVisible ? "visible" : "hidden";
        w.style.pointerEvents = safariVisible ? "auto" : "none";
      });
    });
  }

  const notesIcon = document.querySelector('.dock-icon[data-app="Notes"]');
  if (notesIcon) notesIcon.addEventListener("click", () => {
      if (!notesWindow) {
        spawnNotesWindow();
        return;
      }
      const isHidden = notesWindow.style.display === "none" || notesWindow.style.visibility === "hidden";
      notesWindow.style.display = isHidden ? "block" : "none";
      notesWindow.style.visibility = isHidden ? "visible" : "hidden";
      notesWindow.style.pointerEvents = isHidden ? "auto" : "none";
      if (isHidden) bringToFront(notesWindow);
    });

  const messagesIcon = document.querySelector('.dock-icon[data-app="Messages"]');
  if (messagesIcon) messagesIcon.addEventListener("click", () => {
      if (!messagesWindow) {
        spawnMessagesWindow();
        return;
      }
      const isHidden = messagesWindow.style.display === "none" || messagesWindow.style.visibility === "hidden";
      messagesWindow.style.display = isHidden ? "block" : "none";
      messagesWindow.style.visibility = isHidden ? "visible" : "hidden";
      messagesWindow.style.pointerEvents = isHidden ? "auto" : "none";
      if (isHidden) bringToFront(messagesWindow);
    });

  const finderIcon = document.querySelector('.dock-icon[data-app="Finder"]');
  if (finderIcon) {
    finderIcon.addEventListener("click", () => {
      if (!finderWindow) {
        spawnFinderWindow();
        return;
      }
      const isHidden = finderWindow.style.display === "none" || finderWindow.style.visibility === "hidden";
      finderWindow.style.display = isHidden ? "block" : "none";
      finderWindow.style.visibility = isHidden ? "visible" : "hidden";
      finderWindow.style.pointerEvents = isHidden ? "auto" : "none";
      if (isHidden) bringToFront(finderWindow);
    });
  }
});
