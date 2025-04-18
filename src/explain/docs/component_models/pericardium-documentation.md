# Pericardium Class Documentation

## Overview

The `Pericardium` class extends the `Container` class to specifically model the pericardial sac in the neonatal physiological system. It represents the fibrous sac that surrounds the heart and the roots of the great vessels, with special handling for externally transmitted pressures.

## Location

`Pericardium.js` in the model structure.

## Import Dependencies

```javascript
import { Container } from "../base_models/Container";
```

The class extends the Container class which provides the functionality for a compartment that contains other model components.

## Class Structure

### Static Properties

```javascript
static model_type = "Pericardium";
static model_interface = [];
```

- `model_type`: Identifies this class as a "Pericardium" model
- `model_interface`: Array for interface definitions (empty in this implementation)

### Constructor

```javascript
constructor(model_ref, name = "")
```

**Parameters:**
- `model_ref`: Reference to the model engine
- `name`: Optional name for the model instance (defaults to empty string)

**Additional Independent Properties:**
- `pres_cc`: External pressure from chest compressions in mmHg (default: 0.0)
- `pres_mus`: External pressure from respiratory muscles in mmHg (default: 0.0)

### Methods

#### `calc_pressure()`

Overrides the parent class method to calculate the pressure inside the pericardial space, incorporating additional pressure sources that can affect the pericardium.

**Calculations:**
1. Calculates recoil pressure: `pres_in = _el_k * (vol - _u_vol)² + _el * (vol - _u_vol)`
2. Adds external, chest compression, and muscle pressures: `pres = pres_in + pres_ext + pres_cc + pres_mus`
3. Transfers this total pressure to all contained components
4. Resets all external pressure sources to zero

## Physiological Significance

The Pericardium class models the pericardial sac with these key features:

1. **Anatomical Structure**:
   - Double-layered fibrous sac surrounding the heart
   - Contains a small amount of pericardial fluid
   - Limited distensibility due to fibrous outer layer
   - Encloses all four heart chambers and the roots of great vessels

2. **Cardiac Constraint**:
   - Limits acute cardiac chamber distension
   - Creates ventricular interdependence
   - Transmits pressure changes between heart chambers
   - Mediates chamber interactions during filling

3. **Pressure Transmission**:
   - Transmits intrathoracic pressure changes to the heart
   - Affected by respiratory movements
   - Influenced by external forces (chest compressions)
   - Creates equal surrounding pressure for all cardiac chambers

4. **Pathological Conditions**:
   - Can model pericardial effusion (fluid accumulation)
   - Can represent cardiac tamponade (excessive pressure)
   - Can simulate constrictive pericarditis (stiff pericardium)

5. **Neonatal Specifics**:
   - Thinner pericardium with different compliance properties
   - More susceptible to pressure changes from surrounding structures
   - Different response to volume loading
   - Potential for congenital abnormalities

## Usage Example

```javascript
// Create a pericardium model
const pericardium = new Pericardium(modelEngine, "pericardial_sac");

// Initialize with physiological parameters
pericardium.u_vol = 0.01;        // Unstressed volume of 10 mL
pericardium.el_base = 3.0;       // Baseline elastance of 3.0 mmHg/mL
pericardium.el_k = 0.5;          // Non-linear elastance factor
pericardium.vol = 0.015;         // Initial volume of 15 mL

// Define components contained within the pericardium
pericardium.contained_components = [
  "right_atrium",
  "left_atrium",
  "right_ventricle",
  "left_ventricle"
];

// Enable the model
pericardium.is_enabled = true;

// Example of simulating normal respiratory influence
pericardium.pres_mus = -2.0;      // Negative pressure during inspiration

// Example of simulating pericardial effusion/tamponade
pericardium.vol_extra = 0.05;     // Additional 50 mL of fluid in pericardial space

// Example of simulating chest compressions during CPR
pericardium.pres_cc = 60.0;       // External pressure from chest compression
```

## Notes

- The Pericardium class extends Container to model the specific mechanical properties of the pericardial sac
- It is structurally similar to the Thorax and PleuralSpace classes but represents a different anatomical compartment
- The pericardium normally contains a small amount of fluid (15-50 mL in adults, less in neonates)
- The model creates ventricular interdependence effects:
  - Volume increase in one ventricle affects filling of the other
  - Pressure in one chamber influences adjacent chambers
  - Septal position affects relative chamber volumes
- The pericardium has distinctive non-linear pressure-volume relationship:
  - Minimal pressure changes at low volumes
  - Steep pressure increases beyond a certain volume (pericardial constraint)
- Neonatal pericardial mechanics differ from adults:
  - Less fibrous tissue
  - Different compliance characteristics
  - More influenced by surrounding structures
  - Potential for congenital abnormalities (e.g., absence of pericardium)
- Pathological conditions that can be modeled include:
  - Pericardial effusion and cardiac tamponade
  - Constrictive pericarditis
  - Pericardial adhesions
  - Effects of cardiac surgery
