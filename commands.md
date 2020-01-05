# Understanding Usage

- Everything in angle brackets are user input, for example `<count>`.
- Everything in square brackets are optional, for example `[repost]` or `[<search query>]`.
- Everything without any brackets are required in the command for it to work, for example `all`
- Sometimes you need to choose between multiple inputs, for example in `<mode: each|every|score>` or `all|<members...>`.
- Sometimes an argument supports multiple inputs, for example in `<regex ...>`
- Sometimes a combination of these are used.

For example, in this command: `c!command <abc> [def] [<ghi>] jkl <mno: pq|rs> <tuv ...>`:
- `<abc>` is required user input.
- `[def]` is optional, but is not user input.
- `[<ghi>]` is optional user input.
- `jkl` is required, but is not user input.
- `<mno: pq|rs>` is required user input, but can only choose between `pq` and `rs`.
- `<tuv ...>` is required user input, but also supports multiple inputs.

Still doesn't understand? Don't worry, most of the advanced commands have an example you can go out from.

# Level 0: Everyone
Everyone get access to these commands.
- [c!help](#chelp): Get help on commands.
- [c!info](#cinfo): Get information and stats about the bot.
- [c!invite](#cinvite): Get an invite to add the bot.
- [c!notifications](#cnotifications): Get a list of your notifications in the server.
- [c!notifyme](#cnotifyme): Get a notification whenever the server reach whatever count you want.
- [c!ping](#cping): Get the latency of the bot.
- [c!removenotif](#cremovenotif): Remove a notification.
- [c!scoreboard](#cscoreboard): Get the current scoreboard of the server.
- [c!webboard](#cwebboard): Gets a link to the webboard of Countr

# Level 1: Moderator
Everyone with the `MANAGE_MESSAGES`-permission get access to these commands.
- [c!listpins](#clistpins): Get a list of pintriggers.
- [c!listregex](#clistregex): Get a list of regex filters.
- [c!listroles](#clistroles): Get a list of role rewards.
- [c!setcount](#csetcount): Set the count.

# Level 2: Admin
Everyone with the `MANAGE_SERVER`-permission get access to these commands.
- [c!addpin](#caddpin): Add a pintrigger so big milestones gets pinned in chat.
- [c!addregex](#caddregex): Add a regex filter for the talking module, filtering unwanted messages.
- [c!addrole](#caddrole): Add a rolereward that gets rewarded by counting.
- [c!addtoscore](#caddtoscore): Set a member's score
- [c!autosetup](#cautosetup): Quickly set up a counting channel.
- [c!disabletimeoutrole](#cdisabletimeoutrole): Reset and disable the timeout role.
- [c!editpin](#ceditpin): Edit a pintrigger.
- [c!editrole](#ceditrole): Edit a rolereward.
- [c!exportscores](#cexportscores): Export scores to a JSON-file.
- [c!importscores](#cimportscores): Import scores from a JSON-file. Upload the JSON-file with the command itself.
- [c!link](#clink): Link a counting channel manually.
- [c!liveboard](#cliveboard): Set up a liveboard in your server. (Premium)
- [c!removefromscore](#cremovefromscore): Set a member's score
- [c!removepin](#cremovepin): Remove a pintrigger.
- [c!removeregex](#cremoveregex): Remove a regex filter.
- [c!removerole](#cremoverole): Remove a rolereward.
- [c!removetimeoutrole](#cremovetimeoutrole): Remove and disable the timeout role.
- [c!resetcount](#cresetcount): Reset the count.
- [c!resetscore](#cresetscore): Reset a member's or multiple members' score.
- [c!setprefix](#csetprefix): Set a new prefix for the bot.
- [c!setscore](#csetscore): Set a member's or multiple members' score.
- [c!settimeoutrole](#csettimeoutrole): Set a timeout role, so when someone counts <fail amount> times wrong within <time> seconds, they will get the role. Works best if you deny the role access to the channel.
- [c!settopic](#csettopic): Set the topic of the channel.
- [c!toggle](#ctoggle): Manage modules you can enable or disable in your server.
- [c!unlink](#cunlink): Unlink the current counting channel.

# Level 3: Owner
Only the owner of the server can access these commands.
- [c!dump](#cdump): Dump a server's data to DMs. (GDPR-compliant)
- [c!factoryreset](#cfactoryreset): Reset all data Countr has stored about this server.

## c!addpin

Add a pintrigger so big milestones gets pinned in chat.

**Usage:** `c!addpin <mode: each|only> <count> [<action: keep|repost>]`

**Arguments:** 
- `<mode: each|only>`: If you use each, it will pin every &lt;count&gt; count. If you use only, it will only pin count &lt;count&gt;.
- `<count>`: The count you want to reference in your mode.
- `[<action: keep|repost>]`: If you use repost, it will repost the message before pinning it. Default is keep, which does not do this.

**Examples:** 
- `c!addpin each 1000 repost`: Will pin every 1000th count after reposting it, including 2000 and 3000 etc.
- `c!addpin only 420`: Will pin the count 1337 as-is.

**Alias:** `c!+pin`

## c!addregex

Add a regex filter for the talking module, filtering unwanted messages.

**Usage:** `c!addregex <regex ...>`

**Argument:** 
- `<regex ...>`: The regex you want to filter out of the chat. Get info on how to create a regex here: https://flaviocopes.com/javascript-regular-expressions/#regular-expressions-choices

**Examples:** 
- `c!addregex duck|poop`: Will filter out all messages containing duck and/or poop.
- `c!addregex [A-Z]`: Will filter out all messages with capital letters.
- `c!addregex [A-Ca-cX-Zx-z]`: Will filter out A, B, C, X, Y, Z - regardless if it's capital or not.

**Alias:** `c!+regex`

## c!addrole

Add a rolereward that gets rewarded by counting.

**Usage:** `c!addrole <role> <mode: each|only|score> <count> <duration: temporary|permanent>`

**Arguments:** 
- `<role>`: The role you want to be the reward. If you plan on using the role name, use underscores instead of spaces.
- `<mode: each|only|score>`: If you use each, it will reward someone for every &lt;count&gt; count. If you use only, it will only reward someone for count &lt;count&gt;. If you use score, it will reward someone if their score hit &lt;count&gt;.
- `<count>`: The count you want to reference in your mode.
- `<duration: temporary|permanent>`: If you use temporary, the users will lose their role again if someone else gets rewarded with the same role. If you use permanent, they keep it forever until someone removes it.

**Examples:** 
- `c!addrole Count_Champ each 1000 temporary`: Will give users the Count Champ-role every 1000th count in the server, including 2000 and 3000 etc. And the role will last until someone else gets rewarded.
- `c!addrole 469523835595653120 only 420 permanent`: Will give users the role with ID 469523835595653120 if they count the 420th count in the server. It will stay on until someone else removes it.

**Alias:** `c!+role`

## c!addtoscore

Set a member's score

**Usage:** `c!addtoscore <member(s ...) and/or role(s ...)> <score>`

**Arguments:** 
- `<member(s ...) and/or role(s ...)>`: The member(s) or members of role(s) you want to set the score of
- `<score>`: The new score

**Examples:** 
- `c!addtoscore 110090225929191424 9999999`: Will set member with ID 110090225929191424's score to 9999999.
- `c!addtoscore @Promise#0001 @CountingGods 1337`: Will set Promise#0001's and all members in role Counting Gods' score to 1337.

**Alias:** `c!+score`

## c!autosetup

Quickly set up a counting channel.

**Usage:** `c!autosetup`

**Alias:** `c!setup`

## c!disabletimeoutrole

Reset and disable the timeout role.

**Usage:** `c!disabletimeoutrole`

**Aliases:** `c!resettimeoutrole`, `c!re=timeoutrole`

## c!dump

Dump a server's data to DMs. (GDPR-compliant)

**Usage:** `c!dump`

**Alias:** `c!export`

## c!editpin

Edit a pintrigger.

**Usage:** `c!editpin <ID> <property: mode|count|action> <value>`

**Arguments:** 
- `<ID>`: The pintrigger's ID.
- `<property: mode|count|action>`: The property you want to change.
- `<value>`: The new value for the property. See the usage of `c!addpin` for values to choose from.

**Examples:** 
- `c!editpin wnoK3d mode each`: Will change the pintrigger with ID wnoK3d's mode to each.
- `c!editpin 89hJzm count 1337`: Will change the pintrigger with ID 89hJzm's count to 1337.
- `c!editpin IfS80j action repost`: Will change the pintrigger with ID IfS80j's action to repost.

**Alias:** `c!=pin`

## c!editrole

Edit a rolereward.

**Usage:** `c!editrole <ID> <property: role|mode|count|duration> <value>`

**Arguments:** 
- `<ID>`: The rolereward's ID.
- `<property: role|mode|count|duration>`: The property you want to change.
- `<value>`: The new value for the property. See the usage of `c!addrole` for values to choose from.

**Examples:** 
- `c!editrole MnRIf4 mode each`: Will change the rolereward with ID MnRIf4's mode to each.
- `c!editrole jPFj78 count 1337`: Will change the rolereward with ID jPFj78's count to 1337.

**Alias:** `c!=role`

## c!exportscores

Export scores to a JSON-file.

**Usage:** `c!exportscores <member(s ...) and/or role(s ...)>|all`

**Argument:** 
- `<member(s ...) and/or role(s ...)>|all`: The member(s) and/or role(s') members you want to export the scores of.

**Examples:** 
- `c!exportscores 110090225929191424`: Export the score of user with ID 110090225929191424.
- `c!exportscores @Promise#0001`: Export the score of user Promise#0001.
- `c!exportscores 110090225929191424 @Promise#0001`: Export the scores of user with ID 110090225929191424 and user Promise#0001.
- `c!exportscores @Staff Server_Moderators`: Export the scores of all members of roles Staff and Server Moderators.
- `c!exportscores 110090225929191424 @Promise#0001 @Staff Server_Moderators`: Mix members and roles if you want to.
- `c!exportscores all`: Export all scores.

## c!factoryreset

Reset all data Countr has stored about this server.

**Usage:** `c!factoryreset`

## c!help

Get help on commands.

**Usage:** `c!help [-all] [<search ...>]`

**Arguments:** 
- `[-all]`: If you include this, it will show all the commands excluding bot-admins-only commands.
- `[<search ...>]`: Search for a specific command, category or related.

**Examples:** 
- `c!help notifyme`: Will give you infomation about the notifyme-command.
- `c!help -all add`: Will give you all commands that have "add" in their command, description or usage.

**Aliases:** `c!commands`, `c!?`

## c!importscores

Import scores from a JSON-file. Upload the JSON-file with the command itself.

**Usage:** `c!importscores <method: set|add>`

**Argument:** 
- `<method: set|add>`: Decide if you want to overwrite the scores or add to the scores.

**Examples:** 
- `c!importscores set`: Will overwrite all the scores to the one in the file.
- `c!importscores add`: Will add the scores to the users' previous scores.

## c!info

Get information and stats about the bot.

**Usage:** `c!info`

**Aliases:** `c!botinfo`, `c!botstats`

## c!invite

Get an invite to add the bot.

**Usage:** `c!invite`

**Aliases:** `c!addme`, `c!inviteme`

## c!link

Link a counting channel manually.

**Usage:** `c!link [<channel>]`

**Argument:** 
- `[<channel>]`: The new counting channel. Leave empty to choose current channel.

**Alias:** `c!connect`

## c!listpins

Get a list of pintriggers.

**Usage:** `c!listpins`

**Aliases:** `c!pinlist`, `c!pins`, `c!pintriggers`

## c!listregex

Get a list of regex filters.

**Usage:** `c!listregex`

**Aliases:** `c!regexlist`, `c!regexfilters`

## c!listroles

Get a list of role rewards.

**Usage:** `c!listroles`

**Aliases:** `c!rolelist`, `c!roles`, `c!rolerewards`

## c!liveboard

Set up a liveboard in your server. (Premium)

**Usage:** `c!liveboard <channel>|disable`

**Argument:** 
- `<channel>|disable`: Specify what channel you want the liveboard message to go in, or disable it.

## c!notifications

Get a list of your notifications in the server.

**Usage:** `c!notifications`

**Aliases:** `c!notiflist`, `c!notifs`, `c!alert`, `c!listnotifs`, `c!listnotifications`

## c!notifyme

Get a notification whenever the server reach whatever count you want.

**Usage:** `c!notifyme [each] <count>`

**Arguments:** 
- `[each]`: If you include this, it will be each &lt;count&gt;.
- `<count>`: The count you want to get notified of.

**Examples:** 
- `c!notifyme 420`: Get notified whenever the server reach count 420.
- `c!notifyme each 1000`: Get notified for every 1000th count, including 2000 and 3000.

**Aliases:** `c!alertme`, `c!notify`, `c!alert`

## c!ping

Get the latency of the bot.

**Usage:** `c!ping`

**Aliases:** `c!pong`, `c!latency`, `c!uptime`

## c!removefromscore

Set a member's score

**Usage:** `c!removefromscore <member(s ...) and/or role(s ...)> <score>`

**Arguments:** 
- `<member(s ...) and/or role(s ...)>`: The member(s) or members of role(s) you want to set the score of
- `<score>`: The new score

**Examples:** 
- `c!removefromscore 110090225929191424 9999999`: Will set member with ID 110090225929191424's score to 9999999.
- `c!removefromscore @Promise#0001 @CountingGods 1337`: Will set Promise#0001's and all members in role Counting Gods' score to 1337.

**Aliases:** `c!-fromscore`, `c!-score`

## c!removenotif

Remove a notification.

**Usage:** `c!removenotif <ID(s ...)>|all`

**Argument:** 
- `<ID(s ...)>|all`: The notification ID(s) you want to remove, or all notifications.

**Examples:** 
- `c!removenotif bd9kJK`: Remove notification with ID bd9kJK.
- `c!removenotif all`: Remove all notifications.

**Alias:** `c!-notif`

## c!removepin

Remove a pintrigger.

**Usage:** `c!removepin <ID(s ...)>|all`

**Argument:** 
- `<ID(s ...)>|all`: The pintrigger ID(s) you want to remove, or all pintriggers.

**Examples:** 
- `c!removepin v43ThQ`: Remove pintrigger with ID v43ThQ.
- `c!removepin all`: Remove all pintriggers.

**Alias:** `c!-pin`

## c!removeregex

Remove a regex filter.

**Usage:** `c!removeregex <regex ...>|all`

**Argument:** 
- `<regex ...>|all`: The regex filter you want to remove, or all regex filters.

**Examples:** 
- `c!removeregex duck|poop`: Remove the regex filter `duck|poop`.
- `c!removeregex all`: Remove all regex filters.

**Alias:** `c!-regex`

## c!removerole

Remove a rolereward.

**Usage:** `c!removerole <ID(s ...)>|all`

**Argument:** 
- `<ID(s ...)>|all`: The rolereward ID(s) you want to remove, or all.

**Examples:** 
- `c!removerole bd9kJK`: Remove rolereward with ID bd9kJK.
- `c!removerole all`: Remove all rolerewards.

**Alias:** `c!-role`

## c!removetimeoutrole

Remove and disable the timeout role.

**Usage:** `c!removetimeoutrole`

**Alias:** `c!-timeoutrole`

## c!resetcount

Reset the count.

**Usage:** `c!resetcount`

**Aliases:** `c!re=count`, `c!reset`

## c!resetscore

Reset a member's or multiple members' score.

**Usage:** `c!resetscore <member(s ...) and/or role(s ...)>|all`

**Argument:** 
- `<member(s ...) and/or role(s ...)>|all`: The member(s) and/or role(s') member(s) you want to reset the score of, or all. If you use role names, they have to use underscores instead of spaces.

**Examples:** 
- `c!resetscore 110090225929191424`: Remove the score of user with ID 110090225929191424.
- `c!resetscore @Promise#0001`: Remove the score of user Promise#0001.
- `c!resetscore 110090225929191424 @Promise#0001`: Remove the scores of user with ID 110090225929191424 and user Promise#0001.
- `c!resetscore @Staff Server_Moderators`: Remove the scores of all members of roles Staff and Server Moderators.
- `c!resetscore 110090225929191424 @Promise#0001 @Staff Server_Moderators`: Mix members and roles if you want to.
- `c!resetscore all`: Reset all scores.

**Alias:** `c!re=score`

## c!scoreboard

Get the current scoreboard of the server.

**Usage:** `c!scoreboard`

**Aliases:** `c!leaderboard`, `c!^`, `c!top`

## c!setcount

Set the count.

**Usage:** `c!setcount <count>`

**Argument:** 
- `<count>`: The new count.

**Aliases:** `c!set`, `c!=`, `c!=count`

## c!setprefix

Set a new prefix for the bot.

**Usage:** `c!setprefix <prefix ...>|reset`

**Argument:** 
- `<prefix ...>|reset`: The new prefix. If you want to end your prefix with a space, end the prefix with {{SPACE}}. If you use reset, use the default prefix for the bot.

**Examples:** 
- `c!setprefix c?`: Set the prefix to c?, the help command would then be c?help.
- `c!setprefix Hey Countr,{{SPACE}}`: Set the prefix to a Google Assistant-like one.

**Aliases:** `c!prefix`, `c!=prefix`

## c!setscore

Set a member's or multiple members' score.

**Usage:** `c!setscore <member(s ...) and/or role(s ...)> <score>`

**Arguments:** 
- `<member(s ...) and/or role(s ...)>`: The member(s) or members of role(s) you want to set the score of
- `<score>`: The new score

**Examples:** 
- `c!setscore 110090225929191424 9999999`: Will set member with ID 110090225929191424's score to 9999999.
- `c!setscore @Promise#0001 @CountingGods 1337`: Will set Promise#0001's and all members in role Counting Gods' score to 1337.

**Alias:** `c!=score`

## c!settimeoutrole

Set a timeout role, so when someone counts &lt;fail amount&gt; times wrong within &lt;time&gt; seconds, they will get the role. Works best if you deny the role access to the channel.

**Usage:** `c!settimeoutrole <role> <fails> <time> [<duration>]`

**Arguments:** 
- `<role>`: The role you want the timeout role to be. If you plan on using the role name, use _ instead of spaces.
- `<fails>`: Fails within &lt;time&gt; seconds to get the role.
- `<time>`: Time in seconds users have to count &lt;fails&gt; times to get the role.
- `[<duration>]`: Duration in seconds the role will stay on for. Default is forever.

**Examples:** 
- `c!settimeoutrole Timed_out 5 10`: This will give the user the role Timed out if they fail 5 times within 10 seconds.
- `c!settimeoutrole 531877473437220866 3 30 120`: This will give the user the role with ID 531877473437220866 if they fail 3 times within 30 seconds, and the role will be removed after 2 minutes.

**Alias:** `c!=timeoutrole`

## c!settopic

Set the topic of the channel.

**Usage:** `c!settopic <topic ...>|reset|disable`

**Argument:** 
- `<topic ...>|reset|disable`: The new topic. Use {{COUNT}} for the current count. If you put reset, it will be changed to the default. If you put disable, it will disable this functionality completely.

**Example:** 
- `c!settopic Count to infinity! Next count is {{COUNT}}.`: An example using the placeholder.

**Aliases:** `c!topic`, `c!=topic`

## c!toggle

Manage modules you can enable or disable in your server.

**Usage:** `c!toggle [<module>]`

**Argument:** 
- `[<module>]`: The module you want to toggle.

**Example:** 
- `c!toggle allow-spam`: Toggle the module allow-spam.

**Aliases:** `c!modules`, `c!module`

## c!unlink

Unlink the current counting channel.

**Usage:** `c!unlink`

**Alias:** `c!disconnect`

## c!webboard

Gets a link to the webboard of Countr

**Usage:** `c!webboard`

**Aliases:** `c!web`, `c!admininterface`, `c!interface`, `c!analytics`