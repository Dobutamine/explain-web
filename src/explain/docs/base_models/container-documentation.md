# Container Class Documentation

## Overview

The `Container` class extends the `BaseModelClass` to implement a composite physical container that can hold multiple other model components in the neonatal physiological system. It aggregates the volumes of contained components, computes elastic recoil pressure, and transmits this pressure to all contained components as an external pressure.

## Location

`Container.js` in the `../base_models/` directory structure.

## Import Dependencies

```javascript
import { BaseModelClass } from "../base_models/BaseModelClass";
```

The class extends the BaseModelClass which provides the foundational model structure.

## Class Structure

### Static Properties

```javascript
static model_type = "Container";
model_interface = [];
```

- `model_type`: Identifies this class as a "Container" model
- `model_interface`: Array for interface definitions (empty in this implementation)

### Constructor

```javascript
constructor(model_ref, name = "")
```

**Parameters:**
- `model_ref`: Reference to the model engine
- `name`: Optional name for the model instance (defaults to empty string)

**Independent Properties:**
- `u_vol`: Unstressed volume in liters (L)
- `el_base`: Baseline elastance in mmHg/L
- `el_k`: Non-linear elastance factor (unitless)
- `pres_ext`: External pressure in mmHg
- `vol_extra`: Additional volume of the container in liters (L)
- `contained_components`: Array of names of models contained within this container

**Scaling Factors:**
- `u_vol_factor`: Unstressed volume scaling factor (default: 1.0)
- `el_base_factor`: Elastance scaling factor (default: 1.0)
- `el_k_factor`: Non-linear elastance scaling factor (default: 1.0)

**Dependent Properties:**
- `vol`: Total container volume in liters (L)
- `pres`: Total pressure in mmHg
- `pres_in`: Recoil pressure (internal pressure) in mmHg

**Internal Variables:**
- `_el`: Calculated elastance
- `_u_vol`: Calculated unstressed volume
- `_el_k`: Calculated non-linear elastance factor

### Methods

#### `calc_model()`

Orchestrates the calculation sequence for the container model.

**Functionality:**
1. Calls `calc_volumes()` to calculate total volume
2. Calls `calc_elastances()` to update elastance values
3. Calls `calc_pressure()` to calculate and transmit pressure

#### `calc_elastances()`

Calculates the effective elastance and non-linear elastance factor based on base values and modifying factors.

**Calculations:**
- `_el = el_base + (el_base_factor - 1) * el_base`
- `_el_k = el_k + (el_k_factor - 1) * el_k`

#### `calc_volumes()`

Calculates the total volume of the container by adding up the volumes of all contained components.

**Calculations:**
1. Starts with `vol_extra` as the base volume
2. Adds the volume of each contained component
3. Calculates the effective unstressed volume: `_u_vol = u_vol + (u_vol_factor - 1) * u_vol`

#### `calc_pressure()`

Calculates the container pressure and applies it to all contained components.

**Calculations:**
1. Calculates recoil pressure: `pres_in = _el_k * (vol - _u_vol)² + _el * (vol - _u_vol)`
2. Adds external pressure: `pres = pres_in + pres_ext`
3. Distributes this pressure to all contained components as external pressure
4. Resets the external pressure to zero

## Physiological Significance

The Container class models physiological compartments that physically contain other structures:

1. **Anatomical Enclosures**:
   - Models structures like the thoracic cavity, pericardium, skull, or abdominal cavity
   - Encapsulates multiple physiological components and influences their behavior

2. **Volume-Pressure Relationships**:
   - Implements the concept that total volume within a container affects pressure
   - Models how increasing volume in a fixed space raises pressure

3. **Pressure Transmission**:
   - External pressure on the container is transmitted to all contained components
   - Models mechanical coupling between structures sharing the same physical space

4. **Composite Volume Calculation**:
   - Aggregates volumes of all contained structures
   - Accounts for additional volume (vol_extra) not represented by contained components

5. **Elastic Properties**:
   - Container walls have elastic properties (compliance)
   - Non-linear elastance captures physiological stiffening at extreme volumes

## Usage Example

```javascript
// Create a thoracic cavity container
const thorax = new Container(modelEngine, "thoracic_cavity");

// Initialize with physiological parameters
thorax.u_vol = 1.0;           // Unstressed volume of 1.0 L
thorax.el_base = 5.0;         // Elastance of 5.0 mmHg/L
thorax.el_k = 0.1;            // Non-linear elastance factor
thorax.vol_extra = 0.2;       // Additional volume of 0.2 L

// Define contained components
thorax.contained_components = [
  "left_lung", 
  "right_lung",
  "heart_pericardium",
  "thoracic_blood_vessels",
  "thoracic_lymphatics"
];

// Enable the model
thorax.is_enabled = true;

// During simulation - calculating changes due to respiration
// External pressure applied to thorax (e.g., from respiratory muscles)
thorax.pres_ext = -4.0;       // Negative pressure during inspiration

// When the model runs, this pressure will be transmitted to all contained components
modelEngine.step();           // This will call calc_model() on thorax and all other components
```

## Notes

- The Container class provides a way to model anatomical compartments that physically contain other structures
- Changes in any contained component's volume affect the container's pressure
- The pressure generated by the container affects all contained components equally
- This bidirectional relationship creates realistic mechanical coupling between components
- The container has its own elastic properties independent of the contained components
- Additional volume (vol_extra) allows for modeling space not accounted for by the contained components
- This model is essential for simulating compartmental phenomena like:
  - Respiratory mechanics (thoracic cavity containing lungs)
  - Intracranial pressure dynamics (skull containing brain, CSF, and blood)
  - Cardiac tamponade (pericardium containing heart)
  - Abdominal compartment syndrome
