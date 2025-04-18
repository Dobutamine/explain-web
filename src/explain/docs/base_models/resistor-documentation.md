# Resistor Class Documentation

## Overview

The `Resistor` class extends the `BaseModelClass` to model flow resistance between two compartments in the neonatal physiological system. It implements pressure-driven flow with potentially different forward and backward resistances, non-linear resistance effects, and flow control capabilities.

## Location

`Resistor.js` in the model structure.

## Import Dependencies

```javascript
import { BaseModelClass } from "./BaseModelClass";
```

The class extends the BaseModelClass which provides the foundational model structure.

## Class Structure

### Static Properties

```javascript
static model_type = "Resistor";
model_interface = [...];
```

- `model_type`: Identifies this class as a "Resistor" model
- `model_interface`: Array defining the user interface for this model, allowing control of flow properties, resistances, and non-linear resistance factor

### Constructor

```javascript
constructor(model_ref, name = "")
```

**Parameters:**
- `model_ref`: Reference to the model engine
- `name`: Optional name for the model instance (defaults to empty string)

**Independent Properties:**
- `r_for`: Forward flow resistance in mmHg/(L·s), default: 1.0
- `r_back`: Backward flow resistance in mmHg/(L·s), default: 1.0
- `r_k`: Non-linear resistance factor (unitless), default: 0.0
- `comp_from`: Name of the upstream component
- `comp_to`: Name of the downstream component
- `no_flow`: Flag to prevent any flow across this resistor, default: false
- `no_back_flow`: Flag to prevent backward flow, default: false
- `p1_ext`: External pressure on the inlet in mmHg, default: 0.0
- `p2_ext`: External pressure on the outlet in mmHg, default: 0.0

**Modulating Factors:**
- `r_factor`: Resistance scaling factor, default: 1.0
- `r_k_factor`: Non-linear resistance scaling factor, default: 1.0

**Dependent Properties:**
- `flow`: Current flow rate in L/s

**Internal Properties:**
- `_comp_from`: Reference to the upstream component
- `_comp_to`: Reference to the downstream component
- `_r_for`: Calculated forward resistance, default: 1000
- `_r_back`: Calculated backward resistance, default: 1000
- `_r_k`: Calculated non-linear resistance factor, default: 0

### Methods

#### `calc_model()`

Orchestrates the calculation sequence for the resistor model.

**Functionality:**
1. Retrieves references to the upstream and downstream components
2. Calls `calc_resistance()` to update resistance values
3. Calls `calc_flow()` to calculate the flow and update volumes

#### `calc_resistance()`

Calculates the effective resistances based on base values, modifying factors, and current flow.

**Calculations:**
1. Applies the resistance factor to both forward and backward resistance:
   - `_r_for = r_for + (r_factor - 1) * r_for`
   - `_r_back = r_back + (r_factor - 1) * r_back`
2. Applies the non-linear factor:
   - `_r_k = r_k + (r_k_factor - 1) * r_k`
3. Makes the resistances flow-dependent:
   - `_r_for += _r_k * flow²`
   - `_r_back += _r_k * flow²`

#### `calc_flow()`

Calculates the flow between components based on pressure differences and resistance.

**Calculations:**
1. Gets total pressures by incorporating external pressures:
   - `_p1_t = _comp_from.pres + p1_ext`
   - `_p2_t = _comp_to.pres + p2_ext`
2. Resets external pressures to zero
3. Returns if `no_flow` is true
4. For forward flow (`_p1_t >= _p2_t`):
   - Calculates flow: `flow = (_p1_t - _p2_t - _r_k * flow²) / _r_for`
   - Updates volumes of connected components
5. For backward flow (`_p1_t < _p2_t` and `!no_back_flow`):
   - Calculates flow: `flow = (_p1_t - _p2_t + _r_k * flow²) / _r_back`
   - Updates volumes of connected components

## Physiological Significance

The Resistor class models flow resistance in physiological systems with several key features:

1. **Pressure-Driven Flow**:
   - Implements Ohm's law analog for fluid flow (ΔP = Q·R)
   - Direction determined by pressure gradient between compartments

2. **Asymmetric Resistance**:
   - Separate forward and backward resistance values
   - Can model physiological valves by setting high backward resistance
   - Can implement one-way flow using the `no_back_flow` property

3. **Non-Linear Resistance**:
   - Flow-dependent resistance using the quadratic term `r_k * flow²`
   - Models turbulent flow effects at higher flow rates
   - Captures physiological resistance increase with higher flow rates

4. **Flow Control**:
   - Complete flow blockage via `no_flow` property
   - Direction-specific blockage via `no_back_flow` property
   - External pressure effects on inlet and outlet

5. **Mass Conservation**:
   - Handles volume transfer between compartments
   - Manages scenarios where requested volume cannot be removed

## Usage Example

```javascript
// Create a resistor model for the aortic valve
const aorticValve = new Resistor(modelEngine, "aortic_valve");

// Initialize with physiological parameters
aorticValve.r_for = 25;          // Forward resistance of 25 mmHg/(L·s)
aorticValve.r_back = 1000000;    // Very high backward resistance to model valve
aorticValve.r_k = 0.5;           // Non-linear resistance factor
aorticValve.comp_from = "left_ventricle";  // Upstream component
aorticValve.comp_to = "aorta";              // Downstream component
aorticValve.no_back_flow = true;  // Enforce one-way flow like a valve

// Enable the model
aorticValve.is_enabled = true;

// Example for a vascular vessel with bidirectional flow
const systemicArtery = new Resistor(modelEngine, "systemic_artery");
systemicArtery.r_for = 100;      // Forward resistance
systemicArtery.r_back = 100;     // Equal backward resistance
systemicArtery.r_k = 1.0;        // Non-linear factor for turbulent flow at higher rates
systemicArtery.comp_from = "aorta";
systemicArtery.comp_to = "systemic_capillaries";
systemicArtery.no_back_flow = false;  // Allow bidirectional flow

// Dynamically changing resistance (e.g., vasoconstriction)
systemicArtery.r_factor = 2.0;   // Double the resistance to simulate vasoconstriction
```

## Notes

- The Resistor class is fundamental for connecting compartments in the circulatory system
- Non-linear resistance increases with the square of the flow rate, modeling turbulence
- One-way valves can be implemented with high backward resistance or by setting no_back_flow
- External pressures can model compression effects on vessels
- The resistance calculation is recursive, as the current flow is used to update flow-dependent resistance
- Flow is calculated in L/s, but volume transfers use L by multiplying by the timestep (_t)
- The model transfers volume between connected components during each calculation step
