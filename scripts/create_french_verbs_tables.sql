-- Migration script for French verb conjugations
-- This script creates the tables needed for storing French verbs and their conjugations

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS verb_conjugations CASCADE;
DROP TABLE IF EXISTS verbs CASCADE;

-- Create the verbs table
CREATE TABLE verbs (
    id SERIAL PRIMARY KEY,
    infinitive VARCHAR(255) UNIQUE NOT NULL,
    past_participle VARCHAR(255),
    present_participle VARCHAR(255),
    auxiliary VARCHAR(10), -- 'avoir' or 'être'
    pronominal_form VARCHAR(255),
    translation VARCHAR(255),
    category VARCHAR(100),
    difficulty INTEGER DEFAULT 1,
    image_url VARCHAR(500),
    audio_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the verb_conjugations table
CREATE TABLE verb_conjugations (
    id SERIAL PRIMARY KEY,
    verb_id INTEGER REFERENCES verbs(id) ON DELETE CASCADE,
    
    -- Present tense (6 forms)
    present_1 VARCHAR(255), -- je
    present_2 VARCHAR(255), -- tu
    present_3 VARCHAR(255), -- il/elle
    present_4 VARCHAR(255), -- nous
    present_5 VARCHAR(255), -- vous
    present_6 VARCHAR(255), -- ils/elles
    
    -- Imparfait (6 forms)
    imparfait_1 VARCHAR(255),
    imparfait_2 VARCHAR(255),
    imparfait_3 VARCHAR(255),
    imparfait_4 VARCHAR(255),
    imparfait_5 VARCHAR(255),
    imparfait_6 VARCHAR(255),
    
    -- Passé Simple (6 forms)
    passe_simple_1 VARCHAR(255),
    passe_simple_2 VARCHAR(255),
    passe_simple_3 VARCHAR(255),
    passe_simple_4 VARCHAR(255),
    passe_simple_5 VARCHAR(255),
    passe_simple_6 VARCHAR(255),
    
    -- Futur Simple (6 forms)
    futur_simple_1 VARCHAR(255),
    futur_simple_2 VARCHAR(255),
    futur_simple_3 VARCHAR(255),
    futur_simple_4 VARCHAR(255),
    futur_simple_5 VARCHAR(255),
    futur_simple_6 VARCHAR(255),
    
    -- Passé Composé (6 forms)
    passe_compose_1 VARCHAR(255),
    passe_compose_2 VARCHAR(255),
    passe_compose_3 VARCHAR(255),
    passe_compose_4 VARCHAR(255),
    passe_compose_5 VARCHAR(255),
    passe_compose_6 VARCHAR(255),
    
    -- Plus-que-parfait (6 forms)
    plus_que_parfait_1 VARCHAR(255),
    plus_que_parfait_2 VARCHAR(255),
    plus_que_parfait_3 VARCHAR(255),
    plus_que_parfait_4 VARCHAR(255),
    plus_que_parfait_5 VARCHAR(255),
    plus_que_parfait_6 VARCHAR(255),
    
    -- Passé Antérieur (6 forms)
    passe_anterieur_1 VARCHAR(255),
    passe_anterieur_2 VARCHAR(255),
    passe_anterieur_3 VARCHAR(255),
    passe_anterieur_4 VARCHAR(255),
    passe_anterieur_5 VARCHAR(255),
    passe_anterieur_6 VARCHAR(255),
    
    -- Futur Antérieur (6 forms)
    futur_anterieur_1 VARCHAR(255),
    futur_anterieur_2 VARCHAR(255),
    futur_anterieur_3 VARCHAR(255),
    futur_anterieur_4 VARCHAR(255),
    futur_anterieur_5 VARCHAR(255),
    futur_anterieur_6 VARCHAR(255),
    
    -- Subjonctif Présent (6 forms)
    subjonctif_present_1 VARCHAR(255),
    subjonctif_present_2 VARCHAR(255),
    subjonctif_present_3 VARCHAR(255),
    subjonctif_present_4 VARCHAR(255),
    subjonctif_present_5 VARCHAR(255),
    subjonctif_present_6 VARCHAR(255),
    
    -- Subjonctif Imparfait (6 forms)
    subjonctif_imparfait_1 VARCHAR(255),
    subjonctif_imparfait_2 VARCHAR(255),
    subjonctif_imparfait_3 VARCHAR(255),
    subjonctif_imparfait_4 VARCHAR(255),
    subjonctif_imparfait_5 VARCHAR(255),
    subjonctif_imparfait_6 VARCHAR(255),
    
    -- Subjonctif Passé (6 forms)
    subjonctif_passe_1 VARCHAR(255),
    subjonctif_passe_2 VARCHAR(255),
    subjonctif_passe_3 VARCHAR(255),
    subjonctif_passe_4 VARCHAR(255),
    subjonctif_passe_5 VARCHAR(255),
    subjonctif_passe_6 VARCHAR(255),
    
    -- Subjonctif Plus-que-parfait (6 forms)
    subjonctif_plus_que_parfait_1 VARCHAR(255),
    subjonctif_plus_que_parfait_2 VARCHAR(255),
    subjonctif_plus_que_parfait_3 VARCHAR(255),
    subjonctif_plus_que_parfait_4 VARCHAR(255),
    subjonctif_plus_que_parfait_5 VARCHAR(255),
    subjonctif_plus_que_parfait_6 VARCHAR(255),
    
    -- Conditionnel Présent (6 forms)
    conditionnel_present_1 VARCHAR(255),
    conditionnel_present_2 VARCHAR(255),
    conditionnel_present_3 VARCHAR(255),
    conditionnel_present_4 VARCHAR(255),
    conditionnel_present_5 VARCHAR(255),
    conditionnel_present_6 VARCHAR(255),
    
    -- Conditionnel Passé (6 forms)
    conditionnel_passe_1 VARCHAR(255),
    conditionnel_passe_2 VARCHAR(255),
    conditionnel_passe_3 VARCHAR(255),
    conditionnel_passe_4 VARCHAR(255),
    conditionnel_passe_5 VARCHAR(255),
    conditionnel_passe_6 VARCHAR(255),
    
    -- Conditionnel Passé II (6 forms)
    conditionnel_passe_ii_1 VARCHAR(255),
    conditionnel_passe_ii_2 VARCHAR(255),
    conditionnel_passe_ii_3 VARCHAR(255),
    conditionnel_passe_ii_4 VARCHAR(255),
    conditionnel_passe_ii_5 VARCHAR(255),
    conditionnel_passe_ii_6 VARCHAR(255),
    
    -- Impératif (6 forms)
    imperatif_1 VARCHAR(255),
    imperatif_2 VARCHAR(255),
    imperatif_3 VARCHAR(255),
    imperatif_4 VARCHAR(255),
    imperatif_5 VARCHAR(255),
    imperatif_6 VARCHAR(255),
    
    -- Impératif Passé (6 forms)
    imperatif_passe_1 VARCHAR(255),
    imperatif_passe_2 VARCHAR(255),
    imperatif_passe_3 VARCHAR(255),
    imperatif_passe_4 VARCHAR(255),
    imperatif_passe_5 VARCHAR(255),
    imperatif_passe_6 VARCHAR(255),
    
    UNIQUE(verb_id)
);

-- Create indexes for better performance
CREATE INDEX idx_verbs_infinitive ON verbs(infinitive);
CREATE INDEX idx_verbs_category ON verbs(category);
CREATE INDEX idx_verbs_difficulty ON verbs(difficulty);
CREATE INDEX idx_verb_conjugations_verb_id ON verb_conjugations(verb_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_verbs_updated_at BEFORE UPDATE ON verbs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE verbs TO verber_user;
GRANT ALL PRIVILEGES ON TABLE verb_conjugations TO verber_user;
GRANT ALL PRIVILEGES ON SEQUENCE verbs_id_seq TO verber_user;
GRANT ALL PRIVILEGES ON SEQUENCE verb_conjugations_id_seq TO verber_user;