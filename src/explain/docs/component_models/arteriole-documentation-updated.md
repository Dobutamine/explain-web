# Arteriole Class Documentation

## Overview

The `Arteriole` class extends the `BloodVessel` class to specifically model arteriolar vessels in the neonatal physiological system. It specializes the blood vessel model for the smallest resistance vessels that control blood distribution to tissues.

## Location

`Arteriole.js` in the model structure.

## Import Dependencies

```javascript
import { BloodVessel } from "../component_models/BloodVessel";
```

The class extends the BloodVessel class which provides the blood vessel functionality.

## Class Structure

### Static Properties

```javascript
static model_type = "Arteriole";
```

- `model_type`: Identifies this class as an "Arteriole" model

### Constructor

```javascript
constructor(model_ref, name = "")
```

**Parameters:**
- `model_ref`: Reference to the model engine
- `name`: Optional name for the model instance (defaults to empty string)

**Overridden Properties:**
- `alpha`: Determines the relation between resistance change and elastance change (default: 1.0)
- `ans_sensitivity`: Sensitivity for autonomic control (default: 1.0, compared to 0.0 in parent class)

## Physiological Significance

The Arteriole class specializes the BloodVessel class with these key features:

1. **Resistance Vessels**:
   - Represents the primary site of vascular resistance in the circulatory system
   - Small changes in diameter cause large changes in resistance (resistance ∝ 1/r⁴)
   - Critical for blood flow distribution and blood pressure regulation

2. **Autonomic Control**:
   - Default ans_sensitivity of 1.0 reflects the rich sympathetic innervation of arterioles
   - Full responsiveness to vasoconstriction/vasodilation signals
   - Important for modeling organ blood flow distribution

3. **Mechanical Properties**:
   - Inherits elastance and resistance coupling from BloodVessel
   - Standard alpha value of 1.0 maintains the established elastance-resistance relationship

4. **Physiological Role**:
   - Models the primary control point for tissue perfusion
   - Contributes majorly to total peripheral resistance
   - Enables differential blood flow to various organs based on metabolic demand

## Usage Example

```javascript
// Create an arteriole model for skeletal muscle
const muscleArteriole = new Arteriole(modelEngine, "skeletal_muscle_arteriole");

// Initialize with physiological parameters
muscleArteriole.u_vol = 0.002;        // Unstressed volume of 2 mL
muscleArteriole.el_base = 50.0;       // High baseline elastance of 50 mmHg/mL
muscleArteriole.el_k = 0.5;           // Non-linear elastance factor
muscleArteriole.vol = 0.003;          // Initial volume of 3 mL

// Note: alpha and ans_sensitivity are already set to appropriate values
// (alpha = 1.0, ans_sensitivity = 1.0)

// Connect to associated resistors
muscleArteriole.components = {
  "muscle_arteriole_in": {
    model_type: "BloodVesselResistor"
  },
  "muscle_arteriole_out": {
    model_type: "BloodVesselResistor"
  }
};

// Enable the model
muscleArteriole.is_enabled = true;

// Simulation examples:

// Exercise - metabolic vasodilation
muscleArteriole.r_circ_factor = 0.3;  // 70% decrease in resistance due to local metabolites

// Sympathetic activation (fight-or-flight response)
muscleArteriole.r_ans_factor = 2.0;   // 100% increase in resistance due to sympathetic stimulation
```

## Notes

- The Arteriole class is functionally similar to the Artery class but represents smaller resistance vessels
- Arterioles control approximately 70% of systemic vascular resistance
- The default autonomic sensitivity of 1.0 reflects the rich sympathetic innervation
- Despite having the same parameter values as Artery, the separation into a distinct class allows for:
  - Appropriate semantic organization of the cardiovascular model
  - Future extensions specific to arteriolar behavior
  - Different default parameters for specialized arteriolar beds
- The model preserves all functionality from BloodVessel, including:
  - Blood composition tracking
  - Elastic properties
  - Integration with resistors
  - Response to autonomic and circulatory factors
- Arterioles are particularly important in neonatal physiology for regulating organ perfusion during transition from fetal to postnatal circulation
