export interface DARRecord {
  patient_id: string;
  patient_name: string;
  donnees: string;
  actions: string;
  resultats: string;
  glycemia?: number | null;
  systolic_bp?: number | null;
}

export interface EncryptedDARRecord {
  patient_id: string;
  encrypted_donnees: string;
  encrypted_actions: string;
  encrypted_resultats: string;
}
