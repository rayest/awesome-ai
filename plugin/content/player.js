(function (global) {
  function normalize(s) {
    return (s || '').replace(/\s+/g, ' ').trim();
  }

  class Player {
    constructor() {
      this.units = [];
      this.cursor = { u: 0, s: 0 };
      this.wpm = 300;
      this.running = false;
      this.timer = null;
      this.overlay = null;
      this.onTick = null;
      this.onFinish = null;
      this.scrollIntoView = true;
      this.lastScrolledUnit = -1;
    }

    setWPM(wpm) {
      this.wpm = Math.max(60, Math.min(1000, wpm));
    }

    load(units) {
      this.stop();
      this.units = units.map(u => ({ el: u.el, sentences: u.sentences }));
      this.units.forEach(u => this.prepare(u));
      this.cursor = { u: 0, s: 0 };
      this.lastScrolledUnit = -1;
    }

    prepare(unit) {
      const walker = document.createTreeWalker(unit.el, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          const p = n.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          const tag = p.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
          if (p.closest('#word-reader-overlay')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const textNodes = [];
      let n;
      let acc = 0;
      while ((n = walker.nextNode())) {
        const raw = n.nodeValue;
        const norm = normalize(raw);
        const start = acc;
        acc += norm.length;
        textNodes.push({ node: n, raw, norm, start, end: acc });
      }
      unit.textNodes = textNodes;

      let pos = 0;
      unit.sentenceOffsets = unit.sentences.map(s => {
        const off = pos;
        pos += s.text.length;
        return off;
      });
    }

    start() {
      if (this.units.length === 0) return;
      if (this.running) return;
      this.ensureOverlay();
      this.running = true;
      this.schedule();
    }

    pause() {
      this.running = false;
      if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    }

    stop() {
      this.pause();
      this.cursor = { u: 0, s: 0 };
      if (this.overlay) {
        this.overlay.style.display = 'none';
        this.overlay.innerHTML = '';
      }
      this.lastScrolledUnit = -1;
    }

    ensureOverlay() {
      if (this.overlay) return;
      const el = document.createElement('div');
      el.id = 'word-reader-overlay';
      document.documentElement.appendChild(el);
      this.overlay = el;
    }

    currentSentence() {
      const unit = this.units[this.cursor.u];
      if (!unit) return null;
      return unit.sentences[this.cursor.s] || null;
    }

    durationFor(sentence) {
      const charsPerSec = this.wpm * 5 / 60;
      const ms = sentence.text.length / charsPerSec * 1000;
      return Math.max(800, Math.min(ms, 5000));
    }

    findRangeForSentence(uIdx, sIdx) {
      const unit = this.units[uIdx];
      if (!unit || !unit.textNodes || unit.textNodes.length === 0) return null;
      const sStart = unit.sentenceOffsets[sIdx];
      const sEnd = sStart + unit.sentences[sIdx].text.length;

      let startNode = null, startOff = 0;
      let endNode = null, endOff = 0;

      for (const tn of unit.textNodes) {
        if (!startNode && tn.end > sStart) {
          startNode = tn.node;
          startOff = normToRawOffset(tn, sStart - tn.start);
        }
        if (tn.end >= sEnd) {
          endNode = tn.node;
          endOff = normToRawOffset(tn, sEnd - tn.start);
          break;
        }
      }
      if (!startNode) return null;
      if (!endNode) {
        const last = unit.textNodes[unit.textNodes.length - 1];
        endNode = last.node;
        endOff = normToRawOffset(last, last.norm.length);
      }

      const range = document.createRange();
      try {
        range.setStart(startNode, startOff);
        range.setEnd(endNode, endOff);
      } catch (e) {
        return null;
      }
      return range;
    }

    highlightAt(range) {
      if (!range) return;
      const rects = range.getClientRects();
      if (rects.length === 0) return;
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const frag = document.createDocumentFragment();
      for (const rect of rects) {
        const seg = document.createElement('div');
        seg.className = 'wr-overlay-seg';
        seg.style.top = (rect.top + scrollY) + 'px';
        seg.style.left = (rect.left + scrollX) + 'px';
        seg.style.width = rect.width + 'px';
        seg.style.height = rect.height + 'px';
        frag.appendChild(seg);
      }
      this.overlay.innerHTML = '';
      this.overlay.appendChild(frag);
      this.overlay.style.display = 'block';
    }

    schedule() {
      if (!this.running) return;
      const sentence = this.currentSentence();
      if (!sentence) {
        this.running = false;
        if (this.onFinish) this.onFinish();
        return;
      }
      const range = this.findRangeForSentence(this.cursor.u, this.cursor.s);
      if (range) this.highlightAt(range);
      if (this.scrollIntoView && this.cursor.u !== this.lastScrolledUnit) {
        this.lastScrolledUnit = this.cursor.u;
        this.scrollToUnit(this.cursor.u);
      }
      if (this.onTick) this.onTick({ unit: this.cursor.u, sentence: this.cursor.s, text: sentence.text });
      const delay = this.durationFor(sentence);
      this.timer = setTimeout(() => this.advance(), delay);
    }

    advance() {
      const unit = this.units[this.cursor.u];
      if (!unit) { this.stop(); return; }
      this.cursor.s += 1;
      if (this.cursor.s >= unit.sentences.length) {
        this.cursor.s = 0;
        this.cursor.u += 1;
      }
      if (this.cursor.u >= this.units.length) {
        this.stop();
        if (this.onFinish) this.onFinish();
        return;
      }
      this.schedule();
    }

    scrollToUnit(uIdx) {
      const unit = this.units[uIdx];
      if (!unit || !unit.el) return;
      const rect = unit.el.getBoundingClientRect();
      const targetTop = window.pageYOffset + rect.top - window.innerHeight * 0.3;
      const maxTop = document.documentElement.scrollHeight - window.innerHeight;
      const clamped = Math.max(0, Math.min(targetTop, maxTop));
      const delta = Math.abs(clamped - window.pageYOffset);
      if (delta < 40) return;
      window.scrollTo({ top: clamped, behavior: 'smooth' });
    }
  }

  function normToRawOffset(tn, normOffset) {
    const raw = tn.raw;
    if (raw === tn.norm) return Math.max(0, Math.min(normOffset, raw.length));
    let rawPos = 0;
    let nPos = 0;
    while (nPos < normOffset && rawPos < raw.length) {
      if (/\s/.test(raw[rawPos])) {
        while (rawPos < raw.length && /\s/.test(raw[rawPos])) rawPos++;
        nPos++;
      } else {
        rawPos++;
        nPos++;
      }
    }
    return Math.min(rawPos, raw.length);
  }

  global.WordReader = global.WordReader || {};
  global.WordReader.Player = Player;
})(window);