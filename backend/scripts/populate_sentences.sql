-- Populate sentences table with French sentences for conjugation practice
-- Curated sentences from all sources
-- Generated: 2025-10-31

CREATE TABLE IF NOT EXISTS sentences (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    verbs JSONB NOT NULL,
    tenses TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clear existing data
TRUNCATE TABLE sentences RESTART IDENTITY CASCADE;

-- Insert sentences
INSERT INTO sentences (text, verbs, tenses) VALUES
-- From sentences.json (1-20)
('Le guépard (courir) à une vitesse impressionnante dans la savane africaine.', '[{"infinitive": "courir", "position": 0, "subject": "Le guépard"}]', '{present,imparfait,passe_compose}'),
('Marie et Sophie (aller) au marché tous les samedis matin.', '[{"infinitive": "aller", "position": 0, "subject": "Marie et Sophie"}]', '{present,imparfait,futur_simple}'),
('Cet animal (posséder) un pelage très reconnaissable, jaune tacheté de noir.', '[{"infinitive": "posséder", "position": 0, "subject": "Cet animal"}]', '{present,imparfait}'),
('Quand j''(avoir) 1 an, mon père (proposer) que nous partions en voyage en famille.', '[{"infinitive": "avoir", "position": 0, "subject": "j''"}, {"infinitive": "proposer", "position": 1, "subject": "mon père"}]', '{imparfait,passe_compose}'),
('La Tour Eiffel (dominer) l''horizon parisien depuis plus d''un siècle.', '[{"infinitive": "dominer", "position": 0, "subject": "La Tour Eiffel"}]', '{present,imparfait}'),
('Les enfants du quartier (jouer) au football pendant que leurs parents (discuter) sur un banc.', '[{"infinitive": "jouer", "position": 0, "subject": "Les enfants du quartier"}, {"infinitive": "discuter", "position": 1, "subject": "leurs parents"}]', '{imparfait,passe_compose}'),
('Mon grand-père maternel (raconter) souvent des histoires fascinantes de son enfance à la campagne.', '[{"infinitive": "raconter", "position": 0, "subject": "Mon grand-père maternel"}]', '{imparfait,present}'),
('La bibliothèque municipale (fermer) ses portes à 19 heures tous les soirs de la semaine.', '[{"infinitive": "fermer", "position": 0, "subject": "La bibliothèque municipale"}]', '{present,futur_simple,imparfait}'),
('Ces magnifiques roses rouges (pousser) dans le jardin de ma voisine chaque printemps.', '[{"infinitive": "pousser", "position": 0, "subject": "Ces magnifiques roses rouges"}]', '{present,imparfait,futur_simple}'),
('Le boulanger du village (préparer) le pain frais avant l''aube depuis vingt ans.', '[{"infinitive": "préparer", "position": 0, "subject": "Le boulanger du village"}]', '{present,imparfait,futur_simple}'),
('Les montagnes enneigées (se dresser) majestueusement à l''horizon.', '[{"infinitive": "se dresser", "position": 0, "subject": "Les montagnes enneigées"}]', '{present,imparfait}'),
('Le professeur de mathématiques (expliquer) la géométrie quand l''alarme incendie (sonner).', '[{"infinitive": "expliquer", "position": 0, "subject": "Le professeur de mathématiques"}, {"infinitive": "sonner", "position": 1, "subject": "l''alarme incendie"}]', '{imparfait,passe_compose}'),
('Mon ami Thomas (vivre) à Paris depuis son enfance.', '[{"infinitive": "vivre", "position": 0, "subject": "Mon ami Thomas"}]', '{present,imparfait}'),
('La rivière (traverser) la ville d''est en ouest.', '[{"infinitive": "traverser", "position": 0, "subject": "La rivière"}]', '{present,imparfait}'),
('Les scientifiques (découvrir) une nouvelle espèce d''insecte dans la forêt amazonienne.', '[{"infinitive": "découvrir", "position": 0, "subject": "Les scientifiques"}]', '{passe_compose,present,futur_simple}'),
('Ce vieux château médiéval (appartenir) à une famille noble depuis le 15ème siècle.', '[{"infinitive": "appartenir", "position": 0, "subject": "Ce vieux château médiéval"}]', '{present,imparfait}'),
('Les oiseaux migrateurs (partir) vers le sud dès que l''automne (arriver).', '[{"infinitive": "partir", "position": 0, "subject": "Les oiseaux migrateurs"}, {"infinitive": "arriver", "position": 1, "subject": "l''automne"}]', '{present,imparfait,futur_simple}'),
('Ma tante Isabelle (travailler) comme infirmière à l''hôpital central.', '[{"infinitive": "travailler", "position": 0, "subject": "Ma tante Isabelle"}]', '{present,imparfait,passe_compose}'),
('Le musée du Louvre (accueillir) des millions de visiteurs chaque année.', '[{"infinitive": "accueillir", "position": 0, "subject": "Le musée du Louvre"}]', '{present,imparfait,futur_simple}'),
('Ces petits poissons colorés (nager) gracieusement dans l''aquarium.', '[{"infinitive": "nager", "position": 0, "subject": "Ces petits poissons colorés"}]', '{present,imparfait}'),

-- Animals & Nature (21-35)
('Le lion (rugir) puissamment pour marquer son territoire.', '[{"infinitive": "rugir", "position": 0, "subject": "Le lion"}]', '{present,imparfait,passe_compose}'),
('Les dauphins (sauter) hors de l''eau en formant des arcs gracieux.', '[{"infinitive": "sauter", "position": 0, "subject": "Les dauphins"}]', '{present,imparfait,passe_compose}'),
('L''aigle royal (planer) majestueusement au-dessus des montagnes.', '[{"infinitive": "planer", "position": 0, "subject": "L''aigle royal"}]', '{present,imparfait}'),
('Les abeilles (butiner) les fleurs du jardin pendant toute la matinée.', '[{"infinitive": "butiner", "position": 0, "subject": "Les abeilles"}]', '{present,imparfait,passe_compose}'),
('Le chat domestique (dormir) plus de quinze heures par jour.', '[{"infinitive": "dormir", "position": 0, "subject": "Le chat domestique"}]', '{present,imparfait}'),
('Les oiseaux (chanter) doucement pendant que le soleil (se lever) à l''horizon.', '[{"infinitive": "chanter", "position": 0, "subject": "Les oiseaux"}, {"infinitive": "se lever", "position": 1, "subject": "le soleil"}]', '{imparfait,passe_compose}'),
('La rivière (couler) tranquillement entre les montagnes enneigées.', '[{"infinitive": "couler", "position": 0, "subject": "La rivière"}]', '{present,imparfait,futur_simple}'),
('Les arbres (perdre) leurs feuilles chaque automne depuis des siècles.', '[{"infinitive": "perdre", "position": 0, "subject": "Les arbres"}]', '{present,imparfait,futur_simple}'),
('Le volcan (entrer) en éruption sans prévenir la population locale.', '[{"infinitive": "entrer", "position": 0, "subject": "Le volcan"}]', '{passe_compose,plus_que_parfait,futur_simple}'),
('Les étoiles (briller) dans le ciel nocturne comme des diamants.', '[{"infinitive": "briller", "position": 0, "subject": "Les étoiles"}]', '{present,imparfait}'),
('Le vent (souffler) fort pendant toute la nuit.', '[{"infinitive": "souffler", "position": 0, "subject": "Le vent"}]', '{passe_compose,imparfait,futur_simple}'),
('Les nuages (couvrir) le ciel avant l''orage.', '[{"infinitive": "couvrir", "position": 0, "subject": "Les nuages"}]', '{present,imparfait,passe_compose}'),
('La neige (tomber) doucement sur la ville endormie.', '[{"infinitive": "tomber", "position": 0, "subject": "La neige"}]', '{imparfait,passe_compose,present}'),
('Le soleil (se coucher) derrière les collines à l''ouest.', '[{"infinitive": "se coucher", "position": 0, "subject": "Le soleil"}]', '{present,imparfait,futur_simple}'),
('Les fleurs (s''ouvrir) au printemps pour accueillir les insectes.', '[{"infinitive": "s''ouvrir", "position": 0, "subject": "Les fleurs"}]', '{present,imparfait,futur_simple}'),

-- People & Daily Life (36-55)
('Les élèves (écouter) attentivement les explications du professeur.', '[{"infinitive": "écouter", "position": 0, "subject": "Les élèves"}]', '{present,imparfait,passe_compose}'),
('Ma cousine Charlotte (étudier) la médecine à l''université de Lyon.', '[{"infinitive": "étudier", "position": 0, "subject": "Ma cousine Charlotte"}]', '{present,imparfait,futur_simple}'),
('Mon oncle Pierre (construire) sa maison de ses propres mains.', '[{"infinitive": "construire", "position": 0, "subject": "Mon oncle Pierre"}]', '{passe_compose,present,futur_simple}'),
('Les voisins (discuter) dans la rue tous les matins.', '[{"infinitive": "discuter", "position": 0, "subject": "Les voisins"}]', '{present,imparfait}'),
('Ma sœur (apprendre) à jouer du piano depuis trois ans.', '[{"infinitive": "apprendre", "position": 0, "subject": "Ma sœur"}]', '{present,imparfait}'),
('Le directeur (annoncer) les résultats des examens demain.', '[{"infinitive": "annoncer", "position": 0, "subject": "Le directeur"}]', '{futur_simple,present,passe_compose}'),
('Les touristes (visiter) les monuments historiques de la ville.', '[{"infinitive": "visiter", "position": 0, "subject": "Les touristes"}]', '{present,passe_compose,futur_simple}'),
('Mon père (réparer) la voiture dans le garage.', '[{"infinitive": "réparer", "position": 0, "subject": "Mon père"}]', '{present,imparfait,passe_compose}'),
('Les médecins (soigner) les malades avec dévouement.', '[{"infinitive": "soigner", "position": 0, "subject": "Les médecins"}]', '{present,imparfait,futur_simple}'),
('Ma mère (préparer) un délicieux gâteau au chocolat.', '[{"infinitive": "préparer", "position": 0, "subject": "Ma mère"}]', '{present,passe_compose,futur_simple}'),
('Les artistes (peindre) des tableaux magnifiques dans leurs ateliers.', '[{"infinitive": "peindre", "position": 0, "subject": "Les artistes"}]', '{present,imparfait,passe_compose}'),
('Mon frère (jouer) au tennis tous les weekends.', '[{"infinitive": "jouer", "position": 0, "subject": "Mon frère"}]', '{present,imparfait,futur_simple}'),
('Les chercheurs (publier) leurs découvertes dans des revues scientifiques.', '[{"infinitive": "publier", "position": 0, "subject": "Les chercheurs"}]', '{present,passe_compose,futur_simple}'),
('Ma grand-mère (cultiver) des légumes dans son potager.', '[{"infinitive": "cultiver", "position": 0, "subject": "Ma grand-mère"}]', '{present,imparfait}'),
('Les enfants (apprendre) à lire et à écrire à l''école primaire.', '[{"infinitive": "apprendre", "position": 0, "subject": "Les enfants"}]', '{present,imparfait,futur_simple}'),
('Le gardien (ouvrir) les portes du parc à 7 heures du matin.', '[{"infinitive": "ouvrir", "position": 0, "subject": "Le gardien"}]', '{present,imparfait,futur_simple}'),
('Les infirmières (prendre) soin des patients avec gentillesse.', '[{"infinitive": "prendre", "position": 0, "subject": "Les infirmières"}]', '{present,imparfait,passe_compose}'),
('Mon cousin (conduire) un camion pour une entreprise de transport.', '[{"infinitive": "conduire", "position": 0, "subject": "Mon cousin"}]', '{present,imparfait}'),
('Les pompiers (éteindre) l''incendie rapidement.', '[{"infinitive": "éteindre", "position": 0, "subject": "Les pompiers"}]', '{passe_compose,present,futur_simple}'),
('Ma voisine (nourrir) les chats du quartier tous les jours.', '[{"infinitive": "nourrir", "position": 0, "subject": "Ma voisine"}]', '{present,imparfait}'),

-- Work & Professional Life (56-70)
('L''architecte (dessiner) les plans du nouveau musée avec beaucoup de soin.', '[{"infinitive": "dessiner", "position": 0, "subject": "L''architecte"}]', '{present,passe_compose,futur_simple}'),
('Les ouvriers (construire) le pont depuis plusieurs mois maintenant.', '[{"infinitive": "construire", "position": 0, "subject": "Les ouvriers"}]', '{present,passe_compose,futur_simple}'),
('Le médecin (examiner) chaque patient avec attention et professionnalisme.', '[{"infinitive": "examiner", "position": 0, "subject": "Le médecin"}]', '{present,imparfait,passe_compose}'),
('La journaliste (écrire) un article sur la situation économique actuelle.', '[{"infinitive": "écrire", "position": 0, "subject": "La journaliste"}]', '{present,passe_compose,futur_simple}'),
('Le chef cuisinier (préparer) un menu spécial pour l''anniversaire du restaurant.', '[{"infinitive": "préparer", "position": 0, "subject": "Le chef cuisinier"}]', '{present,passe_compose,futur_simple}'),
('Les ingénieurs (développer) une nouvelle application révolutionnaire.', '[{"infinitive": "développer", "position": 0, "subject": "Les ingénieurs"}]', '{present,passe_compose,futur_simple}'),
('Le comptable (vérifier) tous les documents financiers.', '[{"infinitive": "vérifier", "position": 0, "subject": "Le comptable"}]', '{present,passe_compose,imparfait}'),
('La secrétaire (organiser) les réunions importantes.', '[{"infinitive": "organiser", "position": 0, "subject": "La secrétaire"}]', '{present,imparfait,futur_simple}'),
('Les avocats (défendre) leurs clients devant le tribunal.', '[{"infinitive": "défendre", "position": 0, "subject": "Les avocats"}]', '{present,passe_compose,futur_simple}'),
('Le plombier (réparer) la fuite d''eau dans la cuisine.', '[{"infinitive": "réparer", "position": 0, "subject": "Le plombier"}]', '{present,passe_compose,futur_simple}'),
('Les agriculteurs (récolter) le blé pendant l''été.', '[{"infinitive": "récolter", "position": 0, "subject": "Les agriculteurs"}]', '{present,imparfait,futur_simple}'),
('Le photographe (capturer) des moments magiques avec son appareil.', '[{"infinitive": "capturer", "position": 0, "subject": "Le photographe"}]', '{present,passe_compose,imparfait}'),
('La couturière (coudre) des robes élégantes pour ses clientes.', '[{"infinitive": "coudre", "position": 0, "subject": "La couturière"}]', '{present,imparfait,futur_simple}'),
('Les mécaniciens (réparer) les voitures dans le garage.', '[{"infinitive": "réparer", "position": 0, "subject": "Les mécaniciens"}]', '{present,passe_compose,imparfait}'),
('Le libraire (conseiller) les lecteurs dans le choix de leurs livres.', '[{"infinitive": "conseiller", "position": 0, "subject": "Le libraire"}]', '{present,imparfait}'),

-- Education & Learning (71-85)
('La professeure (expliquer) la leçon de mathématiques avec patience.', '[{"infinitive": "expliquer", "position": 0, "subject": "La professeure"}]', '{present,imparfait,passe_compose}'),
('Les étudiants (réviser) leurs cours pour l''examen de fin d''année.', '[{"infinitive": "réviser", "position": 0, "subject": "Les étudiants"}]', '{present,imparfait,futur_simple}'),
('L''université (offrir) de nombreuses bourses aux étudiants méritants.', '[{"infinitive": "offrir", "position": 0, "subject": "L''université"}]', '{present,passe_compose,futur_simple}'),
('Les chercheurs (publier) une étude importante dans une revue scientifique.', '[{"infinitive": "publier", "position": 0, "subject": "Les chercheurs"}]', '{passe_compose,futur_simple,present}'),
('Le bibliothécaire (classer) les livres par catégories.', '[{"infinitive": "classer", "position": 0, "subject": "Le bibliothécaire"}]', '{present,imparfait,passe_compose}'),
('Les doctorants (faire) des recherches approfondies sur leur sujet de thèse.', '[{"infinitive": "faire", "position": 0, "subject": "Les doctorants"}]', '{present,imparfait,futur_simple}'),
('La directrice (diriger) l''école avec compétence et bienveillance.', '[{"infinitive": "diriger", "position": 0, "subject": "La directrice"}]', '{present,imparfait}'),
('Les lycéens (préparer) le baccalauréat avec sérieux.', '[{"infinitive": "préparer", "position": 0, "subject": "Les lycéens"}]', '{present,imparfait,futur_simple}'),
('Le conférencier (présenter) ses idées de manière claire et concise.', '[{"infinitive": "présenter", "position": 0, "subject": "Le conférencier"}]', '{present,passe_compose,futur_simple}'),
('Les élèves (participer) activement aux débats en classe.', '[{"infinitive": "participer", "position": 0, "subject": "Les élèves"}]', '{present,imparfait,passe_compose}'),
('Le tuteur (aider) les élèves en difficulté après les cours.', '[{"infinitive": "aider", "position": 0, "subject": "Le tuteur"}]', '{present,imparfait,futur_simple}'),
('Les scientifiques (observer) les phénomènes naturels avec précision.', '[{"infinitive": "observer", "position": 0, "subject": "Les scientifiques"}]', '{present,imparfait,passe_compose}'),
('La chercheuse (analyser) les données recueillies pendant l''expérience.', '[{"infinitive": "analyser", "position": 0, "subject": "La chercheuse"}]', '{present,passe_compose,futur_simple}'),
('Les professeurs (corriger) les copies des examens.', '[{"infinitive": "corriger", "position": 0, "subject": "Les professeurs"}]', '{present,imparfait,passe_compose}'),
('L''enseignant (encourager) ses élèves à poser des questions.', '[{"infinitive": "encourager", "position": 0, "subject": "L''enseignant"}]', '{present,imparfait}'),

-- Sports & Activities (86-100)
('L''équipe nationale (gagner) le championnat pour la troisième fois consécutive.', '[{"infinitive": "gagner", "position": 0, "subject": "L''équipe nationale"}]', '{passe_compose,plus_que_parfait,futur_simple}'),
('Le marathonien (courir) quarante-deux kilomètres sous une chaleur accablante.', '[{"infinitive": "courir", "position": 0, "subject": "Le marathonien"}]', '{passe_compose,imparfait,futur_simple}'),
('Les joueurs (s''entraîner) intensivement avant la finale du tournoi.', '[{"infinitive": "s''entraîner", "position": 0, "subject": "Les joueurs"}]', '{present,imparfait,futur_simple}'),
('La gymnaste (réussir) une performance exceptionnelle aux Jeux Olympiques.', '[{"infinitive": "réussir", "position": 0, "subject": "La gymnaste"}]', '{passe_compose,plus_que_parfait,futur_simple}'),
('Le nageur (battre) le record du monde du cent mètres nage libre.', '[{"infinitive": "battre", "position": 0, "subject": "Le nageur"}]', '{passe_compose,plus_que_parfait,futur_simple}'),
('Les cyclistes (grimper) la montagne avec détermination.', '[{"infinitive": "grimper", "position": 0, "subject": "Les cyclistes"}]', '{present,imparfait,passe_compose}'),
('Le footballeur (marquer) trois buts pendant le match.', '[{"infinitive": "marquer", "position": 0, "subject": "Le footballeur"}]', '{passe_compose,present,futur_simple}'),
('Les athlètes (participer) aux championnats du monde.', '[{"infinitive": "participer", "position": 0, "subject": "Les athlètes"}]', '{present,passe_compose,futur_simple}'),
('La joueuse de tennis (servir) avec une grande précision.', '[{"infinitive": "servir", "position": 0, "subject": "La joueuse de tennis"}]', '{present,imparfait,passe_compose}'),
('Les supporters (encourager) leur équipe favorite dans le stade.', '[{"infinitive": "encourager", "position": 0, "subject": "Les supporters"}]', '{present,imparfait,passe_compose}'),
('Le basketteur (sauter) haut pour attraper le ballon.', '[{"infinitive": "sauter", "position": 0, "subject": "Le basketteur"}]', '{present,passe_compose,imparfait}'),
('Les alpinistes (escalader) les sommets les plus difficiles.', '[{"infinitive": "escalader", "position": 0, "subject": "Les alpinistes"}]', '{present,passe_compose,futur_simple}'),
('Le judoka (s''entraîner) plusieurs heures par jour.', '[{"infinitive": "s''entraîner", "position": 0, "subject": "Le judoka"}]', '{present,imparfait}'),
('Les skieurs (descendre) les pistes à toute vitesse.', '[{"infinitive": "descendre", "position": 0, "subject": "Les skieurs"}]', '{present,passe_compose,imparfait}'),
('L''entraîneur (motiver) son équipe avant chaque match.', '[{"infinitive": "motiver", "position": 0, "subject": "L''entraîneur"}]', '{present,imparfait,passe_compose}');

-- Total sentences: 100 curated sentences
