/*
 * Everword personalisation fields.
 *
 * Ported from the v94 standalone build. The clamping is not cosmetic: ShineOn
 * cannot cut accents or emoji, and an unsupported character holds the order.
 * So the value is folded to ASCII before it is cut, which means "José" becomes
 * "Jose" rather than losing its last letter, and "O'Brien" keeps its
 * apostrophe. maxlength is not enough on its own — it ignores script-set
 * values and counts UTF-16 units, so an emoji costs two and can be cut in
 * half.
 *
 * Spaces are blocked on name and names fields. That is a product decision
 * (V, 23 Aug), not a supplier rule; set data-block-spaces="false" on the
 * element to allow "Mary Jane" again.
 */
(function () {
  'use strict';

  function toCuttable(t) {
    var o = t.normalize ? t.normalize('NFD').replace(/[̀-ͯ]/g, '') : t;
    o = o
      .replace(/[‘’‛]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[‐-―]/g, '-')
      .replace(/…/g, '...');
    // \n survives: it is the record separator for multi-name fields.
    o = o.replace(/[^\x20-\x7E\n]/g, '');
    // removing a character mid-word would otherwise leave a double space the
    // customer never typed
    return o.replace(/ {2,}/g, ' ');
  }

  // never leave half a surrogate pair behind
  function cut(t, n) {
    if (t.length <= n) return t;
    var o = t.slice(0, n);
    var last = o.charCodeAt(o.length - 1);
    if (last >= 0xd800 && last <= 0xdbff) o = o.slice(0, -1);
    return o;
  }

  function clampField(node, max, opts) {
    if (!node) return;
    opts = opts || {};

    function fix() {
      var v = node.value;
      var src = v;
      var out;

      // Order matters: fold and strip before cutting, so a removed character
      // frees length rather than wasting it.
      if (opts.ascii) {
        src = toCuttable(src);
        if (src !== v && opts.onBadChar) opts.onBadChar();
      }
      var pre = src;
      if (opts.strip) {
        src = src.replace(opts.strip, '');
        if (src !== pre && opts.onStrip) opts.onStrip();
      }

      var maxLines = typeof opts.lines === 'function' ? opts.lines() : opts.lines;
      if (maxLines) {
        out = src
          .split('\n')
          .slice(0, maxLines)
          .map(function (line) { return cut(line, max); })
          .join('\n');
      } else {
        out = cut(src, max);
      }

      if (out !== v) {
        var at = node.selectionStart;
        node.value = out;
        at = Math.min(at, out.length);
        try { node.setSelectionRange(at, at); } catch (e) { /* not a text input */ }
      }
      if (opts.after) opts.after(node.value);
    }

    node.addEventListener('input', fix);
    node.addEventListener('blur', fix);
    node.addEventListener('paste', function () { setTimeout(fix, 0); });
    node.__clamp = fix;
    fix();
  }

  class EverwordPersonalisation extends HTMLElement {
    connectedCallback() {
      this.kind = this.dataset.kind || 'none';
      this.max = parseInt(this.dataset.max, 10) || 20;
      this.hint = this.dataset.hint || '';
      this.blockSpaces = this.dataset.blockSpaces !== 'false';

      this.counter = this.querySelector('[data-ew-count]');
      this.field = this.querySelector('[data-ew-value]');
      this.second = this.querySelector('[data-ew-value-2]');
      if (!this.field) return;

      var noSpace = this.blockSpaces && (this.kind === 'name' || this.kind === 'names') ? / +/g : null;
      var self = this;

      var noteTimer;
      function note(msg) {
        clearTimeout(noteTimer);
        if (!self.counter) return;
        self.counter.textContent = msg;
        self.counter.classList.add('over');
        noteTimer = setTimeout(function () {
          noteTimer = 0;
          self.counter.classList.remove('over');
          if (self.field.__clamp) self.field.__clamp();
          else self.counter.textContent = self.hint;
        }, 2200);
      }
      var saidNoSpaces = function () {
        note('No spaces — try a capital letter instead: DogMom');
      };
      var saidBadChar = function () {
        note('Accents and emoji can’t be cut — letters and numbers only.');
      };

      if (this.kind === 'names') {
        clampField(this.field, this.max, {
          lines: function () { return self.lineAllowance(); },
          strip: noSpace,
          ascii: true,
          onStrip: saidNoSpaces,
          onBadChar: saidBadChar,
          after: function (v) {
            var lines = v.split('\n').filter(function (x) { return x.trim(); });
            var longest = 0;
            lines.forEach(function (x) { if (x.length > longest) longest = x.length; });
            if (!self.counter) return;
            if (!self.counter.classList.contains('over') || longest >= self.max) {
              self.counter.textContent = lines.length
                ? lines.length + (lines.length === 1 ? ' name' : ' names') +
                  ' · longest ' + longest + ' / ' + self.max + ' characters'
                : self.hint;
            }
            self.counter.classList.toggle('over', longest >= self.max);
          },
        });
      } else {
        clampField(this.field, this.max, {
          strip: noSpace,
          ascii: true,
          onStrip: saidNoSpaces,
          onBadChar: saidBadChar,
          after: function (v) {
            if (noteTimer || !self.counter) return;
            var n = v.length;
            self.counter.textContent = n >= self.max - 2 ? n + ' / ' + self.max : self.hint;
            self.counter.classList.toggle('over', n >= self.max);
          },
        });
        clampField(this.second, this.max, { ascii: true, onBadChar: saidBadChar });
      }

      // Lowering the charm count has to drop the extra lines, so the variant
      // picker re-runs the clamp. Bound once, on the form.
      this.form = this.closest('form');
      if (this.form && this.kind === 'names') {
        this.form.addEventListener('change', function () {
          if (self.field.__clamp) self.field.__clamp();
        });
      }
    }

    /*
     * The charm count is the line count. It is whichever variant option is
     * currently selected on the count axis, so it tracks the picker.
     */
    lineAllowance() {
      var name = (this.dataset.countOption || '').toLowerCase();
      if (!name || !this.form) return 1;
      var selected = this.form.querySelector(
        'input[type="radio"][name*="' + name + '" i]:checked, select[name*="' + name + '" i]'
      );
      var n = selected ? parseInt(selected.value, 10) : NaN;
      return isNaN(n) ? 1 : n;
    }
  }

  if (!customElements.get('everword-personalisation')) {
    customElements.define('everword-personalisation', EverwordPersonalisation);
  }
})();
