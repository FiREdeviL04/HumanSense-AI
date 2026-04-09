# Demo Script: Stress + Confusion Scenario

## Goal
Demonstrate that HumanSense AI detects stressed emotion and confusion intent, then adapts the UI in real time.

## Steps

1. Start backend and frontend.
2. Open the Live Adaptive UI view.
3. Simulate stressed signal:
   - Use a tense facial expression (or lower-light/static camera condition for fallback stressed heuristic).
   - Enter text like: "I feel overwhelmed and cannot figure this out."
4. Simulate confusion behavior:
   - Move mouse rapidly with irregular trajectory.
   - Click repeatedly across unrelated UI regions.
   - Add short paused typing bursts.
5. Observe AI outputs:
   - Emotion badge turns stressed.
   - Intent badge turns confusion.
   - Fusion risk increases.
6. Verify adaptive response:
   - Layout simplifies.
   - Guided help popup appears.
7. Open Admin Analytics view and verify logged record:
   - Emotion = stressed
   - Intent = confusion
   - Action = guided_help

## Evaluation Notes
- Explain multimodal fusion confidence and rule trigger.
- Show logs in MongoDB collection prediction_logs.
- Discuss RL adapter as extension for policy optimization.
