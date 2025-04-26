![Acharya Logo](public/logo.png)
# ✨ Acharya - Your AI Learning Companion ✨

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built during Hack VSIT 6.0](https://img.shields.io/badge/Built%20during-HackVSIT%206.0-%23ff69b4)](https://example.com/hacktastic2-link)

Tired of sifting through dense documents and lengthy podcasts? **Acharya** is here to revolutionize your learning process! This AI-powered platform effortlessly transforms static learning materials into interactive, bite-sized content, making studying more efficient and enjoyable.

Built with passion and innovation by team **Hacktastic**

## 🚀 Features That Will Boost Your Learning

Acharya is packed with features designed to make learning smarter, not harder:

- 🧠 **Intelligent Content Upload:** Easily upload your learning materials! Acharya supports various formats including PDFs, documents, **audio files (for podcasts)**, and even content directly from **YouTube links**.
- 📝 **AI-Powered Summarization:** Get instant, concise summaries of your content, helping you grasp key concepts quickly without reading everything.
- 🃏 **Automated Interactive Flashcards:** Acharya intelligently identifies crucial information and generates flashcards for effective, active recall and revision.
- 💬 **Enhanced Conversational Chat:** Chat directly with your uploaded documents or materials. Ask questions, clarify doubts, and gain deeper insights through a natural language interface powered by a **Retrieval Augmented Generation (RAG) model**.
- 📊 **Seamless Session Management:** Organize and keep track of your different learning sessions and materials all in one place.
- 🔒 **Secure User Authentication:** Your learning journey is personal. Acharya uses robust authentication powered by Clerk to keep your account and data secure.
- 🔗 **Aptos Integration:** Connect your Aptos wallet (including **keyless accounts**) to Acharya, enabling innovative features and the ability to perform **on-chain transactions** within the platform.
- 🛍️ **Resource Marketplace:** A dedicated section for Browse, sharing, and discovering valuable learning resources contributed by the community.

## 🛠️ Tech Stack: The Power Under the Hood

Acharya is built on a modern, scalable, and efficient technology stack to deliver a seamless learning experience:

- **Framework:** [Next.js](https://nextjs.org/) (Leveraging the powerful App Router for efficient routing, server components, and API routes)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Ensuring code quality, maintainability, and developer productivity through strong typing)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components (For building a responsive, modern, and accessible user interface rapidly)
- **Authentication:** [Clerk](https://clerk.com/) (Providing secure, scalable, and easy-to-implement user authentication and management)
- **Database:**
  - **ORM:** [Drizzle ORM](https://orm.drizzle.team/) (A modern, type-safe, and performant ORM for intuitive database interactions)
  - **Type:** [MySQL] (Common choices, often hosted on platforms like Neon, Supabase, or Vercel Postgres for scalability and ease of management)
- **AI/ML:** [Google AI] (Powering features like summarization, flashcard generation, and the RAG-based chat interface)
- **Storage:** [Vercel Blob] (Used for storing uploaded documents, audio files, and other learning materials efficiently)
- **Web3 Integration:** [Aptos] (Integrating blockchain capabilities for features like wallet connection, keyless accounts, and on-chain transactions)
- **Deployment:** [Vercel](https://vercel.com/) (Optimized hosting platform for Next.js applications, providing performance and ease of deployment)

## 🚀 Getting Started: Setting Up Acharya Locally

Follow these steps to get Acharya up and running on your local machine for development or testing.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) (v18 or later recommended)
- npm, yarn, or pnpm
- Your chosen database system (e.g., PostgreSQL, MySQL) installed and running, or access to a cloud database instance.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/pushkar1713/acharya
    cd acharya # Or your project directory name
    ```

2.  **Install dependencies:**

    ```bash
    npm install

    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory of the project. Copy the contents of `.env.example` (if available) or manually add the following required variables. You'll need to obtain keys/credentials from the respective services.

    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
    DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
    # GEMINI_API_BASE=...
    # UPLOAD_STORAGE_KEY=...
    ```

    **Replace placeholder values** (`...`, `pk_test_...`, `sk_test_...`, `sk-...`) with your actual credentials.

4.  **Set up the database schema:**
    Run the database migration script to apply the schema defined in your Drizzle ORM configuration.

    ```bash
    npm run migrate # Or npm run db:migrate / yarn db:migrate
    ```

    _(Confirm the exact script name in your `package.json` under `scripts`)_. This command uses Drizzle Kit to apply pending migrations to your database.

5.  **Run the development server:**
    Start the Next.js development server.

    ```bash
    npm run dev # Or npm run dev / yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser to see Acharya in action!

## 🌐 Deployment

The Site is live on this link : [Acharya AI](www.acharya.studio)

## 🤔 Vision & Roadmap

- Enhanced AI features (quiz generation, spaced repetition).
- Community features (sharing resources, study groups).

## 👋 Authors

Acharya was built by:

- **Pushkar**
  - GitHub: [https://github.com/pushkar1713/]
  - LinkedIn: [https://www.linkedin.com/in/pushkar1713/]
  - Twitter: [https://x.com/pushkar1713]
- **Pranay**
  - GitHub: [https://github.com/sharmapranay38/]
  - LinkedIn: [https://www.linkedin.com/in/sharmapranay38/]
  - Twitter: [https://x.com/sharmapranay38]

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Connect with Us

Have questions, feedback, or just want to say hi? Connect with us via the links above!
