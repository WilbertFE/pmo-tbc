<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md: PMO TBC

Instructions for every AI coding agent working in this repository (Claude Code, Cursor, Copilot, and others). Read this whole file before doing anything.

Project: a web app that helps tuberculosis (TBC) patients and their PMO do daily medication check-ins with video or photo, while puskesmas health workers (nakes) monitor, verify, and follow up through a real-time dashboard. Built for Hackathon JOINTS UGM 2026 (Healthcare theme). Submission deadline: **16 October 2026, 23:50 WIB**. A working MVP beats extra features.

---

## 1. Session start: identify the developer (gatekeeping)

Before doing the **first task of a new session**, ask exactly once:

> Siapa yang sedang coding sekarang?
> 1. Kapten (Wilbert): backend bersama, database, integrasi
> 2. Programmer 2: aplikasi pasien
> 3. Programmer 3: dashboard nakes

Rules:

- If the user already said who they are in their first message (for example "saya P2" or "aku kapten"), do not ask; use that answer.
- Ask only once per session. Before asking, check the conversation history; if it was already answered, use the existing answer.
- Remember the answer for the rest of the session and apply the scope rules below.
- Reading any file is always allowed. The scope rules only limit **writing and editing**.

### Scope per developer

| Developer | May edit | Must not edit without confirmation |
| --- | --- | --- |
| Kapten | `src/lib/`, `supabase/migrations/`, `src/app/api/`, `src/app/login/`, `src/middleware.ts` (or `src/proxy.ts`), config files, shared `src/components/` | Nothing is off limits, but warn before large changes inside `src/app/pasien/` or `src/app/nakes/` |
| Programmer 2 | `src/app/pasien/` (including `src/app/pasien/components/`), API routes used only by the patient app | `src/app/nakes/`, `src/lib/supabase/`, `supabase/migrations/`, shared `src/components/` |
| Programmer 3 | `src/app/nakes/` (including `src/app/nakes/components/`), API routes used only by the nakes dashboard, early warning logic | `src/app/pasien/`, `src/lib/supabase/`, `supabase/migrations/`, shared `src/components/` |

When a task needs a change outside the developer's scope:

1. Stop before editing.
2. Explain which files are affected and whose area they belong to.
3. Recommend coordinating with the owner (for example: "Perubahan skema database sebaiknya dikerjakan Kapten").
4. Proceed only if the user explicitly confirms.

Database schema changes and changes to `src/lib/supabase/` are always Kapten's job. Other developers may draft the SQL or code and hand it over, but should not commit it themselves.

---

## 2. How to work

- **Do not jump into implementation.** Only edit files when the user clearly asks for a change. When intent is ambiguous, default to explaining, researching, and recommending.
- **Never speculate about code you have not opened.** If the user mentions a file, read it before answering. Investigate relevant files before making claims about the codebase.
- **Parallel tool calls:** when several tool calls do not depend on each other (for example reading 3 files), run them in parallel. Run dependent calls sequentially. Never guess missing parameters.
- **Always maintain the project structure** described in section 5.
- **After finishing a task that used tools**, give a short summary of what changed.
- **Respond to the user in Bahasa Indonesia.** Code, identifiers, and commit messages may be in English.
- If an instruction from the user conflicts with this file, point out the conflict and ask before proceeding.

---

## 3. Writing style

- Do NOT use the em dash character anywhere: code, comments, UI text, commit messages, or documentation, in any language including Indonesian.
- Use a comma, period, colon, or restructure the sentence instead.
- All user-facing UI text is in simple, friendly Bahasa Indonesia.

---

## 4. Tech stack

| Part | Technology |
| --- | --- |
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS only |
| Components | shadcn/ui (Vega preset). Docs: https://ui.shadcn.com/ |
| Database & auth | Supabase (Postgres, Auth, Row Level Security) via `@supabase/ssr` |
| Media storage | Supabase Storage, private bucket `checkin-media` |
| Real-time | Supabase Realtime (Postgres Changes) |
| Deploy | Vercel |

---

## 5. Project structure

```
src/
├── app/
│   ├── api/                  → API routes (CRUD)
│   ├── login/                → login page
│   ├── pasien/               → patient/PMO app (mobile-first)
│   │   └── components/       → components used only by the patient app
│   └── nakes/                → nakes dashboard (desktop-first)
│       └── components/       → components used only by the dashboard
├── components/
│   └── ui/                   → shadcn components
│   (other reusable components live directly in src/components/)
└── lib/
    ├── supabase/             → Supabase clients (browser and server)
    └── ...                   → utilities and helpers (dates, status logic)
supabase/
└── migrations/               → SQL schema, numbered files
```

Rules:

- Reusable component: `src/components/`. Component used by one page only: `src/app/{page}/components/`.
- Utilities and helpers (database connection, date helpers, status logic): `src/lib/`.
- Install and build components with shadcn first. Check `src/components/ui/` before creating a new component.
- Always use Tailwind CSS for styling. No CSS modules, no inline style objects unless unavoidable.
- When changing the UI, use the frontend design skill if your tool provides one.

---

## 6. Data access rules

- **CRUD goes through API routes** in `src/app/api/`. API routes must use the Supabase **server client with the user's session**, so Row Level Security still applies.
- **Exception 1, media upload:** upload check-in videos and photos **directly from the browser to Supabase Storage**, not through an API route. Vercel functions limit request body size (around 4.5 MB), which video easily exceeds. After upload, save the row in `checkin` through an API route.
- **Exception 2, real-time:** subscribe to Supabase Realtime from client components. Always remove the channel on unmount with `supabase.removeChannel(channel)`.
- Never use the service role key in client code. Never disable RLS to "fix" an access error; write the correct policy instead (Kapten's job).
- Use Server Components by default. Add `"use client"` only for interaction, camera access, or real-time.
- Create Supabase clients only in `src/lib/supabase/`; import them elsewhere.

---

## 7. Domain context

### Glossary

| Term | Meaning |
| --- | --- |
| TBC | Tuberculosis. Treatment is daily for about 6 months (default 180 days). |
| PMO | Pengawas Menelan Obat. Usually a family member who makes sure the patient takes the medicine. |
| Nakes | Health worker, here the TBC program officer at a puskesmas. |
| Puskesmas | Community health center, primary care facility. |
| Check-in | Daily proof that the patient took the medicine, as video or photo. |
| Putus obat | Patient stops treatment before it is finished. This is what the app tries to prevent. |
| VOT | Video-observed therapy. The concept behind this app, recognized by WHO. |
| SITB | Kemenkes TBC information system. This app does **not** integrate with it. |

### Roles

| Role (`profiles.peran`) | Can | Cannot |
| --- | --- | --- |
| `pasien` | Check in, report side effects, see own progress and history | See other patients |
| `pmo` | Check in and report side effects for the patient they accompany, see that patient's progress | See other patients |
| `nakes` | See all patients they handle, review and verify check-ins, write follow-up notes | See patients handled by other nakes |

After login: `pasien` and `pmo` go to `/pasien`, `nakes` goes to `/nakes`.

### Main flows

**Daily check-in (patient app)**

1. Patient/PMO opens `/pasien` and sees today's status: checked in or not.
2. Taps the large "Check-in sekarang" button.
3. Records a short video (about 15 seconds max) or takes a photo while taking the medicine.
4. File uploads to `checkin-media`, then a `checkin` row is created with status `menunggu`.
5. Optional: report a side effect (type and severity).
6. Confirmation screen shows progress, for example "Hari ke-47 dari 180".

One check-in per patient per date (`unique (pasien_id, tanggal)`).

**Review (nakes dashboard)**

1. Nakes opens `/nakes` and sees their patients with a status color.
2. The list updates in real time when a check-in or side effect report arrives.
3. Nakes opens a check-in, plays the media, and marks it `terverifikasi` or `ditolak`.
4. For red-status patients, nakes writes a note in `tindak_lanjut`.

### Early warning rules (initial version, adjustable)

Computed in Asia/Jakarta time. Implement in **one reusable function** in `src/lib/`, never scattered across components.

| Status | Condition |
| --- | --- |
| Red | No check-in for 2 consecutive days (yesterday, and today after `jam_minum` has passed), **or** a `berat` side effect in the last 3 days |
| Yellow | No check-in today and more than 2 hours past `jam_minum`, **or** a `sedang` side effect in the last 3 days |
| Green | Checked in today and not red or yellow |

If red and yellow both apply, use red. Red patients always appear at the top of the dashboard.

### Data model

Full schema in `supabase/migrations/`. Table and column names are in Bahasa Indonesia; always use the exact names.

| Table | Key columns | Notes |
| --- | --- | --- |
| `profiles` | `id` (= `auth.users.id`), `nama`, `peran` | `peran`: `pasien`, `pmo`, `nakes` |
| `pasien` | `id`, `profile_id`, `pmo_id`, `nakes_id`, `tanggal_mulai`, `durasi_hari` (default 180), `jam_minum` | Treatment data per patient |
| `checkin` | `id`, `pasien_id`, `tanggal`, `media_path`, `status`, `created_at` | `status`: `menunggu`, `terverifikasi`, `ditolak` |
| `efek_samping` | `id`, `pasien_id`, `jenis`, `tingkat`, `catatan`, `created_at` | `tingkat`: `ringan`, `sedang`, `berat` |
| `tindak_lanjut` | `id`, `pasien_id`, `nakes_id`, `catatan`, `created_at` | Nakes follow-up notes |

Progress: `hari_ke = (today in WIB - tanggal_mulai) + 1`, capped at `durasi_hari`.

Tables in the `supabase_realtime` publication: `checkin`, `efek_samping`. Realtime respects RLS; if events do not arrive, check the `select` policy first.

New schema changes: always a **new** numbered migration file (`003_...sql`), never edit an existing one.

---

## 8. Critical rules (do not break)

**Time zone**
- All date logic uses **Asia/Jakarta (WIB)**.
- The Supabase database runs in UTC. Do not rely on `current_date` in the database for the patient's "today". Compute the WIB date in the app and send it explicitly.

**Privacy**
- Bucket `checkin-media` is private. Show media only through short-lived **signed URLs**, never public URLs.
- Media path: `{pasien_id}/{tanggal}.{ext}`, for example `8f2c.../2026-10-14.webm`.
- TBC still carries stigma. **Notification text, tab titles, and any text others might see must not contain "TBC" or "tuberkulosis".** Use neutral text such as "Waktunya minum obat".

**Design**
- Patient app: mobile-first, large buttons, minimal text, one main action per screen. Users may be elderly or not used to technology.
- Nakes dashboard: desktop-first, information-dense, status colors easy to scan.

---

## 9. Out of scope (do not build unless explicitly asked)

- Computer vision verification that the patient actually swallowed the medicine. Nakes verify manually.
- Integration with SITB or any government system.
- Native Android/iOS apps. The patient app is a mobile-friendly web app.
- WhatsApp Business API integration.
- Payments, chat between users, or social features.

---

## 10. Tests

- Write unit tests for crucial pure logic: the early warning status function, WIB date helpers, and progress calculation. Use Vitest; if it is not set up yet, tell the user and ask Kapten before installing.
- UI and end-to-end tests are not required for this hackathon.

---

## 11. Git policy

Commit after every completed feature, fix, refactor, or documentation update.

**Branches**
- **Never commit or push directly to `main`.** `main` is protected and only changes through pull requests.
- If the current branch is `main`, create a new branch first: `feat/...`, `fix/...`, `docs/...`, `refactor/...`, `chore/...`.

**Commit messages**: conventional commits, with the area as scope when useful:
- `feat(pasien): add video check-in upload`
- `fix(nakes): correct realtime status refresh`
- `feat(db): add efek_samping table`
- `docs: update setup instructions`

**Before committing**
1. Run `npm run build` and make sure it succeeds.
2. Run `npm run lint` and relevant tests.
3. Run `git status` and review the diff. Never commit `.env.local`, secrets, temporary files, or debugging artifacts.
4. Stage files deliberately (`git add <files>`) rather than blindly adding everything.

**Commands**

```bash
git checkout -b feat/short-description   # only if currently on main
git add <files>
git commit -m "feat(scope): describe the change"
git push -u origin HEAD
```

After pushing, tell the user the branch is ready and remind them to open a pull request for review. Do not merge pull requests yourself.

- Never run `npm audit fix --force`. Ask the user before changing major versions of any dependency.