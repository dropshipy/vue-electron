export const SIDEBAR_MENU = [
  {
    name: "Beranda",
    path: "/home",
    icon: "sidebar/home",
  },
  {
    name: "Auto Unfollow",
    path: "/auto-unfollow",
    icon: "sidebar/auto-unfollow",
  },
  {
    name: "Auto Follow ",
    path: "/auto-follow",
    icon: "sidebar/auto-follow",
  },
  {
    name: "Auto Follow Ulasan",
    path: "/auto-follow-by-reviews",
    icon: "sidebar/auto-follow-by-reviews",
  },
  {
    name: "Auto Chat Kreator",
    path: "/auto-chat-creator",
    icon: "sidebar/auto-chat-creator",
  },
  {
    name: "Balas Ulasan Otomatis",
    path: "/auto-reply-reviews",
    icon: "sidebar/auto-reply-reviews",
  },
  {
    name: "Database Creator",
    path: "/database-creator",
    icon: "sidebar/database-creator",
    children: [
      // {
      //   name: "Creator Tiktok",
      //   path: "/database-creator/tiktok",
      //   icon: "sidebar/database-creator/tiktok",
      // },
      {
        name: "Creator Shopee",
        path: "/database-creator/shopee",
        icon: "sidebar/database-creator/shopee",
      },
    ],
  },
  {
    name: "divider",
    isShown: ($config) => !$config.hideAddsOn,
  },
  {
    name: "Adds On",
    path: "/adds-on",
    icon: "sidebar/adds-on",
    isShown: ($config) => !$config.hideAddsOn,
    children: [
      {
        name: "Auto Chat Ulasan",
        path: "/adds-on/auto-chat-by-reviews",
        icon: "sidebar/adds-on/auto-chat-by-reviews",
      },
    ],
  },
];
