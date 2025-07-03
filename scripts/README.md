# Medication Import Script

This script helps you import medication data from a CSV file into your Supabase database.

## Prerequisites

1. **Node.js** (v14 or higher)
2. **Supabase project** with the `medications` table created
3. **Supabase service role key** (for admin access)

## Installation

1. Install the required dependencies:
```bash
npm install csv-parser @supabase/supabase-js
```

2. Set up environment variables:
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Database Schema

Make sure your `medications` table has the following structure:

```sql
create table medications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ingredients text[] not null,
  usage text,
  dosage text,
  safe_for_pregnant boolean,
  safe_for_children boolean,
  barcode text,
  explanation text
);
```

## CSV Format

Your CSV file should have the following columns:

| Column | Required | Type | Description |
|--------|----------|------|-------------|
| `name` | Yes | Text | Medication name |
| `ingredients` | Yes | Text | Comma-separated list of ingredients |
| `dosage` | No | Text | Recommended dosage |
| `usage` | No | Text | Usage instructions |
| `safe_for_pregnant` | No | Boolean | true/false/yes/no/1/0 |
| `safe_for_children` | No | Boolean | true/false/yes/no/1/0 |
| `explanation` | No | Text | Detailed explanation |
| `barcode` | No | Text | Product barcode |

### Example CSV

```csv
name,ingredients,dosage,usage,safe_for_pregnant,safe_for_children,explanation,barcode
"Tylenol","acetaminophen","500mg","Take 1-2 tablets every 4-6 hours","true","true","Pain and fever relief","1234567890123"
"Aspirin","acetylsalicylic acid,starch","325mg","Take with food","false","false","Pain reliever","2345678901234"
```

## Usage

### Basic Usage

```bash
node import-medications.js path/to/your/medications.csv
```

### Using the Sample Data

```bash
node import-medications.js sample-medications.csv
```

### Help

```bash
node import-medications.js --help
```

## Features

- **Data Validation**: Validates required fields and data types
- **Progress Tracking**: Shows processing progress for large files
- **Error Handling**: Gracefully handles invalid rows and continues processing
- **Safety Confirmation**: 5-second delay before import with option to cancel
- **Detailed Logging**: Comprehensive output showing success/failure statistics

## Output Example

```
🚀 Starting medication import process...
📁 Reading CSV file: sample-medications.csv
📊 Processed 100 rows...
📊 Processed 200 rows...

📊 Processing Summary:
   Total rows processed: 250
   Valid medications: 248
   Invalid rows: 2

📋 Sample processed medication:
{
  "name": "Tylenol (Acetaminophen)",
  "ingredients": ["acetaminophen"],
  "dosage": "500mg",
  "usage": "Take 1-2 tablets every 4-6 hours as needed for pain or fever",
  "safe_for_pregnant": true,
  "safe_for_children": true,
  "explanation": "Acetaminophen is a pain reliever and fever reducer...",
  "barcode": "1234567890123"
}

⚠️  About to import 248 medications to Supabase.
Press Ctrl+C to cancel or wait 5 seconds to continue...

🔄 Importing 248 medications to Supabase...
✅ Successfully imported 248 medications

🎉 Import completed successfully!
```

## Error Handling

The script handles various error scenarios:

- **Missing CSV file**: Shows usage instructions
- **Invalid environment variables**: Validates Supabase configuration
- **Malformed data**: Skips invalid rows and continues processing
- **Network errors**: Retries and provides detailed error messages
- **Database constraints**: Reports constraint violations

## Troubleshooting

### Common Issues

1. **"CSV file not found"**
   - Check the file path is correct
   - Ensure the file exists and is readable

2. **"Please set SUPABASE_URL environment variable"**
   - Set the `SUPABASE_URL` environment variable
   - Get the URL from your Supabase project settings

3. **"Please set SUPABASE_SERVICE_ROLE_KEY environment variable"**
   - Set the `SUPABASE_SERVICE_ROLE_KEY` environment variable
   - Get the service role key from your Supabase project settings

4. **"Error importing medications"**
   - Check your database schema matches the expected format
   - Verify RLS policies allow service role access
   - Check for duplicate barcodes or constraint violations

### Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and Service Role Key
4. Set them as environment variables

## Security Notes

- The script uses the service role key for admin access
- Never commit your service role key to version control
- Use environment variables for sensitive configuration
- The service role bypasses RLS policies

## Contributing

To extend the script:

1. Add new validation functions in the validation section
2. Update the `processMedicationRow` function for new fields
3. Modify the CSV format documentation
4. Add new error handling as needed 