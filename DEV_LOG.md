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
- [ ] Interface admin → tableau inscriptions + bénévoles, export CSV
- [ ] Emails de confirmation post-inscription (Resend configuré, template à créer)
- [ ] Stripe + Twint (phase ultérieure)
- [ ] SEO, sitemap, traduction EN complète
- [ ] Galerie photos (upload + affichage)
- [ ] Migration hébergement (NAS ou Infomaniak)
