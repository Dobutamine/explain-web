# HeartChamber Class Documentation

## Overview

The `HeartChamber` class extends the `BloodTimeVaryingElastance` class to specifically model cardiac chambers (atria and ventricles) in the neonatal physiological system. It enhances the time-varying elastance model with additional factors that influence cardiac function, including autonomic nervous system activity and external pressures.

## Location

`HeartChamber.js` in the model structure.

## Import Dependencies

```javascript
import { BloodTimeVaryingElastance } from "../base_models/BloodTimeVaryingElastance";
```

The class extends the BloodTimeVaryingElastance class which provides the cardiac chamber functionality with blood properties.

## Class Structure

### Static Properties

```javascript
static model_type = "HeartChamber";
model_interface = [];
```

- `model_type`: Identifies this class as a "HeartChamber" model
- `model_interface`: Array for interface definitions (empty in this implementation)

### Constructor

```javascript
constructor(model_ref, name = "")
```

**Parameters:**
- `model_ref`: Reference to the model engine
- `name`: Optional name for the model instance (defaults to empty string)

**Additional Independent Properties:**
- `pres_cc`: External pressure from chest compressions in mmHg (default: 0.0)
- `pres_mus`: External pressure from outside muscles in mmHg (default: 0.0)

**Modulating Factors:**
- `ans_activity_factor`: Autonomic nervous system activity factor (default: 1.0)
- Unstressed volume factors:
  - `u_vol_circ_factor`: Circulatory influence on unstressed volume (default: 1.0)
  - `u_vol_ans_factor`: Autonomic influence on unstressed volume (default: 1.0)
- Minimum elastance (diastolic) factors:
  - `el_min_circ_factor`: Circulatory influence on minimum elastance (default: 1.0)
  - `el_min_ans_factor`: Autonomic influence on minimum elastance (default: 1.0)
  - `el_min_mob_factor`: Mobilization influence on minimum elastance (default: 1.0)
- Maximum elastance (systolic) factors:
  - `el_max_circ_factor`: Circulatory influence on maximum elastance (default: 1.0)
  - `el_max_ans_factor`: Autonomic influence on maximum elastance (default: 1.0)
  - `el_max_mob_factor`: Mobilization influence on maximum elastance (default: 1.0)
- Non-linear elastance factors:
  - `el_k_circ_factor`: Circulatory influence on non-linear elastance (default: 1.0)
  - `el_k_ans_factor`: Autonomic influence on non-linear elastance (default: 1.0)

### Methods

#### `calc_elastances()`

Overrides the parent class method to calculate effective elastance values based on base values and various modulating factors.

**Calculations:**
1. Calculates minimum elastance with all factors:
   ```javascript
   _el_min = el_min +
     (el_min_factor - 1) * el_min +
     (el_min_circ_factor - 1) * el_min +
     (el_min_ans_factor - 1) * el_min * ans_activity_factor +
     (el_min_mob_factor - 1) * el_min
   ```

2. Calculates maximum elastance with all factors:
   ```javascript
   _el_max = el_max +
     (el_max_factor - 1) * el_max +
     (el_max_circ_factor - 1) * el_max +
     (el_max_ans_factor - 1) * el_max * ans_activity_factor +
     (el_max_mob_factor - 1) * el_max
   ```

3. Calculates non-linear elastance factor with all factors:
   ```javascript
   _el_k = el_k +
     (el_k_factor - 1) * el_k +
     (el_k_circ_factor - 1) * el_k +
     (el_k_ans_factor - 1) * el_k * ans_activity_factor
   ```

#### `calc_volumes()`

Overrides the parent class method to calculate the effective unstressed volume based on base values and modulating factors.

**Calculations:**
```javascript
_u_vol = u_vol +
  (u_vol_factor - 1) * u_vol +
  (u_vol_circ_factor - 1) * u_vol +
  (u_vol_ans_factor - 1) * u_vol * ans_activity_factor
```

#### `calc_pressure()`

Overrides the parent class method to calculate the pressure inside the cardiac chamber with additional external pressures.

**Calculations:**
1. Calculates end-systolic pressure: `p_ms = (vol - _u_vol) * _el_max`
2. Calculates end-diastolic pressure: `p_ed = _el_k * (vol - _u_vol)² + _el_min * (vol - _u_vol)`
3. Interpolates current pressure based on activation: `pres_in = (p_ms - p_ed) * act_factor + p_ed`
4. Adds all external pressures: `pres = pres_in + pres_ext + pres_cc + pres_mus`
5. Resets external pressures to zero

## Physiological Significance

The HeartChamber class models cardiac chambers with these key features:

1. **Cardiac Contractility**:
   - Time-varying elastance model to simulate cardiac cycle
   - Autonomic control of contractility (inotropic effects)
   - Separate control of systolic and diastolic function

2. **Multiple Regulatory Mechanisms**:
   - Autonomic nervous system influence (sympathetic/parasympathetic)
   - Circulatory factors (preload, afterload, Frank-Starling mechanism)
   - Mobilization effects (stress, exercise)
   - External mechanical influences (chest compressions, respiratory pressures)

3. **Comprehensive Pressure Calculation**:
   - Internal pressure from chamber elastance and volume
   - External pressure from surrounding structures
   - Chest compression pressure for CPR simulations
   - Muscular pressure for respiratory effects

4. **Integrated Blood Properties**:
   - Inherits blood composition tracking from BloodTimeVaryingElastance
   - Models oxygen and carbon dioxide content
   - Tracks pH and other blood parameters

## Usage Example

```javascript
// Create a heart chamber model for the left ventricle
const leftVentricle = new HeartChamber(modelEngine, "left_ventricle");

// Initialize with physiological parameters
leftVentricle.u_vol = 0.01;         // Unstressed volume of 10 mL
leftVentricle.el_min = 0.1;         // Minimum elastance of 0.1 mmHg/mL (diastole)
leftVentricle.el_max = 2.5;         // Maximum elastance of 2.5 mmHg/mL (systole)
leftVentricle.el_k = 0.02;          // Non-linear elastance factor
leftVentricle.vol = 0.03;           // Initial volume of 30 mL

// Set up blood properties
leftVentricle.to2 = 8.0;            // Oxygen content (mmol/L)
leftVentricle.tco2 = 24.0;          // Carbon dioxide content (mmol/L)
leftVentricle.ph = 7.4;             // Blood pH

// Enable the model
leftVentricle.is_enabled = true;

// Simulation examples:

// Cardiac cycle
// Diastole
leftVentricle.act_factor = 0.0;     // Relaxation phase
leftVentricle.calc_model();         // Calculate pressure in diastole

// Sympathetic stimulation (positive inotropic effect)
leftVentricle.ans_activity_factor = 1.5;  // Increased sympathetic tone
leftVentricle.el_max_ans_factor = 1.3;    // 30% increase in contractility

// Systole
leftVentricle.act_factor = 1.0;     // Contraction phase
leftVentricle.calc_model();         // Calculate pressure in systole

// Simulating chest compressions during CPR
leftVentricle.pres_cc = 60.0;       // External pressure from chest compression
```

## Notes

- The HeartChamber class provides a comprehensive model of cardiac chamber mechanics
- It expands on the BloodTimeVaryingElastance model with more detailed control mechanisms
- Multiple factor types allow simulation of various physiological and pathological conditions:
  - Autonomic factors model sympathetic and parasympathetic influences
  - Circulatory factors model preload and afterload effects
  - Mobilization factors model stress and exercise responses
- External pressures enable simulation of:
  - Chest compressions during CPR
  - Intrathoracic pressure changes during respiration
  - Pericardial constraint effects
- The model can represent all four cardiac chambers:
  - Left and right ventricles
  - Left and right atria
- Each with their specific parameter values
- Neonatal cardiac physiology has several unique aspects captured by this model:
  - Higher resting heart rates
  - Limited contractile reserve
  - Different response to autonomic stimulation
  - Transitional circulation adaptations
