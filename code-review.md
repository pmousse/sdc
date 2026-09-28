# 🔍 Revue de Code — Atelier S.D.C.

**Date** : 2026-09-28
**Projet** : Atelier S.D.C. — Couture sur Mesure et Réparation
**Fichiers analysés** : `index.html`, `styles.css`, `js/projects.js`, `js/translations.js`, `js/gsap-starter.js`, `translations.json`, `projects.json`

---

## ✅ POINTS FORTS

### Accessibilité exemplaire
- Structure HTML sémantique avec les bons rôles ARIA (`role="navigation"`, `aria-label`, `aria-expanded`)
- Lien "Skip to main content" pour la navigation au clavier
- États `:focus-visible` définis globalement avec une couleur accent claire
- Attributs `alt` descriptifs sur toutes les images
- Utilisation de `aria-hidden="true"` sur les éléments décoratifs (SVG du logo)

### Architecture modulaire
- Séparation claire entre HTML, CSS et JavaScript
- Pattern Module pour `I18n`, `Portfolio`, et `TastemakerMotion` (IIFE) évitant la pollution du scope global
- Système de traduction bien structuré avec `data-i18n` attributes

### Performance
- Preload des polices Google Fonts avec chargement asynchrone (`media="print" onload`)
- Images avec `loading="lazy"` pour le contenu hors viewport
- `fetchpriority="high"` sur l'image hero
- Dimensions explicites (`width`/`height`) pour éviter les CLS

### Design System cohérent
- Variables CSS bien organisées avec échelle d'espacement systématique
- Palette de couleurs harmonieuse et documentée dans les commentaires
- Responsive design avec breakpoints cohérents (640px, 768px, 1024px)

### Animations soignées
- Respect de `prefers-reduced-motion` dans GSAP et CSS
- Timeline GSAP pour l'hero avec parallax au scroll
- Système de reveal au scroll via `[data-reveal]`

---

## 🔴 CRITIQUE

### 1. Référence CSS manquante : `--color-background` non défini

**Fichier** : `styles.css` — `.hero`
**Problème** : La propriété `background` utilise `var(--color-background)` qui n'est **jamais défini** dans `:root`. Cela devrait probablement être `var(--color-bg)`.

**Impact** : Le dégradé de fond du hero utilise une valeur `undefined`, ce qui peut causer un rendu incohérent.

**Fichier** : `styles.css`
```css
/* Ligne dans .hero */
linear-gradient(160deg, var(--color-background) 0%, var(--color-secondary) 40%, var(--color-surface) 100%);
```

---

### 2. Double initialisation de `I18n` et `Portfolio`

**Fichier** : `index.html`, `translations.js`, `projects.js`
**Problème** : `I18n.init()` et `Portfolio.init()` sont appelés **plusieurs fois** :
1. Auto-init dans `translations.js` (DOMContentLoaded)
2. Auto-init dans `projects.js` (DOMContentLoaded)
3. Encore une fois dans le script inline de `index.html`

**Impact** : Appels redondants, risques de bugs et performances inutiles.

---

### 3. Gestion d'erreur fragile dans `setupEvents()` de `projects.js`

**Fichier** : `js/projects.js` — `setupEvents()`
**Problème** : Si les éléments `.carousel-btn--prev` ou `.carousel-btn--next` n'existent pas dans le DOM, `querySelector` retourne `null` et `.addEventListener` **lance une erreur fatale** qui bloque tout le script.

```javascript
document.querySelector('.carousel-btn--prev').addEventListener('click', prev);
document.querySelector('.carousel-btn--next').addEventListener('click', next);
```

---

## 🟡 AVERTISSEMENTS

### 4. Images Unsplash identiques en boucle

**Fichier** : `projects.json`
**Problème** : Tous les projets du portfolio utilisent les **mêmes 2 images Unsplash** en rotation. Pour un site de portfolio, cela réduit considérablement l'impact visuel.

**Recommandation** : Remplacer par des images distinctes ou des placeholders plus variés.

---

### 5. Traductions françaises perfectibles

**Fichier** : `translations.json`, `projects.json`

Plusieurs termes en français pourraient être améliorés :

- `problem.text` : "Nous pensons que les vêtements méritent mieux." — Le ton est un peu direct. Une formulation comme "Nous estimons que chaque vêtement mérite mieux que cela" serait plus élégante.
- `craft.band2.desc` : "Prêt-à-porter ne signifie pas ajusté." — Ce n'est pas la traduction la plus fidèle de "Off-the-rack rarely means off-the-line".
- `process.step2.desc` : "Cet essayage en mousseline est là où le vrai travail de forme commence." — La phrase est un peu lourde.
- `projects.json` (fr) : "ramené de la damage des mites" — Il manque un mot, probablement une erreur de frappe.

---

### 6. `TastemakerMotion.init()` appelé sans protection DOM

**Fichier** : `index.html` — Script inline
**Problème** : `TastemakerMotion.init()` est appelé directement dans le script inline sans être protégé par `DOMContentLoaded`. Si le DOM n'est pas encore prêt, les sélecteurs `[data-reveal]` pourraient ne rien trouver.

---

### 7. Carousel : position `absolute` sans gestion du resize

**Fichier** : `styles.css` — `.carousel-track`
**Problème** : Le carousel utilise `position: absolute` pour les slides avec `min-height: 550px` sur le track. En cas de redimensionnement ou de chargement différé des images, la hauteur peut ne pas s'adapter correctement.

**Recommandation** : Ajouter un écouteur `resize` pour recalculer la hauteur ou utiliser `aspect-ratio` CSS.

---

### 8. Pas de `loading="lazy"` sur l'image hero (intentionnel) mais fallback non protégé

**Fichier** : `index.html` — Hero section
**Problème** : L'image hero utilise `loading="eager"` (correct pour le LCP), mais le fallback Pexels dans `onerror` n'a **pas** d'attributs `width`/`height` définis, ce qui pourrait causer un CLS si l'image Unsplash échoue.

---

### 9. `projects.js` : `updateTranslations()` refetch les données à chaque changement de langue

**Fichier** : `js/projects.js` — `updateTranslations()`
**Problème** : Chaque changement de langue déclenche un nouveau `fetch('projects.json')`. Pour un petit fichier JSON, ce n'est pas critique, mais les données pourraient être mises en cache après le premier chargement.

---

### 10. Navigation mobile : menu hamburger incomplet

**Fichier** : `styles.css`, `index.html`
**Problème** : Le bouton `.nav-toggle` apparaît sur mobile mais le menu mobile (`.nav-links`) est simplement masqué avec `display: none`. Il n'y a **pas de mécanisme JavaScript** pour ouvrir/fermer le menu, ni d'état `aria-expanded` mis à jour dynamiquement.

---

## 🔵 INFORMATIONS

### Suggestions d'amélioration

1. **SEO** : Ajouter un `<link rel="canonical">` pour éviter le contenu dupliqué.
2. **Open Graph** : Ajouter les meta tags `og:title`, `og:description`, `og:image` pour le partage social.
3. **Schema.org** : Structurer les données avec `LocalBusiness` schema pour le référencement local.
4. **Analytics** : Prévoir un point d'insertion pour Google Analytics ou autre outil d'analytics.
5. **Form de contact** : La section CTA ne pointe que vers un `mailto:`. Un formulaire de contact dédié améliorerait la conversion.
6. **PWA** : Envisager un `manifest.json` et un service worker pour le mode offline.

### Bonnes pratiques observées

- Utilisation de `clamp()` pour la typographie responsive
- Variables CSS pour tous les espacements et couleurs (maintenabilité)
- Commentaires de documentation dans les fichiers JS
- Pattern IIFE pour encapsuler les modules
- Gestion du fallback localStorage pour les traductions

---

## 📊 Résumé

| Sévérité | Count |
|----------|-------|
| 🔴 Critical | 3 |
| 🟡 Warning | 7 |
| 🔵 Info | 6+ |
| ✅ Good | Nombreux |

---

## 🎯 Priorités recommandées

1. **Immédiat** : Corriger `--color-background` → `--color-bg` dans `.hero`
2. **Immédiat** : Ajouter des checks `null` dans `setupEvents()` de `projects.js`
3. **Bref terme** : Réfacteur les initialisations multiples (`I18n`, `Portfolio`)
4. **Bref terme** : Compléter la navigation mobile (JS + `aria-expanded`)
5. **Long terme** : Améliorer les traductions françaises
6. **Long terme** : Remplacer les images du portfolio
