---
sidebar_position: 2
---

# Errors during Local Installation

## API cannot connect to chain

If there is an error upon starting the API with the message "readiness: MultiChain connection failed", it's most likely because the blockchain was not started properly.

If you see the following error message:

```bash
[2018-10-03T12:13:23.950Z] INFO (TruBudget/16981 on servername): Connecting to MultiChain node
    protocol: "http"
    host: "127.0.0.1"
    port: 8000
    username: "multichainrpc"
    password: "password"
Register fastify endpoint
schema id ignored er58c69eg298c87e3899119e025eff1f
schema id ignored fe9c2b24ade9a92360b3a898665678ac
[2018-10-03T12:13:24.318Z] INFO (TruBudget/16981 servername): server is listening on 8080
[2018-10-03T12:13:24.585Z] WARN (TruBudget/16981 servername):  "readiness: MultiChain connection failed"
[2018-10-03T12:13:24.586Z] ERROR (TruBudget/16981 servername): MultiChain connection/permissions not ready yet
```

then locate the running instances of the blockchain

```bash
ps aux | grep multichain
```

which will produce an output similar to this:

```bash
root     17272  0.1  0.7 1042828 59520 ?       SLl  12:17   0:11 multichaind -txindex TrubudgetChain   -port=7447 -autosubscribe=streams
```

Then shutdown the process with the `kill` command with the first number after "root" (in this case 17272):

```bash
kill 17272
```

After this, start the blockchain again using the steps described in the guide (including the exports of the variables!).

## Cannot start nginx

If you get the following error

```bash
nginx: [emerg] bind() to [::]:80 failed (98: Address already in use)
nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)
nginx: [emerg] bind() to [::]:80 failed (98: Address already in use)
nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)
nginx: [emerg] bind() to [::]:80 failed (98: Address already in use)
nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)
nginx: [emerg] bind() to [::]:80 failed (98: Address already in use)
nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)
nginx: [emerg] bind() to [::]:80 failed (98: Address already in use)
nginx: [emerg] still could not bind()
```

it means that there is already an instance of nginx running and using the port 80. To stop the other process (if it's not needed), list the nginx processes

```bash
ps aux | grep nginx
```

which will produce an output similar to this one:

```bash
root     23979  0.0  0.1 116656  8660 pts/1    S    14:04   0:00 nginx: master process nginx -g daemon off;
www-data 23981  0.0  0.0 116984  2980 pts/1    S    14:04   0:00 nginx: worker process
www-data 23982  0.0  0.0 116984  3020 pts/1    S    14:04   0:00 nginx: worker process
```

Only the root process needs to be shut down. This is done via

```bash
nginx -s stop
```

## Standard Welcome Page of nginx showing

If you enter the IP address of your machine and you are presented with the standard welcome screen of nginx instead of the Trubudget app, you need to modifiy the `/etc/nginx/nginx.conf` to disable the configuration of "sites-enabled".

First, login as root and open the nginx.conf file with your editor of choice:

```bash
sudo su
nano /etc/nginx/nginx.conf
```

Then locate the line `include /etc/nginx/sites-enabled/*` and disable it by putting a pound sybol at the beginning of the line:

```bash
#include /etc/nginx/sites-enabled/*;
include /etc/nginx/conf.d/*.conf;
```

## Node JS Permission Issue

If you receive an error running `npm install`, that looks like the following:

```bash
726 verbose stack Error: sodium-native@2.1.6 install: `node-gyp-build "node preinstall.js" "node postinstall.js"`
726 verbose stack spawn ENOENT
726 verbose stack     at ChildProcess.<anonymous> (/usr/lib/node_modules/npm/node_modules/npm-lifecycle/lib/spawn.js:48:18)
726 verbose stack     at ChildProcess.emit (events.js:180:13)
726 verbose stack     at maybeClose (internal/child_process.js:936:16)
726 verbose stack     at Process.ChildProcess._handle.onexit (internal/child_process.js:220:5)
727 verbose pkgid sodium-native@2.1.6
728 verbose cwd /root/trubudget/api
729 verbose Linux 4.15.0-1025-azure
730 verbose argv "/usr/bin/node" "/usr/bin/npm" "install"
731 verbose node v9.11.2
732 verbose npm  v5.6.0
733 error file sh
734 error code ELIFECYCLE
735 error errno ENOENT
736 error syscall spawn
737 error sodium-native@2.1.6 install: `node-gyp-build "node preinstall.js" "node postinstall.js"`
737 error spawn ENOENT
738 error Failed at the sodium-native@2.1.6 install script.
738 error This is probably not a problem with npm. There is likely additional logging output above.
739 verbose exit [ 1, true ]
```

Check the global node_modules (`usr/lib/node_modules/`) permissions.

## Unable to lock the administration direcectory

If you see the following error message

```bash
E: Unable to lock the administration directory (/var/lib/dpkg/), is another process using it?
```

you need to delete the lock files (as root):

```bash
rm /var/lib/apt/lists/lock
rm /var/cache/apt/archives/lock
rm /var/lib/dpkg/lock
```
