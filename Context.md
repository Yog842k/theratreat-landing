# TheraTreat — Your One-Stop Platform for Therapy, Rehab, Wellness & Recovery

TheraTreat is a digital health and wellness platform built to simplify access to therapy services, rehabilitation equipment, self-help tools, and structured educational content. It connects patients, therapists, clinics, and learners into a unified ecosystem.

---

## 🌐 Core Modules

### 1. **TheraBook** (`/therabook`)
Book therapy sessions via video, audio, in-clinic, or home visits. Features therapist listings, smart concern-based recommendations, booking funnel, calendar integration, secure payments, and session feedback.

### 2. **TheraStore** (`/therastore`)
Buy therapy-related products and equipment. Categories include physio tools, speech kits, diagnostic aids, home therapy kits, clinic furniture, etc. Payments, delivery tracking, and review flow included.

### 3. **TheraSelf** (`/theraself`)
Use self-assessment tools and screening tests. Not for diagnosis but to encourage awareness and guide next steps (consultation, article, or product). Includes articles and video/workshop suggestions.

### 4. **TheraLearn** (`/theralearn`)
Browse and enroll in certified courses, webinars, and workshops. Targeted at therapists, patients, and students. Monetization, certification, and instructor tools included.

### 5. **TheraBlogs** (`/therablogs`)
Content hub for therapy guides, podcast episodes, expert articles, and mental/physical wellness tips.

---

## 👥 User Roles

- **Users / Patients** — Book sessions, shop products, take tests, consume content
- **Therapists** — Host sessions, track earnings, enroll in TheraLearn, write blogs
- **Clinics** — Manage bookings, offer services, receive payments
- **Students** — Learn via courses/workshops and switch to therapist later
- **Instructors / Vendors** — Create educational content or sell therapeutic products

---

## 🧠 Key Features

- Smart concern funnel (e.g. brain, bones, stress, speech, women’s health, etc.)
- Verified therapist profiles with ratings, qualifications, experience
- Appointment scheduler, video/audio calls, session timer, payment flow
- Abandoned booking and cart recovery system
- Post-session feedback + follow-up booking flow
- Unified dashboards for each role (user, clinic, therapist, instructor, student)
- Join-as/multi-role switching system
- Future: AI-powered concern detection, therapy suggestions, chatbot triage

---

## 🎨 Design System

- **Primary Color**: `#3B82F6` (blue-500)
- **Background**: `#F9FAFB` (gray-50), white
- **Font**: Sans-serif via Tailwind
- **Style**: Minimal, card-based UI, rounded corners, responsive layouts
- **Components**: TailwindCSS + custom shadcn/ui components (where used)

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Firebase (Firestore for now)
- **Auth & Payments**: Firebase Auth, Razorpay/Stripe (WIP)
- **AI Support**: GitHub Copilot + ChatGPT + future local LLM models

---

## 📁 Project Structure (WIP)

app/
├── therabook/ # Booking module
├── therastore/ # E-commerce store
├── theraself/ # Self-help tools
├── theralearn/ # Educational content
├── therablogs/ # Blogs, articles, podcasts
├── profile/ # Role-based profile views
├── dashboard/ # User, clinic, therapist, instructor dashboards
public/
components/
lib/
styles/


---

## 📌 Notes for Copilot

- Always maintain modular, scoped folders for each major route (ex: `/therabook/therapists/[id]/book`)
- Use functional React components and `loading.tsx` / `error.tsx` where needed
- Stick to Tailwind utility classes with consistent spacing and responsive breakpoints
- If creating components, prefer colocated `components/therabook/`, `components/shared/`, etc.
- Avoid hardcoding strings where context-based rendering can work
- Our main color palette is blue and white only

---

## 🚀 Vision

TheraTreat is more than a booking app. It aims to **standardize therapy access in India** by:
- Making quality therapists discoverable
- Bridging gaps between offline/online care
- Promoting self-awareness and digital literacy
- Enabling local clinics and therapists to scale via tech

---

> Built with purpose by Cresta Studio, 2025
