/*
 * Everword message card.
 *
 * Ported from the v94 standalone build. Two rules from the source are
 * load-bearing and easy to lose:
 *
 *  - The relation picks the phrases, not the occasion. "In memory" is the one
 *    occasion that overrides it, because a memorial card to Mom is not a
 *    birthday card to Mom (v82).
 *  - A pet product keeps its own memorial set. The human one talks about
 *    telling people about them, which is not what that card is doing.
 *
 * The message counter shows /160 while the field accepts 200: 160 is what
 * prints comfortably, the last 40 are slack rather than a hard stop.
 */
(function () {
  'use strict';

  var SOFT_LIMIT = 160;

  class EverwordMessageCard extends HTMLElement {
    connectedCallback() {
      this.occasionSeed = this.dataset.occasion || 'everyday';
      this.isPet = this.occasionSeed.indexOf('pet') === 0;
      this.rung = 2; // which step of the ladder is showing; long by default
      this.mode = 'ours';
      this.toTouched = false;

      this.$occ = this.querySelector('[data-ew-occasion]');
      this.$to = this.querySelector('[data-ew-to]');
      this.$toOther = this.querySelector('[data-ew-to-other]');
      this.$toValue = this.querySelector('[data-ew-to-value]');
      this.$from = this.querySelector('[data-ew-from]');
      this.$preset = this.querySelector('[data-ew-preset]');
      this.$pick = this.querySelector('[data-ew-pick]');
      this.$message = this.querySelector('[data-ew-message]');
      this.$count = this.querySelector('[data-ew-count]');
      this.$summary = this.querySelector('[data-ew-summary]');
      this.$previewTo = this.querySelector('[data-ew-preview-to]');
      this.$previewMessage = this.querySelector('[data-ew-preview-message]');
      this.$previewFrom = this.querySelector('[data-ew-preview-from]');

      var self = this;
      fetch(this.dataset.src)
        .then(function (r) {
          if (!r.ok) throw new Error('cards ' + r.status);
          return r.json();
        })
        .then(function (data) { self.build(data); })
        .catch(function () {
          // The card is optional; if the bank cannot load, the customer can
          // still write their own rather than being shown a broken control.
          if (self.$pick) self.$pick.hidden = true;
        });
    }

    build(data) {
      this.data = data;
      var self = this;

      data.occasions.forEach(function (o) {
        self.$occ.add(new Option(o[1], o[0]));
      });
      this.$occ.value = data.seed[this.occasionSeed] ? this.occasionSeed : 'everyday';
      if (!data.cards[this.$occ.value] && !this.isOccasionKnown(this.$occ.value)) {
        this.$occ.value = 'everyday';
      }

      data.recipients.forEach(function (t) {
        self.$to.add(new Option('To ' + t, t));
      });
      this.$to.add(new Option('Someone else…', '__'));
      this.$to.add(new Option('No name', ''));
      this.$to.value = data.seed[this.$occ.value] || 'my daughter';

      this.fillPresets();
      this.syncMessageFromPreset();

      this.$occ.addEventListener('change', function () {
        if (!self.toTouched && self.data.seed[self.$occ.value]) {
          self.$to.value = self.data.seed[self.$occ.value];
          self.$toOther.style.display = 'none';
        }
        self.fillPresets();
        if (self.mode === 'ours') self.syncMessageFromPreset();
        self.render();
      });

      this.$to.addEventListener('change', function () {
        self.toTouched = true;
        self.$toOther.style.display = self.$to.value === '__' ? '' : 'none';
        self.fillPresets();
        if (self.mode === 'ours') self.syncMessageFromPreset();
        self.render();
      });

      this.$preset.addEventListener('change', function () {
        self.rung = self.$preset.selectedIndex;
        self.syncMessageFromPreset();
        self.render();
      });

      this.querySelectorAll('[data-ew-mode]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          self.setMode(btn.dataset.ewMode);
        });
      });

      ['input', 'change'].forEach(function (evt) {
        self.$message.addEventListener(evt, function () {
          if (self.mode !== 'own') self.setMode('own');
          self.render();
        });
        self.$from.addEventListener(evt, function () { self.render(); });
        self.$toOther.addEventListener(evt, function () { self.render(); });
      });

      this.setMode('ours');
      this.render();
    }

    isOccasionKnown(value) {
      return this.data.occasions.some(function (o) { return o[0] === value; });
    }

    /*
     * The relation picks the phrases; "in memory" overrides it, and a pet
     * product gets the pet memorial set rather than the human one.
     */
    keyFor() {
      if (this.$occ.value === 'pet') return 'pet';
      if (this.$occ.value === 'memory') return this.isPet ? 'petmemory' : 'memory';
      var r = this.$to.value;
      return this.data.cards[r] ? r : 'default';
    }

    fillPresets() {
      var list = this.data.cards[this.keyFor()] || this.data.cards['default'];
      this.$preset.innerHTML = '';
      var self = this;
      list.forEach(function (m) {
        var o = document.createElement('option');
        o.innerHTML = m; // the bank carries entities such as &rsquo;
        self.$preset.appendChild(o);
      });
      if (this.$preset.options.length) {
        this.$preset.selectedIndex = Math.min(this.rung, this.$preset.options.length - 1);
      }
    }

    syncMessageFromPreset() {
      var opt = this.$preset.options[this.$preset.selectedIndex];
      if (!opt) return;
      this.$message.value = opt.text;
    }

    setMode(mode) {
      this.mode = mode;
      this.querySelectorAll('[data-ew-mode]').forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(btn.dataset.ewMode === mode));
      });
      if (this.$pick) this.$pick.hidden = mode === 'own';
      if (mode === 'ours') this.syncMessageFromPreset();
      this.render();
    }

    toText() {
      if (this.$to.value === '__') {
        var v = this.$toOther.value.trim();
        return v ? 'To ' + v : '';
      }
      return this.$to.value ? 'To ' + this.$to.value : '';
    }

    render() {
      var to = this.toText();
      var msg = this.$message.value.trim();
      var from = this.$from.value.trim();

      if (this.$toValue) this.$toValue.value = to;

      var n = msg.length;
      if (this.$count) {
        this.$count.textContent = n + ' / ' + SOFT_LIMIT;
        this.$count.classList.toggle('over', n > SOFT_LIMIT);
      }

      this.ghost(this.$previewTo, to, 'To someone');
      this.ghost(this.$previewMessage, msg, 'Your message will appear here.');
      this.ghost(this.$previewFrom, from, 'Love, you');

      if (this.$summary) {
        this.$summary.textContent = msg
          ? 'Card: ' + (to ? to + ' — ' : '') + this.truncate(msg, 42)
          : 'A message card is included, free.';
      }
    }

    truncate(t, n) {
      return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t;
    }

    /* Placeholder text sits in the card at reduced opacity, so the preview is
       never empty and never mistaken for the real thing. */
    ghost(node, text, placeholder) {
      if (!node) return;
      node.textContent = text || placeholder;
      node.classList.toggle('ghosted', !text);
    }
  }

  if (!customElements.get('everword-message-card')) {
    customElements.define('everword-message-card', EverwordMessageCard);
  }
})();
