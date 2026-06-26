import type { Room } from "@/app/api/model/room";

export const mockRooms: Room[] = [
  {
    id: "room-single-garden",
    name: "スタンダードシングル",
    type: "single",
    capacity: 1,
    pricePerNight: 12800,
    totalRooms: 8,
    amenities: ["Wi-Fi", "デスク", "禁煙"],
    imageLabel: "Compact",
  },
  {
    id: "room-twin-riverside",
    name: "リバーサイドツイン",
    type: "twin",
    capacity: 2,
    pricePerNight: 18400,
    totalRooms: 5,
    amenities: ["朝食付き", "大浴場", "眺望"],
    imageLabel: "River",
  },
  {
    id: "room-double-urban",
    name: "モデレートダブル",
    type: "double",
    capacity: 2,
    pricePerNight: 16900,
    totalRooms: 6,
    amenities: ["駅近", "レイトチェックアウト", "ジム"],
    imageLabel: "Urban",
  },
  {
    id: "room-suite-urban",
    name: "プレミアスイート",
    type: "suite",
    capacity: 4,
    pricePerNight: 42800,
    totalRooms: 2,
    amenities: ["高層階", "ラウンジ", "キッチン"],
    imageLabel: "Suite",
  },
];
