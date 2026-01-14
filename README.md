# Task Tracker

A beautiful and intuitive task management application built with React, TypeScript, and modern web technologies.

![Task Tracker](https://img.shields.io/badge/React-18.3.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![Vite](https://img.shields.io/badge/Vite-5.4-purple) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan)

## ✨ Features

- **📋 Task Management** - Create, edit, delete, and organize tasks with ease
- **🏷️ Categories** - Organize tasks by Work, Personal, or Urgent categories
- **⭐ Priority Levels** - Set Low, Medium, or High priority for each task
- **📅 Due Dates** - Track deadlines with an intuitive calendar widget
- **📁 Projects** - Group tasks into projects for better organization
- **🌓 Dark Mode** - Beautiful light and dark themes
- **💾 Persistent Storage** - Data is saved to localStorage and persists across sessions
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI Components |
| **React Router** | Routing |
| **React Query** | Server State Management |
| **date-fns** | Date Utilities |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd task-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/        # React components
│   ├── ui/           # shadcn/ui components
│   ├── Header.tsx    # App header with navigation
│   ├── TaskCard.tsx  # Individual task display
│   └── ...
├── hooks/            # Custom React hooks
│   ├── useTasks.ts   # Task state management with localStorage
│   ├── useProjects.ts # Project state management with localStorage
│   └── useTheme.ts   # Theme toggle
├── data/             # Mock/seed data
├── types/            # TypeScript type definitions
├── pages/            # Page components
└── lib/              # Utility functions
```

## 💾 Data Persistence

Tasks and projects are automatically saved to `localStorage`:

- **Tasks**: Stored under key `task-tracker-tasks-data`
- **Projects**: Stored under key `task-tracker-projects-data`
- **Theme**: Stored under key `theme`

Data persists across browser sessions. To reset to default data, clear your browser's localStorage.

## 🎨 Customization

### Theming

The app uses CSS custom properties for theming. Customize colors in `src/index.css`:

```css
:root {
  --primary: 160 84% 39%;      /* Emerald green */
  --work: 217 91% 60%;         /* Blue for work tasks */
  --personal: 38 92% 50%;      /* Amber for personal tasks */
  --urgent: 0 84% 60%;         /* Red for urgent tasks */
}
```

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

---

Built with ❤️ using React and TypeScript
