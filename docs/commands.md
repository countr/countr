# Level 0: Everyone
Everyone get access to these commands.
- [c!help](#chelp): Get help on how to use the bot. Will time out after one minute of inactivity.
- [c!info](#cinfo): Get information and stats about the bot.
- [c!invite](#cinvite): Get an invite to add the bot.
- [c!notifications](#cnotifications): Get a list of your notifications in the server.
- [c!notifyme](#cnotifyme): Get a notification whenever the server reach whatever count you want.
- [c!ping](#cping): Get the latency of the bot.
- [c!removenotif](#cremovenotif): Remove a notification.
- [c!top](#ctop): Get the current leaderboard of the server.
- [c!topic](#ctopic): Set the topic of the channel.

# Level 1: Moderator
Everyone with the `MANAGE_MESSAGES`-permission get access to these commands.
- [c!listregex](#clistregex): Get a list of regex filters.
- [c!listroles](#clistroles): Get a list of role rewards in the server.

# Level 2: Admin
Everyone with the `MANAGE_SERVER`-permission get access to these commands.
- [c!addpin](#caddpin): Add a pintrigger so big milestones gets pinned in chat. Keep in mind this will only accept 50 pins because of Discord's limit.
- [c!addregex](#caddregex): Add a regex filter for the talking module, filtering unwanted chats.
- [c!addrole](#caddrole): Add a rolereward that gets rewarded by counting.
- [c!autosetup](#cautosetup): Quickly set up a counting channel.
- [c!editpin](#ceditpin): Edit a pintrigger.
- [c!editrole](#ceditrole): Edit a rolereward.
- [c!link](#clink): Link a counting channel manually.
- [c!liveboard](#cliveboard): Set up a liveboard in your server. Requires $3 Premium!
- [c!prefix](#cprefix): Set a new prefix for the bot.
- [c!removepin](#cremovepin): Remove a pintrigger.
- [c!removeregex](#cremoveregex): Remove a regex filter.
- [c!removerole](#cremoverole): Remove a rolereward.
- [c!reset](#creset): Reset the count.
- [c!resetscore](#cresetscore): Reset a member's or multiple members' score.
- [c!set](#cset): Set the count.
- [c!setscore](#csetscore): Set a member's score
- [c!timeoutrole](#ctimeoutrole): Set a timeout role, so when someone counts &lt;fail amount&gt; times wrong within &lt;time&gt; seconds, they will get the role. Works best if you deny the role access to the channel.
- [c!toggle](#ctoggle): Manage modules you can enable or disable in your server.
- [c!unlink](#cunlink): Unlink the current counting channel.

# Level 3: Owner
Only the owner of the server can access these commands.
- [c!dump](#cdump): Dump a server's data to DMs.
- [c!factoryreset](#cfactoryreset): Reset all data Countr has stored about this server.

## c!addpin

Add a pintrigger so big milestones gets pinned in chat. Keep in mind this will only accept 50 pins because of Discord's limit.

**Usage:** `c!addpin &lt;mode: each|only&gt; &lt;count&gt; [repost]`

**Arguments:** 
- `&lt;mode: each|only&gt;`: If you use each, it will pin every &lt;count&gt; count. If you use only, it will only pin count &lt;count&gt;.
- `&lt;count&gt;`: The count you want to reference in your mode.
- `[repost]`: If you use this, it will repost the message meaning they won't be able to edit it in the future and potentially advertise in pinned messages.

**Examples:** 
- `c!addpin each 1000 repost`: Will pin every 1000th count after reposting it, including 2000 and 3000 etc.
- `c!addpin only 420`: Will pin the count 1337 as-is.

**Alias:** `c!+pin`

## c!addregex

Add a regex filter for the talking module, filtering unwanted chats.

**Usage:** `c!addregex &lt;regex ...&gt;`

**Argument:** 
- `&lt;regex ...&gt;`: The regex you want to filter out of the chat. Get info on how to create a regex here: https://flaviocopes.com/javascript-regular-expressions/#regular-expressions-choices

**Examples:** 
- `c!addregex duck|poop`: Will filter out all messages containing duck and/or poop.
- `c!addregex [A-Z]`: Will filter out all messages with capital letters.
- `c!addregex [A-Ca-cX-Zx-z]`: Will filter out A, B, C, X, Y, Z - regardless if it's capital or not.

**Alias:** `c!+regex`

## c!addrole

Add a rolereward that gets rewarded by counting.

**Usage:** `c!addrole &lt;role&gt; &lt;mode: each|only|score&gt; &lt;count&gt; &lt;duration: temporary|permanent&gt;`

**Arguments:** 
- `&lt;role&gt;`: The role you want to be the reward. If you plan on using the role name, use _ instead of spaces.
- `&lt;mode: each|only|score&gt;`: If you use each, it will reward someone for every &lt;count&gt; count. If you use only, it will only reward someone for count &lt;count&gt;. If you use score, it will reward someone if their score hit &lt;count&gt;.
- `&lt;count&gt;`: The count you want to reference in your mode.
- `&lt;duration: temporary|permanent&gt;`: If you use temporary, the users will lose their role again if someone else gets rewarded with the same role. If you use permanent, they keep it forever until someone removes it.

**Examples:** 
- `c!addrole Count_Champ each 1000 temporary`: Will give users the Count Champ-role every 1000th count in the server, including 2000 and 3000 etc. And the role will last until someone else gets rewarded.
- `c!addrole 469523835595653120 only 420 permanent`: Will give users the role with ID 469523835595653120 if they count the 420th count in the server. It will stay on until someone else removes it.

**Alias:** `c!+role`

## c!autosetup

Quickly set up a counting channel.

**Usage:** `c!autosetup`

**Alias:** `c!setup`

## c!dump

Dump a server's data to DMs.

**Usage:** `c!dump [server id]`

**Argument:** 
- `[server id]`: Normally it will dump the current server's data. If you supply this, it will dump that server's data instead. This is bot owner only.

## c!editpin

Edit a pintrigger.

**Usage:** `c!editpin &lt;ID&gt; &lt;property: mode|count|action&gt; &lt;value: see addpin's usage&gt;`

**Arguments:** 
- `&lt;ID&gt;`: The pintrigger's ID.
- `&lt;property: mode|count|action&gt;`: The property you want to change.
- `&lt;value: see addpin's usage&gt;`: The new value for the property.

**Examples:** 
- `c!editpin wnoK3d mode each`: Will change the pintrigger with ID wnoK3d's mode to each.
- `c!editpin 89hJzm count 1337`: Will change the pintrigger with ID 89hJzm's count to 1337.

## c!editrole

Edit a rolereward.

**Usage:** `c!editrole &lt;ID&gt; &lt;property: role|mode|count|duration&gt; &lt;value: see addrole's usage&gt;`

**Arguments:** 
- `&lt;ID&gt;`: The rolereward's ID.
- `&lt;property: role|mode|count|duration&gt;`: The property you want to change.
- `&lt;value: see addrole's usage&gt;`: The new value for the property.

**Examples:** 
- `c!editrole MnRIf4 mode each`: Will change the rolereward with ID MnRIf4's mode to each.
- `c!editrole jPFj78 count 1337`: Will change the rolereward with ID jPFj78's count to 1337.

## c!factoryreset

Reset all data Countr has stored about this server.

**Usage:** `c!factoryreset`

## c!help

Get help on how to use the bot. Will time out after one minute of inactivity.

**Usage:** `c!help [-all] [&lt;search ...&gt;]`

**Arguments:** 
- `[-all]`: If you include this, it will show all the commands excluding bot-admins-only commands.
- `[&lt;search ...&gt;]`: Search for a specific command, category or related.

**Examples:** 
- `c!help notifyme`: Will give you infomation about the notifyme-command.
- `c!help -all add`: Will give you all commands that have "add" in their command, description or usage.

**Aliases:** `c!commands`, `c!?`

## c!info

Get information and stats about the bot.

**Usage:** `c!info`

**Aliases:** `c!botinfo`, `c!botstats`

## c!invite

Get an invite to add the bot.

**Usage:** `c!invite`

**Alias:** `c!addme`

## c!link

Link a counting channel manually.

**Usage:** `c!link [&lt;channel&gt;]`

**Argument:** 
- `[&lt;channel&gt;]`: The new counting channel.

**Alias:** `c!connect`

## c!listregex

Get a list of regex filters.

**Usage:** `c!listregex`

**Alias:** `c!regexlist`

## c!listroles

Get a list of role rewards in the server.

**Usage:** `c!listroles`

**Aliases:** `c!roles`, `c!rolerewards`, `c!roleslist`

## c!liveboard

Set up a liveboard in your server. Requires $3 Premium!

**Usage:** `c!liveboard [&lt;channel&gt;]`

**Argument:** 
- `[&lt;channel&gt;]`: Specify what channel you want the liveboard message to go in. Default is current channel.

## c!notifications

Get a list of your notifications in the server.

**Usage:** `c!notifications`

**Aliases:** `c!notifs`, `c!alert`, `c!listnotifs`, `c!listnotifications`

## c!notifyme

Get a notification whenever the server reach whatever count you want.

**Usage:** `c!notifyme [each] &lt;count&gt;`

**Arguments:** 
- `[each]`: If you include this, it will be each &lt;count&gt;.
- `&lt;count&gt;`: The count you want to get notified of.

**Examples:** 
- `c!notifyme 420`: Get notified whenever the server reach count 420.
- `c!notifyme each 1000`: Get notified for every 1000th count, including 2000 and 3000.

**Alias:** `c!alertme`

## c!ping

Get the latency of the bot.

**Usage:** `c!ping`

**Aliases:** `c!pong`, `c!latency`, `c!uptime`

## c!prefix

Set a new prefix for the bot.

**Usage:** `c!prefix &lt;prefix ...&gt;`

**Argument:** 
- `&lt;prefix ...&gt;`: The new prefix. If you want to end your prefix with a space, end the prefix with {{SPACE}}.

**Examples:** 
- `c!prefix c?`: Set the prefix to c?, the help command would then be c?help.
- `c!prefix Hey Countr,{{SPACE}}`: Set the prefix to a Google Assistant-like one.

**Alias:** `c!setprefix`

## c!removenotif

Remove a notification.

**Usage:** `c!removenotif &lt;ID&gt;`

**Argument:** 
- `&lt;ID&gt;`: The notification ID you want to remove.

**Example:** 
- `c!removenotif bd9kJK`: Remove notification with ID bd9kJK.

**Aliases:** `c!remnotif`, `c!-notif`

## c!removepin

Remove a pintrigger.

**Usage:** `c!removepin &lt;ID&gt;`

**Argument:** 
- `&lt;ID&gt;`: The pintrigger ID you want to remove.

**Example:** 
- `c!removepin v43ThQ`: Remove pintrigger with ID v43ThQ.

**Alias:** `c!-pin`

## c!removeregex

Remove a regex filter.

**Usage:** `c!removeregex &lt;regex ...&gt;`

**Argument:** 
- `&lt;regex ...&gt;`: The regex you want to remove.

**Example:** 
- `c!removeregex duck|poop`: Will remove the regex filter duck|poop.

**Alias:** `c!-regex`

## c!removerole

Remove a rolereward.

**Usage:** `c!removerole all|&lt;ID&gt;`

**Argument:** 
- `all|&lt;ID&gt;`: The rolereward ID you want to remove. If you use all, it will remove all rolerewards.

**Example:** 
- `c!removerole bd9kJK`: Remove rolereward with ID bd9kJK.

**Alias:** `c!-role`

## c!reset

Reset the count.

**Usage:** `c!reset`

## c!resetscore

Reset a member's or multiple members' score.

**Usage:** `c!resetscore all|&lt;members ...&gt;`

**Argument:** 
- `all|&lt;members ...&gt;`: The member or members you want to reset the score of. If you use all, it will remove all members' scores.

**Examples:** 
- `c!resetscore 110090225929191424`: Will remove member with ID 110090225929191424's score.
- `c!resetscore 467377486141980682 625031581094117381`: Will remove members with these IDs' score.

## c!set

Set the count.

**Usage:** `c!set &lt;count&gt;`

**Argument:** 
- `&lt;count&gt;`: The new count.

## c!setscore

Set a member's score

**Usage:** `c!setscore &lt;member(s ...) and/or role(s ...)&gt; &lt;score&gt;`

**Arguments:** 
- `&lt;member(s ...) and/or role(s ...)&gt;`: The member(s) or members of role(s) you want to set the score of
- `&lt;score&gt;`: The new score

**Examples:** 
- `c!setscore 110090225929191424 9999999`: Will set member with ID 110090225929191424's score to 9999999.
- `c!setscore @Promise#0001 @CountingGods 1337`: Will set Promise#0001's and all members in role Counting Gods' score to 1337.

## c!timeoutrole

Set a timeout role, so when someone counts &lt;fail amount&gt; times wrong within &lt;time&gt; seconds, they will get the role. Works best if you deny the role access to the channel.

**Usage:** `c!timeoutrole &lt;role&gt; &lt;time&gt; &lt;fails&gt; [&lt;duration&gt;]`

**Arguments:** 
- `&lt;role&gt;`: The role you want the timeout role to be. If you plan on using the role name, use _ instead of spaces.
- `&lt;time&gt;`: Time in seconds users have to count &lt;fails&gt; times in to get the role.
- `&lt;fails&gt;`: Fails within &lt;time&gt; seconds to get the role.
- `[&lt;duration&gt;]`: Duration in seconds the role will stay on for. Default is forever.

**Examples:** 
- `c!timeoutrole Timed_out 10 5`: This will give the user the role Timed out if they fail 5 times within 10 seconds.
- `c!timeoutrole 531877473437220866 30 3 120`: This will give the user the role with ID 531877473437220866 if they fail 3 times within 30 seconds, and the role will be removed after 2 minutes.

## c!toggle

Manage modules you can enable or disable in your server.

**Usage:** `c!toggle [&lt;module&gt;]`

**Argument:** 
- `[&lt;module&gt;]`: The module you want to toggle.

**Example:** 
- `c!toggle allow-spam`: Toggle the module allow-spam.

**Aliases:** `c!modules`, `c!module`

## c!top

Get the current leaderboard of the server.

**Usage:** `c!top`

**Aliases:** `c!leaderboard`, `c!^`

## c!topic

Set the topic of the channel.

**Usage:** `c!topic &lt;topic ...|reset|disable&gt;`

**Argument:** 
- `&lt;topic ...|reset|disable&gt;`: The new topic. Use {{COUNT}} for the current count. If you put reset, it will be changed to the default. If you put disable, it will disable this functionality completely.

**Example:** 
- `c!topic Count to infinity! Next count is {{COUNT}}.`: An example using the placeholder.

**Alias:** `c!settopic`

## c!unlink

Unlink the current counting channel.

**Usage:** `c!unlink`

**Alias:** `c!disconnect`