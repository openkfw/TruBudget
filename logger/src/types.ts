export enum LogLevel {
  FATAL,
  ERROR,
  WARN,
  INFO,
  DEBUG,
}

export enum Service {
  FRONTEND = "FRONTEND",
  API = "API",
  BLOCKCHAIN = "BLOCKCHAIN",
  STORAGE = "STORAGE SERVICE",
  NOTIFICATION = "NOTIFICATION SERVICE",
  UNKNOWN = "UNKNOWN",
}

export interface APILogContent {
  message: string;
  error: Error;
}

export interface FrontentLogContent {}
export interface BlockchainLogContent {}
export interface StorageLogContent {}
export interface NotificationLogContent {}
export interface FrontentLogContent {}

export type LogContent =
  | FrontentLogContent
  | APILogContent
  | BlockchainLogContent
  | StorageLogContent
  | NotificationLogContent;
