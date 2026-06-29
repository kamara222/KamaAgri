# Récapitulatif des modifications — AquaFerme Pro (app de gestion poulets/poissons)

Ce document décrit **toutes les évolutions visuelles et fonctionnelles** réalisées, afin de pouvoir
les **répliquer à l'identique** sur une autre instance de la même application (React Native / Expo,
React Query, `react-native-vector-icons/MaterialIcons`, `react-native-animatable`).

Il sert de **prompt / cahier des charges** : implémente les comportements et le visuel décrits
ci-dessous. Palette : vert principal `#2E7D32` (succès), bleu accent `#0288D1`, fond `#FAFAFA`,
police Roboto. Tout est en **français**.

---

## 1. Nouvelle page d'Accueil (portail)

Créer un écran **Accueil** qui devient la **page d'atterrissage après connexion** (le login redirige
vers Accueil, et non plus vers le tableau de bord). L'ancien tableau de bord est conservé mais n'est
plus la page d'accueil.

Contenu de l'Accueil :
- **En-tête vert** : avatar avec initiales de l'utilisateur (→ ouvre le Profil) à gauche, icône de
  déconnexion à droite (avec confirmation).
- **Deux grandes cartes « portail »** côte à côte, en dégradé :
  - **Vente** (dégradé vert, icône `shopping-cart`).
  - **Gestion** (dégradé bleu, icône `tune`).
  - Au clic sur l'une, ouvrir une **modal de sélection** « Poulets / Poissons » :
    - Titre « **Que souhaitez-vous vendre ?** » pour Vente, « **Que souhaitez-vous gérer ?** » pour Gestion.
    - Vente → Poulets = écran *Suivi des ventes (poulets)*, Poissons = *Suivi des ventes (poissons)*.
    - Gestion → Poulets = écran *Gestion des poulets*, Poissons = *Gestion des poissons*.
- **Bouton « Tableau de bord »** (style contour vert, icône `dashboard`) → ouvre le tableau de bord.
- **Historique des ventes** (poulets + poissons combinés, trié du plus récent au plus ancien) avec :
  - **Deux rangées de filtres défilables horizontalement** (chips) :
    1. Type : **Tous / Poulets / Poissons**.
    2. Période : **Tout / Aujourd'hui / 7 jours / Ce mois**.
  - **Le bloc en-tête + portails + filtres reste fixe**, et **seule la liste défile en dessous**
    (le scroll commence sous les filtres).
  - **Pagination dynamique** : afficher 10 ventes, puis 10 de plus à chaque fois qu'on approche du bas
    (le compteur repart à 10 quand on change un filtre).
  - **Au clic sur une carte de vente → modal de détail** complet (voir §5).

## 2. En-tête du Tableau de bord

Sur l'écran tableau de bord : **retirer** le bouton profil (avatar) et le bouton déconnexion, et
**ajouter une flèche de retour** (← `arrow-back`) qui ramène à l'Accueil. (Profil et déconnexion
restent accessibles depuis l'en-tête de l'Accueil.)

## 3. KPI & compteurs cohérents

- Le tableau de bord affichait des totaux issus d'un endpoint agrégé peu fiable. **Recalculer côté
  client** :
  - **Total Poulets** = somme des `nombre` des lots (liste `/poulet`).
  - **Total Poissons** = somme des `nombre` des bassins (liste `/poisson`).
  - **Ventes du mois** = somme des `prix_total` des ventes du mois calendaire courant.
- Sur les écrans **Gestion des poulets / poissons**, afficher un **en-tête « Total : X poulets/poissons »**
  (somme des `nombre` de la liste affichée), pour que le chiffre corresponde exactement à celui du
  tableau de bord.

## 4. Filtres & sélecteurs (visibilité)

- Filtre du graphique « Ventes » du tableau de bord : l'élargir pour que « Tous/Poulets/Poissons »
  s'affiche en entier (titre qui peut rétrécir, sélecteur plus large).
- Composant **sélecteur déroulant (CustomSelect)** : la modal de choix doit s'afficher entièrement
  (hauteur jusqu'à 70 % de l'écran + marge basse de sécurité) — elle était coupée.
- **Visibilité du texte** : sur les formulaires « Ajouter un événement » (planificateur) et
  « Ajouter un utilisateur » (paramètres), ajouter `placeholderTextColor` (gris) sur tous les champs
  et une couleur de texte sur les `Picker` (les champs apparaissaient vides/illisibles).

## 5. Listes de ventes — détail + pagination (4 écrans)

Sur l'Accueil et les écrans *Suivi des ventes (poulets)*, *(poissons)* et *(général)* :
- **Clic sur une carte → modal de détail** affichant tous les champs : Date, Type, Bâtiment/Bassin,
  Race/Espèce, Quantité (nombre ou kg), Prix unitaire / Prix par kg, Prix total, Client, Mode de paiement.
- **Pagination 10 par 10** (rendu progressif au scroll). Pour l'écran « général » (liste imbriquée
  dans une vue défilante), paginer via le scroll de la vue.

Créer un **composant modal de détail générique** réutilisable : titre + liste de lignes
`{ libellé, valeur }` + bouton Fermer (overlay sombre, carte blanche centrée).

## 6. Gestion poulets / poissons — détail, édition, FAB animé

- **Clic sur une carte → modal de détail** (lot : Bâtiment, Race, Date, Nombre, Poids moyen ;
  bassin : Nom, Espèce, Mise en eau, Nombre).
- **Icône de modification** (`edit`, bleu) placée **à côté de l'icône de suppression** sur chaque
  carte. Au clic, **rouvrir le formulaire d'enregistrement pré-rempli** avec les valeurs existantes
  (titre/bouton passent à « Modifier »).
- **Enregistrement des modifications via `PATCH`** :
  - Lot : `PATCH /poulet/{id}` avec `{ batiment, race, date, nombre, poids_moyen }`.
  - Bassin : `PATCH /poisson/{id}` avec `{ nom_bassin, espece, date, nombre }`.
  - (La création reste en `POST` ; la suppression en `DELETE`.)
- **Bouton flottant (FAB) « étendu »** : affiche « **+ Nouveau** » au repos ; quand on **scrolle vers
  le bas**, le texte « Nouveau » disparaît (il ne reste que « + ») ; quand on **scrolle vers le haut**,
  « Nouveau » réapparaît (FAB en forme de pilule qui se rétracte/étend).

## 7. Mise en cache (performance données)

- Configurer le client React Query **une seule fois** (au niveau module, pas dans le rendu) avec
  `staleTime ≈ 5 min` et `gcTime ≈ 30 min` : revisiter une page déjà chargée **n'entraîne pas de
  rechargement** (affichage instantané depuis le cache). Les mutations (création/suppression/édition)
  invalident les listes concernées → rafraîchissement automatique.

## 8. Optimisations de fluidité (à reproduire)

- **Supprimer les animations en boucle infinie** (`pulse` `iterationCount="infinite"`) du composant
  sélecteur et de tous les boutons de soumission des modals (elles tournaient en permanence et
  ralentissaient l'app). Les remplacer par une animation jouée **une seule fois**.
- **Retirer les `console.log` exécutés au rendu**, en particulier ceux avec `JSON.stringify(...)` de
  listes entières, et les logs par élément de liste.
- **Mémoïser (`useMemo`) les filtres** des écrans de liste (lots, bassins, ventes).

## 9. Robustesse (éviter les plantages)

Ajouter des **gardes** partout où une valeur peut être absente :
- Initiales : `(prenom ?? '?').charAt(0)` (et nom) au lieu d'accéder directement.
- Montants : `(valeur ?? 0).toFixed(2)` / `.toLocaleString('fr-FR')` sur les prix/quantités optionnels.
- Recherche : `(objet?.nom ?? '').toLowerCase()` pour race/espèce pouvant être une chaîne **ou** un objet.
- Dates : `date ? new Date(date).toLocaleDateString('fr-FR') : '—'`.
- Téléphone : retourner « Non disponible » si vide.
- **Navigation** : ne naviguer que vers des écrans **réellement enregistrés** (rediriger les anciens
  noms inexistants vers des écrans valides, ex. l'écran d'erreur réseau → Accueil, les notifications →
  écran Notifications).

---

## Fichiers de référence (structure)

- **Créés** : `src/screens/AccueilScreen.tsx`, `src/components/AnimalSelectionModal.tsx` (modal de
  choix Poulets/Poissons), `src/components/DetailModal.tsx` (modal de détail générique).
- **Helpers** : `src/utils/index.tsx` → `saleDetailRows(vente)` construit les lignes de détail d'une
  vente (poulet vs poisson).
- **Couche API** (`src/api/index.ts`) : ajout `updateBassin` (PATCH), correction `updateLot` en PATCH.
- **Hooks** (`src/services/index.ts`) : `useUpdateLot`, `useUpdateBassin` (avec invalidation du cache).
- **Navigation** : enregistrer l'écran `Accueil` ; le login y redirige.
- **Écrans modifiés** : tableau de bord (en-tête + KPI), gestion poulets/poissons (détail/édition/FAB/total),
  suivi des ventes (détail/pagination), planificateur & paramètres (visibilité des champs).

## Vérifications attendues

- Connexion → arrivée sur l'Accueil ; portails Vente/Gestion fonctionnels ; historique filtrable +
  paginé ; scroll sous le filtre.
- Détail au clic (ventes, lots, bassins) ; édition pré-remplie qui enregistre en PATCH ; FAB « + Nouveau »
  qui se rétracte au scroll.
- Totaux du tableau de bord = totaux des écrans Gestion.
- Application fluide (plus d'animations permanentes) et stable (aucun plantage sur données partielles).
