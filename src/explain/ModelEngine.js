// This is a dedicated web worker instance for the physiological model engine
// Web workers run in a separate thread for performance reasons and have no access to the DOM nor the window object
// The scope is defined by self and communication with the main thread by a message channel
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#web_workers_api

// Communication with the script which spawned the web worker takes place through a com channel
// Messages are received in the onmessage event and are sent by the SendMessage function

// Explain message object :
/* {
  type:       <string> stating the type of message (set/get/cmd)
  message:    <string> stating the component of the model for which the message is intended (p.e. 'datalogger'/'interventions')
  payload:    <object> containing data to pass to the action
}
*/
// import all models present in the model_index module
import * as models from "./ModelIndex";
import DataCollector from "./helpers/DataCollector";
import TaskScheduler from "./helpers/TaskScheduler";
import Scaler from "./helpers/Scaler";

// store all imported models in a list to be able to instantiate them dynamically
let available_models = [];
Object.values(models).forEach((model) => available_models.push(model));

// declare a model object holding the current model
let model = {
  models: {},
  execution_list: {},
  dependency_list: [],
};

// declare a model definition object holding the properties of the current model
let model_definition = {};

// declare the model initialization flag
let model_initialized = false;

// declare a model data object holding the high resolution model data
let model_data = {};

// set up a listener for messages from the main thread
onmessage = (e) => {
  switch (e.data.type) {
    case "eat_definition":
      sendMessage({
        type: "info",
        message: "Ah! Food! Consuming a fresh ModelDefinition. ",
        payload: [],
      });
      model_initialized = processModelDefinition(JSON.parse(e.data.payload[0]));
      break;
    case "log":
      console.log(e.data.message);
      break;
    case "error":
      console.error(e.data.message);
      break;
    case "info":
      console.info(e.data.message);
      sendMessage({
        type: "info",
        message: "Huh? What? Yeah, ok i'm awake. Don't rush me!",
        payload: [],
      });
      break;
    default:
      console.log(e.data.message);
      sendMessage({
        type: "info",
        message: "Huh? I don't get this message?",
        payload: [],
      });
      break;
  }
};

const processModelDefinition = function (model_definition) {
  // set the error counter
  let errors = 0;

  // store the model definition
  model_definition = model_definition;

  // clear the current model object
  model = {
    models: {},
    execution_list: {},
    dependency_list: [],
  };

  // initialize the model parameters, except the model components key which needs special processing
  for (const [key, value] of Object.entries(model_definition)) {
    if (key !== "models") {
      // copy model parameter to the model object
      model[key] = value;
    }
  }

  // initialize all sub models
  Object.values(model_definition.models).forEach((sub_model_def) => {
    // check if the model is available in the available model list
    let index = available_models.findIndex(
      (available_model) =>
        available_model.class_type === sub_model_def.model_type
    );

    // if the component model was found then instantiate a model
    if (index > -1) {
      // instantiate the new component and give it a name, pass the model type and a reference to the whole model
      let new_sub_model = new available_models[index](
        model,
        sub_model_def.name,
        sub_model_def.model_type
      );
      // add the new component to the model object
      model.models[sub_model_def.name] = new_sub_model;
    } else {
      errors += 1;
      sendMessage({
        type: "error",
        message: sub_model_def.model_type + " model not found",
        payload: [],
      });
    }
  });

  // initialize all sub models
  if (errors < 1) {
    // now initialize all the models with the correct properties stored in the model definition
    Object.values(model.models).forEach((model_comp) => {
      // // find the arguments for the model in the model definition
      let args = [];
      for (const [key, value] of Object.entries(
        model_definition.models[model_comp.name]
      )) {
        args.push({ key, value });
      }
      // set the arguments
      try {
        model_comp.init_model(args);
      } catch (e) {
        errors += 1;
        sendMessage({
          type: "error",
          message:
            "Yikes, " +
            model_comp.name +
            "(" +
            model_comp.model_type +
            ") smelled really bad!",
          payload: [],
        });
      }
    });

    // add a datacollector instance to the model object
    model["DataCollector"] = new DataCollector(model);

    // add a task scheduler instance to the model object
    model["TaskScheduler"] = new TaskScheduler(model);

    // add a scaler instance to the model object
    model["Scaler"] = new Scaler(model);
  }

  if (errors > 0) {
    sendMessage({
      type: "info",
      message: "Vomit! Not ready, that was a faul ModelDefinition.",
      payload: [],
    });
    return false;
  } else {
    sendMessage({
      type: "info",
      message: "Burrp! Ready, that was a delicious ModelDefinition.",
      payload: [],
    });
    return true;
  }
};

const sendMessage = function (message) {
  message.message = "ModelEngine: " + message.message;
  postMessage(message);
};
