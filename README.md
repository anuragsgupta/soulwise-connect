# MANN MITRA - Digital Mental Health Companion 🧠💚

[![Next.js](https://img.shields.io/badge/Next.js-15.5.7-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.10.0-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Small steps. Big relief.** A comprehensive digital mental health platform designed for Indian college campuses.

---

## 📋 Table of Contents

- [What is Mann Mitra?](#what-is-mann-mitra)
- [Problem Statement & Solution](#problem-statement--solution)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Team](#team)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 What is Mann Mitra?

**Mann Mitra** (meaning "Mind Friend" in Hindi) is a digital mental health companion built specifically for Indian college students. It provides confidential, accessible, and culturally-relevant mental health support through AI-powered chat, professional counseling, peer support forums, and wellness resources.

The platform bridges the gap between students struggling with mental health issues and the support they need, addressing the unique challenges of the Indian education system including:
- Academic pressure and exam stress
- Social stigma around mental health
- Limited access to professional counselors
- Language and cultural barriers
- Privacy concerns

---

## 🔍 Problem Statement & Solution

### The Problem
- **1 in 4** Indian college students experience mental health issues
- **60%** of students report high stress levels during exams
- Only **20%** of campuses have adequate counseling resources
- **Cultural stigma** prevents students from seeking help
- **Language barriers** limit access to English-only resources
- **Privacy concerns** stop students from opening up

### Our Solution
Mann Mitra provides a **comprehensive, stigma-free, multilingual platform** that offers:
1. **Immediate Support**: AI-powered first-aid chat for crisis intervention
2. **Professional Help**: Easy booking with campus counselors
3. **Peer Connection**: Anonymous forums for student-to-student support
4. **Wellness Resources**: Curated content in 11+ Indian languages
5. **Data Insights**: Anonymous analytics for institutions to track trends
6. **Privacy First**: End-to-end encryption and anonymous options

---

## ✨ Features

### 🤖 **AI First-Aid Chat**
- 24/7 availability for immediate mental health support
- Context-aware conversations with sentiment analysis
- Crisis detection with automatic escalation protocols
- Personalized coping strategies and breathing exercises
- Multilingual support (English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia)

### 📅 **Professional Counseling**
- Book appointments with verified campus counselors
- Video/audio/chat session options
- Automated reminders via email and in-app notifications
- Session notes and progress tracking
- Anonymous mentoring option for sensitive topics

### 🎓 **Wellness Hub**
- Curated mental health resources (articles, videos, audio guides)
- Guided meditation and breathing exercises
- Sleep hygiene tips and academic stress management
- Relationship advice and social connection resources
- All content available in regional languages

### 👥 **Peer Support Forums**
- Moderated, anonymous discussion spaces
- Category-based filtering (Anxiety, Depression, Study Tips, etc.)
- Voice notes and image sharing
- Upvoting and reply threading
- Community guidelines with AI-powered content moderation

### 📊 **Student Dashboard**
- Real-time wellness score tracking
- PHQ-9 (Depression) and GAD-7 (Anxiety) assessments
- Mood check-in journal with emoji tracking
- Task and diary management
- Personalized recommendations based on mental health state

### 🏫 **Institute Admin Panel**
- Student onboarding with bulk CSV upload
- Counselor management and session oversight
- Anonymous trend analytics (no personal data)
- AISHE code integration for institution verification
- Department and semester management

### 🎮 **Interactive Games & Activities**
- Stress-relief mini-games (Memory Match, Breathing Circle, Gratitude Journal)
- Mood-based game recommendations
- Progress tracking and achievements

### 🔔 **Smart Notifications**
- Real-time bell notifications for new forum posts, replies, and upvotes
- Session reminders and wellness check-in prompts
- Crisis alert notifications to counselors
- Customizable notification preferences

### 🌐 **Progressive Web App (PWA)**
- Install on mobile devices (Android/iOS)
- Offline access to wellness resources
- Push notifications
- App-like experience with custom icons

---

## 🛠️ Technologies Used

### **Frontend**
- **Next.js 15.5.7** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI + shadcn/ui** - Accessible component library
- **Lucide Icons** - Beautiful icon set
- **Spline** - 3D interactive landing page elements

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Primary database (Neon serverless)
- **AWS DynamoDB** - Session storage for anonymous mentoring

### **AI & ML**
- **Google Gemini AI** - Conversational AI for chatbot
- **Sentiment Analysis** - Real-time emotion detection
- **Content Moderation** - AI-powered harmful content filtering

### **Authentication & Security**
- **JWT Tokens** - Secure authentication
- **bcrypt** - Password hashing
- **Role-based Access Control** - Student/Faculty/Admin roles

### **Communication**
- **Nodemailer** - Email notifications
- **Google Meet API** - Video session integration
- **WebSockets (Planned)** - Real-time chat

### **DevOps & Deployment**
- **Vercel** - Frontend hosting
- **GitHub Actions** - CI/CD pipelines
- **AWS (Planned)** - Serverless deployment option

### **Additional Libraries**
- **React Hook Form** - Form validation
- **Zod** - Schema validation
- **date-fns** - Date manipulation
- **Recharts** - Data visualization
- **React Query** - Data fetching and caching

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **PostgreSQL** database (or use [Neon](https://neon.tech/) serverless)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anuragsgupta/soulwise-connect.git
   cd soulwise-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database with sample data
   npx prisma db seed
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# DynamoDB (for anonymous sessions)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
DYNAMODB_TABLE_NAME="anonymous-sessions"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Email (Nodemailer - Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Google Meet Integration (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Analytics (Optional)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

**Important Notes:**
- Never commit `.env` to version control
- Use strong, unique values for `JWT_SECRET`
- For Gmail SMTP, enable "App Passwords" in Google Account settings
- Get Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Running the Application

**Development Mode**
```bash
npm run dev
# or
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**Production Build**
```bash
npm run build
npm start
# or
yarn build
yarn start
```

**Database Management**
```bash
# Open Prisma Studio (Database GUI)
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Create a new migration
npx prisma migrate dev --name your_migration_name
```

---

## 📁 Project Structure

```
soulwise-connect/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── api/                  # API routes
│   │   ├── auth/                 # Authentication pages
│   │   ├── dashboard/            # Student dashboard
│   │   ├── faculty/              # Faculty portal
│   │   └── page.tsx              # Landing page
│   ├── components/               # React components
│   │   ├── auth/                 # Login, signup forms
│   │   ├── dashboard/            # Dashboard components
│   │   ├── landing/              # Landing page sections
│   │   └── ui/                   # Reusable UI components (shadcn)
│   ├── contexts/                 # React Context providers
│   │   ├── AuthContext.tsx       # Authentication state
│   │   └── LanguageContext.tsx   # Multilingual support
│   ├── lib/                      # Utility libraries
│   │   ├── prisma.ts             # Prisma client
│   │   ├── gemini.ts             # AI integration
│   │   └── analytics.ts          # Analytics tracking
│   ├── config/                   # Configuration files
│   │   ├── fonts.ts              # Font definitions
│   │   └── languages.ts          # Translation strings
│   └── styles/
│       └── globals.css           # Global styles
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── public/                       # Static assets
│   ├── icons/                    # PWA icons
│   └── manifest.json             # PWA manifest
├── .env                          # Environment variables (not in git)
├── .env.example                  # Example environment file
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind CSS config
├── next.config.ts                # Next.js config
└── README.md                     # This file
```

---

## 📸 Screenshots

### Landing Page
![Landing Page](docs/screenshots/landing-page.png)
*Modern, welcoming landing page with 3D Spline animation*

### Student Dashboard
![Dashboard](docs/screenshots/dashboard.png)
*Personalized wellness tracking with real-time score*

### AI Chat
![AI Chat](docs/screenshots/ai-chat.png)
*24/7 AI-powered mental health support*

### Peer Forums
![Forums](docs/screenshots/peer-forums.png)
*Anonymous, moderated student discussion spaces*

### Counselor Booking
![Booking](docs/screenshots/booking.png)
*Easy scheduling with campus counselors*

### Admin Panel
![Admin](docs/screenshots/admin-panel.png)
*Institution management and analytics*

---

## 👥 Team

See [team_info.txt](team_info.txt) for detailed team information.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure:
- Code follows TypeScript best practices
- All tests pass
- Prisma migrations are included
- Documentation is updated

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **AISHE (All India Survey on Higher Education)** for institution verification data
- **Google Gemini AI** for conversational AI capabilities
- **Neon Database** for serverless PostgreSQL hosting
- **Vercel** for seamless deployment
- **shadcn/ui** for beautiful, accessible components
- All the **students and counselors** who provided feedback during development

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/anuragsgupta/soulwise-connect/issues)
- **Email**: support@mannmitra.com
- **Website**: [mannmitra.com](https://mannmitra.com)

---

<div align="center">

**Made with ❤️ for Indian college students**

*Small steps. Big relief.*

</div>
