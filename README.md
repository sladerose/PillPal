# PillPal

PillPal is a mobile application built with React Native and Expo, designed to help users manage and understand their medications. It features user authentication, a medication search function, and a barcode scanner to quickly identify medications.

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

- `src/`: Main source code directory.
  - `assets/`: Static assets like images and fonts.
  - `components/`: Global, reusable UI components (Buttons, Inputs, etc.).
  - `features/`: Feature-based modules (e.g., `auth`, `medication-search`). Each feature contains its own screens, components, hooks, and services.
  - `hooks/`: Global React hooks.
  - `lib/`: Core libraries and configurations (e.g., Supabase client, theming).
  - `navigation/`: React Navigation setup and navigators.
  - `types/`: Shared TypeScript types and interfaces.
- `App.tsx`: Main application entry point and navigation setup.
- `package.json`: Project dependencies and scripts.
