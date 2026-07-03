"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  AvailabilitySearchParams,
  AvailablePlan,
  PaymentMethod,
  RepresentativeInfo,
  ReservationDetails,
} from "@/types/reservation";
import {
  cancelReservation,
  findReservation,
  searchAvailablePlans,
  updateReservation,
} from "@/lib/reservationApi";
import { formatCurrency } from "@/utils/formatting";
import { formatStayDate } from "@/utils/reservationQuery";

type EditState = AvailabilitySearchParams & {
  planId: string;
  roomId: string;
  paymentMethod: PaymentMethod;
  representativeInfo: RepresentativeInfo;
  guestNames: string[];
};

const inputClass =
  "min-h-12 w-full border border-stone-300 bg-white px-4 text-sm outline-none transition focus:border-[#856c34] focus:ring-1 focus:ring-[#856c34]";
const labelClass = "grid gap-2 text-sm font-semibold text-stone-700";
const statusLabels: Record<ReservationDetails["status"], string> = {
  pending: "確認待ち",
  confirmed: "予約確定",
  cancelled: "キャンセル済み",
  completed: "宿泊済み",
  no_show: "未到着",
};

function toEditState(reservation: ReservationDetails): EditState {
  return {
    planId: reservation.planId,
    roomId: reservation.roomId,
    checkInDate: reservation.checkInDate,
    checkOutDate: reservation.checkOutDate,
    adults: reservation.adults,
    children: reservation.children,
    roomCount: reservation.roomCount,
    paymentMethod: reservation.paymentMethod,
    representativeInfo: { ...reservation.representativeInfo },
    guestNames: [...reservation.guestNames],
  };
}

function ManagementHeader() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex min-h-24 max-w-6xl items-center justify-between px-5">
        <Link className="font-serif text-lg tracking-[0.18em] text-[#1a1a1a]" href="/">
          HOTEL WASERIKO
        </Link>
        <Link className="text-sm text-[#856c34] underline underline-offset-4" href="/">
          ホテルサイトへ戻る
        </Link>
      </div>
    </header>
  );
}

export default function ReservationManagementPageTemplate() {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [email, setEmail] = useState("");
  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [availablePlans, setAvailablePlans] = useState<AvailablePlan[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleLookup(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      const found = await findReservation(confirmationCode, email);
      setReservation(found);
      setEdit(toEditState(found));
      setIsEditing(false);
      setAvailablePlans([]);
    } catch (lookupError) {
      setReservation(null);
      setError(lookupError instanceof Error ? lookupError.message : "予約を確認できませんでした。");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAvailabilitySearch() {
    if (!edit) return;
    setError("");
    setIsSearching(true);
    try {
      const plans = await searchAvailablePlans({
        checkInDate: edit.checkInDate,
        checkOutDate: edit.checkOutDate,
        adults: edit.adults,
        children: edit.children,
        roomCount: edit.roomCount,
      });
      setAvailablePlans(plans);
      if (plans.length === 0) setError("変更後の条件で予約できるプランがありません。");
    } catch (searchError) {
      setAvailablePlans([]);
      setError(searchError instanceof Error ? searchError.message : "空室検索に失敗しました。");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleUpdate() {
    if (!edit || !reservation) return;
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      const updated = await updateReservation({
        ...edit,
        confirmationCode: reservation.id,
        email,
        termsAccepted: true,
      });
      setReservation(updated);
      setEdit(toEditState(updated));
      setIsEditing(false);
      setAvailablePlans([]);
      setEmail(updated.representativeInfo.email);
      setMessage("予約内容を変更しました。");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "予約の変更に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancel() {
    if (!reservation) return;
    if (!window.confirm("この予約をキャンセルします。よろしいですか？")) return;
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      const cancelled = await cancelReservation(reservation.id, email);
      setReservation(cancelled);
      setEdit(toEditState(cancelled));
      setIsEditing(false);
      setMessage("予約をキャンセルしました。");
    } catch (cancelError) {
      setError(
        cancelError instanceof Error ? cancelError.message : "予約のキャンセルに失敗しました。",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function selectRoom(plan: AvailablePlan, roomId: string) {
    if (!edit) return;
    setEdit({
      ...edit,
      planId: plan.id,
      roomId,
      paymentMethod: plan.paymentMethods[0],
    });
  }

  return (
    <main className="min-h-screen bg-[#f6f5f2] text-[#1a1a1a]">
      <ManagementHeader />
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <p className="text-xs tracking-[0.24em] text-[#856c34]">RESERVATION</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">ご予約の確認・変更</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600">
            予約完了時に発行された予約番号と、代表者のメールアドレスを入力してください。
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        {(error || message) && (
          <p
            className={`mb-7 border px-5 py-4 text-sm font-semibold ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-[#ccbe9f] bg-[#f7f3e9] text-[#6e592c]"
            }`}
          >
            {error || message}
          </p>
        )}

        <form
          className="grid gap-5 border border-stone-200 bg-white p-6 shadow-[0_8px_30px_rgba(26,21,10,0.05)] md:grid-cols-[1fr_1fr_auto] md:items-end md:p-8"
          onSubmit={handleLookup}
        >
          <label className={labelClass}>
            予約番号
            <input
              className={inputClass}
              onChange={(event) => setConfirmationCode(event.target.value)}
              placeholder="WH-XXXXXXXXXX"
              required
              value={confirmationCode}
            />
          </label>
          <label className={labelClass}>
            メールアドレス
            <input
              className={inputClass}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="guest@example.com"
              required
              type="email"
              value={email}
            />
          </label>
          <button
            className="min-h-12 bg-[#856c34] px-8 text-sm font-bold text-white transition hover:bg-[#755f2d] disabled:opacity-50"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "確認中…" : "予約を確認"}
          </button>
        </form>

        {reservation && edit && (
          <section className="mt-10 border border-stone-200 bg-white">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 px-6 py-6 md:px-8">
              <div>
                <p className="text-xs text-stone-500">予約番号</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold">{reservation.id}</h2>
              </div>
              <span
                className={`px-4 py-2 text-xs font-bold ${
                  reservation.status === "cancelled"
                    ? "bg-stone-200 text-stone-600"
                    : "bg-[#f2eee5] text-[#6e592c]"
                }`}
              >
                {statusLabels[reservation.status]}
              </span>
            </div>

            {!isEditing ? (
              <div className="p-6 md:p-8">
                <dl className="grid gap-x-10 gap-y-6 md:grid-cols-2">
                  {[
                    ["宿泊プラン", reservation.planName],
                    ["客室", reservation.roomName],
                    [
                      "宿泊日",
                      `${formatStayDate(reservation.checkInDate)}〜${formatStayDate(reservation.checkOutDate)}`,
                    ],
                    [
                      "人数・客室",
                      `大人${reservation.adults}名 子ども${reservation.children}名・${reservation.roomCount}室`,
                    ],
                    ["代表者メール", reservation.representativeInfo.email],
                    ["代表者電話番号", reservation.representativeInfo.phone],
                    [
                      "住所",
                      `〒${reservation.representativeInfo.postalCode} ${reservation.representativeInfo.address}`,
                    ],
                    ["宿泊者", reservation.guestNames.join("、")],
                  ].map(([label, value]) => (
                    <div className="border-b border-stone-200 pb-4" key={label}>
                      <dt className="text-xs text-stone-500">{label}</dt>
                      <dd className="mt-2 text-sm font-semibold leading-6">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-8 border-t border-stone-200 pt-6 text-right">
                  <p className="text-xs text-stone-500">合計・税サービス料込</p>
                  <p className="mt-1 font-serif text-2xl font-semibold">
                    {formatCurrency(reservation.totalPrice)}
                  </p>
                </div>
                <details className="mt-6 border-t border-stone-200 pt-5 text-sm text-stone-600">
                  <summary className="cursor-pointer text-[#856c34]">キャンセルポリシー</summary>
                  <p className="mt-3 leading-7">{reservation.cancellationPolicy}</p>
                </details>
                {reservation.status === "confirmed" && (
                  <div className="mt-8 flex flex-wrap justify-end gap-3">
                    <button
                      className="min-h-12 border border-red-300 px-6 text-sm font-bold text-red-700"
                      disabled={isLoading}
                      onClick={handleCancel}
                      type="button"
                    >
                      予約をキャンセル
                    </button>
                    <button
                      className="min-h-12 bg-[#856c34] px-7 text-sm font-bold text-white"
                      onClick={() => setIsEditing(true)}
                      type="button"
                    >
                      予約内容を変更
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 md:p-8">
                <h3 className="font-serif text-xl font-semibold">宿泊条件</h3>
                <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
                  <label className={labelClass}>
                    チェックイン
                    <input
                      className={inputClass}
                      onChange={(event) => setEdit({ ...edit, checkInDate: event.target.value })}
                      type="date"
                      value={edit.checkInDate}
                    />
                  </label>
                  <label className={labelClass}>
                    チェックアウト
                    <input
                      className={inputClass}
                      onChange={(event) => setEdit({ ...edit, checkOutDate: event.target.value })}
                      type="date"
                      value={edit.checkOutDate}
                    />
                  </label>
                  {(["adults", "children", "roomCount"] as const).map((field) => (
                    <label className={labelClass} key={field}>
                      {field === "adults" ? "大人" : field === "children" ? "子ども" : "客室数"}
                      <input
                        className={inputClass}
                        min={field === "children" ? 0 : 1}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          const next = { ...edit, [field]: value };
                          const nextGuestCount = next.adults + next.children;
                          setEdit({
                            ...next,
                            guestNames: Array.from(
                              { length: nextGuestCount },
                              (_, index) => edit.guestNames[index] ?? "",
                            ),
                          });
                        }}
                        type="number"
                        value={edit[field]}
                      />
                    </label>
                  ))}
                </div>
                <button
                  className="mt-5 min-h-12 border border-[#856c34] px-6 text-sm font-bold text-[#856c34] disabled:opacity-50"
                  disabled={isSearching}
                  onClick={handleAvailabilitySearch}
                  type="button"
                >
                  {isSearching ? "検索中…" : "変更後の空室を検索"}
                </button>

                <div className="mt-8 border border-[#ccbe9f] bg-[#faf8f2] p-5 text-sm">
                  <p className="text-xs text-stone-500">選択中</p>
                  <p className="mt-2 font-semibold">
                    {availablePlans.find((plan) => plan.id === edit.planId)?.name ??
                      reservation.planName}
                    ／
                    {availablePlans
                      .flatMap((plan) => plan.rooms)
                      .find((room) => room.id === edit.roomId)?.name ?? reservation.roomName}
                  </p>
                </div>

                {availablePlans.length > 0 && (
                  <div className="mt-5 grid gap-4">
                    {availablePlans.map((plan) => (
                      <article className="border border-stone-200 p-5" key={plan.id}>
                        <h4 className="font-serif text-lg font-semibold">{plan.name}</h4>
                        <div className="mt-4 grid gap-3">
                          {plan.rooms.map((room) => (
                            <label
                              className={`flex cursor-pointer flex-wrap items-center justify-between gap-4 border p-4 ${
                                edit.planId === plan.id && edit.roomId === room.id
                                  ? "border-[#856c34] bg-[#faf8f2]"
                                  : "border-stone-200"
                              }`}
                              key={room.id}
                            >
                              <span className="flex items-center gap-3">
                                <input
                                  checked={edit.planId === plan.id && edit.roomId === room.id}
                                  name="room"
                                  onChange={() => selectRoom(plan, room.id)}
                                  type="radio"
                                />
                                <span>
                                  <span className="block font-semibold">{room.name}</span>
                                  <span className="mt-1 block text-xs text-stone-500">
                                    残り{room.availableCount}室
                                  </span>
                                </span>
                              </span>
                              <span className="font-serif text-lg font-semibold">
                                {formatCurrency(room.totalPrice)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                <h3 className="mt-10 border-t border-stone-200 pt-8 font-serif text-xl font-semibold">
                  代表者・宿泊者情報
                </h3>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {(
                    [
                      ["email", "メールアドレス", "email"],
                      ["phone", "電話番号", "tel"],
                      ["postalCode", "郵便番号", "text"],
                      ["address", "住所", "text"],
                    ] as const
                  ).map(([field, label, type]) => (
                    <label className={labelClass} key={field}>
                      {label}
                      <input
                        className={inputClass}
                        onChange={(event) =>
                          setEdit({
                            ...edit,
                            representativeInfo: {
                              ...edit.representativeInfo,
                              [field]: event.target.value,
                            },
                          })
                        }
                        type={type}
                        value={edit.representativeInfo[field]}
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {edit.guestNames.map((name, index) => (
                    <label className={labelClass} key={index}>
                      宿泊者 {index + 1}
                      <input
                        className={inputClass}
                        onChange={(event) => {
                          const guestNames = [...edit.guestNames];
                          guestNames[index] = event.target.value;
                          setEdit({ ...edit, guestNames });
                        }}
                        value={name}
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-9 flex flex-wrap justify-end gap-3 border-t border-stone-200 pt-6">
                  <button
                    className="min-h-12 border border-stone-300 px-6 text-sm font-bold"
                    onClick={() => {
                      setEdit(toEditState(reservation));
                      setAvailablePlans([]);
                      setIsEditing(false);
                      setError("");
                    }}
                    type="button"
                  >
                    変更をやめる
                  </button>
                  <button
                    className="min-h-12 bg-[#856c34] px-8 text-sm font-bold text-white disabled:opacity-50"
                    disabled={isLoading}
                    onClick={handleUpdate}
                    type="button"
                  >
                    {isLoading ? "変更中…" : "この内容で変更する"}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
