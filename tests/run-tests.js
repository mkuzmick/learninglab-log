/* eslint-disable no-console */
const assert = require('assert')

function capture(fn) {
  const logs = []
  const errs = []
  const origLog = console.log
  const origErr = console.error
  console.log = (...args) => logs.push(args.join(' '))
  console.error = (...args) => errs.push(args.join(' '))
  try {
    fn()
  } finally {
    console.log = origLog
    console.error = origErr
  }
  return { logs, errs }
}

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (e) {
    console.error(`not ok - ${name}`)
    console.error(e && e.stack || e)
    process.exitCode = 1
  }
}

// Ensure deterministic defaults for tests
process.env.NO_COLOR = '1'

run('objects serialize as pretty JSON with safe replacer', () => {
  delete require.cache[require.resolve('..')]
  const llog = require('..')
  const a = { x: 1 }
  const b = { a, big: BigInt(123), s: Symbol('s') }
  a.b = b // circular
  const out = capture(() => llog.blue(a)).logs.join('\n')
  assert.ok(out.includes('"x": 1'))
  assert.ok(out.includes('"[Circular]"'))
  assert.ok(out.includes('"123n"'))
  assert.ok(out.includes('Symbol('))
})

run('errors expand to object with name/message/stack', () => {
  delete require.cache[require.resolve('..')]
  const llog = require('..')
  const err = new Error('kaboom')
  err.code = 'E_KABOOM'
  const out = capture(() => llog.red(err)).logs.join('\n')
  assert.ok(out.includes('"name": "Error"'))
  assert.ok(out.includes('"message": "kaboom"'))
  assert.ok(out.includes('"code": "E_KABOOM"'))
})

run('multiple args print on separate lines', () => {
  delete require.cache[require.resolve('..')]
  const llog = require('..')
  const res = capture(() => llog.yellow('a', { y: 2 }, 'b'))
  assert.equal(res.logs.length, 3)
  assert.equal(res.logs[0], 'a')
  assert.ok(res.logs[1].includes('"y": 2'))
  assert.equal(res.logs[2], 'b')
})

run('warn and error go to stderr', () => {
  delete require.cache[require.resolve('..')]
  const llog = require('..')
  const res = capture(() => { llog.warn('w'); llog.error('e') })
  assert.deepStrictEqual(res.logs, [])
  assert.deepStrictEqual(res.errs, ['w', 'e'])
})

run('very large strings truncate with marker', () => {
  process.env.LEARNINGLAB_LOG_MAX_STRING = '20'
  delete require.cache[require.resolve('..')]
  const llog = require('..')
  const long = 'A'.repeat(50)
  const res = capture(() => llog.cyan(long))
  assert.equal(res.logs.length, 1)
  const s = res.logs[0]
  assert.ok(s.includes('[truncated '), 'should include truncation marker')
})

// leave exitCode set by failing tests if any
