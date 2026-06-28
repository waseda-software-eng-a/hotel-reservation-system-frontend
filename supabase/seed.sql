insert into public.room_types (
  id,
  code,
  name,
  room_kind,
  bed_kind,
  max_occupancy,
  total_rooms,
  base_price_yen,
  description,
  wing,
  floor_label,
  size_sqm,
  image_path
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'standard-single',
    'スタンダードシングル',
    'single',
    'single',
    1,
    8,
    12800,
    '機能性を重視した、ビジネス利用にも使いやすいコンパクトな客室です。',
    '本館',
    '7〜10階',
    22,
    '/images/waseriko-hotel.png'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'riverside-twin',
    'リバーサイドツイン',
    'twin',
    'twin',
    2,
    5,
    18400,
    '大きな窓から街の景色を望む、ゆとりあるツインルームです。',
    '本館',
    '11〜14階',
    38,
    '/images/waseriko-hotel.png'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'moderate-double',
    'モデレートダブル',
    'double',
    'double',
    2,
    6,
    16900,
    'クイーンサイズベッドを備えた、落ち着いた内装のダブルルームです。',
    'タワー館',
    '8〜15階',
    30,
    '/images/waseriko-hotel.png'
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'premier-suite',
    'プレミアスイート',
    'suite',
    'twin',
    4,
    2,
    42800,
    '独立したリビングと上質なバスルームを備えた高層階スイートです。',
    'タワー館',
    '16〜18階',
    68,
    '/images/waseriko-hotel.png'
  )
on conflict (code) do update
set
  name = excluded.name,
  room_kind = excluded.room_kind,
  bed_kind = excluded.bed_kind,
  max_occupancy = excluded.max_occupancy,
  total_rooms = excluded.total_rooms,
  base_price_yen = excluded.base_price_yen,
  description = excluded.description,
  wing = excluded.wing,
  floor_label = excluded.floor_label,
  size_sqm = excluded.size_sqm,
  image_path = excluded.image_path,
  updated_at = now();

insert into public.amenities (id, code, name, category, display_order)
values
  ('20000000-0000-4000-8000-000000000001', 'wifi', '無料Wi-Fi', '設備', 10),
  ('20000000-0000-4000-8000-000000000002', 'non-smoking', '禁煙', '客室条件', 20),
  ('20000000-0000-4000-8000-000000000003', 'desk', 'デスク', '設備', 30),
  ('20000000-0000-4000-8000-000000000004', 'view', '眺望', '眺望', 40),
  ('20000000-0000-4000-8000-000000000005', 'public-bath', '大浴場', '館内施設', 50),
  ('20000000-0000-4000-8000-000000000006', 'near-station', '駅近', '立地', 60),
  ('20000000-0000-4000-8000-000000000007', 'gym', 'ジム', '館内施設', 70),
  ('20000000-0000-4000-8000-000000000008', 'high-floor', '高層階', '客室条件', 80),
  ('20000000-0000-4000-8000-000000000009', 'lounge', 'ラウンジ', '館内施設', 90),
  ('20000000-0000-4000-8000-000000000010', 'kitchen', 'キッチン', '設備', 100)
on conflict (code) do update
set
  name = excluded.name,
  category = excluded.category,
  display_order = excluded.display_order,
  updated_at = now();

insert into public.room_type_amenities (room_type_id, amenity_id)
select room_types.id, amenities.id
from (
  values
    ('standard-single', 'wifi'),
    ('standard-single', 'non-smoking'),
    ('standard-single', 'desk'),
    ('riverside-twin', 'wifi'),
    ('riverside-twin', 'non-smoking'),
    ('riverside-twin', 'view'),
    ('riverside-twin', 'public-bath'),
    ('moderate-double', 'wifi'),
    ('moderate-double', 'non-smoking'),
    ('moderate-double', 'near-station'),
    ('moderate-double', 'gym'),
    ('premier-suite', 'wifi'),
    ('premier-suite', 'non-smoking'),
    ('premier-suite', 'high-floor'),
    ('premier-suite', 'lounge'),
    ('premier-suite', 'kitchen')
) as assignments (room_type_code, amenity_code)
join public.room_types on room_types.code = assignments.room_type_code
join public.amenities on amenities.code = assignments.amenity_code
on conflict (room_type_id, amenity_id) do nothing;

insert into public.plans (
  id,
  code,
  name,
  summary,
  meal_type,
  payment_methods,
  check_in_time,
  check_out_time,
  adult_surcharge_yen,
  cancellation_policy,
  tags,
  image_path,
  display_order
)
values
  (
    '30000000-0000-4000-8000-000000000001',
    'simple-stay',
    'シンプルステイ（室料のみ）',
    '時間に縛られず、ホテルでの滞在を自由に組み立てられる基本プランです。',
    'room_only',
    '{onsite,web}',
    '14:00',
    '12:00',
    0,
    '前日20%、当日80%、不泊100%のキャンセル料を申し受けます。',
    array['素泊まり', 'スタンダード'],
    '/images/waseriko-hotel.png',
    10
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    'breakfast-stay',
    '選べる朝食付きステイ',
    '和洋から選べる朝食と、ゆとりある12時チェックアウトが付いた宿泊プランです。',
    'breakfast',
    '{onsite,web}',
    '14:00',
    '12:00',
    3200,
    '前日20%、当日80%、不泊100%のキャンセル料を申し受けます。',
    array['朝食付き', 'レイトチェックアウト'],
    '/images/waseriko-hotel.png',
    20
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    'dining-stay',
    'ホテルダイニングを楽しむ夕朝食付きプラン',
    'ホテル自慢のディナーと朝食を組み合わせた、記念日にも適した2食付きプランです。',
    'half_board',
    '{web}',
    '14:00',
    '12:00',
    11800,
    '3日前20%、前日50%、当日100%のキャンセル料を申し受けます。',
    array['夕朝食付き', '記念日'],
    '/images/waseriko-hotel.png',
    30
  )
on conflict (code) do update
set
  name = excluded.name,
  summary = excluded.summary,
  meal_type = excluded.meal_type,
  payment_methods = excluded.payment_methods,
  check_in_time = excluded.check_in_time,
  check_out_time = excluded.check_out_time,
  adult_surcharge_yen = excluded.adult_surcharge_yen,
  cancellation_policy = excluded.cancellation_policy,
  tags = excluded.tags,
  image_path = excluded.image_path,
  display_order = excluded.display_order,
  updated_at = now();

insert into public.plan_room_types (plan_id, room_type_id)
select plans.id, room_types.id
from (
  values
    ('simple-stay', 'standard-single'),
    ('simple-stay', 'riverside-twin'),
    ('simple-stay', 'moderate-double'),
    ('simple-stay', 'premier-suite'),
    ('breakfast-stay', 'riverside-twin'),
    ('breakfast-stay', 'moderate-double'),
    ('breakfast-stay', 'premier-suite'),
    ('dining-stay', 'riverside-twin'),
    ('dining-stay', 'premier-suite')
) as assignments (plan_code, room_type_code)
join public.plans on plans.code = assignments.plan_code
join public.room_types on room_types.code = assignments.room_type_code
on conflict (plan_id, room_type_id) do nothing;
