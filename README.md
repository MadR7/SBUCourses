# SBUScheduler

SBUScheduler is a web application designed to help Stony Brook University (SBU) students browse courses, view historical section data, access professor ratings, and analyze grade distributions to make informed decisions about course selection.

## Features

*   **Course Browsing:** Search and filter courses by Department and Stony Brook Curriculum (SBC) requirements.
*   **Detailed Course Information:** View course descriptions, credits, prerequisites, and corequisites.
*   **Past Section Data:** Explore previous sections offered for a course, including instructor, semester, and grade distributions.
*   **Professor Information:** View RateMyProfessors (RMP) ratings, difficulty, and 'would take again' percentages for instructors (where available).
*   **Grade Distribution Visualization:** See historical grade distributions (counts and percentages) for past sections using interactive charts.
*   **Dynamic Filtering:** Filter past sections by semester and instructor.
*   **Responsive Design:** UI built with Tailwind CSS and shadcn/ui for usability across different screen sizes.

## Tech Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **UI Library:** React
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui
*   **Database ORM:** Prisma
*   **Database:** Supabase
*   **Data Visualization:** Recharts
*   **HTTP Client:** Axios (for potential client-side API calls, though primarily server-side fetching is used)

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd SBUScheduler
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**
    *   Create a `.env` file in the project root.
    *   Add your database connection string:
        ```env
        DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
        ```
    *   Replace the placeholder values with your actual database credentials.

4.  **Apply database migrations:**
    *   Ensure your database server is running.
    *   Run Prisma migrate to set up the database schema:
        ```bash
        npx prisma migrate dev
        ```
    *   *(Optional)* If you need to seed the database with initial data, you might need to run a seed script (if one exists):
        ```bash
        # npx prisma db seed (if configured in package.json)
        ```

## Running the Application

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Project Structure

```
SBUScheduler/
├── app/                  # Next.js App Router: Pages and API routes
│   ├── api/              # API endpoint handlers
│   ├── (main)/           # Main application pages group (optional)
│   │   └── course-page.tsx # Dynamically rendered course list page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirects or initial load)
├── components/           # React components
│   ├── course-info/      # Components specific to the course details dialog
│   ├── ui/               # shadcn/ui generated components
│   ├── course-info-dialog.tsx
│   ├── course-list.tsx
│   └── filter-screen.tsx
├── lib/                  # Shared libraries, utilities, hooks, data fetching
│   ├── constants/        # Application constants (e.g., grades)
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # General utility functions
│   ├── api.ts            # Axios instance config
│   ├── data.ts           # Server-side data fetching functions
│   ├── prisma.ts         # Prisma client singleton setup
│   └── utils.ts          # cn utility function
├── prisma/               # Prisma schema and migrations
│   ├── migrations/
│   └── schema.prisma
├── public/               # Static assets
├── types/                # TypeScript type definitions (Course, Section)
├── .env.example          # Example environment variables
├── .eslintrc.json        # ESLint configuration
├── .gitignore            # Git ignore rules
├── next.config.mjs       # Next.js configuration
├── package.json          # Project dependencies and scripts
├── postcss.config.js     # PostCSS configuration (for Tailwind)
├── README.md             # Project documentation (this file)
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## API Endpoints

The application exposes the following internal API endpoints:

*   `GET /api/courses`: Fetches a list of courses based on query parameters (department, SBCs).
*   `GET /api/sections/[courseID]`: Fetches all past sections for a given `courseID`.
*   `GET /api/professor?name=[professorName]`: Fetches professor details by name (query parameter).
*   `GET /api/professors/[name]`: Fetches professor details by name (URL path parameter).

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

