# Project Improvement Tasks

- [x] Refactor project structure to use feature-based folders and ensure consistent naming conventions across screens and components
- [x] Create a centralized types directory for shared TypeScript interfaces and types
- [ ] Evaluate and improve state management: consider alternatives to Context API if needed
- [x] Separate business logic from UI components using hooks or service files
- [x] Expand the theming system in lib/colors.ts to support light/dark mode, spacing, and typography
- [x] Extract and document reusable UI components (e.g., buttons, inputs, modals) for consistency and reusability
- [x] Audit and improve accessibility across all components (labels, roles, color contrast, etc.)
- [ ] Add unit and integration tests for components, screens, and utility functions using Jest and React Native Testing Library
- [ ] Set up end-to-end (E2E) testing with Detox or Appium for critical user flows
- [ ] Optimize component rendering using React.memo, useCallback, and useMemo where appropriate
- [ ] Implement lazy loading for screens and heavy components to improve initial load time
- [ ] Add centralized error handling (error boundaries, global error handlers) and integrate logging (e.g., Sentry)
- [ ] Abstract Supabase and other API calls into a dedicated services or api directory, and use data validation schemas (e.g., Zod, Yup)
- [ ] Set up and enforce linting (ESLint) and code formatting (Prettier) across the project
- [ ] Set up continuous integration (CI) for automated testing and builds
- [ ] Move configuration and secrets to environment variables using .env files
- [ ] Update and expand README documentation with setup, usage, and contribution guidelines
- [ ] Document UI components using Storybook or similar tools 

# New Features

- [ ] OCR photo based pill recognition