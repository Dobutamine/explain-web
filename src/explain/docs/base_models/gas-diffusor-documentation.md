# GasDiffusor Class Documentation

## Overview

The `GasDiffusor` class extends the `BaseModelClass` to model the diffusion of gases between two gas compartments in the neonatal physiological system. It implements diffusion-based transfer of oxygen, carbon dioxide, nitrogen, and other gases across barriers between gas-containing compartments without bulk flow.

## Location

`GasDiffusor.js` in the model structure.

## Import Dependencies

```javascript
import { BaseModelClass } from "./BaseModelClass";
import { calc_gas_composition } from "../helpers/GasComposition"
```

The class extends the BaseModelClass and uses a helper function to calculate gas composition.

## Class Structure

### Static Properties

```javascript
static model_type = "GasDiffusor";
model_interface = [];
```

- `model_type`: Identifies this class as a "GasDiffusor" model
- `model_interface`: Array for interface definitions (empty in this implementation)

### Constructor

```javascript
constructor(model_ref, name = "")
```

**Parameters:**
- `model_ref`: Reference to the model engine
- `name`: Optional name for the model instance (defaults to empty string)

**Independent Properties:**
- `comp_gas1`: Name of the first gas-containing model
- `comp_gas2`: Name of the second gas-containing model
- `dif_o2`: Diffusion constant for oxygen in mmol/(mmHg·s) (default: 0.01)
- `dif_co2`: Diffusion constant for carbon dioxide in mmol/(mmHg·s) (default: 0.01)
- `dif_n2`: Diffusion constant for nitrogen in mmol/(mmHg·s) (default: 0.01)
- `dif_other`: Diffusion constant for other gases in mmol/(mmHg·s) (default: 0.01)

**Modulating Factors:**
- `dif_o2_factor`: Factor modifying the oxygen diffusion constant (default: 1.0)
- `dif_co2_factor`: Factor modifying the carbon dioxide diffusion constant (default: 1.0)
- `dif_n2_factor`: Factor modifying the nitrogen diffusion constant (default: 1.0)
- `dif_other_factor`: Factor modifying the diffusion constant for other gases (default: 1.0)

**Internal Properties:**
- `_comp_gas1`: Reference to the first gas-containing model
- `_comp_gas2`: Reference to the second gas-containing model

### Methods

#### `calc_model()`

Performs the diffusion calculations between two gas compartments.

**Functionality:**
1. Retrieves references to both gas compartments
2. Calls `calc_gas_composition()` to update gas parameters for both compartments
3. Applies diffusion factors to the base diffusion constants
4. For each gas (O₂, CO₂, N₂, other):
   - Calculates diffusion based on partial pressure difference
   - Updates gas concentrations in both compartments

**Note:** There appears to be a typo in the code where `dif_n22_factor` is used instead of `dif_n2_factor`.

## Physiological Significance

The GasDiffusor class models diffusive exchange between gas compartments with these key features:

1. **Partial Pressure-Driven Diffusion**:
   - All gases diffuse based on partial pressure gradients (Fick's law)
   - Separate diffusion constants for each gas reflect their different diffusion properties
   - Carbon dioxide typically diffuses faster than oxygen, which diffuses faster than nitrogen

2. **Bidirectional Exchange**:
   - Direction determined solely by partial pressure gradients
   - Allows for realistic equilibration between compartments

3. **Mass Conservation**:
   - Maintains mass balance of gases between compartments
   - Accounts for compartment volumes when calculating new concentrations

4. **Gas-Gas Interface**:
   - Models exchange between two gas compartments
   - Simulates physiological scenarios like gas exchange between connected airways

5. **Multiple Gas Support**:
   - Handles all respiratory gases (O₂, CO₂, N₂)
   - Includes support for other gases as a collective category

## Usage Example

```javascript
// Create a gas diffusor between two airway compartments
const airwayDiffusor = new GasDiffusor(modelEngine, "conducting_airway_diffusion");

// Initialize with physiological parameters
airwayDiffusor.comp_gas1 = "upper_airway";      // First gas compartment
airwayDiffusor.comp_gas2 = "lower_airway";      // Second gas compartment
airwayDiffusor.dif_o2 = 0.05;                   // Oxygen diffusion constant
airwayDiffusor.dif_co2 = 0.06;                  // Carbon dioxide diffusion constant
airwayDiffusor.dif_n2 = 0.03;                   // Nitrogen diffusion constant
airwayDiffusor.dif_other = 0.04;                // Other gases diffusion constant

// Enable the model
airwayDiffusor.is_enabled = true;

// Simulation of diffusion impairment
airwayDiffusor.dif_o2_factor = 0.7;    // Reduce oxygen diffusion by 30%
airwayDiffusor.dif_co2_factor = 0.8;   // Reduce carbon dioxide diffusion by 20%
```

## Notes

- The GasDiffusor connects two gas compartments to model diffusion-based exchange
- Gas exchange is driven by partial pressure gradients, following Fick's law of diffusion
- The system automatically updates gas composition through `calc_gas_composition()`
- Diffusion constants reflect the gas properties, barrier permeability, surface area, and thickness
- The exchange is time-dependent, with fluxes multiplied by the time step
- The model can represent various physiological interfaces:
  - Diffusion between airway segments
  - Gas exchange between alveolar regions
  - Equilibration between different gas compartments
  - Gas diffusion through tissues
- Pathological conditions can be simulated by modifying diffusion factors
- Different gases have different diffusion rates based on molecular properties
