# Vitality

This modern fitness tracker supports workout tracking, with plans for future expansion to include additional features, as outlined on the mock landing page. The application is set for deployment soon, and the URL will be provided in the repository once publicly available. I look forward to continuing development, exploring new functionalities, and enhancing my skills. Feel free to use any related components or methods for your own projects!

## Getting Started

### Prerequisites

- **Node.js**
- **Docker**
- **npm**

### Project Setup

After completing the steps below to get the application running on your local machine, you can access it via [http://localhost:3000](http://localhost:3000) in your browser to start tracking your workouts!

If you encounter any issues or need further assistance, feel free to submit a GitHub Issue. Be sure to include detailed information such as steps to reproduce, expected versus actual behavior, and any relevant logs or screenshots.

### Setup Instructions

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

4. **Start the application with Docker**

   ```bash
   docker-compose up
   ```

## Pages

### Unauthenticated Pages

- [Landing](http://localhost:3000/)
  - Showcases images and sections highlighting current and future app expansions, along with mock testimonials.

- [Log In](http://localhost:3000/login)
  - Allows returning users to securely access their accounts.

- [Sign Up](http://localhost:3000/signup)
  - Enables new users to create an account and quickly get started with the app.

### Authenticated Pages

- [Workouts](http://localhost:3000/home/workouts)
  - Lets users log and filter workouts over time, including exercises with detailed entries such as weight, repetitions, intervals, and more.

- [Settings](http://localhost:3000/home/settings)
  - Allows users to customize profile attributes, manage application preferences, terminate sessions, and delete accounts.

- [Feedback](http://localhost:3000/home/feedback)
  - Allows users to submit feedback, report issues, and suggest improvements.

## Development

### Folder Structure

The following outlines the organization of the project folder structure, providing a brief description of purpose and contents of each folder. This structure is designed to help maintain the separation of concerns, making it easier to locate specific functionality and manage the project efficiently.

- `/`
  - `auth.config.ts` & `auth.ts`
    - Configuration and authentication-related logic for the application ([NextAuth.js](https://next-auth.js.org/)).
  - `next.config.js`
    - Configuration for Next.js, including custom settings for the app.
  - `middleware.ts`
    - Middleware for handling Next.js requests and responses.
  - `docker-compose.yaml`
    - Docker Compose configuration for managing multi-container applications.
  - `nginx.conf`
    - Nginx configuration for reverse proxy setup and other related configurations.
  - `jest.config.js`
    - Jest configuration for running unit tests.
  - `next-env.d.ts`
    - TypeScript environment definitions for Next.js (created during build stage).
  - `package-lock.json` & `package.json`
    - Dependency management files for the project.
  - `tailwind.config.ts`
    - Configuration for Tailwind CSS in the project.
  - `postcss.config.js`
    - Configuration for PostCSS, used in processing CSS.
  - `tsconfig.json`
    - TypeScript configuration file for the project.
- `app`
  - `home/`
    - Home page-related components, including feedback, settings, and workouts.
  - `login/`
    - Login page.
  - `signup/`
    - Signup page.
  - `layout.tsx`
    - Main layout file for the application.
  - `not-found.tsx`
    - Handles "not found" page when a route doesn't exist.
- `components`
  - `authentication/`
    - Login and signup components.
  - `global/`
    - Global reusable components, such as buttons, footers, modals, and form elements.
  - `home/`
    - Components specific to the home page, including feedback, settings, and workouts.
  - `landing/`
    - Landing page components like testimonials, pricing, and highlights.
- `lib/`
  - `authentication/`
    - Functions for login, signup, and session management.
  - `database/`
    - Database initialization SQL files.
  - `global/`
    - Shared utilities like reducers, regex functions, and response handlers.
  - `home/`
    - Logic for handling home-related features such as feedback, settings, and workouts.
  - `landing/`
    - Landing page-related logic (e.g., testimonials).
  - `prisma/`
    - Prisma client initialization.
- `prisma/`
  - `migrations/`
    - Database migration files.
  - `schema.prisma`
    - Defines the database schema.
- `tests/`
  - `authentication/`
    - Tests for authentication-related components and logic.
  - `global/`
    - Global tests for utilities and response handling.
  - `home/`
    - Tests for components related to the home page.
  - `shared.ts`
    - Shared test utilities or mock data.
  - `singleton.ts`
    - Mock prisma client following the singleton pattern.

### Processes

Ensure the `docker-compose.yaml` file is configured correctly for development instead of a production environment. Change the command in the app container from:

  ```yaml
    command: sh -c "npm run start"
```

to:

  ```yaml
  command: sh -c "npm run dev"
  ```

This ensures the development environment starts correctly when using the `docker compose up`.

1. **Start Development**

```bash
docker compose up
```

2. **Pause Development**

```bash
docker compose stop
```

2. **Reset Development (Containers, Networks, Volumes):**

```bash
docker compose down -v --remove-orphans
```


### Logging

1. **View live logs**

```bash
docker compose logs -f
```

2. **View most recent logs**

```bash
docker compose logs
```

3. **View most recent logs for specific containers**

```bash
docker logs <vitality_app | vitality_postgres | vitality_nginx>
```

### Database

1. **Access Database via Docker**

```bash
docker exec -it vitality_postgres psql -U postgres -d vitality
```

2. **Access Database via Prisma ORM**

```bash
docker exec -it vitality_app npx prisma studio
```

3. **Apply updates to SQL Schema**

   1. Update `/lib/database/init.sql`
   2. Reset development
   3. Apply changes to Prisma ORM

```bash
docker exec -it vitality_app npx prisma db pull
```

4. **Apply Migrations with Prisma ORM:**

- Modify the model(s) in `prisma/schema.prisma`
- Apply migration:

```bash
docker exec -it vitality_app npx prisma migrate dev --name <migration-name>
```

## Testing

1. **Run Unit Tests**

```bash
npm run tests
```

## Linting

1. **Fix Linting Errors**

```bash
npm run lint
```
