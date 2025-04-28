# SBUCourses

[SBUCourses](https://sbucourses.com) is a web application designed to help Stony Brook University students plan their course schedules effectively. It provides an intuitive interface to browse courses, view detailed information (including past professors, syllabi, and community links).

## ✨ Features

*   **Course Browsing:** Easily search and filter courses by department, number, title, or SBCs.
*   **Detailed Course Info:** View credits, descriptions, prerequisites, past sections, professors (with RateMyProfessors integration), historical grade data, past syllabi (with user uploads), and relevant Reddit discussions.

## 💻 Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (v14+ with App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI Library:** [React](https://reactjs.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI and Tailwind)
*   **Database ORM:** [Prisma](https://www.prisma.io/)
*   **Database:** Supabase (PostgreSQL)

## 🚀 Getting Started

Follow these steps to set up the project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/MadR7/SBUCourses.git
    cd SBUCourses
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

3.  **Set up environment variables:**
    *   Create a `.env` file in the project root.
    *   Add your database connection string:
        ```env
        DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
        ```
    *   (Add any other required environment variables here, e.g., API keys for RMP if integrated later)

4.  **Set up the database:**
    *   Ensure you have a running PostgreSQL database instance matching the `DATABASE_URL`.
    *   Apply database migrations:
        ```bash
        npx prisma migrate dev
        ```
    *   (Optional) Seed the database with initial data if a seed script exists:
        ```bash
        npx prisma db seed
        ```

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    # or
    # pnpm dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

Contributions are welcome! If you'd like to help improve SBUCourses, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b fix/your-bug-fix-name
    ```
3.  **Make your changes.** Ensure code follows existing style conventions and add tests where applicable.
4.  **Commit your changes** with descriptive messages.
5.  **Push your branch** to your forked repository.
6.  **Open a Pull Request** to the `main` branch of the original repository.

Please provide a clear description of your changes in the Pull Request.

## 📜 License

This project is open source.
