-- ============================================================
-- PizzaExpress — Schema Neon PostgreSQL
-- Execute no SQL Editor do Neon Console (console.neon.tech)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── PROFILES (usuários) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone         TEXT DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin','customer')),
  address       JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FLAVORS (sabores do cardápio) ───────────────────────────
CREATE TABLE IF NOT EXISTS flavors (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  price       DECIMAL(10,2) NOT NULL,
  category    TEXT DEFAULT 'tradicional',
  emoji       TEXT DEFAULT '🍕',
  available   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ORDERS (pedidos) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id      UUID REFERENCES profiles(id),
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT DEFAULT '',
  delivery_address JSONB DEFAULT '{}',
  items            JSONB DEFAULT '[]',
  subtotal         DECIMAL(10,2) NOT NULL,
  delivery_fee     DECIMAL(10,2) DEFAULT 0,
  total            DECIMAL(10,2) NOT NULL,
  payment_method   TEXT NOT NULL,
  payment_change   DECIMAL(10,2),
  status           TEXT DEFAULT 'pending'
                   CHECK (status IN ('pending','accepted','preparing','delivering','delivered','cancelled')),
  status_history   JSONB DEFAULT '[]',
  estimated_time   INTEGER DEFAULT 45,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders(customer_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);

-- ─── SETTINGS (preços e entregas) ────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- DADOS INICIAIS (execute uma vez após criar as tabelas)
-- ─────────────────────────────────────────────────────────────
INSERT INTO flavors (name, description, price, category, emoji) VALUES
  ('Margherita',          'Molho de tomate, mussarela, manjericão fresco',              38.00, 'tradicional', '🍕'),
  ('Calabresa',           'Molho de tomate, mussarela, calabresa fatiada, cebola',      40.00, 'tradicional', '🍕'),
  ('Frango com Catupiry', 'Frango desfiado, catupiry original, milho',                  44.00, 'tradicional', '🍕'),
  ('Portuguesa',          'Presunto, ovo, cebola, ervilha, azeitona, pimentão',         44.00, 'tradicional', '🍕'),
  ('4 Queijos',           'Mussarela, parmesão, provolone, catupiry',                   48.00, 'especial',    '🧀'),
  ('Pepperoni',           'Mussarela, pepperoni importado, orégano',                    50.00, 'especial',    '🍕'),
  ('Bacon',               'Mussarela, bacon crocante, cebola caramelizada',             46.00, 'especial',    '🥓'),
  ('Camarão',             'Camarão ao alho e óleo, mussarela, tomate',                 62.00, 'premium',     '🦐'),
  ('Filé Mignon',         'Filé mignon grelhado, champignon, creme de leite',          68.00, 'premium',     '🥩'),
  ('Salmão',              'Salmão defumado, cream cheese, alcaparras',                 65.00, 'premium',     '🐟'),
  ('Chocolate',           'Chocolate ao leite, granulado, morango',                    42.00, 'doce',        '🍫'),
  ('Nutella com Morango', 'Nutella, morango fresco, leite condensado',                  48.00, 'doce',        '🍓')
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
