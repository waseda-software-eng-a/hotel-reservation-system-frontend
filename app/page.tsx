const hotels = [
  {
    name: "Waseda Garden Hotel",
    area: "早稲田",
    price: "12,800",
    rating: "4.7",
    tags: ["駅近", "朝食付き", "Wi-Fi"],
  },
  {
    name: "Tokyo Riverside Inn",
    area: "神楽坂",
    price: "15,400",
    rating: "4.5",
    tags: ["大浴場", "禁煙", "家族向け"],
  },
  {
    name: "Urban Stay Shinjuku",
    area: "新宿",
    price: "18,900",
    rating: "4.8",
    tags: ["高層階", "レイトチェックアウト", "ジム"],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-mist text-ink">
      <header className="border-b border-slate-200 bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a className="text-xl font-bold tracking-normal" href="#">
            Hotel Stay
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#search">ホテル検索</a>
            <a href="#hotels">おすすめ</a>
            <a href="#flow">予約の流れ</a>
          </nav>
          <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
            ログイン
          </button>
        </div>
      </header>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
          <div>
            <p className="mb-3 text-sm font-semibold text-ocean">
              Simple hotel booking
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-normal md:text-5xl">
              目的地と日程から、泊まりたいホテルをすぐに予約
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              空室検索、料金比較、予約確認までをまとめたユーザー向けホテル予約画面の雛形です。
            </p>
          </div>

          <section
            id="search"
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
          >
            <h2 className="text-lg font-bold">宿泊条件を検索</h2>
            <form className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                目的地
                <input
                  className="rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-ocean"
                  placeholder="例: 新宿、早稲田、京都"
                  type="text"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  チェックイン
                  <input
                    className="rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-ocean"
                    type="date"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  チェックアウト
                  <input
                    className="rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-ocean"
                    type="date"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  人数
                  <select className="rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-ocean">
                    <option>1名</option>
                    <option>2名</option>
                    <option>3名</option>
                    <option>4名以上</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  部屋数
                  <select className="rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-ocean">
                    <option>1部屋</option>
                    <option>2部屋</option>
                    <option>3部屋</option>
                  </select>
                </label>
              </div>
              <button className="mt-2 rounded-md bg-ocean px-4 py-3 font-bold text-white">
                空室を検索
              </button>
            </form>
          </section>
        </div>
      </section>

      <section id="hotels" className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-ocean">Recommended</p>
            <h2 className="mt-1 text-2xl font-bold">おすすめホテル</h2>
          </div>
          <a className="text-sm font-semibold text-ocean" href="#">
            すべて見る
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {hotels.map((hotel) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={hotel.name}
            >
              <div className="mb-4 h-36 rounded-md bg-[linear-gradient(135deg,#0f766e,#f59e0b)]" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{hotel.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{hotel.area}</p>
                </div>
                <span className="rounded-md bg-amber-100 px-2 py-1 text-sm font-bold text-amber-700">
                  {hotel.rating}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {hotel.tags.map((tag) => (
                  <span
                    className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between">
                <p className="font-bold">
                  <span className="text-sm text-slate-500">1泊 </span>
                  ¥{hotel.price}
                </p>
                <button className="rounded-md border border-ocean px-3 py-2 text-sm font-bold text-ocean">
                  詳細
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="flow" className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="text-2xl font-bold">予約の流れ</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["条件検索", "ホテル選択", "予約確定"].map((step, index) => (
              <div className="rounded-lg border border-slate-200 p-5" key={step}>
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-bold">{step}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  必要な情報を入力し、空室と料金を確認して予約へ進みます。
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
