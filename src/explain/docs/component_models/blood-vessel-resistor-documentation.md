# BloodVesselResistor Class Documentation

## Overview

The `BloodVesselResistor` class extends the `Resistor` class to specifically model the resistance elements of blood vessels in the neonatal physiological system. It enhances the base resistor with autonomic control and circulatory factors, allowing for dynamic changes in vascular resistance in response to physiological stimuli.

## Location

`BloodVesselResistor.js` in the model structure.

## Import Dependencies

```javascript
import { Resistor } from "../base_models/Resistor";
```

The class extends the Resistor class which provides the basic flow resistance functionality.

## Class Structure

### Static Properties

```javascript
static model_type = "BloodVesselResistor";
```

- `model_type`: Identifies this class as a "BloodVesselResistor" model

### Constructor

```javascript
constructor(model_ref, name = "")
```

**Parameters:**
- `model_ref`: Reference to the model engine
- `name`: Optional name for the model instance (defaults to empty string)

**Additional Properties:**
- `ans_sensitivity`: Sensitivity to autonomic nervous system control (default: 0.0)
- `r_ans_factor`: Resistance change factor due to autonomic nervous system (default: 1.0)
- `r_circ_factor`: Resistance change factor due to circulatory factors (default: 1.0)

### Methods

#### `calc_resistance()`

Overrides the parent class method to calculate effective resistance values based on base values and various modulating factors.

**Calculations:**
1. Calculates forward resistance with all factors:
   ```javascript
   _r_for = r_for + 
     (r_factor - 1) * r_for + 
     (r_ans_factor - 1) * r_for * ans_sensitivity +
     (r_circ_factor - 1) * r_for
   ```

2. Calculates backward resistance with all factors:
   ```javascript
   _r_back = r_back + 
     (r_factor - 1) * r_back +
     (r_ans_factor - 1) * r_back * ans_sensitivity +
     (r_circ_factor - 1) * r_back
   ```

3. Calculates non-linear resistance factor:
   ```javascript
   _r_k = r_k + (r_k_factor - 1) * r_k
   ```

4. Makes resistances flow-dependent:
   ```javascript
   _r_for += _r_k * flow * flow;
   _r_back += _r_k * flow * flow;
   ```

## Physiological Significance

The BloodVesselResistor class models vascular resistance with these key features:

1. **Autonomic Control**:
   - Implements autonomic nervous system influence on vascular resistance
   - Sensitivity parameter determines the degree of response to autonomic input
   - Enables modeling of sympathetic vasoconstriction and parasympathetic vasodilation

2. **Multiple Control Mechanisms**:
   - Autonomic factors (neural control via r_ans_factor)
   - Circulatory factors (local metabolic, hormonal via r_circ_factor)
   - Base factors (structural, anatomical via r_factor)

3. **Flow Dynamics**:
   - Maintains non-linear flow-dependent resistance from parent class
   - Models turbulent flow effects at higher flow rates
   - Preserves directionality with separate forward and backward resistance

4. **Coupling with BloodVessel**:
   - Designed to work in conjunction with the BloodVessel class
   - Receives autonomic control signals from associated vessel
   - Maintains consistency with vessel elastance changes

## Usage Example

```javascript
// Create a blood vessel resistor for a systemic arteriole
const arterioleResistor = new BloodVesselResistor(modelEngine, "systemic_arteriole_resistor");

// Initialize with physiological parameters
arterioleResistor.r_for = 500;           // Forward resistance of 500 mmHg/(L·s)
arterioleResistor.r_back = 500;          // Backward resistance of 500 mmHg/(L·s)
arterioleResistor.r_k = 50;              // Non-linear resistance factor
arterioleResistor.comp_from = "systemic_artery";  // Upstream component
arterioleResistor.comp_to = "systemic_capillaries";  // Downstream component
arterioleResistor.ans_sensitivity = 0.8;  // High sensitivity to autonomic control

// Enable the model
arterioleResistor.is_enabled = true;

// During simulation - sympathetic activation (vasoconstriction)
arterioleResistor.r_ans_factor = 2.0;     // Double the resistance due to sympathetic stimulation

// During simulation - local metabolic vasodilation (e.g., in exercise)
arterioleResistor.r_circ_factor = 0.5;    // Halve the resistance due to local metabolites
```

## Notes

- The BloodVesselResistor class provides a model of dynamic vascular resistance
- It is typically used in conjunction with the BloodVessel class
- The autonomic nervous system factor (r_ans_factor) models neural control of resistance
- The circulatory factor (r_circ_factor) models local control mechanisms
- The sensitivity parameter determines how strongly the vessel responds to autonomic signals
- Non-linear resistance increases with the square of the flow rate, modeling turbulence
- The model captures key features of vascular control in the neonatal cardiovascular system:
  - Neural regulation (sympathetic/parasympathetic)
  - Local autoregulation (metabolic, myogenic)
  - Structural changes
- This class is essential for modeling blood flow distribution and cardiovascular responses
