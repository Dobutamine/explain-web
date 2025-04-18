# BloodDiffusor Class Documentation

## Overview

The `BloodDiffusor` class extends the `BaseModelClass` to model the diffusion of gases and solutes between two blood compartments in the neonatal physiological system. It implements diffusion-based transfer of oxygen, carbon dioxide, and other solutes across membranes between blood pools without bulk flow.

## Location

`BloodDiffusor.js` in the model structure.

## Import Dependencies

```javascript
import { BaseModelClass } from "./BaseModelClass";
import { calc_blood_composition } from "../helpers/BloodComposition"
```

The class extends the BaseModelClass and uses a helper function to calculate blood composition.

## Class Structure

### Static Properties

```javascript
static model_type = "BloodDiffusor";
model_interface = [...];
```

- `model_type`: Identifies this class as a "BloodDiffusor" model
- `model_interface`: Array defining the user interface for this model, allowing control of diffusion constants and blood component selection

### Constructor

```javascript
constructor(model_ref, name = "")
```

**Parameters:**
- `model_ref`: Reference to the model engine
- `name`: Optional name for the model instance (defaults to empty string)

**Independent Properties:**
- `comp_blood1`: Name of the first blood-containing model (default: "PLF")
- `comp_blood2`: Name of the second blood-containing model (default: "PLM")
- `dif_o2`: Diffusion constant for oxygen in mmol/(mmHg·s) (default: 0.01)
- `dif_co2`: Diffusion constant for carbon dioxide in mmol/(mmHg·s) (default: 0.01)
- `dif_solutes`: Dictionary of diffusion constants for various solutes in mmol/(mmol·s)

**Modulating Factors:**
- `dif_o2_factor`: Factor modifying the oxygen diffusion constant (default: 1.0)
- `dif_co2_factor`: Factor modifying the carbon dioxide diffusion constant (default: 1.0)
- `dif_solutes_factor`: Factor modifying the solute diffusion constants (default: 1.0)

**Internal Properties:**
- `_comp_blood1`: Reference to the first blood-containing model
- `_comp_blood2`: Reference to the second blood-containing model

### Methods

#### `calc_model()`

Performs the diffusion calculations between two blood compartments.

**Functionality:**
1. Retrieves references to both blood compartments
2. Calls `calc_blood_composition()` to update blood gas parameters for both compartments
3. Applies diffusion factors to the base diffusion constants
4. Calculates oxygen diffusion based on partial pressure difference:
   - `do2 = (comp_blood1.po2 - comp_blood2.po2) * _dif_o2 * _t`
5. Updates oxygen concentrations in both compartments
6. Calculates carbon dioxide diffusion based on partial pressure difference:
   - `dco2 = (comp_blood1.pco2 - comp_blood2.pco2) * _dif_co2 * _t`
7. Updates carbon dioxide concentrations in both compartments
8. Iterates through all solutes in the `dif_solutes` dictionary:
   - Calculates solute diffusion based on concentration gradient
   - Updates solute concentrations in both compartments

## Physiological Significance

The BloodDiffusor class models diffusive exchange between blood compartments with these key features:

1. **Differential Diffusion**:
   - Gases (O₂, CO₂) diffuse based on partial pressure gradients (Fick's law)
   - Solutes diffuse based on concentration gradients
   - Separate diffusion constants for each substance reflect their different membrane permeabilities

2. **Bidirectional Exchange**:
   - Direction determined solely by pressure/concentration gradients
   - Allows for realistic equilibration between compartments

3. **Mass Conservation**:
   - Maintains mass balance of gases and solutes between compartments
   - Accounts for compartment volumes when calculating new concentrations

4. **Blood-Blood Interface**:
   - Unlike GasExchanger, focuses on exchange between two blood compartments
   - Models physiological scenarios like placental exchange or dialysis

5. **Multiple Substance Support**:
   - Handles respiratory gases (O₂, CO₂)
   - Supports arbitrary solutes (electrolytes, metabolites, etc.)
   - Each substance can have its own diffusion constant

## Usage Example

```javascript
// Create a blood diffusor for the placental exchange
const placentalExchange = new BloodDiffusor(modelEngine, "placental_exchange");

// Initialize with physiological parameters
placentalExchange.comp_blood1 = "maternal_blood";    // Maternal blood compartment
placentalExchange.comp_blood2 = "fetal_blood";       // Fetal blood compartment
placentalExchange.dif_o2 = 0.008;                    // Oxygen diffusion constant
placentalExchange.dif_co2 = 0.016;                   // Carbon dioxide diffusion constant

// Set up solute diffusion
placentalExchange.dif_solutes = {
  na: 0.005,      // Sodium diffusion constant
  k: 0.004,       // Potassium diffusion constant
  glucose: 0.003, // Glucose diffusion constant
  urea: 0.007     // Urea diffusion constant
};

// Enable the model
placentalExchange.is_enabled = true;

// Simulation of placental insufficiency
placentalExchange.dif_o2_factor = 0.6;   // Reduce oxygen diffusion by 40%
placentalExchange.dif_co2_factor = 0.7;  // Reduce carbon dioxide diffusion by 30%
placentalExchange.dif_solutes_factor = 0.8;  // Reduce solute diffusion by 20%
```

## Notes

- The BloodDiffusor connects two blood compartments to model diffusion-based exchange
- Gas exchange is driven by partial pressure gradients (not concentration gradients)
- Solute exchange is driven by concentration gradients
- The system automatically updates blood gas parameters through `calc_blood_composition()`
- Diffusion constants reflect the membrane permeability, surface area, and thickness
- The exchange is time-dependent, with fluxes multiplied by the time step
- The model can represent various physiological interfaces:
  - Maternal-fetal exchange in the placenta
  - Exchange during hemodialysis or hemofiltration
  - Equilibration between different blood compartments
  - Transcapillary exchange with interstitial fluid
- Pathological conditions can be simulated by modifying diffusion factors
- Default settings of "PLF" and "PLM" suggest placental usage (Placenta Fetal/Maternal)
