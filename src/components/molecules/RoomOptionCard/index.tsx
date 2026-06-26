"use client";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import type { AvailableRoom } from "@/types/reservation";
import { formatCurrency } from "@/utils/formatting";

type RoomOptionCardProps = {
  isSelected: boolean;
  room: AvailableRoom;
  onSelect: (roomId: string) => void;
};

export default function RoomOptionCard({ isSelected, onSelect, room }: RoomOptionCardProps) {
  return (
    <article
      className={`rounded-lg border bg-white p-5 shadow-sm transition ${
        isSelected ? "border-ocean ring-2 ring-teal-100" : "border-slate-200"
      }`}
    >
      <div className="mb-4 flex h-32 items-end rounded-md bg-[linear-gradient(135deg,#0f766e,#f59e0b)] p-4 text-white">
        <span className="text-sm font-bold">{room.imageLabel}</span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">{room.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            定員 {room.capacity}名 / 残り {room.availableCount}室
          </p>
        </div>
        <p className="text-right font-bold">
          {formatCurrency(room.totalPrice)}
          <span className="block text-xs font-semibold text-slate-500">{room.nights}泊合計</span>
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {room.amenities.map((amenity) => (
          <Badge key={amenity}>{amenity}</Badge>
        ))}
      </div>
      <Button
        className="mt-5 w-full"
        onClick={() => onSelect(room.id)}
        variant={isSelected ? "primary" : "secondary"}
      >
        {isSelected ? "選択中" : "この部屋を選択"}
      </Button>
    </article>
  );
}
