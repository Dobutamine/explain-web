# CapillaryBed Class Documentation

## Overview

The `CapillaryBed` class extends the `BloodCapacitance` class to specifically model capillary networks in the neonatal physiological system. It represents the microscopic blood vessels where gas and nutrient exchange occurs between blood and tissues.

## Location

`CapillaryBed.js` in the model structure.

## Import Dependencies

```javascript
import { BloodCapacitance } from "../base_models/BloodCapacitance";
```

The class extends the BloodCapacitance class which provides the blood compartment functionality.

## Class Structure

### Static Properties

```javascript
static model_type = "CapillaryBed";
model_interface = [...];
```

- `model_type`: Identifies this class as a "CapillaryBed" model
- `model_interface`: Array defining the user interface for this model, allowing control of volume, unstressed volume, elastance, and non-linear elastance factor

### Inherited Functionality

The class inherits all functionality from BloodCapacitance without adding new methods or properties. This includes:
- Volume and pressure calculations
- Blood composition tracking
- Gas concentration management
- Solute handling

## Physiological Significance

The CapillaryBed class represents specialized microvascular networks with these key features:

1. **Exchange Vessels**:
   - Primary site for gas, nutrient, and waste exchange
   - Extremely thin walls (often single-cell endothelium)
   - Vast surface area for exchange (approximately 700 m² in adults)

2. **Hemodynamic Properties**:
   - Low pressure environment (typically 25-35 mmHg at arteriolar end, 10-15 mmHg at venular end)
   - Slow blood flow velocity to allow time for exchange
   - Large cross-sectional area compared to other vessel types

3. **Fluid Exchange**:
   - Site of Starling forces governing fluid movement between vascular and interstitial compartments
   - Balance between hydrostatic and oncotic pressures
   - Critical for maintaining tissue fluid balance

4. **Organ-Specific Specialization**:
   - Different organs have specialized capillary structures:
     - Continuous capillaries (brain, muscle)
     - Fenestrated capillaries (kidneys, endocrine glands)
     - Sinusoidal capillaries (liver, bone marrow, spleen)
   - Unique properties based on tissue function

## Usage Example

```javascript
// Create a capillary bed model for the systemic circulation
const systemicCapillaries = new CapillaryBed(modelEngine, "systemic_capillaries");

// Initialize with physiological parameters
systemicCapillaries.u_vol = 0.1;     // Unstressed volume of 100 mL
systemicCapillaries.el_base = 10.0;  // Baseline elastance of 10 mmHg/mL
systemicCapillaries.el_k = 0.1;      // Non-linear elastance factor
systemicCapillaries.vol = 0.15;      // Initial volume of 150 mL

// Set up blood properties for arterial blood entering the capillaries
systemicCapillaries.to2 = 8.5;       // Oxygen content (mmol/L)
systemicCapillaries.tco2 = 24.0;     // Carbon dioxide content (mmol/L)
systemicCapillaries.ph = 7.4;        // pH
systemicCapillaries.temp = 37.0;     // Temperature in Celsius

// Initialize solutes
systemicCapillaries.solutes = {
  na: 140,    // Sodium (mmol/L)
  k: 4.5,     // Potassium (mmol/L)
  glucose: 5.5 // Glucose (mmol/L)
};

// Enable the model
systemicCapillaries.is_enabled = true;
```

## Notes

- The CapillaryBed class is a specialized version of BloodCapacitance without additional functionality
- It extends BloodCapacitance rather than BloodVessel, suggesting a focus on exchange properties rather than vasomotor control
- The model_interface array provides UI controls for the main parameters
- The class inherits all functionality for blood composition tracking, which is especially important for capillaries as exchange vessels
- While minimally implemented, the separation into a distinct class allows for:
  - Appropriate semantic organization of the cardiovascular model
  - Future extensions specific to capillary behavior
  - Different default parameters for specialized capillary beds
- Capillary physiology is particularly important in neonatal models for:
  - Gas exchange in the transitioning lungs
  - Nutrient delivery to growing tissues
  - Fluid balance between vascular and interstitial compartments
  - Immune cell trafficking
