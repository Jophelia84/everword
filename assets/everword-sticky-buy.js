/*
 * Everword sticky buy bar.
 *
 * It mirrors what the main buy panel is already showing rather than tracking
 * variant selection itself. Horizon re-renders the price and the add-to-cart
 * button when the variant changes, so watching those two elements keeps the bar
 * correct without depending on the name or shape of any internal event.
 *
 * The button submits Horizon's form by id, so there is one add-to-cart path,
 * carrying the variant, quantity and personalisation properties with it.
 */
(function () {
  'use strict';

  class EverwordStickyBuy extends HTMLElement {
    connectedCallback() {
      this.form = document.getElementById(this.dataset.form);
      this.priceOut = this.querySelector('[data-ew-price]');
      this.button = this.querySelector('[data-ew-submit]');

      // The real buy button is the anchor: the bar exists to stand in for it,
      // so it shows exactly when that button is off screen.
      this.mainButton = document.querySelector('.add-to-cart-button');
      this.price = document.querySelector('product-price');

      if (!this.form || !this.mainButton) return;

      this.watchVisibility();
      this.watchPrice();
      this.watchAvailability();
    }

    watchVisibility() {
      var self = this;
      this.observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
            self.reveal(show);
          });
        },
        { rootMargin: '0px 0px -20% 0px' }
      );
      this.observer.observe(this.mainButton);
    }

    /*
     * The bar slides in, so it cannot be display:none while hidden or there is
     * nothing to animate. It stays laid out and off screen, and inert keeps its
     * button out of the tab order and away from screen readers meanwhile.
     */
    reveal(show) {
      this.classList.toggle('show', show);
      if ('inert' in HTMLElement.prototype) {
        this.inert = !show;
      } else {
        this.setAttribute('aria-hidden', String(!show));
        this.button.tabIndex = show ? 0 : -1;
      }
    }

    watchPrice() {
      if (!this.price || !this.priceOut) return;
      var self = this;
      var sync = function () {
        var current = self.price.querySelector('.price-item__group.price') || self.price;
        var text = current.textContent.replace(/\s+/g, ' ').trim();
        if (text) self.priceOut.textContent = text;
      };
      sync();
      this.priceWatcher = new MutationObserver(sync);
      this.priceWatcher.observe(this.price, { childList: true, subtree: true, characterData: true });
    }

    watchAvailability() {
      var self = this;
      var sync = function () {
        var disabled = self.mainButton.disabled || self.mainButton.getAttribute('aria-disabled') === 'true';
        self.button.disabled = disabled;
        var label = self.mainButton.textContent.replace(/\s+/g, ' ').trim();
        // Only borrow the label when it is saying something the shopper needs
        // to know — sold out, unavailable — not the ordinary add-to-cart text.
        if (disabled && label) self.button.textContent = label;
      };
      sync();
      this.availabilityWatcher = new MutationObserver(sync);
      this.availabilityWatcher.observe(this.mainButton, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['disabled', 'aria-disabled'],
      });
    }

    disconnectedCallback() {
      this.observer?.disconnect();
      this.priceWatcher?.disconnect();
      this.availabilityWatcher?.disconnect();
    }
  }

  if (!customElements.get('everword-sticky-buy')) {
    customElements.define('everword-sticky-buy', EverwordStickyBuy);
  }
})();
