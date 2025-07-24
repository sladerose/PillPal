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
- ESLint & Prettier (for code quality)

## Setup

### Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js**: [Download & Install Node.js](https://nodejs.org/en/download/) (LTS version recommended)
-   **npm** (comes with Node.js) or **Yarn** (optional):
    ```bash
    npm install -g yarn
    ```
-   **Expo CLI**:
    ```bash
    npm install -g expo-cli
    ```

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/PillPal.git
    cd PillPal
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Environment Variables:**
    Create a `.env` file in the root of the project based on the `.env.example` file. This file will contain your Supabase credentials.
    ```
    EXPO_PUBLIC_SUPABASE_URL="your_supabase_url_here"
    EXPO_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key_here"
    ```
    Replace `"your_supabase_url_here"` and `"your_supabase_anon_key_here"` with your actual Supabase project URL and anonymous key.

### Running the Application

To start the development server:

```bash
npm start
# or
yarn start
```

This will open the Expo Dev Tools in your browser. You can then:
-   Scan the QR code with the Expo Go app on your physical device (iOS or Android).
-   Run on an iOS simulator (`i` then `enter` in the terminal).
-   Run on an Android emulator (`a` then `enter` in the terminal).
-   Run in a web browser (`w` then `enter` in the terminal).

## Usage

1.  **Login/Register:** Upon launching the app, you will be prompted to log in or register a new account.
2.  **Medication Search:** Use the search screen to find medications by name.
3.  **Barcode Scanner:** Utilize the barcode scanner to quickly identify medications by scanning their barcodes.
4.  **View Details:** Access detailed information about medications, including usage, dosage, and safety information.

## Contribution Guidelines

We welcome contributions to PillPal! To contribute, please follow these steps:

1.  **Fork the repository.**
2.  **Clone your forked repository:**
    ```bash
    git clone https://github.com/your-username/PillPal.git
    cd PillPal
    ```
3.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b bugfix/issue-description
    ```
4.  **Make your changes.**
5.  **Ensure code quality:**
    Before committing, run the linting and formatting checks:
    ```bash
    npm run lint
    npm run format:check
    ```
    To automatically fix linting issues and format your code:
    ```bash
    npm run lint:fix
    npm run format
    ```
6.  **Commit your changes** with a clear and concise commit message.
7.  **Push your branch** to your forked repository.
8.  **Open a Pull Request** to the `main` branch of the original repository.

### Coding Style

This project uses ESLint for linting and Prettier for code formatting. Please ensure your code adheres to the established style by running the `npm run lint` and `npm run format:check` commands before submitting a pull request.

### Testing

Currently, unit and integration tests are being set up. Please ensure any new features or bug fixes are accompanied by appropriate tests where applicable.