-- Migration Initial Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nurse_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_identity TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.transmissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    nurse_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_donnees TEXT NOT NULL,
    encrypted_actions TEXT NOT NULL,
    encrypted_resultats TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transmissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access Nurse Patients Only" ON public.patients FOR ALL USING (auth.uid() = nurse_id);
CREATE POLICY "Access Nurse Transmissions Only" ON public.transmissions FOR ALL USING (auth.uid() = nurse_id);
