package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Structures matching the JSON format
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

// Database models (simplified for import)
type Verb struct {
	ID                uint   `gorm:"primaryKey"`
	Infinitive        string `gorm:"uniqueIndex;not null"`
	PastParticiple    string
	PresentParticiple string
	Auxiliary         string
	PronomininalForm  string
}

type VerbConjugation struct {
	ID                        uint `gorm:"primaryKey"`
	VerbID                    uint
	Present1                  string `gorm:"column:present_1"`
	Present2                  string `gorm:"column:present_2"`
	Present3                  string `gorm:"column:present_3"`
	Present4                  string `gorm:"column:present_4"`
	Present5                  string `gorm:"column:present_5"`
	Present6                  string `gorm:"column:present_6"`
	Imparfait1                string `gorm:"column:imparfait_1"`
	Imparfait2                string `gorm:"column:imparfait_2"`
	Imparfait3                string `gorm:"column:imparfait_3"`
	Imparfait4                string `gorm:"column:imparfait_4"`
	Imparfait5                string `gorm:"column:imparfait_5"`
	Imparfait6                string `gorm:"column:imparfait_6"`
	PasseSimple1              string `gorm:"column:passe_simple_1"`
	PasseSimple2              string `gorm:"column:passe_simple_2"`
	PasseSimple3              string `gorm:"column:passe_simple_3"`
	PasseSimple4              string `gorm:"column:passe_simple_4"`
	PasseSimple5              string `gorm:"column:passe_simple_5"`
	PasseSimple6              string `gorm:"column:passe_simple_6"`
	FuturSimple1              string `gorm:"column:futur_simple_1"`
	FuturSimple2              string `gorm:"column:futur_simple_2"`
	FuturSimple3              string `gorm:"column:futur_simple_3"`
	FuturSimple4              string `gorm:"column:futur_simple_4"`
	FuturSimple5              string `gorm:"column:futur_simple_5"`
	FuturSimple6              string `gorm:"column:futur_simple_6"`
	PasseCompose1             string `gorm:"column:passe_compose_1"`
	PasseCompose2             string `gorm:"column:passe_compose_2"`
	PasseCompose3             string `gorm:"column:passe_compose_3"`
	PasseCompose4             string `gorm:"column:passe_compose_4"`
	PasseCompose5             string `gorm:"column:passe_compose_5"`
	PasseCompose6             string `gorm:"column:passe_compose_6"`
	PlusQueParfait1           string `gorm:"column:plus_que_parfait_1"`
	PlusQueParfait2           string `gorm:"column:plus_que_parfait_2"`
	PlusQueParfait3           string `gorm:"column:plus_que_parfait_3"`
	PlusQueParfait4           string `gorm:"column:plus_que_parfait_4"`
	PlusQueParfait5           string `gorm:"column:plus_que_parfait_5"`
	PlusQueParfait6           string `gorm:"column:plus_que_parfait_6"`
	PasseAnterieur1           string `gorm:"column:passe_anterieur_1"`
	PasseAnterieur2           string `gorm:"column:passe_anterieur_2"`
	PasseAnterieur3           string `gorm:"column:passe_anterieur_3"`
	PasseAnterieur4           string `gorm:"column:passe_anterieur_4"`
	PasseAnterieur5           string `gorm:"column:passe_anterieur_5"`
	PasseAnterieur6           string `gorm:"column:passe_anterieur_6"`
	FuturAnterieur1           string `gorm:"column:futur_anterieur_1"`
	FuturAnterieur2           string `gorm:"column:futur_anterieur_2"`
	FuturAnterieur3           string `gorm:"column:futur_anterieur_3"`
	FuturAnterieur4           string `gorm:"column:futur_anterieur_4"`
	FuturAnterieur5           string `gorm:"column:futur_anterieur_5"`
	FuturAnterieur6           string `gorm:"column:futur_anterieur_6"`
	SubjonctifPresent1        string `gorm:"column:subjonctif_present_1"`
	SubjonctifPresent2        string `gorm:"column:subjonctif_present_2"`
	SubjonctifPresent3        string `gorm:"column:subjonctif_present_3"`
	SubjonctifPresent4        string `gorm:"column:subjonctif_present_4"`
	SubjonctifPresent5        string `gorm:"column:subjonctif_present_5"`
	SubjonctifPresent6        string `gorm:"column:subjonctif_present_6"`
	SubjonctifImparfait1      string `gorm:"column:subjonctif_imparfait_1"`
	SubjonctifImparfait2      string `gorm:"column:subjonctif_imparfait_2"`
	SubjonctifImparfait3      string `gorm:"column:subjonctif_imparfait_3"`
	SubjonctifImparfait4      string `gorm:"column:subjonctif_imparfait_4"`
	SubjonctifImparfait5      string `gorm:"column:subjonctif_imparfait_5"`
	SubjonctifImparfait6      string `gorm:"column:subjonctif_imparfait_6"`
	SubjonctifPasse1          string `gorm:"column:subjonctif_passe_1"`
	SubjonctifPasse2          string `gorm:"column:subjonctif_passe_2"`
	SubjonctifPasse3          string `gorm:"column:subjonctif_passe_3"`
	SubjonctifPasse4          string `gorm:"column:subjonctif_passe_4"`
	SubjonctifPasse5          string `gorm:"column:subjonctif_passe_5"`
	SubjonctifPasse6          string `gorm:"column:subjonctif_passe_6"`
	SubjonctifPlusQueParfait1 string `gorm:"column:subjonctif_plus_que_parfait_1"`
	SubjonctifPlusQueParfait2 string `gorm:"column:subjonctif_plus_que_parfait_2"`
	SubjonctifPlusQueParfait3 string `gorm:"column:subjonctif_plus_que_parfait_3"`
	SubjonctifPlusQueParfait4 string `gorm:"column:subjonctif_plus_que_parfait_4"`
	SubjonctifPlusQueParfait5 string `gorm:"column:subjonctif_plus_que_parfait_5"`
	SubjonctifPlusQueParfait6 string `gorm:"column:subjonctif_plus_que_parfait_6"`
	ConditionnelPresent1      string `gorm:"column:conditionnel_present_1"`
	ConditionnelPresent2      string `gorm:"column:conditionnel_present_2"`
	ConditionnelPresent3      string `gorm:"column:conditionnel_present_3"`
	ConditionnelPresent4      string `gorm:"column:conditionnel_present_4"`
	ConditionnelPresent5      string `gorm:"column:conditionnel_present_5"`
	ConditionnelPresent6      string `gorm:"column:conditionnel_present_6"`
	ConditionnelPasse1        string `gorm:"column:conditionnel_passe_1"`
	ConditionnelPasse2        string `gorm:"column:conditionnel_passe_2"`
	ConditionnelPasse3        string `gorm:"column:conditionnel_passe_3"`
	ConditionnelPasse4        string `gorm:"column:conditionnel_passe_4"`
	ConditionnelPasse5        string `gorm:"column:conditionnel_passe_5"`
	ConditionnelPasse6        string `gorm:"column:conditionnel_passe_6"`
	ConditionnelPasseII1      string `gorm:"column:conditionnel_passe_ii_1"`
	ConditionnelPasseII2      string `gorm:"column:conditionnel_passe_ii_2"`
	ConditionnelPasseII3      string `gorm:"column:conditionnel_passe_ii_3"`
	ConditionnelPasseII4      string `gorm:"column:conditionnel_passe_ii_4"`
	ConditionnelPasseII5      string `gorm:"column:conditionnel_passe_ii_5"`
	ConditionnelPasseII6      string `gorm:"column:conditionnel_passe_ii_6"`
	Imperatif1                string `gorm:"column:imperatif_1"`
	Imperatif2                string `gorm:"column:imperatif_2"`
	Imperatif3                string `gorm:"column:imperatif_3"`
	Imperatif4                string `gorm:"column:imperatif_4"`
	Imperatif5                string `gorm:"column:imperatif_5"`
	Imperatif6                string `gorm:"column:imperatif_6"`
	ImperatifPasse1           string `gorm:"column:imperatif_passe_1"`
	ImperatifPasse2           string `gorm:"column:imperatif_passe_2"`
	ImperatifPasse3           string `gorm:"column:imperatif_passe_3"`
	ImperatifPasse4           string `gorm:"column:imperatif_passe_4"`
	ImperatifPasse5           string `gorm:"column:imperatif_passe_5"`
	ImperatifPasse6           string `gorm:"column:imperatif_passe_6"`
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Database connection using environment variable
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "host=localhost user=verber_user password=verber_password_change_this dbname=verber_db port=5432 sslmode=disable TimeZone=UTC"
	}
	
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("Connected to database successfully!")

	// Read the conjugation.json file
	jsonFile, err := os.Open("conjugation.json")
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

	fmt.Printf("Found %d verbs to import\n", len(verbsData))

	// Migrate the tables
	fmt.Println("Running database migrations...")
	err = db.AutoMigrate(&Verb{}, &VerbConjugation{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Clear existing data
	fmt.Println("Clearing existing verb data...")
	db.Exec("DELETE FROM verb_conjugations")
	db.Exec("DELETE FROM verbs")
	db.Exec("ALTER SEQUENCE verbs_id_seq RESTART WITH 1")
	db.Exec("ALTER SEQUENCE verb_conjugations_id_seq RESTART WITH 1")

	fmt.Println("Starting import process...")

	successCount := 0
	errorCount := 0

	for i, verbData := range verbsData {
		// Create verb record
		verb := Verb{
			Infinitive:        verbData.Infinitif,
			PastParticiple:    verbData.ParticipePasse,
			PresentParticiple: verbData.ParticipePresent,
			Auxiliary:         verbData.Auxiliaire,
			PronomininalForm:  verbData.FormePronominale,
		}

		result := db.Create(&verb)
		if result.Error != nil {
			fmt.Printf("Error creating verb %s: %v\n", verbData.Infinitif, result.Error)
			errorCount++
			continue
		}

		// Helper function to safely get array elements
		safeGet := func(arr []string, index int) string {
			if index < len(arr) {
				return arr[index]
			}
			return ""
		}

		// Create conjugation record
		conjugation := VerbConjugation{
			VerbID: verb.ID,
			// Present
			Present1: safeGet(verbData.Present, 0),
			Present2: safeGet(verbData.Present, 1),
			Present3: safeGet(verbData.Present, 2),
			Present4: safeGet(verbData.Present, 3),
			Present5: safeGet(verbData.Present, 4),
			Present6: safeGet(verbData.Present, 5),
			// Imparfait
			Imparfait1: safeGet(verbData.Imparfait, 0),
			Imparfait2: safeGet(verbData.Imparfait, 1),
			Imparfait3: safeGet(verbData.Imparfait, 2),
			Imparfait4: safeGet(verbData.Imparfait, 3),
			Imparfait5: safeGet(verbData.Imparfait, 4),
			Imparfait6: safeGet(verbData.Imparfait, 5),
			// Passé Simple
			PasseSimple1: safeGet(verbData.PasseSimple, 0),
			PasseSimple2: safeGet(verbData.PasseSimple, 1),
			PasseSimple3: safeGet(verbData.PasseSimple, 2),
			PasseSimple4: safeGet(verbData.PasseSimple, 3),
			PasseSimple5: safeGet(verbData.PasseSimple, 4),
			PasseSimple6: safeGet(verbData.PasseSimple, 5),
			// Futur Simple
			FuturSimple1: safeGet(verbData.FuturSimple, 0),
			FuturSimple2: safeGet(verbData.FuturSimple, 1),
			FuturSimple3: safeGet(verbData.FuturSimple, 2),
			FuturSimple4: safeGet(verbData.FuturSimple, 3),
			FuturSimple5: safeGet(verbData.FuturSimple, 4),
			FuturSimple6: safeGet(verbData.FuturSimple, 5),
			// Passé Composé
			PasseCompose1: safeGet(verbData.PasseCompose, 0),
			PasseCompose2: safeGet(verbData.PasseCompose, 1),
			PasseCompose3: safeGet(verbData.PasseCompose, 2),
			PasseCompose4: safeGet(verbData.PasseCompose, 3),
			PasseCompose5: safeGet(verbData.PasseCompose, 4),
			PasseCompose6: safeGet(verbData.PasseCompose, 5),
			// Plus-que-parfait
			PlusQueParfait1: safeGet(verbData.PlusQueParfait, 0),
			PlusQueParfait2: safeGet(verbData.PlusQueParfait, 1),
			PlusQueParfait3: safeGet(verbData.PlusQueParfait, 2),
			PlusQueParfait4: safeGet(verbData.PlusQueParfait, 3),
			PlusQueParfait5: safeGet(verbData.PlusQueParfait, 4),
			PlusQueParfait6: safeGet(verbData.PlusQueParfait, 5),
			// Passé Antérieur
			PasseAnterieur1: safeGet(verbData.PasseAnterieur, 0),
			PasseAnterieur2: safeGet(verbData.PasseAnterieur, 1),
			PasseAnterieur3: safeGet(verbData.PasseAnterieur, 2),
			PasseAnterieur4: safeGet(verbData.PasseAnterieur, 3),
			PasseAnterieur5: safeGet(verbData.PasseAnterieur, 4),
			PasseAnterieur6: safeGet(verbData.PasseAnterieur, 5),
			// Futur Antérieur
			FuturAnterieur1: safeGet(verbData.FuturAnterieur, 0),
			FuturAnterieur2: safeGet(verbData.FuturAnterieur, 1),
			FuturAnterieur3: safeGet(verbData.FuturAnterieur, 2),
			FuturAnterieur4: safeGet(verbData.FuturAnterieur, 3),
			FuturAnterieur5: safeGet(verbData.FuturAnterieur, 4),
			FuturAnterieur6: safeGet(verbData.FuturAnterieur, 5),
			// Subjonctif Présent
			SubjonctifPresent1: safeGet(verbData.SubjonctifPresent, 0),
			SubjonctifPresent2: safeGet(verbData.SubjonctifPresent, 1),
			SubjonctifPresent3: safeGet(verbData.SubjonctifPresent, 2),
			SubjonctifPresent4: safeGet(verbData.SubjonctifPresent, 3),
			SubjonctifPresent5: safeGet(verbData.SubjonctifPresent, 4),
			SubjonctifPresent6: safeGet(verbData.SubjonctifPresent, 5),
			// Subjonctif Imparfait
			SubjonctifImparfait1: safeGet(verbData.SubjonctifImparfait, 0),
			SubjonctifImparfait2: safeGet(verbData.SubjonctifImparfait, 1),
			SubjonctifImparfait3: safeGet(verbData.SubjonctifImparfait, 2),
			SubjonctifImparfait4: safeGet(verbData.SubjonctifImparfait, 3),
			SubjonctifImparfait5: safeGet(verbData.SubjonctifImparfait, 4),
			SubjonctifImparfait6: safeGet(verbData.SubjonctifImparfait, 5),
			// Subjonctif Passé
			SubjonctifPasse1: safeGet(verbData.SubjonctifPasse, 0),
			SubjonctifPasse2: safeGet(verbData.SubjonctifPasse, 1),
			SubjonctifPasse3: safeGet(verbData.SubjonctifPasse, 2),
			SubjonctifPasse4: safeGet(verbData.SubjonctifPasse, 3),
			SubjonctifPasse5: safeGet(verbData.SubjonctifPasse, 4),
			SubjonctifPasse6: safeGet(verbData.SubjonctifPasse, 5),
			// Subjonctif Plus-que-parfait
			SubjonctifPlusQueParfait1: safeGet(verbData.SubjonctifPlusQueParfait, 0),
			SubjonctifPlusQueParfait2: safeGet(verbData.SubjonctifPlusQueParfait, 1),
			SubjonctifPlusQueParfait3: safeGet(verbData.SubjonctifPlusQueParfait, 2),
			SubjonctifPlusQueParfait4: safeGet(verbData.SubjonctifPlusQueParfait, 3),
			SubjonctifPlusQueParfait5: safeGet(verbData.SubjonctifPlusQueParfait, 4),
			SubjonctifPlusQueParfait6: safeGet(verbData.SubjonctifPlusQueParfait, 5),
			// Conditionnel Présent
			ConditionnelPresent1: safeGet(verbData.ConditionnelPresent, 0),
			ConditionnelPresent2: safeGet(verbData.ConditionnelPresent, 1),
			ConditionnelPresent3: safeGet(verbData.ConditionnelPresent, 2),
			ConditionnelPresent4: safeGet(verbData.ConditionnelPresent, 3),
			ConditionnelPresent5: safeGet(verbData.ConditionnelPresent, 4),
			ConditionnelPresent6: safeGet(verbData.ConditionnelPresent, 5),
			// Conditionnel Passé
			ConditionnelPasse1: safeGet(verbData.ConditionnelPasse, 0),
			ConditionnelPasse2: safeGet(verbData.ConditionnelPasse, 1),
			ConditionnelPasse3: safeGet(verbData.ConditionnelPasse, 2),
			ConditionnelPasse4: safeGet(verbData.ConditionnelPasse, 3),
			ConditionnelPasse5: safeGet(verbData.ConditionnelPasse, 4),
			ConditionnelPasse6: safeGet(verbData.ConditionnelPasse, 5),
			// Conditionnel Passé II
			ConditionnelPasseII1: safeGet(verbData.ConditionnelPasseII, 0),
			ConditionnelPasseII2: safeGet(verbData.ConditionnelPasseII, 1),
			ConditionnelPasseII3: safeGet(verbData.ConditionnelPasseII, 2),
			ConditionnelPasseII4: safeGet(verbData.ConditionnelPasseII, 3),
			ConditionnelPasseII5: safeGet(verbData.ConditionnelPasseII, 4),
			ConditionnelPasseII6: safeGet(verbData.ConditionnelPasseII, 5),
			// Impératif
			Imperatif1: safeGet(verbData.Imperatif, 0),
			Imperatif2: safeGet(verbData.Imperatif, 1),
			Imperatif3: safeGet(verbData.Imperatif, 2),
			Imperatif4: safeGet(verbData.Imperatif, 3),
			Imperatif5: safeGet(verbData.Imperatif, 4),
			Imperatif6: safeGet(verbData.Imperatif, 5),
			// Impératif Passé
			ImperatifPasse1: safeGet(verbData.ImperatifPasse, 0),
			ImperatifPasse2: safeGet(verbData.ImperatifPasse, 1),
			ImperatifPasse3: safeGet(verbData.ImperatifPasse, 2),
			ImperatifPasse4: safeGet(verbData.ImperatifPasse, 3),
			ImperatifPasse5: safeGet(verbData.ImperatifPasse, 4),
			ImperatifPasse6: safeGet(verbData.ImperatifPasse, 5),
		}

		result = db.Create(&conjugation)
		if result.Error != nil {
			fmt.Printf("Error creating conjugation for verb %s: %v\n", verbData.Infinitif, result.Error)
			errorCount++
			continue
		}

		successCount++

		// Progress indicator
		if (i+1)%50 == 0 || i+1 == len(verbsData) {
			fmt.Printf("Progress: %d/%d verbs processed (Success: %d, Errors: %d)\n",
				i+1, len(verbsData), successCount, errorCount)
		}
	}

	fmt.Printf("\nImport completed!\n")
	fmt.Printf("Total verbs: %d\n", len(verbsData))
	fmt.Printf("Successfully imported: %d\n", successCount)
	fmt.Printf("Errors: %d\n", errorCount)

	// Verify the import
	var verbCount int64
	var conjugationCount int64
	db.Model(&Verb{}).Count(&verbCount)
	db.Model(&VerbConjugation{}).Count(&conjugationCount)

	fmt.Printf("\nVerification:\n")
	fmt.Printf("Verbs in database: %d\n", verbCount)
	fmt.Printf("Conjugations in database: %d\n", conjugationCount)
}
