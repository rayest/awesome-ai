const fs = require('fs');
const path = require('path');
const vm = require('vm');

const code = fs.readFileSync(path.join(__dirname, '..', 'plugin', 'content', 'tokenizer.js'), 'utf8');
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const { Tokenizer } = sandbox.window.WordReader;

let pass = 0;
let fail = 0;

function eq(actual, expected, label) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    pass++;
    console.log('✓ ' + label);
  } else {
    fail++;
    console.log('✗ ' + label);
    console.log('   expected: ' + JSON.stringify(expected));
    console.log('   actual:   ' + JSON.stringify(actual));
  }
}

eq(
  Tokenizer.splitSentences("Don't worry. It's OK."),
  ["Don't worry.", "It's OK."],
  '缩写 + 多句切分'
);

eq(
  Tokenizer.splitSentences('Hello world.'),
  ['Hello world.'],
  '单句切分'
);

eq(
  Tokenizer.splitSentences('What? Really! Yes.'),
  ['What?', 'Really!', 'Yes.'],
  '多种句末标点'
);

eq(
  Tokenizer.splitSentences('Mr. Smith arrived. He was late.'),
  ['Mr. Smith arrived.', 'He was late.'],
  '缩写 Mr. 不切开'
);

eq(
  Tokenizer.splitSentences('Reading is not a race. When we read word by word, our eyes travel together.'),
  [
    'Reading is not a race.',
    'When we read word by word, our eyes travel together.'
  ],
  '测试页段落切分'
);

eq(
  Tokenizer.splitSentences('Hello   world.   How are you?'),
  ['Hello world.', 'How are you?'],
  '多空格合并'
);

const zh = Tokenizer.splitSentences('今天天气很好。我们去公园。');
eq(zh, ['今天天气很好。我们去公园。'], '中文不切,整段保留');

console.log('\n通过: ' + pass + ' · 失败: ' + fail);
process.exit(fail === 0 ? 0 : 1);