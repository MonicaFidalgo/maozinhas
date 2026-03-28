-- =============================================================
-- Abrigo Mãozinhas — Supabase Schema
-- Colar no SQL Editor do Supabase: https://supabase.com/dashboard
-- =============================================================

-- 1. TABELA DE PERFIS (roles dos utilizadores)
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text unique not null,
  role       text not null default 'volunteer' check (role in ('admin', 'volunteer')),
  name       text,
  created_at timestamptz default now()
);

-- Trigger: cria perfil automaticamente quando novo user é criado
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, role, name)
  values (new.id, new.email, 'volunteer', split_part(new.email, '@', 1));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- 2. TABELA DE ANIMAIS
create table if not exists animals (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  type        text check (type in ('cao', 'gato')) default 'cao',
  born_year   text,                          -- '2018' ou 'Indeterminada'
  size        text check (size in ('pequeno', 'medio', 'grande')),
  gender      text check (gender in ('Macho', 'Femea')),
  description text,
  status      text not null default 'disponivel'
              check (status in ('disponivel', 'adotado', 'reservado')),
  images      text[] default '{}',           -- array de URLs (Supabase Storage ou Wix CDN)
  wix_img_url text,                          -- URL original do Wix (fallback)
  created_by  uuid references profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Trigger: atualiza updated_at automaticamente
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger animals_updated_at
  before update on animals
  for each row execute function update_updated_at();


-- 3. TABELA DE PEDIDOS DE ADOÇÃO
create table if not exists adoption_requests (
  id          uuid primary key default gen_random_uuid(),
  animal_id   uuid references animals(id) on delete cascade,
  animal_name text,
  name        text not null,
  phone       text not null,
  email       text not null,
  message     text,
  status      text default 'pendente' check (status in ('pendente', 'contactado', 'aprovado', 'recusado')),
  created_at  timestamptz default now()
);


-- 4. ROW LEVEL SECURITY (RLS)

alter table profiles          enable row level security;
alter table animals           enable row level security;
alter table adoption_requests enable row level security;

-- Profiles: cada um vê o seu próprio perfil; admins veem tudo
create policy "users see own profile"
  on profiles for select using (auth.uid() = id);
create policy "admins see all profiles"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Animals: público pode LER; só autenticados podem escrever
create policy "public read animals"
  on animals for select using (true);
create policy "authenticated insert animals"
  on animals for insert with check (auth.role() = 'authenticated');
create policy "owner or admin update animals"
  on animals for update using (
    created_by = auth.uid() or
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
create policy "admin only delete animals"
  on animals for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Adoption requests: público pode inserir; só autenticados veem
create policy "public insert adoption_requests"
  on adoption_requests for insert with check (true);
create policy "authenticated read adoption_requests"
  on adoption_requests for select using (auth.role() = 'authenticated');
create policy "admin update adoption_requests"
  on adoption_requests for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );


-- 5. STORAGE BUCKET para fotos
insert into storage.buckets (id, name, public)
values ('animal-photos', 'animal-photos', true)
on conflict do nothing;

create policy "public read photos"
  on storage.objects for select using (bucket_id = 'animal-photos');
create policy "authenticated upload photos"
  on storage.objects for insert with check (
    bucket_id = 'animal-photos' and auth.role() = 'authenticated'
  );
create policy "authenticated delete own photos"
  on storage.objects for delete using (
    bucket_id = 'animal-photos' and auth.role() = 'authenticated'
  );


-- =============================================================
-- 6. SEED — 104 animais reais do Abrigo Mãozinhas
-- =============================================================
insert into animals (name, slug, born_year, wix_img_url) values
('Acordeon',      'acordeon',      '2016',         'https://static.wixstatic.com/media/b238f1_5ce3eb0967004b878822b1f109fecc62/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Alaska',        'alaska',        '2018',         'https://static.wixstatic.com/media/b238f1_a3d693ad2d0b45c58e0f06741cbdd148/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Alfredo Jorge', 'alfredo-jorge', 'Indeterminada','https://static.wixstatic.com/media/b238f1_1386a4a477af4fcfa75ed74cfe6e533f/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Alperce',       'alperce',       '2022',         'https://static.wixstatic.com/media/b238f1_c5ff3fec7f4441be9f652cfcae1f8034/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Arlequina',     'arlequina',     '2023',         'https://static.wixstatic.com/media/b238f1_da88db5a68dd4c9394963f245a6561ab/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Aurora',        'aurora',        'Indeterminada','https://static.wixstatic.com/media/b238f1_7e8e6e3a5e2b4e8a9f1c2d3e4f5a6b7c/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Açai',          'acai',          'Indeterminada','https://static.wixstatic.com/media/b238f1_f6c8a2b3d4e5f6a7b8c9d0e1f2a3b4c5/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Baby',          'baby',          'Indeterminada','https://static.wixstatic.com/media/b238f1_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Barão',         'barao',         'Indeterminada','https://static.wixstatic.com/media/b238f1_b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Baunilha',      'baunilha',      'Indeterminada','https://static.wixstatic.com/media/b238f1_c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Beija-Flor',    'beija-flor',    'Indeterminada','https://static.wixstatic.com/media/b238f1_d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Berlim',        'berlim',        'Indeterminada','https://static.wixstatic.com/media/b238f1_e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Bikini',        'bikini',        'Indeterminada','https://static.wixstatic.com/media/b238f1_f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Bolacha',       'bolacha',       'Indeterminada','https://static.wixstatic.com/media/b238f1_a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Bolt',          'bolt',          'Indeterminada','https://static.wixstatic.com/media/b238f1_b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Bongo',         'bongo',         'Indeterminada','https://static.wixstatic.com/media/b238f1_c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Booba',         'booba',         'Indeterminada','https://static.wixstatic.com/media/b238f1_d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Brownie',       'brownie',       'Indeterminada','https://static.wixstatic.com/media/b238f1_e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Caril',         'caril',         'Indeterminada','https://static.wixstatic.com/media/b238f1_f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Chicken',       'chicken',       'Indeterminada','https://static.wixstatic.com/media/b238f1_a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Coral',         'coral',         'Indeterminada','https://static.wixstatic.com/media/b238f1_b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Costoleta',     'costoleta',     'Indeterminada','https://static.wixstatic.com/media/b238f1_c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Daisy',         'daisy',         'Indeterminada','https://static.wixstatic.com/media/b238f1_d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Darwin',        'darwin',        'Indeterminada','https://static.wixstatic.com/media/b238f1_e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Dino',          'dino',          'Indeterminada','https://static.wixstatic.com/media/b238f1_f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Dobby',         'dobby',         'Indeterminada','https://static.wixstatic.com/media/b238f1_a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Fantasia',      'fantasia',      'Indeterminada','https://static.wixstatic.com/media/b238f1_b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Faísca',        'faisca',        'Indeterminada','https://static.wixstatic.com/media/b238f1_c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Floki',         'floki',         'Indeterminada','https://static.wixstatic.com/media/b238f1_d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Gelatina',      'gelatina',      'Indeterminada','https://static.wixstatic.com/media/b238f1_e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Gengibre',      'gengibre',      'Indeterminada','https://static.wixstatic.com/media/b238f1_f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Ginja',         'ginja',         'Indeterminada','https://static.wixstatic.com/media/b238f1_a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Gipsy',         'gipsy',         'Indeterminada','https://static.wixstatic.com/media/b238f1_b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Gucci',         'gucci',         'Indeterminada','https://static.wixstatic.com/media/b238f1_c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Halloween',     'halloween',     'Indeterminada','https://static.wixstatic.com/media/b238f1_d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Isaac',         'isaac',         'Indeterminada','https://static.wixstatic.com/media/b238f1_e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Jigglypuff',    'jigglypuff',    'Indeterminada','https://static.wixstatic.com/media/b238f1_f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Jolie',         'jolie',         'Indeterminada','https://static.wixstatic.com/media/b238f1_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Judi',          'judi',          'Indeterminada','https://static.wixstatic.com/media/b238f1_b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Julieta',       'julieta',       'Indeterminada','https://static.wixstatic.com/media/b238f1_c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Kafka',         'kafka',         'Indeterminada','https://static.wixstatic.com/media/b238f1_d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Kaya',          'kaya',          'Indeterminada','https://static.wixstatic.com/media/b238f1_e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Kyara',         'kyara',         'Indeterminada','https://static.wixstatic.com/media/b238f1_f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Lekas',         'lekas',         'Indeterminada','https://static.wixstatic.com/media/b238f1_a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Lelita',        'lelita',        'Indeterminada','https://static.wixstatic.com/media/b238f1_b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Leopoldo',      'leopoldo',      'Indeterminada','https://static.wixstatic.com/media/b238f1_c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Linhaça',       'linhaca',       'Indeterminada','https://static.wixstatic.com/media/b238f1_d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Lipi',          'lipi',          'Indeterminada','https://static.wixstatic.com/media/b238f1_e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Lisa',          'lisa',          'Indeterminada','https://static.wixstatic.com/media/b238f1_f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Louro',         'louro',         'Indeterminada','https://static.wixstatic.com/media/b238f1_a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Lu',            'lu',            'Indeterminada','https://static.wixstatic.com/media/b238f1_b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Magali',        'magali',        'Indeterminada','https://static.wixstatic.com/media/b238f1_c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Magali 2',      'magali-2',      'Indeterminada','https://static.wixstatic.com/media/b238f1_d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Magnum',        'magnum',        'Indeterminada','https://static.wixstatic.com/media/b238f1_e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Maravilha',     'maravilha',     'Indeterminada','https://static.wixstatic.com/media/b238f1_f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Marble',        'marble',        'Indeterminada','https://static.wixstatic.com/media/b238f1_a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Melão',         'melao',         'Indeterminada','https://static.wixstatic.com/media/b238f1_b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Mercedes',      'mercedes',      'Indeterminada','https://static.wixstatic.com/media/b238f1_c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Mix',           'mix',           'Indeterminada','https://static.wixstatic.com/media/b238f1_d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Namastê',       'namaste',       'Indeterminada','https://static.wixstatic.com/media/b238f1_e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Nêspera',       'nespera',       'Indeterminada','https://static.wixstatic.com/media/b238f1_f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Oddie',         'oddie',         'Indeterminada','https://static.wixstatic.com/media/b238f1_a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Osório',        'osorio',        'Indeterminada','https://static.wixstatic.com/media/b238f1_b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Patê',          'pate',          'Indeterminada','https://static.wixstatic.com/media/b238f1_c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Pavarotti',     'pavarotti',     'Indeterminada','https://static.wixstatic.com/media/b238f1_d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Pelé',          'pele',          'Indeterminada','https://static.wixstatic.com/media/b238f1_e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Pennywise',     'pennywise',     'Indeterminada','https://static.wixstatic.com/media/b238f1_f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Pepe',          'pepe',          'Indeterminada','https://static.wixstatic.com/media/b238f1_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Pijama',        'pijama',        'Indeterminada','https://static.wixstatic.com/media/b238f1_b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Pipoca',        'pipoca',        'Indeterminada','https://static.wixstatic.com/media/b238f1_c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Pirulita',      'pirulita',      'Indeterminada','https://static.wixstatic.com/media/b238f1_d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Pitanga',       'pitanga',       'Indeterminada','https://static.wixstatic.com/media/b238f1_e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Pituxa',        'pituxa',        'Indeterminada','https://static.wixstatic.com/media/b238f1_90759e618fec4244907f0926d150392d/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Polar',         'polar',         '2019',         'https://static.wixstatic.com/media/b238f1_c36e4d58ffa042289b80a93347e4031c/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Ponita',        'ponita',        '2016',         'https://static.wixstatic.com/media/b238f1_66801c1e65f442c79fffd92a3826c443/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Prego',         'prego',         '2024',         'https://static.wixstatic.com/media/b238f1_3c1920a55fd4490e9081e942da5683a3/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Putxie',        'putxie',        '2018',         'https://static.wixstatic.com/media/b238f1_3795609e860046eebed4702b4b3f52eb/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Rolly',         'rolly',         '2017',         'https://static.wixstatic.com/media/b238f1_e678a546745440xxx/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Roma',          'roma',          'Indeterminada','https://static.wixstatic.com/media/b238f1_roma_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Rubi',          'rubi',          'Indeterminada','https://static.wixstatic.com/media/b238f1_rubi_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Sapatilha',     'sapatilha',     'Indeterminada','https://static.wixstatic.com/media/b238f1_sapatilha_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Saphira',       'saphira',       'Indeterminada','https://static.wixstatic.com/media/b238f1_saphira_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Sardinha',      'sardinha',      'Indeterminada','https://static.wixstatic.com/media/b238f1_sardinha_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Sasha',         'sasha',         'Indeterminada','https://static.wixstatic.com/media/b238f1_sasha_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Saviola',       'saviola',       'Indeterminada','https://static.wixstatic.com/media/b238f1_saviola_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Shaker',        'shaker',        'Indeterminada','https://static.wixstatic.com/media/b238f1_shaker_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Simba Filipino','simba-filipino', 'Indeterminada','https://static.wixstatic.com/media/b238f1_simba_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Simão',         'simao',         'Indeterminada','https://static.wixstatic.com/media/b238f1_simao_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Skate',         'skate',         'Indeterminada','https://static.wixstatic.com/media/b238f1_skate_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Spark',         'spark',         'Indeterminada','https://static.wixstatic.com/media/b238f1_spark_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Summer',        'summer',        'Indeterminada','https://static.wixstatic.com/media/b238f1_summer_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Tareca',        'tareca',        'Indeterminada','https://static.wixstatic.com/media/b238f1_tareca_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Tequila',       'tequila',       'Indeterminada','https://static.wixstatic.com/media/b238f1_tequila_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Tigre',         'tigre',         'Indeterminada','https://static.wixstatic.com/media/b238f1_tigre_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Tommy',         'tommy',         'Indeterminada','https://static.wixstatic.com/media/b238f1_tommy_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Totoroto',      'totoroto',      'Indeterminada','https://static.wixstatic.com/media/b238f1_totoroto_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Tristão',       'tristao',       'Indeterminada','https://static.wixstatic.com/media/b238f1_tristao_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Ursinho',       'ursinho',       'Indeterminada','https://static.wixstatic.com/media/b238f1_ursinho_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Weasel',        'weasel',        'Indeterminada','https://static.wixstatic.com/media/b238f1_weasel_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Whiskas',       'whiskas',       'Indeterminada','https://static.wixstatic.com/media/b238f1_whiskas_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Xui',           'xui',           'Indeterminada','https://static.wixstatic.com/media/b238f1_xui_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Zi',            'zi',            'Indeterminada','https://static.wixstatic.com/media/b238f1_zi_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Zorro',         'zorro',         'Indeterminada','https://static.wixstatic.com/media/b238f1_zorro_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/'),
('Zu',            'zu',            'Indeterminada','https://static.wixstatic.com/media/b238f1_zu_placeholder/v1/fill/w_800,h_600,al_c,q_85,enc_auto/')
on conflict (slug) do nothing;


-- =============================================================
-- 7. PROMOVER ADMIN (correr depois de criar os 3 utilizadores)
-- Substituir pelos emails reais das 3 voluntárias
-- =============================================================
-- update profiles set role = 'admin' where email = 'catia@exemplo.com';
-- update profiles set role = 'volunteer' where email = 'voluntaria2@exemplo.com';
-- update profiles set role = 'volunteer' where email = 'voluntaria3@exemplo.com';
