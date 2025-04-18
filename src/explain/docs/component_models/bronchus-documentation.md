# Bronchus Class Documentation

## Overview

The `Bronchus` class extends the `Airway` class to specifically model bronchial segments in the neonatal respiratory system. It represents the conducting airways that branch from the trachea toward the alveoli.

## Location

`Bronchus.js` in the model structure.

## Import Dependencies

```javascript
import { Airway } from "../component_models/Airway";
```

The class extends the Airway class which provides the airway compartment functionality.

## Class Structure

### Static Properties

```javascript
static model_type = "Bronchus";
```

- `model_type`: Identifies this class as a "Bronchus" model

### Inherited Functionality

While the provided implementation is minimal, the class inherits all functionality from the Airway parent class, which in turn inherits from GasCapacitance:

- Volume and pressure calculations
- Gas composition tracking
- Temperature and humidity effects
- Response to external pressures
- Framework for resistance calculations

## Physiological Significance

The Bronchus class represents conducting airway segments with these key features:

1. **Anatomical Structure**:
   - Branching tube structures carrying air deeper into the lungs
   - Part of the conducting zone of the respiratory system
   - Various generations of branching (primary, secondary, tertiary bronchi)

2. **Physiological Function**:
   - Conducts air to and from alveoli
   - Filters, warms, and humidifies inspired air
   - Contributes to airway resistance
   - Participates in mucociliary clearance

3. **Mechanical Properties**:
   - Walls supported by cartilage rings (decreasing in amount as airways branch)
   - Subject to both smooth muscle tone and external pressures
   - Diameter changes with respiratory cycle
   - Potential for dynamic compression during forced expiration

4. **Neonatal Specifics**:
   - Smaller diameter airways with higher resistance
   - Less structural support than in adults
   - More compliant airway walls
   - More susceptible to obstruction and collapse

## Usage Example

```javascript
// Create a bronchus model for a primary bronchus
const primaryBronchus = new Bronchus(modelEngine, "right_main_bronchus");

// Initialize with physiological parameters
primaryBronchus.u_vol = 0.01;        // Unstressed volume of 10 mL
primaryBronchus.el_base = 2.0;       // Baseline elastance of 2.0 mmHg/mL
primaryBronchus.el_k = 0.1;          // Non-linear elastance factor
primaryBronchus.vol = 0.015;         // Initial volume of 15 mL
primaryBronchus.temp = 36.5;         // Temperature in Celsius
primaryBronchus.humidity = 0.95;     // 95% humidity

// Initialize gas composition
primaryBronchus.co2 = 7.5;           // Oxygen concentration (mmol/L)
primaryBronchus.cco2 = 0.8;          // Carbon dioxide concentration (mmol/L)
primaryBronchus.cn2 = 33.0;          // Nitrogen concentration (mmol/L)

// Enable the model
primaryBronchus.is_enabled = true;

// Example of simulating effects of bronchoconstriction
primaryBronchus.el_base_factor = 2.0;  // Increased elastance due to smooth muscle contraction

// Example of simulating airway compression during forced expiration
primaryBronchus.pres_ext = 10.0;       // External pressure from lung parenchyma during forced expiration
```

## Notes

- The Bronchus class is a minimal extension of Airway specifically for bronchial modeling
- Currently, it only defines a unique model_type without adding additional functionality
- It inherits all gas properties and airway mechanics from the parent classes
- The model can represent airways at different levels of the bronchial tree:
  - Main bronchi (primary)
  - Lobar bronchi (secondary)
  - Segmental bronchi (tertiary)
  - Smaller bronchi and bronchioles (with appropriate parameters)
- The class can be used to model normal and pathological conditions:
  - Normal bronchial function
  - Bronchoconstriction (asthma, bronchospasm)
  - Bronchial obstruction (mucus, foreign body)
  - Dynamic airway compression
- Neonatal bronchi have unique characteristics:
  - Higher resistance due to smaller diameter
  - Greater compliance of airway walls
  - More susceptible to collapse
  - Less cartilaginous support
  - Developmental differences based on gestational age
- This semantic differentiation allows for organizing the respiratory model into physiologically appropriate components
