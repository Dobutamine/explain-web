# CoronaryVessel Class Documentation

## Overview

The `CoronaryVessel` class extends the `BloodTimeVaryingElastance` class to specifically model coronary blood vessels in the neonatal physiological system. It represents the specialized vasculature that supplies blood to the myocardium, with elastance properties that vary with the cardiac cycle.

## Location

`CoronaryVessel.js` in the model structure.

## Import Dependencies

```javascript
import { BloodTimeVaryingElastance } from "../base_models/BloodTimeVaryingElastance";
```

The class extends the BloodTimeVaryingElastance class which provides cardiac-cycle dependent elastance properties with blood composition tracking.

## Class Structure

### Static Properties

```javascript
static model_type = "CoronaryVessel";
```

- `model_type`: Identifies this class as a "CoronaryVessel" model

### Inherited Functionality

While the provided implementation is minimal, the class inherits all functionality from the BloodTimeVaryingElastance parent class:

- Time-varying elastance mechanics
- Blood composition tracking
- Gas concentration management
- Pressure calculation with cardiac cycle dependency
- Response to activation factor changes

## Physiological Significance

The CoronaryVessel class represents the unique coronary circulation with these key features:

1. **Specialized Vasculature**:
   - Blood vessels supplying the heart muscle (myocardium)
   - Includes coronary arteries, arterioles, capillaries, and veins
   - Critical for delivering oxygen and nutrients to cardiac tissue

2. **Unique Perfusion Pattern**:
   - Coronary blood flow primarily occurs during diastole (unlike other systemic circulation)
   - Flow impeded during systole due to myocardial compression of vessels
   - Flow pattern directly influenced by cardiac contraction/relaxation cycle

3. **Time-Varying Properties**:
   - Vessel elastance changes throughout cardiac cycle
   - Compression by surrounding myocardium during systole increases effective elastance
   - Relaxation during diastole decreases effective elastance

4. **Neonatal Specifics**:
   - Transitional coronary circulation adapting to postnatal life
   - Different oxygen delivery requirements compared to adults
   - Immature autoregulatory mechanisms
   - Susceptibility to congenital abnormalities

## Usage Example

```javascript
// Create a coronary vessel model
const leftCoronary = new CoronaryVessel(modelEngine, "left_coronary_artery");

// Initialize with physiological parameters
leftCoronary.u_vol = 0.001;        // Unstressed volume of 1 mL
leftCoronary.el_min = 20.0;        // Minimum elastance (diastole) of 20 mmHg/mL
leftCoronary.el_max = 100.0;       // Maximum elastance (systole) of 100 mmHg/mL
leftCoronary.el_k = 0.1;           // Non-linear elastance factor
leftCoronary.vol = 0.0015;         // Initial volume of 1.5 mL

// Set up blood properties
leftCoronary.to2 = 8.5;            // Arterial oxygen content (mmol/L)
leftCoronary.tco2 = 23.0;          // Carbon dioxide content (mmol/L)
leftCoronary.temp = 37.0;          // Blood temperature in Celsius

// Enable the model
leftCoronary.is_enabled = true;

// During simulation - cardiac cycle influence
// Systole (vessel compressed by myocardium)
leftCoronary.act_factor = 1.0;     // Fully activated (compressed)
leftCoronary.calc_model();         // Calculate pressure during systole

// Diastole (vessel relaxed)
leftCoronary.act_factor = 0.0;     // Fully relaxed
leftCoronary.calc_model();         // Calculate pressure during diastole
```

## Notes

- The CoronaryVessel class is a specialized version of BloodTimeVaryingElastance for coronary circulation
- The use of time-varying elastance allows for modeling the unique phasic flow patterns in coronary vessels
- It inherits all functionality for blood composition tracking, critical for modeling myocardial oxygen delivery
- The act_factor property can be synchronized with the cardiac cycle to model:
  - Compression during systole (high act_factor)
  - Relaxation during diastole (low act_factor)
- While minimally implemented, the class provides semantic differentiation for this unique vascular bed
- Coronary circulation in neonates has several distinct characteristics:
  - Transitional changes following birth as pulmonary circulation is established
  - Different oxygen demands during postnatal adaptation
  - Potential for congenital coronary anomalies
- This model can be used to simulate both normal coronary perfusion and pathological conditions:
  - Coronary artery disease
  - Congenital coronary anomalies
  - Myocardial ischemia
  - Effects of cardiac hypertrophy on coronary flow
