# PayMama

**CMSC 127 Machine Problem**

A modern Progressive Web App (PWA) for tracking and managing loans, expenses, and financial transactions. PayMama helps you keep track of money you've lent, borrowed, and group expenses with an intuitive, mobile-first interface.

![PayMama](https://img.shields.io/badge/PWA-enabled-0d9488?style=for-the-badge&logo=pwa&logoColor=white)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Development](#-development)
- [Project Structure](#-project-structure)
- [Key Features](#-key-features)
- [PWA Support](#-pwa-support)
- [Building for Production](#-building-for-production)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Functionality
- **Transaction Management**
  - Track money lent to others
  - Track money borrowed from others
  - Manage group expenses with multiple participants
  - Support for straight payments and installment plans
  - Payment recording and tracking

- **Contact & Group Management**
  - Add, edit, and delete contacts
  - Create and manage groups
  - Searchable contact selection
  - Full contact details with transaction history

- **Financial Overview**
  - Real-time balance calculations
  - Pending receivables and payables
  - Active loan tracking
  - Next payment reminders
  - Recent activity feed

- **Payment Tracking**
  - Record payments for transactions
  - Installment plan management
- Payment status tracking (Paid, Partially Paid, Unpaid, Overdue)
  - Skip installment functionality
  - Payment allocation for group expenses

- **Notifications**
  - Due payment reminders
  - Overdue payment alerts
  - Clearable notification system

### User Experience
- **Responsive Design**
  - Mobile-first approach
  - Optimized for both mobile and desktop
  - Touch-friendly interface
  - Adaptive layouts

- **Progressive Web App (PWA)**
  - Installable on mobile and desktop
  - Offline support with service worker
  - Standalone app experience
  - Fast loading times

- **Modern UI/UX**
  - Clean, modern interface
  - Smooth animations and transitions
  - Intuitive navigation
  - Beautiful gradient designs
  - Consistent color scheme

## 🛠 Tech Stack

### Core Technologies
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool and dev server
- **React Router DOM 6.30.1** - Client-side routing

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Tailwind Animate** - Animation utilities

### State Management
- **React Context API** - Global state management
- **React Hooks** - State and lifecycle management

### Form Handling
- **React Hook Form 7.61.1** - Form state management
- **Zod 3.25.76** - Schema validation
- **@hookform/resolvers** - Form validation resolvers

### Utilities
- **date-fns 3.6.0** - Date manipulation and formatting
- **clsx & tailwind-merge** - Conditional class names
- **class-variance-authority** - Component variants

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **@vitejs/plugin-react-swc** - Fast React refresh

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher) or **yarn** or **pnpm**
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Recommended: Install Node.js with nvm

```bash
# Install nvm (Node Version Manager)
# Windows: Download from https://github.com/coreybutler/nvm-windows/releases
# macOS/Linux: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js
nvm install 18
nvm use 18
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd loan-tracker-cs127
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next free Vite port).

## 💻 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

### Development Server

The development server runs on a Vite port (commonly `5173`) and includes:
- Hot Module Replacement (HMR)
- Fast refresh for React components
- TypeScript type checking
- Source maps for debugging

### Code Structure

The project follows a modular structure:

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── pages/              # Page components (routes)
├── context/            # React Context providers
├── types/              # TypeScript type definitions
├── data/               # Data utilities and user configuration
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
├── lib/                 # Library configurations
└── main.tsx            # Application entry point
```

## 📁 Project Structure

```
loan-tracker-cs127/
├── public/
│   ├── manifest.webmanifest  # PWA manifest
│   └── sw.js                 # Service worker
├── src/
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── ActivityItem.tsx
│   │   ├── AppLayout.tsx
│   │   ├── BalanceCard.tsx
│   │   ├── BottomNav.tsx
│   │   ├── DesktopSidebar.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── NotificationBell.tsx
│   │   ├── PWAInstallPrompt.tsx
│   │   └── QuickActions.tsx
│   ├── pages/
│   │   ├── Index.tsx         # Home/Dashboard
│   │   ├── Records.tsx       # Transaction records
│   │   ├── People.tsx        # Contacts & groups
│   │   ├── Settings.tsx
│   │   ├── TransactionDetail.tsx
│   │   ├── LendPage.tsx
│   │   ├── BorrowPage.tsx
│   │   ├── ExpensePage.tsx
│   │   ├── RecordPaymentPage.tsx
│   │   ├── ContactDetailPage.tsx
│   │   ├── AddContactPage.tsx
│   │   ├── EditContactPage.tsx
│   │   ├── GroupDetailPage.tsx
│   │   ├── AddGroupPage.tsx
│   │   └── EditGroupPage.tsx
│   ├── context/
│   │   └── AppContext.tsx     # Global state management
│   ├── types/
│   │   └── index.ts          # TypeScript definitions
│   ├── data/
│   │   └── user.ts            # Current user configuration
│   ├── utils/
│   │   └── registerSW.ts     # Service worker registration
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎯 Key Features

### Transaction Types

1. **Straight Expense (Lend/Borrow)**
   - One-time payment transactions
   - Direction: LEND or BORROW
   - Immediate payment tracking

2. **Installment Expense (Lend/Borrow)**
   - Recurring payment plans
   - Weekly or monthly installments
   - Payment day scheduling
   - Installment status tracking

3. **Group Expense**
   - Shared expenses among multiple people
   - Payment allocation system
   - Equal division support
   - Individual payment tracking

### Payment Status

- **PAID** - Fully paid
- **PARTIALLY_PAID** - Partially paid
- **UNPAID** - Not yet paid
- **OVERDUE** - Overdue payment

### Installment Status

- **UNPAID** - Due but not paid
- **PAID** - Installment paid
- **OVERDUE** - Overdue
- **SKIPPED** - Installment skipped

### Payment Frequency

- **WEEKLY** - Weekly payments (with day of week)
- **MONTHLY** - Monthly payments (with day of month)
- **ONE_TIME** - Single payment

## 📱 PWA Support

PayMama is a fully functional Progressive Web App with:

### Features
- **Installable** - Can be installed on mobile and desktop
- **Offline Support** - Basic offline functionality via service worker
- **Standalone Mode** - Runs as a standalone app when installed
- **Fast Loading** - Optimized for quick load times
- **Responsive** - Works seamlessly on all device sizes

### Installation

Users can install PayMama:
- **Mobile**: Through browser "Add to Home Screen" prompt
- **Desktop**: Through browser install button
- **Automatic Prompt**: App shows install prompt when supported

### Service Worker

The service worker (`/public/sw.js`) provides:
- Asset caching for offline access
- Network-first strategy with cache fallback
- Automatic cache updates
- Background sync capabilities

### Manifest

The PWA manifest (`/public/manifest.webmanifest`) includes:
- App name: "PayMama"
- Display mode: Standalone
- Theme color: #0d9488
- Orientation: Portrait primary
- Categories: Finance, Productivity

## 🏗 Building for Production

### Build Command

```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Bundle and minify assets
- Optimize images and resources
- Generate production-ready files in `dist/`

### Build Output

The build process creates:
- Optimized JavaScript bundles
- Minified CSS
- Static assets
- Service worker (in production mode)
- PWA manifest

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## 🚢 Deployment

### Static Hosting Providers

PayMama can be deployed to any static hosting service:

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### GitHub Pages
1. Build the project: `npm run build`
2. Configure GitHub Actions or use `gh-pages` package
3. Deploy the `dist/` folder

#### Other Providers
- **Firebase Hosting**
- **AWS S3 + CloudFront**
- **Azure Static Web Apps**
- **Cloudflare Pages**

### Important Notes for Deployment

1. **Service Worker**: Ensure service worker is served with correct MIME type (`application/javascript`)
2. **HTTPS Required**: PWA features require HTTPS (except localhost)
3. **Manifest**: Verify `manifest.webmanifest` is accessible
4. **Routes**: Configure server to serve `index.html` for all routes (SPA routing)

### Environment Variables

The app uses Supabase directly for auth and persistence. Set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Also ensure Supabase migrations in `supabase/migrations` are applied.

## 🧪 Testing

### Manual Testing Checklist

- [ ] Transaction creation (Lend, Borrow, Group Expense)
- [ ] Payment recording
- [ ] Contact management (Add, Edit, Delete)
- [ ] Group management (Create, Edit, Delete)
- [ ] Installment plan creation
- [ ] Payment status updates
- [ ] Notification system
- [ ] Responsive design (Mobile & Desktop)
- [ ] PWA installation
- [ ] Offline functionality

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Code Style

- Follow TypeScript best practices
- Use ESLint for code quality
- Maintain consistent formatting
- Write meaningful commit messages
- Add comments for complex logic

### Component Guidelines

- Use functional components with hooks
- Keep components focused and reusable
- Use TypeScript for type safety
- Follow the existing component structure
- Use Tailwind CSS for styling

## 📝 License

This project is private and proprietary. All rights reserved.

## 👥 Team

**Made by Team Brat**

- **Josh Bradley Cimanes**
- **Albert Caro**
- **Zedric Medina**
- **Maria Amor Eco**

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful component library
- **Radix UI** - Accessible component primitives
- **Vite** - Lightning-fast build tool
- **React Team** - Amazing framework
- **Tailwind CSS** - Utility-first CSS framework

## 📞 Support

For issues, questions, or contributions, please:
- Open an issue on the repository
- Contact the development team
- Check existing documentation

## 🎉 Getting Started

Ready to start? Follow these steps:

1. **Install dependencies**: `npm install`
2. **Start dev server**: `npm run dev`
3. **Open browser**: Navigate to your Vite URL (usually `http://localhost:5173`)
4. **Explore the app**: Try creating transactions, adding contacts, and recording payments!

---

**Made by Team Brat**

- Josh Bradley Cimanes
- Albert Caro
- Zedric Medina
- Maria Amor Eco


