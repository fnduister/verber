package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
)

// VerbData structures matching the JSON format
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
	fmt.Println("🚀 Starting French Verb Import Process")
	fmt.Println("========================================")

	// Read the conjugation.json file
	jsonFile, err := os.Open("../conjugation.json")
	if err != nil {
		log.Fatal("Failed to open conjugation.json:", err)
	}
	defer jsonFile.Close()

	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		log.Fatal("Failed to read conjugation.json:", err)
	}

	var verbsData []VerbData
	err = json.Unmarshal(byteValue, &verbsData)
	if err != nil {
		log.Fatal("Failed to parse conjugation.json:", err)
	}

	fmt.Printf("📊 Found %d verbs to import\n", len(verbsData))

	// Create SQL script to insert data
	fmt.Println("🔧 Creating SQL import script...")

	sqlFile, err := os.Create("import_verbs.sql")
	if err != nil {
		log.Fatal("Failed to create SQL file:", err)
	}
	defer sqlFile.Close()

	// Write header
	sqlFile.WriteString("-- Auto-generated SQL script to import French verbs\n")
	sqlFile.WriteString("BEGIN;\n\n")
	sqlFile.WriteString("-- Clear existing data\n")
	sqlFile.WriteString("DELETE FROM verb_conjugations;\n")
	sqlFile.WriteString("DELETE FROM verbs;\n")
	sqlFile.WriteString("ALTER SEQUENCE verbs_id_seq RESTART WITH 1;\n")
	sqlFile.WriteString("ALTER SEQUENCE verb_conjugations_id_seq RESTART WITH 1;\n\n")

	// Helper function to escape single quotes in SQL
	escape := func(s string) string {
		return fmt.Sprintf("'%s'", fmt.Sprintf("%q", s)[1:len(fmt.Sprintf("%q", s))-1])
	}

	// Helper function to safely get array elements
	safeGet := func(arr []string, index int) string {
		if index < len(arr) {
			return escape(arr[index])
		}
		return "NULL"
	}

	verbID := 1
	for _, verbData := range verbsData {
		// Insert verb
		sqlFile.WriteString(fmt.Sprintf(
			"INSERT INTO verbs (id, infinitive, past_participle, present_participle, auxiliary, pronominal_form, created_at, updated_at) VALUES (%d, %s, %s, %s, %s, %s, NOW(), NOW());\n",
			verbID,
			escape(verbData.Infinitif),
			escape(verbData.ParticipePasse),
			escape(verbData.ParticipePresent),
			escape(verbData.Auxiliaire),
			escape(verbData.FormePronominale),
		))

		// Insert conjugations
		sqlFile.WriteString(fmt.Sprintf(`INSERT INTO verb_conjugations (
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
			%d,
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
		);
`,
			verbID,
			// Present
			safeGet(verbData.Present, 0), safeGet(verbData.Present, 1), safeGet(verbData.Present, 2),
			safeGet(verbData.Present, 3), safeGet(verbData.Present, 4), safeGet(verbData.Present, 5),
			// Imparfait
			safeGet(verbData.Imparfait, 0), safeGet(verbData.Imparfait, 1), safeGet(verbData.Imparfait, 2),
			safeGet(verbData.Imparfait, 3), safeGet(verbData.Imparfait, 4), safeGet(verbData.Imparfait, 5),
			// Passé Simple
			safeGet(verbData.PasseSimple, 0), safeGet(verbData.PasseSimple, 1), safeGet(verbData.PasseSimple, 2),
			safeGet(verbData.PasseSimple, 3), safeGet(verbData.PasseSimple, 4), safeGet(verbData.PasseSimple, 5),
			// Futur Simple
			safeGet(verbData.FuturSimple, 0), safeGet(verbData.FuturSimple, 1), safeGet(verbData.FuturSimple, 2),
			safeGet(verbData.FuturSimple, 3), safeGet(verbData.FuturSimple, 4), safeGet(verbData.FuturSimple, 5),
			// Passé Composé
			safeGet(verbData.PasseCompose, 0), safeGet(verbData.PasseCompose, 1), safeGet(verbData.PasseCompose, 2),
			safeGet(verbData.PasseCompose, 3), safeGet(verbData.PasseCompose, 4), safeGet(verbData.PasseCompose, 5),
			// Plus-que-parfait
			safeGet(verbData.PlusQueParfait, 0), safeGet(verbData.PlusQueParfait, 1), safeGet(verbData.PlusQueParfait, 2),
			safeGet(verbData.PlusQueParfait, 3), safeGet(verbData.PlusQueParfait, 4), safeGet(verbData.PlusQueParfait, 5),
			// Passé Antérieur
			safeGet(verbData.PasseAnterieur, 0), safeGet(verbData.PasseAnterieur, 1), safeGet(verbData.PasseAnterieur, 2),
			safeGet(verbData.PasseAnterieur, 3), safeGet(verbData.PasseAnterieur, 4), safeGet(verbData.PasseAnterieur, 5),
			// Futur Antérieur
			safeGet(verbData.FuturAnterieur, 0), safeGet(verbData.FuturAnterieur, 1), safeGet(verbData.FuturAnterieur, 2),
			safeGet(verbData.FuturAnterieur, 3), safeGet(verbData.FuturAnterieur, 4), safeGet(verbData.FuturAnterieur, 5),
			// Subjonctif Présent
			safeGet(verbData.SubjonctifPresent, 0), safeGet(verbData.SubjonctifPresent, 1), safeGet(verbData.SubjonctifPresent, 2),
			safeGet(verbData.SubjonctifPresent, 3), safeGet(verbData.SubjonctifPresent, 4), safeGet(verbData.SubjonctifPresent, 5),
			// Subjonctif Imparfait
			safeGet(verbData.SubjonctifImparfait, 0), safeGet(verbData.SubjonctifImparfait, 1), safeGet(verbData.SubjonctifImparfait, 2),
			safeGet(verbData.SubjonctifImparfait, 3), safeGet(verbData.SubjonctifImparfait, 4), safeGet(verbData.SubjonctifImparfait, 5),
			// Subjonctif Passé
			safeGet(verbData.SubjonctifPasse, 0), safeGet(verbData.SubjonctifPasse, 1), safeGet(verbData.SubjonctifPasse, 2),
			safeGet(verbData.SubjonctifPasse, 3), safeGet(verbData.SubjonctifPasse, 4), safeGet(verbData.SubjonctifPasse, 5),
			// Subjonctif Plus-que-parfait
			safeGet(verbData.SubjonctifPlusQueParfait, 0), safeGet(verbData.SubjonctifPlusQueParfait, 1), safeGet(verbData.SubjonctifPlusQueParfait, 2),
			safeGet(verbData.SubjonctifPlusQueParfait, 3), safeGet(verbData.SubjonctifPlusQueParfait, 4), safeGet(verbData.SubjonctifPlusQueParfait, 5),
			// Conditionnel Présent
			safeGet(verbData.ConditionnelPresent, 0), safeGet(verbData.ConditionnelPresent, 1), safeGet(verbData.ConditionnelPresent, 2),
			safeGet(verbData.ConditionnelPresent, 3), safeGet(verbData.ConditionnelPresent, 4), safeGet(verbData.ConditionnelPresent, 5),
			// Conditionnel Passé
			safeGet(verbData.ConditionnelPasse, 0), safeGet(verbData.ConditionnelPasse, 1), safeGet(verbData.ConditionnelPasse, 2),
			safeGet(verbData.ConditionnelPasse, 3), safeGet(verbData.ConditionnelPasse, 4), safeGet(verbData.ConditionnelPasse, 5),
			// Conditionnel Passé II
			safeGet(verbData.ConditionnelPasseII, 0), safeGet(verbData.ConditionnelPasseII, 1), safeGet(verbData.ConditionnelPasseII, 2),
			safeGet(verbData.ConditionnelPasseII, 3), safeGet(verbData.ConditionnelPasseII, 4), safeGet(verbData.ConditionnelPasseII, 5),
			// Impératif
			safeGet(verbData.Imperatif, 0), safeGet(verbData.Imperatif, 1), safeGet(verbData.Imperatif, 2),
			safeGet(verbData.Imperatif, 3), safeGet(verbData.Imperatif, 4), safeGet(verbData.Imperatif, 5),
			// Impératif Passé
			safeGet(verbData.ImperatifPasse, 0), safeGet(verbData.ImperatifPasse, 1), safeGet(verbData.ImperatifPasse, 2),
			safeGet(verbData.ImperatifPasse, 3), safeGet(verbData.ImperatifPasse, 4), safeGet(verbData.ImperatifPasse, 5),
		))

		verbID++

		// Progress indicator
		if verbID%50 == 0 || verbID-1 == len(verbsData) {
			fmt.Printf("📝 Generated SQL for %d/%d verbs\n", verbID-1, len(verbsData))
		}
	}

	sqlFile.WriteString("\nCOMMIT;\n")
	sqlFile.WriteString("\n-- Verification queries\n")
	sqlFile.WriteString("SELECT COUNT(*) AS total_verbs FROM verbs;\n")
	sqlFile.WriteString("SELECT COUNT(*) AS total_conjugations FROM verb_conjugations;\n")
	sqlFile.WriteString("SELECT infinitive FROM verbs LIMIT 5;\n")

	fmt.Println("✅ SQL script generated: import_verbs.sql")

	// Execute the SQL script
	fmt.Println("🚀 Executing SQL script...")
	cmd := exec.Command("docker-compose", "exec", "-T", "postgres", "psql", "-U", "verber_user", "-d", "verber_db", "-f", "-")
	cmd.Dir = "../.."

	// Open the SQL file and pipe it to the command
	sqlFile.Close()
	sqlContent, _ := ioutil.ReadFile("import_verbs.sql")
	cmd.Stdin = fmt.NewReader(string(sqlContent))

	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("❌ Error executing SQL: %v\n", err)
		fmt.Printf("Output: %s\n", string(output))
		return
	}

	fmt.Printf("✅ Import completed successfully!\n")
	fmt.Printf("Database output:\n%s\n", string(output))
}
