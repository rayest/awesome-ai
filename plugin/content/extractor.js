(function (global) {
  const NOISE_SELECTORS = [
    'script', 'style', 'noscript', 'iframe', 'svg', 'canvas',
    'nav', 'header', 'footer', 'aside', 'form',
    '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
    '[aria-hidden="true"]', '[hidden]'
  ].join(',');

  const BLOCK_TAGS = 'p, h1, h2, h3, h4, h5, h6, blockquote, li';

  function scoreNode(node) {
    const text = node.innerText || '';
    if (text.length < 100) return 0;
    const paragraphs = node.querySelectorAll('p').length;
    const links = node.querySelectorAll('a').length;
    const linkTextLen = Array.from(node.querySelectorAll('a'))
      .reduce((sum, a) => sum + (a.innerText || '').length, 0);
    const linkRatio = text.length > 0 ? linkTextLen / text.length : 0;
    let score = text.length * (1 - linkRatio);
    score += paragraphs * 20;
    if (/article|content|post|entry|story|main/i.test(node.className || '')) score += 30;
    if (/article|content|post|entry|story|main/i.test(node.id || '')) score += 30;
    return score - links * 5;
  }

  function pickRoot() {
    const article = document.querySelector('article');
    if (article) return article;
    const main = document.querySelector('main');
    if (main) return main;
    const candidates = Array.from(document.querySelectorAll('div, section'))
      .filter(n => n.offsetParent !== null)
      .sort((a, b) => scoreNode(b) - scoreNode(a));
    return candidates[0] || document.body;
  }

  function extractBlocks() {
    const selected = getSelectionBlocks();
    if (selected.length > 0) return selected;

    const root = pickRoot();

    const blocks = [];
    root.querySelectorAll(BLOCK_TAGS).forEach(el => {
      if (el.closest(NOISE_SELECTORS)) return;
      const text = (el.innerText || '').replace(/\s+/g, ' ').trim();
      if (text.length > 20) {
        blocks.push({ el });
      }
    });
    return blocks;
  }

  function getSelectionBlocks() {
    const sel = window.getSelection && window.getSelection();
    if (!sel || sel.isCollapsed) return [];
    const text = sel.toString().replace(/\s+/g, ' ').trim();
    if (!text) return [];
    let anchorEl = sel.anchorNode && sel.anchorNode.parentElement;
    if (anchorEl) {
      const block = anchorEl.closest(BLOCK_TAGS);
      if (block) anchorEl = block;
    } else {
      anchorEl = document.body;
    }
    return [{ el: anchorEl }];
  }

  global.WordReader = global.WordReader || {};
  global.WordReader.Extractor = { extractBlocks };
})(window);