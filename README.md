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

**Install Dependencies:**

```bash
npm install
```

**Create Project Build:**

```bash
npm run build
```

**Start Development:**

```bash
docker compose up
```

**Pause Development:**

```bash
docker compose stop
```

**Restart Development (Clear Containers, Networks, Volumes):**

```bash
docker compose down -v --remove-orphans
```

### Logs

**View Real-time Logs for All Containers:**

```bash
docker compose logs -f
```

**View Recent Logs for All Containers:**

```bash
docker compose logs
```

**View Recent Logs for Specific Container:**

```bash
docker logs <container-name>
```

## Database

**Access Database via Docker Container:**

```bash
docker exec -it vitality_postgres psql -U postgres -d vitality
```

**Access Database via Prisma ORM:**

```bash
docker exec -it vitality_app npx prisma studio
```

**Make Schema Changes (Development):**

- Edit `tests/init.sql`
- Apply changes to Prisma ORM:

```bash
docker exec -it vitality_app npx prisma db pull
```

**Apply Migrations with Prisma ORM:**

- Modify the model in `prisma/schema.prisma`
- Apply migrations with:

```bash
docker exec -it vitality_app npx prisma migrate dev --name <migration-name>
```

## Testing

**Run Unit Tests:**

```bash
npm run tests
```

## Linting

**Fix Linting Errors:**

```bash
npm run lint
```
