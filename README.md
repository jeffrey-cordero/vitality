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

4. **Start the application with Docker**

   ```bash
   docker-compose up
   ```

## Pages

### Unauthenticated Pages

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
  - Project dependencies and configuration files for Next.js, NextAuth.js, TypeScript, Tailwind CSS, Jest, Nginx, and Docker.
  - `app`
    - Layouts for individual pages, authentication workflows, and "not found" pages.
  - `components`
    - Reusable React components as well as those tailored to specific pages.
  - `lib`
    - Shared utilities, NextAuth.js session management, secure server actions, and database initialization resources.
  - `prisma`
    - Prisma ORM migration and schema files.
  - `public`
    - Globally and page-specific assets and fonts and configurations
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
