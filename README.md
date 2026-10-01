# MiHSEF Super Smash Bros. Ultimate Stage Wizard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28.svg)](https://firebase.google.com/)

The official, open-source stage selection and match progression companion tool for **Michigan High School Esports Federation (MiHSEF)** *Super Smash Bros. Ultimate* (SSBU) competitions.

Designed specifically to eliminate game day confusion for coaches and student players across both **3v3 Crews (9-Stock)** and **1v1 Solos** formats.

* **Live Web App:** [https://mihsef-ssbu.web.app](https://mihsef-ssbu.web.app) *(or `https://ssbu.mihsef.org` upon DNS propagation)*
* **Official Ruleset:** [MiHSEF SSBU Crews Game Manual](https://mihsef.org/docs/game-manuals/ssbu-crews)

---

## 🎯 Key Features & Ruleset Compliance

### 1. Automated Game 1 Striking (1-2-2-1 Sequence)
- Guides coaches through the official striking sequence from the 9-stage pool:
  1. **Home Team** strikes **1 stage**
  2. **Away Team** strikes **2 stages**
  3. **Home Team** strikes **2 stages**
  4. **Away Team** strikes **1 stage**
  5. The remaining unbanned stage is automatically locked in for Game 1.
- Immediate **Undo** support on active bans for accidental misclicks.

### 2. Optional "Offer Friendly" (Cryptographic Mutual Agreement)
- Before striking begins, both teams have the option to offer a starting stage agreement.
- Built using client-side **SHA-256 blind commitments** + server verification:
  - Neither team can see the other's offer or whether an offer was made.
  - If both teams offer the **same** stage, Game 1 immediately locks in that stage.
  - If choices mismatch or a team declines, all commitments are safely purged from Firestore without revealing selections, allowing standard 1-2-2-1 strikes to proceed completely unbiased.

### 3. Subsequent Game Progression & Counterpicks
- **9-Stock Stage Permanence:** Explicitly accounts for the MiHSEF Crews ruleset where a selected stage remains locked across all 3 player matchups (9 total stocks) in a battle.
- **Winner Bans:** Winner of the previous battle bans stages (3 bans in Crews, 2 bans in Solos).
- **Dynamic DSR (Dave's Stupid Rule) Autoban:** Automatically identifies and locks out any stage the counterpicking team already won on in prior completed games (`Home Previous Win` or `Away Previous Win`).
- **Loser Counterpicks:** Loser picks their stage from remaining eligible stages.
- **87-Fighter Autocomplete:** Real-time search autocomplete for declaring counterpick fighters in subsequent battles.

### 4. Real-Time Multi-Device Sync
- Backed by Google Cloud Firestore with real-time room listeners.
- **Match Room Codes:** 6-character room codes with 1-click clipboard link copying and native mobile OS share dialogs (`navigator.share`).
- **Zero-Login Architecture:** Unauthenticated, privacy-hardened room sessions allowing rapid gameday access for coaches on PCs, Chromebooks, iPads, or phones.
- **Multi-Match Support:** Quick link in header to open additional match rooms in new tabs for coaches simultaneously managing multiple teams.

### 5. Glanceable Match Stage Timeline
- Persistent HUD banner displaying the running history of stages played and winners (`G1: Battlefield [HOME WIN]`, `G2: Smashville [AWAY WIN]`, `G3: Final Destination [IN PLAY]`).

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler:** [Vite 7](https://vite.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Real-Time Database & Hosting:** [Google Cloud Firestore](https://firebase.google.com/docs/firestore) & [Firebase Hosting](https://firebase.google.com/docs/hosting)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mihsef/mihsef-ssbu-sp.git
   cd mihsef-ssbu-sp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase Environment:
   Copy `.env.example` to `.env.local` and add your Firebase web app configuration:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```

4. Run local development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 🔌 Embedding & Platform Integration

This application is completely decoupled and can be embedded directly into any tournament management platform, league portal, or dashboard (e.g. Fenworks, LeagueOS, or custom web portals).

### Direct iframe Embed
```html
<iframe
  src="https://mihsef-ssbu.web.app"
  title="MiHSEF SSBU Stage Wizard"
  width="100%"
  height="900px"
  style="border: none; border-radius: 12px; max-width: 1200px; margin: 0 auto; display: block;"
  allow="clipboard-write"
></iframe>
```

### Pre-filling / Direct Match Linking
To link both coaches directly into an existing room:
```
https://mihsef-ssbu.web.app/?room=ROOMID
```

---

## 🔒 Security & Firestore Rules

Production Firestore Security Rules are documented in [`firestore.rules`](./firestore.rules) and enforce:
- Strict room document schemas and permitted status transitions.
- Client validation preventing unauthorized stage bans, improper ban counts, or out-of-turn actions.
- Automatic expiration and sanitization of blind mutual commitment hashes and salts.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE) — feel free to use, fork, embed, or white-label it for any scholastic or collegiate esports league.
