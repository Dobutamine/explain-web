# BaseModelClass Documentation

## Overview

The `BaseModelClass` serves as the foundation for all physiological model objects in the neonatal physiological modeling application. It provides a blueprint with essential properties and methods that all model components inherit and implement.

## Location

`BaseModelClass.js` in the core model structure.

## Import Dependencies

```javascript
import * as Models from "../ModelIndex.js"
```

The class imports all model types from the ModelIndex.js file, which serves as a registry of available physiological models.

## Class Structure

### Constructor

```javascript
constructor(model_ref, name = "")
```

**Parameters:**
- `model_ref`: Reference to the model engine
- `name`: Optional name for the model instance (defaults to empty string)

**Initialized Properties:**
- `name`: Name of the model object
- `description`: Documentation description (empty by default)
- `is_enabled`: Boolean flag indicating if the model is active (false by default)
- `model_type`: String identifier for the model type (e.g., "BloodCapacitance")
- `components`: Dictionary object to store sub-components of the model

**Internal Properties:**
- `_model_engine`: Reference to the model engine
- `_t`: Modeling stepsize inherited from the engine
- `_is_initialized`: Flag indicating initialization status (false by default)

### Methods

#### `init_model(args = {})`

Initializes the model with provided arguments and recursively initializes all sub-models.

**Parameters:**
- `args`: Array of key-value pairs to set model properties

**Functionality:**
1. Sets values of independent properties from the args array
2. Builds all sub-models defined in the components dictionary
3. Initializes all sub-models with their respective arguments
4. Sets the `_is_initialized` flag to true

#### `step_model()`

Called by the model engine during simulation steps. Executes model calculations if the model is both enabled and initialized.

**Functionality:**
- Checks if `is_enabled` and `_is_initialized` are both true
- If yes, calls `calc_model()` to perform calculations

#### `calc_model()`

A placeholder method intended to be overridden by subclasses to implement specific physiological calculations.

**Usage:**
- This method should be implemented by all model subclasses
- Contains the actual mathematical model and algorithms for the specific physiological process

## Component Structure

The `BaseModelClass` supports a hierarchical model structure through the `components` property, which can contain multiple sub-models. Each component:

1. Is referenced by name in the components dictionary
2. Has a defined model_type that corresponds to a class in ModelIndex.js
3. Can have additional properties as configuration parameters
4. Is instantiated and initialized during the parent model's initialization

## Usage Example

When extending this class to create specific physiological models:

```javascript
export class CardiovascularModel extends BaseModelClass {
  constructor(model_ref, name) {
    super(model_ref, name);
    
    this.model_type = "CardiovascularModel";
    this.description = "Models the neonatal cardiovascular system";
    
    // Define components
    this.components = {
      heart: {
        model_type: "HeartModel",
        heart_rate: 120,
        stroke_volume: 2.5
      },
      bloodVessels: {
        model_type: "VascularModel",
        resistance: 500
      }
    };
  }
  
  calc_model() {
    // Implement cardiovascular calculations here
  }
}
```

## Notes

- All model classes should inherit from `BaseModelClass`
- The hierarchical component structure allows for complex, modular physiological models
- Models are only calculated when both initialized and enabled
- The stepsize (`_t`) determines the temporal resolution of the simulation
