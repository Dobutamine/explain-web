# Vein Class Documentation

## Overview

The `Vein` class extends the `BloodVessel` class to specifically model venous vessels in the neonatal physiological system. It specializes the blood vessel model for the capacitance vessels that serve as blood reservoirs and return blood to the heart.

## Location

`Vein.js` in the model structure.

## Import Dependencies

```javascript
import { BloodVessel } from "../component_models/BloodVessel";
```

The class extends the BloodVessel class which provides the blood vessel functionality.

## Class Structure

### Static Properties

```javascript
static model_type = "Vein";
```

- `model_type`: Identifies this class as a "Vein" model

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

The Vein class specializes the BloodVessel class with these key features:

1. **Capacitance Vessels**:
   - Represents the major blood volume reservoir in the circulatory system
   - Contains approximately 70% of the total blood volume at rest
   - Highly distensible vessels with lower pressure than arterial system

2. **Autonomic Control**:
   - Default ans_sensitivity of 1.0 reflects venoconstriction capabilities
   - Autonomic control allows for mobilization of blood volume during stress
   - Important for modeling cardiac preload and venous return

3. **Mechanical Properties**:
   - Inherits elastance and resistance coupling from BloodVessel
   - Standard alpha value of 1.0 maintains the established elastance-resistance relationship
   - Typically has lower elastance values than arteries (more compliant)

4. **Physiological Role**:
   - Models the venous return pathway to the heart
   - Serves as a reservoir for blood volume regulation
   - Contributes to central venous pressure and cardiac preload
   - Affected by gravitational forces and external pressures

## Usage Example

```javascript
// Create a vein model for the systemic venous system
const systemicVein = new Vein(modelEngine, "systemic_vein");

// Initialize with physiological parameters
systemicVein.u_vol = 2.0;           // Unstressed volume of 2000 mL (large capacity)
systemicVein.el_base = 0.5;         // Low baseline elastance of 0.5 mmHg/mL (compliant)
systemicVein.el_k = 0.02;           // Non-linear elastance factor
systemicVein.vol = 2.5;             // Initial volume of 2500 mL

// Note: alpha and ans_sensitivity are already set to appropriate values
// (alpha = 1.0, ans_sensitivity = 1.0)

// Set up blood properties
systemicVein.to2 = 5.0;             // Venous oxygen content (mmol/L)
systemicVein.tco2 = 28.0;           // Venous carbon dioxide content (mmol/L)
systemicVein.ph = 7.36;             // Venous pH

// Connect to associated resistors
systemicVein.components = {
  "venous_inflow": {
    model_type: "BloodVesselResistor"
  },
  "venous_outflow": {
    model_type: "BloodVesselResistor"
  }
};

// Enable the model
systemicVein.is_enabled = true;

// Simulation examples:

// Hemorrhage compensation - venoconstriction to maintain central blood volume
systemicVein.r_ans_factor = 1.8;    // 80% increase in resistance due to sympathetic stimulation

// Effects of positive pressure ventilation
systemicVein.pres_ext = 5.0;        // 5 mmHg external pressure from positive pressure ventilation
```

## Notes

- The Vein class is a specialized version of BloodVessel optimized for venous vessels
- While functionally similar to Artery and Arteriole classes in implementation, it represents a physiologically distinct vessel type
- Veins typically have:
  - Thinner walls than arteries
  - Larger diameters and lumens
  - Lower pressure
  - Higher compliance (lower elastance)
  - Larger volume capacity
- The class inherits all functionality from BloodVessel, including:
  - Blood composition tracking
  - Elastic properties
  - Integration with resistors
  - Response to autonomic and circulatory factors
- The model allows for both systemic and pulmonary venous representation
- Venous physiology is particularly important in neonatal models due to:
  - Transitional circulation changes after birth
  - Sensitivity to intrathoracic pressure changes with ventilation
  - Blood volume redistribution during adaptation to extrauterine life
