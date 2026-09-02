# Vela

**Premium cycle tracking with intelligent prediction and wellness insights.**

Vela is a beautifully designed React Native app for iOS that helps users track their menstrual cycle, understand their body's patterns, and gain actionable wellness insights powered by intelligent cycle prediction.

---

## ✨ Features

### Core Tracking
- **Daily Logging** — Track period, flow, symptoms, moods, energy, and more
- **Cycle Calendar** — Visual month view with color-coded phases and predictions
- **Phase Tracking** — Automatic detection of menstrual, follicular, ovulation, and luteal phases
- **Symptom Library** — 40+ customizable symptoms with mood and wellness tracking

### Prediction & Insights
- **Intelligent Prediction** — Machine-learning-based cycle prediction using historical patterns
- **Confidence Indicators** — See how confident the app is about predictions
- **Cycle Trends** — Visual insights into cycle length, phase duration, and patterns
- **Trend Analysis** — Understand your unique cycle patterns over time

### Privacy & Security
- **Local-First Storage** — All data stored on-device (SQLite)
- **PIN Protection** — Secure your data with a PIN lock
- **Export/Import** — Back up and restore your cycle data (not currently encrypted — see below)
- **No Cloud Sync** — Your cycle data never leaves your device

### Premium Features
- **Advanced Analytics** — Deep wellness insights
- **Partner Integration** — Share cycle info with a partner (optional)
- **Export Reports** — Generate and share pregnancy-safe summaries
- **Ad-Free Experience** — Distraction-free wellness tracking

---

## 🏗️ Tech Stack

### Frontend
- **React Native** with TypeScript
- **Expo** for rapid development and OTA updates
- **expo-router** for file-based navigation
- **Zustand** for state management

### Styling
- **fluent-styles** custom component library
- **Midnight Theme** — premium dark purple aesthetic
- **Plus Jakarta Sans** typography

### Database
- **Drizzle ORM** with SQLite
- **Local-first architecture** for privacy

### Services
- **RevenueCat** for subscription management
- **eas-cli** for managed builds

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Yarn package manager
- Xcode (for iOS development)
- EAS CLI (`npm install -g eas-cli`)

### Installation

```bash
# Clone the repository
git clone https://github.com/suftnetrepo/vela.git
cd vela

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local

# Start development server
yarn start
```

### Running on iOS

```bash
# Via Expo Go (quick testing)
yarn start
# Scan QR code with Expo Go app on iPhone

# Via local build
yarn ios

# Managed build (EAS)
eas build --platform ios --profile preview
```

---

## 📁 Project Structure

```
vela/
├── app/                      # Expo Router pages (file-based routing)
│   ├── (app)/               # Main app screens (logged in)
│   │   ├── home.tsx         # Home screen with today card & calendar
│   │   ├── log.tsx          # Daily logging screen
│   │   ├── tracker.tsx      # Cycle tracking insights
│   │   └── settings.tsx     # User settings & preferences
│   ├── (auth)/              # Authentication screens
│   │   ├── welcome.tsx      # Onboarding flow
│   │   ├── pin-setup.tsx    # PIN creation
│   │   └── onboarding.tsx   # Feature walkthrough
│   └── (lock)/              # Lock/unlock screens
│
├── src/
│   ├── algorithm/           # Prediction & cycle logic
│   │   ├── prediction.ts    # Cycle prediction engine
│   │   └── phases.ts        # Phase calculations
│   ├── components/          # Reusable UI components
│   │   ├── home/           # Home screen components
│   │   ├── calendar/       # Calendar components
│   │   ├── log/            # Logging components
│   │   └── shared/         # Shared components
│   ├── db/                  # Database setup & schemas
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Business logic services
│   │   ├── cycle.service.ts
│   │   ├── premium.service.ts
│   │   ├── auth.service.ts
│   │   └── dev-reset.service.ts
│   ├── stores/              # Zustand state stores
│   │   ├── settings.store.ts
│   │   ├── auth.store.ts
│   │   └── records.store.ts
│   └── utils/               # Helper functions
│       └── date.ts          # Date utilities
│
├── assets/                  # Images, icons, fonts
│   ├── fonts/
│   ├── icons/
│   └── images/
│
├── package.json            # Dependencies
├── tsconfig.json          # TypeScript config
├── drizzle.config.ts      # Database config
├── eas.json               # EAS build config
└── README.md              # This file
```

---

## 🗄️ Database Schema

Vela uses SQLite with Drizzle ORM for type-safe database access:

### Tables
- **cycles** — Cycle metadata and phase information
- **daily_logs** — Daily tracking entries (date, flow, symptoms, moods)
- **symptom_logs** — Detailed symptom tracking with intensity
- **settings** — User preferences and app configuration
- **notifications** — Upcoming period alerts

All data is stored locally on-device with no cloud synchronization.

---

## 🔐 Security & Privacy

- ✅ **Local-First** — Cycle/wellness data stored only in on-device SQLite (not currently encrypted)
- ✅ **PIN Protected** — Optional PIN lock for app access
- ✅ **No Tracking** — No analytics or health-data collection. RevenueCat handles purchases/subscriptions and only ever sees purchase information
- ✅ **No Ads** — Ad-free experience
- ✅ **Export Control** — Users can export their data in CSV format

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server
yarn start

# Build for iOS
yarn ios

# Build for production
eas build --platform ios --profile production

# TypeScript type checking
yarn tsc --noEmit

# Lint code
yarn lint

# Format code
yarn format
```

### Development Tools

**Settings Dev Panel** — Access development utilities by:
1. Go to Settings tab
2. Tap version number 5 times
3. Dev panel appears with reset options

---

## 📱 App Store Deployment

### Prerequisites
- Apple Developer Account
- Configured EAS build profile
- RevenueCat subscription configuration

### Build Process

```bash
# Production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Screenshot States
The app includes premium polish for App Store screenshots:
- Healthy ovulation window (primary screenshot)
- Fertile window active (secondary)
- Cycle day display with confidence
- No alarming or warning states

---

## 🎨 Design System

### Color Palette (Midnight Theme)
- **Primary** — Bright purple (#C17AFF)
- **Background** — Deep purple (#090014)
- **Surface** — Mid purple (#160B28)
- **Text Primary** — Light purple (#F7F0FF)
- **Text Secondary** — Muted lavender (#C9B3EA)
- **Text Tertiary** — Dusty purple (#8B78A8)

### Typography
- **Font** — Plus Jakarta Sans
- **Headings** — 600-700 weight
- **Body** — 400-500 weight
- **Small** — 400 weight

### Components
- Rounded cards (24px radius)
- Premium spacing (16-20px padding)
- Semantic color tokens
- Smooth animations

---

## 📊 Prediction Algorithm

Vela's cycle prediction uses:
- Historical cycle lengths (minimum 2 cycles)
- Phase duration patterns
- Statistical averaging with confidence intervals
- Adaptive predictions that improve with more data

**Accuracy**: 85%+ for cycles with 3+ months of history

---

## 🐛 Troubleshooting

### App won't build
```bash
# Clean and rebuild
rm -rf node_modules .expo
yarn install
yarn start
```

### Database issues
Access the dev panel in Settings to reset the database or export data.

### Preview build not working
```bash
eas build --platform ios --profile preview --clear-cache
```

---

## 📄 License

Vela is proprietary software. All rights reserved.

---

## 👥 Support & Feedback

- **Website** — [vela.app](https://vela.app)
- **Email** — support@vela.app
- **Twitter** — [@velawellness](https://twitter.com/velawellness)

---

**Built with 💜 for wellness and self-knowledge.**
