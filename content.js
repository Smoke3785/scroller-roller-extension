chrome.runtime.sendMessage({ type: "GET:CONFIG_SCHEMA" }, ({ schema }) => {
  new ScrollerRoller({ config: schema }).init();
});

class ScrollerRoller {
  constructor({ config }) {
    // Configuration / Constants
    this.host = window.location.host;
    this.configFields = config;

    // Preferences
    this.enabledSites = [];
    this.defaultPrefs = {
      enabledSites: [],
    };

    this.configFields.forEach((f) => {
      this.defaultPrefs[f.storageKey] = f.default;
    });

    // Internal state
    this.configState = {};
    this.scrollAnimation = null;
  }

  init() {
    this.loadPreferences();

    this.setupStorageListener();
    this.setupKeyListener();
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  loadPreferences() {
    chrome.storage.sync.get(this.defaultPrefs, (prefs) => {
      this.configFields.forEach((f) => {
        const v = prefs[f.storageKey];
        this.configState[f.storageKey] = v !== undefined ? v : f.default;

        // If this is a UI field, update the DOM to reflect the default if no pref is found
        const el = document.getElementById(f.id);
        if (el) {
          if (f.type === "checkbox") {
            el.checked = typeof v === "boolean" ? v : !!f.default;
          } else {
            el.value = v !== undefined ? v : f.default;
          }
        }
      });

      this.enabledSites = prefs.enabledSites || [];

      if (this.configState.hideCursor) {
        this.setCursorHidden(true);
      }
    });
  }

  setupStorageListener() {
    chrome.storage.onChanged.addListener((changes) => {
      this.configFields.forEach((f) => {
        if (changes[f.storageKey]) {
          const newVal = changes[f.storageKey].newValue;
          this.configState[f.storageKey] = newVal;

          if (f.storageKey === "hideCursor") {
            this.setCursorHidden(newVal);
          }
        }
      });

      if (changes.enabledSites) {
        this.enabledSites = changes.enabledSites.newValue;

        if (!this.enabledSites.includes(this.host)) {
          this.stopScrollAnimation();
        }
      }
    });
  }

  setupKeyListener() {
    window.addEventListener("keydown", (e) => {
      if (!this.enabledSites.includes(this.host)) return;
      if (e.code !== "Space") return;

      e.preventDefault();
      this.stopScrollAnimation();
      window.scrollTo(0, 0);

      if (this.configState.hideCursor) {
        this.setCursorHidden(true);
      }

      setTimeout(() => this.scrollDownSmoothly(), this.configState.delay);
    });
  }

  cursorHidden = false;
  setCursorHidden(hide) {
    // Only apply cursor hiding if this.host is enabled
    if (!this.enabledSites.includes(this.host)) {
      // Always restore if not enabled
      hide = false;
    }
    if (hide) {
      document.body.style.cursor = "none";

      // Add a maximally specific style to hide cursor and block pointer events globally
      if (!document.getElementById("scroller-roller-hide-cursor-style")) {
        const style = document.createElement("style");
        style.id = "scroller-roller-hide-cursor-style";
        style.textContent = `
          html, body, *:not(input):not(textarea):not(select):not(button) {
            cursor: none !important;
            pointer-events: none !important;
          }
        `;
        document.head.appendChild(style);
      }
      const fn = "addEventListener";
      window[fn]("mousemove", this.blockMouse, true);
      window[fn]("mousedown", this.blockMouse, true);
      this.cursorHidden = true;
    } else {
      document.body.style.cursor = "";
      // Remove the global style
      const style = document.getElementById(
        "scroller-roller-hide-cursor-style"
      );
      if (style) style.remove();
      const fn = "removeEventListener";
      window[fn]("mousemove", this.blockMouse, true);
      window[fn]("mousedown", this.blockMouse, true);
      this.cursorHidden = false;
    }
  }

  blockMouse(e) {
    e.stopPropagation();
    e.preventDefault();
    return false;
  }

  stopScrollAnimation() {
    if (this.scrollAnimation) {
      cancelAnimationFrame(this.scrollAnimation);
      this.scrollAnimation = null;
    }

    // Always restore cursor and pointer events
    this.setCursorHidden(false);
  }

  scrollDownSmoothly() {
    chrome.storage.sync.get(this.defaultPrefs, (prefs) => {
      this.configFields.forEach((f) => {
        const v = prefs[f.storageKey];
        this.configState[f.storageKey] = v !== undefined ? v : f.default;
      });

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      let currentSpeed = 0;
      let lastTime = null;

      // optional cancel-on-scroll-up
      let lastY = window.scrollY;
      const onUserScroll = () => {
        if (this.configState.cancelOnScrollUp && window.scrollY < lastY) {
          this.stopScrollAnimation();
          window.removeEventListener("scroll", onUserScroll);
        }
        lastY = window.scrollY;
      };
      if (this.configState.cancelOnScrollUp) {
        window.addEventListener("scroll", onUserScroll);
      }

      // Deceleration parameters
      const decelDist = 300;
      const minSpeed = 0.5;

      const step = (timestamp) => {
        if (!lastTime) lastTime = timestamp;
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        // Handle deceleration near bottom
        const distanceToBottom = maxScroll - window.scrollY;
        let accel = this.configState.acceleration;
        let maxSpd = this.configState.maxSpeed;

        if (
          this.configState.decelerateNearBottom &&
          distanceToBottom < decelDist
        ) {
          const ratio = Math.max(distanceToBottom / decelDist, 0);
          maxSpd = Math.max(minSpeed, maxSpd * ratio);
          accel = accel * ratio;
        }

        currentSpeed = Math.min(currentSpeed + accel * dt, maxSpd);
        window.scrollBy(0, currentSpeed);

        // Detect if scroll is stuck (no progress for 200ms)
        // For whatever reason, checking the maxScroll isn't reliable.
        if (!this._lastScrollCheck) {
          this._lastScrollCheck = { y: window.scrollY, t: timestamp };
        } else {
          if (
            window.scrollY === this._lastScrollCheck.y &&
            timestamp - this._lastScrollCheck.t > 200
          ) {
            this.stopScrollAnimation();
            window.removeEventListener("scroll", onUserScroll);
            return;
          }

          if (window.scrollY !== this._lastScrollCheck.y) {
            this._lastScrollCheck = { y: window.scrollY, t: timestamp };
          }
        }

        if (
          window.scrollY >= maxScroll ||
          !this.enabledSites.includes(this.host)
        ) {
          this.stopScrollAnimation();
          window.removeEventListener("scroll", onUserScroll);
          return;
        }

        this.scrollAnimation = requestAnimationFrame(step);
      };

      this.scrollAnimation = requestAnimationFrame(step);
    });
  }

  // Listen for tab visibility changes and always restore cursor if not enabled
  handleVisibilityChange = () => {
    if (!this.enabledSites.includes(this.host)) {
      this.setCursorHidden(false);
    }
  };
}
