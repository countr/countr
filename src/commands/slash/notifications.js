const { formatNotifications, generateID } = require("../../constants/index.js");

module.exports = {
  description: "asdf",
  options: [
    {
      type: 1,
      name: "list",
      description: "List all your notification alerts"
    },
    {
      type: 1,
      name: "create",
      description: "Create a new notification alert",
      options: [
        {
          type: 4,
          name: "count",
          description: "The count you want to get notified of.",
          required: true
        },
        {
          type: 5,
          name: "each",
          description: "Get notified of a multiplication of the count instead of just once. Default is false."
        }
      ]
    },
    {
      type: 1,
      name: "remove",
      description: "Delete a notification alert",
      options: [
        {
          type: 3,
          name: "id",
          description: "The notification ID(s) you want to remove, or all notifications.",
          required: true
        }
      ]
    }
  ]
};

module.exports.run = async (send, { gdb, member }, { list, create, remove }) => {
  if (list) {
    let { notifications: rawList } = gdb.get(), notifications = {};
    for (const id in rawList) if (rawList[id] && rawList[id].user == member.user.id) notifications[id] = rawList[id];

    if (!Object.keys(notifications).length) send({ content: "❌ You don't have any notifications for this server." });
    else send({ content: `📋 Notifications for user <@${member.user.id}>:\n${formatNotifications(notifications).join("\n")}` });
  } else if (create) {
    const { count, each = false } = create, { notifications } = gdb.get(), id = generateID(Object.keys(notifications));

    gdb.setOnObject("notifications", id, {
      user: member.user.id, mode: each ? "each" : "only", count
    });

    send({ content: `✅ Notification with ID \`${id}\` has been saved!` });
  } else if (remove) {
    const { id } = remove, { notifications } = gdb.get();
    if (id == "all") {
      const newNotifications = {};
      for (const nID in notifications) if (
        notifications[nID] &&
        notifications[nID].user !== member.user.id
      ) newNotifications[nID] = notifications[nID];
      gdb.set("notifications", newNotifications);
      send({ content: "✅ All your notifications have been removed." });
    } else {
      if (!notifications[id] || notifications[id].user !== member.user.id) send({ content: "❌ Notification not found." });
      else {
        gdb.removeFromObject("notifications", id);
        send({ content: `✅ Notification \`${id}\` has been removed.` });
      }
    }
  }
};