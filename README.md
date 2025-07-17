# HireHero

An end-to-end hiring platform for all kinds of work with instant updates and everything you need for recruitment.

## Features

- **Job Management** - Post jobs, manage applications, track candidates
- **Smart Search** - Find candidates quickly with intelligent search
- **Communication** - Built-in messaging, voice/video calls
- **Interviews** - Schedule interviews, video calls, take notes
- **Code Editor** - Technical interviews with live code editing
- **Real-time Updates** - Instant notifications for everything
- **Shortlisting** - Easy candidate shortlisting and management

## Tech Stack

- **Frontend:** SvelteKit, TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** BetterAuth
- **Search:** FuseJS
- **Real-time:** Socket.io
- **Cloud:** AWS (hosting, storage)

## Setup

1. Clone the repo

```bash
git clone https://github.com/tejxsmore/hirehero.git
cd hirehero
```

2. Install dependencies

```bash
npm install
```

3. Setup environment

```bash
cp .env.example .env
# Edit .env with your database and AWS credentials
```

4. Setup database

```bash
npm run db:push
```

5. Run development server

```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:push` - Push database schema
- `npm run test` - Run tests

## License

This project is licensed under MIT License
