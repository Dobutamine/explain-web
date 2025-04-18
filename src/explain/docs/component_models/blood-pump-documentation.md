# BloodPump Class Documentation

## Overview

The `BloodPump` class extends the `BloodCapacitance` class to model mechanical blood pumps in the neonatal physiological system. It represents devices like extracorporeal membrane oxygenation (ECMO) pumps, ventricular assist devices, or cardiopulmonary bypass pumps that provide mechanical circulatory support.

## Location

`BloodPump.js` in the model structure.

## Import Dependencies

```javascript
import { BloodCapacitance } from "../base_models/BloodCapacitance";
```

The class extends the BloodCapacitance class which provides the blood compartment functionality.

## Class Structure

### Static Properties

```javascript
static model_type = "BloodPump";
model_interface = [...];
```

- `model_type`: Identifies this class as a "BloodPump" model
- `model_interface`: Array defining the user interface for this model, allowing control of volume, elastance parameters, and connected resistors

### Constructor

```javascript
constructor(model_ref, name = "")
```

**Parameters:**
- `model_ref`: Reference to the model engine
- `name`: Optional name for the model instance (defaults to empty string)

**Additional Independent Properties:**
- `pump_rpm`: Pump speed in rotations per minute (default: 0.0)
- `pump_mode`: Pump mode (0=centrifugal, 1=roller pump) (default: 0)
- `pump_pressure`: Generated pump pressure (default: 0.0)

**Internal Properties:**
- `_inlet`: Reference to the inlet BloodResistor
- `_outlet`: Reference to the outlet BloodResistor

### Methods

#### `calc_pressure()`

Overrides the parent class method to calculate pressure and apply pump-generated pressure to the connected resistors.

**Functionality:**
1. Retrieves references to inlet and outlet resistors
2. Calculates recoil pressure: `pres_in = _el_k * (vol - _u_vol)² + _el * (vol - _u_vol)`
3. Calculates total pressure: `pres = pres_in + pres_ext + pres_cc + pres_mus`
4. Resets external pressures
5. Calculates pump pressure: `pump_pressure = -pump_rpm / 25.0`
6. Applies pump pressure to resistors based on pump mode:
   - Centrifugal mode (0): Applies pressure to inlet resistor outlet
   - Roller pump mode (1): Applies pressure to outlet resistor inlet

## Physiological Significance

The BloodPump class models mechanical circulatory support devices with these key features:

1. **Pump Types**:
   - Centrifugal pump: Generates negative pressure at inlet (common in ECMO)
   - Roller pump: Generates positive pressure at outlet (common in cardiopulmonary bypass)
   - Configurable through pump_mode parameter

2. **Flow Generation**:
   - Creates pressure gradients that drive blood flow
   - Proportional to pump speed (RPM)
   - Flow direction determined by connected resistors
   - Applied to appropriate locations based on pump type

3. **Clinical Applications**:
   - Models extracorporeal life support systems
   - Simulates ventricular assist devices
   - Represents cardiopulmonary bypass circuits
   - Can model both arterial and venous pumps

4. **Neonatal Specifics**:
   - Appropriate scaling for neonatal blood volumes
   - Models specialized neonatal ECMO circuits
   - Can represent the unique challenges of neonatal mechanical support
   - Useful for simulating congenital heart disease interventions

## Usage Example

```javascript
// Create a blood pump model for ECMO
const ecmoPump = new BloodPump(modelEngine, "ecmo_centrifugal_pump");

// Initialize with physiological parameters
ecmoPump.u_vol = 0.05;          // Unstressed volume of 50 mL
ecmoPump.el_base = 10.0;        // Baseline elastance of 10 mmHg/mL
ecmoPump.el_k = 0.1;            // Non-linear elastance factor
ecmoPump.vol = 0.08;            // Initial volume of 80 mL

// Set up pump parameters
ecmoPump.pump_rpm = 3000;       // Pump speed of 3000 RPM
ecmoPump.pump_mode = 0;         // Centrifugal pump mode

// Connect to inlet and outlet resistors
ecmoPump.inlet = "venous_cannula_resistor";
ecmoPump.outlet = "arterial_cannula_resistor";

// Set up blood properties
ecmoPump.to2 = 8.0;             // Oxygenated blood (mmol/L)
ecmoPump.tco2 = 24.0;           // Carbon dioxide content (mmol/L)

// Enable the model
ecmoPump.is_enabled = true;

// During simulation - adjusting pump speed
ecmoPump.pump_rpm = 3500;       // Increase pump speed to 3500 RPM

// Switching to roller pump configuration
ecmoPump.pump_mode = 1;         // Roller pump mode
```

## Notes

- The BloodPump class extends BloodCapacitance to model mechanical circulatory support devices
- It generates pressure based on pump speed (RPM) and applies it to connected resistors
- The pump_mode parameter allows for modeling different types of pumps:
  - Centrifugal pumps (mode 0): Generate negative pressure at inlet
  - Roller pumps (mode 1): Generate positive pressure at outlet
- The model includes user interface elements for controlling pump parameters
- The pump pressure is calculated as a simple function of RPM (pump_pressure = -pump_rpm / 25.0)
- A more sophisticated model could include:
  - Flow-dependent pressure generation
  - Non-linear RPM to pressure relationships
  - Tunable efficiency parameters
  - Heat generation
- This class can be used to model various clinical scenarios:
  - Veno-arterial ECMO
  - Veno-venous ECMO
  - Ventricular assist devices
  - Cardiopulmonary bypass
  - Dialysis circuits
- Neonatal applications are particularly important for conditions like:
  - Meconium aspiration syndrome
  - Persistent pulmonary hypertension of the newborn
  - Congenital diaphragmatic hernia
  - Post-cardiac surgery support
