-- ============================================================================
-- CAREVOICE - SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Health Data Hosting (HDS) & GDPR / RGPD Compliant Architecture
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABLE: NURSES (INFIRMIÈRES / INFIRMIERS IDEL)
-- Tied directly to Supabase Auth Users (auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nurses (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    rpps_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Automatic trigger to create a public.nurses profile upon Supabase auth sign-up
CREATE OR REPLACE FUNCTION public.handle_new_nurse()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.nurses (id, email, full_name, rpps_number)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Infirmièr(e) IDEL'),
        NEW.raw_user_meta_data->>'rpps_number'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_nurse();


-- ----------------------------------------------------------------------------
-- 2. TABLE: PATIENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nurse_id UUID NOT NULL REFERENCES public.nurses(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ----------------------------------------------------------------------------
-- 3. TABLE: TOURNEES (ORGANISATION DESTOURNÉES DE SOINS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tournees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nurse_id UUID NOT NULL REFERENCES public.nurses(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ----------------------------------------------------------------------------
-- 4. TABLE: TRANSMISSIONS (SOINS & FEED MÉDICAL REGISTRE COMPLIANT)
-- Medical fields (donnees, actions, resultats) are client-encrypted (AES-256)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transmissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    nurse_id UUID NOT NULL REFERENCES public.nurses(id) ON DELETE CASCADE DEFAULT auth.uid(),
    version INTEGER DEFAULT 1 NOT NULL,
    cible TEXT,
    encrypted_donnees TEXT,
    encrypted_actions TEXT,
    encrypted_resultats TEXT,
    constantes_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ----------------------------------------------------------------------------
-- 5. POSTGRESQL INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_patients_nurse_id ON public.patients(nurse_id);
CREATE INDEX IF NOT EXISTS idx_tournees_nurse_id ON public.tournees(nurse_id);

CREATE INDEX IF NOT EXISTS idx_transmissions_patient_id ON public.transmissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_transmissions_nurse_id ON public.transmissions(nurse_id);
CREATE INDEX IF NOT EXISTS idx_transmissions_created_at ON public.transmissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transmissions_patient_created ON public.transmissions(patient_id, created_at DESC);


-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: A nurse can ONLY access their own records
-- ----------------------------------------------------------------------------

-- Enable RLS on all public tables
ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transmissions ENABLE ROW LEVEL SECURITY;

-- --- RLS POLICIES FOR 'nurses' ---
CREATE POLICY "Nurses can view their own profile"
    ON public.nurses FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Nurses can update their own profile"
    ON public.nurses FOR UPDATE
    USING (auth.uid() = id);

-- --- RLS POLICIES FOR 'patients' ---
CREATE POLICY "Nurses can view their own patients"
    ON public.patients FOR SELECT
    USING (auth.uid() = nurse_id);

CREATE POLICY "Nurses can insert their own patients"
    ON public.patients FOR INSERT
    WITH CHECK (auth.uid() = nurse_id);

CREATE POLICY "Nurses can update their own patients"
    ON public.patients FOR UPDATE
    USING (auth.uid() = nurse_id);

CREATE POLICY "Nurses can delete their own patients"
    ON public.patients FOR DELETE
    USING (auth.uid() = nurse_id);

-- --- RLS POLICIES FOR 'tournees' ---
CREATE POLICY "Nurses can view their own tournees"
    ON public.tournees FOR SELECT
    USING (auth.uid() = nurse_id);

CREATE POLICY "Nurses can insert their own tournees"
    ON public.tournees FOR INSERT
    WITH CHECK (auth.uid() = nurse_id);

CREATE POLICY "Nurses can update their own tournees"
    ON public.tournees FOR UPDATE
    USING (auth.uid() = nurse_id);

CREATE POLICY "Nurses can delete their own tournees"
    ON public.tournees FOR DELETE
    USING (auth.uid() = nurse_id);

-- --- RLS POLICIES FOR 'transmissions' ---
CREATE POLICY "Nurses can view their own transmissions"
    ON public.transmissions FOR SELECT
    USING (auth.uid() = nurse_id);

CREATE POLICY "Nurses can insert their own transmissions"
    ON public.transmissions FOR INSERT
    WITH CHECK (auth.uid() = nurse_id);

CREATE POLICY "Nurses can update their own transmissions"
    ON public.transmissions FOR UPDATE
    USING (auth.uid() = nurse_id);

CREATE POLICY "Nurses can delete their own transmissions"
    ON public.transmissions FOR DELETE
    USING (auth.uid() = nurse_id);
