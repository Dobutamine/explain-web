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

// declare a flag indicating whether the execution list needs to be refreshed.
let rebuildExecutionList = true;

// declare a model definition object holding the properties of the current model
let model_definition = {};

// declare the model initialization flag
let model_initialized = false;

// declare a model data object holding the high resolution model data
let model_data = {};

// declare a model data object holding the low resolution model data
let model_data_slow = {};

// set the realtime updateinterval
let rtInterval = 0.015;
let rtSlowInterval = 1.0;
let rtSlowCounter = 0.0;
let rtClock = null;

// set the debug mode flag
let debug = true;

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
    case "start":
      start();
      break;
    case "stop":
      stop();
      break;
    case "get_state":
      getState();
      break;
    case "calc":
      calculate(e.data.message);
      break;
    case "wake_up":
      if (debug) {
        console.info(e.data.message);
      }
      sendMessage({
        type: "info",
        message: "Huh? What? Yeah, ok i'm awake. Don't rush me!",
        payload: [],
      });
      break;
    default:
      if (debug) {
        console.log(e.data.message);
      }
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

// prepare for a model run
const prepareForExecution = function () {
  // iterate over the models and add the models which should be executed to the list
  Object.values(model.models).forEach((model_comp) => {
    if (model_comp.is_enabled) {
      let key = model_comp.name;
      model.execution_list[key] = model_comp;
    }
  });

  // build the dependency list
  buildDependencyList();

  // check the dependencies against the execution list
  let check_result = checkDependencies();

  // handle the check result
  if (check_result.length > 0) {
    postMessage({
      type: "error",
      message: `dependency error`,
      payload: check_result,
    });
    // flag that the execution list needs to be rebuild as there were errors
    rebuildExecutionList = true;
    return false;
  }

  // flag that the execution list does not have to be rebuilt
  rebuildExecutionList = false;

  // return that everything went well
  return true;
};

// check whether or not all dependencies of met
const checkDependencies = function () {
  let dep_not_found = [];
  // check whether the models in the executionlist match the dependency list
  model.dependency_list.forEach((dep) => {
    // check whether this dependency is in the execution list
    let dep_found = false;
    Object.values(model.execution_list).forEach((model_comp) => {
      if (model_comp.name === dep) {
        dep_found = true;
      }
    });
    if (!dep_found) {
      dep_not_found.push(dep);
    }
  });

  return dep_not_found;
};

// build the dependency list
const buildDependencyList = function () {
  model.dependency_list = [];
  let depList = [];
  Object.values(model.execution_list).forEach((model_comp) => {
    // // process the dependencies
    model_comp.dependencies.forEach((dep) => {
      depList.push(dep);
    });
    // remove duplicates
    model.dependency_list = depList.filter(
      (item, index) => depList.indexOf(item) === index
    );
  });
};

const calculate = function (time_to_calculate) {
  // check whether the execution list needs to be rebuild
  let exec_check = false;

  // build the execution list
  exec_check = prepareForExecution();

  // if the dependency or execution list composition check fails return and don't execute the model run
  if (!exec_check) {
    return;
  }

  // clean up the datacollector
  model.DataCollector.clean_up();

  // calculate a number of seconds of the model
  if (model_initialized) {
    let noOfSteps = time_to_calculate / model.modeling_stepsize;
    sendMessage({
      type: "status",
      message: `calculating ${time_to_calculate} sec. in ${noOfSteps} steps.`,
      payload: [],
    });
    const start = performance.now();
    for (let i = 0; i < noOfSteps; i++) {
      modelStep();
    }
    const end = performance.now();
    const step_time = (end - start) / noOfSteps;

    sendMessage({
      type: "status",
      message: `calculation ready in ${(end - start).toFixed(
        1
      )} ms with a model step time of ${step_time.toFixed(4)} ms)`,
      payload: [],
    });

    // get the data from the datacollector
    getModelData();
    getModelDataSlow();
  } else {
    sendMessage({
      type: "error",
      message: `model not initialized.`,
      payload: [],
    });
  }
};

// do a single model step
const modelStep = function () {
  // iterate over all models
  Object.values(model.execution_list).forEach((model_component) => {
    model_component.step_model();
  });

  // call the datacollector
  model["DataCollector"].collect_data(model.model_time_total);

  // increase the model clock
  model.model_time_total += model.modeling_stepsize;
};

const modelStepRt = function () {
  // so the rt_interval determines how often the model is calculated
  const noOfSteps = rtInterval / model.modeling_stepsize;
  for (let i = 0; i < noOfSteps; i++) {
    modelStep();
  }

  // get model data
  getModelDataRt();

  // get slow model data
  if (rtSlowCounter > rtSlowInterval) {
    rtSlowCounter = 0;
    getModelDataRtSlow();
  }
  rtSlowCounter += rtInterval;
};

const start = function () {
  // start the model in realtime
  if (model_initialized) {
    // rebuilf the execution list if necessary
    if (rebuildExecutionList) {
      prepareForExecution();
    }

    // call the modelStep every rt_interval seconds
    clearInterval(rtClock);
    rtClock = setInterval(modelStepRt, rtInterval * 1000.0);
    // send status update
    sendMessage({
      type: "status",
      message: `realtime model started.`,
      payload: [],
    });
  } else {
    sendMessage({
      type: "error",
      message: `model not initialized.`,
      payload: [],
    });
  }
};

const stop = function () {
  // stop the realtime model
  if (model_initialized) {
    clearInterval(rtClock);
    rtClock = null;
    sendMessage({
      type: "status",
      message: `realtime model stopped.`,
      payload: [],
    });
  }
};

// get the current whole model state
const getState = function () {
  // refresh the model state on the model instance
  postMessage({
    type: "state",
    message: "",
    payload: [model],
  });
};

// get the realtime model data from the datacollector
const getModelData = function () {
  // refresh the model data on the model instance
  model_data = model.DataCollector.get_model_data();

  // send data to the ui
  postMessage({
    type: "data",
    message: "",
    payload: [model_data],
  });
};

// get the realtime model data from the datacollector
const getModelDataRt = function () {
  // refresh the model data on the model instance
  model_data = model.DataCollector.get_model_data();

  // send data to the ui
  postMessage({
    type: "rtf",
    message: "",
    payload: [model_data],
  });
};

// get the realtime model data from the datacollector
const getModelDataRtSlow = function () {
  // refresh the model data on the model instance
  model_data = model.DataCollector.get_model_data_slow();

  // send data to the ui
  postMessage({
    type: "rts",
    message: "",
    payload: [model_data],
  });
};

// get the slow update model data from the datacollector
const getModelDataSlow = function () {
  // refresh the model data on the model instance
  model_data_slow = model.DataCollector.get_model_data_slow();

  // send data to the ui
  postMessage({
    type: "data_slow",
    message: "",
    payload: [model_data_slow],
  });
};
