# HeartValve Class Documentation

## Overview

The `HeartValve` class extends the `Resistor` class to specifically model cardiac valves in the neonatal physiological system. It provides a specialized type for representing the one-way valves that control blood flow through the heart.

## Location

`HeartValve.js` in the model structure.

## Import Dependencies

```javascript
import { Resistor } from "../base_models/Resistor";
```

The class extends the Resistor class which provides the flow resistance functionality.

## Class Structure

### Static Properties

```javascript
static model_type = "HeartValve";
```

- `model_type`: Identifies this class as a "HeartValve" model

### Inherited Functionality

While the provided implementation is minimal, the class inherits all functionality from the Resistor parent class:

- Flow calculation based on pressure difference and resistance
- Separate forward and backward resistance values
- No backflow capability for implementing valve function
- Volume transfer between compartments

## Physiological Significance

The HeartValve class represents cardiac valves with these implied features:

1. **One-way Flow**:
   - Models the unidirectional flow of blood through the heart
   - Prevents backflow when upstream pressure falls below downstream pressure
   - Simulates the function of atrioventricular and semilunar valves

2. **Valve Dynamics**:
   - Implements pressure-dependent opening and closing
   - Flow occurs only when upstream pressure exceeds downstream pressure
   - Closure occurs when pressure gradient reverses

3. **Valve Types**:
   - Can represent all four cardiac valves:
     - Tricuspid valve (right atrium to right ventricle)
     - Pulmonary valve (right ventricle to pulmonary artery)
     - Mitral valve (left atrium to left ventricle)
     - Aortic valve (left ventricle to aorta)

4. **Potential Extensions**:
   - Though minimally implemented, the structure allows for future modeling of:
     - Valve stenosis (increased forward resistance)
     - Valve regurgitation (imperfect closure, allowing backflow)
     - Valve prolapse or structural abnormalities

## Usage Example

```javascript
// Create a heart valve model for the mitral valve
const mitralValve = new HeartValve(modelEngine, "mitral_valve");

// Initialize with physiological parameters
mitralValve.r_for = 25;               // Forward resistance of 25 mmHg/(L·s)
mitralValve.r_back = 10000000;        // Very high backward resistance to prevent backflow
mitralValve.r_k = 0.1;                // Non-linear resistance factor
mitralValve.comp_from = "left_atrium";  // Upstream component
mitralValve.comp_to = "left_ventricle";  // Downstream component
mitralValve.no_back_flow = true;      // Enforce one-way flow

// Enable the model
mitralValve.is_enabled = true;

// Example of simulating mitral stenosis
mitralValve.r_for = 250;              // Increased forward resistance (10x normal)

// Example of simulating mitral regurgitation
mitralValve.no_back_flow = false;     // Allow backflow
mitralValve.r_back = 100;             // Lower backward resistance
```

## Notes

- The HeartValve class is a minimal extension of Resistor specifically for cardiac valves
- Currently, it only defines a unique model_type without adding additional functionality
- It inherits all flow calculation, resistance properties, and volume transfer methods from Resistor
- The model is typically used with the no_back_flow property set to true to simulate valve function
- Using very high backward resistance along with no_back_flow provides redundant protection against backflow
- The class can be used to model normal valves as well as pathological conditions:
  - Valve stenosis: increased forward resistance
  - Valve regurgitation: allowing backflow or reduced backward resistance
  - Valve prolapse: dynamic changes in resistance properties
- Neonatal cardiac valves have some unique characteristics that can be modeled with appropriate parameters:
  - Smaller valve areas
  - Different pressure gradients than adults
  - Transitional circulation effects
  - Potential congenital abnormalities
