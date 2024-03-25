import { Config } from "./config";

const child_process = require('child_process');

export async function pullImage(imageName, tag = "main") {
  console.info(`Pulling image trubudget/${imageName}:${tag}`);
  child_process.spawnSync("docker", ["pull", `trubudget/${imageName}:${tag}`], {
    encoding: 'utf-8',
    maxBuffer: Config.spawnProcessBufferSize
  });
  child_process.spawnSync("docker", ["save", `trubudget/${imageName}:${tag}`, "-o", `${imageName}.tar`], {
    encoding: 'utf-8',
    maxBuffer: Config.spawnProcessBufferSize
  });
}