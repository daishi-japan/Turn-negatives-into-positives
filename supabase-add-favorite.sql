-- conversions テーブルに is_favorite カラムを追加
alter table conversions add column is_favorite boolean not null default false;

-- お気に入り更新用の RLS ポリシー
create policy "Users can update own conversions"
  on conversions for update using (auth.uid() = user_id);
