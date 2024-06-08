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
let debug = false;

// set up a listener for messages from the main thread
onmessage = (e) => {
  switch (e.data.type) {
    case "eat_definition":
      if (debug) {
        sendMessage({
          type: "info",
          message: "Ah! Food! Consuming a fresh ModelDefinition. ",
          payload: [],
        });
      }
      model_initialized = process_model_definition(
        JSON.parse(e.data.payload[0])
      );
      sendMessage({
        type: "info",
        message: "model ready",
        payload: [],
      });
      break;
    case "restart_definition":
      model_initialized = process_model_definition(
        JSON.parse(e.data.payload[0])
      );
      sendMessage({
        type: "info",
        message: "model ready",
        payload: [],
      });
      break;
    case "start":
      start();
      break;
    case "stop":
      stop();
      break;
    case "save_state":
      save_model_state_json(e.data.message);
      break;
    case "get_state":
      get_state();
      break;
    case "get_data":
      get_model_data();
      break;
    case "get_data_slow":
      get_model_data_slow();
      break;
    case "calc":
      calculate(e.data.message);
      break;
    case "watch_props":
      watch_props(e.data.payload);
      break;
    case "watch_props_slow":
      watch_props_slow(e.data.payload);
      break;
    case "clear_watchlist":
      clear_watchtlist();
      break;
    case "clear_watchlist_slow":
      clear_watchlist_slow();
      break;
    case "build_execution_list":
      build_execution_list();
      break;
    case "get_model_props":
      get_props(e.data.payload);
      break;
    case "set_prop_value":
      set_prop_value(JSON.parse(e.data.payload));
      break;
    case "get_prop_value":
      get_prop_value(e.data.payload);
      break;
    case "set_sample_interval":
      model["DataCollector"].set_sample_interval(e.data.payload);
      break;
    case "set_sample_interval_slow":
      model["DataCollector"].set_sample_interval_slow(e.data.payload);
      break;
    case "start_debug":
      debug = true;
      break;
    case "stop_debug":
      debug = false;
      break;
    case "add_model":
      add_model_to_engine(e.data.message, e.data.payload);
      break;
    case "get_model_interface":
      get_model_interface(e.data.message);
      break;
    case "get_model_types":
      get_model_types();
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

const set_prop_value = function (new_prop_value) {
  model["TaskScheduler"].add_task(new_prop_value);
};

const get_prop_value = function (prop) {
  let p = prop.split(".");
  let v = {};
  switch (p.length) {
    case 2:
      v = model.models[p[0]][p[1]];
      break;
    case 3:
      v = model.models[p[0]][p[1]][p[2]];
      break;
  }
  sendMessage({
    type: "prop_value",
    message: "",
    payload: JSON.stringify({ prop: prop, value: v }),
  });
};

const clear_watchtlist = function () {
  model.DataCollector.clear_watchlist();
};

const clear_watchlist_slow = function () {
  model.DataCollector.clear_watchlist_slow();
};

const watch_props = function (args) {
  args.forEach((prop) => {
    model.DataCollector.add_to_watchlist(prop);
  });
};

const watch_props_slow = function (args) {
  args.forEach((prop) => {
    model.DataCollector.add_to_watchlist_slow(prop);
  });
};

const get_props = function (model_name) {
  // return an array with all the props of the submodel
  let model_props = {};
  for (let prop in model.models[model_name]) {
    if (prop[[0]] !== "_") {
      model_props[prop] = model.models[model_name][prop];
    }
  }
  sendMessage({
    type: "model_props",
    message: model_name,
    payload: JSON.stringify(model_props),
  });
};

const get_model_types = function () {
  let model_types = [];
  available_models.forEach((model) => {
    model_types.push(model.model_type);
  });

  sendMessage({
    type: "model_types",
    message: "available model types",
    payload: JSON.stringify(model_types),
  });
};
const get_model_interface = function (model_type) {
  let index = available_models.findIndex(
    (available_model) => available_model.model_type === model_type
  );
  if (index > -1) {
    sendMessage({
      type: "model_interface",
      message: model_type,
      payload: JSON.stringify(available_models[index].model_interface),
    });
  } else {
    sendMessage({
      type: "error",
      message: model_type + " model not found",
      payload: [],
    });
  }
};

const add_model_to_engine = function (model_type, model_props) {
  // check if the model is available in the available model list
  let index = available_models.findIndex(
    (available_model) => available_model.model_type === model_props.model_type
  );
  // if the component model was found then instantiate a model
  if (index > -1) {
    // instantiate the new component and give it a name, pass the model type and a reference to the whole model
    let new_sub_model = new available_models[index](
      model,
      model_props.name,
      model_props.model_type
    );
    // add the new component to the model object
    model.models[model_props.name] = new_sub_model;
    // copy the model interface object
    model.models[model_props.name].model_interface = [
      ...available_models[index].model_interface,
    ];
  }
  // initialize the model with the correct properties stored in the model definition
  let args = [];
  Object.entries(model_props).forEach(([key, value]) => {
    args.push({ key, value });
  });
  model.models[model_props.name].init_model(args);
  // now we need specific code to initialize some models which contain properties that are dependent on other models
  if (
    model_props.model_type === "BloodCapacitance" ||
    model_props.model_type === "BloodTimeVaryingElastance" ||
    model_props.model_type === "BloodPump"
  ) {
    model.models["Blood"].set_blood_properties(model_props.name);
  }
  if (model_props.model_type === "GasCapacitance") {
    model.models["Gas"].set_gas_properties(model_props.name);
  }
  console.log(model.models);
};

const process_model_definition = function (model_definition) {
  // set the error counter
  let errors = 0;

  // set model initializer to false
  model_initialized = false;

  // rebuild the execution list
  rebuildExecutionList = true;

  // store the model definition
  model_definition = model_definition;

  // erase all data
  model_data = {};
  model_data_slow = {};

  // stop all timers
  clearInterval(rtClock);

  // clear the current model object
  model = {
    models: {},
    rebuildExecutionListFlag: false,
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
        available_model.model_type === sub_model_def.model_type
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
      // copy the model interface object
      model.models[sub_model_def.name].model_interface = [
        ...available_models[index].model_interface,
      ];
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
        console.log(e);
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
  }

  if (errors > 0) {
    sendMessage({
      type: "status",
      message: `error loading model definition "${model.name}"`,
      payload: [],
    });
    return false;
  } else {
    sendMessage({
      type: "info",
      message: `started model definition "${model.name}"`,
      payload: [],
    });
    sendMessage({
      type: "status",
      message: `ready to rumble.`,
      payload: [],
    });
    return true;
  }
};

const build_execution_list = function () {
  // iterate over the models and add the models which should be executed to the list
  model.execution_list = {};

  // build the execution list
  Object.values(model.models).forEach((model_comp) => {
    if (model_comp.is_enabled) {
      let key = model_comp.name;
      model.execution_list[key] = model_comp;
    }
  });
  rebuildExecutionList = false;

  // reset model execution list flaf
  model.rebuildExecutionListFlag = false;
};
// prepare for a model run
const prepare_for_execution = function () {
  // iterate over the models and add the models which should be executed to the list
  model.execution_list = {};

  // build the execution list
  Object.values(model.models).forEach((model_comp) => {
    if (model_comp.is_enabled) {
      let key = model_comp.name;
      model.execution_list[key] = model_comp;
    }
  });

  // build the dependency list
  build_dependency_list();

  // check the dependencies against the execution list
  let check_result = check_dependencies();

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
const check_dependencies = function () {
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
const build_dependency_list = function () {
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
  exec_check = prepare_for_execution();

  // if the dependency or execution list composition check fails return and don't execute the model run
  if (!exec_check) {
    return;
  }

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
      model_step();
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
    // get model data
    get_model_data();
    get_model_data_slow();
    get_state();
  } else {
    sendMessage({
      type: "error",
      message: `model not initialized.`,
      payload: [],
    });
  }

  // clean up the datacollector
  model.DataCollector.clean_up();
};

// do a single model step
const model_step = function () {
  // iterate over all models
  Object.values(model.execution_list).forEach((model_component) => {
    model_component.step_model();
  });

  // do the tasks
  model["TaskScheduler"].update_tasks();

  // call the datacollector
  model["DataCollector"].collect_data(model.model_time_total);

  // increase the model clock
  model.model_time_total += model.modeling_stepsize;
};

const model_step_rt = function () {
  // does the execution list need a rebuild
  if (rebuildExecutionList || model.rebuildExecutionListFlag) {
    build_execution_list();
  }
  // so the rt_interval determines how often the model is calculated
  const noOfSteps = rtInterval / model.modeling_stepsize;
  for (let i = 0; i < noOfSteps; i++) {
    model_step();
  }

  // get model data
  get_model_data_rt();

  // get slow model data
  if (rtSlowCounter > rtSlowInterval) {
    rtSlowCounter = 0;
    get_model_data_rt_slow();
  }
  rtSlowCounter += rtInterval;
};

const start = function () {
  // start the model in realtime
  if (model_initialized) {
    // rebuilf the execution list if necessary
    if (rebuildExecutionList) {
      prepare_for_execution();
    }

    // call the modelStep every rt_interval seconds
    clearInterval(rtClock);
    rtClock = setInterval(model_step_rt, rtInterval * 1000.0);
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
    // signal that realtime model stopped
    sendMessage({
      type: "status",
      message: `realtime model stopped.`,
      payload: [],
    });
  }
};

// get the current whole model state
const get_state = function () {
  // refresh the model state on the model instance
  postMessage({
    type: "state",
    message: "",
    payload: [model],
  });
};

// get the realtime model data from the datacollector
const get_model_data = function () {
  // refresh the model data on the model instance
  model_data = model.DataCollector.get_model_data();

  // send data to the ui
  postMessage({
    type: "data",
    message: "",
    payload: [model_data],
  });
};

// get the slow update model data from the datacollector
const get_model_data_slow = function () {
  // refresh the model data on the model instance
  model_data_slow = model.DataCollector.get_model_data_slow();

  // send data to the ui
  postMessage({
    type: "data_slow",
    message: "",
    payload: [model_data_slow],
  });
};

// get the realtime model data from the datacollector
const get_model_data_rt = function () {
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
const get_model_data_rt_slow = function () {
  // refresh the model data on the model instance
  model_data = model.DataCollector.get_model_data_slow();

  // send data to the ui
  postMessage({
    type: "rts",
    message: "",
    payload: [model_data],
  });
};

const save_model_state_json = function (target) {
  let current_data = new Date();
  let new_json = {
    explain_version: model["explain_version"],
    owner: model["owner"],
    date_created: model["date_created"],
    date_modified: current_data.toLocaleTimeString(),
    shared: model["shared"],
    protected: model["protected"],
    name: model["name"],
    description: model["description"],
    weight: model["weight"],
    height: model["height"],
    gestational_age: model["gestational_age"],
    age: model["age"],
    modeling_stepsize: model["modeling_stepsize"],
    model_time_total: model["model_time_total"],
    models: {},
    scaler_settings: model["scaler_settings"],
  };

  // process the model definition file to find the necessary properties
  for (let [mn, m] of Object.entries(model.models)) {
    new_json["models"][mn] = {};
    for (let [pn, pv] of Object.entries(m)) {
      if (pn[0] !== "_" && pn !== "model_interface") {
        if (typeof pv == "object" && pv.hasOwnProperty("name")) {
          new_json["models"][mn][pn] = pv.name;
        } else {
          new_json["models"][mn][pn] = pv;
        }
      }
    }
  }
  // send data to the ui
  postMessage({
    type: "saved_state",
    message: target,
    payload: [new_json],
  });
};

const sendMessage = function (message) {
  message.message = "ModelEngine: " + message.message;
  postMessage(message);
};
