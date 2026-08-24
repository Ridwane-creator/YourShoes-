-- ============================================
-- SneakStore — Espace vendeur (admin)
-- À coller dans SQL Editor > New query > Run
-- (à exécuter APRÈS supabase-schema.sql)
-- ============================================

-- Table profiles : étend auth.users avec un rôle
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text default 'buyer' check (role in ('buyer', 'admin')),
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Chacun peut voir son propre profil"
  on profiles for select
  using (auth.uid() = id);

create policy "Chacun peut modifier son propre profil"
  on profiles for update
  using (auth.uid() = id);

-- Création automatique d'un profil (role buyer par défaut) à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'buyer');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Fonction utilitaire : vérifie si l'utilisateur connecté est admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Policies d'écriture réservées à l'admin (produits + variantes)
create policy "Admin peut ajouter des produits"
  on products for insert
  with check (public.is_admin());

create policy "Admin peut modifier des produits"
  on products for update
  using (public.is_admin());

create policy "Admin peut supprimer des produits"
  on products for delete
  using (public.is_admin());

create policy "Admin peut gérer les variantes"
  on product_variants for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================
-- Storage : policies pour le bucket "product-images"
-- (crée d'abord le bucket manuellement, voir instructions plus bas)
-- ============================================

create policy "Images produits visibles publiquement"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admin peut uploader des images produits"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admin peut supprimer des images produits"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- ============================================
-- Après avoir exécuté ce script :
-- 1. Va dans Authentication > Users > Add user (create new user),
--    renseigne ton email et un mot de passe. Ça déclenche le trigger
--    ci-dessus qui crée automatiquement ta ligne dans `profiles`.
-- 2. Dans Table Editor > profiles, trouve cette ligne et passe `role`
--    de `buyer` à `admin` (le compte n'est pas admin par défaut, pour
--    la sécurité — un seul vendeur, donc une seule ligne à modifier).
-- 3. Connecte-toi sur le site via /admin/login avec cet email/mot de passe.
--
-- Pour les photos produits : va dans Storage > New bucket, nomme-le
-- exactement "product-images", et coche "Public bucket" avant de créer.
-- Fais ça AVANT d'exécuter ce script (sinon les policies storage échouent
-- faute de bucket existant).
-- ============================================
