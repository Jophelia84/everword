/*
 * Everword email capture.
 *
 * Triggers are whichever fires first: a timer, a scroll depth, or exit intent.
 * Exit intent is desktop-only on purpose — pointing at the tab bar has no touch
 * equivalent, and the mobile approximations (fast upward scroll, back button)
 * fire on ordinary browsing and read as a trap.
 *
 * A dismissal is remembered for weeks and a signup for a year, because asking
 * again after someone has already joined is worse than not asking at all.
 */
(function () {
  'use strict';

  var KEY = 'everword:optin';

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function writeState(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { /* private window; it will ask again next visit */ }
  }

  function suppressedUntil(state) {
    return typeof state.until === 'number' ? state.until : 0;
  }

  class EverwordOptin extends HTMLElement {
    connectedCallback() {
      this.panel = this.querySelector('.ew-optin__panel');
      this.form = this.querySelector('form');
      this.email = this.querySelector('input[type="email"]');

      // The form posts and the page reloads, so success arrives as a rendered
      // note rather than a callback. Show the modal to display it, and stop
      // asking from here on.
      if (this.querySelector('[data-ew-success]')) {
        this.remember(parseInt(this.dataset.rememberSignupDays, 10) || 365);
        this.open(true);
        return;
      }

      if (Date.now() < suppressedUntil(readState())) return;

      this.querySelectorAll('[data-ew-dismiss]').forEach((el) => {
        el.addEventListener('click', () => this.dismiss());
      });

      this.onKey = (e) => {
        if (e.key === 'Escape') this.dismiss();
        if (e.key === 'Tab') this.trapFocus(e);
      };

      this.arm();
    }

    arm() {
      var self = this;
      var fired = false;
      var fire = function () {
        if (fired) return;
        fired = true;
        cleanup();
        self.open();
      };

      var timer = 0;
      var delay = parseInt(this.dataset.delay, 10);
      if (delay > 0) timer = setTimeout(fire, delay * 1000);

      var scrollAt = parseInt(this.dataset.scroll, 10);
      var onScroll = null;
      if (scrollAt > 0) {
        onScroll = function () {
          var h = document.documentElement.scrollHeight - window.innerHeight;
          if (h <= 0) return;
          if ((window.scrollY / h) * 100 >= scrollAt) fire();
        };
        window.addEventListener('scroll', onScroll, { passive: true });
      }

      var onLeave = null;
      // Exit intent needs a real pointer, so it is gated on the device having
      // one rather than on viewport width.
      if (this.dataset.exitIntent === 'true' && window.matchMedia('(pointer: fine)').matches) {
        onLeave = function (e) {
          if (e.clientY <= 0) fire();
        };
        document.addEventListener('mouseout', onLeave);
      }

      function cleanup() {
        clearTimeout(timer);
        if (onScroll) window.removeEventListener('scroll', onScroll);
        if (onLeave) document.removeEventListener('mouseout', onLeave);
      }
      this.cleanup = cleanup;
    }

    open(isSuccess) {
      this.hidden = false;
      requestAnimationFrame(() => this.classList.add('on'));
      document.addEventListener('keydown', this.onKey || (() => {}));
      this.lastFocused = document.activeElement;
      var target = isSuccess ? this.querySelector('[data-ew-dismiss]') : this.email;
      if (target) target.focus({ preventScroll: true });
      this.dispatchEvent(new CustomEvent('everword:optin:open', { bubbles: true }));
    }

    dismiss() {
      this.classList.remove('on');
      this.remember(parseInt(this.dataset.rememberDays, 10) || 14);
      if (this.onKey) document.removeEventListener('keydown', this.onKey);
      if (this.cleanup) this.cleanup();
      var self = this;
      setTimeout(function () { self.hidden = true; }, 240);
      if (this.lastFocused && this.lastFocused.focus) this.lastFocused.focus();
    }

    remember(days) {
      var state = readState();
      state.until = Date.now() + days * 864e5;
      writeState(state);
    }

    /* A modal that cannot be left with the keyboard is a broken page. */
    trapFocus(e) {
      var focusable = this.panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  if (!customElements.get('everword-optin')) {
    customElements.define('everword-optin', EverwordOptin);
  }
})();
