-- ==============================================================================
-- SCHEMA SUPABASE COMPLETO: COSITAS PARA EVENTOS & MATRIMONIO EVE & YIMMY
-- ==============================================================================

-- 1. Tabla de Eventos
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'matrimonio',
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue_name TEXT NOT NULL,
    venue_address TEXT NOT NULL,
    google_maps_url TEXT,
    waze_url TEXT,
    dress_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar evento inicial de Evelyn & Yimmy si no existe
INSERT INTO events (slug, title, event_type, event_date, venue_name, venue_address, dress_code)
VALUES (
    'eve-y-yimmy',
    'Matrimonio Evelyn & Yimmy',
    'matrimonio',
    '2026-11-21 11:00:00-03',
    'Casa Pirque',
    'Av. Alcalde Hernán Prieto 0123, Pirque, Región Metropolitana',
    'Elegante Campestre (tonos verde olivo, beige, tierra y flores)'
) ON CONFLICT (slug) DO NOTHING;

-- 2. Tabla de Invitaciones Oficiales (Generadas por los Novios / Admin)
CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    event_slug TEXT NOT NULL DEFAULT 'eve-y-yimmy',
    pases INTEGER NOT NULL DEFAULT 1,
    name1 TEXT NOT NULL,
    name2 TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migración de Invitaciones Previas de Evelyn & Yimmy
INSERT INTO invitations (id, event_slug, pases, name1, name2, phone) VALUES
('inv_mt8t3dh4_mdcy', 'eve-y-yimmy', 2, 'Roberto', 'Acompañante', '+56 9 9411 6173'),
('inv_mt7agi0j_r812', 'eve-y-yimmy', 1, 'Karen', '', '+56 9 6483 3883'),
('inv_mt7agb8r_yhi2', 'eve-y-yimmy', 1, 'Sandra', '', '+56 9 9057 6025'),
('inv_mt7ag1bu_s3mf', 'eve-y-yimmy', 1, 'Jhankhel', '', '+56 9 8142 5746'),
('inv_mt7afpe6_kfg4', 'eve-y-yimmy', 1, 'Yorka', '', '+1 (514) 570-0368'),
('inv_mt7afe11_3wr0', 'eve-y-yimmy', 2, 'Pamela', 'Marcial', '+56 9 9352 5595'),
('inv_mt7af2wd_bc93', 'eve-y-yimmy', 1, 'Constanza', '', '+56 9 5003 1547'),
('inv_mt7aerri_0o4h', 'eve-y-yimmy', 1, 'Cecilia', '', '+56 9 5778 7316'),
('inv_mt7aefqb_ewjp', 'eve-y-yimmy', 1, 'Barbara', '', '+56 9 8982 8672'),
('inv_mt7ae4tr_3c2o', 'eve-y-yimmy', 1, 'Claudia', '', '+56 9 7850 6319'),
('inv_mt7ado96_pjjz', 'eve-y-yimmy', 2, 'Camila', 'Tah', '+61 451 471 901'),
('inv_mt7ad2wi_m84w', 'eve-y-yimmy', 2, 'Daniela', 'Hugo', '+56 9 6210 8586'),
('inv_mt7acqee_bjth', 'eve-y-yimmy', 2, 'Jessica', 'Eduardo', '+56 9 5524 3357'),
('inv_mt7ac5s2_2ko9', 'eve-y-yimmy', 2, 'Cristopher', 'Reny', '+56 9 9138 1368'),
('inv_mt7abo4o_ixxm', 'eve-y-yimmy', 2, 'Carlos', 'Carola', '+56 9 2197 6137'),
('inv_mt79v1i5_fj7j', 'eve-y-yimmy', 2, 'Felipe', 'Camila', '+56 9 9588 8834'),
('inv_mt79ukht_iqcm', 'eve-y-yimmy', 2, 'Guisselle', 'Nicolas', '+56 9 3269 8863'),
('inv_mt79u2qe_of3f', 'eve-y-yimmy', 2, 'Jaqueline', 'Luis', '+56 9 8612 9593'),
('inv_mt797yfq_46ak', 'eve-y-yimmy', 2, 'Isaac', 'Denisse', '+56 9 6169 7185')
ON CONFLICT (id) DO NOTHING;

-- 3. Tabla de Confirmaciones de Asistencia (RSVPs)
CREATE TABLE IF NOT EXISTS rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_slug TEXT NOT NULL DEFAULT 'eve-y-yimmy',
    invitation_id TEXT,
    pass_code TEXT,
    name1 TEXT NOT NULL,
    attendance1 BOOLEAN NOT NULL DEFAULT true,
    dietary1 TEXT DEFAULT 'Ninguna',
    name2 TEXT DEFAULT '',
    attendance2 BOOLEAN DEFAULT false,
    dietary2 TEXT DEFAULT 'Ninguna',
    phone TEXT,
    song_request TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla del Álbum Social de Fotos (Likes, Comentarios, Retos)
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_slug TEXT NOT NULL DEFAULT 'eve-y-yimmy',
    photo_url TEXT NOT NULL,
    author_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'invitados', -- 'invitados', 'preparativos', 'ceremonia', 'fiesta', 'desafios'
    caption TEXT DEFAULT '',
    likes INTEGER NOT NULL DEFAULT 0,
    comments JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Cotizaciones / Clientes para la Plataforma de Eventos
CREATE TABLE IF NOT EXISTS quotes_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    event_type TEXT NOT NULL,
    guest_estimate INTEGER,
    selected_services JSONB,
    estimated_total INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes_leads ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura y escritura públicas/anon
DROP POLICY IF EXISTS "Permitir lectura publica de eventos" ON events;
CREATE POLICY "Permitir lectura publica de eventos" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir lectura de invitaciones" ON invitations;
CREATE POLICY "Permitir lectura de invitaciones" ON invitations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir crear invitaciones" ON invitations;
CREATE POLICY "Permitir crear invitaciones" ON invitations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir crear confirmaciones rsvp" ON rsvps;
CREATE POLICY "Permitir crear confirmaciones rsvp" ON rsvps FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leer confirmaciones rsvp" ON rsvps;
CREATE POLICY "Permitir leer confirmaciones rsvp" ON rsvps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir ver fotos publicas" ON photos;
CREATE POLICY "Permitir ver fotos publicas" ON photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir subir fotos" ON photos;
CREATE POLICY "Permitir subir fotos" ON photos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizar fotos (likes y comentarios)" ON photos;
CREATE POLICY "Permitir actualizar fotos (likes y comentarios)" ON photos FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir crear cotizaciones" ON quotes_leads;
CREATE POLICY "Permitir crear cotizaciones" ON quotes_leads FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKET PARA FOTOS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wedding-photos', 'wedding-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Permitir ver fotos de storage" ON storage.objects;
CREATE POLICY "Permitir ver fotos de storage" ON storage.objects FOR SELECT USING (bucket_id = 'wedding-photos');

DROP POLICY IF EXISTS "Permitir subir fotos a storage" ON storage.objects;
CREATE POLICY "Permitir subir fotos a storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'wedding-photos');
