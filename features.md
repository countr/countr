# Modules

You can enable these features by typing [`c!toggle <module>`](/commands#ctoggle).

| Module | Description |
|:-------|:------------|
| `allow-spam` | Allow people to count multiple times in a row, instead of forcing them to wait for the next person to count first. |
| `talking` | Allow people to send a text message after the count. Ex. `1 Hi there!` |
| `recover` | Make the bot try to recover itself after it goes offline by removing unprocessed messages in the counting channel when it goes online. |
| `reposting` | Repost the message being sent in a nice embed, preventing the users from editing or self-deleting their count later on. |
| `webhook` | Same as the module `reposting` except that it will repost it in a nice embed, impersonating the user who sent it. |

# Rolerewards

Rolerewards are roles that you can reward users for typing whatever count you want. The most common usage of this feature is a "counting champion"-role that gets rewarded each 1000th count. Of course you can do it however you want. To set this up, check out  [`c!addrole`](/commands#caddrole) for more information. Also check out [`c!listroles`](/commands#clistroles), [`c!editrole`](/commands#ceditrole) and [`c!removerole`](/commands#cremoverole).

> [!NOTE]
> Countr needs to have a role above the role you want to use. This is due to Discord's permission system.

# Pintriggers

Pintriggers are triggers you can set up in your counting channel that will pin whatever count you want. The most common usage of this is to set it up where it pins each 1000th count. Of course you can do it however you want. To set this up, check out [`c!addpin`](/commands#caddpin) for more information. Also check out [`c!listpins`](/commands#clistpins), [`c!editpin`](/commands#ceditpin) and [`c!removepin`](/commands#cremovepin).

> [!NOTE]
> Because of Discord's limit of 50 pins per channel, Countr will try and remove the oldest count before pinning a new one. Countr only does this when the channel reach 50 pins.

# Regex filters

Regex filters are filters you can set up in your counting channel that will remove any message matching your filter. This is used along with the talking module, but ... I don't know why you'd want it, but you can also do it without the module. To set this up, check out [`c!addregex`](/commands#caddregex) for more information. Also check out [`c!listregex`](/commands#clistregex) and [`c!removeregex`](/commands#cremoveregex).

# Notifications

If you want to keep yourself up-to-date in your counting channel, or someone else's counting channel, you can set it up so Countr will send you a DM whenever you'd like. To set this up, check out [`c!notifyme`](/commands#cnotifyme) for more information. Also check out [`c!notifications`](/commands#cnotifications) and [`c!removenotif`](/commands#cremovenotif).

# Timeout role

If you want to give users who fail to count a role (because they thought 1+1 was 3 or something), you can do exactly that. To set this up, check out [`c!timeoutrole`](/commands#ctimeoutrole).

# Web analytics

We have a web analytics page, located at [analytics.countr.xyz](https://analytics.countr.xyz/). This is in BETA, so if you find a bug, please go to our [issue tracker](https://github.com/promise/countr/issues) or go to our [support server](https://discord.gg/Ccj5bjb) to let us know, thank you!