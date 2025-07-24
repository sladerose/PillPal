import { supabase } from '../../lib/supabase';
import { Medication } from './src/types/medication';

/**
 * Searches for medications by name.
 * @param name The name of the medication to search for.
 * @returns A promise that resolves to an array of medications.
 */
export const searchMedications = async (name: string): Promise<Medication[]> => {
  if (!name) {
    return [];
  }

  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .ilike('name', `%${name}%`);

  if (error) {
    console.error('Error searching medications:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Fetches a medication by its barcode.
 * @param barcode The barcode of the medication.
 * @returns A promise that resolves to a single medication or null if not found.
 */
export const getMedicationByBarcode = async (barcode: string): Promise<Medication | null> => {
  const { data, error } = await supabase.from('medications').select('*').eq('barcode', barcode).single();

  if (error) {
    console.error('Error fetching medication by barcode:', error);
    // It's common for .single() to error if no row is found, check for that.
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return data;
};