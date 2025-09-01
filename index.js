const ansiColors = {
    black: `\u001b[30m`,
    red: `\u001b[38;5;196m`,
    green: `\u001b[32m`,
    yellow: `\u001b[38;5;11m`,
    blue: `\u001b[34m`,
    magenta: `\u001b[35m`,
    cyan: `\u001b[36m`,
    white: `\u001b[37m`,
    reset: `\u001b[0m`,
    gray: `\u001b[38;5;245m`,
    darkgray: `\u001b[38;5;239m`,
}

// Conservative defaults to avoid breaking existing usage
const MAX_STRING_LENGTH = Number(process.env.LEARNINGLAB_LOG_MAX_STRING || 10000) // 10k chars

function shouldColor() {
    if (process.env.FORCE_COLOR && process.env.FORCE_COLOR !== '0') return true
    if (process.env.NO_COLOR) return false
    // Preserve previous behavior (always colored) to avoid surprises
    return true
}

function colorize(str, color) {
    if (!shouldColor()) return String(str)
    const start = ansiColors[color] || ''
    const end = ansiColors.reset
    return `${start}${str}${end}`
}

function looksLikeBase64(str) {
    if (typeof str !== 'string' || str.length < 1024) return false
    const cleaned = str.replace(/\s+/g, '')
    // Basic base64 heuristic: valid charset and length multiple of 4
    return /^[A-Za-z0-9+/=]+$/.test(cleaned) && cleaned.length % 4 === 0
}

function truncateStringIfNeeded(str) {
    if (typeof str !== 'string') return str
    if (str.length <= MAX_STRING_LENGTH) return str
    const head = str.slice(0, Math.max(0, MAX_STRING_LENGTH - 20))
    const tail = str.slice(-10)
    const kind = looksLikeBase64(str) ? 'base64' : 'string'
    return `${head}…${tail} [truncated ${str.length - MAX_STRING_LENGTH} chars from ${kind}]`
}

function toPlainError(err) {
    const obj = {
        name: err.name,
        message: err.message,
        stack: err.stack,
    }
    // include enumerable custom props
    for (const k in err) {
        try { obj[k] = err[k] } catch (_) {}
    }
    return obj
}

function safeReplacer() {
    const seen = new WeakSet()
    return function(key, value) {
        // Handle primitive big/special types
        const t = typeof value
        if (t === 'bigint') return `${value.toString()}n`
        if (t === 'function') return `[Function ${value.name || 'anonymous'}]`
        if (t === 'symbol') return value.toString()
        if (t === 'string') return truncateStringIfNeeded(value)

        if (value instanceof Error) return toPlainError(value)

        // Avoid circular refs
        if (value && t === 'object') {
            if (seen.has(value)) return '[Circular]'
            seen.add(value)
        }
        return value
    }
}

function stringifySafe(value) {
    try {
        return JSON.stringify(value, safeReplacer(), 4)
    } catch (e) {
        // As a last resort, best-effort fallback
        try {
            return String(value)
        } catch (_) {
            return '[Unserializable]'
        }
    }
}

function myTypeOfLog(things, color, stream = 'stdout') {
    const write = stream === 'stderr' ? console.error : console.log
    things.forEach(thing => {
        if (typeof thing === 'string') {
            const out = colorize(truncateStringIfNeeded(thing), color)
            write(out)
        } else {
            const out = colorize(stringifySafe(thing), color)
            write(out)
        }
    })
}

module.exports.blue = (...things) => { myTypeOfLog(things, "blue" ) }
module.exports.cyan = (...things) => { myTypeOfLog(things, "cyan" ) }
module.exports.yellow = (...things) => { myTypeOfLog(things, "yellow" ) }
module.exports.magenta = (...things) => { myTypeOfLog(things, "magenta" ) }
module.exports.green = (...things) => { myTypeOfLog(things, "green" ) }
module.exports.red = (...things) => { myTypeOfLog(things, "red" ) }
module.exports.white = (...things) => { myTypeOfLog(things, "white" ) }
module.exports.gray = (...things) => { myTypeOfLog(things, "gray" ) }
module.exports.grey = (...things) => { myTypeOfLog(things, "gray" ) }
module.exports.darkgray = (...things) => { myTypeOfLog(things, "darkgray" ) }

// New convenience methods (non-breaking additions)
module.exports.info = (...things) => { myTypeOfLog(things, "white", 'stdout') }
module.exports.warn = (...things) => { myTypeOfLog(things, "yellow", 'stderr') }
module.exports.error = (...things) => { myTypeOfLog(things, "red", 'stderr') }

// Keep existing divider constant for compatibility
module.exports.divider = `#########################################################\n#########################################################`

// Additional helper to generate a divider that fits the terminal
module.exports.dividerLine = (color = 'gray', char = '─') => {
    const width = (process && process.stdout && process.stdout.columns) || 60
    const line = (char.repeat(Math.max(1, Math.min(width, 200))))
    return colorize(line, color)
}
