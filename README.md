# MedMate

MedMate is a mobile application built with React Native and Expo, designed to help users manage and understand their medications. It features user authentication, a medication search function, and a barcode scanner to quickly identify medications.

## Features

- **User Authentication:** Secure login and registration.
- **Medication Search:** Search for medications by name.
- **Barcode Scanner:** Scan medication barcodes to retrieve information.
- **Medication Details:** View detailed information about medications, including usage, dosage, ingredients, and safety information.

## Technologies Used

- React Native
- Expo
- React Navigation
- Supabase (for backend and database)
- Expo Barcode Scanner



## Project Structure

- `assets/`: Contains static assets like images.
- `components/`: Reusable UI components.
- `context/`: React Context for global state management (e.g., `UserContext`).
- `lib/`: Utility functions or configurations (e.g., Supabase client).
- `screens/`: Different screens/pages of the application (Login, Register, Search, Scanner, etc.).
- `App.tsx`: Main application entry point and navigation setup.
- `package.json`: Project dependencies and scripts.
