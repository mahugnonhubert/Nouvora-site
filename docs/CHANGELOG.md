# Changelog — Nouvora Labs

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.0.0] — 2024-11-15

### 🎉 Version initiale

#### Ajouté
- **Landing page complète** (`index.html`) avec 9 sections :
  - Hero section avec badge, titre animé, dual CTA et social proof
  - Section valeur & mission avec 3 piliers
  - Grille des 8 catégories avec cartes interactives
  - Section avantages avec 5 bénéfices clés
  - Section guides exclusifs (4 guides)
  - Section communauté avec features
  - Section témoignages (3 avis)
  - FAQ accordéon (7 questions)
  - CTA final avec bannière gradient
  - Footer premium dark

- **Tableau de bord utilisateur** (`pages/app.html`) :
  - Sidebar de navigation complète
  - Carte de bienvenue personnalisée
  - 4 statistiques avec tendances
  - Barres de progression par domaine
  - Défi du mois communautaire
  - Liste des ressources récentes avec badges
  - Recommandations personnalisées

- **Panel d'administration** (`pages/admin.html`) :
  - Sidebar dark premium
  - 4 KPIs avec tendances
  - Graphique barres (inscriptions 7 jours)
  - Répartition catégories populaires
  - Tableau suggestions en attente (approuver/rejeter)
  - Tableau membres récents avec statuts

- **Bibliothèque complète** (`pages/bibliotheque.html`) :
  - Sidebar filtres (catégorie, niveau, type, date)
  - Barre de recherche + tri
  - Grille de 6 cartes ressources avec actions
  - Système de niveaux (débutant/intermédiaire/avancé)
  - Bouton charger plus

- **Page Guides** (`pages/guides.html`) :
  - Hero avec guide mis en avant en gradient
  - Filtres par thématique
  - Grille 4 guides avec métadonnées complètes
  - CTA d'inscription intégré

- **Page Communauté** (`pages/communaute.html`) :
  - Hero gradient avec 4 statistiques
  - 6 canaux thématiques avec détails
  - Grille 4 membres actifs
  - CTA rejoindre intégré

- **Template Catégorie** (`pages/categorie.html`) :
  - Dynamique via paramètre URL `?cat=`
  - 8 catégories supportées
  - Fil d'Ariane dynamique
  - Sous-catégories filtrables
  - Grille 6 ressources de démonstration
  - Section catégories similaires

- **Page Connexion** (`pages/login.html`) :
  - Layout deux colonnes
  - Panel gauche avec valeurs et features
  - Connexion Google (UI)
  - Formulaire email/mot de passe
  - Lien mot de passe oublié

- **Page Inscription** (`pages/register.html`) :
  - Layout deux colonnes avec témoignage
  - Inscription Google (UI)
  - Formulaire complet
  - Sélection profil (4 options)

- **Système de design complet** :
  - `assets/css/main.css` — Variables CSS, reset, typographie, grilles
  - `assets/css/components.css` — Tous les composants UI
  - `assets/css/animations.css` — Keyframes et scroll reveals
  - `assets/js/main.js` — Logique principale
  - `assets/js/navigation.js` — Scroll spy
  - `assets/js/animations.js` — Stagger et parallax
  - `assets/js/faq.js` — Accordéon accessible
  - `assets/icons/favicon.svg` — Favicon SVG

- **Documentation** :
  - `README.md` — Documentation complète
  - `CHANGELOG.md` — Ce fichier
  - `docs/GUIDE-PERSONNALISATION.md` — Guide de personnalisation

#### Fonctionnalités techniques
- Navigation sticky avec backdrop-filter blur
- Menu mobile hamburger avec animation
- Scroll reveal via IntersectionObserver
- Compteurs animés (data-count)
- FAQ accordéon ARIA-compliant
- Smooth scroll sur ancres
- Filtres interactifs (catégories, sous-catégories, profils)
- Template dynamique catégorie (JS)
- Support `prefers-reduced-motion`
- Focus visible accessible
- Responsive mobile-first

---

## À venir — [1.1.0]

### Planifié
- Intégration backend (Node.js / Supabase)
- Système d'authentification réel
- Base de données ressources
- Système de favoris persistant
- Recherche full-text
- Filtres combinés
- Page profil utilisateur
- Notifications in-app
- Mode sombre
- PWA (Progressive Web App)

---

*Pour signaler un bug ou proposer une amélioration : contact@nouvora-labs.com*
