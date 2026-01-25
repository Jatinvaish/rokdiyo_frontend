export const notifications = [
  {
    id: 1,
    title: "Login from new device",
    role: "Administrator",
    desc: "Account Login from the new device.",
    avatar: "01.png",
    status: "offline",
    unread_message: false,
    type: "text",
    date: "1 minute ago"
  },
];

export type Notification = (typeof notifications)[number];
