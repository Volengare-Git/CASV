# Journal de développement — CASV

## 2026-05-21 — Session 1 : Fondations complètes

### Stack installée
- Node.js v24.15.0, npm v11.12.1
- Next.js 16.2.6 (App Router, Turbopack)
- TypeScript strict, Tailwind CSS v4, tw-animate-css
- shadcn/ui v4 — **ATTENTION : utilise @base-ui/react, pas Radix UI**
- next-intl v4.12.0 (i18n FR/EN)
- @supabase/supabase-js v2.106.1 + @supabase/ssr v0.10.3
- react-hook-form + zod + @hookform/resolvers
- sonner (toasts), lucide-react, class-variance-authority

### Pages créées (toutes opérationnelles, HTTP 200)
- `/` → Accueil (5 sections : hero, catégories, stats, about, CTA)
- `/course` → Programme, règlement, accès
- `/inscription` → Formulaire pilote 3 étapes (mock payment pour l'instant)
- `/benevoles` → Formulaire bénévole **connecté à Supabase**
- `/galerie`, `/resultats`, `/association` → placeholders
- `/login`, `/register` → auth Supabase
- `/compte` → placeholder espace participant

### Base de données Supabase
- Projet : crzkcsmlrbaimgtoipac.supabase.co
- Tables créées : `editions`, `profiles`, `registrations`, `volunteer_posts`, `volunteer_registrations`
- RLS activé sur toutes les tables
- Trigger `on_auth_user_created` → crée le profil automatiquement à l'inscription
- Fonction `public.is_admin()` (security definer) → évite la récursion RLS
- Edition 2025 insérée : "42ème Grand-Prix de Versoix", 21 sept 2025, is_active = true
- 8 postes bénévoles insérés via script Node.js

### Problèmes résolus
- `proxy.ts` + `middleware.ts` en conflit → suppression de proxy.ts
- `asChild` (Radix) inexistant dans Base UI → remplacé par `render` prop ou supprimé
- Import dynamique `await import()` → perd le type générique Supabase → import statique
- `GenericTable` de postgrest-js exige `Relationships: []` dans chaque table du type Database
- `middleware.ts` initialise Supabase avec placeholder `"your-supabase-url"` → vérification `startsWith("http")`
- Politiques RLS admin récursives sur `profiles` → fonction `is_admin()` security definer

### GitHub
- Repo : https://github.com/Volengare-Git/CASV.git
- Branch : master
- 3 commits poussés

### Ce qui reste à faire (plan)
- [x] Formulaire inscription pilote → connecté à Supabase (payment_status = 'paid' automatique)
- [x] Auth : login, register, mot de passe oublié, reset password
- [x] Sécurité : honeypot bénévoles, confirmation email Supabase, SMTP Resend configuré
- [ ] **Vérification domaine casv.ch dans Resend** ← À NE PAS OUBLIER avant la prod
  - Resend.com → Domains → Add Domain → ajouter les DNS chez le registrar
  - Sans ça : emails envoyés depuis un domaine non vérifié → spam ou rejet
- [ ] Espace /compte → voir ses inscriptions, statut paiement
- [x] Interface admin → tableau inscriptions + bénévoles, export CSV
- [ ] Emails de confirmation post-inscription (Resend configuré, template à créer)
- [ ] Stripe + Twint (phase ultérieure)
- [ ] SEO, sitemap, traduction EN complète
- [ ] Galerie photos (upload + affichage)
- [ ] Migration hébergement (NAS ou Infomaniak)

---

## 2026-05-21 — Session 2 : Gestion des inscriptions & Admin

### Fonctionnalités ajoutées

#### Page d'accueil
- Boutons hero ("S'inscrire maintenant" / "Devenir bénévole") : même taille, `<Link>` plain avec `px-8 py-3 text-base`
- Badge dynamique ouverture/fermeture inscriptions basé sur la DB

#### Gestion ouverture inscriptions (Step 1)
- Colonne `is_registration_open boolean | null` ajoutée à `editions`
  - `null` = mode auto (basé sur les dates + quota)
  - `true` = forcé ouvert
  - `false` = forcé fermé
- Composant `<RegistrationToggle>` dans le dashboard admin
  - Bouton Ouvrir/Fermer + bouton "Mode automatique" (visible uniquement si override actif)
  - Indicateur visuel animé (vert = ouvert, gris = fermé, rouge = quota atteint)
- Server action `setRegistrationOpen(editionId, value)` dans `admin/actions.ts`
- Helper `computeIsOpen()` dupliqué dans 4 fichiers : `page.tsx`, `inscription/page.tsx`, `admin/page.tsx`, `admin/editions/page.tsx`

#### Dashboard admin
- Date corrigée : "2 mai 2027" (1er dimanche de mai 2027)
- `max_pilots` corrigé à 80 en DB
- Barre de progression quota (bleu → amber à 80% → rouge à 100%)
- Liens rapides : survol `hover:border-blue-300 hover:text-blue-800`

#### Espace participant /compte
- Bouton "Annuler mon inscription" sur les inscriptions `pending` ou `paid`
- Dialogue de confirmation mentionnant le remboursement
- Server action `cancelOwnRegistration()` dans `compte/actions.ts`

#### Gestion des éditions (Step 2)
- Nouvelle page `/admin/editions`
  - Édition active : stats, formulaire d'édition inline, barre progression
  - Autres éditions : tableau avec bouton "Activer"
- `createEdition()` : insère la nouvelle édition ET copie les `volunteer_posts` de l'édition active
- `activateEdition()` : passe toutes les éditions à `is_active=false`, puis la cible à `true`
- `updateEdition()` : mise à jour partielle
- Utilitaire `firstSundayOfMay(year)` dans `utils.ts` (hors "use server" — voir point d'attention)
- Pré-remplissage automatique : année+1, 1er dimanche de mai, fermeture 21 jours avant
- Les inscriptions (pilotes et bénévoles) sont édition-spécifiques : changer d'édition active ne montre que les nouvelles inscriptions. Les anciennes sont visibles en réactivant l'ancienne édition.

#### Filtrage par édition active
- `admin/inscriptions/page.tsx` : filtre `.eq("edition_id", edition.id)`
- `admin/benevoles/page.tsx` : filtre `.eq("edition_id", edition.id)`

#### Auth & sécurité
- Route handler `/auth/callback/route.ts` créée (PKCE flow Supabase)
  - Gère : échange `code` → session, type `recovery` → `/reset-password`, erreurs → `/login?error=...`
- `login/page.tsx` rendu async, accept `searchParams` pour afficher erreur callback
- `login-form.tsx` : `router.refresh()` avant `router.push("/compte")` après login (fix nav cache)
- Rate limit email Supabase augmenté : 2 → 10 /heure via Management API

### Problèmes résolus
- **"Server Actions must be async functions"** : `firstSundayOfMay` était synchrone et exportée d'un fichier `"use server"`. Fix : déplacée dans `utils.ts` sans directive.
- **TS2872 "expression is always truthy"** dans editions page : IIFE complexe → extrait en composant `ActiveEditionStats`
- **TS2741 "Property 'children' is missing"** : `<Th></Th>` vide → `<Th>&nbsp;</Th>`
- **"Missing html/body tags"** à `/auth/callback` : la route n'existait pas → créée comme Route Handler
- **Nav affichait "Connexion" après login** : cache Next.js → `router.refresh()` avant push
- **Forgot password "Une erreur est survenue"** : rate limit Supabase = 2 → augmenté à 10

---

## 2026-05-21 — Session 3 : Bénévoles v2 + Multi-rôles + Export

### Nouvelles tables DB
- `volunteer_tasks (id, edition_id, label, display_order)` — tâches du formulaire bénévole
  - Séparée de `volunteer_posts` (qui garde les créneaux d'assignation admin)
  - RLS : lecture publique, écriture via service role (admin)
  - 10 tâches initiales insérées pour l'édition active
- Colonne `assigned_post_ids text[]` ajoutée à `volunteer_registrations` (assignation multi-postes)

### Nouvelles colonnes `volunteer_registrations`
- `guest_phone TEXT` — téléphone bénévole
- `age_group TEXT` — "moins_18" | "18_et_plus"
- `wants_membership BOOLEAN` — souhait d'adhésion
- `task_interests JSONB` — clés = UUID des tâches, valeurs = "oui" | "si_necessaire" | "non"
- `assigned_post_ids TEXT[]` — tableau d'IDs de `volunteer_posts` assignés par l'admin

### Formulaire public /benevoles (réécriture complète)
- Plus de dépendance aux `volunteer_posts` (plus de liste de créneaux)
- Tâches chargées depuis `volunteer_tasks` en DB (dynamique, plus hardcodé)
- Sections : Coordonnées → Tranche d'âge → Grille disponibilités → Adhésion → Commentaires
- Grille disponibilités : tableau (tâche × oui/si nécessaire/non) avec radio natifs `accent-blue-800`
- Validation : toutes les tâches doivent être répondues + champs requis
- Stockage : `task_interests` avec UUIDs comme clés (⚠️ incompatible avec les anciens slugs hardcodés)

### Interface admin /admin/benevoles
- Colonne "Postes assignés" : dropdown multi-checkbox (ouvre au clic, cocher plusieurs postes, bouton Enregistrer)
- Statut auto : "Poste(s) assigné(s)" dès qu'au moins 1 poste sélectionné
- Résumé : total, avec poste, en attente, souhaitent adhérer
- **Export CSV** : bouton, téléchargement direct, BOM UTF-8, toutes colonnes + 1 colonne par tâche
- **Export Excel (XLSX)** : SheetJS, colonnes formatées (largeurs auto), ligne header en gras
- **Export PDF** : `window.print()` (CSS print-friendly)
- Action server `assignVolunteerPosts(id, postIds[])` dans `admin/benevoles/actions.ts`

### Page admin /admin/benevoles/taches (nouvelle)
- Liste des tâches avec numéro d'ordre
- Modifier en inline (clic → input → Entrée ou ✓/✗)
- Supprimer avec confirmation
- Ajouter en bas (Entrée ou bouton)
- **Glisser-déposer** pour réordonner (HTML5 drag & drop natif)
- `router.refresh()` + `useEffect` sur `initialTasks` pour sync après ajout
- Actions server : `createTask`, `updateTask`, `deleteTask`, `reorderTasks`

### Navigation admin
- Onglet "Tâches bénévoles" → `/admin/benevoles/taches`
- `exact: true` sur les onglets Tableau de bord et Bénévoles pour éviter sur-activation
- Détection active : `tab.exact ? pathname.endsWith(href) : pathname.includes(href)`

### Dépendances ajoutées
- `xlsx` (SheetJS) — export Excel côté client

### Problèmes résolus
- **Encodage UTF-8 PowerShell** : `Invoke-RestMethod` corrompt les accents → utilisé script Node.js `.mjs` avec `fetch()` natif
- **`useTransition` inutilisé** dans `BenevolesTable` parent → supprimé (`PostMultiSelect` gère ses propres transitions)
- **Sync état client** après Server Action : `revalidatePath` ne suffit pas → `router.refresh()` + `useEffect([initialTasks])` dans `TachesManager`

### Ce qui reste à faire
- [ ] **Vérification domaine casv.ch dans Resend** ← bloquant pour les emails
- [ ] Emails de confirmation post-inscription pilote
- [ ] Emails de confirmation post-inscription bénévole
- [ ] Résultats de course : upload PDF (admin) + page publique
- [ ] Pages statiques : `/course`, `/association`, `/contact` (contenu réel)
- [ ] SEO : meta, OG tags, sitemap.xml, robots.txt
- [ ] Traduction EN complète
- [ ] Galerie photos avec navigation par année
- [ ] Stripe + Twint (l'asso doit créer son compte Stripe d'abord)
- [ ] Migration hébergement casv.ch → décision NAS / Infomaniak / Vercel
