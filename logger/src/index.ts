import _pino, { P } from "pino";
import { APILogContent, LogContent, LogLevel, Service } from "./types";

const pinoConfig = {
  prettyPrint: {
    colorize: true,
    levelFirst: true,
    translateTime: "dd-mm-yyyy, h:MM:ss TT",
  },
};

export default class Logger {
  private _loggerConfiguration: Map<Service, LogLevel>;
  private _service: Service;
  private _saveLocation: string | undefined;
  private pino: P.Logger;

  private pinoExitHandler: (error: Error | null, ...args: any[]) => void;

  constructor(service: Service) {
    if (!process.env.LOGGIN_CONFIGURATION)
      throw new Error(
        "Please provide a valid argument for LOGGIN_CONFIGURATION "
      );
    this._loggerConfiguration = this.parseLogConfig(
      process.env.LOGGIN_CONFIGURATION
    );
    this._service = service;
    this._saveLocation = process.env.saveLocation;

    this.initPino();
    this.configBeforeExit();
  }
  private initPino(): void | never {
    // TODO: https://github.com/pinojs/pino-elasticsearch
    try {
      if (this.saveLocation)
        this.pino = _pino(pinoConfig, _pino.destination(this.saveLocation));
      else this.pino = _pino(pinoConfig);
    } catch (e) {
      throw new Error("Something went wrong during the initialization of pino");
    }
  }
  private configBeforeExit(): void | never {
    if (!this.pino)
      throw new Error(
        "Something went wrong while initalizing before exit hooks."
      );

    this.pinoExitHandler = _pino.final(this.pino, (err, finalLogger, evt) => {
      finalLogger.info(`${evt} caught`);
      if (err) finalLogger.error(err, "error caused exit");
      process.exit(err ? 1 : 0);
    });
    // catch all the ways node might exit
    process.on("beforeExit", () => this.pinoExitHandler(null, "beforeExit"));
    process.on("exit", () => this.pinoExitHandler(null, "exit"));
    process.on("uncaughtException", (err) =>
      this.pinoExitHandler(err, "uncaughtException")
    );
    process.on("SIGINT", () => this.pinoExitHandler(null, "SIGINT"));
    process.on("SIGQUIT", () => this.pinoExitHandler(null, "SIGQUIT"));
    process.on("SIGTERM", () => this.pinoExitHandler(null, "SIGTERM"));
  }

  private parseLogConfig(logConfig: string): Map<Service, LogLevel> | never {
    /*
     *Input:
     *LOGCONFIG = INFO FRONTEND; WARN API; ERROR SERVICE => Map(FRONTEND,INFO),(API,WARN)...
     */

    const parsedConfig = new Map<Service, LogLevel>();
    const serviceConfigs = logConfig.split(";");
    for (const conf of serviceConfigs) {
      const config = conf.split(" ");
      if (config.length < 2) {
        throw new Error("Invalid logging configuration provided!");
      }
      if (config[0] === "") config.shift();

      const logLevel = this.parseLogLevel(config[0]);
      const service = this.parseService(config[1]);
      parsedConfig.set(service, logLevel);
    }

    return parsedConfig;
  }
  private parseService(serviceName: string): Service | never {
    switch (serviceName) {
      case "FRONTEND":
        return Service.FRONTEND;
      case "API":
        return Service.API;
      case "BLOCKCHAIN":
        return Service.BLOCKCHAIN;
      case "STORAGE_SERVICE":
        return Service.STORAGE;
      case "NOTIFICATION_SERVICE":
        return Service.NOTIFICATION;
      default:
        throw new Error("Invalid logging service configuration provided!");
    }
  }
  private parseLogLevel(logLevel: string): LogLevel | never {
    switch (logLevel) {
      case "FATAL":
        return LogLevel.FATAL;
      case "ERROR":
        return LogLevel.ERROR;
      case "WARN":
        return LogLevel.WARN;
      case "INFO":
        return LogLevel.INFO;
      case "DEBUG":
        return LogLevel.DEBUG;
      default:
        return LogLevel.INFO;
    }
  }
  private isInLogScope(logLevel: LogLevel): boolean {
    const config = this._loggerConfiguration.get(this._service);
    if (!config || config < logLevel) return false; //log everything above log-level
    return true;
  }

  private format(logContent: LogContent): string {
    switch (this._service) {
      case Service.API:
        return (() => {
          if (!this.isRightLogContent(logContent))
            return JSON.stringify(logContent);
          const msg = logContent as APILogContent;
          return `${msg.message}  \n  → stack: ${msg.error.stack}`;
        })();
      default:
        return JSON.stringify(logContent);
    }
  }

  private isRightLogContent(logContent: LogContent): boolean {
    switch (this._service) {
      case Service.API:
        const obj = logContent as any;
        return !obj.message || !obj.error ? false : true;
      default:
        return false;
    }
  }

  public info(msg: LogContent): void {
    if (this.isInLogScope(LogLevel.INFO)) {
      this.pino.info(this.format(msg));
    }
  }
  public debug(msg: LogContent): void {
    if (this.isInLogScope(LogLevel.DEBUG)) {
      this.pino.info(this.format(msg));
    }
  }
  public warn(msg: LogContent): void {
    if (this.isInLogScope(LogLevel.WARN)) {
      this.pino.info(this.format(msg));
    }
  }
  public error(msg: LogContent): void {
    if (this.isInLogScope(LogLevel.ERROR)) {
      this.pino.info(this.format(msg));
    }
  }
  public fatal(msg: LogContent): void {
    if (this.isInLogScope(LogLevel.FATAL)) {
      this.pino.info(this.format(msg));
    }
  }

  public get loggerConfiguration(): Map<Service, LogLevel> {
    return this._loggerConfiguration;
  }
  public get service(): Service {
    return this._service;
  }
  public get saveLocation(): string | undefined {
    return this._saveLocation;
  }
}
