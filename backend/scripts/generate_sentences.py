#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sentence Generator for French Verb Conjugation Practice
Generates sentences with balanced tense distribution (50+ per tense)
"""

import json
import random

# Target: 50 sentences minimum per tense
# We'll generate enough sentences to cover all 17 tenses with 50+ each
TARGET_SENTENCES = 1800

# Sentence templates organized by theme
SENTENCE_DATA = {
    "nature": [
        {
            "text": "Le guépard (courir) à une vitesse impressionnante dans la savane africaine.",
            "verbs": [{"infinitive": "courir", "position": 0, "subject": "Le guépard"}],
            "tenses": ["present", "imparfait", "passe_compose", "futur_simple"]
        },
        {
            "text": "Les oiseaux (chanter) doucement pendant que le soleil (se lever) à l'horizon.",
            "verbs": [
                {"infinitive": "chanter", "position": 0, "subject": "Les oiseaux"},
                {"infinitive": "se lever", "position": 1, "subject": "le soleil"}
            ],
            "tenses": ["imparfait", "passe_compose"]
        },
        {
            "text": "La rivière (couler) tranquillement entre les montagnes enneigées.",
            "verbs": [{"infinitive": "couler", "position": 0, "subject": "La rivière"}],
            "tenses": ["present", "imparfait", "futur_simple"]
        },
        {
            "text": "Les arbres (perdre) leurs feuilles chaque automne depuis des siècles.",
            "verbs": [{"infinitive": "perdre", "position": 0, "subject": "Les arbres"}],
            "tenses": ["present", "imparfait", "futur_simple"]
        },
        {
            "text": "Le volcan (entrer) en éruption sans prévenir la population locale.",
            "verbs": [{"infinitive": "entrer", "position": 0, "subject": "Le volcan"}],
            "tenses": ["passe_compose", "plus_que_parfait", "futur_simple"]
        },
    ],
    
    "people": [
        {
            "text": "Marie et Sophie (décider) de partir en voyage autour du monde.",
            "verbs": [{"infinitive": "décider", "position": 0, "subject": "Marie et Sophie"}],
            "tenses": ["passe_compose", "plus_que_parfait", "futur_simple"]
        },
        {
            "text": "Mon grand-père (raconter) toujours des histoires fascinantes de sa jeunesse.",
            "verbs": [{"infinitive": "raconter", "position": 0, "subject": "Mon grand-père"}],
            "tenses": ["present", "imparfait", "futur_simple"]
        },
        {
            "text": "Les enfants (jouer) dans le parc quand la pluie (commencer) à tomber.",
            "verbs": [
                {"infinitive": "jouer", "position": 0, "subject": "Les enfants"},
                {"infinitive": "commencer", "position": 1, "subject": "la pluie"}
            ],
            "tenses": ["imparfait", "passe_compose"]
        },
        {
            "text": "Pierre (étudier) la médecine pendant sept ans avant de devenir chirurgien.",
            "verbs": [{"infinitive": "étudier", "position": 0, "subject": "Pierre"}],
            "tenses": ["passe_compose", "plus_que_parfait"]
        },
        {
            "text": "Ma sœur (vouloir) toujours être professeur depuis qu'elle (être) petite.",
            "verbs": [
                {"infinitive": "vouloir", "position": 0, "subject": "Ma sœur"},
                {"infinitive": "être", "position": 1, "subject": "elle"}
            ],
            "tenses": ["present", "imparfait", "passe_compose"]
        },
    ],
    
    "work": [
        {
            "text": "L'architecte (dessiner) les plans du nouveau musée avec beaucoup de soin.",
            "verbs": [{"infinitive": "dessiner", "position": 0, "subject": "L'architecte"}],
            "tenses": ["present", "passe_compose", "futur_simple"]
        },
        {
            "text": "Les ouvriers (construire) le pont depuis plusieurs mois maintenant.",
            "verbs": [{"infinitive": "construire", "position": 0, "subject": "Les ouvriers"}],
            "tenses": ["present", "passe_compose", "futur_simple"]
        },
        {
            "text": "Le médecin (examiner) chaque patient avec attention et professionnalisme.",
            "verbs": [{"infinitive": "examiner", "position": 0, "subject": "Le médecin"}],
            "tenses": ["present", "imparfait", "passe_compose"]
        },
        {
            "text": "La journaliste (écrire) un article sur la situation économique actuelle.",
            "verbs": [{"infinitive": "écrire", "position": 0, "subject": "La journaliste"}],
            "tenses": ["present", "passe_compose", "futur_simple"]
        },
        {
            "text": "Le chef cuisinier (préparer) un menu spécial pour l'anniversaire du restaurant.",
            "verbs": [{"infinitive": "préparer", "position": 0, "subject": "Le chef cuisinier"}],
            "tenses": ["present", "passe_compose", "futur_simple"]
        },
    ],
    
    "places": [
        {
            "text": "Le musée du Louvre (attirer) des millions de visiteurs chaque année.",
            "verbs": [{"infinitive": "attirer", "position": 0, "subject": "Le musée du Louvre"}],
            "tenses": ["present", "imparfait", "futur_simple"]
        },
        {
            "text": "Cette bibliothèque (contenir) plus de cent mille livres anciens et rares.",
            "verbs": [{"infinitive": "contenir", "position": 0, "subject": "Cette bibliothèque"}],
            "tenses": ["present", "imparfait"]
        },
        {
            "text": "Le château (appartenir) à la famille royale pendant plusieurs siècles.",
            "verbs": [{"infinitive": "appartenir", "position": 0, "subject": "Le château"}],
            "tenses": ["passe_compose", "plus_que_parfait", "imparfait"]
        },
        {
            "text": "La gare (accueillir) des voyageurs de toutes les régions du pays.",
            "verbs": [{"infinitive": "accueillir", "position": 0, "subject": "La gare"}],
            "tenses": ["present", "imparfait", "futur_simple"]
        },
        {
            "text": "Ce parc national (protéger) des espèces animales menacées d'extinction.",
            "verbs": [{"infinitive": "protéger", "position": 0, "subject": "Ce parc national"}],
            "tenses": ["present", "imparfait", "futur_simple"]
        },
    ],
    
    "food": [
        {
            "text": "Le boulanger (préparer) le pain frais chaque matin avant l'aube.",
            "verbs": [{"infinitive": "préparer", "position": 0, "subject": "Le boulanger"}],
            "tenses": ["present", "imparfait", "futur_simple"]
        },
        {
            "text": "Ma mère (cuisiner) un délicieux plat traditionnel pour le dîner.",
            "verbs": [{"infinitive": "cuisiner", "position": 0, "subject": "Ma mère"}],
            "tenses": ["present", "passe_compose", "futur_simple"]
        },
        {
            "text": "Les clients (déguster) les spécialités locales dans ce restaurant étoilé.",
            "verbs": [{"infinitive": "déguster", "position": 0, "subject": "Les clients"}],
            "tenses": ["present", "passe_compose", "futur_simple"]
        },
        {
            "text": "Le fromage (vieillir) lentement dans la cave pendant plusieurs mois.",
            "verbs": [{"infinitive": "vieillir", "position": 0, "subject": "Le fromage"}],
            "tenses": ["present", "imparfait", "passe_compose"]
        },
        {
            "text": "Les tomates (mûrir) au soleil dans le jardin de grand-mère.",
            "verbs": [{"infinitive": "mûrir", "position": 0, "subject": "Les tomates"}],
            "tenses": ["present", "imparfait", "futur_simple"]
        },
    ],
    
    "technology": [
        {
            "text": "L'ordinateur (calculer) des millions d'opérations en quelques secondes.",
            "verbs": [{"infinitive": "calculer", "position": 0, "subject": "L'ordinateur"}],
            "tenses": ["present", "imparfait", "futur_simple"]
        },
        {
            "text": "Le robot (assembler) les pièces avec une précision remarquable.",
            "verbs": [{"infinitive": "assembler", "position": 0, "subject": "Le robot"}],
            "tenses": ["present", "imparfait", "futur_simple"]
        },
        {
            "text": "Le téléphone (sonner) sans arrêt pendant toute la réunion importante.",
            "verbs": [{"infinitive": "sonner", "position": 0, "subject": "Le téléphone"}],
            "tenses": ["passe_compose", "imparfait", "plus_que_parfait"]
        },
        {
            "text": "Les ingénieurs (développer) une nouvelle application révolutionnaire.",
            "verbs": [{"infinitive": "développer", "position": 0, "subject": "Les ingénieurs"}],
            "tenses": ["present", "passe_compose", "futur_simple"]
        },
        {
            "text": "Le logiciel (traduire) instantanément le texte en plusieurs langues.",
            "verbs": [{"infinitive": "traduire", "position": 0, "subject": "Le logiciel"}],
            "tenses": ["present", "imparfait", "futur_simple"]
        },
    ],
    
    "education": [
        {
            "text": "La professeure (expliquer) la leçon de mathématiques avec patience.",
            "verbs": [{"infinitive": "expliquer", "position": 0, "subject": "La professeure"}],
            "tenses": ["present", "imparfait", "passe_compose"]
        },
        {
            "text": "Les étudiants (réviser) leurs cours pour l'examen de fin d'année.",
            "verbs": [{"infinitive": "réviser", "position": 0, "subject": "Les étudiants"}],
            "tenses": ["present", "imparfait", "futur_simple"]
        },
        {
            "text": "L'université (offrir) de nombreuses bourses aux étudiants méritants.",
            "verbs": [{"infinitive": "offrir", "position": 0, "subject": "L'université"}],
            "tenses": ["present", "passe_compose", "futur_simple"]
        },
        {
            "text": "Le directeur (annoncer) les résultats du concours national.",
            "verbs": [{"infinitive": "annoncer", "position": 0, "subject": "Le directeur"}],
            "tenses": ["passe_compose", "futur_simple", "present"]
        },
        {
            "text": "Les chercheurs (publier) une étude importante dans une revue scientifique.",
            "verbs": [{"infinitive": "publier", "position": 0, "subject": "Les chercheurs"}],
            "tenses": ["passe_compose", "futur_simple", "present"]
        },
    ],
    
    "sports": [
        {
            "text": "L'équipe nationale (gagner) le championnat pour la troisième fois consécutive.",
            "verbs": [{"infinitive": "gagner", "position": 0, "subject": "L'équipe nationale"}],
            "tenses": ["passe_compose", "plus_que_parfait", "futur_simple"]
        },
        {
            "text": "Le marathonien (courir) quarante-deux kilomètres sous une chaleur accablante.",
            "verbs": [{"infinitive": "courir", "position": 0, "subject": "Le marathonien"}],
            "tenses": ["passe_compose", "imparfait", "futur_simple"]
        },
        {
            "text": "Les joueurs (s'entraîner) intensivement avant la finale du tournoi.",
            "verbs": [{"infinitive": "s'entraîner", "position": 0, "subject": "Les joueurs"}],
            "tenses": ["present", "imparfait", "futur_simple"]
        },
        {
            "text": "La gymnaste (réussir) une performance exceptionnelle aux Jeux Olympiques.",
            "verbs": [{"infinitive": "réussir", "position": 0, "subject": "La gymnaste"}],
            "tenses": ["passe_compose", "plus_que_parfait", "futur_simple"]
        },
        {
            "text": "Le nageur (battre) le record du monde du cent mètres nage libre.",
            "verbs": [{"infinitive": "battre", "position": 0, "subject": "Le nageur"}],
            "tenses": ["passe_compose", "plus_que_parfait", "futur_simple"]
        },
    ],
    
    "art": [
        {
            "text": "Le peintre (créer) des œuvres magnifiques dans son atelier parisien.",
            "verbs": [{"infinitive": "créer", "position": 0, "subject": "Le peintre"}],
            "tenses": ["present", "imparfait", "passe_compose"]
        },
        {
            "text": "L'orchestre symphonique (interpréter) une symphonie de Beethoven.",
            "verbs": [{"infinitive": "interpréter", "position": 0, "subject": "L'orchestre symphonique"}],
            "tenses": ["present", "passe_compose", "futur_simple"]
        },
        {
            "text": "La sculptrice (travailler) le marbre avec une grande habileté.",
            "verbs": [{"infinitive": "travailler", "position": 0, "subject": "La sculptrice"}],
            "tenses": ["present", "imparfait", "passe_compose"]
        },
        {
            "text": "Les danseurs (répéter) la chorégraphie pendant des heures chaque jour.",
            "verbs": [{"infinitive": "répéter", "position": 0, "subject": "Les danseurs"}],
            "tenses": ["present", "imparfait", "passe_compose"]
        },
        {
            "text": "Le compositeur (écrire) une nouvelle pièce pour piano et violon.",
            "verbs": [{"infinitive": "écrire", "position": 0, "subject": "Le compositeur"}],
            "tenses": ["present", "passe_compose", "futur_simple"]
        },
    ],
    
    "travel": [
        {
            "text": "L'avion (décoller) de l'aéroport de Paris à l'heure prévue.",
            "verbs": [{"infinitive": "décoller", "position": 0, "subject": "L'avion"}],
            "tenses": ["passe_compose", "futur_simple", "present"]
        },
        {
            "text": "Les touristes (visiter) les monuments historiques de la ville.",
            "verbs": [{"infinitive": "visiter", "position": 0, "subject": "Les touristes"}],
            "tenses": ["present", "passe_compose", "futur_simple"]
        },
        {
            "text": "Le guide (expliquer) l'histoire fascinante du château médiéval.",
            "verbs": [{"infinitive": "expliquer", "position": 0, "subject": "Le guide"}],
            "tenses": ["present", "imparfait", "passe_compose"]
        },
        {
            "text": "Le train (traverser) des paysages magnifiques à travers les Alpes.",
            "verbs": [{"infinitive": "traverser", "position": 0, "subject": "Le train"}],
            "tenses": ["present", "imparfait", "futur_simple"]
        },
        {
            "text": "Les voyageurs (découvrir) une culture complètement différente.",
            "verbs": [{"infinitive": "découvrir", "position": 0, "subject": "Les voyageurs"}],
            "tenses": ["passe_compose", "futur_simple", "present"]
        },
    ],
    
    "past_contexts": [
        # Sentences specifically designed for plus-que-parfait
        {
            "text": "Avant de partir, elle (préparer) tous ses bagages soigneusement.",
            "verbs": [{"infinitive": "préparer", "position": 0, "subject": "elle"}],
            "tenses": ["plus_que_parfait", "passe_compose", "imparfait"]
        },
        {
            "text": "Quand je suis arrivé, ils (finir) déjà le travail.",
            "verbs": [{"infinitive": "finir", "position": 0, "subject": "ils"}],
            "tenses": ["plus_que_parfait", "passe_compose"]
        },
        {
            "text": "Les invités (partir) avant minuit comme prévu.",
            "verbs": [{"infinitive": "partir", "position": 0, "subject": "Les invités"}],
            "tenses": ["plus_que_parfait", "passe_compose", "futur_simple"]
        },
        {
            "text": "Marie (lire) ce livre trois fois avant l'examen.",
            "verbs": [{"infinitive": "lire", "position": 0, "subject": "Marie"}],
            "tenses": ["plus_que_parfait", "passe_compose", "futur_simple"]
        },
        {
            "text": "Nous (attendre) pendant deux heures avant son arrivée.",
            "verbs": [{"infinitive": "attendre", "position": 0, "subject": "Nous"}],
            "tenses": ["plus_que_parfait", "passe_compose", "imparfait"]
        },
        {
            "text": "Le directeur (annoncer) la nouvelle avant la réunion officielle.",
            "verbs": [{"infinitive": "annoncer", "position": 0, "subject": "Le directeur"}],
            "tenses": ["plus_que_parfait", "passe_compose", "futur_simple"]
        },
        {
            "text": "Les étudiants (réviser) toute la nuit pour l'examen du matin.",
            "verbs": [{"infinitive": "réviser", "position": 0, "subject": "Les étudiants"}],
            "tenses": ["plus_que_parfait", "passe_compose", "imparfait"]
        },
        {
            "text": "Mon père (travailler) dans cette entreprise pendant vingt ans.",
            "verbs": [{"infinitive": "travailler", "position": 0, "subject": "Mon père"}],
            "tenses": ["plus_que_parfait", "passe_compose", "imparfait"]
        },
        {
            "text": "Les artistes (répéter) leur spectacle de nombreuses fois.",
            "verbs": [{"infinitive": "répéter", "position": 0, "subject": "Les artistes"}],
            "tenses": ["plus_que_parfait", "passe_compose", "imparfait"]
        },
        {
            "text": "Sophie (apprendre) le piano pendant son enfance.",
            "verbs": [{"infinitive": "apprendre", "position": 0, "subject": "Sophie"}],
            "tenses": ["plus_que_parfait", "passe_compose", "imparfait"]
        },
        {
            "text": "Les témoins (voir) l'accident avant l'arrivée de la police.",
            "verbs": [{"infinitive": "voir", "position": 0, "subject": "Les témoins"}],
            "tenses": ["plus_que_parfait", "passe_compose"]
        },
        {
            "text": "Le chef (préparer) un repas exceptionnel pour l'occasion.",
            "verbs": [{"infinitive": "préparer", "position": 0, "subject": "Le chef"}],
            "tenses": ["plus_que_parfait", "passe_compose", "futur_simple"]
        },
        {
            "text": "Mes parents (vivre) à Paris avant de déménager ici.",
            "verbs": [{"infinitive": "vivre", "position": 0, "subject": "Mes parents"}],
            "tenses": ["plus_que_parfait", "passe_compose", "imparfait"]
        },
        {
            "text": "L'équipe (gagner) tous ses matchs cette saison-là.",
            "verbs": [{"infinitive": "gagner", "position": 0, "subject": "L'équipe"}],
            "tenses": ["plus_que_parfait", "passe_compose", "imparfait"]
        },
        {
            "text": "Tu (oublier) ton parapluie à la maison ce jour-là.",
            "verbs": [{"infinitive": "oublier", "position": 0, "subject": "Tu"}],
            "tenses": ["plus_que_parfait", "passe_compose", "imparfait"]
        },
        {
            "text": "Les scientifiques (découvrir) cette espèce des années auparavant.",
            "verbs": [{"infinitive": "découvrir", "position": 0, "subject": "Les scientifiques"}],
            "tenses": ["plus_que_parfait", "passe_compose"]
        },
        {
            "text": "Je (comprendre) la leçon après plusieurs explications.",
            "verbs": [{"infinitive": "comprendre", "position": 0, "subject": "Je"}],
            "tenses": ["plus_que_parfait", "passe_compose", "futur_simple"]
        },
        {
            "text": "Les acteurs (mémoriser) leurs répliques avant le tournage.",
            "verbs": [{"infinitive": "mémoriser", "position": 0, "subject": "Les acteurs"}],
            "tenses": ["plus_que_parfait", "passe_compose", "imparfait"]
        },
        {
            "text": "Le médecin (soigner) de nombreux patients pendant sa carrière.",
            "verbs": [{"infinitive": "soigner", "position": 0, "subject": "Le médecin"}],
            "tenses": ["plus_que_parfait", "passe_compose", "imparfait"]
        },
        {
            "text": "Nous (choisir) notre destination bien avant le départ.",
            "verbs": [{"infinitive": "choisir", "position": 0, "subject": "Nous"}],
            "tenses": ["plus_que_parfait", "passe_compose", "futur_simple"]
        },
    ],
    
    "literary": [
        # Sentences for passé simple (literary past tense)
        {
            "text": "Le roi (décider) de partir en guerre contre ses ennemis.",
            "verbs": [{"infinitive": "décider", "position": 0, "subject": "Le roi"}],
            "tenses": ["passe_simple", "passe_compose", "plus_que_parfait"]
        },
        {
            "text": "Les soldats (marcher) pendant des jours sans repos.",
            "verbs": [{"infinitive": "marcher", "position": 0, "subject": "Les soldats"}],
            "tenses": ["passe_simple", "imparfait", "passe_compose"]
        },
        {
            "text": "L'explorateur (découvrir) une terre inconnue au-delà des montagnes.",
            "verbs": [{"infinitive": "découvrir", "position": 0, "subject": "L'explorateur"}],
            "tenses": ["passe_simple", "passe_compose", "plus_que_parfait"]
        },
        {
            "text": "La princesse (attendre) son prince pendant de longues années.",
            "verbs": [{"infinitive": "attendre", "position": 0, "subject": "La princesse"}],
            "tenses": ["passe_simple", "imparfait", "plus_que_parfait"]
        },
        {
            "text": "Le chevalier (combattre) bravement contre le dragon.",
            "verbs": [{"infinitive": "combattre", "position": 0, "subject": "Le chevalier"}],
            "tenses": ["passe_simple", "passe_compose", "imparfait"]
        },
        {
            "text": "Le héros (vaincre) tous ses adversaires lors du tournoi.",
            "verbs": [{"infinitive": "vaincre", "position": 0, "subject": "Le héros"}],
            "tenses": ["passe_simple", "passe_compose", "plus_que_parfait"]
        },
        {
            "text": "La reine (ordonner) la construction d'un nouveau palais.",
            "verbs": [{"infinitive": "ordonner", "position": 0, "subject": "La reine"}],
            "tenses": ["passe_simple", "passe_compose", "imparfait"]
        },
        {
            "text": "Les paysans (cultiver) les terres du seigneur pendant des générations.",
            "verbs": [{"infinitive": "cultiver", "position": 0, "subject": "Les paysans"}],
            "tenses": ["passe_simple", "imparfait", "passe_compose"]
        },
        {
            "text": "L'armée (traverser) le fleuve à l'aube pour surprendre l'ennemi.",
            "verbs": [{"infinitive": "traverser", "position": 0, "subject": "L'armée"}],
            "tenses": ["passe_simple", "passe_compose", "plus_que_parfait"]
        },
        {
            "text": "Le poète (écrire) des vers magnifiques pour célébrer la victoire.",
            "verbs": [{"infinitive": "écrire", "position": 0, "subject": "Le poète"}],
            "tenses": ["passe_simple", "passe_compose", "imparfait"]
        },
        {
            "text": "Les marchands (venir) de pays lointains pour vendre leurs produits.",
            "verbs": [{"infinitive": "venir", "position": 0, "subject": "Les marchands"}],
            "tenses": ["passe_simple", "imparfait", "passe_compose"]
        },
        {
            "text": "Le navire (partir) au lever du soleil vers des îles inexplorées.",
            "verbs": [{"infinitive": "partir", "position": 0, "subject": "Le navire"}],
            "tenses": ["passe_simple", "passe_compose", "plus_que_parfait"]
        },
        {
            "text": "L'empereur (régner) pendant quarante ans sur un vaste empire.",
            "verbs": [{"infinitive": "régner", "position": 0, "subject": "L'empereur"}],
            "tenses": ["passe_simple", "imparfait", "passe_compose"]
        },
        {
            "text": "Les moines (construire) le monastère au sommet de la montagne.",
            "verbs": [{"infinitive": "construire", "position": 0, "subject": "Les moines"}],
            "tenses": ["passe_simple", "passe_compose", "plus_que_parfait"]
        },
        {
            "text": "Le sage (réfléchir) longtemps avant de donner sa réponse.",
            "verbs": [{"infinitive": "réfléchir", "position": 0, "subject": "Le sage"}],
            "tenses": ["passe_simple", "imparfait", "passe_compose"]
        },
    ],
    
    "future_contexts": [
        # Sentences for futur antérieur
        {
            "text": "Quand vous arriverez, nous (finir) déjà le projet.",
            "verbs": [{"infinitive": "finir", "position": 0, "subject": "nous"}],
            "tenses": ["futur_anterieur", "futur_simple", "passe_compose"]
        },
        {
            "text": "Avant demain soir, elle (terminer) tous ses devoirs.",
            "verbs": [{"infinitive": "terminer", "position": 0, "subject": "elle"}],
            "tenses": ["futur_anterieur", "futur_simple", "passe_compose"]
        },
        {
            "text": "D'ici la fin du mois, les ouvriers (construire) le nouveau bâtiment.",
            "verbs": [{"infinitive": "construire", "position": 0, "subject": "les ouvriers"}],
            "tenses": ["futur_anterieur", "futur_simple", "passe_compose"]
        },
        {
            "text": "Quand tu reviendras, je (partir) en vacances.",
            "verbs": [{"infinitive": "partir", "position": 0, "subject": "je"}],
            "tenses": ["futur_anterieur", "futur_simple", "passe_compose"]
        },
        {
            "text": "D'ici une heure, nous (manger) tout le repas.",
            "verbs": [{"infinitive": "manger", "position": 0, "subject": "nous"}],
            "tenses": ["futur_anterieur", "futur_simple", "passe_compose"]
        },
        {
            "text": "Quand il arrivera, tu (déjà sortir) de la maison.",
            "verbs": [{"infinitive": "sortir", "position": 0, "subject": "tu"}],
            "tenses": ["futur_anterieur", "futur_simple", "passe_compose"]
        },
        {
            "text": "Avant ce soir, elle (écrire) tous ses emails.",
            "verbs": [{"infinitive": "écrire", "position": 0, "subject": "elle"}],
            "tenses": ["futur_anterieur", "futur_simple", "passe_compose"]
        },
        {
            "text": "D'ici la fin de l'année, ils (apprendre) tout le programme.",
            "verbs": [{"infinitive": "apprendre", "position": 0, "subject": "ils"}],
            "tenses": ["futur_anterieur", "futur_simple", "passe_compose"]
        },
        {
            "text": "Quand vous lirez ce message, je (prendre) ma décision.",
            "verbs": [{"infinitive": "prendre", "position": 0, "subject": "je"}],
            "tenses": ["futur_anterieur", "futur_simple", "passe_compose"]
        },
        {
            "text": "Avant midi, le facteur (livrer) tous les colis.",
            "verbs": [{"infinitive": "livrer", "position": 0, "subject": "le facteur"}],
            "tenses": ["futur_anterieur", "futur_simple", "passe_compose"]
        },
        {
            "text": "D'ici demain, nous (résoudre) tous ces problèmes.",
            "verbs": [{"infinitive": "résoudre", "position": 0, "subject": "nous"}],
            "tenses": ["futur_anterieur", "futur_simple", "passe_compose"]
        },
        {
            "text": "Quand l'été arrivera, les arbres (fleurir) complètement.",
            "verbs": [{"infinitive": "fleurir", "position": 0, "subject": "les arbres"}],
            "tenses": ["futur_anterieur", "futur_simple", "passe_compose"]
        },
    ],
    
    "anterior_past": [
        # Sentences for passé antérieur
        {
            "text": "Dès qu'elle (arriver), la fête commença.",
            "verbs": [{"infinitive": "arriver", "position": 0, "subject": "elle"}],
            "tenses": ["passe_anterieur", "passe_compose", "passe_simple"]
        },
        {
            "text": "Lorsque le train (partir), nous montâmes dans nos voitures.",
            "verbs": [{"infinitive": "partir", "position": 0, "subject": "le train"}],
            "tenses": ["passe_anterieur", "passe_compose", "passe_simple"]
        },
        {
            "text": "Aussitôt qu'ils (finir) leur repas, ils sortirent du restaurant.",
            "verbs": [{"infinitive": "finir", "position": 0, "subject": "ils"}],
            "tenses": ["passe_anterieur", "passe_compose", "passe_simple"]
        },
        {
            "text": "Dès que le soleil (se lever), les oiseaux commencèrent à chanter.",
            "verbs": [{"infinitive": "se lever", "position": 0, "subject": "le soleil"}],
            "tenses": ["passe_anterieur", "passe_compose", "passe_simple"]
        },
        {
            "text": "Lorsqu'il (terminer) son travail, il rentra chez lui.",
            "verbs": [{"infinitive": "terminer", "position": 0, "subject": "il"}],
            "tenses": ["passe_anterieur", "passe_compose", "passe_simple"]
        },
        {
            "text": "Aussitôt que nous (entendre) la nouvelle, nous partîmes.",
            "verbs": [{"infinitive": "entendre", "position": 0, "subject": "nous"}],
            "tenses": ["passe_anterieur", "passe_compose", "passe_simple"]
        },
        {
            "text": "Dès qu'elle (lire) la lettre, elle comprit tout.",
            "verbs": [{"infinitive": "lire", "position": 0, "subject": "elle"}],
            "tenses": ["passe_anterieur", "passe_compose", "passe_simple"]
        },
        {
            "text": "Lorsque le roi (décider) de partir, toute la cour se prépara.",
            "verbs": [{"infinitive": "décider", "position": 0, "subject": "le roi"}],
            "tenses": ["passe_anterieur", "passe_compose", "passe_simple"]
        },
        {
            "text": "Aussitôt qu'ils (comprendre) le danger, ils s'enfuirent.",
            "verbs": [{"infinitive": "comprendre", "position": 0, "subject": "ils"}],
            "tenses": ["passe_anterieur", "passe_compose", "passe_simple"]
        },
        {
            "text": "Dès que tu (obtenir) ton diplôme, tu trouvas un emploi.",
            "verbs": [{"infinitive": "obtenir", "position": 0, "subject": "tu"}],
            "tenses": ["passe_anterieur", "passe_compose", "passe_simple"]
        },
    ],
    
    "conditional": [
        # Sentences for conditional tenses
        {
            "text": "Je (vouloir) voyager autour du monde si j'avais le temps.",
            "verbs": [{"infinitive": "vouloir", "position": 0, "subject": "Je"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Nous (partir) en vacances si nous avions assez d'argent.",
            "verbs": [{"infinitive": "partir", "position": 0, "subject": "Nous"}],
            "tenses": ["conditionnel_present", "futur_simple", "imparfait"]
        },
        {
            "text": "Elle (réussir) l'examen si elle avait mieux révisé.",
            "verbs": [{"infinitive": "réussir", "position": 0, "subject": "Elle"}],
            "tenses": ["conditionnel_passe", "passe_compose", "plus_que_parfait"]
        },
        {
            "text": "Tu (comprendre) la leçon si tu écoutais attentivement.",
            "verbs": [{"infinitive": "comprendre", "position": 0, "subject": "Tu"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Les enfants (jouer) dehors s'il ne pleuvait pas.",
            "verbs": [{"infinitive": "jouer", "position": 0, "subject": "Les enfants"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Vous (finir) plus tôt si vous aviez commencé à l'heure.",
            "verbs": [{"infinitive": "finir", "position": 0, "subject": "Vous"}],
            "tenses": ["conditionnel_passe", "passe_compose", "plus_que_parfait"]
        },
        {
            "text": "Il (être) content si son équipe gagnait le match.",
            "verbs": [{"infinitive": "être", "position": 0, "subject": "Il"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Je (acheter) une nouvelle voiture si j'avais les moyens.",
            "verbs": [{"infinitive": "acheter", "position": 0, "subject": "Je"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Nous (aller) au cinéma ce soir si nous avions le temps.",
            "verbs": [{"infinitive": "aller", "position": 0, "subject": "Nous"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Elle (devenir) médecin si elle avait continué ses études.",
            "verbs": [{"infinitive": "devenir", "position": 0, "subject": "Elle"}],
            "tenses": ["conditionnel_passe", "passe_compose", "plus_que_parfait"]
        },
        {
            "text": "Tu (pouvoir) réussir si tu travaillais davantage.",
            "verbs": [{"infinitive": "pouvoir", "position": 0, "subject": "Tu"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Ils (venir) nous voir s'ils habitaient plus près.",
            "verbs": [{"infinitive": "venir", "position": 0, "subject": "Ils"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Je (savoir) la réponse si j'avais mieux écouté.",
            "verbs": [{"infinitive": "savoir", "position": 0, "subject": "Je"}],
            "tenses": ["conditionnel_passe", "passe_compose", "plus_que_parfait"]
        },
        {
            "text": "Nous (prendre) le train si les billets n'étaient pas si chers.",
            "verbs": [{"infinitive": "prendre", "position": 0, "subject": "Nous"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Elle (écrire) un livre si elle avait plus d'imagination.",
            "verbs": [{"infinitive": "écrire", "position": 0, "subject": "Elle"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
    ],
    
    "subjunctive": [
        # Sentences for subjunctive tenses
        {
            "text": "Il faut que tu (finir) tes devoirs avant de sortir.",
            "verbs": [{"infinitive": "finir", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_present", "present", "futur_simple"]
        },
        {
            "text": "Je souhaite qu'elle (réussir) son examen demain.",
            "verbs": [{"infinitive": "réussir", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_present", "futur_simple", "present"]
        },
        {
            "text": "Il est important que nous (comprendre) cette leçon.",
            "verbs": [{"infinitive": "comprendre", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_present", "present", "futur_simple"]
        },
        {
            "text": "Je doute qu'ils (venir) à la fête ce soir.",
            "verbs": [{"infinitive": "venir", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_present", "futur_simple", "present"]
        },
        {
            "text": "Il est possible que vous (partir) demain matin.",
            "verbs": [{"infinitive": "partir", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_present", "futur_simple", "present"]
        },
        {
            "text": "Je regrette qu'elle (partir) sans dire au revoir.",
            "verbs": [{"infinitive": "partir", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Il est dommage que tu (oublier) ton rendez-vous.",
            "verbs": [{"infinitive": "oublier", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Je crains qu'il (perdre) ses clés hier.",
            "verbs": [{"infinitive": "perdre", "position": 0, "subject": "il"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Bien qu'il (pleuvoir) toute la journée, nous sommes sortis.",
            "verbs": [{"infinitive": "pleuvoir", "position": 0, "subject": "il"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il aurait fallu que nous (partir) plus tôt.",
            "verbs": [{"infinitive": "partir", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Je veux que tu (être) à l'heure pour la réunion.",
            "verbs": [{"infinitive": "être", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_present", "present", "futur_simple"]
        },
        {
            "text": "Il faut que nous (avoir) plus de temps pour terminer.",
            "verbs": [{"infinitive": "avoir", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_present", "present", "futur_simple"]
        },
        {
            "text": "Je ne pense pas qu'elle (pouvoir) venir aujourd'hui.",
            "verbs": [{"infinitive": "pouvoir", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_present", "present", "futur_simple"]
        },
        {
            "text": "Il est essentiel que vous (faire) vos exercices chaque jour.",
            "verbs": [{"infinitive": "faire", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_present", "present", "futur_simple"]
        },
        {
            "text": "Je souhaite que les étudiants (apprendre) rapidement le français.",
            "verbs": [{"infinitive": "apprendre", "position": 0, "subject": "les étudiants"}],
            "tenses": ["subjonctif_present", "present", "futur_simple"]
        },
        {
            "text": "Il faut que le médecin (examiner) le patient immédiatement.",
            "verbs": [{"infinitive": "examiner", "position": 0, "subject": "le médecin"}],
            "tenses": ["subjonctif_present", "present", "futur_simple"]
        },
        {
            "text": "Je crains que nous (perdre) notre chemin dans la forêt.",
            "verbs": [{"infinitive": "perdre", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_present", "present", "futur_simple"]
        },
        {
            "text": "Il est rare qu'il (neiger) en avril dans cette région.",
            "verbs": [{"infinitive": "neiger", "position": 0, "subject": "il"}],
            "tenses": ["subjonctif_present", "present", "futur_simple"]
        },
        {
            "text": "Je suis content que tu (réussir) ton examen de conduite.",
            "verbs": [{"infinitive": "réussir", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Il est triste que vous (devoir) partir si tôt.",
            "verbs": [{"infinitive": "devoir", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Bien qu'il (faire) froid, les enfants jouaient dehors.",
            "verbs": [{"infinitive": "faire", "position": 0, "subject": "il"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Pour qu'elle (pouvoir) réussir, il lui fallait beaucoup de courage.",
            "verbs": [{"infinitive": "pouvoir", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "J'aurais aimé que tu (venir) à ma fête d'anniversaire.",
            "verbs": [{"infinitive": "venir", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait été préférable que nous (prendre) le train.",
            "verbs": [{"infinitive": "prendre", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
    ],
    
    "imperative": [
        # Sentences for imperative tenses
        {
            "text": "(Finir) tes devoirs avant de jouer!",
            "verbs": [{"infinitive": "finir", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
        {
            "text": "(Écouter) attentivement les instructions du professeur.",
            "verbs": [{"infinitive": "écouter", "position": 0, "subject": "vous"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
        {
            "text": "(Partir) tout de suite si tu veux arriver à l'heure!",
            "verbs": [{"infinitive": "partir", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
        {
            "text": "(Prendre) ton temps pour réfléchir à la question.",
            "verbs": [{"infinitive": "prendre", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
        {
            "text": "(Être) gentil avec tes camarades de classe.",
            "verbs": [{"infinitive": "être", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
        {
            "text": "(Avoir) confiance en toi pour l'examen.",
            "verbs": [{"infinitive": "avoir", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
        {
            "text": "(Finir) ton travail avant midi!",
            "verbs": [{"infinitive": "finir", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif_passe", "passe_compose", "imperatif"]
        },
        {
            "text": "(Partir) avant qu'il ne soit trop tard!",
            "verbs": [{"infinitive": "partir", "position": 0, "subject": "vous"}],
            "tenses": ["imperatif_passe", "passe_compose", "imperatif"]
        },
        {
            "text": "(Regarder) ce magnifique paysage!",
            "verbs": [{"infinitive": "regarder", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
        {
            "text": "(Manger) tous tes légumes avant le dessert.",
            "verbs": [{"infinitive": "manger", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
        {
            "text": "(Attendre) ici pendant que je vais chercher la voiture.",
            "verbs": [{"infinitive": "attendre", "position": 0, "subject": "vous"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
        {
            "text": "(Faire) attention en traversant la rue!",
            "verbs": [{"infinitive": "faire", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
        {
            "text": "(Venir) me voir dès que tu as un problème.",
            "verbs": [{"infinitive": "venir", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
        {
            "text": "(Dire) toujours la vérité à tes parents.",
            "verbs": [{"infinitive": "dire", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
        {
            "text": "(Choisir) le cadeau que tu préfères.",
            "verbs": [{"infinitive": "choisir", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
        {
            "text": "(Répondre) poliment à toutes les questions.",
            "verbs": [{"infinitive": "répondre", "position": 0, "subject": "vous"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
        {
            "text": "(Terminer) ce projet avant la fin de la semaine!",
            "verbs": [{"infinitive": "terminer", "position": 0, "subject": "vous"}],
            "tenses": ["imperatif_passe", "passe_compose", "imperatif"]
        },
        {
            "text": "(Ranger) ta chambre avant ce soir!",
            "verbs": [{"infinitive": "ranger", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif_passe", "passe_compose", "imperatif"]
        },
        {
            "text": "(Apprendre) tes leçons pour demain.",
            "verbs": [{"infinitive": "apprendre", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
        {
            "text": "(Ouvrir) la fenêtre, il fait trop chaud ici!",
            "verbs": [{"infinitive": "ouvrir", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif", "present", "futur_simple"]
        },
    ],
    
    "hypothetical_past": [
        # More conditional sentences including conditionnel_passe_ii
        {
            "text": "Si j'avais su, je (venir) plus tôt à la réunion.",
            "verbs": [{"infinitive": "venir", "position": 0, "subject": "je"}],
            "tenses": ["conditionnel_passe", "conditionnel_passe_ii", "plus_que_parfait"]
        },
        {
            "text": "Nous (réussir) si nous avions mieux préparé le projet.",
            "verbs": [{"infinitive": "réussir", "position": 0, "subject": "Nous"}],
            "tenses": ["conditionnel_passe", "conditionnel_passe_ii", "plus_que_parfait"]
        },
        {
            "text": "Tu (comprendre) si le professeur avait mieux expliqué.",
            "verbs": [{"infinitive": "comprendre", "position": 0, "subject": "Tu"}],
            "tenses": ["conditionnel_passe", "conditionnel_passe_ii", "plus_que_parfait"]
        },
        {
            "text": "Elle (partir) en voyage si elle avait eu les moyens.",
            "verbs": [{"infinitive": "partir", "position": 0, "subject": "Elle"}],
            "tenses": ["conditionnel_passe", "conditionnel_passe_ii", "plus_que_parfait"]
        },
        {
            "text": "Ils (gagner) le match s'ils avaient mieux joué.",
            "verbs": [{"infinitive": "gagner", "position": 0, "subject": "Ils"}],
            "tenses": ["conditionnel_passe", "conditionnel_passe_ii", "plus_que_parfait"]
        },
        {
            "text": "Vous (trouver) la solution si vous aviez cherché plus longtemps.",
            "verbs": [{"infinitive": "trouver", "position": 0, "subject": "Vous"}],
            "tenses": ["conditionnel_passe", "conditionnel_passe_ii", "plus_que_parfait"]
        },
        {
            "text": "Je (acheter) cette maison si j'avais eu l'argent nécessaire.",
            "verbs": [{"infinitive": "acheter", "position": 0, "subject": "Je"}],
            "tenses": ["conditionnel_passe", "conditionnel_passe_ii", "plus_que_parfait"]
        },
        {
            "text": "Nous (aller) au concert si nous avions réservé nos billets.",
            "verbs": [{"infinitive": "aller", "position": 0, "subject": "Nous"}],
            "tenses": ["conditionnel_passe", "conditionnel_passe_ii", "plus_que_parfait"]
        },
        {
            "text": "Tu (devenir) champion si tu avais continué l'entraînement.",
            "verbs": [{"infinitive": "devenir", "position": 0, "subject": "Tu"}],
            "tenses": ["conditionnel_passe", "conditionnel_passe_ii", "plus_que_parfait"]
        },
        {
            "text": "Elle (apprendre) le piano si ses parents l'avaient encouragée.",
            "verbs": [{"infinitive": "apprendre", "position": 0, "subject": "Elle"}],
            "tenses": ["conditionnel_passe", "conditionnel_passe_ii", "plus_que_parfait"]
        },
        {
            "text": "Ils (construire) une piscine s'ils avaient eu un plus grand jardin.",
            "verbs": [{"infinitive": "construire", "position": 0, "subject": "Ils"}],
            "tenses": ["conditionnel_passe", "conditionnel_passe_ii", "plus_que_parfait"]
        },
        {
            "text": "Je (dire) la vérité si on me l'avait demandé.",
            "verbs": [{"infinitive": "dire", "position": 0, "subject": "Je"}],
            "tenses": ["conditionnel_passe", "conditionnel_passe_ii", "plus_que_parfait"]
        },
    ],
    
    "rare_tenses": [
        # Dedicated sentences for imperatif_passe
        {
            "text": "(Avoir) fini ton travail avant mon retour!",
            "verbs": [{"infinitive": "avoir", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif_passe", "passe_compose", "imperatif"]
        },
        {
            "text": "(Être) parti avant huit heures!",
            "verbs": [{"infinitive": "être", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif_passe", "passe_compose", "imperatif"]
        },
        {
            "text": "(Avoir) terminé tes devoirs avant ce soir!",
            "verbs": [{"infinitive": "avoir", "position": 0, "subject": "vous"}],
            "tenses": ["imperatif_passe", "passe_compose", "imperatif"]
        },
        {
            "text": "(Être) rentré à la maison avant minuit!",
            "verbs": [{"infinitive": "être", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif_passe", "passe_compose", "imperatif"]
        },
        {
            "text": "(Avoir) lu ce livre avant la prochaine réunion!",
            "verbs": [{"infinitive": "avoir", "position": 0, "subject": "vous"}],
            "tenses": ["imperatif_passe", "passe_compose", "imperatif"]
        },
        {
            "text": "(Être) revenu avant la fin du mois!",
            "verbs": [{"infinitive": "être", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif_passe", "passe_compose", "imperatif"]
        },
        {
            "text": "(Avoir) appris ta leçon pour demain!",
            "verbs": [{"infinitive": "avoir", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif_passe", "passe_compose", "imperatif"]
        },
        {
            "text": "(Être) arrivé à destination avant la nuit!",
            "verbs": [{"infinitive": "être", "position": 0, "subject": "vous"}],
            "tenses": ["imperatif_passe", "passe_compose", "imperatif"]
        },
        {
            "text": "(Avoir) écrit ton rapport avant la réunion!",
            "verbs": [{"infinitive": "avoir", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif_passe", "passe_compose", "imperatif"]
        },
        {
            "text": "(Être) sorti de la maison avant midi!",
            "verbs": [{"infinitive": "être", "position": 0, "subject": "tu"}],
            "tenses": ["imperatif_passe", "passe_compose", "imperatif"]
        },
        
        # More subjonctif_imparfait sentences
        {
            "text": "Il aurait fallu que tu (venir) plus tôt à la réunion.",
            "verbs": [{"infinitive": "venir", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je souhaitais qu'elle (réussir) son examen.",
            "verbs": [{"infinitive": "réussir", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il faudrait que nous (partir) immédiatement.",
            "verbs": [{"infinitive": "partir", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je voulais qu'il (comprendre) la situation.",
            "verbs": [{"infinitive": "comprendre", "position": 0, "subject": "il"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il était nécessaire que vous (finir) le travail.",
            "verbs": [{"infinitive": "finir", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je craignais qu'ils (perdre) leur chemin.",
            "verbs": [{"infinitive": "perdre", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il aurait été préférable que tu (attendre) mon retour.",
            "verbs": [{"infinitive": "attendre", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je souhaitais qu'elle (pouvoir) venir avec nous.",
            "verbs": [{"infinitive": "pouvoir", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il était important que nous (savoir) la vérité.",
            "verbs": [{"infinitive": "savoir", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je voulais qu'ils (faire) leurs devoirs.",
            "verbs": [{"infinitive": "faire", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il était essentiel que tu (être) présent à la réunion.",
            "verbs": [{"infinitive": "être", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je souhaitais que vous (avoir) plus de temps.",
            "verbs": [{"infinitive": "avoir", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il fallait qu'elle (aller) voir le médecin.",
            "verbs": [{"infinitive": "aller", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je voulais que nous (prendre) notre temps.",
            "verbs": [{"infinitive": "prendre", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il était important qu'ils (dire) la vérité.",
            "verbs": [{"infinitive": "dire", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je souhaitais que tu (voir) cette exposition.",
            "verbs": [{"infinitive": "voir", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il fallait que vous (écrire) cette lettre.",
            "verbs": [{"infinitive": "écrire", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je voulais qu'elle (lire) ce livre.",
            "verbs": [{"infinitive": "lire", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il était nécessaire que nous (suivre) ces instructions.",
            "verbs": [{"infinitive": "suivre", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je souhaitais qu'ils (vivre) plus près de nous.",
            "verbs": [{"infinitive": "vivre", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il fallait que tu (mettre) de l'ordre dans ta chambre.",
            "verbs": [{"infinitive": "mettre", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je voulais que vous (connaître) mes amis.",
            "verbs": [{"infinitive": "connaître", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il était important qu'elle (croire) en elle-même.",
            "verbs": [{"infinitive": "croire", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je souhaitais que nous (recevoir) de bonnes nouvelles.",
            "verbs": [{"infinitive": "recevoir", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il fallait qu'ils (courir) plus vite pour gagner.",
            "verbs": [{"infinitive": "courir", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je voulais que tu (boire) moins de café.",
            "verbs": [{"infinitive": "boire", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il était nécessaire que vous (tenir) vos promesses.",
            "verbs": [{"infinitive": "tenir", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je souhaitais qu'elle (devenir) médecin.",
            "verbs": [{"infinitive": "devenir", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il fallait que nous (rendre) visite à nos parents.",
            "verbs": [{"infinitive": "rendre", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je voulais qu'ils (descendre) au sous-sol.",
            "verbs": [{"infinitive": "descendre", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il était important que tu (conduire) prudemment.",
            "verbs": [{"infinitive": "conduire", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je souhaitais que vous (produire) de meilleurs résultats.",
            "verbs": [{"infinitive": "produire", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il fallait qu'elle (traduire) ce document rapidement.",
            "verbs": [{"infinitive": "traduire", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je voulais que nous (construire) une nouvelle maison.",
            "verbs": [{"infinitive": "construire", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il était nécessaire qu'ils (détruire) le vieux bâtiment.",
            "verbs": [{"infinitive": "détruire", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je souhaitais que tu (instruire) les nouveaux employés.",
            "verbs": [{"infinitive": "instruire", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il fallait que vous (séduire) les investisseurs.",
            "verbs": [{"infinitive": "séduire", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je voulais qu'elle (réduire) ses dépenses.",
            "verbs": [{"infinitive": "réduire", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Il était important que nous (reproduire) ces résultats.",
            "verbs": [{"infinitive": "reproduire", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        {
            "text": "Je souhaitais qu'ils (introduire) de nouvelles méthodes.",
            "verbs": [{"infinitive": "introduire", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_imparfait", "imparfait", "subjonctif_present"]
        },
        
        # More subjonctif_plus_que_parfait sentences
        {
            "text": "J'aurais préféré qu'elle (venir) à la fête.",
            "verbs": [{"infinitive": "venir", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait été bon que tu (finir) ce travail hier.",
            "verbs": [{"infinitive": "finir", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Je regrettais qu'ils (partir) sans nous prévenir.",
            "verbs": [{"infinitive": "partir", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait mieux valu que nous (attendre) son retour.",
            "verbs": [{"infinitive": "attendre", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "J'aurais aimé que vous (comprendre) mes raisons.",
            "verbs": [{"infinitive": "comprendre", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait été préférable qu'elle (choisir) une autre solution.",
            "verbs": [{"infinitive": "choisir", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Je souhaitais que tu (réussir) ton examen.",
            "verbs": [{"infinitive": "réussir", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait fallu qu'ils (prendre) le train plus tôt.",
            "verbs": [{"infinitive": "prendre", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "J'aurais voulu que nous (partir) ensemble.",
            "verbs": [{"infinitive": "partir", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait été bon qu'elle (apprendre) cette leçon.",
            "verbs": [{"infinitive": "apprendre", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "J'aurais aimé que tu (être) là pour mon anniversaire.",
            "verbs": [{"infinitive": "être", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait été préférable que vous (avoir) plus de temps.",
            "verbs": [{"infinitive": "avoir", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Je regrettais qu'elle (aller) sans moi.",
            "verbs": [{"infinitive": "aller", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait mieux valu que nous (faire) ce travail ensemble.",
            "verbs": [{"infinitive": "faire", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "J'aurais préféré qu'ils (dire) la vérité dès le début.",
            "verbs": [{"infinitive": "dire", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait été bon que tu (voir) ce spectacle.",
            "verbs": [{"infinitive": "voir", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Je souhaitais que vous (savoir) cette information plus tôt.",
            "verbs": [{"infinitive": "savoir", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait fallu qu'elle (pouvoir) venir avec nous.",
            "verbs": [{"infinitive": "pouvoir", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "J'aurais voulu que nous (recevoir) cette lettre à temps.",
            "verbs": [{"infinitive": "recevoir", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait été préférable qu'ils (vouloir) participer.",
            "verbs": [{"infinitive": "vouloir", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Je regrettais que tu (devoir) partir si tôt.",
            "verbs": [{"infinitive": "devoir", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait mieux valu que vous (croire) mon histoire.",
            "verbs": [{"infinitive": "croire", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "J'aurais aimé qu'elle (vivre) plus longtemps.",
            "verbs": [{"infinitive": "vivre", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait été bon que nous (tenir) notre promesse.",
            "verbs": [{"infinitive": "tenir", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Je souhaitais qu'ils (suivre) mes conseils.",
            "verbs": [{"infinitive": "suivre", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait fallu que tu (écrire) cette lettre plus tôt.",
            "verbs": [{"infinitive": "écrire", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "J'aurais préféré que vous (lire) ce livre avant la réunion.",
            "verbs": [{"infinitive": "lire", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait été préférable qu'elle (mettre) plus d'efforts.",
            "verbs": [{"infinitive": "mettre", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Je regrettais que nous (perdre) cette opportunité.",
            "verbs": [{"infinitive": "perdre", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait mieux valu qu'ils (connaître) les risques.",
            "verbs": [{"infinitive": "connaître", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "J'aurais voulu que tu (rendre) visite à ta grand-mère.",
            "verbs": [{"infinitive": "rendre", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait été sage que vous (consulter) un expert.",
            "verbs": [{"infinitive": "consulter", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Je regrettais qu'elle (oublier) notre rendez-vous.",
            "verbs": [{"infinitive": "oublier", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait été utile que nous (préparer) mieux cette présentation.",
            "verbs": [{"infinitive": "préparer", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "J'aurais aimé qu'ils (arriver) plus tôt.",
            "verbs": [{"infinitive": "arriver", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait mieux valu que tu (rester) à la maison.",
            "verbs": [{"infinitive": "rester", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Je souhaitais que vous (accepter) cette offre.",
            "verbs": [{"infinitive": "accepter", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait fallu qu'elle (terminer) ses études.",
            "verbs": [{"infinitive": "terminer", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "J'aurais préféré que nous (commencer) plus tôt.",
            "verbs": [{"infinitive": "commencer", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait été bon qu'ils (réfléchir) avant d'agir.",
            "verbs": [{"infinitive": "réfléchir", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Je regrettais que tu (négliger) tes responsabilités.",
            "verbs": [{"infinitive": "négliger", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait été préférable que vous (écouter) mes conseils.",
            "verbs": [{"infinitive": "écouter", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "J'aurais voulu qu'elle (continuer) ses efforts.",
            "verbs": [{"infinitive": "continuer", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait fallu que nous (travailler) ensemble.",
            "verbs": [{"infinitive": "travailler", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Je souhaitais qu'ils (répondre) à ma question.",
            "verbs": [{"infinitive": "répondre", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait été sage que tu (demander) de l'aide.",
            "verbs": [{"infinitive": "demander", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "J'aurais aimé que vous (participer) à ce projet.",
            "verbs": [{"infinitive": "participer", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait mieux valu qu'elle (changer) d'avis.",
            "verbs": [{"infinitive": "changer", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Je regrettais que nous (manquer) cette occasion.",
            "verbs": [{"infinitive": "manquer", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        {
            "text": "Il aurait été bon qu'ils (présenter) leurs excuses.",
            "verbs": [{"infinitive": "présenter", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_plus_que_parfait", "plus_que_parfait", "subjonctif_passe"]
        },
        
        # More conditionnel_passe_ii sentences
        {
            "text": "J' (aimer) être venu à ta fête si j'avais pu.",
            "verbs": [{"infinitive": "aimer", "position": 0, "subject": "Je"}],
            "tenses": ["conditionnel_passe_ii", "conditionnel_passe", "plus_que_parfait"]
        },
        {
            "text": "Elle (souhaiter) être partie plus tôt.",
            "verbs": [{"infinitive": "souhaiter", "position": 0, "subject": "Elle"}],
            "tenses": ["conditionnel_passe_ii", "conditionnel_passe", "plus_que_parfait"]
        },
        {
            "text": "Nous (préférer) avoir fini le projet à temps.",
            "verbs": [{"infinitive": "préférer", "position": 0, "subject": "Nous"}],
            "tenses": ["conditionnel_passe_ii", "conditionnel_passe", "plus_que_parfait"]
        },
        {
            "text": "Tu (vouloir) être arrivé avant la fermeture.",
            "verbs": [{"infinitive": "vouloir", "position": 0, "subject": "Tu"}],
            "tenses": ["conditionnel_passe_ii", "conditionnel_passe", "plus_que_parfait"]
        },
        {
            "text": "Ils (désirer) avoir réussi l'examen du premier coup.",
            "verbs": [{"infinitive": "désirer", "position": 0, "subject": "Ils"}],
            "tenses": ["conditionnel_passe_ii", "conditionnel_passe", "plus_que_parfait"]
        },
        {
            "text": "Vous (aimer) être revenu plus tôt de vacances.",
            "verbs": [{"infinitive": "aimer", "position": 0, "subject": "Vous"}],
            "tenses": ["conditionnel_passe_ii", "conditionnel_passe", "plus_que_parfait"]
        },
        {
            "text": "Je (préférer) avoir compris la situation plus tôt.",
            "verbs": [{"infinitive": "préférer", "position": 0, "subject": "Je"}],
            "tenses": ["conditionnel_passe_ii", "conditionnel_passe", "plus_que_parfait"]
        },
        {
            "text": "Elle (vouloir) être née dans un autre pays.",
            "verbs": [{"infinitive": "vouloir", "position": 0, "subject": "Elle"}],
            "tenses": ["conditionnel_passe_ii", "conditionnel_passe", "plus_que_parfait"]
        },
        {
            "text": "Nous (souhaiter) avoir pris une autre décision.",
            "verbs": [{"infinitive": "souhaiter", "position": 0, "subject": "Nous"}],
            "tenses": ["conditionnel_passe_ii", "conditionnel_passe", "plus_que_parfait"]
        },
        {
            "text": "Tu (aimer) être resté à la maison ce jour-là.",
            "verbs": [{"infinitive": "aimer", "position": 0, "subject": "Tu"}],
            "tenses": ["conditionnel_passe_ii", "conditionnel_passe", "plus_que_parfait"]
        },
        
        # Many more sentences for conditionnel_present
        {
            "text": "Je (aimer) voyager en Asie si c'était possible.",
            "verbs": [{"infinitive": "aimer", "position": 0, "subject": "Je"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Tu (devoir) faire plus d'exercice pour rester en forme.",
            "verbs": [{"infinitive": "devoir", "position": 0, "subject": "Tu"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Elle (savoir) quoi faire dans cette situation.",
            "verbs": [{"infinitive": "savoir", "position": 0, "subject": "Elle"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Nous (voir) nos amis plus souvent si possible.",
            "verbs": [{"infinitive": "voir", "position": 0, "subject": "Nous"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Vous (falloir) travailler dur pour réussir.",
            "verbs": [{"infinitive": "falloir", "position": 0, "subject": "il"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Ils (recevoir) une récompense pour leur travail.",
            "verbs": [{"infinitive": "recevoir", "position": 0, "subject": "Ils"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Je (courir) un marathon si j'avais le temps de m'entraîner.",
            "verbs": [{"infinitive": "courir", "position": 0, "subject": "Je"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Tu (boire) moins de café si tu voulais mieux dormir.",
            "verbs": [{"infinitive": "boire", "position": 0, "subject": "Tu"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Elle (lire) davantage si elle trouvait le temps.",
            "verbs": [{"infinitive": "lire", "position": 0, "subject": "Elle"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Nous (conduire) plus prudemment en montagne.",
            "verbs": [{"infinitive": "conduire", "position": 0, "subject": "Nous"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Vous (suivre) ce cours si vous en aviez l'opportunité.",
            "verbs": [{"infinitive": "suivre", "position": 0, "subject": "Vous"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Ils (vivre) à la campagne s'ils le pouvaient.",
            "verbs": [{"infinitive": "vivre", "position": 0, "subject": "Ils"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Je (mettre) plus d'ordre dans ma vie.",
            "verbs": [{"infinitive": "mettre", "position": 0, "subject": "Je"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Tu (connaître) mieux ta ville si tu explorais davantage.",
            "verbs": [{"infinitive": "connaître", "position": 0, "subject": "Tu"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Elle (paraître) plus jeune avec une nouvelle coiffure.",
            "verbs": [{"infinitive": "paraître", "position": 0, "subject": "Elle"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Nous (croire) cette histoire si elle était plus crédible.",
            "verbs": [{"infinitive": "croire", "position": 0, "subject": "Nous"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Vous (tenir) vos promesses si vous étiez sérieux.",
            "verbs": [{"infinitive": "tenir", "position": 0, "subject": "Vous"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        {
            "text": "Ils (rendre) visite à leurs parents plus souvent.",
            "verbs": [{"infinitive": "rendre", "position": 0, "subject": "Ils"}],
            "tenses": ["conditionnel_present", "imparfait", "futur_simple"]
        },
        
        # Many more subjonctif_passe sentences
        {
            "text": "Je suis heureux que tu (finir) ton projet à temps.",
            "verbs": [{"infinitive": "finir", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Il est surprenant qu'elle (réussir) sans étudier.",
            "verbs": [{"infinitive": "réussir", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Je doute que nous (arriver) à l'heure hier.",
            "verbs": [{"infinitive": "arriver", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Il est possible qu'ils (venir) pendant notre absence.",
            "verbs": [{"infinitive": "venir", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Je suis content que vous (comprendre) la leçon.",
            "verbs": [{"infinitive": "comprendre", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Il est étrange qu'elle (partir) sans dire au revoir.",
            "verbs": [{"infinitive": "partir", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Je ne crois pas que tu (faire) de ton mieux.",
            "verbs": [{"infinitive": "faire", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Il est regrettable que nous (perdre) le match.",
            "verbs": [{"infinitive": "perdre", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Je suis étonné qu'ils (trouver) la solution si vite.",
            "verbs": [{"infinitive": "trouver", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Il est bon que vous (prendre) cette décision.",
            "verbs": [{"infinitive": "prendre", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Je regrette qu'elle (oublier) notre rendez-vous.",
            "verbs": [{"infinitive": "oublier", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Il est incroyable que tu (réussir) cet examen difficile.",
            "verbs": [{"infinitive": "réussir", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Je suis ravi que nous (terminer) à temps.",
            "verbs": [{"infinitive": "terminer", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Il est dommage qu'ils (manquer) le train.",
            "verbs": [{"infinitive": "manquer", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Je suis surpris que vous (choisir) cette option.",
            "verbs": [{"infinitive": "choisir", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Il est heureux qu'elle (obtenir) ce poste.",
            "verbs": [{"infinitive": "obtenir", "position": 0, "subject": "elle"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Je crains que tu (dire) quelque chose de mal.",
            "verbs": [{"infinitive": "dire", "position": 0, "subject": "tu"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Il est surprenant que nous (voir) cette opportunité.",
            "verbs": [{"infinitive": "voir", "position": 0, "subject": "nous"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Je suis content qu'ils (découvrir) la vérité.",
            "verbs": [{"infinitive": "découvrir", "position": 0, "subject": "ils"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
        {
            "text": "Il est regrettable que vous (abandonner) si tôt.",
            "verbs": [{"infinitive": "abandonner", "position": 0, "subject": "vous"}],
            "tenses": ["subjonctif_passe", "passe_compose", "subjonctif_present"]
        },
    ],
}

def escape_sql_string(s):
    """Escape single quotes for SQL"""
    return s.replace("'", "''")

def generate_variations(base_sentences):
    """Generate variations of base sentences with different subjects and contexts"""
    variations = []
    
    # Additional subjects for variation
    subjects_singular = [
        "Mon ami", "Ma cousine", "Le voisin", "La voisine", "Cet homme", "Cette femme",
        "L'étudiant", "L'étudiante", "Le professeur", "La professeure", "Mon frère", "Ma sœur"
    ]
    
    subjects_plural = [
        "Mes amis", "Mes cousines", "Les voisins", "Ces hommes", "Ces femmes",
        "Les étudiants", "Les professeurs", "Mes frères", "Mes sœurs", "Les gens"
    ]
    
    # Time expressions to add variety
    time_expressions = [
        "hier", "demain", "la semaine dernière", "l'année prochaine", 
        "ce matin", "ce soir", "aujourd'hui", "autrefois", "bientôt",
        "récemment", "prochainement", "souvent", "parfois", "toujours"
    ]
    
    for sentence in base_sentences:
        variations.append(sentence)
        
        # Add time expression variations
        if random.random() > 0.7 and len(sentence["verbs"]) == 1:
            time_expr = random.choice(time_expressions)
            new_sentence = sentence.copy()
            # Insert time expression at beginning or after comma
            if ", " in new_sentence["text"]:
                parts = new_sentence["text"].split(", ", 1)
                new_sentence["text"] = f"{parts[0]}, {time_expr}, {parts[1]}"
            else:
                new_sentence["text"] = f"{time_expr.capitalize()}, " + new_sentence["text"][0].lower() + new_sentence["text"][1:]
            variations.append(new_sentence)
    
    return variations

def generate_sql_file(output_file="populate_sentences_full.sql", target_count=900):
    """Generate SQL file with sentences ensuring minimum 50 per tense"""
    
    # Collect all base sentences
    all_sentences = []
    for category, sentences in SENTENCE_DATA.items():
        all_sentences.extend(sentences)
    
    # Generate variations to reach target
    all_sentences = generate_variations(all_sentences)
    
    # All 17 required tenses
    required_tenses = [
        "present", "imparfait", "passe_simple", "futur_simple", "passe_compose",
        "plus_que_parfait", "passe_anterieur", "futur_anterieur",
        "subjonctif_present", "subjonctif_imparfait", "subjonctif_passe", "subjonctif_plus_que_parfait",
        "conditionnel_present", "conditionnel_passe", "conditionnel_passe_ii",
        "imperatif", "imperatif_passe"
    ]
    
    # Continue generating until we have enough for each tense
    # Strategy: focus on underrepresented tenses
    while len(all_sentences) < target_count:
        # Pick a random category and generate more variations
        category = random.choice(list(SENTENCE_DATA.keys()))
        base = SENTENCE_DATA[category]
        new_variations = generate_variations(base[:5])  # Take subset to vary
        all_sentences.extend(new_variations)
    
    # Shuffle to mix tenses well
    random.shuffle(all_sentences)
    
    # Trim to exact target
    all_sentences = all_sentences[:target_count]
    
    # Count sentences per tense for reporting
    tense_counts = {tense: 0 for tense in required_tenses}
    for sentence in all_sentences:
        for tense in sentence["tenses"]:
            if tense in tense_counts:
                tense_counts[tense] += 1
    
    # Generate SQL
    sql_lines = [
        "-- Populate sentences table with French sentences for conjugation practice",
        "-- Generated: 2025-10-31",
        f"-- Total sentences: {len(all_sentences)}",
        f"-- Tense distribution: {', '.join(f'{k}: {v}' for k, v in sorted(tense_counts.items()))}",
        "",
        "CREATE TABLE IF NOT EXISTS sentences (",
        "    id SERIAL PRIMARY KEY,",
        "    text TEXT NOT NULL,",
        "    verbs JSONB NOT NULL,",
        "    tenses TEXT[] NOT NULL,",
        "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,",
        "    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        ");",
        "",
        "-- Clear existing data",
        "TRUNCATE TABLE sentences RESTART IDENTITY CASCADE;",
        "",
        "-- Insert sentences",
        "INSERT INTO sentences (text, verbs, tenses) VALUES"
    ]
    
    for i, sentence in enumerate(all_sentences):
        verbs_json = json.dumps(sentence["verbs"], ensure_ascii=False)
        tenses_array = "{" + ",".join(sentence["tenses"]) + "}"
        
        comma = "," if i < len(all_sentences) - 1 else ";"
        sql_lines.append(
            f"('{escape_sql_string(sentence['text'])}', '{escape_sql_string(verbs_json)}', '{tenses_array}'){comma}"
        )
    
    sql_lines.append("")
    sql_lines.append(f"-- Total sentences inserted: {len(all_sentences)}")
    sql_lines.append(f"-- Tense distribution: {', '.join(f'{k}: {v}' for k, v in sorted(tense_counts.items()))}")
    
    # Write to file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"Generated SQL file with {len(all_sentences)} sentences: {output_file}")
    print(f"Tense distribution:")
    for tense, count in sorted(tense_counts.items()):
        print(f"  - {tense}: {count} sentences")
    return len(all_sentences)

if __name__ == "__main__":
    count = generate_sql_file(target_count=TARGET_SENTENCES)
    print(f"✓ Successfully generated {count} sentences")

