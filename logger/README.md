# TruBudget Logger

This is a WIP Prototype of the Trubudget Logger. This project will be added as npm dependency to all TruBudget-subprojects. The goal is to provide a simple and unified logging interface across all TruBudget services.

# Installation

Simply run ` npm install` and you are good to go!
Most of the code lives inside the `index.ts` folder. The interfaces for each service are defined in the `types.ts` file.

# Publishing via npm

- Sign-in to npm-registry
- use `npm publish` to publish the package

### Testing

For testing, Jest is used. When jest is used, the [ log-output is not displayed on the console.](https://github.com/pinojs/pino/issues/718#issue-501289177)
Possible solutions:

- Write to file: But how to assert correctness?
- [Add additional stream](https://github.com/pinojs/pino/issues/718) and spy on console.log(). But how to assert correctness?
