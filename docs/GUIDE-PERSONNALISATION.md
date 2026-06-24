# Guide de Personnalisation — Nouvora Labs

Ce guide vous permet de modifier et adapter Nouvora Labs à votre image en quelques étapes simples.

---

## 1. Changer l'identité de la plateforme

### Nom de la plateforme
Recherchez et remplacez `Nouvora Labs` dans tous les fichiers HTML :

```
Ancien : Nouvora Labs
Nouveau : VotreNom
```

Également dans `<title>` de chaque page :
```html
<!-- Avant -->
<title>Nouvora Labs — Bibliothèque Numérique Premium</title>

<!-- Après -->
<title>VotreNom — Votre Tagline</title>
```

### Tagline / Description
Dans `index.html`, section Hero :
```html
<!-- Modifier le sous-titre -->
<p class="hero-subtitle">
  Votre nouvelle description ici...
</p>
```

---

## 2. Modifier les couleurs

Toutes les couleurs sont centralisées dans `assets/css/main.css` :

```css
:root {
  /* Changez ces valeurs pour adapter la palette */
  --blue-primary: #2563EB;     /* Couleur d'accent principale */
  --blue-secondary: #1E3A8A;   /* Couleur secondaire (dégradés) */
  --blue-light: #DBEAFE;       /* Fond léger bleu */
  --blue-hover: #1D4ED8;       /* État hover boutons */

  /* Fonds */
  --bg-primary: #F8FAFC;       /* Fond global */
  --bg-white: #FFFFFF;         /* Cartes et surfaces blanches */
  --bg-subtle: #F1F5F9;        /* Fond gris très léger */
  --bg-dark: #0F172A;          /* Footer dark */

  /* Textes */
  --text-primary: #0F172A;     /* Titres et texte fort */
  --text-secondary: #475569;   /* Paragraphes */
  --text-tertiary: #94A3B8;    /* Texte discret */
}
```

### Exemples de palettes alternatives

**Vert (nature / environnement)**
```css
--blue-primary: #16A34A;
--blue-secondary: #14532D;
--blue-light: #DCFCE7;
--blue-hover: #15803D;
```

**Violet (créativité / design)**
```css
--blue-primary: #7C3AED;
--blue-secondary: #4C1D95;
--blue-light: #EDE9FE;
--blue-hover: #6D28D9;
```

**Orange (énergie / startup)**
```css
--blue-primary: #EA580C;
--blue-secondary: #7C2D12;
--blue-light: #FFF7ED;
--blue-hover: #C2410C;
```

---

## 3. Modifier les catégories

### Dans `index.html` — Section catégories
Chaque carte de catégorie suit ce modèle :

```html
<a href="pages/categorie.html?cat=VOTRE_CAT" class="category-card reveal" style="--category-color:#COULEUR;">
  <div class="category-icon" style="background:#FOND_ICONE;">
    <!-- Votre icône SVG ici -->
    <svg>...</svg>
  </div>
  <div>
    <p class="category-name">Nom de la catégorie</p>
    <p class="category-desc">Description courte de la catégorie.</p>
  </div>
  <p class="category-count">XX ressources</p>
  <div class="category-arrow">...</div>
</a>
```

### Dans `pages/categorie.html` — Objet JavaScript
Ajoutez votre catégorie dans l'objet `categories` :

```javascript
const categories = {
  votre_cat: {
    title: 'Nom de votre catégorie',
    desc: 'Description longue pour la page catégorie.',
    count: 50,
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
    subs: ['Toutes les ressources', 'Sous-cat 1', 'Sous-cat 2']
  },
  // ... autres catégories
};
```

---

## 4. Modifier les textes de la landing page

### Titre Hero
```html
<h1 class="hero-title">
  Développez vos compétences<br />
  <span class="highlight">numériques</span> avec les<br />
  meilleures ressources
</h1>
```
Le mot en `<span class="highlight">` apparaît en bleu.

### Mission (Section Valeur)
```html
<p>
  Nouvora Labs aide les francophones à développer des compétences
  numériques concrètes grâce à une bibliothèque organisée...
</p>
```

### Témoignages
Chaque témoignage suit ce modèle :
```html
<div class="testimonial-card">
  <div class="stars"><!-- 5 étoiles SVG --></div>
  <p class="testimonial-text">"Votre témoignage ici..."</p>
  <div class="testimonial-author">
    <div class="author-avatar">XX</div><!-- Initiales -->
    <div>
      <p class="author-name">Prénom N.</p>
      <p class="author-role">Titre · Ville</p>
    </div>
  </div>
</div>
```

### FAQ
Chaque question suit ce modèle :
```html
<div class="faq-item">
  <div class="faq-question">
    Votre question ici ?
    <div class="faq-icon"><!-- icône + --></div>
  </div>
  <div class="faq-answer">
    Votre réponse détaillée ici.
  </div>
</div>
```

---

## 5. Modifier les statistiques animées

Les compteurs sont animés automatiquement. Pour les modifier :

```html
<!-- data-count = valeur cible, data-suffix = suffixe -->
<span data-count="500" data-suffix="+">500+</span>
<span data-count="2400" data-suffix="+">2 400+</span>
<span data-count="8">8</span>
```

---

## 6. Modifier le Footer

### Liens de navigation
Dans chaque fichier HTML, section `<footer>` :

```html
<div class="footer-col">
  <h4>Votre section</h4>
  <ul>
    <li><a href="votre-page.html">Lien 1</a></li>
    <li><a href="autre-page.html">Lien 2</a></li>
  </ul>
</div>
```

### Réseaux sociaux
Remplacez les `href="#"` par vos vraies URLs :
```html
<a href="https://twitter.com/votrecompte" class="footer-social-link">
<a href="https://linkedin.com/in/votrecompte" class="footer-social-link">
```

### Copyright
```html
<p>© 2024 VotreNom. Tous droits réservés.</p>
```

---

## 7. Modifier les animations

### Vitesse des animations
Dans `assets/css/animations.css` :
```css
/* Modifier la durée de transition */
.reveal {
  transition: opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
}
/* 0.65s = durée. Augmentez pour ralentir, diminuez pour accélérer */
```

### Désactiver une animation
Retirez la classe `reveal` (ou `reveal-left`, `reveal-right`, `reveal-scale`) de l'élément.

### Modifier les delays
```css
/* Dans animations.css */
.delay-1 { transition-delay: 0.1s; }  /* Augmentez pour ralentir l'effet stagger */
```

---

## 8. Modifier les cartes de ressources

### Ajouter une ressource dans la bibliothèque

Dans `pages/bibliotheque.html`, copiez ce bloc :

```html
<a href="#" class="resource-card reveal">
  <div class="resource-card-header">
    <div class="resource-card-icon" style="background:#EFF6FF;">
      <!-- Icône SVG -->
    </div>
    <button class="resource-card-action" title="Sauvegarder">
      <!-- SVG bookmark -->
    </button>
  </div>
  <p class="resource-card-cat" style="color:#2563EB;">Catégorie</p>
  <p class="resource-card-title">Titre de la ressource</p>
  <p class="resource-card-desc">Description courte et claire de ce que l'utilisateur va apprendre.</p>
  <div class="resource-card-footer">
    <div class="resource-card-meta">
      <span class="resource-card-meta-item">⏱ 30 min</span>
      <span class="resource-card-meta-item">👁 1.5k vues</span>
    </div>
    <!-- Choisir le niveau : level-debutant | level-intermediaire | level-avance -->
    <span class="resource-level level-debutant">Débutant</span>
  </div>
</a>
```

---

## 9. Modifier les guides

Dans `pages/guides.html`, chaque guide suit ce modèle :

```html
<a href="LIEN_DU_GUIDE" class="guide-card-full">
  <div class="guide-card-top">
    <p class="guide-tag">Catégorie · Niveau</p>
    <h3>Titre du guide</h3>
  </div>
  <div class="guide-card-body">
    <p>Description du guide...</p>
    <div>
      <span class="badge badge-subtle">Tag 1</span>
      <span class="badge badge-subtle">Tag 2</span>
    </div>
  </div>
  <div class="guide-card-footer">
    <div class="guide-card-meta">
      <span>⏱ XX min</span>
      <span>👁 X XXX lectures</span>
    </div>
    <span class="guide-card-read">Lire le guide →</span>
  </div>
</a>
```

---

## 10. Conseils de déploiement

### Hébergement statique (recommandé)
- **Netlify** : Glissez-déposez le dossier sur netlify.app
- **Vercel** : `vercel deploy` depuis le terminal
- **GitHub Pages** : Poussez sur une branche `gh-pages`
- **Cloudflare Pages** : Connectez votre repo GitHub

### Optimisations avant mise en ligne
1. **Minifier** les CSS et JS (utiliser un bundler ou des outils en ligne)
2. **Compresser** les images (si ajoutées)
3. **Ajouter** un fichier `robots.txt`
4. **Configurer** un certificat SSL (HTTPS)
5. **Tester** sur mobile et différents navigateurs

### SEO de base
Modifiez dans chaque `<head>` :
```html
<meta name="description" content="Votre description unique par page" />
<meta property="og:title" content="Titre pour les réseaux sociaux" />
<meta property="og:description" content="Description pour les réseaux" />
```

---

*Pour toute question : contact@nouvora-labs.com*
