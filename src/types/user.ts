export interface UserProfile {
  id: string;
  full_name?: string;
  allergies?: string[];
  intolerances?: string[];
  age?: number;
  is_pregnant?: boolean;
  medical_conditions?: string[];
}