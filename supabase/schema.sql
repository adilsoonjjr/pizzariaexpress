-- ============================================================
-- PizzaExpress — Schema Supabase (execute no SQL Editor)
-- console.supabase.com > seu projeto > SQL Editor > New query
-- ============================================================

-- Extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- PROFILES (dados do usuário além do auth.users)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id      UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name    TEXT NOT NULL,
  phone   TEXT DEFAULT '',
  role    TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin','customer')),
  address JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Qualquer usuário autenticado pode ler perfis (nome/role são públicos)
CREATE POLICY "profiles_read"       ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────
-- FLAVORS (sabores do cardápio)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flavors (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  price       DECIMAL(10,2) NOT NULL,
  category    TEXT DEFAULT 'tradicional',
  emoji       TEXT DEFAULT '🍕',
  available   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE flavors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flavors_read"       ON flavors FOR SELECT TO authenticated USING (true);
CREATE POLICY "flavors_write_admin" ON flavors FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Realtime para o cardápio atualizar automaticamente
ALTER PUBLICATION supabase_realtime ADD TABLE flavors;

-- ─────────────────────────────────────────────────────────────
-- ORDERS (pedidos)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id      UUID REFERENCES profiles(id) NOT NULL,
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT DEFAULT '',
  delivery_address JSONB NOT NULL DEFAULT '{}',
  items            JSONB NOT NULL DEFAULT '[]',
  subtotal         DECIMAL(10,2) NOT NULL,
  delivery_fee     DECIMAL(10,2) NOT NULL DEFAULT 0,
  total            DECIMAL(10,2) NOT NULL,
  payment_method   TEXT NOT NULL,
  payment_change   DECIMAL(10,2),
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','accepted','preparing','delivering','delivered','cancelled')),
  status_history   JSONB DEFAULT '[]',
  estimated_time   INTEGER DEFAULT 45,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- REPLICA IDENTITY FULL: envia linha completa nos eventos de UPDATE/DELETE (necessário para realtime)
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select" ON orders FOR SELECT USING (
  customer_id = auth.uid() OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ─────────────────────────────────────────────────────────────
-- SETTINGS (preços e zonas de entrega)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_read"        ON settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_write_admin" ON settings FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ─────────────────────────────────────────────────────────────
-- SEED: dados iniciais (sabores + configurações)
-- Execute uma vez após criar as tabelas
-- ─────────────────────────────────────────────────────────────
INSERT INTO flavors (name, description, price, category, emoji, available) VALUES
  ('Margherita',         'Molho de tomate, mussarela, manjericão fresco',              38.00, 'tradicional', '🍕', true),
  ('Calabresa',          'Molho de tomate, mussarela, calabresa fatiada, cebola',      40.00, 'tradicional', '🍕', true),
  ('Frango com Catupiry','Frango desfiado, catupiry original, milho',                  44.00, 'tradicional', '🍕', true),
  ('Portuguesa',         'Presunto, ovo, cebola, ervilha, azeitona, pimentão',         44.00, 'tradicional', '🍕', true),
  ('4 Queijos',          'Mussarela, parmesão, provolone, catupiry',                   48.00, 'especial',    '🧀', true),
  ('Pepperoni',          'Mussarela, pepperoni importado, orégano',                    50.00, 'especial',    '🍕', true),
  ('Bacon',              'Mussarela, bacon crocante, cebola caramelizada',             46.00, 'especial',    '🥓', true),
  ('Camarão',            'Camarão ao alho e óleo, mussarela, tomate',                 62.00, 'premium',     '🦐', true),
  ('Filé Mignon',        'Filé mignon grelhado, champignon, creme de leite',          68.00, 'premium',     '🥩', true),
  ('Salmão',             'Salmão defumado, cream cheese, alcaparras',                 65.00, 'premium',     '🐟', true),
  ('Chocolate',          'Chocolate ao leite, granulado, morango',                    42.00, 'doce',        '🍫', true),
  ('Nutella com Morango','Nutella, morango fresco, leite condensado',                  48.00, 'doce',        '🍓', true)
ON CONFLICT DO NOTHING;

INSERT INTO settings (key, value) VALUES
  ('pricing', '{
    "sizes": {
      "p": {"label":"Pequena","description":"4 fatias · 20cm","multiplier":0.75},
      "m": {"label":"Média","description":"6 fatias · 30cm","multiplier":1.0},
      "g": {"label":"Grande","description":"8 fatias · 35cm","multiplier":1.3},
      "f": {"label":"Família","description":"10 fatias · 40cm","multiplier":1.6}
    },
    "doughs": [
      {"id":"fina","label":"Fina","description":"Crocante e leve"},
      {"id":"media","label":"Média","description":"Equilíbrio perfeito"},
      {"id":"grossa","label":"Grossa","description":"Macia e fofinha"}
    ],
    "crustPrice": 8,
    "crustFlavors": ["Catupiry","Cheddar","Chocolate"]
  }'),
  ('delivery', '{
    "zones": [
      {"id":"z1","neighborhood":"Centro","fee":5,"estimatedTime":30},
      {"id":"z2","neighborhood":"Jardim América","fee":7,"estimatedTime":35},
      {"id":"z3","neighborhood":"Vila Nova","fee":8,"estimatedTime":40},
      {"id":"z4","neighborhood":"Bela Vista","fee":10,"estimatedTime":45},
      {"id":"z5","neighborhood":"Outro bairro","fee":12,"estimatedTime":50}
    ],
    "minOrder": 30
  }')
ON CONFLICT DO NOTHING;
