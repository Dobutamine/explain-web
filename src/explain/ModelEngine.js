// This is a dedicated web worker instance for the physiological model engine
// Web workers run in a separate thread for performance reasons and have no access to the DOM nor the window object
// The scope is defined by self and communication with the main thread by a message channel
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#web_workers_api

// Communication with the script which spawned the web worker takes place through a communication channel
// Messages are received in the onmessage event and are sent by the _send function

// Explain request object :
/* {
  type:       <string> stating the type of message (REST (PUT/POST/GET/DELETE/PATCH))
  message:    <string> stating the component of the model for which the message is intended (p.e. 'datalogger'/'interventions')
  payload:    <object> containing data to pass to the action
}
*/

// import all models present in the model_index module
import * as models from "./ModelIndex";
import DataCollector from "./helpers/DataCollector";
import TaskScheduler from "./helpers/TaskScheduler";
import { calc_blood_composition } from "./helpers/BloodComposition";

// store all imported models in a list to be able to instantiate them dynamically
let available_models = [];
Object.values(models).forEach((model) => available_models.push(model));

// declare a model object holding the current model
let model = {
  models: {},
};

// declare the model initialization flag
let model_initialized = false;

// declare a model data object holding the high resolution model data
let model_data = {};

// declare a model data object holding the low resolution model data
let model_data_slow = {};

// set the realtime updateintervals
let rtInterval = 0.015;
let rtSlowInterval = 1.0;
let rtSlowCounter = 0.0;
let rtClock = null;

// set up the endpoints for reuqests from the main thread
self.onmessage = (e) => {
  switch (e.data.type) {
    case "GET": // retrieve a resource
      switch (e.data.message) {
        case "state":
          get_model_state();
          break;
        case "data":
          get_model_data();
          break;
        case "data_slow":
          get_model_data_slow();
          break;
        case "property_value":
          get_property(e.data.payload);
          break;
        case "model_props":
          get_model_props(e.data.payload);
          break;
        case "model_types":
            get_model_types(e.data.payload);
            break;
        case "model_interface":
          get_model_interface(e.data.payload);
          break;
      }
      break;
    case "PUT": // update a resource
      switch (e.data.message) {
        case "sample_interval":
          model["DataCollector"].set_sample_interval(e.data.payload);
          break;
        case "sample_interval_slow":
          model["DataCollector"].set_sample_interval_slow(e.data.payload);
          break;
        case "property_value":
          set_property(JSON.parse(e.data.payload));
          break;
      }
      break;
    case "POST": // create a new resource
      switch (e.data.message) {
        case "build":
          console.log("ModelEngine: received new model definition.")
          model_initialized = build(JSON.parse(e.data.payload));
          break;
        case "start":
          console.log("ModelEngine: realtime model started.")
          start();
          break;
        case "stop":
          console.log("ModelEngine: realtime model stopped.")
          stop()
          break;
        case "calc":
          console.log(`ModelEngine: calculating ${e.data.payload} seconds.`)
          calculate(e.data.payload);
          break;
        case "call":
          console.log("ModelEngine: calling model a specific function", e.data.payload )
          call_function(JSON.parse(e.data.payload));
          break;
        case "add":
          add_model_to_engine(e.data.message, e.data.payload);
          break;
        case "save":
          save_state();
          break;
        case "watch":
          watch_props(e.data.payload);
          break;
        case "watch_slow":
          console.log("ModelEngine: updating watchlist slow.")
          watch_props_slow(e.data.payload);
          break;
      }
      break;
    case "DELETE": // remove a resource
      switch (e.data.message) {
        case "remove":
          break;
        case "watchlist":
          clear_watchlist();
          break;
        case "watchlist_slow":
          clear_watchlist_slow();
          break;
      }
      break;
    default:
      console.log(`ModelEngine: invalid API request ${e.data.type}`)
      break;
  }
};

// define the model functions
const build = function (model_definition) {
  console.log("ModelEngine: building model from model definition.")
  // set the error counter
  let errors = 0;

  // set model initializer to false
  model_initialized = false;

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
    ncc_atrial: 0,
    ncc_ventricular: 0,
    ncc_breathing_insp: 0,
    ncc_breathing_exp: 0,
    ncc_ventilator_insp: 0,
    ncc_ventilator_exp: 0,
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
      console.log("not found: ", sub_model_def.model_type);
      _send({
        type: "status",
        message: "ERROR: " + sub_model_def.model_type + " model not found",
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
      for (const [key, value] of Object.entries(model_definition.models[model_comp.name])) {
        args.push({ key, value });
      }
      // set the arguments
      try {
        model_comp.init_model(args);
      } catch (e) {
        console.log(e);
        errors += 1;
        _send({
          type: "status",
          message:
            "ERROR: " +
            model_comp.name +
            "(" +
            model_comp.model_type +
            ") configuration error.",
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
    console.log("ModelEngine: model build failed.")
    _send({
      type: "status",
      message: `ERROR: model build failed"`,
      payload: [],
    });
    return false;
  } else {
    console.log("ModelEngine: model build succesful.")
    _send({
      type: "model_ready",
      message: "",
      payload: [],
    });
    _send({
      type: "status",
      message: "model build successful",
      payload: [],
    });
    return true;
  }
};

const start = function () {
  // start the model in realtime
  if (model_initialized) {
    // call the modelStep every rt_interval seconds
    clearInterval(rtClock);
    rtClock = setInterval(_model_step_rt, rtInterval * 1000.0);
    // send status update
    _send({
      type: "rt_start",
      message: ``,
      payload: [],
    });
    _send({
      type: "status",
      message: `realtime model started`,
      payload: [],
    });
  } else {
    _send({
      type: "status",
      message: `ERROR: model not initialized.`,
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
    _send({
      type: "rt_stop",
      message: ``,
      payload: [],
    });
    _send({
      type: "status",
      message: `realtime model stopped`,
      payload: [],
    });
  }
};

const calculate = function (time_to_calculate) {
  // calculate a number of seconds of the model
  if (model_initialized) {
    let noOfSteps = time_to_calculate / model.modeling_stepsize;
    _send({
      type: "status",
      message: `calculating ${time_to_calculate} sec. in ${noOfSteps} steps.`,
      payload: [],
    });
    const start = performance.now();
    for (let i = 0; i < noOfSteps; i++) {
      _model_step();
    }
    const end = performance.now();
    const step_time = (end - start) / noOfSteps;

    _send({
      type: "status",
      message: `calculation ready in ${(end - start).toFixed(
        1
      )} ms with a model step time of ${step_time.toFixed(4)} ms)`,
      payload: [],
    });
    // get model data
    get_model_data();
    get_model_data_slow();
    get_model_state();
  } else {
    _send({
      type: "status",
      message: `ERROR: model not initialized.`,
      payload: [],
    });
  }

  // clean up the datacollector
  model.DataCollector.clean_up();
  model.DataCollector.clean_up_slow();
};

const set_property = function (new_prop_value) {
  model["TaskScheduler"].add_task(new_prop_value);
};

const get_property = function (prop) {
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
  _send({
    type: "prop_value",
    message: "",
    payload: { prop: prop, value: v },
  });
};

const get_model_props = function (model_name) {
  let modelStateCopy = { ...models };
  delete modelStateCopy["DataCollector"];
  delete modelStateCopy["TaskScheduler"];
  Object.values(modelStateCopy).forEach((m) => {
    for (const key in m) {
      if (key.startsWith("_")) {
        delete m[key];
      }
      delete m["model_interface"];
    }
  });
  _send({
    type: "model_props",
    message: "",
    payload: modelStateCopy,
  });

}

const get_model_interface = function (model_name) {
  _send({
    type: "model_interface",
    message: "",
    payload: model.models[model_name].model_interface,
  });

}

const get_model_types = function () {
  let types = []
  Object.values(models).forEach(mt => {
    types.push(mt.model_type)
  })
  let types_filtered = [...new Set(types)];

  _send({
    type: "model_types",
    message: "",
    payload: types_filtered,
  });

}

const call_function = function (new_function_call) {
  model["TaskScheduler"].add_function_call(new_function_call);
};

const clear_watchlist = function () {
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

const get_model_state = function () {
  // get the current whole model state
  postMessage({
    type: "state",
    message: "",
    payload: model,
  });
};

const get_model_data = function () {
  // get the realtime model data from the datacollector
  model_data = model.DataCollector.get_model_data();

  // send data to the ui
  postMessage({
    type: "data",
    message: "",
    payload: model_data,
  });
};

const get_model_data_slow = function () {
  // get the slow update model data from the datacollector
  model_data_slow = model.DataCollector.get_model_data_slow();

  // send data to the ui
  postMessage({
    type: "data_slow",
    message: "",
    payload: model_data_slow,
  });
};

const _model_step = function () {
  // iterate over all models
  Object.values(model.models).forEach((model_component) => {
    model_component.step_model();
  });

  // call the datacollector
  model["DataCollector"].collect_data(model.model_time_total);

  // do the tasks
  model["TaskScheduler"].run_tasks();


  // increase the model clock
  model.model_time_total += model.modeling_stepsize;
};

// define the local model functions
const _model_step_rt = function () {
  // so the rt_interval determines how often the model is calculated
  const noOfSteps = rtInterval / model.modeling_stepsize;
  for (let i = 0; i < noOfSteps; i++) {
    _model_step();
  }

  // get model data
  _get_model_data_rt();

  // get slow model data
  if (rtSlowCounter > rtSlowInterval) {
    rtSlowCounter = 0;
    _get_model_data_rt_slow();
  }
  rtSlowCounter += rtInterval;
};

const _get_model_data_rt = function () {
  // get the realtime model data from the datacollector
  model_data = model.DataCollector.get_model_data();

  // send data to the ui
  postMessage({
    type: "rtf",
    message: "",
    payload: model_data,
  });
};

const _get_model_data_rt_slow = function () {
  // get the realtime slow model data from the datacollector
  model_data = model.DataCollector.get_model_data_slow();

  // send data to the ui
  postMessage({
    type: "rts",
    message: "",
    payload: model_data,
  });
};

const _send = function (message) {
  postMessage(message);
};
