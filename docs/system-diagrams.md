# ホテル予約システム UML 図

このドキュメントは、現在のユーザー向け予約機能を対象とする。Mermaid に専用記法がないユースケース図とコラボレーション図は、`flowchart` を使って UML の要素とメッセージ順を表現している。

## クラス図

```mermaid
classDiagram
    direction LR

    class AvailabilitySearchParams["空室検索条件"] {
        +string チェックイン日
        +string チェックアウト日
        +number 大人人数
        +number 子ども人数
        +number 客室数
    }

    class RepresentativeInfo["代表者情報"] {
        +string メールアドレス
        +string 電話番号
        +string 郵便番号
        +string 住所
    }

    class ReservationDraft["予約入力情報"] {
        +string プランID
        +string 客室ID
        +string チェックイン日
        +string チェックアウト日
        +number 大人人数
        +number 子ども人数
        +number 客室数
        +PaymentMethod 支払方法
        +boolean 利用条件同意済み
        +string[] 宿泊者氏名
    }

    class Reservation["予約"] {
        +string 予約ID
        +string プランID
        +string 客室ID
        +string 予約状態
        +string 作成日時
        +number 合計金額
    }

    class Plan["宿泊プラン"] {
        +string プランID
        +string プラン名
        +MealType 食事種別
        +PaymentMethod[] 利用可能な支払方法
        +string キャンセルポリシー
    }

    class AvailablePlan["予約可能プラン"] {
        +number 最低合計金額
    }

    class Room["客室"] {
        +string 客室ID
        +string 客室名
        +RoomType 客室種別
        +number 定員
        +string[] アメニティ
    }

    class AvailableRoom["予約可能客室"] {
        +number 空室数
        +number 宿泊数
        +number 合計金額
    }

    class AvailabilityService["空室検索サービス"] {
        -AvailabilityDao 空室検索DAO
        +空室を検索(検索条件) AvailablePlan[]
    }

    class ReservationService["予約サービス"] {
        -ReservationDao 予約DAO
        -AvailabilityDao 空室検索DAO
        +予約を作成(予約入力情報) Reservation
        +予約を照会(認証情報) ReservationDetails
        +予約を変更(変更内容) ReservationDetails
        +予約をキャンセル(認証情報) ReservationDetails
    }

    class AvailabilityDao["空室検索DAO"] {
        <<インターフェース>>
        +予約可能プランを検索(検索条件) AvailablePlan[]
    }

    class ReservationDao["予約DAO"] {
        <<インターフェース>>
        +予約を登録(予約入力情報) Reservation
        +予約を照会(認証情報) ReservationDetails
        +予約を更新(変更内容) ReservationDetails
        +予約をキャンセル(認証情報) ReservationDetails
    }

    class SupabaseAvailabilityDao["Supabase空室検索DAO"] {
        +予約可能プランを検索(検索条件) AvailablePlan[]
    }

    class SupabaseReservationDao["Supabase予約DAO"] {
        +予約を登録(予約入力情報) Reservation
        +予約を照会(認証情報) ReservationDetails
        +予約を更新(変更内容) ReservationDetails
        +予約をキャンセル(認証情報) ReservationDetails
    }

    AvailablePlan --|> Plan
    AvailableRoom --|> Room
    AvailablePlan "1" *-- "1..*" AvailableRoom : 客室
    ReservationDraft "1" *-- "1" RepresentativeInfo
    Reservation "1" *-- "1" RepresentativeInfo
    ReservationDraft ..> AvailabilitySearchParams : 宿泊条件を含む
    AvailabilityService --> AvailabilityDao
    ReservationService --> AvailabilityDao : 在庫を再確認
    ReservationService --> ReservationDao
    SupabaseAvailabilityDao ..|> AvailabilityDao
    SupabaseReservationDao ..|> ReservationDao
    AvailabilityDao ..> AvailabilitySearchParams
    AvailabilityDao ..> AvailablePlan
    ReservationDao ..> ReservationDraft
    ReservationDao ..> Reservation
```

## アクティビティ図

```mermaid
flowchart TD
    start((開始)) --> open[予約フォームを開く]
    open --> input[宿泊日・人数・客室数を入力]
    input --> validateSearch{検索条件は妥当か}
    validateSearch -- いいえ --> searchError[入力エラーを表示]
    searchError --> input
    validateSearch -- はい --> search[空室と宿泊プランを検索]
    search --> found{利用可能なプランがあるか}
    found -- いいえ --> noPlans[該当プランなしを表示]
    noPlans --> input
    found -- はい --> list[プラン一覧を表示]
    list --> filter[食事条件で絞込・料金順で並替]
    filter --> select[プランと客室を選択]
    select --> details[代表者情報と宿泊者全員の氏名を入力]
    details --> accept{利用条件に同意したか}
    accept -- いいえ --> consentError[同意が必要と表示]
    consentError --> details
    accept -- はい --> submit[予約を送信]
    submit --> validateBooking{入力内容は妥当か}
    validateBooking -- いいえ --> bookingError[入力エラーを表示]
    bookingError --> details
    validateBooking -- はい --> recheck[プラン・客室の在庫を再確認]
    recheck --> available{現在も予約可能か}
    available -- いいえ --> unavailable[予約不可を表示]
    unavailable --> list
    available -- はい --> save[予約と宿泊者情報を保存]
    save --> complete[予約番号・合計金額を表示]
    complete --> finish((終了))
```

## ユースケース図

```mermaid
flowchart LR
    guest["👤 宿泊者"]

    subgraph system[ホテル予約システム]
        search((空室・宿泊プランを検索する))
        change((検索条件を変更する))
        browse((プランを閲覧する))
        filter((プランを絞込・並替する))
        choose((プラン・客室を選択する))
        enter((代表者・宿泊者情報を入力する))
        agree((利用条件に同意する))
        reserve((予約を確定する))
        confirm((予約結果を確認する))

        change -.->|extend| search
        filter -.->|extend| browse
        choose -.->|include| browse
        reserve -.->|include| enter
        reserve -.->|include| agree
        reserve -.->|include| choose
        confirm -.->|extend| reserve
    end

    guest --- search
    guest --- change
    guest --- browse
    guest --- filter
    guest --- choose
    guest --- enter
    guest --- agree
    guest --- reserve
    guest --- confirm
```

## コラボレーション図

予約確定時に、各オブジェクト間で送られるメッセージを番号付きで示す。

```mermaid
flowchart LR
    guest["宿泊者"]
    ui["予約画面"]
    api["予約受付API"]
    service["予約サービス"]
    availability["空室検索DAO"]
    reservation["予約DAO"]
    db[(予約データベース)]

    guest -->|"1: 予約内容・顧客情報を入力"| ui
    ui -->|"2: 予約入力情報を送信"| api
    api -->|"3: 予約を作成"| service
    service -->|"4: 予約可能プランを検索"| availability
    availability -->|"4.1: 客室・プラン・既存予約を照会"| db
    db -.->|"4.2: 空室と料金"| availability
    availability -.->|"4.3: 予約可能プラン一覧"| service
    service -->|"5: 予約を作成"| reservation
    reservation -->|"5.1: 予約をトランザクション登録"| db
    db -.->|"5.2: 予約レコード"| reservation
    reservation -.->|"5.3: 作成済み予約"| service
    service -.->|"6: 作成済み予約"| api
    api -.->|"7: 予約作成成功・予約情報"| ui
    ui -.->|"8: 予約番号・合計金額を表示"| guest
```
