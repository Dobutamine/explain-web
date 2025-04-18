# BloodCapacitance Class Documentation

## Overview

The `BloodCapacitance` class extends the `Capacitance` class to specifically model blood-containing compartments in the neonatal physiological system. It adds blood-specific properties including temperature, gas concentrations, acid-base balance, and solute tracking.

## Location

`BloodCapacitance.js` in the model structure.

## Import Dependencies

```javascript
import { Capacitance } from "./Capacitance";
```

The class extends the Capacitance class which provides the basic elastic compartment functionality.

## Class Structure

### Static Properties

```javascript
static model_type = "BloodCapacitance";
model_interface = [];
```

- `model_type`: Identifies this class as a "BloodCapacitance" model
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
- `ph`: Blood pH (unitless), initialized to -1.0
- `pco2`: Partial pressure of carbon dioxide in mmHg, initialized to -1.0
- `po2`: Partial pressure of oxygen in mmHg, initialized to -1.0
- `so2`: Oxygen saturation (fraction), initialized to -1.0
- `hco3`: Bicarbonate concentration in mmol/L, initialized to -1.0
- `be`: Base excess in mmol/L, initialized to -1.0

### Methods

#### `volume_in(dvol, comp_from)`

Extends the parent class method to account for blood composition changes during volume transfer.

**Parameters:**
- `dvol`: Amount of volume to add in liters (L)
- `comp_from`: Source compartment that the blood is coming from

**Functionality:**
1. Adds volume to the compartment (calling the parent method)
2. Returns if volume is zero or lower
3. Updates gas concentrations based on mixing:
   - `to2 += ((comp_from.to2 - to2) * dvol) / vol`
   - `tco2 += ((comp_from.tco2 - tco2) * dvol) / vol`
4. Updates all solute concentrations using the same mixing formula

## Physiological Significance

The BloodCapacitance class extends the basic elastic container model to include blood-specific properties:

1. **Blood Gases**: 
   - Tracks oxygen and carbon dioxide for respiratory function modeling
   - Includes both total concentrations and partial pressures
   - Calculates oxygen saturation for hemoglobin binding

2. **Acid-Base Balance**:
   - pH and bicarbonate levels represent acid-base status
   - Base excess indicates metabolic component of acid-base disorders
   - pCO2 represents respiratory component of acid-base status

3. **Blood Composition**:
   - Generic solutes dictionary allows tracking of electrolytes, metabolites, etc.
   - Drug concentrations for pharmacokinetic modeling
   - Temperature affects chemical reaction rates and gas solubility

4. **Blood Physics**:
   - Viscosity impacts flow resistance through vessels
   - Temperature affects viscosity and metabolic processes

## Usage Example

```javascript
// Create a blood compartment model for the left ventricle
const leftVentricle = new BloodCapacitance(modelEngine, "left_ventricle");

// Initialize with physiological parameters
leftVentricle.u_vol = 0.01;     // Unstressed volume of 10 mL
leftVentricle.el_base = 15.0;   // Elastance of 15 mmHg/L
leftVentricle.vol = 0.02;       // Initial volume of 20 mL
leftVentricle.temp = 37.0;      // Body temperature in Celsius
leftVentricle.viscosity = 6.0;  // Normal blood viscosity

// Initialize blood gas values
leftVentricle.to2 = 8.0;        // Total oxygen content (mmol/L)
leftVentricle.tco2 = 24.0;      // Total CO2 content (mmol/L)
leftVentricle.po2 = 95.0;       // Partial pressure of O2 (mmHg)
leftVentricle.pco2 = 40.0;      // Partial pressure of CO2 (mmHg)
leftVentricle.ph = 7.4;         // Normal arterial pH

// Initialize solutes
leftVentricle.solutes = {
  na: 140,    // Sodium (mmol/L)
  k: 4.5,     // Potassium (mmol/L)
  cl: 100,    // Chloride (mmol/L)
  ca: 2.5,    // Calcium (mmol/L)
  glucose: 5.5 // Glucose (mmol/L)
};

// When blood flows from another compartment
const pulmonaryVein = someOtherBloodCompartment;
leftVentricle.volume_in(0.01, pulmonaryVein);  // 10 mL flows in from pulmonary vein
```

## Notes

- The BloodCapacitance class implements complete tracking of blood composition
- Blood gas mixing follows a simple concentration and volume-based formula
- Negative initial values (-1.0) for blood gas parameters indicate they need to be calculated
- The current implementation tracks transport of substances but does not model their production or consumption
- Drug concentrations can be used for pharmacokinetic/pharmacodynamic modeling
