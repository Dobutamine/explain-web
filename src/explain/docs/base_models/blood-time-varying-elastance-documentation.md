# BloodTimeVaryingElastance Class Documentation

## Overview

The `BloodTimeVaryingElastance` class extends the `TimeVaryingElastance` class to specifically model blood-containing cardiac chambers in the neonatal physiological system. It combines the dynamic elastance properties needed for cardiac simulation with blood-specific properties including gas concentrations, acid-base balance, and solute tracking.

## Location

`BloodTimeVaryingElastance.js` in the model structure.

## Import Dependencies

```javascript
import { TimeVaryingElastance } from "./TimeVaryingElastance";
```

The class extends the TimeVaryingElastance class which provides the cardiac chamber functionality.

## Class Structure

### Static Properties

```javascript
static model_type = "BloodTimeVaryingElastance";
model_interface = [];
```

- `model_type`: Identifies this class as a "BloodTimeVaryingElastance" model
- `model_interface`: Array for interface definitions (empty in this implementation)

### Constructor

```javascript
constructor(model_ref, name = "")
```

**Parameters:**
- `model_ref`: Reference to the model engine
- `name`: Optional name for the model instance (defaults to empty string)

**Additional Independent Properties:**
- `temp`: Blood temperature in degrees Celsius
- `viscosity`: Blood viscosity in centiPoise (Pa * s), default: 6.0
- `solutes`: Dictionary holding all solute concentrations
- `drugs`: Dictionary holding all drug concentrations

**Additional Dependent Properties:**
- `to2`: Total oxygen concentration in mmol/L
- `tco2`: Total carbon dioxide concentration in mmol/L
- `ph`: Blood pH (unitless)
- `pco2`: Partial pressure of carbon dioxide in mmHg
- `po2`: Partial pressure of oxygen in mmHg
- `so2`: Oxygen saturation (fraction)
- `hco3`: Bicarbonate concentration in mmol/L
- `be`: Base excess in mmol/L

### Methods

#### `volume_in(dvol, comp_from)`

Extends the parent class method to account for blood composition changes during volume transfer.

**Parameters:**
- `dvol`: Amount of volume to add in liters (L)
- `comp_from`: Source compartment that the blood is coming from

**Functionality:**
1. Adds volume to the compartment (calling the parent method logic)
2. Returns if volume is zero or lower
3. Updates gas concentrations based on mixing:
   - `to2 += ((comp_from.to2 - to2) * dvol) / vol`
   - `tco2 += ((comp_from.tco2 - tco2) * dvol) / vol`
4. Updates all solute concentrations using the same mixing formula

## Physiological Significance

The BloodTimeVaryingElastance class combines two important physiological concepts:

1. **Cardiac Chamber Mechanics**:
   - Inherits the time-varying elastance model from the parent class
   - Models the cyclic contraction and relaxation of cardiac chambers
   - Implements realistic pressure-volume relationships

2. **Blood Composition**:
   - Tracks oxygen and carbon dioxide concentrations for gas exchange
   - Monitors acid-base status through pH, bicarbonate, and base excess
   - Accounts for blood solutes (electrolytes, metabolites)
   - Tracks drug concentrations for pharmacokinetic modeling

This combination allows the model to simulate:
- Blood mixing within cardiac chambers
- Changes in blood composition during cardiac filling
- Preservation of mass balance for gases and solutes
- Realistic cardiac chamber behavior with physiological blood properties

## Usage Example

```javascript
// Create a blood time-varying elastance model for the left ventricle
const leftVentricle = new BloodTimeVaryingElastance(modelEngine, "left_ventricle");

// Initialize with physiological parameters
leftVentricle.u_vol = 0.01;      // Unstressed volume of 10 mL
leftVentricle.el_min = 0.5;      // Minimal elastance of 0.5 mmHg/mL
leftVentricle.el_max = 10.0;     // Maximal elastance of 10 mmHg/mL
leftVentricle.el_k = 0.05;       // Non-linear elastance factor
leftVentricle.vol = 0.02;        // Initial volume of 20 mL
leftVentricle.temp = 37.0;       // Blood temperature in Celsius

// Initialize blood gas values
leftVentricle.to2 = 8.5;         // Total oxygen content (mmol/L)
leftVentricle.tco2 = 24.0;       // Total CO2 content (mmol/L)
leftVentricle.ph = 7.4;          // Normal arterial pH
leftVentricle.po2 = 95.0;        // Partial pressure of O2 (mmHg)
leftVentricle.pco2 = 40.0;       // Partial pressure of CO2 (mmHg)
leftVentricle.so2 = 0.98;        // Oxygen saturation (98%)

// Initialize solutes
leftVentricle.solutes = {
  na: 140,    // Sodium (mmol/L)
  k: 4.5,     // Potassium (mmol/L)
  cl: 100,    // Chloride (mmol/L)
  ca: 2.5,    // Calcium (mmol/L)
  glucose: 5.5 // Glucose (mmol/L)
};

// Enable the model
leftVentricle.is_enabled = true;

// During diastole (filling)
leftVentricle.act_factor = 0.0;  // Relaxed state
leftVentricle.calc_model();      // Calculate pressure at current state

// Blood enters from left atrium
const leftAtrium = someLeftAtriumModel;
leftVentricle.volume_in(0.03, leftAtrium);  // 30 mL flows in from left atrium with its blood composition

// During systole (ejection)
leftVentricle.act_factor = 1.0;  // Fully contracted state
leftVentricle.calc_model();      // Calculate pressure at current state

// Blood ejection to aorta handled elsewhere
```

## Notes

- This class is specifically designed for blood-containing cardiac chambers
- The model preserves both cardiac mechanics and blood composition
- Blood mixing is handled through volume-weighted concentration changes
- Changes in electrical activation (act_factor) drive the cardiac cycle
- The model accounts for both physical and chemical properties of blood in cardiac chambers
- The implementation focuses on maintaining mass balance during blood transfer
