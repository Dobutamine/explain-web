# Artery Class Documentation

## Overview

The `Artery` class extends the `BloodVessel` class to specifically model arterial vessels in the neonatal physiological system. It specializes the blood vessel model with parameters appropriate for the arterial side of the circulation, particularly regarding autonomic control sensitivity.

## Location

`Artery.js` in the model structure.

## Import Dependencies

```javascript
import { BloodVessel } from "../component_models/BloodVessel";
```

The class extends the BloodVessel class which provides the blood vessel functionality.

## Class Structure

### Static Properties

```javascript
static model_type = "Artery";
```

- `model_type`: Identifies this class as an "Artery" model

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

The Artery class specializes the BloodVessel class with these key features:

1. **Arterial Specificity**:
   - Represents the arterial side of the circulation (systemic or pulmonary)
   - Higher autonomic sensitivity compared to other vessel types

2. **Autonomic Control**:
   - Default ans_sensitivity of 1.0 reflects strong sympathetic innervation of arteries
   - Full responsiveness to vasoconstriction/vasodilation signals
   - Important for modeling blood pressure control

3. **Mechanical Properties**:
   - Inherits elastance and resistance coupling from BloodVessel
   - Standard alpha value of 1.0 maintains the established elastance-resistance relationship

4. **Physiological Role**:
   - Models vessels that provide resistance and pressure buffering
   - Contributes to total peripheral resistance
   - Participates in baroreceptor-mediated blood pressure regulation

## Usage Example

```javascript
// Create an artery model for a systemic artery
const systemicArtery = new Artery(modelEngine, "systemic_artery");

// Initialize with physiological parameters
systemicArtery.u_vol = 0.1;           // Unstressed volume of 100 mL
systemicArtery.el_base = 4.5;         // Baseline elastance of 4.5 mmHg/mL
systemicArtery.el_k = 0.1;            // Non-linear elastance factor
systemicArtery.vol = 0.15;            // Initial volume of 150 mL

// Note: alpha and ans_sensitivity are already set to appropriate arterial values
// (alpha = 1.0, ans_sensitivity = 1.0)

// Set up blood properties
systemicArtery.to2 = 8.5;             // Arterial oxygen content (mmol/L)
systemicArtery.tco2 = 24.0;           // Arterial carbon dioxide content (mmol/L)
systemicArtery.ph = 7.4;              // Arterial pH

// Connect to associated resistors
systemicArtery.components = {
  "aortic_valve": {
    model_type: "BloodVesselResistor"
  },
  "systemic_arterial_resistor": {
    model_type: "BloodVesselResistor"
  }
};

// Enable the model
systemicArtery.is_enabled = true;

// During simulation - sympathetic activation (arterial vasoconstriction)
systemicArtery.r_ans_factor = 1.5;    // 50% increase in resistance due to sympathetic stimulation
```

## Notes

- The Artery class is a specialized version of BloodVessel optimized for arterial vessels
- The primary specialization is the default autonomic sensitivity of 1.0
- This higher sensitivity reflects the significant role of arteries in blood pressure regulation
- Arteries have strong sympathetic innervation in comparison to veins and capillaries
- The class inherits all functionality from BloodVessel, including:
  - Blood composition tracking
  - Elastic properties
  - Integration with resistors
  - Response to autonomic and circulatory factors
- The model allows for both systemic and pulmonary arterial representation
- This class forms an important component in the overall cardiovascular model architecture
