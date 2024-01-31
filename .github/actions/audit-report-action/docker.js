import { Config } from "./config";

const child_process = require('child_process');

export async function pullImage(imageName) {
  child_process.spawnSync("docker", ["pull", `trubudget/${imageName}:main`], {
    encoding: 'utf-8',
    maxBuffer: Config.spawnProcessBufferSize
  });
  child_process.spawnSync("docker", ["save", `trubudget/${imageName}:main`, "-o", `${imageName}.tar`], {
    encoding: 'utf-8',
    maxBuffer: Config.spawnProcessBufferSize
  });
}