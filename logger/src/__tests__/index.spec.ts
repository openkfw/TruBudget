import fs from "fs";
import VError from "verror";
import Logger from "..";
import { APILogContent, Service } from "../types";

const OLD_ENV = process.env;
const FILE_LOCATION = `${process.cwd()}/src/__tests__/out.log`;

const fileExists = (file: fs.PathLike) => {
  try {
    fs.accessSync(file, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
};

beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV };
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe("Trubudget Logger", () => {
  it("creates a new log file", () => {
    process.env.LOGGIN_CONFIGURATION = "WARN API";
    process.env.saveLocation = FILE_LOCATION;

    const log = new Logger(Service.API);
    expect(log).toBeDefined();
    const logMsg = {
      message: "msg",
      error: new VError(
        "verror msg",
        "verror params",
        new VError("verror 2 msg", "verror 2 params")
      ),
    } as APILogContent;
    log.warn(logMsg);
    expect(fileExists(process.env.saveLocation)).toBe(true);
  });

  it("does not create a logger - location does not exist", () => {
    process.env.LOGGIN_CONFIGURATION = "WARN API";
    process.env.saveLocation = `${process.cwd()}/src/__tests__/foo/out.log`;
    expect(() => {
      new Logger(Service.API);
    }).toThrowError();
  });
  it("does not create a logger - logger config does not exist", () => {
    expect(() => {
      new Logger(Service.API);
    }).toThrowError();
  });
  it("does configure logger correctly", () => {
    //TODO
  });
});
