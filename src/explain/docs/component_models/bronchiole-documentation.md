# Bronchiole Class Documentation

## Overview

The `Bronchiole` class extends the `Airway` class to specifically model bronchiolar segments in the neonatal respiratory system. It represents the smaller conducting airways that connect the bronchi to the respiratory bronchioles and alveolar ducts.

## Location

`Bronchiole.js` in the model structure.

## Import Dependencies

```javascript
import { Airway } from "../component_models/Airway";
```

The class extends the Airway class which provides the airway compartment functionality.

## Class Structure

### Static Properties

```javascript
static model_type = "Bronchiole";
```

- `model_type`: Identifies this class as a "Bronchiole" model

### Inherited Functionality

While the provided implementation is minimal, the class inherits all functionality from the Airway parent class, which in turn inherits from GasCapacitance:

- Volume and pressure calculations
- Gas composition tracking
- Temperature and humidity effects
- Response to external pressures
- Framework for resistance calculations

## Physiological Significance

The Bronchiole class represents small airway segments with these key features:

1. **Anatomical Structure**:
   - Small airways (<1 mm in diameter in adults, smaller in neonates)
   - No cartilage in walls (unlike bronchi)
   - Smooth muscle plays a major role in determining diameter
   - Terminal bronchioles are the smallest purely conducting airways

2. **Physiological Function**:
   - Conducts air to and from respiratory bronchioles and alveoli
   - Major site of airway resistance regulation
   - Highly responsive to neural, chemical, and hormonal stimuli
   - Critical interface between conducting and respiratory zones

3. **Mechanical Properties**:
   - No cartilaginous support, relies on smooth muscle tone and surrounding lung tissue
   - Highly susceptible to narrowing by smooth muscle contraction
   - More affected by changes in lung volume than larger airways
   - Major site of airflow limitation in obstructive diseases

4. **Neonatal Specifics**:
   - Proportionally smaller diameter with higher resistance
   - Less developed smooth muscle
   - Fewer bronchioles than adults (increase in number with development)
   - Highly compliant and susceptible to collapse
   - Major site of airway obstruction in neonatal respiratory disorders

## Usage Example

```javascript
// Create a bronchiole model for a terminal bronchiole
const terminalBronchiole = new Bronchiole(modelEngine, "terminal_bronchiole");

// Initialize with physiological parameters
terminalBronchiole.u_vol = 0.002;     // Unstressed volume of 2 mL
terminalBronchiole.el_base = 5.0;     // Baseline elastance of 5.0 mmHg/mL
terminalBronchiole.el_k = 0.2;        // Non-linear elastance factor
terminalBronchiole.vol = 0.003;       // Initial volume of 3 mL
terminalBronchiole.temp = 37.0;       // Temperature in Celsius
terminalBronchiole.humidity = 1.0;    // 100% humidity

// Initialize gas composition
terminalBronchiole.co2 = 6.8;         // Oxygen concentration (mmol/L)
terminalBronchiole.cco2 = 5.2;        // Carbon dioxide concentration (mmol/L)
terminalBronchiole.cn2 = 32.5;        // Nitrogen concentration (mmol/L)

// Enable the model
terminalBronchiole.is_enabled = true;

// Example of simulating bronchospasm
terminalBronchiole.el_base_factor = 4.0;  // Severe increase in elastance due to smooth muscle contraction

// Example of simulating effects of positive end-expiratory pressure (PEEP)
terminalBronchiole.pres_ext = 5.0;        // External pressure supporting airway patency
```

## Notes

- The Bronchiole class is a minimal extension of Airway specifically for bronchiolar modeling
- Currently, it only defines a unique model_type without adding additional functionality
- It inherits all gas properties and airway mechanics from the parent classes
- The model can represent airways at different levels of the bronchiolar tree:
  - Larger bronchioles
  - Terminal bronchioles
  - (Respiratory bronchioles would likely be modeled separately as they have alveoli)
- The class can be used to model normal and pathological conditions:
  - Normal bronchiolar function
  - Bronchiolitis (inflammation of bronchioles, common in infants)
  - Bronchospasm (asthma-like conditions)
  - Bronchiolar obstruction (mucus, meconium)
  - Bronchopulmonary dysplasia effects (a chronic lung disease in premature infants)
- Neonatal bronchioles have unique characteristics:
  - Fewer in number than in adults
  - Relatively higher resistance
  - More compliant and collapse-prone
  - Ongoing development, especially in premature infants
  - Particularly vulnerable to inflammation and obstruction
- This semantic differentiation allows for organizing the respiratory model into physiologically appropriate components and applying specific parameters to each airway type
