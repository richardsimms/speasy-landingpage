# My V0 Project

A modern web application built with Next.js 15, React 19, and a comprehensive UI component library.

## Overview

This project is a Next.js application that leverages the power of React 19 and various UI components from Radix UI. It includes authentication with Supabase, form handling with React Hook Form, and styling with Tailwind CSS.

## Features

- **Modern Stack**: Built with Next.js 15 and React 19
- **UI Components**: Comprehensive set of accessible UI components from Radix UI
- **Authentication**: Integrated with Supabase
- **Form Handling**: Uses React Hook Form with Zod validation
- **Styling**: Tailwind CSS for utility-first styling
- **Theming**: Dark/light mode support with next-themes
- **Data Visualization**: Recharts for creating beautiful charts
- **Markdown Support**: React Markdown for rendering markdown content

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/my-v0-project.git
   cd my-v0-project
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Development

Run the development server: