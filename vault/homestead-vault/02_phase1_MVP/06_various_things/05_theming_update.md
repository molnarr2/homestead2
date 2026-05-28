# Theming Update — Restore Red/Rust Brand Identity

## Summary

The current app uses a forest green (#4A6741) primary palette with earthy brown accents. The old app used a warm red/rust (#BA1A20) primary with soft lavender backgrounds and pink-tinted surfaces. This spec restores the old brand identity while keeping the new app's cleaner Uniwind/Tailwind architecture and improving color consistency.

## Current Behavior

Colors defined in two files kept in sync:
- `apps/mobile/src/theme/colors.ts` — TypeScript constants used by non-Tailwind code (e.g. `ActivityIndicator color` props, inline icon colors)
- `apps/mobile/global.css` — CSS custom properties (`--color-*`) consumed by Uniwind className strings

Current palette:
- Primary: `#4A6741` (forest green) / light `#6B8F61` / dark `#2D4228`
- Secondary: `#8B6F47` (warm brown) / light `#A68B63` / dark `#6B5232`
- Accent: `#D4A847` (golden)
- Background: `#F5F2ED` (warm off-white)
- Surface: `#FFFFFF`
- Status: success `#4CAF50`, warning `#FF9800`, error `#E53935`, info `#2196F3`

Every component references these via Tailwind classes (`bg-primary`, `text-primary`, `border-primary`, etc.) or the `colors.ts` export.

## Desired Behavior

Replace the green/brown palette with the old app's red/rust palette, refined for better contrast and consistency. The old app used react-native-paper's MD3 theme system with many redundant surface tints; the new app flattens this into a smaller, intentional set.

### New Color Palette

#### Primary (Red/Rust)
- `primary`: `#BA1A20` — the old app's brand red, used for buttons, FAB, active tab, links
- `primaryLight`: `#D4464B` — lighter variant for hover/pressed states and secondary emphasis
- `primaryDark`: `#8C1318` — darker variant for text-on-light, header accents

#### Secondary (Warm Brown)
- `secondary`: `#775653` — the old app's `rgb(119, 86, 83)`, used for secondary text, icons, subtle UI
- `secondaryLight`: `#A08886` — muted variant for borders, disabled states
- `secondaryDark`: `#5A3D3B` — deeper variant for strong secondary emphasis

#### Accent (Golden Brown)
- `accent`: `#B08A2E` — the old app's tertiary golden-brown, used for badges, tier labels, highlights
- `accentLight`: `#D4A847` — lighter for backgrounds behind accent text
- `accentDark`: `#7A5F1F` — deeper for accent text on light backgrounds

#### Backgrounds & Surfaces
- `background`: `#F7F3F9` — the old app's `rgb(247, 243, 249)`, soft lavender-grey
- `backgroundDark`: `#EDE7F0` — slightly deeper lavender for section dividers, grouped backgrounds
- `surface`: `#FFFFFF` — card/modal backgrounds (unchanged)
- `surfaceElevated`: `#FFFBFE` — the old app's `rgb(255, 251, 254)`, barely-pink white for headers

#### Warm Tints (for subtle fills)
- `warm50`: `#FFF5F4` — barely-pink, for selected rows, hover states
- `warm100`: `#FFDAD6` — the old app's `rgb(255, 218, 214)`, for error containers, light fills
- `warm200`: `#F5DDDB` — the old app's surface variant, for alternating row backgrounds

#### Text
- `text.primary`: `#201A19` — the old app's `rgb(32, 26, 25)`, warm near-black
- `text.secondary`: `#534342` — the old app's `rgb(83, 67, 66)`, warm dark grey
- `text.disabled`: `#B5A8A6` — warm light grey
- `text.inverse`: `#FFFFFF` — white (unchanged)

#### Borders
- `border.light`: `#EDE7F0` — matches backgroundDark, for subtle dividers
- `border.medium`: `#D8C2BF` — the old app's `rgb(216, 194, 191)`, for input outlines
- `border.dark`: `#857371` — the old app's `rgb(133, 115, 113)`, for strong outlines

#### Status (unchanged)
- `status.success`: `#4CAF50`
- `status.warning`: `#FF9800`
- `status.error`: `#E53935`
- `status.info`: `#2196F3`

### Component Styling Changes

#### Buttons
No structural changes. The red primary propagates automatically through `bg-primary`, `border-primary`, `text-primary` classes. Verify:
- `PrimaryButton` — `bg-primary` becomes red, white text stays correct
- `SecondaryButton` — `border-primary` and `text-primary` become red-outlined
- `FloatingActionButton` — `bg-primary` becomes red FAB (matches old app's `#ba1a20` FAB)
- `ThemeButton` tertiary variant — `bg-accent` becomes golden-brown, `text-primary-dark` becomes dark red; verify contrast. If poor, change tertiary text to `text-accent-dark`
- Loading indicator colors in `ThemeButton` — update hardcoded hex values to match new palette

#### Cards
No structural changes. Cards use `bg-surface` (white) which is unchanged. Status left-border colors (`border-l-status-error`, `border-l-status-warning`) are unchanged.

#### Dialogs & Modals
- `ConfirmDialog` normal confirm button uses `bg-primary` — becomes red. This is correct for a primary action.
- `SelectDialog` selected item uses `bg-primary/10` — becomes light red tint. Verify this looks intentional against the lavender background.

#### Navigation
- Tab bar active tint: currently hardcoded `#4A6741` in `MainScreen.tsx` — change to `#BA1A20`
- Tab bar inactive tint: currently hardcoded `#6B6B6B` — change to `#857371` (new border.dark, warmer grey)
- `SideMenu` avatar background: uses `bg-primary` — becomes red automatically
- `SideMenu` subscription badge: uses `bg-accent` — becomes golden-brown, `text-primary-dark` becomes dark red; verify contrast

#### Home/Dashboard
- Greeting text uses `text-text-primary` — becomes warm near-black automatically
- Back buttons use hardcoded `#1A1A1A` — change to `#201A19` (or use `colors.text.primary`)

#### Icons
Several components hardcode icon colors as hex strings passed to `MaterialDesignIcon` color props:
- `#4A6741` (primary green) — change to `#BA1A20`
- `#9CA3AF` (cool grey) — change to `#B5A8A6` (warm grey matching text.disabled)
- `#DC2626` (error red) — keep as-is (close to status.error)
- `#1A1A1A` (near-black) — change to `#201A19`

#### Screen Backgrounds
`ScreenContainer` uses `bg-background` — becomes lavender automatically. No changes needed.

#### Empty States
Icon color is hardcoded `#9CA3AF` — change to `#B5A8A6`.

## Touch Points

### Theme Layer
- `apps/mobile/src/theme/colors.ts` — replace all color values with the new palette
- `apps/mobile/global.css` — replace all `--color-*` values to match colors.ts

### Button Components
- `apps/mobile/src/components/button/ThemeButton.tsx` — update hardcoded indicator color hex values in the color mapping table
- `apps/mobile/src/components/button/SecondaryButton.tsx` — update hardcoded loading indicator color from `#4A6741`
- `apps/mobile/src/components/button/SpeedDialFab.tsx` — update hardcoded icon color from `#4A6741`

### Layout Components
- `apps/mobile/src/components/layout/EmptyState.tsx` — update hardcoded icon color from `#9CA3AF`

### Navigation
- `apps/mobile/src/navigation/MainScreen.tsx` — update hardcoded tab tint colors
- `apps/mobile/src/navigation/SideMenu.tsx` — verify subscription badge contrast with new accent/primary-dark combo

### Screens (hardcoded hex grep)
Run `grep -rn '#4A6741\|#6B8F61\|#2D4228\|#8B6F47\|#9CA3AF\|#1A1A1A\|#6B6B6B' apps/mobile/src/` to find every remaining hardcoded color reference. Each hit needs updating to either:
1. The new hex equivalent, or
2. A reference to `colors.ts` (preferred, to keep a single source of truth)

## Data Migration

None. This is a purely cosmetic change with no data model impact.

## Risk

**Contrast regressions.** The old app's red primary on white passes WCAG AA for large text but fails for small text (contrast ratio ~4.0:1). The `primaryDark` variant (`#8C1318`) at ~6.5:1 should be used where small red text appears on white. Run through every screen after the swap and verify no text becomes unreadable.

**Hardcoded hex values.** Any color hardcoded as a hex string in a component (rather than using a Tailwind class or `colors.ts` import) will not update automatically. The grep in Touch Points must be exhaustive. After updating, grep again for any old palette values to confirm none remain.

**Tertiary button contrast.** The ThemeButton tertiary variant currently renders golden text on a golden background when in outline mode — this is a pre-existing issue. With the new palette, verify the solid tertiary variant (`bg-accent` + `text-primary-dark`) produces readable text (golden background + dark red text has ~4.8:1 ratio — borderline). If needed, switch tertiary solid text to `text-accent-dark` or white.
