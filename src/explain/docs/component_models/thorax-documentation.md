# Thorax Class Documentation

## Overview

The `Thorax` class extends the `Container` class to specifically model the thoracic cavity in the neonatal physiological system. It represents the chest compartment that contains the lungs, heart, and major vessels, with special handling for respiratory muscle pressure and chest compressions.

## Location

`Thorax.js` in the model structure.

## Import Dependencies

```javascript
import { Container } from "../base_models/Container";
```

The class extends the Container class which provides the functionality for a compartment that contains other model components.

## Class Structure

### Static Properties

```javascript
static model_type = "Thorax";
static model_interface = [];
```

- `model_type`: Identifies this class as a "Thorax" model
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

Overrides the parent class method to calculate the pressure inside the thoracic cavity, incorporating additional pressure sources specific to the thorax.

**Calculations:**
1. Calculates recoil pressure: `pres_in = _el_k * (vol - _u_vol)² + _el * (vol - _u_vol)`
2. Adds external, chest compression, and muscle pressures: `pres = pres_in + pres_ext + pres_cc + pres_mus`
3. Transfers this total pressure to all contained components
4. Resets all external pressure sources to zero

## Physiological Significance

The Thorax class models the thoracic cavity with these key features:

1. **Anatomical Enclosure**:
   - Models the chest cavity that contains the lungs, heart, and major vessels
   - Creates a mechanical coupling between thoracic organs
   - Transmits pressure changes to all contained structures

2. **Respiratory Mechanics**:
   - Incorporates respiratory muscle pressure (`pres_mus`)
   - Models negative pressure during inspiration
   - Models positive pressure during forced expiration
   - Affects lung expansion and cardiac filling

3. **Cardiopulmonary Interactions**:
   - Transmits intrathoracic pressure to heart chambers and vessels
   - Influences cardiac preload and afterload
   - Models mechanical effects of respiration on blood flow

4. **Resuscitation Modeling**:
   - Includes chest compression pressure (`pres_cc`)
   - Allows simulation of cardiopulmonary resuscitation (CPR)
   - Models effects of external chest compression on cardiac and pulmonary function

5. **Neonatal Specifics**:
   - Highly compliant chest wall in neonates (especially premature)
   - Different respiratory muscle dynamics than adults
   - Unique response to external pressures
   - Critical for modeling ventilator interactions

## Usage Example

```javascript
// Create a thorax model
const thorax = new Thorax(modelEngine, "thoracic_cavity");

// Initialize with physiological parameters
thorax.u_vol = 0.2;            // Unstressed volume of 200 mL
thorax.el_base = 1.0;          // Baseline elastance of 1.0 mmHg/mL
thorax.el_k = 0.05;            // Non-linear elastance factor
thorax.vol_extra = 0.05;       // Additional volume of 50 mL

// Define components contained within the thorax
thorax.contained_components = [
  "right_lung",
  "left_lung",
  "heart",
  "thoracic_aorta",
  "pulmonary_arteries",
  "pulmonary_veins",
  "vena_cava"
];

// Enable the model
thorax.is_enabled = true;

// Example of simulating spontaneous inspiration
thorax.pres_mus = -5.0;        // Negative pressure from inspiratory muscles

// Example of simulating chest compressions during CPR
thorax.pres_cc = 40.0;         // External pressure from chest compression

// Example of simulating positive pressure ventilation
thorax.pres_ext = 15.0;        // Positive pressure from mechanical ventilator
```

## Notes

- The Thorax class extends Container to model the specific mechanical properties of the chest cavity
- It adds specialized pressure sources relevant to thoracic physiology:
  - Chest compression pressure for CPR simulation
  - Respiratory muscle pressure for breathing mechanics
- The model transmits thoracic pressure to all contained components, creating appropriate mechanical coupling
- This coupling is critical for simulating cardiopulmonary interactions:
  - Effects of respiration on venous return
  - Effects of cardiac volume changes on pulmonary function
  - Impact of mechanical ventilation on cardiac output
- Neonatal thoracic mechanics differ significantly from adults:
  - Higher compliance of the chest wall
  - Different muscle mechanics
  - Less stable chest wall structure
  - Greater susceptibility to respiratory distress
- The model can simulate various clinical scenarios:
  - Spontaneous breathing
  - Mechanical ventilation
  - CPR
  - Pneumothorax
  - Respiratory distress syndrome
- This class is fundamental to the integration of cardiovascular and respiratory systems in the neonatal model
