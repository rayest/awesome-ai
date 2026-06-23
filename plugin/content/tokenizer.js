(function (global) {
  const ABBREV_RE = /^(mr|mrs|ms|dr|prof|sr|jr|st|vs|etc|eg|ie|no|fig|approx|dept|est|inc|ltd)$/i;
  const CJK_RE = /[\u3400-\u9fff\uf900-\ufaff]/;

  function normalize(s) {
    return (s || '').replace(/\s+/g, ' ').trim();
  }

  function splitSentences(text) {
    if (!text) return [];
    if (Array.from(text).some(ch => CJK_RE.test(ch))) return [text];

    const sentences = [];
    let buf = '';
    let i = 0;
    while (i < text.length) {
      const ch = text[i];
      buf += ch;
      if (ch === '.' || ch === '!' || ch === '?') {
        const lastWord = (buf.match(/\S+$/) || [''])[0].replace(/[.!?]+$/, '');
        const isAbbrev = ABBREV_RE.test(lastWord);
        const nextIdx = i + 1;
        if (!isAbbrev && nextIdx < text.length) {
          let j = nextIdx;
          while (j < text.length && /\s/.test(text[j])) j++;
          if (j < text.length && /[A-Z]/.test(text[j])) {
            sentences.push(buf.replace(/\s+/g, ' ').trim());
            buf = '';
          }
        }
      }
      i++;
    }
    if (buf.trim()) sentences.push(buf.replace(/\s+/g, ' ').trim());
    return sentences.filter(s => s.length > 0);
  }

  function tokenize(blocks) {
    const result = [];
    blocks.forEach(block => {
      const text = normalize(block.el.textContent || '');
      if (!text) return;
      const rawSentences = splitSentences(text);
      const sentences = rawSentences.map(s => ({
        text: s,
        wordCount: s.split(/\s+/).filter(w => /[A-Za-z]/.test(w)).length
      }));
      if (sentences.length > 0) {
        result.push({ el: block.el, sentences });
      }
    });
    return result;
  }

  global.WordReader = global.WordReader || {};
  global.WordReader.Tokenizer = { tokenize, splitSentences, normalize };
})(window);