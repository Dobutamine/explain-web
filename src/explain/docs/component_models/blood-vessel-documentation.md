# BloodVessel Class Documentation

## Overview

The `BloodVessel` class extends the `BloodCapacitance` class to specifically model blood vessels in the neonatal physiological system. It enhances the base blood-containing compartment with vasomotor properties, including autonomic nervous system control and the relationship between resistance and elastance changes during vasoconstriction or vasodilation.

## Location

`BloodVessel.js` in the model structure.

## Import Dependencies

```javascript
import { BloodCapacitance } from "../base_models/BloodCapacitance";
```

The class extends the BloodCapacitance class which provides the blood compartment functionality.

## Class Structure

### Static Properties

```javascript
static model_type = "BloodVessel";
```

- `model_type`: Identifies this class as a "BloodVessel" model

### Constructor

```javascript
constructor(model_ref, name = "")
```

**Parameters:**
- `model_ref`: Reference to the model engine
- `name`: Optional name for the model instance (defaults to empty string)

**Additional Independent Properties:**
- `alpha`: Determines the relation between resistance change and elastance change (default: 1.0)
- `ans_sensitivity`: Sensitivity for autonomic control (vasoconstriction/vasodilation) (default: 0.0)

**Modulating Factors:**
- `r_ans_factor`: Resistance change due to the autonomic nervous system (default: 1.0)
- `r_circ_factor`: Resistance change due to the circulatory model (default: 1.0)

### Methods

#### `calc_model()`

Orchestrates the calculation sequence for the blood vessel model.

**Functionality:**
1. Calls `calc_resistances()` to update resistance properties
2. Calls `calc_elastances()` to update elastance values
3. Calls `calc_volumes()` to update volume values (inherited from BloodCapacitance)
4. Calls `calc_pressure()` to calculate the resulting pressures (inherited from BloodCapacitance)

#### `calc_resistances()`

Updates the resistances of associated blood vessel resistances.

**Functionality:**
- Iterates through all components (resistors) associated with this blood vessel
- Updates their autonomic sensitivity and resistance factors

#### `calc_elastances()`

Calculates the effective elastance based on base values, autonomic factors, and circulatory factors.

**Calculations:**
1. Calculates autonomic factor: `_ans_factor = Math.pow(r_ans_factor, 0.25 * alpha)`
2. Calculates circulatory factor: `_r_circ_factor = Math.pow(r_circ_factor, 0.25 * alpha)`
3. Updates baseline elastance:
   ```javascript
   _el = el_base + 
       (el_base_factor - 1) * el_base +
       (_ans_factor - 1) * el_base * ans_sensitivity +
       (_r_circ_factor - 1) * el_base * ans_sensitivity
   ```
4. Updates non-linear elastance factor:
   ```javascript
   _el_k = el_k + (el_k_factor - 1) * el_k
   ```

## Physiological Significance

The BloodVessel class models vascular behavior with these key features:

1. **Vasomotor Control**:
   - Implements autonomic nervous system influence on vessel tone
   - Models vasoconstriction (increased resistance, increased elastance)
   - Models vasodilation (decreased resistance, decreased elastance)

2. **Coupled Properties**:
   - Links resistance and elastance changes through the alpha parameter
   - Reflects physiological reality that vessel constriction affects both flow resistance and vessel compliance

3. **Multiple Control Mechanisms**:
   - Autonomic nervous system control (sympathetic/parasympathetic)
   - Circulatory factors (e.g., local metabolic control, hormonal influences)
   - Variable sensitivity to control mechanisms

4. **Mathematical Model**:
   - Elastance changes approximately proportional to the fourth root of resistance changes
   - Alpha parameter allows tuning of this relationship
   - Preserves all blood composition tracking from parent class

5. **Component Integration**:
   - Updates associated resistors to maintain consistency
   - Propagates control signals to connected components

## Usage Example

```javascript
// Create a blood vessel model for a systemic arterial segment
const systemicArtery = new BloodVessel(modelEngine, "systemic_artery");

// Initialize with physiological parameters
systemicArtery.u_vol = 0.05;           // Unstressed volume of 50 mL
systemicArtery.el_base = 3.0;          // Baseline elastance of 3.0 mmHg/mL
systemicArtery.el_k = 0.1;             // Non-linear elastance factor
systemicArtery.vol = 0.08;             // Initial volume of 80 mL
systemicArtery.alpha = 1.0;            // Standard relationship between resistance and elastance
systemicArtery.ans_sensitivity = 0.7;  // High sensitivity to autonomic control

// Set up solutes and gases
systemicArtery.to2 = 8.0;              // Oxygen content (mmol/L)
systemicArtery.tco2 = 24.0;            // Carbon dioxide content (mmol/L)

// Connect to associated resistors
systemicArtery.components = {
  "systemic_artery_in": {
    model_type: "BloodVesselResistor"
  },
  "systemic_artery_out": {
    model_type: "BloodVesselResistor"
  }
};

// Enable the model
systemicArtery.is_enabled = true;

// During simulation - sympathetic activation (vasoconstriction)
systemicArtery.r_ans_factor = 1.5;     // 50% increase in resistance
systemicArtery.calc_model();           // This will update elastance and propagate to resistors
```

## Notes

- The BloodVessel class provides a comprehensive model of vascular behavior
- The coupling of resistance and elastance is a key physiological feature
- When vessels constrict, both resistance and elastance increase, but not proportionally
- The `alpha` parameter tunes this relationship (default is 1.0)
- Changes in autonomic tone propagate to associated resistors
- The class maintains blood composition properties inherited from BloodCapacitance
- Both ANS and circulatory factors can influence vessel properties
- The model reflects active vascular wall behavior, not just passive elasticity
