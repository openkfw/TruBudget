# Issues during Developer Setup

## Docker disables wifi network adapter

If you install Docker on Windows while using Pulse Secure it's possible that you will experience network issues. The solution is to disable pulse secure to prevent it from disabling your wifi adapter. You can find a detailed solution here: [Solution](https://forums.docker.com/t/wifi-adapter-disabled-when-hyper-v-network-adapter-enabled-native/18063/9) for this issue.

## Port 8000 is already in use

This means that another process is blocking the port that you want to use for communication. To solve this, you need to find this process and stop it.

You can find the process by running

```bash
netsh http show servicestate
```

in the Windows Command Prompt (or PowerShell) and looking for the process that is running on port 80 and note down the PID of the proccess.
In the task manager, find the process with the PID and end it if it's not needed by the system.

<!--
Search for the server session which has a registered URL using port 8000.

You can find the pid of the process which blocks port 8000 in the Request queues.
Search for the right request by request queue name. Hint: The request queues and the server sessions are shown in the same order.

End process with found pid

Open the Task-Manager and sort all processes by pid. If the found process has no relevance for your system end it to free port 8000. -->

You can find a detailed solution on [Stackoverflow](https://stackoverflow.com/a/32873386).

### Port 80 used by PID 4

This means that there is a system process blocking port 80. If you want to use TruBudget in production, you should find and disable that process. If you want to test TruBudget on your machine, an easy way to fix it is to set the exposed ports in the Yaml file to a different one. Locate the file `docker-compose/local/master-node.yml` (or the one in the `master` folder) and change the following part

```yml
frontend:
  build:
    context: ../../frontend
  ports:
    - "80:80" # Mapping the nginx port
```

to

```yml
frontend:
  build:
    context: ../../frontend
  ports:
    - "90:80" # Mapping the nginx port
```

Then you can access the frontend via `localhost:90` after start.
