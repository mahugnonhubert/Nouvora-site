# Nouvora Labs — Bibliothèque Numérique Premium

> Portail numérique premium donnant accès à 6 bibliothèques de ressources pour entrepreneurs, créateurs et freelances francophones.

---

## 🗂️ Structure du projet

```
nouvora-output/
│
├── index.html                      ← Landing page (présentation + tunnel d'inscription/paiement)
├── app.html                        ← Espace membre (accès aux bibliothèques)
├── admin.html                      ← Panneau d'administration
├── render.yaml                     ← Configuration de déploiement Render
├── .gitignore
├── README.md
│
├── assets/
│   ├── css/
│   │   ├── main.css                ← Variables, reset, typographie, layout
│   │   ├── components.css          ← Composants UI (nav, boutons, cartes...)
│   │   └── animations.css          ← Keyframes, scroll reveals, micro-interactions
│   │
│   ├── js/
│   │   ├── main.js                 ← Logique principale (navbar, FAQ, counters...)
│   │   ├── navigation.js           ← Scroll spy et états actifs
│   │   ├── animations.js           ← Stagger cards, parallax
│   │   ├── faq.js                  ← Accordéon FAQ accessible
│   │   ├── supabase-client.js      ← Client Supabase prêt (désactivé par défaut)
│   │   └── geniuspay-client.js     ← Client Genius Pay prêt (mode simulation par défaut)
│   │
│   ├── images/
│   │   └── logo.svg
│   │
│   └── icons/
│       └── favicon.svg
│
├── supabase/
│   └── schema.sql                  ← Schéma SQL complet (users, payments, testimonials...)
│
└── docs/
    ├── CHANGELOG.md
    └── GUIDE-PERSONNALISATION.md
```

---

## 🚀 Démarrage rapide (mode actuel — sans backend)

Le site fonctionne **immédiatement, sans aucune installation**, avec toutes les données stockées en `localStorage` du navigateur :

1. Décompressez l'archive
2. Ouvrez `index.html` dans votre navigateur
3. C'est tout

Avec un serveur local (recommandé pour un rendu fidèle) :

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

Puis ouvrez `http://localhost:8000`

⚠️ **En l'état**, les données (utilisateurs, paiements, témoignages, prix) sont **propres à chaque navigateur** et disparaissent si le cache est vidé. C'est voulu pour la phase de test — voir plus bas pour brancher une vraie base de données.

---

## 🧱 Stack technique

- **HTML / CSS / JavaScript** purs — aucun framework, aucun build
- **Supabase** — base de données (prête à connecter, voir ci-dessous)
- **Genius Pay** — paiement (prêt à connecter, voir ci-dessous)
- **GitHub** — versionning
- **Render** — déploiement en site statique

---

## 🗄️ Connecter Supabase (base de données réelle)

Le site fonctionne actuellement avec `localStorage`. Pour passer à une vraie base de données partagée :

1. Créer un compte sur [supabase.com](https://supabase.com) et un nouveau projet
2. Dans l'éditeur SQL du projet, exécuter le contenu de `supabase/schema.sql`
   (crée les tables `users`, `payments`, `testimonials`, `resources`, `pricing`, `captures`)
3. Dans **Project Settings → API**, récupérer :
   - l'**URL** du projet
   - la **clé publique anonyme** (`anon key`)
4. Renseigner ces deux valeurs dans `assets/js/supabase-client.js` :
   ```js
   const SUPABASE_URL      = 'https://VOTRE-PROJET.supabase.co';
   const SUPABASE_ANON_KEY = 'VOTRE-CLE-ANON-PUBLIQUE';
   ```
5. Ajouter dans le `<head>` de `index.html`, `app.html` et `admin.html` :
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="assets/js/supabase-client.js"></script>
   ```
6. Remplacer progressivement les appels `localStorage` existants par les fonctions
   équivalentes de `supabase-client.js` (mêmes noms : `getUsers()`, `getPricing()`, etc.,
   mais asynchrones — à appeler avec `await`)

Tant que ces étapes ne sont pas faites, **le site continue de fonctionner normalement en localStorage**, sans aucune erreur.

---

## 💳 Connecter Genius Pay (paiement réel)

Le tunnel de paiement (`index.html`, étape "Passer au paiement") fonctionne actuellement en **mode simulation** : le paiement est automatiquement validé après 1,5 seconde, sans demander d'argent réel.

Pour activer les vrais paiements :

1. Créer un compte marchand chez Genius Pay et récupérer le **Merchant ID**
2. Renseigner l'identifiant dans `assets/js/geniuspay-client.js` :
   ```js
   const GENIUS_PAY_MERCHANT_ID = 'VOTRE_MERCHANT_ID';
   ```
3. Décommenter le chargement du SDK Genius Pay dans le `<head>` de `index.html` :
   ```html
   <script src="https://cdn.geniuspay.io/v1/checkout.js"></script>
   ```

Dès que `GENIUS_PAY_MERCHANT_ID` est renseigné, le site bascule automatiquement du mode
simulation au mode réel — aucune autre modification de code n'est nécessaire.

💡 Le **prix facturé** est entièrement piloté depuis `admin.html` (onglet **Tarification**) :
changer le prix là-bas met à jour automatiquement le prix affiché sur la landing page
**et** le montant transmis à Genius Pay lors du paiement.

---

## 📦 Déployer sur GitHub + Render

### 1. Pousser le projet sur GitHub

```bash
git init
git add .
git commit -m "Initial commit — Nouvora Labs"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/VOTRE-REPO.git
git push -u origin main
```

### 2. Déployer sur Render (site statique)

1. Aller sur [render.com](https://render.com) → **New → Static Site**
2. Connecter votre dépôt GitHub
3. Render détecte automatiquement `render.yaml` — sinon configurer manuellement :
   - **Build Command** : (laisser vide)
   - **Publish Directory** : `.` (racine du projet)
4. Déployer — le site est en ligne en quelques minutes, avec mises à jour
   automatiques à chaque `git push`

---

## 📄 Pages

### `index.html` — Landing Page
- Hero avec prix dynamique (piloté depuis l'admin)
- Présentation des 6 bibliothèques
- Tunnel d'inscription → paiement → accès (modal en 3 étapes)
- Témoignages (affichage automatique des témoignages approuvés)
- FAQ, Footer

### `app.html` — Espace membre
Accès réservé aux comptes Premium ou Admin :
- Les 6 bibliothèques avec accès aux ressources (liens Drive)
- Bouton WhatsApp Support
- Bouton "Laisser un témoignage"

### `admin.html` — Administration
- **Dashboard** : utilisateurs, premium, paiements, revenus (données réelles)
- **Utilisateurs** : liste, recherche, changement de rôle (Visiteur / Premium / Admin)
- **Ressources** : modification du nom/description/lien sans toucher au code
- **Paiements** : historique des transactions
- **Témoignages** : modération (En attente / Publiés / Refusés)
- **Tarification** : prix normal, promotion, badge — synchronisé en temps réel
  avec la landing page et le paiement

---

## 🔐 Rôle Admin

Le rôle `admin` contourne systématiquement toutes les restrictions Premium :
accès à toutes les bibliothèques, toutes les ressources, tous les téléchargements,
plus l'accès au panneau d'administration. Pour activer un compte en Admin,
changer son rôle depuis `admin.html` → onglet Utilisateurs.

---

## 🎨 Personnalisation rapide

### Changer les couleurs
Modifier les variables dans `assets/css/main.css` :
```css
:root {
  --blue-primary: #2563EB;
  --blue-secondary: #1E3A8A;
  --bg-primary: #F8FAFC;
  --text-primary: #0F172A;
}
```

### Changer le prix
Aucune modification de code nécessaire — tout se fait depuis `admin.html` → **Tarification**.

### Modifier une bibliothèque
Depuis `admin.html` → **Ressources**, modifier nom / description / lien Drive
sans toucher au code. Pour ajouter une bannière visuelle 1:1 (1080×1080),
remplacer le contenu des emplacements `.lib-banner-slot` dans `index.html`.

---

## 📬 Support

Bouton WhatsApp intégré sur `app.html` et `index.html` pour le support client.
