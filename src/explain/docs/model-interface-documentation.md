# Model Interface Documentation

## Overview

The `Model` class serves as a bridge between the main thread of a web application and the `ModelEngine` web worker. It provides a simplified API for managing physiological models, handling communication with the worker thread, and distributing model events throughout the application.

## Class Structure

`Model` is a JavaScript class that encapsulates the functionality needed to:
- Initialize and communicate with the ModelEngine worker
- Load and build model definitions
- Control model execution in real-time or batch calculations
- Manage data collection and monitoring
- Dispatch model events to the application

## Key Properties

### Communication
- `modelEngine`: Reference to the Web Worker instance
- `modelDefinition`: Current model definition loaded from the server

### Data Storage
- `modelData`: High-resolution data from the model
- `modelDataSlow`: Low-resolution data from the model
- `modelState`: Current state of the model

### Messaging
- `statusMessage`: Current status message
- `message_log`: Log of recent messages
- Various custom events for model state changes

## Methods

### Initialization

#### `constructor()`
Initializes the Model class by creating a new ModelEngine web worker and setting up message listeners.

#### `load(definition_name)`
Fetches a model definition from the server by name and builds the model.
- **Parameters**:
  - `definition_name`: String name of the model definition file (without .json extension)

### Communication

#### `send(message)`
Sends a message to the ModelEngine worker.
- **Parameters**:
  - `message`: Object containing type, message, and payload

#### `receive()`
Sets up listeners for messages coming from the ModelEngine worker. Processes incoming messages and dispatches appropriate events.

### Model Control

#### `build(explain_definition)`
Builds a model based on the provided definition.
- **Parameters**:
  - `explain_definition`: Object representing the complete model definition

#### `restart()`
Rebuilds the current model with the same definition.

#### `calculate(time_to_calculate)`
Runs the model for a specified period.
- **Parameters**:
  - `time_to_calculate`: Number of seconds to calculate

#### `start()`
Starts real-time execution of the model.

#### `stop()`
Stops real-time execution of the model.

### Data Monitoring

#### `clearWatchList()`
Clears the high-frequency property watch list.

#### `clearWatchListSlow()`
Clears the low-frequency property watch list.

#### `watchModelProps(args)`
Adds properties to the high-frequency watch list.
- **Parameters**:
  - `args`: String or array of strings in format "model.prop1.prop2"

#### `watchModelPropsSlow(args)`
Adds properties to the low-frequency watch list.
- **Parameters**:
  - `args`: String or array of strings in format "model.prop1.prop2"

### Data Retrieval

#### `getModelData()`
Requests the current high-resolution model data.

#### `getModelDataSlow()`
Requests the current low-resolution model data.

#### `getModelState()`
Requests the current complete model state.

#### `getModelProps(model_name)`
Requests the properties of a specific model component.
- **Parameters**:
  - `model_name`: String name of the model component

#### `getModelTypes()`
Requests all available model types.

#### `getModelInterface(model_name)`
Requests the interface definition of a specific model component.
- **Parameters**:
  - `model_name`: String name of the model component

#### `getPropValue(property)`
Gets the value of a specific property.
- **Parameters**:
  - `property`: String in format "model.prop1.prop2"

### Configuration

#### `setSampleInterval(new_interval)`
Sets the high-frequency data collection interval.
- **Parameters**:
  - `new_interval`: New interval in seconds

#### `setSampleIntervalSlow(new_interval)`
Sets the low-frequency data collection interval.
- **Parameters**:
  - `new_interval`: New interval in seconds

### Model Modification

#### `setPropValue(prop, new_value, it = 1, at = 0)`
Sets a property value in the model, optionally over time.
- **Parameters**:
  - `prop`: String in format "model.prop1.prop2"
  - `new_value`: New value to set
  - `it`: Iteration time (duration of change)
  - `at`: Start time for the change

#### `callModelFunction(model_function, args, at = 0)`
Calls a function in the model.
- **Parameters**:
  - `model_function`: String function name
  - `args`: Arguments to pass to the function
  - `at`: Time to execute the function

### State Management

#### `saveModelState()`
Requests saving of the current model state.

#### `download_model_state_json()`
Downloads the current model state as a JSON file.

#### `download_model_state_python()`
Downloads the current model state as a Python file.

### Utility Methods

#### `_processModelStateForDownloading()`
Processes the model state to make it suitable for download, removing internal properties.

#### `_download_object(object_string, filename)`
Utility method to download a string as a file.
- **Parameters**:
  - `object_string`: String content to download
  - `filename`: Name of the file to download

## Event System

The Model class uses a custom event system to communicate model state changes to the rest of the application. Events are dispatched on the document object and can be listened for by other components.

### Available Events

- `model_ready`: Fired when a model is successfully built
- `error`: Fired when an error occurs
- `rt_start`: Fired when real-time execution starts
- `rt_stop`: Fired when real-time execution stops
- `rts`: Fired when slow real-time data is updated
- `rtf`: Fired when fast real-time data is updated
- `status`: Fired when a status message is received
- `state`: Fired when the model state is updated
- `data`: Fired when high-resolution data is updated
- `data_slow`: Fired when low-resolution data is updated
- `prop_value`: Fired when a property value is received
- `model_props`: Fired when model properties are received
- `model_interface`: Fired when a model interface is received
- `model_types`: Fired when model types are received

## Usage Examples

### Loading and Starting a Model

```javascript
// Create a new model instance
const model = new Model();

// Load a model definition
model.load("baseline_neonate");

// Listen for model ready event
document.addEventListener("model_ready", () => {
  // Start real-time execution
  model.start();
});
```

### Monitoring Model Properties

```javascript
// Listen for data updates
document.addEventListener("data", () => {
  console.log(model.modelData);
});

// Set up properties to watch
model.watchModelProps(["Heart.rate", "Lungs.respiration_rate"]);
```

### Changing Model Parameters

```javascript
// Change heart rate to 80 beats per minute over 5 seconds
model.setPropValue("Heart.rate", 80, 5);

// Call a function in the model
model.callModelFunction("Heart.set_pacemaker_mode", ["auto"], 0);
```

## Integration Notes

This Model class is designed to work with the ModelEngine web worker from the previous documentation. Together, they form a complete system for physiological modeling in a web application.

The class handles:
1. User interface integration through DOM events
2. State persistence and serialization
3. A simplified API for model control and monitoring

## Implementation Notes

When implementing this class in your application:
1. Import it into your main application
2. Create an instance when you need to work with physiological models
3. Set up event listeners for the events you care about
4. Use the API methods to control and monitor the model
