# GasExchanger Class Documentation

## Overview

The `GasExchanger` class extends the `BaseModelClass` to model the exchange of respiratory gases (oxygen and carbon dioxide) between blood and gas compartments in the neonatal physiological system. It implements diffusion-based gas transfer across membranes such as the alveolar-capillary interface in the lungs.

## Location

`GasExchanger.js` in the model structure.

## Import Dependencies

```javascript
import { BaseModelClass } from "./BaseModelClass";
import { calc_blood_composition } from "../helpers/BloodComposition"
```

The class extends the BaseModelClass and uses a helper function to calculate blood composition.

## Class Structure

### Static Properties

```javascript
static model_type = "GasExchanger";
model_interface = [...];
```

- `model_type`: Identifies this class as a "GasExchanger" model
- `model_interface`: Array defining the user interface for this model, allowing control of diffusion constants and component selection

### Constructor

```javascript
constructor(model_ref, name = "")
```

**Parameters:**
- `model_ref`: Reference to the model engine
- `name`: Optional name for the model instance (defaults to empty string)

**Independent Properties:**
- `dif_o2`: Diffusion constant for oxygen in mmol/(mmHg·s)
- `dif_co2`: Diffusion constant for carbon dioxide in mmol/(mmHg·s)
- `comp_blood`: Name of the blood component
- `comp_gas`: Name of the gas component

**Modulating Factors:**
- `dif_o2_factor`: Factor modifying the oxygen diffusion constant (default: 1.0)
- `dif_co2_factor`: Factor modifying the carbon dioxide diffusion constant (default: 1.0)

**Dependent Properties:**
- `flux_o2`: Oxygen flux in mmol
- `flux_co2`: Carbon dioxide flux in mmol

**Internal Properties:**
- `_blood`: Reference to the blood component
- `_gas`: Reference to the gas component

### Methods

#### `calc_model()`

Performs the gas exchange calculations between blood and gas compartments.

**Functionality:**
1. Retrieves references to the blood and gas components
2. Calls `calc_blood_composition()` to update blood gas parameters
3. Retrieves partial pressures and concentrations from both compartments
4. Exits if blood volume is zero
5. Calculates oxygen flux based on partial pressure difference:
   - `flux_o2 = (po2_blood - po2_gas) * dif_o2 * dif_o2_factor * _t`
6. Calculates new oxygen concentrations for both compartments
7. Calculates carbon dioxide flux based on partial pressure difference:
   - `flux_co2 = (pco2_blood - pco2_gas) * dif_co2 * dif_co2_factor * _t`
8. Calculates new carbon dioxide concentrations for both compartments
9. Updates the gas concentrations in both compartments

## Physiological Significance

The GasExchanger class models respiratory gas exchange with these key features:

1. **Diffusion-Based Transfer**:
   - Implements Fick's law of diffusion (flux proportional to partial pressure gradient)
   - Separate diffusion constants for O₂ and CO₂ reflect their different membrane permeabilities
   - CO₂ typically diffuses 20 times faster than O₂

2. **Bidirectional Exchange**:
   - Allows for both oxygenation (O₂ transfer from gas to blood) and ventilation (CO₂ transfer from blood to gas)
   - Direction determined by partial pressure gradients

3. **Mass Conservation**:
   - Maintains mass balance of gases between compartments
   - Accounts for compartment volumes when calculating new concentrations

4. **Blood Gas Physiology**:
   - Integrates with blood composition calculations
   - Models the relationship between partial pressures and total gas content

5. **Variable Efficiency**:
   - Diffusion constants can be modified by factors to simulate pathological conditions
   - Models conditions like diffusion impairment in respiratory diseases

## Usage Example

```javascript
// Create a gas exchanger for the pulmonary system
const pulmonaryExchanger = new GasExchanger(modelEngine, "pulmonary_exchanger");

// Initialize with physiological parameters
pulmonaryExchanger.dif_o2 = 0.01;      // Oxygen diffusion constant
pulmonaryExchanger.dif_co2 = 0.2;      // Carbon dioxide diffusion constant (20x faster than O2)
pulmonaryExchanger.comp_blood = "pulmonary_capillaries";  // Blood component
pulmonaryExchanger.comp_gas = "alveolar_space";           // Gas component

// Enable the model
pulmonaryExchanger.is_enabled = true;

// Simulating diffusion impairment (e.g., pulmonary edema or fibrosis)
pulmonaryExchanger.dif_o2_factor = 0.5;   // Reduce oxygen diffusion by 50%
pulmonaryExchanger.dif_co2_factor = 0.8;  // Reduce carbon dioxide diffusion by 20%

// During simulation
modelEngine.step();   // This will call calc_model() which performs the gas exchange
```

## Notes

- The GasExchanger connects a blood compartment with a gas compartment to model respiratory exchange
- Gas exchange is driven by partial pressure gradients, not by concentration gradients
- The system automatically uses `calc_blood_composition()` to ensure blood gas parameters are updated
- Diffusion constants reflect the membrane permeability and surface area
- The exchange is time-dependent, with fluxes multiplied by the time step
- Negative concentrations are prevented by setting minimum values to zero
- The model can represent both pulmonary and peripheral gas exchange
- Pathological conditions can be simulated by modifying diffusion factors
- The model assumes that equilibrium is not instantly reached (realistic diffusion limitation)
