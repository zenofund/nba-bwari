# NBA Bwari Digital Portal

A member-facing web portal for the Nigerian Bar Association — Bwari Area Council Branch.

## Stack

- **React 19** + **Vite 7** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** components
- **Recharts** for data visualisation
- All data is currently **mocked** in `src/lib/mock-data.ts` and `src/lib/admin-mock-data.ts`
- No backend yet — API stubs live in `src/lib/api.ts` and `src/lib/admin-api.ts` with `// TODO` comments pointing to a Laravel backend at `https://api.nbabwari.org/api/v1`

## Running the app

```bash
npm run dev   # starts Vite dev server on port 5000
```

The "Start application" workflow runs this automatically.

## Project structure

```
src/
  components/
    app-shell.tsx      # Sidebar, TopBar, DesktopHeader, BottomNav, AppShell, StatusBadge
    ui/                # shadcn/ui component library
  lib/
    api.ts             # Member API (mocked)
    admin-api.ts       # Admin API (mocked)
    mock-data.ts       # Member mock data
    admin-mock-data.ts # Admin mock data
    store.ts           # React context state (auth, current screen, navigation)
    utils.ts           # Tailwind helper (cn)
  screens/
    admin/             # Admin portal screens (AdminLayout + 9 screens)
    *.tsx              # Member portal screens (Welcome, Login, Dashboard, etc.)
  index.css            # CSS variables, custom utilities (glass, gradient-*)
```

## Design system

- **Navy** (`oklch(0.18 0.07 255)`) — primary sidebar and hero backgrounds
- **Gold** (`oklch(0.75 0.12 80)`) — accents, active indicators, CTAs
- **Royal** (`oklch(0.42 0.22 265)`) — secondary accent
- Dark and light themes supported via `.dark` CSS class
- Custom utilities: `.glass`, `.gradient-navy`, `.gradient-royal`, `.gradient-gold`

## Desktop layout (member portal)

- Fixed sidebar (`w-64`) with gold accent bar, grouped nav, left-border active indicator
- Sticky desktop header with page title, search bar (⌘K), notification bell, user avatar
- Mobile: bottom tab bar (5 items) + compact top bar
- Breakpoint: `lg` (1024px)

## User preferences

- Keep the project's existing file structure and stack — do not restructure or migrate
- Mobile-first codebase; desktop layout should feel premium, not just wider
