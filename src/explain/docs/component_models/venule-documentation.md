# Venule Class Documentation

## Overview

The `Venule` class extends the `BloodVessel` class to specifically model venular vessels in the neonatal physiological system. It specializes the blood vessel model for the small post-capillary vessels that collect blood from capillary beds and deliver it to larger veins.

## Location

`Venule.js` in the model structure.

## Import Dependencies

```javascript
import { BloodVessel } from "../component_models/BloodVessel";
```

The class extends the BloodVessel class which provides the blood vessel functionality.

## Class Structure

### Static Properties

```javascript
static model_type = "Venule";
```

- `model_type`: Identifies this class as a "Venule" model

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

The Venule class specializes the BloodVessel class with these key features:

1. **Postcapillary Vessels**:
   - Represents the initial collection vessels of the venous system
   - Typically 10-200 micrometers in diameter
   - Bridges between capillary beds and larger veins

2. **Fluid Exchange**:
   - Key site for fluid reabsorption into the vascular space
   - Lower hydrostatic pressure than capillaries
   - Important for maintaining fluid balance

3. **Autonomic Control**:
   - Default ans_sensitivity of 1.0 indicates venular tone can be regulated
   - Less autonomic control than arterioles but more than capillaries
   - Contributes to vascular resistance and capacitance

4. **Mechanical Properties**:
   - Inherits elastance and resistance coupling from BloodVessel
   - More compliant than arterioles but less than larger veins
   - Contributes to post-capillary resistance

5. **Physiological Role**:
   - Models venous drainage pathways from tissues
   - Participates in fluid exchange between blood and interstitium
   - Contributes to venous resistance and pressure gradients
   - Site of white blood cell diapedesis during inflammation

## Usage Example

```javascript
// Create a venule model for muscle tissue
const muscleVenule = new Venule(modelEngine, "muscle_venule");

// Initialize with physiological parameters
muscleVenule.u_vol = 0.01;          // Unstressed volume of 10 mL
muscleVenule.el_base = 2.0;         // Baseline elastance of 2.0 mmHg/mL
muscleVenule.el_k = 0.05;           // Non-linear elastance factor
muscleVenule.vol = 0.015;           // Initial volume of 15 mL

// Note: alpha and ans_sensitivity are already set to appropriate values
// (alpha = 1.0, ans_sensitivity = 1.0)

// Set up blood properties
muscleVenule.to2 = 4.0;             // Venular oxygen content (mmol/L)
muscleVenule.tco2 = 30.0;           // Venular carbon dioxide content (mmol/L)
muscleVenule.ph = 7.35;             // Venular pH

// Connect to associated resistors
muscleVenule.components = {
  "capillary_to_venule": {
    model_type: "BloodVesselResistor"
  },
  "venule_to_vein": {
    model_type: "BloodVesselResistor"
  }
};

// Enable the model
muscleVenule.is_enabled = true;

// Simulation examples:

// Inflammation - increased venular permeability
muscleVenule.el_base_factor = 0.8;  // 20% decrease in elastance to represent increased compliance

// Venoconstriction during hemorrhage
muscleVenule.r_ans_factor = 1.3;    // 30% increase in resistance due to sympathetic stimulation
```

## Notes

- The Venule class is a specialized version of BloodVessel optimized for small post-capillary vessels
- While functionally similar to other vessel classes in implementation, it represents a physiologically distinct vessel type
- Venules typically have:
  - Larger diameters than capillaries but smaller than veins
  - Thinner walls than arterioles
  - Lower pressure than capillaries
  - Moderate compliance (between capillaries and veins)
- The class inherits all functionality from BloodVessel, including:
  - Blood composition tracking
  - Elastic properties
  - Integration with resistors
  - Response to autonomic and circulatory factors
- Venular physiology is particularly important in neonatal models for:
  - Fluid balance during adaptation to extrauterine life
  - Immune responses and inflammation
  - Contribution to venous return dynamics
