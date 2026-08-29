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
    id TEXT PRIMARY KEY, -- ej: 'inv_mt8t3dh4_mdcy' o código personalizado
    event_slug TEXT NOT NULL DEFAULT 'eve-y-yimmy',
    pases INTEGER NOT NULL DEFAULT 1,
    name1 TEXT NOT NULL,
    name2 TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
    category TEXT NOT NULL DEFAULT 'invitados', -- 'invitados', 'preparativos', 'ceremonia', 'fiesta', 'retos'
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
