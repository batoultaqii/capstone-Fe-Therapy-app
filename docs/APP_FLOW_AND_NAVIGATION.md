# Togetherness — App Flow & Navigation

**Design North Star:** The app should feel like a **calm gateway to human support**, not a marketplace or booking tool.

This document describes the full app screen structure, navigation logic, and UX decisions for the mental health support group app.

---

## 1. App entry (Welcome + authentication)

**Screen:** Welcome (`app/welcome.tsx`)

- **When the app opens:** Root index redirects unauthenticated users to `/welcome`.
- **Content:**
  - Welcoming headline: *"You're welcome here"*
  - Supporting line: *"Connect when you're ready. A calm space to be with others."*
  - **Registration benefit:** *"Creating an account lets you view and enroll in support groups."*
  - **Register** (primary CTA) → Email, Username, Password (`/register`)
  - **Sign in** (secondary) → Username, Password (`/(auth)/login`)
  - Reassurance: *"No pressure. You can explore at your pace."*
  - Language toggle (EN | عربي) for app-wide locale and RTL.
- **After successful register or login:** User is redirected automatically to **Home** (`/(tabs)`).

**UX decisions:**
- Single entry point; no modal or interstitial. Copy is trauma-informed and low-pressure.
- Registration benefit is explicit so users know why to create an account.

---

## 2. Home page (primary hub)

**Screen:** Home tab (`app/(tabs)/index.tsx` → `home-sessions.tsx`)

### A. Search bar (top)

- **Persistent** at the top of the scrollable content.
- Users can search by:
  - **Session subject** (session name)
  - **Provider name**
- **Real-time filtering:** The list of session cards updates as the user types.

### B. Available support group sessions (main content)

- Sessions are shown as **cards** in a vertical list.
- **Each session card includes:**
  - Session name
  - Provider name
  - Date & time
  - Format: **Online** or **In-Person** (with icon)
  - Availability: Male / Female / Mixed
  - **Language:** English, Arabic, or Bilingual (language in which the session is conducted)
  - **Enrollment count:** e.g. *"X people enrolled"* with a group icon
- Cards are **tappable** and clearly interactive (elevation, accent border, press feedback).

### C. AI agent (Therabot)

- **Floating action button (FAB)** on the Home page (e.g. bottom-right).
- **Purpose:** Help users discover sessions based on how they feel.
- **Behavior:**
  - Opens a modal where users can type how they’re feeling or what they’re looking for.
  - Therabot suggests **relevant sessions** from available groups (keyword match on name, description, provider, availability, language).
  - Copy states that it **never replaces human support**—only guides discovery.

**UX decisions:**
- Home is the single hub for discovery; no competing entry points.
- Search + Therabot reduce cognitive load while keeping control with the user.

---

## 3. Session details (on card tap)

**Screen:** Session detail (`app/session/[id].tsx`)

- **Navigation:** Tapping a session card on Home → `/session/[id]`.
- **Content:**
  - **Session title**
  - **Provider name**
  - **Date, time, duration**
  - **Format:** Online / In-Person
  - **Language:** English / Arabic / Bilingual
  - **Short description** (session focus)
  - **Availability:** Male / Female / Mixed
  - **Enrollment:** number of participants currently enrolled and max
  - **Status:** **Available** or **Fully booked**
  - **Enroll** button (disabled if fully booked)

**UX decisions:**
- One clear primary action (Enroll). Status and capacity are visible so expectations are clear.

---

## 4. Enrollment confirmation flow

- **When the user taps Enroll:**
  1. Participant count is **increased in real time** (store update + optional micro-animation on return to Home).
  2. User is taken to the **enrollment confirmation** screen.

- **Confirmation screen** (`app/enrollment-confirmation.tsx`):
  - **Title:** *"Thank you for your enrollment."*
  - **Message:** *"Session details and links will be sent to your email."*
  - Optional line when applicable: *"You're signed up for [session name]."*
  - **OK** button → redirects back to **Home** (tabs). Back button is hidden so the natural next step is Home.

**UX decisions:**
- Confirmation is simple and reassuring; no extra steps. OK explicitly returns to Home so the flow is predictable.

---

## 5. Bottom navigation bar (persistent)

**Tabs** (`app/(tabs)/_layout.tsx`):

| Tab       | Route / content           | Purpose                                      |
|----------|---------------------------|----------------------------------------------|
| **Home** | `index` → session list    | Discover and search support group sessions   |
| **Providers** | `providers`         | List of facilitators; tap for bio & sessions |
| **Profile**   | `profile`            | Account, sessions attended, streak, upcoming |

- Nav bar is **persistent** across these three areas.
- Hidden routes (e.g. `home-sessions`, `explore`) are not shown in the tab bar.

---

## 6. Providers page

**Screen:** Providers tab (`app/(tabs)/providers.tsx`)

- **Provider cards** with:
  - Name (some in Arabic, some in English)
  - Gender (Female / Male only in UI per product requirement)
  - Degree / credentials
  - **Specialty tags** (chips)
  - Volunteer co-host indicator when applicable
  - **Tap affordance:** *"View bio & sessions"*
- **On tap:** Navigate to **Provider detail** (`app/provider/[id].tsx`): bio + list of sessions they host.

**UX decisions:**
- Providers are people-first (photo placeholder, clear credentials). Copy supports trust without feeling clinical.

---

## 7. User profile page

**Screen:** Profile tab (`app/(tabs)/profile.tsx`)

- **Content:**
  - **Username** (from auth)
  - **Sessions attended** (with short, supportive micro-copy)
  - **Commitment:** e.g. *"X weeks of connection"* (encouraging, not demanding)
  - **Streak:** Shown only after 5+ sessions; before that, *"Your journey is building — every step counts."*
  - **Upcoming enrolled sessions** (from enrollments)
  - **Language** setting (EN | عربي) with note that it can be changed anytime
  - **Sign out**
- **Tone:** Clean, encouraging, no pressure or heavy gamification.

**UX decisions:**
- Progress is framed as connection and commitment, not scores or badges. Streak is unlocked only after meaningful participation.

---

## Full app screen structure

```
[App open]
    → index (redirect: auth? /(tabs) : /welcome)

/welcome
    → Register (/register)   → success → /(tabs)
    → Sign in (/(auth)/login) → success → /(tabs)

/(tabs)  — bottom nav: Home | Providers | Profile
    ├── index (Home)        → session list, search, Therabot FAB
    ├── providers           → provider list
    └── profile             → username, stats, streak, language, sign out

/register                   → form → success → /(tabs)
/(auth)/login               → form → success → /(tabs)

/session/[id]               ← from Home card tap
    → Enroll → /enrollment-confirmation

/enrollment-confirmation
    → OK → /(tabs)

/provider/[id]              ← from Providers card tap
```

---

## Example card layouts (conceptual)

### Session card (Home)

- **Row 1:** Session name (bold) | Format badge (Online/In-Person + icon)
- **Row 2:** Provider name
- **Row 3:** Date · Time (schedule icon)
- **Row 4:** Availability (e.g. Mixed) (category icon)
- **Row 5:** Language (e.g. English / Arabic / Bilingual) (language icon)
- **Row 6:** X people enrolled (group icon)
- **Chrome:** Rounded card, left accent border, soft shadow, tappable

### Provider card (Providers)

- **Row 1:** [Avatar placeholder] | Name (bold)
- **Row 2:** Gender (if Female/Male)
- **Row 3:** Degree
- **Row 4:** Specialty chips
- **Row 5:** Volunteer co-host badge (if applicable)
- **Row 6:** “View bio & sessions” + arrow
- **Chrome:** Rounded card, left accent border, soft shadow

---

## Design principles (summary)

- **Trauma-informed, emotionally safe language** across Welcome, Therabot, Profile, and confirmation.
- **Clear hierarchy and predictable navigation:** one primary hub (Home), obvious next step after Enroll (confirmation → Home).
- **Minimal steps:** no unnecessary screens; search and Therabot support discovery without clutter.
- **Professional but warm:** teal/sage/cream palette, soft shadows, rounded cards, supportive micro-copy.
- **Accessibility:** readable text, clear buttons, labels, and RTL support for Arabic.

---

*Togetherness — a calm gateway to human support.*
