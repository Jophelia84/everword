/*
 * Everword masthead behaviour: the mega panels and the mobile drawer.
 *
 * Panels open on hover and on focus, and close on a short delay so the pointer
 * can cross the gap between the prime row and the panel without the panel
 * closing underneath it. Keyboard and touch get click instead of hover, and
 * Escape closes whatever is open and returns focus to the trigger.
 */
(function () {
  'use strict';

  var CLOSE_DELAY = 220; // long enough to cross the gap, short enough not to linger

  class EverwordHeader extends HTMLElement {
    connectedCallback() {
      this.triggers = Array.from(this.querySelectorAll('[data-ew-mega]'));
      this.panels = Array.from(this.querySelectorAll('[data-ew-panel]'));
      this.scrim = this.querySelector('[data-ew-scrim]');
      this.drawer = this.querySelector('#ew-nav-drawer');
      this.burger = this.querySelector('[data-ew-open="nav"]');
      this.openPanel = null;
      this.closeTimer = 0;

      this.bindPanels();
      this.bindDrawer();

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeAll(true);
      });
      document.addEventListener('click', (e) => {
        if (!this.contains(e.target)) this.closeAll();
      });
    }

    bindPanels() {
      this.triggers.forEach((trigger) => {
        var key = trigger.dataset.ewMega;
        var panel = this.panels.find((p) => p.dataset.ewPanel === key);
        if (!panel) return;

        var open = () => {
          clearTimeout(this.closeTimer);
          this.show(trigger, panel);
        };
        var scheduleClose = () => {
          clearTimeout(this.closeTimer);
          this.closeTimer = setTimeout(() => this.closeAll(), CLOSE_DELAY);
        };

        trigger.addEventListener('mouseenter', open);
        trigger.addEventListener('focus', open);
        trigger.addEventListener('mouseleave', scheduleClose);
        panel.addEventListener('mouseenter', () => clearTimeout(this.closeTimer));
        panel.addEventListener('mouseleave', scheduleClose);

        // Touch and keyboard: the first activation opens rather than navigates,
        // because on a touch device there is no hover to reveal the panel.
        trigger.addEventListener('click', (e) => {
          if (this.openPanel !== panel) {
            e.preventDefault();
            open();
          }
        });

        panel.addEventListener('focusout', (e) => {
          if (!panel.contains(e.relatedTarget) && e.relatedTarget !== trigger) scheduleClose();
        });
      });
    }

    show(trigger, panel) {
      if (this.openPanel === panel) return;
      this.closeAll();
      panel.hidden = false;
      panel.classList.add('on');
      trigger.setAttribute('aria-expanded', 'true');
      if (this.scrim) {
        this.scrim.hidden = false;
        this.scrim.classList.add('on');
      }
      this.openPanel = panel;
      this.openTrigger = trigger;
    }

    bindDrawer() {
      if (!this.drawer || !this.burger) return;

      this.burger.addEventListener('click', () => this.toggleDrawer(true));
      this.drawer.querySelectorAll('[data-ew-close]').forEach((b) => {
        b.addEventListener('click', () => this.toggleDrawer(false));
      });
      if (this.scrim) this.scrim.addEventListener('click', () => this.closeAll());

      // Accordion sections inside the drawer
      this.drawer.querySelectorAll('.mtog').forEach((tog) => {
        tog.addEventListener('click', () => {
          var li = tog.closest('li');
          var open = li.classList.toggle('on');
          tog.setAttribute('aria-expanded', String(open));
        });
      });
    }

    toggleDrawer(open) {
      this.drawer.hidden = !open;
      this.drawer.classList.toggle('on', open);
      this.burger.setAttribute('aria-expanded', String(open));
      if (this.scrim) {
        this.scrim.hidden = !open;
        this.scrim.classList.toggle('on', open);
      }
      document.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) {
        var first = this.drawer.querySelector('a, button');
        if (first) first.focus();
      }
    }

    closeAll(restoreFocus) {
      clearTimeout(this.closeTimer);
      this.panels.forEach((p) => {
        p.classList.remove('on');
        p.hidden = true;
      });
      this.triggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));
      if (this.drawer) {
        this.drawer.classList.remove('on');
        this.drawer.hidden = true;
      }
      if (this.burger) this.burger.setAttribute('aria-expanded', 'false');
      if (this.scrim) {
        this.scrim.classList.remove('on');
        this.scrim.hidden = true;
      }
      document.documentElement.style.overflow = '';
      if (restoreFocus && this.openTrigger) this.openTrigger.focus();
      this.openPanel = null;
      this.openTrigger = null;
    }
  }

  if (!customElements.get('everword-header')) {
    customElements.define('everword-header', EverwordHeader);
  }
})();
