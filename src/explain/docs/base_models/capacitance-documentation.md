# Capacitance Class Documentation

## Overview

The `Capacitance` class models an elastic compartment in the physiological system, representing blood vessels or organs that can store volume and generate pressure. It extends the `BaseModelClass` and implements specific capacitance-related properties and behaviors for fluid dynamics in the neonatal physiological model.

## Location

`Capacitance.js` in the model structure.

## Import Dependencies

```javascript
import { BaseModelClass } from "./BaseModelClass";
```

The class extends the BaseModelClass which provides the foundational model structure.

## Class Structure

### Static Properties

```javascript
static model_type = "Capacitance";
model_interface = [];
```

- `model_type`: Identifies this class as a "Capacitance" model
- `model_interface`: Array for interface definitions (empty in this implementation)

### Constructor

```javascript
constructor(model_ref, name = "")
```

**Parameters:**
- `model_ref`: Reference to the model engine
- `name`: Optional name for the model instance (defaults to empty string)

**Independent Properties:**
- `u_vol`: Unstressed volume of the capacitance in liters (L)
- `el_base`: Baseline elastance of the capacitance in mmHg/L
- `el_k`: Non-linear elastance factor (unitless)
- `pres_ext`: External pressure in mmHg

**Scaling Factors:**
- `u_vol_factor`: Factor to scale unstressed volume (default: 1.0)
- `el_base_factor`: Factor to scale baseline elastance (default: 1.0)
- `el_k_factor`: Factor to scale non-linear elastance (default: 1.0)

**Dependent Properties:**
- `vol`: Current volume in liters (L)
- `pres`: Total pressure in mmHg
- `pres_in`: Recoil pressure of the elastance in mmHg

**Internal Variables:**
- `_el`: Calculated elastance
- `_u_vol`: Calculated unstressed volume
- `_el_k`: Calculated non-linear elastance factor

### Methods

#### `calc_model()`

Orchestrates the calculation sequence for the capacitance model.

**Functionality:**
1. Calls `calc_elastances()` to update elastance values
2. Calls `calc_volumes()` to update volume values
3. Calls `calc_pressure()` to calculate the resulting pressures

#### `calc_elastances()`

Calculates the effective elastance and non-linear elastance factor based on base values and modifying factors.

**Calculations:**
- `_el = el_base + (el_base_factor - 1) * el_base`
- `_el_k = el_k + (el_k_factor - 1) * el_k`

#### `calc_volumes()`

Calculates the effective unstressed volume based on the base value and modifying factor.

**Calculations:**
- `_u_vol = u_vol + (u_vol_factor - 1) * u_vol`

#### `calc_pressure()`

Calculates the pressure inside the capacitance based on its volume, elastance, and external pressures.

**Calculations:**
1. Calculates recoil pressure: `pres_in = _el_k * (vol - _u_vol)² + _el * (vol - _u_vol)`
2. Adds external pressure to get total pressure: `pres = pres_in + pres_ext`
3. Resets external pressure to zero

#### `volume_in(dvol)`

Adds volume to the capacitance.

**Parameters:**
- `dvol`: Amount of volume to add in liters (L)

**Functionality:**
- Increments the current volume
- Includes a check for non-negative volume

#### `volume_out(dvol)`

Removes volume from the capacitance.

**Parameters:**
- `dvol`: Amount of volume to remove in liters (L)

**Returns:**
- Volume that could not be removed (if any)

**Functionality:**
- Decrements the current volume
- Handles the case where volume would go below zero
- Returns unremoved volume if volume would go negative

## Physiological Significance

The Capacitance class implements a pressure-volume relationship following:
- Linear component: `E * (V - V₀)` where E is elastance, V is current volume, and V₀ is unstressed volume
- Non-linear component: `K * (V - V₀)²` where K is the non-linear factor

This relationship models the elastic behavior of blood vessels and organs, allowing for:
1. Volume storage with corresponding pressure generation
2. Non-linear compliance that increases with distension
3. External pressure effects (e.g., intrathoracic pressure on vessels)

## Usage Example

```javascript
// Create a capacitance model for the systemic arteries
const systemicArteries = new Capacitance(modelEngine, "systemic_arteries");

// Initialize with physiological parameters
systemicArteries.u_vol = 0.5;    // Unstressed volume of 0.5 L
systemicArteries.el_base = 2.0;  // Elastance of 2.0 mmHg/L
systemicArteries.el_k = 0.05;    // Non-linear factor of 0.05
systemicArteries.vol = 0.7;      // Initial volume of 0.7 L

// Enable the model
systemicArteries.is_enabled = true;

// During simulation, fluid can be added or removed
systemicArteries.volume_in(0.05);  // Add 50 mL of blood
let removed = systemicArteries.volume_out(0.03);  // Remove 30 mL of blood
```

## Notes

- The capacitance model is fundamental to the circulatory system modeling
- The non-linear elastance provides more realistic pressure-volume relationships at higher distension
- External pressure allows modeling of intrathoracic pressure effects on vessels
- Volume transfers should maintain conservation of mass in the overall system
