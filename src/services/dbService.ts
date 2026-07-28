import { supabase } from '../lib/supabaseClient';
import { encryptData, decryptData } from '../utils/crypto';
import { Patient, DARObservation } from '../types';

/**
 * Service Base de Données CareTone (Supabase PostgreSQL + HDS Chiffrement AES-256)
 */

export interface SaveTransmissionInput {
  patientId: string;
  cible?: string;
  donnees: string; // D (Données) - Chiffré en AES-256
  actions: string; // A (Actions) - Chiffré en AES-256
  resultats: string; // R (Résultats) - Chiffré en AES-256
  constantesJson?: Record<string, any>;
  version?: number;
}

export interface PatientOrderInput {
  patientId: string;
  orderIndex: number;
}

export const dbService = {
  /**
   * Récupère la liste des patients attribués à l'infirmière connectée.
   */
  async getPatientsForNurse(): Promise<{ data: Patient[] | null; error: Error | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.warn('[dbService] Utilisateur non authentifié ou session locale hors-ligne');
      }

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      // Mapping du modèle de données Supabase vers le type Patient de l'application
      const mappedPatients: Patient[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        birthDate: p.birth_date || '12/04/1958',
        age: p.age || 68,
        secuNumber: p.secu_number || '1 58 04 75 123 456 78',
        bloodType: p.blood_type || 'A+',
        address: p.address || 'Adresse non renseignée',
        phone: p.phone || '06 00 00 00 00',
        doctor: p.doctor || 'Dr. Martin',
        photoUrl: p.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        careSummary: p.care_summary || 'Soins infirmiers quotidiens',
        nextVisitTime: p.next_visit_time || '08:30',
        visitFrequency: p.visit_frequency || '1x / Jour',
        warnings: p.warnings || [],
        observationsHistory: [],
        status: p.status || 'active',
      }));

      return { data: mappedPatients, error: null };
    } catch (err: any) {
      console.error('[dbService.getPatientsForNurse] Erreur:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Chiffre automatiquement les champs sensibles (données, actions, résultats) en AES-256
   * et sauvegarde la transmission dans PostgreSQL Supabase.
   */
  async saveTransmission(
    input: SaveTransmissionInput
  ): Promise<{ data: any | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Chiffrement HDS des champs textuels sensibles
      const encryptedDonnees = encryptData(input.donnees);
      const encryptedActions = encryptData(input.actions);
      const encryptedResultats = encryptData(input.resultats);

      const payload = {
        patient_id: input.patientId,
        nurse_id: user?.id || null,
        cible: input.cible || 'Soin & Suivi IDEL',
        encrypted_donnees: encryptedDonnees,
        encrypted_actions: encryptedActions,
        encrypted_resultats: encryptedResultats,
        constantes_json: input.constantesJson || {},
        version: input.version || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('transmissions')
        .insert([payload])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (err: any) {
      console.error('[dbService.saveTransmission] Erreur d\'enregistrement:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Récupère les transmissions d'un patient et déchiffre automatiquement
   * les champs confidentiels avant restitution à l'interface React.
   */
  async getTransmissionsForPatient(
    patientId: string
  ): Promise<{ data: DARObservation[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('transmissions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Déchiffrement AES-256 et conversion au format DARObservation
      const decryptedTransmissions: DARObservation[] = (data || []).map((row: any) => {
        const decryptedDonnees = decryptData(row.encrypted_donnees);
        const decryptedActions = decryptData(row.encrypted_actions);
        const decryptedResultats = decryptData(row.encrypted_resultats);

        const createdDate = new Date(row.created_at);
        const formattedDate = `Aujourd'hui, ${createdDate.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })}`;

        return {
          id: row.id,
          date: formattedDate,
          timestamp: row.created_at,
          author: row.nurse_name || 'Infirmièr(e) IDEL',
          donnees: decryptedDonnees,
          actions: decryptedActions,
          resultats: decryptedResultats,
          isDiff: row.version > 1,
        };
      });

      return { data: decryptedTransmissions, error: null };
    } catch (err: any) {
      console.error('[dbService.getTransmissionsForPatient] Erreur de récupération:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Met à jour l'ordre de passage de la tournée des patients dans PostgreSQL.
   */
  async updateTourneeOrder(
    patientOrders: PatientOrderInput[]
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const updates = patientOrders.map((item) =>
        supabase
          .from('patients')
          .update({ order_index: item.orderIndex, updated_at: new Date().toISOString() })
          .eq('id', item.patientId)
      );

      await Promise.all(updates);

      return { success: true, error: null };
    } catch (err: any) {
      console.error('[dbService.updateTourneeOrder] Erreur de mise à jour:', err);
      return { success: false, error: err };
    }
  },
};
