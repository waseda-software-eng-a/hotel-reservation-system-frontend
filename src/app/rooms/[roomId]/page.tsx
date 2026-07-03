import { Suspense } from "react";
import RoomDetailsPageTemplate from "@/components/templates/RoomDetailsPageTemplate";

type RoomDetailsPageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function RoomDetailsPage({ params }: RoomDetailsPageProps) {
  const { roomId } = await params;

  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50" />}>
      <RoomDetailsPageTemplate roomId={roomId} />
    </Suspense>
  );
}
