export interface Medication {
  id: string;
  name: string;
  usage: string;
  dosage: string;
  ingredients: string[];
  safe_for_pregnant: boolean;
  safe_for_children: boolean;
  barcode?: string;
  explanation: string;
}