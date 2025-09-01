export type Color =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'gray'
  | 'grey'
  | 'darkgray'

export interface Logger {
  blue: (...things: any[]) => void
  cyan: (...things: any[]) => void
  yellow: (...things: any[]) => void
  magenta: (...things: any[]) => void
  green: (...things: any[]) => void
  red: (...things: any[]) => void
  white: (...things: any[]) => void
  gray: (...things: any[]) => void
  grey: (...things: any[]) => void
  darkgray: (...things: any[]) => void

  info: (...things: any[]) => void
  warn: (...things: any[]) => void
  error: (...things: any[]) => void

  divider: string
  dividerLine: (color?: Color, char?: string) => string
}

declare const logger: Logger
export = logger

