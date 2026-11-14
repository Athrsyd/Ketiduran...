-- ============================================================================
-- SQL SCHEMA FOR GAME 3D EDUKATIF PAI KELAS 11 SMK: "KETIDURAN..."
-- Jalankan file ini di Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. Tabel Papan Peringkat (Leaderboard)
CREATE TABLE IF NOT EXISTS public.game_leaderboard (
    id BIGSERIAL PRIMARY KEY,
    player_name TEXT NOT NULL,
    room_code TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 100,
    time_seconds INTEGER NOT NULL DEFAULT 0,
    mode TEXT NOT NULL CHECK (mode IN ('solo', 'multiplayer')),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk mempercepat query leaderboard
CREATE INDEX IF NOT EXISTS idx_leaderboard_score_time 
ON public.game_leaderboard (score DESC, time_seconds ASC);

-- 2. Tabel Sesi Room Multiplayer (Opsional untuk direktori room publik)
CREATE TABLE IF NOT EXISTS public.game_rooms (
    id BIGSERIAL PRIMARY KEY,
    room_code TEXT UNIQUE NOT NULL,
    host_name TEXT NOT NULL,
    max_players INTEGER NOT NULL DEFAULT 4,
    current_players INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.game_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

-- 4. Kebijakan RLS untuk Anonim (Siswa SMK / Frontend Game):
-- Siswa dapat membaca leaderboard
CREATE POLICY "Allow public read access to game_leaderboard" 
ON public.game_leaderboard 
FOR SELECT 
USING (true);

-- Siswa dapat memasukkan skor baru setelah menyelesaikan game
CREATE POLICY "Allow public insert access to game_leaderboard" 
ON public.game_leaderboard 
FOR INSERT 
WITH CHECK (true);

-- Akses publik untuk sesi room multiplayer
CREATE POLICY "Allow public read access to game_rooms" 
ON public.game_rooms 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to game_rooms" 
ON public.game_rooms 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to game_rooms" 
ON public.game_rooms 
FOR UPDATE 
USING (true);

-- 5. Aktifkan Supabase Realtime untuk tabel game_rooms (Realtime CDC)
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
