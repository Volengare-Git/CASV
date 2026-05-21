# Guide de reprise — CASV

Ce fichier explique comment reprendre le projet exactement là où on s'est arrêtés.
Les clés sensibles sont dans `.env.local` (jamais sur GitHub).

---

## 1. Démarrer le serveur de développement

**Problème connu : Node.js n'est pas dans le PATH de PowerShell par défaut.**

```powershell
# Ajouter Node.js au PATH pour la session en cours (obligatoire à chaque nouvelle session)
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

# Vérifier
node --version   # → v24.15.0
npm --version    # → 11.12.1

# Démarrer le serveur (depuis le dossier du projet)
cd "C:\Claude\Projets\CaisseASavon\casv"
npm run dev
# → http://localhost:3000
```

Si npm est bloqué par la politique d'exécution PowerShell :
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

---

## 2. Structure du projet

```
casv/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── page.tsx                  # Accueil (badge ouverture dynamique)
│   │   │   ├── inscription/              # Formulaire pilote 3 étapes (mock payment)
│   │   │   ├── benevoles/                # Formulaire bénévole (tâches depuis DB)
│   │   │   ├── login/                    # Auth login + callback error display
│   │   │   ├── register/
│   │   │   ├── compte/                   # Espace participant + annulation inscription
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── admin/
│   │   │       ├── page.tsx              # Dashboard (toggle inscriptions, stats)
│   │   │       ├── admin-nav.tsx         # Nav avec exact matching
│   │   │       ├── actions.ts            # Server actions admin globales
│   │   │       ├── inscriptions/         # Tableau pilotes + actions
│   │   │       ├── benevoles/
│   │   │       │   ├── page.tsx          # Tableau bénévoles
│   │   │       │   ├── benevoles-table.tsx  # Multi-checkbox, export CSV/XLSX/PDF
│   │   │       │   └── actions.ts        # assignVolunteerPosts, CRUD tasks
│   │   │       │   └── taches/           # Gestion tâches bénévoles (CRUD + DnD)
│   │   │       └── editions/             # Gestion éditions (créer, activer, éditer)
│   │   ├── auth/callback/route.ts        # PKCE flow Supabase (reset password, magic link)
│   │   └── layout.tsx                    # Root layout sans html/body (locale layout l'a)
│   ├── components/
│   │   ├── navigation.tsx
│   │   ├── footer.tsx
│   │   └── ui/                           # shadcn v4 (Base UI, PAS Radix)
│   ├── i18n/
│   │   ├── routing.ts                    # locales: [fr, en], defaultLocale: fr, as-needed
│   │   └── request.ts
│   ├── lib/supabase/
│   │   ├── client.ts                     # createBrowserClient (client-side)
│   │   ├── server.ts                     # createServerClient (SSR, cookies)
│   │   ├── admin.ts                      # createAdminClient (service role, bypass RLS)
│   │   └── types.ts                      # Types Database complets (à jour)
│   └── middleware.ts                     # i18n + refresh session Supabase
├── messages/
│   ├── fr.json
│   └── en.json
├── scripts/                              # Scripts one-shot (supprimer après usage)
│   └── seed-tasks.mjs                    # Exemple de migration avec fetch Node.js
├── .env.local                            # Clés (non committé)
├── DEV_LOG.md                            # Journal de développement détaillé
└── REPRISE.md                            # Ce fichier
```

---

## 3. Connexion GitHub

**IMPORTANT : ne pas committer sans autorisation explicite de l'utilisateur.**

```powershell
cd "C:\Claude\Projets\CaisseASavon\casv"
git status
git add src/...   # Ajouter des fichiers précis, pas -A (risque .env)
git commit -m "Description"
git push origin master
```

Remote : `https://github.com/Volengare-Git/CASV.git` (branch `master`)

---

## 4. Connexion Supabase

### Credentials (aussi dans la mémoire Claude)
- **URL** : https://crzkcsmlrbaimgtoipac.supabase.co
- **Project ref** : `crzkcsmlrbaimgtoipac`
- **Anon key** : dans `.env.local` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Service role key** : dans `.env.local` → `SUPABASE_SERVICE_ROLE_KEY`
- **Management API token** : dans la mémoire Claude (reference_supabase.md) — ne jamais committer

### Via le client JS (données, CRUD)
- Client browser : `src/lib/supabase/client.ts` — pour les composants client
- Client server : `src/lib/supabase/server.ts` — pour les Server Components et Server Actions
- Client admin : `src/lib/supabase/admin.ts` — bypass RLS, uniquement côté serveur

### Via l'API Management (migrations SQL)

**⚠️ Ne jamais utiliser PowerShell directement pour du SQL avec des accents → corruption UTF-8.**
**Toujours utiliser un script `.mjs` avec `fetch()` natif Node.js :**

```js
// scripts/ma-migration.mjs
const TOKEN = "..."; // Management API token — voir mémoire Claude (jamais committer)
const REF   = "crzkcsmlrbaimgtoipac";

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

await query(`ALTER TABLE ma_table ADD COLUMN IF NOT EXISTS ma_colonne TEXT;`);
console.log("Migration OK");
```

```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
node scripts/ma-migration.mjs
```

**Supprimer le script après usage.** Ne jamais committer le token.

---

## 5. État de la base de données

| Table                     | Contenu actuel                                              |
|---------------------------|-------------------------------------------------------------|
| `editions`                | 2 lignes : édition 2025 (is_active=true) + édition 2026 test|
| `profiles`                | Comptes de test (admin + participants)                      |
| `registrations`           | Inscriptions pilotes de test                                |
| `volunteer_posts`         | Postes bénévoles (créneaux horaires) copiés depuis 2025     |
| `volunteer_registrations` | Inscriptions bénévoles de test                              |
| `volunteer_tasks`         | 10 tâches pour l'édition active (labels FR propres)         |

### Schéma `volunteer_registrations` — colonnes importantes
```
id, user_id, edition_id
guest_first_name, guest_last_name, guest_email, guest_phone
age_group          -- "moins_18" | "18_et_plus"
task_interests     -- JSONB : { [task_uuid]: "oui"|"si_necessaire"|"non" }
wants_membership   -- BOOLEAN
assigned_post_ids  -- TEXT[] : UUIDs de volunteer_posts assignés par l'admin
assigned_post_id   -- TEXT (legacy, maintenu en sync avec assigned_post_ids[0])
status             -- "pending" | "assigned" | "confirmed"
assignment_mode    -- "auto" | "manual"
notes, created_at
```

### Schéma `volunteer_tasks`
```
id (UUID), edition_id, label (TEXT), display_order (INT)
RLS : SELECT public, INSERT/UPDATE/DELETE via service role uniquement
```

---

## 6. Points d'attention sur la stack

### shadcn/ui v4 = Base UI (pas Radix)
- Pas de `asChild` prop → utiliser `render={<MonComposant />}` ou styliser directement
- `Select.onValueChange` retourne `string | null` (pas `string`)
- `variant="outline"` sur fond sombre → applique `bg-background` (blanc) → utiliser `<Link>` plain

### Supabase types
- Chaque table doit avoir `Relationships: []` dans `types.ts` sinon TypeScript infère `never`
- Les colonnes nullables doivent être `optional` (`?`) dans le type `Insert`
- Ne pas faire d'import dynamique (`await import()`) pour le client Supabase → perd le générique
- Toujours mettre à jour `types.ts` quand une colonne est ajoutée en DB

### next-intl v4
- `localePrefix: "as-needed"` → FR sans préfixe (`/`), EN avec (`/en/`)
- Pages server : `getTranslations()` / Composants client : `useTranslations()`
- `Link` et `useRouter` importés depuis `@/i18n/routing` (pas `next/link` directement)

### Server Actions ("use server")
- **Toutes les exports DOIVENT être `async`** — même les fonctions utilitaires pures
- Mettre les fonctions synchrones (utils) dans un fichier sans `"use server"`
- Pattern admin : `assertAdmin()` → vérifie rôle → retourne `createAdminClient()`

### Root layout vs Locale layout
- `src/app/layout.tsx` : pas de `<html>/<body>` — juste `{children}`
- `src/app/[locale]/layout.tsx` : a les `<html>/<body>`
- Les routes hors `[locale]` (ex: `/auth/callback`) doivent être des **Route Handlers** (pas des pages)

### Gestion de l'état client après Server Action
- `revalidatePath()` invalide le cache mais ne suffit pas à re-synchroniser un `useState`
- Pour les composants avec état local : `router.refresh()` + `useEffect([initialProp], () => setState(initialProp))`

### Encodage PowerShell
- `Invoke-RestMethod` corrompt les accents (é, è, à...) même avec `-Encoding utf8`
- Toujours utiliser un script `.mjs` avec `fetch()` Node.js pour les requêtes avec du texte français

---

## 7. Prochaines tâches (dans l'ordre de priorité)

### Priorité haute
1. **Emails de confirmation** (Resend)
   - ⚠️ Vérifier d'abord le domaine casv.ch dans Resend (DNS à ajouter)
   - Template inscription pilote (confirmation + récap véhicule)
   - Template inscription bénévole (confirmation + récap disponibilités)
   - Template confirmation poste assigné (pour bénévoles après assignation admin)

2. **Résultats de course**
   - Admin : upload PDF (stocker dans `/uploads/` ou Supabase Storage)
   - Page publique `/resultats` : liste des PDFs par édition, téléchargement

### Priorité moyenne
3. **Pages statiques** (contenu réel à remplir)
   - `/course` : programme détaillé, règlement officiel, plan du parcours, accès GPS
   - `/association` : historique CASV, membres du comité, contact
   - `/contact` : formulaire ou simple page avec email/téléphone

4. **SEO**
   - `generateMetadata()` sur toutes les pages
   - OG tags (image de partage)
   - `sitemap.xml` et `robots.txt`

### Priorité basse / phase ultérieure
5. **Galerie photos** — navigation par année, upload admin
6. **Traduction EN** — tous les messages + contenu statique
7. **Stripe + Twint** — l'asso doit d'abord créer son compte Stripe avec IBAN CH
8. **Migration hébergement** — décision NAS / Infomaniak VPS / Vercel à prendre

---

## 8. Commandes utiles résumées

```powershell
# Setup session (toujours faire en premier)
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
cd "C:\Claude\Projets\CaisseASavon\casv"

# Démarrer le dev server
npm run dev

# Vérifier les types TypeScript
npx tsc --noEmit

# Lancer un script de migration SQL
node scripts/nom-script.mjs

# Git
git status
git add src/chemin/vers/fichier.tsx
git commit -m "feat: description"
git push origin master
```
