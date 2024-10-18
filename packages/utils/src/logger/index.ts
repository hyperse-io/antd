export enum LogLevels {
  log = 1,
  warn = 2,
  error = 3,
}

const prefixColor = 'color:blue;background:yellow;font-weight:bold;';

export class Logger {
  constructor(loglevel: LogLevels = LogLevels.log) {
    this.level = loglevel;
  }

  public level =
    process.env.NODE_ENV === 'production' ? LogLevels.warn : LogLevels.log;

  public log(prefix: string, ...args) {
    if (this.level <= LogLevels.log) {
      console.log([`%c [${prefix}]`, prefixColor].concat(args));
    }
  }

  public warn(prefix: string, ...args) {
    if (this.level <= LogLevels.warn) {
      console.warn([`%c [${prefix}]`, prefixColor].concat(args));
    }
  }

  public error(prefix: string, ...args) {
    if (this.level <= LogLevels.error) {
      console.error([`%c [${prefix}]`, prefixColor].concat(args));
    }
  }
}

export const logger = new Logger();
