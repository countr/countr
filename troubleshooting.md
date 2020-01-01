# Troubleshooting & FAQ

Please go through this troubleshooting guide and frequently asked questions before contacting support. An invite to the support server is at the bottom of this page.

## I can't autosetup, and linking manually does not work!

1. Have you double-checked Countr has all permissions needed to operate? An invite with all permissions can be found at [the homepage](/).
2. Have you checked Countr has access to the channel at all?
3. Is Countr offline? Try `c!ping` in a channel where it 100% has access to read and send messages, and [check if there's an outage](https://uptime.countr.xyz/).

## Commands does not work!

1. Does Countr have access to the channel?
2. You cannot use commands inside the counting channel after it has been set up, have you tried outside of the channel?
3. Is Countr offline? Try `c!ping` in a channel where it 100% has access to read and send messages, and [check if there's an outage](https://uptime.countr.xyz/).

## I've already counted 1, but it just deletes 2!

By default, you are not allowed to count multiple times in a row. This is to avoid spam. If you want to disable this, do `c!toggle allow-spam`.

## My count is glitched out, why? And how to fix it?

There are multiple reasons this may happen:

1. You or someone else deleted the previous count, so it looks messed up.
2. Countr has been offline

To fix it, do `c!set <count>` and it should be back up. To avoid this in the future, we recommend enabling either the module called "reposting" or the module called "webhook". They both repost the count, but "reposting" does it in an embed as the bot while "webhook" makes a webhook within the channel, and impersonates the user instead. Do `c!toggle reposting` or `c!toggle webhook` to enable this.

## Is there any way to avoid my message getting deleted? As an announcement for example.

Yes, start your message with `!` and Countr will ignore your message. You need to be a Moderator with Manage Messages permission though. After your message has been sent, you can edit the message and remove the exclamation if you'd like that.

## What information is getting stored in your systems? Can I request your data?

We store the necessary data that Countr needs, no unnecessary user information is getting stored. You can do `c!dump` to dump the server information to your DMs. We do not store anything else.

## Countr is slow, please fix.

We are aware it might be slow sometimes. This is often due to rate limiting, but can also be the VPS being too weak. If you want to get a faster bot available, [you have to check out what we offer in our Premium package](/premium)!

# I need further help!

Please, join our [support server](https://discord.gg/Ccj5bjb) and we will help you out!