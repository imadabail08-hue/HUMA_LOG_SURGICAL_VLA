# GUIDE DE PRÉSENTATION ORALE — 7 MINUTES CHRONO
## Jumeau Numérique HUMA-LOG SURGICAL-VLA
*Système de Vision Robotique IA & Reconnaissance d'Instruments Chirurgicaux*

---

## ⏱️ Grille de Minutage Global (7 minutes)

| Segment | Durée | Thème Principal | Action à l'écran |
|---|---|---|---|
| **1. Accroche & Problématique** | **1 min 00** (0:00 - 1:00) | Enjeu chirurgical & traçabilité | Page *Digital Twin* en Vue Boîte |
| **2. Architecture & Rôle du Robot** | **1 min 15** (1:00 - 2:15) | AGV de vision RGB-D (Non invasif) | Vue *Vue Salle* puis *Caméra RGB-D* |
| **3. Démonstration du Jumeau 3D** | **2 min 00** (2:15 - 4:15) | Fidélité PBR, 8 classes, zéro-jitter | Clic sur *01 Pince*, *04 Sonde*, *00 Ciseaux* |
| **4. IA & Localisation Spatiale** | **1 min 30** (4:15 - 5:45) | YOLO26s-seg, BBox 3D, Repère Plateau | Panneau Vision & Inspecteur [X,Y,Z] |
| **5. Perspectives & Conclusion** | **1 min 15** (5:45 - 7:00) | Pont ROS 2, VLA, Impact clinique | Vue Zénithale / Onglet *About* |

---

## 🎤 Déroulé Minute par Minute : Discours & Actions

### MINUTE 1 : Accroche & Problématique (0:00 ➔ 1:00)
- **Le message clé** : L'identification et le décompte des instruments chirurgicaux en bloc opératoire sont critiques pour la sécurité patient et la traçabilité.
- **Ce qu'il faut dire** :
  > « Mesdames, messieurs les membres du jury, dans un bloc opératoire, l'oubli ou la mauvaise identification d'un instrument chirurgical représente un risque majeur pour le patient et ralentit les procédures.  
  > Le projet **HUMA-LOG SURGICAL-VLA** répond à ce défi en concevant un **Jumeau Numérique médical temps réel** dédié à la supervision, la classification automatique et la localisation spatiale 3D des instruments stériles disposés sur table d'opération.  
  > Notre application web connecte en temps réel le flux de vision artificielle de pointe au modèle tridimensionnel physique de la boîte à instruments. »
- **Action à l'écran** : Démarrer sur la page **Digital Twin** en preset `Boîte 3D`. La valise médicale ouverte remplit 80% de l'écran avec ses 8 instruments nets et stables.

---

### MINUTE 2 : Architecture Système & Rôle du Robot (1:00 ➔ 2:15)
- **Le message clé** : Le robot est une plateforme de vision IA non invasive ; il ne pratique pas la chirurgie et ne touche ni le patient ni les instruments.
- **Ce qu'il faut dire** :
  > « Un point fondamental de notre architecture : **le robot n'est pas un opérateur chirurgical**. Il n'effectue aucun geste invasif, ne touche ni le patient ni les instruments.  
  > C'est une **plateforme mobile AGV de perception et de contrôle qualité**.  
  > Équipé d'une tête de vision stéréoscopique RGB-D montée sur mât vertical, le robot se positionne en retrait de la table opératoire. Sa caméra surplombe la boîte d'instruments avec un cône de vision calibré pour scanner le plateau à 30 Hz avec une latence inférieure à 15 ms. »
- **Action à l'écran** :
  - Cliquer sur le bouton caméra **Vue Salle Complète** pour montrer la séparation spatiale (patient au fond, robot AGV avec cône cyan, valise sur sa table dédiée).
  - Cliquer sur **Caméra RGB-D** pour montrer la vue subjective du capteur du robot.

---

### MINUTE 3 & 4 : Démonstration du Jumeau 3D & Réalisme PBR (2:15 ➔ 4:15)
- **Le message clé** : Modélisation calquée sur les photographies réelles du kit chirurgical, rendu PBR haute fidélité (acier vs mousse anthracite) et zéro-jitter.
- **Ce qu'il faut dire** :
  > « Revenons à la boîte d'instruments. La modélisation 3D sous Three.js et React Three Fiber s'appuie directement sur les clichés haute définition du kit chirurgical réel :  
  > 1. **La valise** : Châssis aluminium brossé, cuve composite bleu nuit, renforts d'angle chromés et garnissage intérieur fidèle en mousse EVA anthracite profond (`#1c2026`) avec sa rigole centrale de préhension.  
  > 2. **Les 8 instruments** : Modélisés selon leurs géométries anatomiques exactes en acier inoxydable satiné 316L. Regardez par exemple la pince coupante (#01) avec son articulation à rivet bombé, ses mors biseautés et son ressort double lame, ou encore la sonde cannelée (#04) avec sa palette papillon doublement échancrée.  
  > 3. **Zéro-Jitter** : Grâce à une séparation stricte entre les coordonnées géométriques fixes des meshes et les flux télémétriques de simulation, la scène 3D offre une stabilité visuelle absolue sans aucun tremblement lors de l'inspection. »
- **Action à l'écran** :
  - Revenir sur **Boîte 3D**.
  - Cliquer sur le bouton inférieur `01 Pince` : la caméra zoome fluidement sur la pince coupante. Montrer la brillance de l'acier et la Bounding Box 3D verte.
  - Cliquer sur `04 Sonde` : observer la palette papillon caractéristique.
  - Basculer le toggle **Mousse EVA / Sangles élastiques** pour montrer la prise en compte des deux configurations photographiques.

---

### MINUTE 5 : IA YOLO26s-seg & Localisation dans le Repère Plateau (4:15 ➔ 5:45)
- **Le message clé** : Détection, segmentation d'instance et coordonnées cartésiennes submillimétriques dans le repère local de la boîte.
- **Ce qu'il faut dire** :
  > « Au niveau de l'intelligence artificielle, nous intégrons un modèle **YOLO26s-seg** réalisant simultanément trois tâches :  
  > 1. **La détection d'objets et classification** sur les 8 classes officielles avec un taux de confiance moyen supérieur à 95%.  
  > 2. **La segmentation d'instance** : matérialisée dans la 3D par un volume semi-transparent et une boîte englobante filaire calculée par `EdgesGeometry` aux couleurs normalisées de la classe.  
  > 3. **La localisation métrique directe** : À droite, l'inspecteur d'instruments et le panneau de vision affichent les coordonnées exprimées dans le **Repère Local du Plateau [X, Y, Z]** :  
  >    - $X$ latéral : de $-140$ à $+146\text{ mm}$  
  >    - $Y$ longitudinal : de $-5$ à $+8\text{ mm}$  
  >    - $Z$ hauteur au-dessus de la mousse : calibrée entre $26.5$ et $30.5\text{ mm}$ selon l'épaisseur de l'outil.  
  > Ces données garantissent une précision submillimétrique indispensable à la traçabilité robotique. »
- **Action à l'écran** :
  - Pointer la souris sur l'**Inspecteur d'instrument** à droite (montrer les cases rouge, verte, bleue $[X, Y, Z]$ et le score de confiance 96%).
  - Montrer le panneau **Vision Robot RGB-D** avec les centroïdes UV image et les coordonnées 3D synchronisées.

---

### MINUTE 6 & 7 : Intégration ROS 2, VLA & Conclusion (5:45 ➔ 7:00)
- **Le message clé** : Pont avec la robotique médicale (ROS 2 TF2) et les fondations Vision-Language-Action.
- **Ce qu'il faut dire** :
  > « Pourquoi ce jumeau numérique est-il prêt pour le monde réel ?  
  > - **Interopérabilité ROS 2** : Les transformations géométriques appliquent l'arbre de frames TF2 standard (`camera_optical_frame` vers `box_origin` et `base_link`).  
  > - **Préparation VLA (Vision-Language-Action)** : Les données spatiales et sémantiques sont structurées pour alimenter des modèles multimodaux de guidage chirurgical vocal.  
  > - **Architecture Web moderne** : Conçu en TypeScript strict, React 19 et Vite, le jumeau tourne à 60 FPS constants sur un simple navigateur sans nécessiter de plugin lourd.  
  >  
  > En conclusion, **HUMA-LOG SURGICAL-VLA** transforme une simple boîte d'instruments en un environnement d'inspection chirurgicale intelligent, fiable et prêt pour l'intégration clinique.  
  > Je vous remercie pour votre attention et je suis à votre disposition pour vos questions. »
- **Action à l'écran** :
  - Cliquer sur le menu de gauche `Localization` ou `About Project` pour montrer la conformité architecturale, puis revenir sur la vue 3D `Boîte 3D`.

---

## 🎯 Les 4 Questions Pièges du Jury & Réponses Types

1. **"Pourquoi le robot n'attrape-t-il pas directement les instruments ?"**
   - *Réponse* : « C'est un choix délibéré de conformité réglementaire (MDR/FDA) et de sécurité patient. La manipulation d'outils tranchants en champ stérile impose des risques majeurs. Le robot assure d'abord la fonction clé de **contrôle qualité, inventaire automatisé et détection d'anomalies**, sans interférer avec le chirurgien. »

2. **"D'où viennent les coordonnées 3D affichées ?"**
   - *Réponse* : « Le système est dual : il supporte un flux réel (WebSocket/REST connecté à l'inférence YOLO) et un flux de simulation étalonné sur les dimensions physiques exactes de la valise (380x280 mm). Le bandeau *DEMO MODE — SIMULATED DATA* garantit l'intégrité scientifique de notre présentation. »

3. **"Comment garantissez-vous la lisibilité des 8 instruments côte à côte ?"**
   - *Réponse* : « Trois optimisations : (1) étiquettes 3D étagées en quinconce qui disparaissent si la caméra s'éloigne, (2) sélection interactive focalisée qui illumine uniquement l'outil cliqué avec sa Bounding Box, (3) fort contraste PBR entre l'acier brillant et la mousse EVA mate anthracite. »

4. **"Quelles sont les performances techniques ?"**
   - *Réponse* : « Fréquence d'analyse de 30 Hz (33 ms), latence de détection de 14.5 ms, et rendu WebGL Three.js stable à 60 FPS sans chute de framerate grâce au zero-jitter et à la mémoisation React. »

