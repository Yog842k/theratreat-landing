# 📁 Project Folder Structure Map

## TheraTreat - Website Sitemap UI/UX Mockup

```
📁 Website Sitemap UI_UX Mockup - Copy/
├── 📄 .env.example                      # Environment variables example
├── 📄 .env.local                        # Local environment variables
├── 📄 .eslintrc.json                    # ESLint configuration
├── 📄 .gitignore                        # Git ignore rules
├── 📄 Attributions.md                   # Project attributions
├── 📄 Context.md                        # Project context documentation
├── 📄 FOLDER_STRUCTURE.md              # This file - project structure map
├── 📄 fix-imports.bat                   # Windows batch script for fixing imports
├── 📄 fix-imports.ps1                   # PowerShell script for fixing imports
├── 📄 logo.png                          # Project logo
├── 📄 next-env.d.ts                     # Next.js TypeScript declarations
├── 📄 next.config.js                    # Next.js configuration
├── 📄 package-lock.json                 # NPM dependency lock file
├── 📄 package.json                      # NPM package configuration
├── 📄 postcss.config.js                 # PostCSS configuration
├── 📄 tailwind.config.js                # Tailwind CSS configuration
├── 📄 tsconfig.json                     # TypeScript configuration
├── 📄 tsconfig.tsbuildinfo              # TypeScript build info cache
│
├── 📁 .git/                             # Git repository data
├── 📁 .next/                            # Next.js build output
├── 📁 .vscode/                          # VS Code workspace settings
│   └── 📄 tasks.json                    # VS Code tasks configuration
├── 📁 node_modules/                     # NPM dependencies
│
├── 📁 app/                              # Next.js App Router directory
│   ├── 📄 layout.tsx                    # Root layout component
│   ├── 📄 page.tsx                      # Home page component
│   │
│   ├── 📁 api/                          # API routes
│   │   ├── 📁 login/                    # Login API endpoint (empty)
│   │   ├── 📁 me/                       # User info API endpoint (empty)
│   │   └── 📁 signup/                   # Signup API endpoint (empty)
│   │
│   ├── 📁 auth/                         # Authentication pages
│   │   ├── 📁 login/                    # Login page
│   │   │   └── 📄 page.tsx
│   │   └── 📁 signup/                   # Signup page
│   │       └── 📄 page.tsx
│   │
│   └── 📁 therabook/                    # TheraBook feature directory
│       ├── 📄 error.tsx                 # Error boundary
│       ├── 📄 layout.tsx                # TheraBook layout
│       ├── 📄 loading.tsx               # Loading component
│       ├── 📄 page.tsx                  # TheraBook main page
│       │
│       ├── 📁 info/                     # Information pages
│       │   └── 📄 page.tsx
│       │
│       ├── 📁 profile/                  # User profile management
│       │   ├── 📁 therapist/            # Therapist profile pages
│       │   │   ├── 📄 error.tsx
│       │   │   ├── 📄 loading.tsx
│       │   │   └── 📄 page.tsx
│       │   │
│       │   └── 📁 user/                 # User profile pages
│       │       ├── 📄 error.tsx
│       │       ├── 📄 loading.tsx
│       │       ├── 📄 page.tsx
│       │       ├── 📄 page-simple.tsx   # Simple profile variant
│       │       └── 📄 page_new.tsx      # New profile design
│       │
│       ├── 📁 smart-selector/           # Smart therapist selector
│       │   ├── 📄 error.tsx
│       │   ├── 📄 loading.tsx
│       │   ├── 📄 page.tsx              # Main selector
│       │   ├── 📄 page-backup.tsx       # Backup version
│       │   └── 📄 page-fixed.tsx        # Fixed version
│       │
│       └── 📁 therapists/               # Therapist directory
│           ├── 📄 error.tsx
│           ├── 📄 loading.tsx
│           ├── 📄 page.tsx              # Therapist list
│           │
│           └── 📁 [id]/                 # Dynamic therapist pages
│               ├── 📄 error.tsx
│               ├── 📄 loading.tsx
│               ├── 📄 page.tsx          # Individual therapist profile
│               │
│               └── 📁 book/             # Booking flow
│                   ├── 📄 error.tsx
│                   ├── 📄 loading.tsx
│                   ├── 📄 page.tsx      # Booking form
│                   │
│                   ├── 📁 confirmation/ # Booking confirmation
│                   │   ├── 📄 error.tsx
│                   │   ├── 📄 loading.tsx
│                   │   └── 📄 page.tsx
│                   │
│                   ├── 📁 follow-up/    # Post-session follow-up
│                   │   ├── 📄 error.tsx
│                   │   ├── 📄 loading.tsx
│                   │   └── 📄 page.tsx
│                   │
│                   ├── 📁 payment/      # Payment processing
│                   │   ├── 📄 error.tsx
│                   │   ├── 📄 loading.tsx
│                   │   └── 📄 page.tsx
│                   │
│                   └── 📁 session/      # Session management
│                       ├── 📄 error.tsx
│                       ├── 📄 loading.tsx
│                       ├── 📄 page.tsx
│                       │
│                       └── 📁 feedback/ # Session feedback
│                           ├── 📄 error.tsx
│                           ├── 📄 loading.tsx
│                           └── 📄 page.tsx
│
├── 📁 components/                       # Reusable React components
│   ├── 📄 AdditionalSections.tsx        # Additional page sections
│   ├── 📄 AssessmentFlow.tsx            # User assessment workflow
│   ├── 📄 FeaturedTherapists.tsx        # Featured therapists display
│   ├── 📄 Footer.tsx                    # Site footer
│   ├── 📄 HomePage.tsx                  # Home page component
│   ├── 📄 ModernHero.tsx                # Hero section component
│   ├── 📄 Navigation.tsx                # Main navigation
│   ├── 📄 NavigationTabs.tsx            # Tab navigation
│   ├── 📄 ProviderRegistration.tsx      # Provider signup
│   ├── 📄 ServiceSelector.tsx           # Service selection
│   ├── 📄 TheraBook.tsx                 # TheraBook component
│   ├── 📄 TheraLearn.tsx                # TheraLearn component
│   ├── 📄 TheraSelf.tsx                 # TheraSelf component
│   ├── 📄 TheraStore.tsx                # TheraStore component
│   │
│   ├── 📁 auth/                         # Authentication components
│   │   └── 📄 AuthContext.tsx           # Authentication context provider
│   │
│   ├── 📁 figma/                        # Figma-specific components
│   │   └── 📄 ImageWithFallback.tsx     # Image component with fallback
│   │
│   └── 📁 ui/                           # UI component library (ShadCN/UI)
│       ├── 📄 accordion.tsx             # Accordion component
│       ├── 📄 alert-dialog.tsx          # Alert dialog
│       ├── 📄 alert.tsx                 # Alert component
│       ├── 📄 aspect-ratio.tsx          # Aspect ratio container
│       ├── 📄 avatar.tsx                # Avatar component
│       ├── 📄 badge.tsx                 # Badge component
│       ├── 📄 BoldSplitText.tsx         # Bold split text effect
│       ├── 📄 breadcrumb.tsx            # Breadcrumb navigation
│       ├── 📄 button.tsx                # Button component
│       ├── 📄 calendar.tsx              # Calendar component
│       ├── 📄 card.tsx                  # Card component
│       ├── 📄 carousel.tsx              # Carousel component
│       ├── 📄 chart.tsx                 # Chart component
│       ├── 📄 checkbox.tsx              # Checkbox component
│       ├── 📄 collapsible.tsx           # Collapsible component
│       ├── 📄 command.tsx               # Command palette
│       ├── 📄 context-menu.tsx          # Context menu
│       ├── 📄 dialog.tsx                # Dialog component
│       ├── 📄 drawer.tsx                # Drawer component
│       ├── 📄 dropdown-menu.tsx         # Dropdown menu
│       ├── 📄 form.tsx                  # Form components
│       ├── 📄 hover-card.tsx            # Hover card
│       ├── 📄 input-otp.tsx             # OTP input
│       ├── 📄 input.tsx                 # Input component
│       ├── 📄 label.tsx                 # Label component
│       ├── 📄 menubar.tsx               # Menu bar
│       ├── 📄 navigation-menu.tsx       # Navigation menu
│       ├── 📄 pagination.tsx            # Pagination component
│       ├── 📄 popover.tsx               # Popover component
│       ├── 📄 progress.tsx              # Progress bar
│       ├── 📄 radio-group.tsx           # Radio group
│       ├── 📄 resizable.tsx             # Resizable panels
│       ├── 📄 scroll-area.tsx           # Scroll area
│       ├── 📄 select.tsx                # Select component
│       ├── 📄 separator.tsx             # Separator component
│       ├── 📄 sheet.tsx                 # Sheet component
│       ├── 📄 sidebar.tsx               # Sidebar component
│       ├── 📄 skeleton.tsx              # Loading skeleton
│       ├── 📄 slider.tsx                # Slider component
│       ├── 📄 sonner.tsx                # Toast notifications
│       ├── 📄 SplitText.tsx             # Split text animation
│       ├── 📄 switch.tsx                # Switch component
│       ├── 📄 table.tsx                 # Table component
│       ├── 📄 tabs.tsx                  # Tabs component
│       ├── 📄 textarea.tsx              # Textarea component
│       ├── 📄 toggle-group.tsx          # Toggle group
│       ├── 📄 toggle.tsx                # Toggle component
│       ├── 📄 tooltip.tsx               # Tooltip component
│       ├── 📄 use-mobile.ts             # Mobile detection hook
│       └── 📄 utils.ts                  # Utility functions
│
├── 📁 constants/                        # Application constants
│   └── 📄 app-data.ts                   # App configuration data
│
├── 📁 context/                          # React contexts (main)
│   └── 📄 AuthContext.tsx               # Authentication context
│
├── 📁 lib/                              # Utility libraries
│   ├── 📄 auth.ts                       # Authentication utilities
│   ├── 📄 axios.ts                      # HTTP client configuration
│   └── 📄 jwt.ts                        # JWT token utilities
│
└── 📁 styles/                           # Global styles
    └── 📄 globals.css                   # Global CSS styles
```

## 📊 Project Statistics

- **Total Files**: 200+
- **Main Directories**: 10
- **React Components**: 50+
- **UI Components**: 45+
- **App Routes**: 25+

## 🏗️ Architecture Overview

### **Frontend Framework**
- **Next.js 13+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ShadCN/UI** component library

### **Key Features**
1. **TheraBook** - Therapy booking system
2. **Smart Selector** - AI-powered therapist matching
3. **User Profiles** - Patient and therapist profiles
4. **Assessment Flow** - Patient assessment system
5. **Authentication** - User login/signup system

### **Routing Structure**
- **/** - Landing page
- **/auth/login** - User login page
- **/auth/signup** - User registration page
- **/therabook** - Main therapy booking app
- **/therabook/therapists** - Therapist directory
- **/therabook/therapists/[id]** - Individual therapist pages
- **/therabook/therapists/[id]/book** - Booking flow
- **/therabook/profile** - User profile management
- **/therabook/smart-selector** - AI therapist matching

### **Component Organization**
- **app/** - Next.js pages and layouts
- **components/** - Reusable React components
- **components/ui/** - Base UI components (ShadCN/UI)
- **components/auth/** - Authentication components
- **context/** - React context providers
- **constants/** - Application constants
- **lib/** - Utility libraries and configurations

### **Development Tools**
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **PostCSS** - CSS processing
- **VS Code** - Integrated development environment

## 📝 Notes

- The project follows Next.js 13+ App Router conventions
- Each route has error, loading, and page components for better UX
- UI components are based on ShadCN/UI library
- The booking flow includes payment, confirmation, and feedback steps
- Multiple profile variants exist for user and therapist profiles
- Environment variables are configured for different deployment stages
- API routes are structured but not yet implemented
- JWT authentication system is implemented in the lib directory
