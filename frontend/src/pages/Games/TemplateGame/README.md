# Game Template

This template provides a complete foundation for creating new games in the Verber application.

## Features Included

### Core Functionality

- ✅ **Timer Management**: Countdown timer with pause/resume
- ✅ **Score Tracking**: Points calculation based on speed and accuracy
- ✅ **Game Header**: Displays progress, score, and timer
- ✅ **Configuration Integration**: Automatically uses settings from GameRoom
- ✅ **Error Handling**: Graceful error display and recovery
- ✅ **Audio Feedback**: Success/failure sounds
- ✅ **Pause System**: Full pause/resume with overlay
- ✅ **Answer Review**: Show correct/incorrect with explanations
- ✅ **Game Flow**: Question → Answer → Review → Next
- ✅ **Responsive Design**: Mobile-friendly UI
- ✅ **Animations**: Smooth transitions with Framer Motion

### Configuration from GameRoom

The template automatically receives:

- `currentVerbs`: Selected verbs for the game
- `currentTenses`: Selected tenses for conjugation
- `ongoingGameInfo`: Game settings (maxStep, maxTime, duration)
- `allVerbs`: Complete verb database with conjugations

## How to Use This Template

### 1. Copy and Rename

```bash
cp -r TemplateGame YourNewGame
```

### 2. Update Game Logic

#### A. Define Your Question Structure

```typescript
interface GameQuestion {
  // Add fields specific to your game
  verb: string;
  tense: string;
  // ... other fields
  correctAnswer: string;
}
```

#### B. Implement Question Generation

In the `initializeGame()` function:

```typescript
for (let i = 0; i < maxSteps; i++) {
  // Generate your question
  const question: GameQuestion = {
    // Your logic here
  };
  questions.push(question);
}
```

#### C. Implement Answer Checking

In the `checkAnswer()` function:

```typescript
const correct = // Your comparison logic
  answer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
```

### 3. Update the UI

#### A. Question Display

Update the question prompt section:

```tsx
<Typography variant="h5" align="center" fontWeight="bold">
  {/* Your question UI */}
</Typography>
```

#### B. Input Method

Modify the input section if you need:

- Multiple inputs
- Dropdown selections
- Multiple choice buttons
- Drag and drop
- etc.

### 4. Add Translations

Add your game-specific text to translation files:

**en.json:**

```json
{
  "games": {
    "yourGame": {
      "title": "Your Game Name",
      "description": "Description",
      "prompt": "Question prompt"
    }
  }
}
```

**fr.json:**

```json
{
  "games": {
    "yourGame": {
      "title": "Nom du Jeu",
      "description": "Description",
      "prompt": "Question"
    }
  }
}
```

### 5. Register Your Game

#### A. Add to GAME_METADATA (constants/gameConstants.tsx)

```typescript
export const GAME_METADATA: { [key: string]: GameMetadata } = {
  // ... existing games
  yourGame: {
    id: "yourGame",
    title: "Your Game Name",
    description: "Game description",
    icon: YourIcon,
    color: "#yourColor",
    difficulty: "medium",
    minPlayers: 1,
    maxPlayers: 1,
    estimatedTime: 5,
    category: "conjugation",
    features: ["timer", "scoring", "multiplayer"],
  },
};
```

#### B. Add Route (App.tsx)

```tsx
import YourGame from "./pages/Games/YourGame";

// In routes:
<Route path="/games/your-game" element={<YourGame />} />;
```

#### C. Add to GameRoom Options

Update GameRoom.tsx to include your game in the game type selector.

## Game State Management

### Redux Selectors Available

```typescript
// Get game configuration
const currentVerbs = useSelector((state: RootState) => state.game.currentVerbs);
const currentTenses = useSelector(
  (state: RootState) => state.game.currentTenses
);
const ongoingGameInfo = useSelector(
  (state: RootState) => state.game.ongoingGameInfo
);

// Get verb data
const allVerbs = useSelector((state: RootState) => state.verb.verbs);

// Additional selectors available:
// - currentDifficulty
// - currentVerbGroups
// - currentTenseGroups
// - currentParticipeTypes (for participle games)
// - currentSentenceDifficulty (for sentence games)
```

### Important Refs

```typescript
timerRef; // Manages the countdown timer interval
inputRef; // Focus management for input fields
userAnswerRef; // Stores current answer without triggering re-renders
pauseTimeRef; // Stores time remaining when paused
```

## Timer Behavior

The timer:

- Counts down from `ongoingGameInfo.maxTime`
- Pauses when game is paused
- Stops when answer is shown
- Resets for each new question
- Auto-checks answer when reaching 0

## Scoring System

Default scoring:

```typescript
const earnedPoints = Math.ceil((timeLeft / ongoingGameInfo.maxTime) * 100);
```

This gives:

- 100 points for instant correct answers
- Fewer points for slower answers
- 0 points for incorrect answers

You can customize the scoring formula as needed.

## Error Handling

The template includes:

- Configuration validation (verbs, tenses selected)
- Data validation (verb conjugations exist)
- Graceful error display with navigation back
- Try-catch blocks around initialization

Add your own validation as needed:

```typescript
if (!someCondition) {
  throw new Error(t("games.error.yourError"));
}
```

## Audio Hooks

```typescript
const { playSuccess, playFailure } = useAudio();

// Use in checkAnswer:
if (correct) {
  playSuccess();
} else {
  playFailure();
}
```

## Utility Functions Available

```typescript
// From gameUtils
randElement(array); // Get random element
shuffleArray(array); // Shuffle array
generateUniqueId(); // Generate unique ID

// From tenseUtils
findVerbByInfinitive(verbs, infinitive); // Find verb by name
getConjugation(conjugations, tense, pronounIndex); // Get specific conjugation
compareConjugations(userAnswer, correctAnswer); // Compare with (e) handling
normalizeString(str); // Normalize accents and case
```

## Best Practices

1. **Always validate configuration** before generating questions
2. **Use userAnswerRef** for values needed in timer callbacks
3. **Clear intervals** in cleanup functions
4. **Focus input** after showing new questions
5. **Disable input** while processing to prevent double-submission
6. **Show loading state** until game data is ready
7. **Provide clear error messages** with translation keys
8. **Test with edge cases** (no verbs, no tenses, invalid data)

## Common Customizations

### Multiple Inputs

Replace single TextField with multiple:

```tsx
{
  answers.map((answer, index) => (
    <TextField
      key={index}
      value={answer}
      onChange={(e) => handleAnswerChange(index, e.target.value)}
    />
  ));
}
```

### Multiple Choice

Replace TextField with buttons:

```tsx
<Stack spacing={1}>
  {options.map((option) => (
    <Button
      key={option}
      onClick={() => selectAnswer(option)}
      variant={selectedAnswer === option ? "contained" : "outlined"}
    >
      {option}
    </Button>
  ))}
</Stack>
```

### No Timer Mode

Make timer optional:

```typescript
const hasTimer = ongoingGameInfo.maxTime > 0;

{
  hasTimer && <Timer timeLeft={timeLeft} />;
}
```

### Collaborative Mode

Add multiplayer state:

```typescript
const [players, setPlayers] = useState<Player[]>([]);
// Implement WebSocket communication
```

## Testing Checklist

- [ ] Game initializes with valid configuration
- [ ] Game shows error with invalid configuration
- [ ] Timer counts down correctly
- [ ] Timer pauses and resumes correctly
- [ ] Timer auto-checks answer at 0
- [ ] Correct answers increase score
- [ ] Incorrect answers show correct answer
- [ ] Next button advances to next question
- [ ] Last question shows score dialog
- [ ] Play again resets game
- [ ] Quit returns to game menu
- [ ] Input focuses automatically
- [ ] Enter key submits answer
- [ ] Audio plays for correct/incorrect
- [ ] Responsive on mobile
- [ ] Translations work in both languages

## Support

For questions or issues with the template, refer to other game implementations:

- **Participe**: Simple single-input game
- **WriteMe**: Multiple inputs per question
- **Sentence**: Context-based questions
- **RandomVerb**: Multiple attempts per question

## Example Games Created from Template

1. **Participe** - Past/present participle identification
2. **WriteMe** - Complete verb conjugation table
3. **Sentence** - Fill verb in sentence context
4. **RandomVerb** - Random conjugation challenges

Each demonstrates different UI patterns and scoring systems.
