# Vitality

This modern fitness tracker supports workout tracking, with plans for future expansion to include additional features, as outlined on the mock landing page. The application is set for deployment soon, and the URL will be provided in the repository once publicly available. I look forward to continuing development, exploring new functionalities, and enhancing my skills. Feel free to use any related components or methods for your own projects!

## Getting Started

### Prerequisites

- **Node.js**
- **Docker**
- **npm**

### Setup

After completing the steps below to get the application running on your local machine, you can access it via [http://localhost:3000](http://localhost:3000) in your browser to start tracking your workouts!

If you encounter any issues or need further assistance, feel free to submit a GitHub Issue. Be sure to include detailed information such as steps to reproduce, expected versus actual behavior, and any relevant logs or screenshots.

1. **Clone the repository**

   ```bash
   git clone https://github.com/jeffrey-asm/vitality
   cd vitality
   ```

2. **Install required dependencies**

   ```bash
   npm install
   ```

3. **Build the project**

   ```bash
   npm run build
   ```

4. **Start the application**

   ```bash
   docker-compose up
   ```

### Pages

- `unauthenticated`
  - [Landing](http://localhost:3000/)
    - Showcases current and upcoming app expansions through engaging sections, complemented by mock testimonials and diverse imagery.

  - [Log In](http://localhost:3000/login)
    - Allows returning users to securely access their accounts.

  - [Sign Up](http://localhost:3000/signup)
    - Enables new users to create an account and quickly get started with the app.
- `authenticated`
  - [Workouts](http://localhost:3000/home/workouts)
    - Lets users log and filter workouts over time, including exercises with their detailed entries (weight, repetitions, interval, etc.)

  - [Settings](http://localhost:3000/home/settings)
    - Allows users to customize profile attributes, manage application preferences, terminate sessions, and delete accounts.

  - [Feedback](http://localhost:3000/home/feedback)
    - Allows users to submit feedback, report issues, and suggest improvements.

## Development

### Folder Structure

- `/`
  - Contains dependency and configuration files for Next.js, NextAuth.js, TypeScript, Tailwind CSS, Jest, Nginx, and Docker.
  - `/app`
    - Provides layouts for individual pages, authentication workflows, and "not found" pages.
  - `/components`
    - Contains reusable React components, as well as page-specific ones.
  - `/lib`
    - Includes shared utilities, NextAuth.js session management, secure server actions, and database initialization resources.
  - `/prisma`
    - Contains Prisma ORM migration scripts and schema files.
  - `/public`
    - Stores global and page-specific assets, fonts, and configuration files.
  - `/tests`
    - Includes global and page-specific unit tests, mock data, and a singleton-pattern Prisma ORM client.

### Processes

Ensure the `docker-compose.yaml` file is configured for development instead of production. Update the command in the app container from `npm run start` to `npm run dev`.

  ```yaml
  command: sh -c "npm run dev"
  ```

1. **Start Development Environment**

   ```bash
   docker compose up
   ```

2. **Pause Development Environment**

   ```bash
   docker compose stop
   ```

3. **Reset Development Environment**

   ```bash
   docker compose down -v --remove-orphans
   ```

### Logging

1. **View Live Logs**

   ```bash
   docker compose logs -f
   ```

2. **View Recent Logs**

   ```bash
   docker compose logs
   ```

3. **View Recent Logs for Specific Containers**

   ```bash
   docker logs <vitality_app | vitality_postgres | vitality_nginx>
   ```

### Database

1. **Interactive Access via Docker (PostgreSQL)**

   ```bash
   docker exec -it vitality_postgres psql -U postgres -d vitality
   ```

2. **Interactive Access via Prisma ORM**

   ```bash
   docker exec -it vitality_app npx prisma studio
   ```

## Testing

1. **Run All Unit Tests**

   ```bash
   npm run tests
   ```

2. **Run Specific Unit Test(s)**

   ```bash
   npx jest <test-file(s)> --collect-coverage --detectOpenHandles --verbose
   ```

## Linting

1. **View Linting Errors**

   ```bash
   npx eslint . --ignore-pattern 'next-env.**'
   ```

2. **Fix Linting Errors**

   ```bash
   npm run lint
   ```
