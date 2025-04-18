# TimeVaryingElastance Class Documentation

## Overview

The `TimeVaryingElastance` class extends the `BaseModelClass` to model compartments with dynamically changing elastic properties, particularly suited for modeling cardiac chambers (ventricles and atria) in the neonatal physiological system. It implements a time-varying elastance model that can transition between minimum and maximum elastance states based on an activation factor.

## Location

`TimeVaryingElastance.js` in the model structure.

## Import Dependencies

```javascript
import { BaseModelClass } from "./BaseModelClass";
```

The class extends the BaseModelClass which provides the foundational model structure.

## Class Structure

### Static Properties

```javascript
static model_type = "TimeVaryingElastance";
model_interface = [];
```

- `model_type`: Identifies this class as a "TimeVaryingElastance" model
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
- `el_min`: Minimal elastance (end-diastolic) in mmHg/L
- `el_max`: Maximal elastance (end-systolic) in mmHg/L
- `el_k`: Non-linear elastance factor (unitless)
- `pres_ext`: External pressure in mmHg

**Modulating Factors:**
- `act_factor`: Activation factor from the heart model (0.0-1.0)
- Scaling factors:
  - `u_vol_factor`: Unstressed volume scaling factor (default: 1.0)
  - `el_min_factor`: Minimal elastance scaling factor (default: 1.0)
  - `el_max_factor`: Maximal elastance scaling factor (default: 1.0)
  - `el_k_factor`: Non-linear elastance scaling factor (default: 1.0)

**Dependent Properties:**
- `vol`: Current volume in liters (L)
- `pres`: Total pressure in mmHg
- `pres_in`: Recoil pressure (internal pressure)

**Internal Properties:**
- `_u_vol`: Calculated unstressed volume
- `_el_min`: Calculated minimal elastance
- `_el_max`: Calculated maximal elastance
- `_el_k`: Calculated non-linear elastance factor

### Methods

#### `calc_model()`

Orchestrates the calculation sequence for the time-varying elastance model.

**Functionality:**
1. Calls `calc_elastances()` to update elastance values
2. Calls `calc_volumes()` to update volume values
3. Calls `calc_pressure()` to calculate the resulting pressures

#### `calc_elastances()`

Calculates the effective elastance values based on base values and modifying factors.

**Calculations:**
- `_el_min = el_min + (el_min_factor - 1) * el_min`
- `_el_max = el_max + (el_max_factor - 1) * el_max`
- `_el_k = el_k + (el_k_factor - 1) * el_k`

#### `calc_volumes()`

Calculates the effective unstressed volume based on the base value and modifying factor.

**Calculations:**
- `_u_vol = u_vol + (u_vol_factor - 1) * u_vol`

#### `calc_pressure()`

Calculates the pressure inside the compartment based on the time-varying elastance model.

**Calculations:**
1. Calculates end-systolic pressure: `p_ms = (vol - _u_vol) * _el_max`
2. Calculates end-diastolic pressure: `p_ed = _el_k * (vol - _u_vol)² + _el_min * (vol - _u_vol)`
3. Interpolates current pressure based on activation: `pres_in = (p_ms - p_ed) * act_factor + p_ed`
4. Adds external pressure: `pres = pres_in + pres_ext`
5. Resets external pressure to zero

#### `volume_in(dvol, comp_from)`

Adds volume to the compartment.

**Parameters:**
- `dvol`: Amount of volume to add in liters (L)
- `comp_from`: Source compartment (unused in this implementation)

**Functionality:**
- Increments the current volume
- Includes a check for non-negative volume

#### `volume_out(dvol)`

Removes volume from the compartment.

**Parameters:**
- `dvol`: Amount of volume to remove in liters (L)

**Returns:**
- Volume that could not be removed (if any)

**Functionality:**
- Decrements the current volume
- Handles the case where volume would go below zero
- Returns unremoved volume if volume would go negative

## Physiological Significance

The TimeVaryingElastance class implements a cardiac chamber model with these key features:

1. **Cardiac Cycle Simulation**:
   - Models the transition between diastole (relaxation) and systole (contraction)
   - Uses an activation factor to control the cardiac cycle phase
   - Transitions smoothly between minimum elastance (end-diastolic) and maximum elastance (end-systolic)

2. **Pressure-Volume Relationship**:
   - End-diastolic pressure-volume relationship (EDPVR): `p_ed = _el_k * (vol - _u_vol)² + _el_min * (vol - _u_vol)`
   - End-systolic pressure-volume relationship (ESPVR): `p_ms = (vol - _u_vol) * _el_max`
   - Current pressure interpolated between EDPVR and ESPVR based on activation

3. **Non-linear Compliance**:
   - Implements non-linear end-diastolic pressure-volume relationship with quadratic term
   - Captures the physiological stiffening of cardiac chambers at higher volumes

4. **External Influences**:
   - External pressure affects the total pressure
   - Scaling factors allow for modulation of chamber properties

## Usage Example

```javascript
// Create a time-varying elastance model for the left ventricle
const leftVentricle = new TimeVaryingElastance(modelEngine, "left_ventricle");

// Initialize with physiological parameters
leftVentricle.u_vol = 0.01;     // Unstressed volume of 10 mL
leftVentricle.el_min = 0.5;     // Minimal elastance of 0.5 mmHg/mL
leftVentricle.el_max = 10.0;    // Maximal elastance of 10 mmHg/mL
leftVentricle.el_k = 0.05;      // Non-linear elastance factor
leftVentricle.vol = 0.02;       // Initial volume of 20 mL

// Enable the model
leftVentricle.is_enabled = true;

// During simulation, activation factor changes with cardiac cycle
// Diastole
leftVentricle.act_factor = 0.0;  // Relaxed state
leftVentricle.calc_model();      // Calculate pressure at current state
// Blood fills ventricle
leftVentricle.volume_in(0.03, someAtriumModel);

// Systole
leftVentricle.act_factor = 1.0;  // Fully contracted state
leftVentricle.calc_model();      // Calculate pressure at current state
// Blood ejected from ventricle
leftVentricle.volume_out(0.04);
```

## Notes

- The TimeVaryingElastance model is particularly designed for cardiac chambers
- The activation factor (act_factor) drives the transition between diastolic and systolic states
- Non-linear EDPVR provides physiologically realistic behavior at extreme volumes
- External pressure can represent intrathoracic or pericardial pressure
- Unstressed volume represents the chamber volume at zero pressure
- Unlike static Capacitance models, elastance varies with time/activation
