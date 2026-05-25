# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Walk it off

Mobile app (iOS + Android) for weight loss through walking and a calorie deficit. Target users are people who want to lose weight but dislike sport — walking is deliberately positioned as "not sport". The app is a side/learning project with no hard deadline. Full design document: `lukerennebach-unknown-design-20260521-144934.md` in the repo root.

**Tech stack:** React Native, Expo SDK 52, TypeScript, no backend (local-first).

**SDK constraint:** The test device runs Expo Go 54, which requires SDK 52. Do not upgrade `expo` beyond `~52.x` without also updating Expo Go on the device.

## Commands

```bash
npx expo start            # Start dev server + QR code for Expo Go
npx expo start --ios      # iOS simulator (requires Xcode)
npx expo start --android  # Android emulator
npx tsc --noEmit          # Type-check
npx expo install <pkg>    # Install packages — use this instead of npm install, picks SDK-compatible versions
```

## Architecture

Currently at scaffold stage: `index.ts` → `registerRootComponent(App)` → `App.tsx`. All features are to be built from `App.tsx` outward.

**Planned features (V1 — from approved design doc):**

**Step tracking**
- Automatic: `expo-sensors` Pedometer
- Manual fallback: "Add steps" or "Add activity: X min at Y km/h" — required because the phone in a pocket doesn't track treadmill use reliably, and the target users are unlikely to have a smartwatch

**Food logging**
- User photographs a meal → AI estimates calories → auto-logged
- Primary API: LogMeal (free tier for beta); Claude Vision API as upgrade path (~$0.005/photo)
- Fallback: if confidence < 60% or API fails, prompt user for manual calorie entry — never fail silently

**Calorie deficit calculation**
- Formula: `deficit = TDEE_base + steps_kcal - consumed_kcal` (positive = in deficit)
- TDEE via Mifflin-St Jeor × 1.2 (sedentary multiplier); user provides age, weight, height on first launch
- Steps-burned calories added on top of base TDEE daily

**Streak**
- A streak day = any calendar day (local timezone) where `deficit > 0`
- A day with no logged data breaks the streak to 0

**Storage**
- `expo-sqlite` for all structured data (meals, steps, daily summaries, streak)
- AsyncStorage only for flat user settings (profile, goals)

**Notifications**
- `expo-notifications`: soft afternoon reminder if step goal not yet reached

**Explicitly out of scope for V1**
- No social/friend features
- No macro tracking (calories only)
- No web or desktop
- No backend or user accounts

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore