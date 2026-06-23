(function () {
  const W = window.WordReader;
  if (!W || !W.Extractor || !W.Tokenizer || !W.Player) {
    console.error('[逐词阅读] 模块加载失败');
    return;
  }

  const player = new W.Player();
  player.setWPM(300);

  function ensureFab() {
    if (document.getElementById('word-reader-fab')) return;
    const btn = document.createElement('button');
    btn.id = 'word-reader-fab';
    btn.type = 'button';
    btn.title = '逐句高亮阅读';
    btn.textContent = '读';
    document.documentElement.appendChild(btn);
    btn.addEventListener('click', toggleToolbar);
  }

  function ensureToolbar() {
    if (document.getElementById('word-reader-toolbar')) return;
    const tb = document.createElement('div');
    tb.id = 'word-reader-toolbar';
    tb.innerHTML = `
      <div class="wr-row">
        <label for="wr-wpm">速度</label>
        <input id="wr-wpm" type="range" min="100" max="600" step="10" value="300">
        <span class="wr-val" id="wr-wpm-val">300 wpm</span>
      </div>
      <div class="wr-status" id="wr-status">就绪</div>
      <div class="wr-actions">
        <button id="wr-play" class="wr-btn-primary">▶ 播放</button>
        <button id="wr-stop" class="wr-btn-stop">■ 停止</button>
      </div>
    `;
    document.documentElement.appendChild(tb);

    const wpmInput = tb.querySelector('#wr-wpm');
    const wpmVal = tb.querySelector('#wr-wpm-val');
    wpmInput.addEventListener('input', () => {
      const v = parseInt(wpmInput.value, 10);
      wpmVal.textContent = v + ' wpm';
      player.setWPM(v);
    });
    tb.querySelector('#wr-play').addEventListener('click', onPlayClick);
    tb.querySelector('#wr-stop').addEventListener('click', onStop);
  }

  function toggleToolbar() {
    let tb = document.getElementById('word-reader-toolbar');
    if (!tb) {
      ensureToolbar();
      tb = document.getElementById('word-reader-toolbar');
    }
    tb.classList.toggle('wr-open');
    if (tb.classList.contains('wr-open')) prepare();
  }

  function setStatus(text) {
    const el = document.getElementById('wr-status');
    if (el) el.textContent = text;
  }

  function prepare() {
    setStatus('正在抽取正文…');
    const blocks = W.Extractor.extractBlocks();
    if (blocks.length === 0) {
      setStatus('未找到可读文本');
      console.warn('[逐词阅读] 抽取为空');
      return;
    }
    const units = W.Tokenizer.tokenize(blocks);
    if (units.length === 0) {
      setStatus('未切出可读句子');
      return;
    }
    player.load(units);
    const totalSentences = units.reduce((s, u) => s + u.sentences.length, 0);
    const totalWords = units.reduce((s, u) =>
      s + u.sentences.reduce((ss, sn) => ss + sn.wordCount, 0), 0);
    setStatus('段落 ' + units.length + ' · 句子 ' + totalSentences + ' · 词数 ' + totalWords);
  }

  function onPlayClick() {
    const btn = document.getElementById('wr-play');
    const fab = document.getElementById('word-reader-fab');
    if (player.units.length === 0) prepare();
    if (player.units.length === 0) return;

    if (player.running) {
      player.pause();
      btn.textContent = '▶ 继续';
      fab.classList.remove('wr-running');
      setStatus('已暂停');
    } else {
      if (player.cursor.u === 0 && player.cursor.s === 0) {
        player.start();
      } else {
        player.running = true;
        player.schedule();
      }
      btn.textContent = '❚❚ 暂停';
      fab.classList.add('wr-running');
      setStatus('播放中…');
    }
  }

  function onStop() {
    player.stop();
    const btn = document.getElementById('wr-play');
    const fab = document.getElementById('word-reader-fab');
    if (btn) btn.textContent = '▶ 播放';
    if (fab) fab.classList.remove('wr-running');
    setStatus('已停止');
  }

  player.onFinish = () => {
    const btn = document.getElementById('wr-play');
    const fab = document.getElementById('word-reader-fab');
    if (btn) btn.textContent = '▶ 播放';
    if (fab) fab.classList.remove('wr-running');
    setStatus('播放完成');
  };

  ensureFab();
  console.log('[逐词阅读] 已加载');
})();