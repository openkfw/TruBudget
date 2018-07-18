/*

create a single group stream to rule em all
streamitem keys are the group ids (must be set)
event streams

logically it will be a list of userId + displayname of the group?

Events:
* AddUser
* Remove
* Create Group

API:
* Create Group
* List Groups
* Add user to groupe
* List user in group
* Remove user from group

* List groups for user (this is magggic) -> filter over all groups (contains) -> do this once at login (written into token)

TODO: authz/index -> implement TODO's for groups
TODO: don't forget to add intentType to intentArrays in intents.ts

Kevin's Tipp: Take a look at the models on how to design the events (project / notifications)

*/
