import ReservationFlow from "@/components/organisms/ReservationFlow";

export default function ReservationPageTemplate() {
  return (
    <main className="min-h-screen bg-mist text-ink">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a className="text-xl font-bold tracking-normal" href="#">
            Hotel Stay
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#reservation">予約</a>
            <a href="#rooms">客室</a>
            <a href="#access">アクセス</a>
          </nav>
          <a className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" href="#reservation">
            予約する
          </a>
        </div>
      </header>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-14">
          <div>
            <p className="mb-3 text-sm font-semibold text-ocean">Hotel reservation</p>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-normal md:text-5xl">
              宿泊日を選んで、このホテルの空室を予約
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              空室検索、部屋選択、利用者情報入力までを API 経由で進める予約画面です。
            </p>
          </div>
          <div className="min-h-72 rounded-lg bg-[linear-gradient(135deg,#0f766e,#f59e0b)] p-6 text-white shadow-soft">
            <p className="text-sm font-bold">Waseda Garden Hotel</p>
            <p className="mt-24 max-w-sm text-2xl font-bold leading-tight">
              静かな客室と駅近アクセスで、出張にも観光にも使いやすい滞在を。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10" id="reservation">
        <ReservationFlow />
      </section>
    </main>
  );
}
