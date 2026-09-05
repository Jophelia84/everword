/*
 * Everword wishlist.
 *
 * On persistence, plainly: a Shopify theme cannot write customer data. There is
 * no storefront API for setting a customer metafield, so an account-backed
 * wishlist needs something server-side — an app proxy — to write to.
 *
 * This is built so that both cases work and the second is a setting, not a
 * rewrite:
 *
 *   - Every visitor gets a wishlist immediately, kept in localStorage. It is
 *     per browser, which is the honest limit of what a theme alone can do.
 *   - A logged-in customer's saved list is read server-side from the
 *     everword.wishlist customer metafield and seeded in below, so anything
 *     written by an app, Flow or the admin shows up.
 *   - If a sync endpoint is configured, the list is fetched from and written
 *     back to it, and it becomes the source of truth across devices. The
 *     endpoint is expected to be an app proxy, so it is same-origin and carries
 *     the customer's session.
 *
 * Local and remote are merged as a union on load, never replaced, so signing in
 * on a new device does not throw away what was saved before signing in.
 */
(function () {
  'use strict';

  var KEY = 'everword:wishlist';
  var EVENT = 'everword:wishlist:change';

  var config = { syncUrl: '', loggedIn: false, seed: [] };

  function readLocal() {
    try {
      var raw = localStorage.getItem(KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.filter(function (h) { return typeof h === 'string'; }) : [];
    } catch (e) {
      // Private windows and blocked site data both throw here. A wishlist that
      // only lasts the page is better than a page that fails to render.
      return [];
    }
  }

  function writeLocal(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) { /* nothing to do; the in-memory list still works this page */ }
  }

  var state = readLocal();

  function announce() {
    document.dispatchEvent(new CustomEvent(EVENT, { detail: { list: state.slice() } }));
  }

  function union(a, b) {
    var out = a.slice();
    b.forEach(function (h) { if (out.indexOf(h) === -1) out.push(h); });
    return out;
  }

  function push() {
    if (!config.syncUrl) return Promise.resolve();
    return fetch(config.syncUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ wishlist: state }),
    }).catch(function () { /* stays local until the endpoint is reachable again */ });
  }

  var Wishlist = {
    all: function () { return state.slice(); },
    has: function (handle) { return state.indexOf(handle) !== -1; },
    toggle: function (handle) {
      var i = state.indexOf(handle);
      if (i === -1) state.push(handle);
      else state.splice(i, 1);
      writeLocal(state);
      announce();
      push();
      return this.has(handle);
    },
    remove: function (handle) {
      var i = state.indexOf(handle);
      if (i === -1) return;
      state.splice(i, 1);
      writeLocal(state);
      announce();
      push();
    },
    configure: function (next) {
      Object.assign(config, next);
      var merged = union(state, config.seed || []);
      if (merged.length !== state.length) {
        state = merged;
        writeLocal(state);
      }
      if (config.syncUrl) {
        fetch(config.syncUrl, { credentials: 'same-origin' })
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (data) {
            if (!data || !Array.isArray(data.wishlist)) return;
            var m = union(state, data.wishlist);
            var changed = m.length !== state.length;
            state = m;
            writeLocal(state);
            announce();
            if (changed) push();
          })
          .catch(function () { /* offline or not installed; local list stands */ });
      }
      announce();
    },
  };

  window.EverwordWishlist = Wishlist;

  /* ---- the heart on a card or the product page ---- */
  class WishlistButton extends HTMLElement {
    connectedCallback() {
      this.handle = this.dataset.handle;
      this.button = this.querySelector('button');
      if (!this.button || !this.handle) return;

      this.button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        Wishlist.toggle(this.handle);
      });
      this.sync = () => this.render();
      document.addEventListener(EVENT, this.sync);
      this.render();
    }

    disconnectedCallback() {
      document.removeEventListener(EVENT, this.sync);
    }

    render() {
      var on = Wishlist.has(this.handle);
      this.button.setAttribute('aria-pressed', String(on));
      var label = this.button.querySelector('[data-ew-label]');
      if (label) label.textContent = on ? 'Saved' : 'Wishlist';
      this.button.setAttribute('aria-label', on ? 'Remove from wishlist' : 'Save to wishlist');
    }
  }

  /* ---- the count beside the masthead heart ---- */
  class WishlistCount extends HTMLElement {
    connectedCallback() {
      this.sync = () => {
        var n = Wishlist.all().length;
        this.textContent = n ? String(n) : '';
        this.hidden = n === 0;
      };
      document.addEventListener(EVENT, this.sync);
      this.sync();
    }

    disconnectedCallback() {
      document.removeEventListener(EVENT, this.sync);
    }
  }

  /* ---- the wishlist page ---- */
  class WishlistList extends HTMLElement {
    connectedCallback() {
      this.grid = this.querySelector('[data-ew-grid]');
      this.empty = this.querySelector('[data-ew-empty]');
      this.sync = () => this.render();
      document.addEventListener(EVENT, this.sync);
      this.render();
    }

    disconnectedCallback() {
      document.removeEventListener(EVENT, this.sync);
    }

    render() {
      var handles = Wishlist.all();
      if (this.empty) this.empty.hidden = handles.length > 0;
      if (!this.grid) return;

      if (!handles.length) {
        this.grid.innerHTML = '';
        return;
      }

      // Products are fetched rather than rendered by Liquid because the list
      // lives in the browser, so the server has no way to know what is on it.
      Promise.all(
        handles.map(function (h) {
          return fetch('/products/' + encodeURIComponent(h) + '.js')
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
        })
      ).then((products) => {
        var live = [];
        var html = products
          .map(function (p, i) {
            if (!p) return '';
            live.push(handles[i]);
            var img = p.featured_image
              ? '<div class="shot"><img src="' + p.featured_image + '&width=800" alt="" loading="lazy"></div>'
              : '<div class="shot"></div>';
            var price = p.price_varies
              ? 'From ' + formatMoney(p.price_min)
              : formatMoney(p.price);
            return (
              '<div class="ew-wish-item">' +
              '<a class="tile" href="/products/' + p.handle + '">' +
              img +
              '<h3>' + escapeHtml(p.title) + '</h3>' +
              '<p class="price">' + price + '</p>' +
              '</a>' +
              '<button type="button" class="ew-wish-remove" data-remove="' + escapeHtml(p.handle) + '">Remove</button>' +
              '</div>'
            );
          })
          .join('');

        // A product that has since been unpublished or deleted returns 404.
        // Drop it rather than leaving a dead entry the shopper cannot clear.
        if (live.length !== handles.length) {
          handles.forEach(function (h) {
            if (live.indexOf(h) === -1) Wishlist.remove(h);
          });
          return;
        }

        this.grid.innerHTML = html;
        this.grid.querySelectorAll('[data-remove]').forEach(function (b) {
          b.addEventListener('click', function () { Wishlist.remove(b.dataset.remove); });
        });
      });
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function formatMoney(cents) {
    var format = window.Shopify && window.Shopify.money_format;
    var amount = (cents / 100).toFixed(2);
    if (!format) return '$' + amount;
    return format.replace(/\{\{\s*amount\s*\}\}/, amount).replace(/\{\{\s*amount_no_decimals\s*\}\}/, Math.round(cents / 100));
  }

  if (!customElements.get('everword-wishlist-button')) customElements.define('everword-wishlist-button', WishlistButton);
  if (!customElements.get('everword-wishlist-count')) customElements.define('everword-wishlist-count', WishlistCount);
  if (!customElements.get('everword-wishlist-list')) customElements.define('everword-wishlist-list', WishlistList);
})();
