# Debugging TruBudget

This guide should offer some information on how to debug the TruBudget application and deployments, if any issue appears and you are not sure where to start. This might not cover every possible scenario, so if you tried the following steps and are stuck, you could open a new issue and we will try to help.


- **Everything is running:** Make sure all your components are up and running. Depending on your setup, please check that all TruBudget components haven't crashed. 
- **Logs:** Check the logs of the TruBudget components that are affected. If you're not sure which component is affected start with the api (as most TruBudget logic happens there) and check components one by one. The logs should tell you exactly what went wrong, by showing an error message.
- **Configuration:** Make sure the components are configured properly. Common configurations to check are: same environment variables in all components (e.g. the `api` and the `blockchain` need the same `MULTICHAIN_RPC_PASSWORD`), all mandatory environment variables are set, and others.
- **Communication between components:** Make sure the communication between components is working properly, and the correct environment variables are set to enable the communication (especially IPs and ports in this case). 
- **Insufficient resources:** Make sure the components are not failing due to insufficient resources. Especially if the node you are using has a lot of data stored, the blockchain and api components (at least) might need more resources (CPU, RAM and storage)
- **Always use the latest version:** Check that you are using the latest available stable version of TruBudget. The issue you are experiencing might have already been addressed and fixed in the newest version.
- **Bugs:** If no other option until now applied to your case and you think there is a problem with the TruBudget software, please open a [bug request](https://github.com/openkfw/TruBudget/issues/new?assignees=&labels=bug&projects=&template=1.bug.md) in our repository and we will get back to you.
