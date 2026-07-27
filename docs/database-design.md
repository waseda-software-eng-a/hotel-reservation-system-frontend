# テーブル設計

## 使用する型

| 型名                 | 値                                                          | 説明                       |
| -------------------- | ----------------------------------------------------------- | -------------------------- |
| `room_kind`          | `single`, `double`, `twin`, `suite`                         | 客室タイプの分類           |
| `bed_kind`           | `single`, `double`, `twin`                                  | ベッドの分類               |
| `meal_type`          | `room_only`, `breakfast`, `half_board`                      | プランに含まれる食事の分類 |
| `payment_method`     | `onsite`, `web`                                             | 支払方法                   |
| `reservation_status` | `pending`, `confirmed`, `cancelled`, `completed`, `no_show` | 予約状態                   |
| `chat_sender`        | `guest`, `hotel`                                            | チャットの送信者           |

## `room_types`

客室タイプと、その客室タイプに共通する情報を管理する。

| カラム名         | 型              | 説明                             |
| ---------------- | --------------- | -------------------------------- |
| `id`             | `uuid`          | 客室タイプID                     |
| `code`           | `text`          | 客室タイプを識別する一意なコード |
| `name`           | `text`          | 客室タイプ名                     |
| `room_kind`      | `room_kind`     | 客室の分類                       |
| `bed_kind`       | `bed_kind`      | ベッドの分類                     |
| `max_occupancy`  | `smallint`      | 1室あたりの最大宿泊人数          |
| `total_rooms`    | `smallint`      | この客室タイプの総室数           |
| `base_price_yen` | `integer`       | 1室1泊あたりの基本料金（円）     |
| `description`    | `text`          | 客室の説明                       |
| `wing`           | `text`          | 客室がある棟の表示名             |
| `floor_label`    | `text`          | 客室がある階の表示名             |
| `size_sqm`       | `numeric(5, 2)` | 客室面積（平方メートル）         |
| `image_path`     | `text`          | 客室画像のパス                   |
| `created_at`     | `timestamptz`   | 作成日時                         |
| `updated_at`     | `timestamptz`   | 更新日時                         |

## `amenities`

管理画面から追加・編集できるアメニティのマスタを管理する。

| カラム名        | 型            | 説明                             |
| --------------- | ------------- | -------------------------------- |
| `id`            | `uuid`        | アメニティID                     |
| `code`          | `text`        | アメニティを識別する一意なコード |
| `name`          | `text`        | アメニティの表示名               |
| `category`      | `text`        | 設備、眺望、サービスなどの分類   |
| `display_order` | `integer`     | 表示順                           |
| `created_at`    | `timestamptz` | 作成日時                         |
| `updated_at`    | `timestamptz` | 更新日時                         |

## `room_type_amenities`

客室タイプに設定されたアメニティを管理する。

| カラム名       | 型     | 説明         |
| -------------- | ------ | ------------ |
| `room_type_id` | `uuid` | 客室タイプID |
| `amenity_id`   | `uuid` | アメニティID |

## `plans`

宿泊プランと、プランに共通する料金・利用条件を管理する。

| カラム名              | 型                 | 説明                             |
| --------------------- | ------------------ | -------------------------------- |
| `id`                  | `uuid`             | 宿泊プランID                     |
| `code`                | `text`             | 宿泊プランを識別する一意なコード |
| `name`                | `text`             | 宿泊プラン名                     |
| `summary`             | `text`             | 宿泊プランの概要                 |
| `meal_type`           | `meal_type`        | プランに含まれる食事の分類       |
| `payment_methods`     | `payment_method[]` | 利用可能な支払方法               |
| `check_in_time`       | `time`             | チェックイン時刻                 |
| `check_out_time`      | `time`             | チェックアウト時刻               |
| `adult_surcharge_yen` | `integer`          | 大人1人1泊あたりの追加料金（円） |
| `cancellation_policy` | `text`             | キャンセル条件                   |
| `tags`                | `text[]`           | 画面表示用のタグ                 |
| `image_path`          | `text`             | プラン画像のパス                 |
| `display_order`       | `integer`          | 表示順                           |
| `created_at`          | `timestamptz`      | 作成日時                         |
| `updated_at`          | `timestamptz`      | 更新日時                         |

## `plan_room_types`

宿泊プランで選択できる客室タイプを管理する。

| カラム名       | 型     | 説明         |
| -------------- | ------ | ------------ |
| `plan_id`      | `uuid` | 宿泊プランID |
| `room_type_id` | `uuid` | 客室タイプID |

## `reservations`

予約内容、代表者の連絡先、予約時点の料金と利用条件を管理する。

| カラム名                       | 型                   | 説明                                       |
| ------------------------------ | -------------------- | ------------------------------------------ |
| `id`                           | `uuid`               | 予約ID                                     |
| `confirmation_code`            | `text`               | 利用者に提示する一意な予約番号             |
| `plan_id`                      | `uuid`               | 予約した宿泊プランID                       |
| `room_type_id`                 | `uuid`               | 予約した客室タイプID                       |
| `status`                       | `reservation_status` | 予約状態                                   |
| `check_in_date`                | `date`               | チェックイン日                             |
| `check_out_date`               | `date`               | チェックアウト日                           |
| `adults`                       | `smallint`           | 大人人数                                   |
| `children`                     | `smallint`           | 子ども人数                                 |
| `room_count`                   | `smallint`           | 予約室数                                   |
| `representative_email`         | `text`               | 代表者のメールアドレス                     |
| `representative_phone`         | `text`               | 代表者の電話番号                           |
| `representative_postal_code`   | `text`               | 代表者の郵便番号                           |
| `representative_address`       | `text`               | 代表者の住所                               |
| `payment_method`               | `payment_method`     | 選択された支払方法                         |
| `booked_room_price_yen`        | `integer`            | 予約時点の1室1泊あたりの料金（円）         |
| `booked_adult_surcharge_yen`   | `integer`            | 予約時点の大人1人1泊あたりの追加料金（円） |
| `cancellation_policy_snapshot` | `text`               | 予約時点のキャンセル条件                   |
| `terms_accepted_at`            | `timestamptz`        | 利用条件への同意日時                       |
| `cancelled_at`                 | `timestamptz`        | キャンセル日時                             |
| `created_at`                   | `timestamptz`        | 作成日時                                   |
| `updated_at`                   | `timestamptz`        | 更新日時                                   |

## `reservation_guests`

予約に含まれる宿泊者全員の氏名と代表者を管理する。

| カラム名            | 型            | 説明                     |
| ------------------- | ------------- | ------------------------ |
| `id`                | `uuid`        | 宿泊者ID                 |
| `reservation_id`    | `uuid`        | 予約ID                   |
| `full_name`         | `text`        | 宿泊者氏名               |
| `is_representative` | `boolean`     | 代表者であるか           |
| `sort_order`        | `smallint`    | 予約内での宿泊者の表示順 |
| `created_at`        | `timestamptz` | 作成日時                 |

## `chat_threads`

お客様とホテルの問い合わせチャットを、予約番号単位で管理する。

| カラム名             | 型            | 説明                               |
| -------------------- | ------------- | ---------------------------------- |
| `id`                 | `uuid`        | チャットスレッドID                 |
| `confirmation_code`  | `text`        | 予約番号（一意）                   |
| `guest_email`        | `text`        | お客様のメールアドレス             |
| `last_read_at_guest` | `timestamptz` | お客様側の最終既読日時             |
| `last_read_at_hotel` | `timestamptz` | ホテル側の最終既読日時             |
| `created_at`         | `timestamptz` | 作成日時                           |
| `updated_at`         | `timestamptz` | 更新日時（最終メッセージ送受信時） |

## `chat_messages`

チャットスレッド内の個別メッセージを管理する。

| カラム名     | 型            | 説明                         |
| ------------ | ------------- | ---------------------------- |
| `id`         | `uuid`        | メッセージID                 |
| `thread_id`  | `uuid`        | チャットスレッドID           |
| `sender`     | `chat_sender` | 送信者（`guest` / `hotel`）  |
| `body`       | `text`        | メッセージ本文（最大1000文字） |
| `created_at` | `timestamptz` | 送信日時                     |

## 予約処理

| DB関数               | 用途                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| `create_reservation` | 客室をロックし、在庫確認後に予約と宿泊者を登録する                     |
| `update_reservation` | 変更前後の客室をロックし、現在の予約を除いて在庫確認後に予約を更新する |
| `cancel_reservation` | 予約をロックし、予約状態をキャンセル済みに更新する                     |

予約作成と変更は、客室タイプの行ロックから在庫確認、保存までを同一トランザクションで実行する。これにより、同じ客室に対する同時リクエストでも総客室数を超えた予約を防止する。

チャットは現状アプリ内メモリで動作し、上記テーブルは DB 連携時に利用する。
