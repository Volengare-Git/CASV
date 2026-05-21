# Guide de reprise — CASV

Ce fichier explique comment reprendre le projet exactement là où on s'est arrêtés.
Les clés sensibles sont dans `.env.local` (jamais sur GitHub).

---

## 1. Démarrer le serveur de développement

**Problème connu : Node.js n'est pas dans le PATH de PowerShell par défaut.**

```powershell
# Ajouter Node.js au PATH pour la session en cours
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
│   │   ├── [locale]/          # Toutes les pages (FR par défaut, /en/ pour EN)
│   │   │   ├── page.tsx       # Accueil
│   │   │   ├── inscription/   # Formulaire pilote
│   │   │   ├── benevoles/     # Formulaire bénévole ← connecté à Supabase
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── compte/
│   │   └── layout.tsx         # Root layout (redirect /fr)
│   ├── components/
│   │   ├── navigation.tsx
│   │   ├── footer.tsx
│   │   └── ui/                # shadcn v4 (Base UI, pas Radix)
│   ├── i18n/
│   │   ├── routing.ts         # locales: [fr, en], defaultLocale: fr, as-needed
│   │   └── request.ts
│   ├── lib/supabase/
│   │   ├── client.ts          # createBrowserClient (client-side)
│   │   ├── server.ts          # createServerClient (server-side, cookies)
│   │   └── types.ts           # Types Database complets
│   └── middleware.ts          # i18n + refresh session Supabase
├── messages/
│   ├── fr.json                # Toutes les traductions FR
│   └── en.json                # Toutes les traductions EN
├── .env.local                 # Clés (non committé)
├── DEV_LOG.md                 # Ce qui a été fait
└── REPRISE.md                 # Ce fichier
```

---

## 3. Connexion GitHub

```powershell
cd "C:\Claude\Projets\CaisseASavon\casv"
git status
git add -A
git commit -m "Description du commit"
git push origin master
```

Remote déjà configuré : `https://github.com/Volengare-Git/CASV.git`

---

## 4. Connexion Supabase

### Via le client JS (données, CRUD)
Utiliser `src/lib/supabase/client.ts` (browser) ou `src/lib/supabase/server.ts` (server components).
Les clés sont dans `.env.local`.

### Via l'API Management (migrations SQL)
Claude peut exécuter du SQL directement via un script Node.js :

```js
// scripts/migration.mjs
const TOKEN = "…";  // Management API token (dans la mémoire de Claude)
const REF   = "crzkcsmlrbaimgtoipac";

const sql = `votre SQL ici`;

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});
console.log(await res.json());
```

```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
node scripts/migration.mjs
```

**Ne jamais committer un script contenant le token.** Supprimer le script après usage.

---

## 5. Points d'attention sur la stack

### shadcn/ui v4 = Base UI (pas Radix)
- Pas de `asChild` prop → utiliser `render={<MonComposant />}` ou styliser directement
- `Select.onValueChange` retourne `string | null` (pas `string`)
- `SheetTrigger` est déjà un `<button>` → pas besoin de le wrapper dans `<Button>`

### Supabase types
- Chaque table doit avoir `Relationships: []` sinon TypeScript infère `never`
- Les colonnes nullables doivent être `optional` (`?`) dans le type `Insert`
- Ne pas faire d'import dynamique (`await import()`) pour le client Supabase → perd le générique

### next-intl v4
- `localePrefix: "as-needed"` → FR sans préfixe (`/`), EN avec (`/en/`)
- Les pages serveur utilisent `getTranslations()`, les composants client `useTranslations()`

### Middleware
- Vérifier que `NEXT_PUBLIC_SUPABASE_URL` commence par `"http"` avant d'init Supabase
  (un placeholder comme `"your-url"` passe le check `!url` mais plante Supabase)

---

## 6. Base de données — état actuel

| Table                     | Contenu                              |
|---------------------------|--------------------------------------|
| `editions`                | 1 ligne : GPV 2025, is_active = true |
| `profiles`                | Vide (peuplé à l'inscription)        |
| `registrations`           | Vide                                 |
| `volunteer_posts`         | 8 postes pour l'édition 2025         |
| `volunteer_registrations` | Vide                                 |

RLS activé. Fonction `public.is_admin()` en place.

---

## 7. Reprendre le développement

Prochaines tâches dans l'ordre :
1. Connecter le formulaire **inscription pilote** à Supabase
2. Page **`/compte`** — afficher les inscriptions de l'utilisateur connecté
3. Interface **admin** — tableau de bord inscriptions + bénévoles
4. Emails de confirmation avec **Resend**
5. **Stripe** + Twint (phase ultérieure)
