# PleuralSpace Class Documentation

## Overview

The `PleuralSpace` class extends the `Container` class to specifically model the pleural cavity in the neonatal physiological system. It represents the thin fluid-filled space between the visceral pleura (covering the lungs) and the parietal pleura (lining the chest wall), with special handling for chest and respiratory muscle pressures.

## Location

`PleuralSpace.js` in the model structure.

## Import Dependencies

```javascript
import { Container } from "../base_models/Container";
```

The class extends the Container class which provides the functionality for a compartment that contains other model components.

## Class Structure

### Static Properties

```javascript
static model_type = "PleuralSpace";
static model_interface = [];
```

- `model_type`: Identifies this class as a "PleuralSpace" model
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
- `pres_mus`: External pressure from respiratory muscles in mmHg (default: 0.0)

### Methods

#### `calc_pressure()`

Overrides the parent class method to calculate the pressure inside the pleural space, incorporating additional pressure sources specific to the thorax.

**Calculations:**
1. Calculates recoil pressure: `pres_in = _el_k * (vol - _u_vol)² + _el * (vol - _u_vol)`
2. Adds external, chest compression, and muscle pressures: `pres = pres_in + pres_ext + pres_cc + pres_mus`
3. Transfers this total pressure to all contained components
4. Resets all external pressure sources to zero

## Physiological Significance

The PleuralSpace class models the pleural cavity with these key features:

1. **Anatomical Structure**:
   - Thin potential space between the lung surface and chest wall
   - Contains a small amount of pleural fluid
   - Normally has negative (sub-atmospheric) pressure
   - Separate spaces for left and right lungs

2. **Respiratory Mechanics**:
   - Transmits pressure changes from thoracic cavity to lung surface
   - Creates the pressure gradient that drives lung inflation
   - Provides coupling between chest wall and lung movement
   - Maintains lung expansion by negative pressure

3. **Pathological Conditions**:
   - Can model pneumothorax (air in pleural space)
   - Can model pleural effusion (excess fluid)
   - Can represent atelectasis (collapse of lung regions)
   - Critical for modeling respiratory distress syndromes

4. **Neonatal Specifics**:
   - More compliant chest wall affecting pleural mechanics
   - Smaller pleural space with less fluid
   - More vulnerable to air leaks and pneumothorax
   - Pleural pressure changes significant in respiratory distress

## Usage Example

```javascript
// Create a pleural space model
const rightPleuralSpace = new PleuralSpace(modelEngine, "right_pleural_space");

// Initialize with physiological parameters
rightPleuralSpace.u_vol = 0.005;     // Unstressed volume of 5 mL
rightPleuralSpace.el_base = 5.0;     // Baseline elastance of 5.0 mmHg/mL
rightPleuralSpace.el_k = 0.1;        // Non-linear elastance factor
rightPleuralSpace.vol = 0.008;       // Initial volume of 8 mL

// Define components contained within the pleural space
rightPleuralSpace.contained_components = [
  "right_lung"
];

// Enable the model
rightPleuralSpace.is_enabled = true;

// Example of simulating normal inspiration
rightPleuralSpace.pres_mus = -6.0;    // Negative pressure from inspiratory muscles

// Example of simulating pneumothorax
rightPleuralSpace.vol = 0.05;         // Increased volume from air in pleural space
rightPleuralSpace.pres_mus = -6.0;    // Respiratory effort continues
```

## Notes

- The PleuralSpace class extends Container to model the specific mechanical properties of the pleural cavity
- It is structurally similar to the Thorax class but represents a different anatomical compartment
- The pleural space normally contains a small amount of fluid (a few mL)
- In normal physiology, pleural pressure is negative (sub-atmospheric) throughout the respiratory cycle
- Typically becomes more negative during inspiration and less negative during expiration
- The model can represent separate pleural spaces for each lung:
  - Right pleural space
  - Left pleural space
- The pleural pressure directly affects lung inflation and is crucial for:
  - Lung expansion during breathing
  - Distribution of ventilation
  - Lung collapse in pathological conditions
- Neonatal pleural mechanics differ from adults:
  - Higher compliance of surrounding structures
  - More vulnerable to air leaks and pneumothorax
  - Critical role in neonatal respiratory distress syndrome
- Pathological conditions that can be modeled include:
  - Pneumothorax (air in pleural space)
  - Pleural effusion (excess fluid)
  - Empyema (infection in pleural space)
  - Atelectasis (lung collapse)
