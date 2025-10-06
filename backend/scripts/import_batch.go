package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"
)

type VerbData struct {
	Infinitif                string   `json:"Infinitif"`
	ParticipePasse           string   `json:"ParticipePasse"`
	ParticipePresent         string   `json:"ParticipePresent"`
	Auxiliaire               string   `json:"Auxiliaire"`
	FormePronominale         string   `json:"FormePronominale"`
	Present                  []string `json:"Present"`
	Imparfait                []string `json:"Imparfait"`
	PasseSimple              []string `json:"PasseSimple"`
	FuturSimple              []string `json:"FuturSimple"`
	PasseCompose             []string `json:"PasseCompose"`
	PlusQueParfait           []string `json:"PlusQueParfait"`
	PasseAnterieur           []string `json:"PasseAnterieur"`
	FuturAnterieur           []string `json:"FuturAnterieur"`
	SubjonctifPresent        []string `json:"SubjonctifPresent"`
	SubjonctifImparfait      []string `json:"SubjonctifImparfait"`
	SubjonctifPasse          []string `json:"SubjonctifPasse"`
	SubjonctifPlusQueParfait []string `json:"SubjonctifPlusQueParfait"`
	ConditionnelPresent      []string `json:"ConditionnelPresent"`
	ConditionnelPasse        []string `json:"ConditionnelPasse"`
	ConditionnelPasseII      []string `json:"ConditionnelPasseII"`
	Imperatif                []string `json:"Imperatif"`
	ImperatifPasse           []string `json:"ImperatifPasse"`
}

func main() {
	fmt.Println("🚀 Starting French Verb Import")

	// Read JSON file
	file, err := os.Open("../conjugation.json")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	var verbs []VerbData
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&verbs); err != nil {
		log.Fatal(err)
	}

	fmt.Printf("📊 Found %d verbs to import\n", len(verbs))

	// Import verbs in batches
	batchSize := 10
	totalBatches := (len(verbs) + batchSize - 1) / batchSize

	for batch := 0; batch < totalBatches; batch++ {
		start := batch * batchSize
		end := start + batchSize
		if end > len(verbs) {
			end = len(verbs)
		}

		fmt.Printf("📝 Processing batch %d/%d (verbs %d-%d)\n", batch+1, totalBatches, start+1, end)

		if err := importBatch(verbs[start:end]); err != nil {
			log.Printf("Error in batch %d: %v", batch+1, err)
		}
	}

	// Verify
	fmt.Println("✅ Import completed! Verifying...")
	cmd := exec.Command("docker-compose", "exec", "postgres", "psql", "-U", "verber_user", "-d", "verber_db", "-c", "SELECT COUNT(*) AS total_verbs FROM verbs; SELECT COUNT(*) AS total_conjugations FROM verb_conjugations;")
	cmd.Dir = "../.."
	output, err := cmd.CombinedOutput()
	if err == nil {
		fmt.Printf("📈 Final counts:\n%s", string(output))
	}
}

func importBatch(verbs []VerbData) error {
	sqlCommands := []string{"BEGIN;"}

	for _, verb := range verbs {
		// Escape strings for SQL
		escape := func(s string) string {
			return strings.ReplaceAll(s, "'", "''")
		}

		// Insert verb
		sqlCommands = append(sqlCommands, fmt.Sprintf(
			"INSERT INTO verbs (infinitive, past_participle, present_participle, auxiliary, pronominal_form) VALUES ('%s', '%s', '%s', '%s', '%s');",
			escape(verb.Infinitif),
			escape(verb.ParticipePasse),
			escape(verb.ParticipePresent),
			escape(verb.Auxiliaire),
			escape(verb.FormePronominale),
		))

		// Get array value safely
		safeGet := func(arr []string, index int) string {
			if index < len(arr) && arr[index] != "" {
				return fmt.Sprintf("'%s'", escape(arr[index]))
			}
			return "NULL"
		}

		// Insert conjugation (using currval to get the ID from the verb we just inserted)
		sqlCommands = append(sqlCommands, fmt.Sprintf(`
INSERT INTO verb_conjugations (
    verb_id,
    present_1, present_2, present_3, present_4, present_5, present_6,
    imparfait_1, imparfait_2, imparfait_3, imparfait_4, imparfait_5, imparfait_6,
    passe_simple_1, passe_simple_2, passe_simple_3, passe_simple_4, passe_simple_5, passe_simple_6,
    futur_simple_1, futur_simple_2, futur_simple_3, futur_simple_4, futur_simple_5, futur_simple_6,
    passe_compose_1, passe_compose_2, passe_compose_3, passe_compose_4, passe_compose_5, passe_compose_6,
    plus_que_parfait_1, plus_que_parfait_2, plus_que_parfait_3, plus_que_parfait_4, plus_que_parfait_5, plus_que_parfait_6,
    passe_anterieur_1, passe_anterieur_2, passe_anterieur_3, passe_anterieur_4, passe_anterieur_5, passe_anterieur_6,
    futur_anterieur_1, futur_anterieur_2, futur_anterieur_3, futur_anterieur_4, futur_anterieur_5, futur_anterieur_6,
    subjonctif_present_1, subjonctif_present_2, subjonctif_present_3, subjonctif_present_4, subjonctif_present_5, subjonctif_present_6,
    subjonctif_imparfait_1, subjonctif_imparfait_2, subjonctif_imparfait_3, subjonctif_imparfait_4, subjonctif_imparfait_5, subjonctif_imparfait_6,
    subjonctif_passe_1, subjonctif_passe_2, subjonctif_passe_3, subjonctif_passe_4, subjonctif_passe_5, subjonctif_passe_6,
    subjonctif_plus_que_parfait_1, subjonctif_plus_que_parfait_2, subjonctif_plus_que_parfait_3, subjonctif_plus_que_parfait_4, subjonctif_plus_que_parfait_5, subjonctif_plus_que_parfait_6,
    conditionnel_present_1, conditionnel_present_2, conditionnel_present_3, conditionnel_present_4, conditionnel_present_5, conditionnel_present_6,
    conditionnel_passe_1, conditionnel_passe_2, conditionnel_passe_3, conditionnel_passe_4, conditionnel_passe_5, conditionnel_passe_6,
    conditionnel_passe_ii_1, conditionnel_passe_ii_2, conditionnel_passe_ii_3, conditionnel_passe_ii_4, conditionnel_passe_ii_5, conditionnel_passe_ii_6,
    imperatif_1, imperatif_2, imperatif_3, imperatif_4, imperatif_5, imperatif_6,
    imperatif_passe_1, imperatif_passe_2, imperatif_passe_3, imperatif_passe_4, imperatif_passe_5, imperatif_passe_6
) VALUES (
    currval('verbs_id_seq'),
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s,
    %s, %s, %s, %s, %s, %s
);`,
			// Present
			safeGet(verb.Present, 0), safeGet(verb.Present, 1), safeGet(verb.Present, 2), safeGet(verb.Present, 3), safeGet(verb.Present, 4), safeGet(verb.Present, 5),
			// Imparfait
			safeGet(verb.Imparfait, 0), safeGet(verb.Imparfait, 1), safeGet(verb.Imparfait, 2), safeGet(verb.Imparfait, 3), safeGet(verb.Imparfait, 4), safeGet(verb.Imparfait, 5),
			// PasseSimple
			safeGet(verb.PasseSimple, 0), safeGet(verb.PasseSimple, 1), safeGet(verb.PasseSimple, 2), safeGet(verb.PasseSimple, 3), safeGet(verb.PasseSimple, 4), safeGet(verb.PasseSimple, 5),
			// FuturSimple
			safeGet(verb.FuturSimple, 0), safeGet(verb.FuturSimple, 1), safeGet(verb.FuturSimple, 2), safeGet(verb.FuturSimple, 3), safeGet(verb.FuturSimple, 4), safeGet(verb.FuturSimple, 5),
			// PasseCompose
			safeGet(verb.PasseCompose, 0), safeGet(verb.PasseCompose, 1), safeGet(verb.PasseCompose, 2), safeGet(verb.PasseCompose, 3), safeGet(verb.PasseCompose, 4), safeGet(verb.PasseCompose, 5),
			// PlusQueParfait
			safeGet(verb.PlusQueParfait, 0), safeGet(verb.PlusQueParfait, 1), safeGet(verb.PlusQueParfait, 2), safeGet(verb.PlusQueParfait, 3), safeGet(verb.PlusQueParfait, 4), safeGet(verb.PlusQueParfait, 5),
			// PasseAnterieur
			safeGet(verb.PasseAnterieur, 0), safeGet(verb.PasseAnterieur, 1), safeGet(verb.PasseAnterieur, 2), safeGet(verb.PasseAnterieur, 3), safeGet(verb.PasseAnterieur, 4), safeGet(verb.PasseAnterieur, 5),
			// FuturAnterieur
			safeGet(verb.FuturAnterieur, 0), safeGet(verb.FuturAnterieur, 1), safeGet(verb.FuturAnterieur, 2), safeGet(verb.FuturAnterieur, 3), safeGet(verb.FuturAnterieur, 4), safeGet(verb.FuturAnterieur, 5),
			// SubjonctifPresent
			safeGet(verb.SubjonctifPresent, 0), safeGet(verb.SubjonctifPresent, 1), safeGet(verb.SubjonctifPresent, 2), safeGet(verb.SubjonctifPresent, 3), safeGet(verb.SubjonctifPresent, 4), safeGet(verb.SubjonctifPresent, 5),
			// SubjonctifImparfait
			safeGet(verb.SubjonctifImparfait, 0), safeGet(verb.SubjonctifImparfait, 1), safeGet(verb.SubjonctifImparfait, 2), safeGet(verb.SubjonctifImparfait, 3), safeGet(verb.SubjonctifImparfait, 4), safeGet(verb.SubjonctifImparfait, 5),
			// SubjonctifPasse
			safeGet(verb.SubjonctifPasse, 0), safeGet(verb.SubjonctifPasse, 1), safeGet(verb.SubjonctifPasse, 2), safeGet(verb.SubjonctifPasse, 3), safeGet(verb.SubjonctifPasse, 4), safeGet(verb.SubjonctifPasse, 5),
			// SubjonctifPlusQueParfait
			safeGet(verb.SubjonctifPlusQueParfait, 0), safeGet(verb.SubjonctifPlusQueParfait, 1), safeGet(verb.SubjonctifPlusQueParfait, 2), safeGet(verb.SubjonctifPlusQueParfait, 3), safeGet(verb.SubjonctifPlusQueParfait, 4), safeGet(verb.SubjonctifPlusQueParfait, 5),
			// ConditionnelPresent
			safeGet(verb.ConditionnelPresent, 0), safeGet(verb.ConditionnelPresent, 1), safeGet(verb.ConditionnelPresent, 2), safeGet(verb.ConditionnelPresent, 3), safeGet(verb.ConditionnelPresent, 4), safeGet(verb.ConditionnelPresent, 5),
			// ConditionnelPasse
			safeGet(verb.ConditionnelPasse, 0), safeGet(verb.ConditionnelPasse, 1), safeGet(verb.ConditionnelPasse, 2), safeGet(verb.ConditionnelPasse, 3), safeGet(verb.ConditionnelPasse, 4), safeGet(verb.ConditionnelPasse, 5),
			// ConditionnelPasseII
			safeGet(verb.ConditionnelPasseII, 0), safeGet(verb.ConditionnelPasseII, 1), safeGet(verb.ConditionnelPasseII, 2), safeGet(verb.ConditionnelPasseII, 3), safeGet(verb.ConditionnelPasseII, 4), safeGet(verb.ConditionnelPasseII, 5),
			// Imperatif
			safeGet(verb.Imperatif, 0), safeGet(verb.Imperatif, 1), safeGet(verb.Imperatif, 2), safeGet(verb.Imperatif, 3), safeGet(verb.Imperatif, 4), safeGet(verb.Imperatif, 5),
			// ImperatifPasse
			safeGet(verb.ImperatifPasse, 0), safeGet(verb.ImperatifPasse, 1), safeGet(verb.ImperatifPasse, 2), safeGet(verb.ImperatifPasse, 3), safeGet(verb.ImperatifPasse, 4), safeGet(verb.ImperatifPasse, 5),
		))
	}

	sqlCommands = append(sqlCommands, "COMMIT;")

	// Execute batch
	cmd := exec.Command("docker-compose", "exec", "-T", "postgres", "psql", "-U", "verber_user", "-d", "verber_db")
	cmd.Dir = "../.."
	cmd.Stdin = strings.NewReader(strings.Join(sqlCommands, "\n"))

	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("SQL execution failed: %v\nOutput: %s", err, string(output))
	}

	return nil
}
