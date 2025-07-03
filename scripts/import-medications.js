const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// CSV file path
const CSV_FILE_PATH = process.argv[2] || './medications.csv';

// Validation functions
const validateBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === 'yes' || lower === '1';
  }
  return false;
};

const validateIngredients = (ingredients) => {
  if (!ingredients) return [];
  if (Array.isArray(ingredients)) return ingredients;
  if (typeof ingredients === 'string') {
    return ingredients
      .split(',')
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0);
  }
  return [];
};

const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    throw new Error(`Missing required field: ${fieldName}`);
  }
  return value;
};

const validateOptional = (value) => {
  return value && typeof value === 'string' ? value.trim() : null;
};

// Process a single medication row
const processMedicationRow = (row) => {
  try {
    const medication = {
      name: validateRequired(row.name, 'name'),
      ingredients: validateIngredients(row.ingredients),
      dosage: validateOptional(row.dosage),
      usage: validateOptional(row.usage),
      safe_for_pregnant: validateBoolean(row.safe_for_pregnant),
      safe_for_children: validateBoolean(row.safe_for_children),
      explanation: validateOptional(row.explanation),
      barcode: validateOptional(row.barcode),
    };

    // Validate that ingredients array is not empty
    if (medication.ingredients.length === 0) {
      throw new Error('At least one ingredient is required');
    }

    return medication;
  } catch (error) {
    console.error(`Error processing row:`, row);
    console.error(`Error:`, error.message);
    return null;
  }
};

// Import medications to Supabase
const importMedications = async (medications) => {
  console.log(`\n🔄 Importing ${medications.length} medications to Supabase...`);

  try {
    const { data, error } = await supabase
      .from('medications')
      .insert(medications)
      .select();

    if (error) {
      console.error('❌ Error importing medications:', error);
      return false;
    }

    console.log(`✅ Successfully imported ${data.length} medications`);
    return true;
  } catch (error) {
    console.error('❌ Unexpected error during import:', error);
    return false;
  }
};

// Main function to read CSV and process data
const importFromCSV = async () => {
  console.log(`📁 Reading CSV file: ${CSV_FILE_PATH}`);

  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`❌ CSV file not found: ${CSV_FILE_PATH}`);
    console.log('Usage: node import-medications.js <path-to-csv-file>');
    process.exit(1);
  }

  const medications = [];
  let processedRows = 0;
  let validRows = 0;
  let invalidRows = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', (row) => {
        processedRows++;
        const medication = processMedicationRow(row);
        
        if (medication) {
          medications.push(medication);
          validRows++;
        } else {
          invalidRows++;
        }

        // Progress indicator
        if (processedRows % 100 === 0) {
          console.log(`📊 Processed ${processedRows} rows...`);
        }
      })
      .on('end', async () => {
        console.log('\n📊 Processing Summary:');
        console.log(`   Total rows processed: ${processedRows}`);
        console.log(`   Valid medications: ${validRows}`);
        console.log(`   Invalid rows: ${invalidRows}`);

        if (medications.length === 0) {
          console.error('❌ No valid medications found in CSV file');
          reject(new Error('No valid medications to import'));
          return;
        }

        // Show sample of processed data
        console.log('\n📋 Sample processed medication:');
        console.log(JSON.stringify(medications[0], null, 2));

        // Confirm before importing
        console.log(`\n⚠️  About to import ${medications.length} medications to Supabase.`);
        console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');

        setTimeout(async () => {
          const success = await importMedications(medications);
          if (success) {
            console.log('\n🎉 Import completed successfully!');
            resolve();
          } else {
            reject(new Error('Import failed'));
          }
        }, 5000);
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV file:', error);
        reject(error);
      });
  });
};

// CLI usage and validation
const showUsage = () => {
  console.log(`
📋 Medication Import Script

Usage:
  node import-medications.js <csv-file-path>

Environment Variables:
  SUPABASE_URL - Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key

CSV Format:
  name,ingredients,dosage,usage,safe_for_pregnant,safe_for_children,explanation,barcode
  "Aspirin","acetylsalicylic acid,starch","325mg","Take as directed","false","false","Pain reliever","1234567890123"

Required Fields:
  - name: Medication name
  - ingredients: Comma-separated list of ingredients

Optional Fields:
  - dosage: Recommended dosage
  - usage: Usage instructions
  - safe_for_pregnant: true/false/yes/no/1/0
  - safe_for_children: true/false/yes/no/1/0
  - explanation: Detailed explanation
  - barcode: Product barcode

Example CSV:
  name,ingredients,dosage,usage,safe_for_pregnant,safe_for_children,explanation,barcode
  "Tylenol","acetaminophen","500mg","Take 1-2 tablets every 4-6 hours","true","true","Pain and fever relief","1234567890123"
  "Ibuprofen","ibuprofen","200mg","Take with food","false","false","Anti-inflammatory pain reliever","9876543210987"
`);
};

// Main execution
const main = async () => {
  try {
    // Check if help is requested
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      showUsage();
      return;
    }

    // Validate environment variables
    if (!SUPABASE_URL || SUPABASE_URL === 'https://your-project.supabase.co') {
      console.error('❌ Please set SUPABASE_URL environment variable');
      process.exit(1);
    }

    if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === 'your-service-role-key') {
      console.error('❌ Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
      process.exit(1);
    }

    console.log('🚀 Starting medication import process...');
    await importFromCSV();
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
};

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n⚠️  Import cancelled by user');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  processMedicationRow,
  importMedications,
  importFromCSV,
}; 