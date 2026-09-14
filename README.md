# 🌸 KalaSetu (कलासेतु) — Bridge from Maker to Marketplace

> **SIH 2026 Problem Statement SIH26090**: AI-Driven Market Linkage and Smart Cataloging Mobile Application for Marginalized Artisans.

KalaSetu is a unified mobile digital ecosystem engineered in React Native (Expo) and Supabase that empowers traditional Indian artisans, connects them directly with verified bulk business buyers, and opens a direct discovery channel for discerning retail customers.

---

## 🏛️ Ecosystem Architecture

KalaSetu operates with **strict role-based authentication** and **isolated data domains** across three workspaces:

```text
LANDING / WELCOME
        ↓
CHOOSE YOUR WORKSPACE
  ├── 🧵 Artisan / Maker (Handloom, Pottery, Metalcraft, Woodcraft)
  ├── 🏢 Business / Bulk Buyer (Retailers, Interior Designers, Exporters)
  └── 🛍️ Customer Patron (Authentic handcrafted goods & cultural discovery)
        ↓
AUTHENTICATION GATEWAY
  ├── Email & Password
  ├── Mobile Number + OTP Verification
  ├── Google OAuth (via Supabase)
  └── Quick Verified Demonstration Accounts
        ↓
AUTHENTICATED WORKSPACE ROUTING (Strict Role Verification & Isolation)
```

---

## ⚡ Demonstration Accounts (For Presentation & Evaluation)

All demonstration accounts feature **isolated user IDs, dedicated profiles, distinct catalog stories, and real database persistence**.

### 1. Artisans (3 Distinct Heritage Crafts)

| Account | Name | Email | Password | Craft & Specialization | Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Artisan 1** | **Ramesh Vankar** | `ramesh.vankar@artisan.kalasetu.in` | `KalaSetu@Artisan1` | **Handloom Weaving** (Desi Wool, Organic Cotton Shawls) | Bhujodi, Kutch, Gujarat |
| **Artisan 2** | **Meera Devi** | `meera.devi@artisan.kalasetu.in` | `KalaSetu@Artisan2` | **Blue Pottery** (Quartz & Natural Cobalt Glaze) | Kot Jewar, Jaipur, Rajasthan |
| **Artisan 3** | **Suresh Kumar** | `suresh.kumar@artisan.kalasetu.in` | `KalaSetu@Artisan3` | **Dhokra Bell Metal** (4,000-year-old Lost-Wax Casting) | Kondagaon, Bastar, Chhattisgarh |

### 2. Business / Bulk Buyers

| Account | Name | Email | Password | Sourcing Domain | Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Business 1** | **Ananya Sharma** | `ananya.sharma@heritagecrafts.in` | `KalaSetu@Biz1` | **Heritage Décor Studio** (Boutique & Interior Procurement) | New Delhi, India |
| **Business 2** | **Vikramaditya Singh** | `vikram.singh@indiatraditions.com` | `KalaSetu@Biz2` | **India Traditions Retail** (Large-scale Handloom Procurement) | Mumbai, Maharashtra |

### 3. Customer Patron

| Account | Name | Email | Password | Interests & Cart | Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Customer 1** | **Priya Deshmukh** | `priya.deshmukh@gmail.com` | `KalaSetu@Customer1` | Heritage textiles, pottery, tribal art collector | Indiranagar, Bengaluru |

---

## 🎨 Modern Visual Redesign & Palette

Eliminating stereotypical muddy brown/orange aesthetics in favor of a modern, youthful, and culturally warm palette:

* **Primary Surface / Brand**: Deep Plum / Berry (`#5B1A42` & `#3D0C2A`)
* **Warm Vibrant Accent**: Reddish Pink / Rose (`#E11D48`)
* **Secondary Cultural Accent**: Warm Mustard / Gold (`#D97706`)
* **Interactive Elements / Information**: Confident Royal Blue (`#2563EB`)
* **Canvas Surfaces**: Crisp Light Neutrals (`#F9FAFB`, `#FFFFFF`, `#F3F4F6`)
* **Typography**: Clean, readable typography with strict hierarchy and generous card spacing.

---

## 🚀 Key Feature Highlights

### 1. KalaChannel (Craft Storytelling & Vertical Videos)
* **Multi-Format Content**: Supports both **High-Resolution Photo Stories** and **Vertical Short Videos** (15-60s reels).
* **2-Step Creator Flow**:
  1. *Choose Content Type*: Short Video Reel vs Photo Story.
  2. *Add Footage & Story*: Theme selector (Heritage Lore, Workshop Live, Behind The Scenes), craft technique description, and direct link to store product.
* **Vertical Video Feed**: Native playback controls (`expo-av`), live workshop indicators, mute/unmute audio, buffering state management, and loop controls.
* **Direct Commerce Linkage**: Every video or story links directly to the artisan's catalogue item with live pricing and one-tap "View in Store" navigation.
* **Social Proof**: Real likes counter and interactive comments bottom-sheet powered by Supabase and local cache.

### 2. Customer Discovery & Marketplace Flow
* **Live Multi-Attribute Search**: Prominent search bar supporting real-time filtering across titles, crafts (e.g. *Handloom*, *Blue Pottery*, *Dhokra*), categories, and artisan names.
* **Fixed Add to Cart**: Completely resolved bug where cart items failed to persist or render. Items are automatically hydrated with product metadata, cached with `useFocusEffect`, and synchronized with Supabase.
* **Full Cart Management**: Quantity steppers (`+` / `-`), individual item removal, subtotal calculation, subsidized delivery, and "Continue Shopping" actions.
* **Checkout Order Preparation**: Interactive modal capturing shipping recipient name, 10-digit phone, and full delivery address. Prepares real order records in database/local storage with support for COD and forward-compatible Razorpay payment states.

### 3. Artisan Workspace (Virtual Business Manager)
* **Smart Cataloging Wizard**: Step-by-step product creation with multi-angle photography, AI background enhancement simulation, and multilingual descriptions (Hindi & English).
* **Cost-Plus Fair Pricing Engine**: Transparent pricing calculator factoring raw material costs, artisan labour days, packaging, platform fees, and fair profit margins.
* **Opportunities & B2B Proposals**: Direct visibility into bulk requirements posted by verified businesses with quote submission.
* **ONDC Readiness**: Automated assessment and metadata structuring for Open Network for Digital Commerce export.
* **Exhibition QR & Digital Showcase**: Shareable QR code and web showcase links for physical craft fairs and exhibitions.

### 4. Business Workspace (B2B Procurement)
* **Direct Artisan Discovery**: Search verified master artisans by state, district, and craft category.
* **Procurement Requirements**: Create and track bulk RFQs with target quantities, budgets, delivery timelines, and specifications.

---

## 🔧 External Integration Report

Here is the exact configuration required to connect live external cloud services:

```text
================================================================================
REQUIRED EXTERNAL SERVICES & CREDENTIALS CONFIGURATION
================================================================================

1. SUPABASE (Database, Auth, Storage & Realtime)
--------------------------------------------------------------------------------
Required Variables:
  EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>

Where to obtain:
  1. Visit https://supabase.com and create a project.
  2. Under Project Settings -> API, copy the "Project URL" and "anon public" key.
Exactly where to place it:
  Inside the root `.env` file of this repository:
  d:\KalaSetu\antigravityKalaSetuProjectFolder\.env


2. GOOGLE AUTH (OAuth 2.0 via Supabase)
--------------------------------------------------------------------------------
Required Credentials:
  Google Cloud OAuth 2.0 Web Client ID & Client Secret

Where to obtain:
  1. Go to Google Cloud Console (https://console.cloud.google.com).
  2. Create OAuth 2.0 Client ID under "APIs & Services" -> "Credentials".
  3. Add Authorized Redirect URI: https://<your-supabase-ref>.supabase.co/auth/v1/callback
Configuration required:
  In Supabase Dashboard -> Authentication -> Providers -> Enable "Google",
  paste the Google Client ID and Secret.


3. PHONE OTP (SMS Gateway via Supabase Auth)
--------------------------------------------------------------------------------
Provider: Twilio / MessageBird / AWS SNS
Where to obtain:
  1. Sign up on Twilio (https://www.twilio.com) or MessageBird.
  2. Obtain Account SID, Auth Token, and Sender Mobile Number.
Configuration required:
  In Supabase Dashboard -> Authentication -> Providers -> Phone -> Select Twilio,
  paste Account SID and Auth Token.


4. AI PHOTO STUDIO (Smart Background Enhancement)
--------------------------------------------------------------------------------
Recommended Provider:
  - Photoroom API (https://www.photoroom.com/api/) OR
  - ClipDrop / Stability AI API (https://clipdrop.co/apis)
Required credentials:
  PHOTOROOM_API_KEY or CLIPDROP_API_KEY
Cost / Free-tier considerations:
  - Photoroom provides 50 free credits upon signup for sandbox testing.
  - Clipdrop provides 100 free API calls on account creation.


5. SPEECH TO TEXT (Multilingual Artisan Voice Input)
--------------------------------------------------------------------------------
Recommended Provider:
  - Google Cloud Speech-to-Text API (Bhashini compatible for Indian languages)
  - OpenAI Whisper API
Required credentials:
  GOOGLE_APPLICATION_CREDENTIALS json key or OPENAI_API_KEY
Cost / Free-tier considerations:
  - Google Cloud gives 60 minutes free audio processing per month.
  - OpenAI Whisper costs $0.006 per minute (~₹0.50 per minute of voice).


6. RAZORPAY (Online Payment Gateway)
--------------------------------------------------------------------------------
Required Credentials (Test Mode):
  RAZORPAY_KEY_ID (e.g. rzp_test_xxxxxxxx)
  RAZORPAY_KEY_SECRET (server-side verification only)

Where to obtain:
  1. Create a free account at https://dashboard.razorpay.com.
  2. Switch to "Test Mode" in the dashboard.
  3. Go to Settings -> API Keys -> Generate Key.
Secure implementation notes:
  - DO NOT expose the Razorpay Key Secret inside the Expo mobile app bundle.
  - Razorpay order creation (`/orders` API) and signature verification must
    execute securely inside a Supabase Edge Function or backend microservice.
  - The Expo app only receives the Razorpay `order_id` and uses the public `key_id`.
================================================================================
```

---

## 📱 How to Run the Application Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Expo Development Server**:
   ```bash
   npx expo start
   ```

3. **Open on Physical Device**:
   * Scan the QR code displayed in the terminal using the **Expo Go** app (Android) or Camera (iOS).
   * Or connect your physical device via USB with ADB debugging enabled.

---

## 🛡️ License & SIH 2026 Submission Note

Developed for the **Smart India Hackathon 2026** to bridge the digital divide for marginalized artisans across rural and semi-urban India.
