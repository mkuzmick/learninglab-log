# learninglab-log

A tiny, dependency‑free color logger. Replaces chalk/colors for simple use cases.

`npm i learninglab-log`

## Usage

```
const llog = require('learninglab-log')

llog.blue(`it's working`)

// Pass any number of values; strings print as-is, objects/arrays as pretty JSON
llog.yellow('user:', { id: 1, name: 'Ada' }, ['a', 'b'])

// New convenience methods (non-breaking additions)
llog.info('starting…')
llog.warn('be careful', { retries: 3 })
llog.error('boom', new Error('kaboom'))

// Divider helpers
console.log(llog.divider)        // existing constant
console.log(llog.dividerLine())  // width-aware, colored line
```

## Behavior

- Colors output per call and resets after each line.
- Each argument is printed on its own line:
  - Strings: printed verbatim (with color).
  - Objects/arrays: serialized as pretty JSON (4 spaces).
- Safe serialization improvements:
  - Circular references are replaced with `"[Circular]"` rather than throwing.
  - `BigInt` becomes a string like `"123n"`.
  - `Symbol` becomes its string form, e.g. `"Symbol(desc)"`.
  - `Error` instances are expanded to `{ name, message, stack, ...customProps }`.
  - Very large strings (including base64) are truncated with a clear marker.

## Environment

- `NO_COLOR`: disable colors when set.
- `FORCE_COLOR=1`: force-enable colors.
- `LEARNINGLAB_LOG_MAX_STRING`: max string length before truncation (default `10000`).

Notes:
- Defaults are conservative to avoid breaking existing usage. Colors remain enabled by default; truncation only applies to very large strings.
