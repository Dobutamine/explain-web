# Physiology Model Engine Documentation

## Overview

The Physiology Model Engine is a dedicated web worker implementation designed to run complex physiological models in a separate thread for optimal performance. This engine uses a message-based architecture to communicate between the main thread and the worker thread, allowing for real-time simulation of physiological processes without impacting UI responsiveness.

## Architecture

### Core Components

1. **Web Worker**
   - Runs in a separate thread from the main application
   - Communicates via message passing
   - No direct access to DOM or window object

2. **Model Structure**
   - Main model container with sub-models for specific physiological systems
   - Dynamic model instantiation based on provided definitions
   - Component-based architecture for flexibility and modularity

3. **Supporting Services**
   - DataCollector: Manages data collection and monitoring
   - TaskScheduler: Handles scheduled property changes and function calls
   - BloodComposition: Utility for blood composition calculations

## Communication Protocol

Communication with the engine is handled through a REST-like API with the following operations:

- **GET**: Retrieve resources or data
- **PUT**: Update existing resources
- **POST**: Create new resources or initiate actions
- **DELETE**: Remove resources

### Message Structure

```javascript
{
  type:       <string>  // REST operation type (GET/PUT/POST/DELETE)
  message:    <string>  // Target component or action
  payload:    <object>  // Data to pass to the action
}
```

## Key Functions

### Model Building and Control

- **build(model_definition)**: Constructs a model from a JSON definition
- **start()**: Initiates real-time model execution
- **stop()**: Halts real-time model execution
- **calculate(time_to_calculate)**: Runs the model for a specified number of seconds

### Data Access and Manipulation

- **get_model_state()**: Retrieves current model state
- **get_model_data()**: Retrieves high-resolution model data
- **get_model_data_slow()**: Retrieves low-resolution model data
- **set_property(new_prop_value)**: Updates model properties
- **get_property(prop)**: Retrieves specific model properties
- **call_function(new_function_call)**: Calls a specific model function

### Monitoring

- **watch_props(args)**: Sets up high-frequency monitoring for specified properties
- **watch_props_slow(args)**: Sets up low-frequency monitoring for specified properties
- **clear_watchlist()**: Clears high-frequency monitoring list
- **clear_watchlist_slow()**: Clears low-frequency monitoring list

## Time Management

The engine supports multiple time scales:

- **modeling_stepsize**: Internal simulation time step
- **rtInterval**: Real-time update interval (15ms default)
- **rtSlowInterval**: Slow update interval (1s default)

## Error Handling

The engine includes error detection and reporting for:
- Model building errors
- Model initialization errors
- Invalid API requests

Error messages are sent to the main thread through the message channel.

## Usage Examples

### Building a Model

```javascript
// From main thread
modelWorker.postMessage({
  type: "POST",
  message: "build",
  payload: JSON.stringify(modelDefinition)
});
```

### Starting Real-time Simulation

```javascript
// From main thread
modelWorker.postMessage({
  type: "POST",
  message: "start",
  payload: {}
});
```

### Monitoring Properties

```javascript
// From main thread
modelWorker.postMessage({
  type: "POST",
  message: "watch",
  payload: ["Heart.rate", "Lungs.respiration_rate"]
});
```

## Message Handling

The web worker handles incoming messages through the `onmessage` event handler, which routes requests to appropriate functions based on the message type and target.

## Performance Considerations

- Model calculations occur in a separate thread to prevent UI blocking
- The engine reports performance metrics after calculations
- Time-step settings can be adjusted to balance accuracy vs. performance

## Integration Notes

To integrate this engine into an application:

1. Create a web worker instance pointing to this script
2. Establish message handlers for worker responses
3. Send model definitions and control commands via messages
4. Process returned data for visualization or analysis

## Extending the Engine

New physiological models can be added by:

1. Creating model classes that follow the expected interface pattern
2. Adding them to the ModelIndex module
3. They will be automatically available for instantiation in model definitions

## Technical Requirements

- Modern browser with Web Worker support
- ES6 module support
- No external dependencies required
