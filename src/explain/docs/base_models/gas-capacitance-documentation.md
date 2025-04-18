# GasCapacitance Class Documentation

## Overview

The `GasCapacitance` class extends the `Capacitance` class to specifically model gas-containing compartments in the neonatal physiological system. It implements gas-specific properties including temperature, pressure, composition, and humidity, following gas laws and thermodynamics.

## Location

`GasCapacitance.js` in the model structure.

## Import Dependencies

```javascript
import { Capacitance } from "./Capacitance";
```

The class extends the Capacitance class which provides the basic elastic compartment functionality.

## Class Structure

### Static Properties

```javascript
static model_type = "GasCapacitance";
model_interface = [...];
```

- `model_type`: Identifies this class as a "GasCapacitance" model
- `model_interface`: Array defining the user interface for this model, allowing control of volume, unstressed volume, elastance, and non-linear elastance factor

### Constructor

```javascript
constructor(model_ref, name = "")
```

**Parameters:**
- `model_ref`: Reference to the model engine
- `name`: Optional name for the model instance (defaults to empty string)

**Additional Independent Properties:**
- `pres_atm`: Atmospheric pressure in mmHg (default: 760)
- `pres_cc`: External pressure from chest compressions in mmHg
- `pres_mus`: External pressure from outside muscles in mmHg
- `pres_rel`: Relative pressure (calculated)
- `fixed_composition`: Flag to fix gas composition (default: false)

**Modulating Factors:**
- `ans_activity_factor`: Autonomic nervous system activity factor (default: 1.0)
- Unstressed volume factors:
  - `u_vol_resp_factor`: Respiratory influence factor
  - `u_vol_ans_factor`: Autonomic nervous system influence factor
  - `u_vol_drug_factor`: Drug influence factor
- Elastance factors:
  - `el_base_resp_factor`: Respiratory influence factor
  - `el_base_ans_factor`: Autonomic nervous system influence factor
  - `el_base_drug_factor`: Drug influence factor
- Non-linear elastance factors:
  - `el_k_resp_factor`: Respiratory influence factor
  - `el_k_ans_factor`: Autonomic nervous system influence factor
  - `el_k_drug_factor`: Drug influence factor

**Dependent Properties:**
- `ctotal`: Total gas molecule concentration (mmol/L)
- Gas concentrations (mmol/L):
  - `co2`: Oxygen concentration
  - `cco2`: Carbon dioxide concentration
  - `cn2`: Nitrogen concentration
  - `cother`: Other gases concentration
  - `ch2o`: Water vapor concentration
- Environmental conditions:
  - `target_temp`: Target temperature in degrees Celsius
  - `humidity`: Humidity as a fraction
  - `temp`: Current gas temperature in degrees Celsius
- Partial pressures (mmHg):
  - `po2`: Partial pressure of oxygen
  - `pco2`: Partial pressure of carbon dioxide
  - `pn2`: Partial pressure of nitrogen
  - `pother`: Partial pressure of other gases
  - `ph2o`: Partial pressure of water vapor
- Fractional composition:
  - `fo2`: Fraction of oxygen of total gas volume
  - `fco2`: Fraction of carbon dioxide of total gas volume
  - `fn2`: Fraction of nitrogen of total gas volume
  - `fother`: Fraction of other gases of total gas volume
  - `fh2o`: Fraction of water vapor of total gas volume

**Internal Properties:**
- `_gas_constant`: Ideal gas law constant (62.36367 L·mmHg/(mol·K))

### Methods

#### `calc_model()`

Orchestrates the calculation sequence for the gas capacitance model.

**Functionality:**
1. Calls `add_heat()` to handle temperature changes
2. Calls `add_watervapour()` to handle water vapor dynamics
3. Calls `calc_elastances()` to update elastance values
4. Calls `calc_volumes()` to update volume values
5. Calls `calc_pressure()` to calculate the resulting pressures
6. Calls `calc_gas_composition()` to update gas composition

#### `calc_elastances()`

Calculates the effective elastance and non-linear elastance factor based on base values and various modifying factors.

**Calculations:**
- Takes into account:
  - Base elastance factor
  - Respiratory factor
  - Autonomic nervous system factor (modulated by ANS activity)
  - Drug factor

#### `calc_volumes()`

Calculates the effective unstressed volume based on the base value and various modifying factors.

**Calculations:**
- Takes into account:
  - Base volume factor
  - Respiratory factor
  - Autonomic nervous system factor (modulated by ANS activity)
  - Drug factor

#### `calc_pressure()`

Calculates the pressure inside the gas compartment.

**Calculations:**
1. Calculates recoil pressure using elastic properties
2. Adds various external pressures (external, chest compression, muscles, atmospheric)
3. Calculates relative pressure (pressure relative to atmospheric)
4. Resets external pressures

#### `volume_in(dvol, comp_from)`

Adds gas volume to the compartment, with composition mixing.

**Parameters:**
- `dvol`: Amount of volume to add in liters (L)
- `comp_from`: Source compartment that the gas is coming from

**Functionality:**
1. Returns immediately if fixed_composition is true
2. Adds volume to the compartment
3. Updates gas concentrations based on mixing:
   - Oxygen, carbon dioxide, nitrogen, water vapor, and other gases
4. Adjusts temperature based on incoming gas temperature

#### `volume_out(dvol)`

Removes gas volume from the compartment.

**Parameters:**
- `dvol`: Amount of volume to remove in liters (L)

**Returns:**
- Volume that could not be removed (if any)

**Functionality:**
1. Returns immediately if fixed_composition is true
2. Removes volume from the compartment
3. Handles negative volume scenarios
4. Returns unremoved volume if volume would go negative

#### `add_heat()`

Handles temperature changes and the resulting volume changes due to gas expansion/contraction.

**Functionality:**
1. Adjusts temperature toward target temperature
2. Calculates volume change using ideal gas law
3. Updates compartment volume
4. Prevents negative volume

#### `add_watervapour()`

Models the addition of water vapor to the gas based on temperature and humidity.

**Functionality:**
1. Calculates target water vapor pressure using `calc_watervapour_pressure()`
2. Determines water vapor addition rate
3. Updates water vapor concentration
4. Calculates resulting volume change

#### `calc_watervapour_pressure()`

Calculates saturated water vapor pressure based on temperature.

**Returns:**
- Saturated water vapor pressure in mmHg

**Calculation:**
- Uses the exponential formula: `exp(20.386 - 5132 / (temp + 273))`

#### `calc_gas_composition()`

Updates all gas partial pressures and fractions based on concentrations and total pressure.

**Functionality:**
1. Calculates total gas concentration
2. Updates partial pressures for each gas component
3. Updates fractional concentrations for each gas component

## Physiological Significance

The GasCapacitance class models respiratory compartments with gas laws and thermodynamics:

1. **Gas Laws**:
   - Implements ideal gas law for volume, pressure, and temperature relationships
   - Calculates partial pressures (Dalton's law) for gas components

2. **Gas Exchange**:
   - Tracks individual gas concentrations (O₂, CO₂, N₂, H₂O, others)
   - Handles mixing of gas compositions during volume transfers

3. **Humidity and Temperature**:
   - Models water vapor addition based on humidity and temperature
   - Calculates saturated water vapor pressure using an empirical formula
   - Handles thermal expansion of gases

4. **Pressure Components**:
   - Atmospheric pressure (baseline)
   - Elastic recoil pressure (from tissue properties)
   - External pressures (muscle, chest compression)
   - Relative pressure (differential from atmospheric)

5. **Physiological Control**:
   - Autonomic nervous system influence
   - Respiratory system influence
   - Drug effects

## Usage Example

```javascript
// Create a gas capacitance model for the alveolar space
const alveolarSpace = new GasCapacitance(modelEngine, "alveolar_space");

// Initialize with physiological parameters
alveolarSpace.u_vol = 0.03;         // Unstressed volume of 30 mL
alveolarSpace.el_base = 1.0;        // Elastance of 1.0 mmHg/L
alveolarSpace.vol = 0.05;           // Initial volume of 50 mL
alveolarSpace.temp = 37.0;          // Body temperature in Celsius
alveolarSpace.target_temp = 37.0;   // Target temperature
alveolarSpace.humidity = 1.0;       // 100% humidity

// Initialize gas composition
alveolarSpace.co2 = 6.2;            // Oxygen concentration (mmol/L)
alveolarSpace.cco2 = 5.3;           // Carbon dioxide concentration (mmol/L) 
alveolarSpace.cn2 = 32.5;           // Nitrogen concentration (mmol/L)
alveolarSpace.ch2o = 6.3;           // Water vapor (mmol/L)

// Enable the model
alveolarSpace.is_enabled = true;

// When gas flows from another compartment (e.g., during inspiration)
const deadSpace = someOtherGasCompartment;
alveolarSpace.volume_in(0.01, deadSpace);  // 10 mL flows in from dead space

// External pressure from respiratory muscles
alveolarSpace.pres_mus = -2.0;      // Negative pressure during inspiration
```

## Notes

- The GasCapacitance implements a comprehensive respiratory gas model
- Temperature changes influence both gas partial pressures and volumes
- Water vapor content is adjusted continuously based on temperature
- Multiple factors (ANS, respiratory, drugs) can influence compartment properties
- The model follows ideal gas laws while incorporating physiological constraints
- Fixed composition setting allows for gas sources with constant composition
