# Modern Premium Landing Page

A high-end, cinematic landing page built with Next.js, Framer Motion, and GSAP. Inspired by the design language of Apple, Stripe, and Linear.

## Features

- **Cinematic Scrolling**: Powered by Lenis for ultra-smooth, high-inertia scrolling.
- **GSAP ScrollTrigger**: Complex pinning and synchronization effects (Apple-style showcase).
- **Framer Motion**: Smooth UI transitions, parallax, and staggered reveals.
- **Glassmorphism**: Elegant translucent UI elements with backdrop blur.
- **Bento Grid Stats**: Modern data visualization with GSAP number counters.
- **3D Perspective Showcase**: Floating UI mockups with scroll-based 3D rotation.
- **Performance Optimized**: 60 FPS animations, lazy-loaded components, and clean architecture.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Animations**: Framer Motion & GSAP
- **Styling**: Tailwind CSS 4
- **Smooth Scroll**: Lenis
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Folder Structure

- `/src/app`: Next.js pages and global styles.
- `/src/components/providers`: Context providers (Smooth Scroll).
- `/src/components/layout`: Global components (Navbar, Footer).
- `/src/components/sections`: Landing page sections (Hero, Stats, etc.).
- `/src/lib`: Utility functions and GSAP initialization.
