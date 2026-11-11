[README.md](https://github.com/user-attachments/files/34682932/README.md)
# Psychosocial and Organisational Risk Survey

Annual survey (Portuguese and English) for office staff and field inspectors, whether employees, external providers or freelancers. Built with Next.js and Supabase (Postgres), deployed from GitHub to Vercel.

- **Access by email.** Only emails on an allowlist receive a 6-digit sign-in code.
- **Permanent database.** Answers are stored in Supabase Postgres, which you own.
- **One response per person per year**, with answers kept separate from identity.
- **Results for admins only**, with scores per dimension, harassment and reporting figures, comments, CSV export and an optional Claude-written analysis.
- **Groups of fewer than 5 responses are never shown.**

> This code was written without being installed or run, because the build environment had no package access. Expect to fix a small issue or two on first build. Follow the checks in step 7 before sending the link to staff.

## What you need

- A GitHub account
- A Supabase account (free plan is enough for this size)
- A Vercel account (free Hobby plan is enough for a non-commercial test; check Vercel's terms for company use and use a paid plan if required)
- Optional: an Anthropic API key for the analysis button

## 1. Put the code on GitHub

1. Create a new **private** repository on GitHub.
2. Upload this whole folder to it (or run `git init`, `git add .`, `git commit`, `git remote add origin ...`, `git push`).

## 2. Create the database (Supabase)

1. In Supabase, create a project. Choose an EU region (for example Frankfurt or Paris) to keep data in the EU. Save the database password.
2. Open **SQL Editor**, paste the whole content of `supabase/migrations/0001_init.sql` and run it.
3. Create your first admin. Copy `supabase/seed.sql.example`, put your email in it and run it in the SQL Editor.
4. Open **Authentication > Email Templates > Magic Link** and replace the body with a version that shows the code, for example:

   ```html
   <h2>Código de entrada / Sign-in code</h2>
   <p>{{ .Token }}</p>
   <p>Válido por pouco tempo. / Valid for a short time.</p>
   ```

   The app signs people in with this code, so the template must contain `{{ .Token }}`.
5. Open **Authentication > Providers > Email**. Keep email enabled and keep **Confirm email** on.
6. Open **Project Settings > API** and copy the project URL, the `anon` key and the `service_role` key.

Supabase's built-in email sender is limited to a few emails per hour. For a real rollout set up your own SMTP provider under **Authentication > SMTP Settings** (for example Resend, Brevo or your company mail).

## 3. Deploy (Vercel)

1. In Vercel choose **Add New > Project** and import the GitHub repository.
2. Under **Environment Variables** add the values below, then deploy.

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (secret, server only) |
| `SURVEY_YEAR` | `2026` |
| `ANTHROPIC_API_KEY` | Optional, enables the analysis |

3. Every later `git push` to `main` redeploys automatically.

## 4. Invite people

1. Open the app URL and sign in with your admin email.
2. Go to **Acessos / Access**, paste the emails of employees, providers and freelancers, choose **Respondent** and add them.
3. Send them the app URL. They enter their email, receive a code and answer.

## 5. Read the results

Open **Resultados / Results**. Use the filters, export the anonymised CSV for your risk assessment file, and use **Analisar resultados** for the Claude summary.

## 6. Next year

Change `SURVEY_YEAR` in Vercel to `2027` and redeploy. Old answers stay in the database and appear under the year filter. People can answer again because the "already answered" marker is per year.

## 7. Check before launch

1. Sign in as admin, answer the survey yourself, then check **Results** after you add 4 more test respondents (nothing shows below 5).
2. Sign in with an email that is not on the list. You should see "not on the access list" and no survey.
3. Try to answer twice with the same email. The second attempt must be refused.
4. In Supabase **Table Editor**, open `responses` and confirm there is no email, user id or timestamp in any row.
5. Delete your test answers before the real round: in the SQL Editor run `delete from responses; delete from submissions;`.

## How anonymity works, and its limits

- The `responses` table holds answers only: no email, user id, date, time or IP.
- A separate `submissions` table records only that a person answered in a given year, to stop repeats.
- Both rows are written together by one database function, so there is no link column between them.
- Limit: someone with full database access (you as Supabase owner) could try to match rows by insertion order. Don't tell staff the survey is anonymous beyond what this design delivers. Say that answers are not linked to names in the app and are only shown in groups of 5 or more.
- Free-text comments can identify a person by their content. The survey tells people not to include names or identifying details, and admins should treat comments as confidential.
- Admin results are computed in the browser from all stored responses. Small groups are hidden in the interface, but an admin with database access can still read raw rows.

## Data protection (GDPR)

Before you collect data, check these with your data protection contact or lawyer:

- Add a short privacy notice (a template is in `docs/privacy-notice.md`).
- Decide how long you keep responses and delete old rounds accordingly.
- Sign Supabase's and Vercel's data processing agreements if required, and keep the Supabase project in the EU.
- Health-related comments can be sensitive personal data. Limit admin access to people who need it.

## Project structure

```
app/                     Pages and API routes (Next.js App Router)
  page.tsx               Sign-in
  survey/                The survey
  admin/                 Results and access management (admins only)
  api/                   login, verify, submit, analyze, admin/allowlist
components/              Survey form, results, login, access manager, language switch
lib/survey-data.ts       All questions in Portuguese and English (edit here)
lib/scoring.ts           Scoring and the summary sent to Claude
supabase/migrations/     Database schema, security rules, submit function
.github/workflows/       CI: type-check and build on every push
docs/                    Privacy notice template
```

## Changing the questions

Edit `lib/survey-data.ts`. Each item is `[id, Portuguese, English]`; add `true` as a fourth value for reverse-scored items. Do not rename ids once a round has started, because stored answers use them.

## Local development

```
cp .env.example .env.local   # fill in the values
npm install
npm run dev
```

## Legal background

Law no. 102/2009 (health and safety at work) and articles 281 onwards and 29 of the Portuguese Labour Code. Validate the wording and the thresholds (low up to 40, moderate 41 to 60, high above 60) with your health and safety service. The survey supports, and does not replace, the documented risk assessment.
