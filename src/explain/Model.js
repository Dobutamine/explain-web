export default class Model {
  // declare an object holding the worker thread which does the heavy llifting
  modelEngine = {};

  // declare an object holding the model definition as loaded from the server
  modelDefinition = {};

  // declare an object holding the model data
  modelData = {};
  modelDataSlow = {};

  // declare an object holding the model state
  modelState = {};

  // declare object holding the generated messages
  info_message = "";
  error_message = "";
  status_message = "";
  script_message = "";

  // declare a message log
  message_log = [];
  no_logs = 25;

  // message debug fag
  debug = false;

  // declare the events
  _model_ready_event = new CustomEvent("model_ready")
  _error_event = new CustomEvent("error");

  _rtf_event = new CustomEvent("rtf");
  _rts_event = new CustomEvent("rts");
  _data_event = new CustomEvent("data");
  _data_slow_event = new CustomEvent("data_slow");
  _info_event = new CustomEvent("info");
  _state_event = new CustomEvent("state");
  _status_event = new CustomEvent("status");

  _script_event = new CustomEvent("script");
  _props_event = new CustomEvent("props");
  _state_saved = new CustomEvent("state_saved");
  _model_interface_event = new CustomEvent("model_interface");
  _model_types_event = new CustomEvent("model_types");

  constructor() {
    // spin up a new model engine worker thread
    this.modelEngine = new Worker(new URL("./ModelEngine.js", import.meta.url), { type: "module" });

    // set up a listener for messages from the model engine
    this.receiveMessageFromModelEngine();
  }

  loadModelDefinitionFromDisk(definition_name) {
    console.log(`Model: Loading modeling definition: '${definition_name}'.`)
    const path = "/model_definitions/" + definition_name + ".json";
    const absoluteUrl = new URL(path, import.meta.url);

    fetch(absoluteUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Uh oh! could not get the baseline_neonate from the server!"
          );
        }
        return response.json();
      })
      .then((jsonData) => {
        this.injectModelDefinitionInModelEngine(jsonData);
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
  }

  injectModelDefinitionInModelEngine(explain_definition) {
    console.log("Model: Injecting the model definition into the ModelEngine.")
    this.modelDefinition = { ...explain_definition };
    this.sendMessageToModelEngine({
      type: "command",
      message: "inject_definition",
      payload: [JSON.stringify(explain_definition)],
    });
  }

  getModelTypes() {
    this.sendMessageToModelEngine({
      type: "get_model_types",
      message: "",
      payload: [],
    });
  }

  getModelInterface(model_type) {
    this.sendMessageToModelEngine({
      type: "get_model_interface",
      message: model_type,
      payload: [],
    });
  }

  addNewModelToEngine(model_type, model_props) {
    this.sendMessageToModelEngine({
      type: "add_model",
      message: model_type,
      payload: model_props,
    });
  }

  sendMessageToModelEngine(message) {
    if (this.modelEngine) {
      if (this.debug) {
        console.log(message);
      }
      this.modelEngine.postMessage(message);
    }
  }

  logMessage(msg_type, msg) {
    let m = { type: msg_type, msg: msg };
    this.message_log.push(m);
    if (this.message_log.length > this.no_logs) {
      this.message_log.shift();
    }
  }

  clearLog() {
    this.message_log = [];
  }

  getLog() {
    return this.message_log;
  }

  start_debugger() {
    this.debug = true;
    this.sendMessageToModelEngine({
      type: "start_debug",
      message: "",
      payload: [],
    });
  }

  stop_debugger() {
    this.debug = false;
    this.sendMessageToModelEngine({
      type: "stop_debug",
      message: "",
      payload: [],
    });
  }

  receiveMessageFromModelEngine() {
    // set up a listener for messages from the model engine
    this.modelEngine.onmessage = (e) => {
      switch (e.data.type) {
        case "model_props":
          document.dispatchEvent(this._props_event);
          break;
        case "prop_value":
          break;
        case "info":
          // store the message in the log
          this.info_message = e.data.message;
          console.log(e.data.message)
          this.logMessage("info", e.data.message);
          // dispatch an info event
          document.dispatchEvent(this._info_event);
          break;
        case "status":
          switch (e.data.message) {
            case "model_ready":
              console.log("Model: ModelEngine reports model build success. Dispatching model_ready event.")
              document.dispatchEvent(this._model_ready_event);
              break;
            default:
              console.log(`Model: unknown status message from ModelEngine: ${e.data.message}`)
              break;
          }
          // store the message in the log
          this.status_message = e.data.message;
          this.logMessage("status", e.data.message);

          break;
        case "error":
          switch (e.data.message) {
            case "model_failed":
              console.log("Model: ModelEngine reports a model build failure. Dispatching model_error event.")
              // dispatch an error event
              document.dispatchEvent(this._error_event);
              break;
          }
          // store the message in the log
          this.error_message = e.data.message;
          this.logMessage("error", e.data.message);
          break;
        case "script":
          // store the message in the log
          this.script_message = e.data.message;
          this.logMessage("script", e.data.message);
          // dispatch an script event
          document.dispatchEvent(this._script_event);
          break;
        case "state":
          this.modelState = e.data.payload[0];
          document.dispatchEvent(this._state_event);
          break;
        case "data":
          this.modelData = e.data.payload[0];
          document.dispatchEvent(this._data_event);
          break;
        case "data_slow":
          this.modelDataSlow = e.data.payload[0];
          document.dispatchEvent(this._data_slow_event);
          break;
        case "rtf":
          this.modelData = e.data.payload[0];
          document.dispatchEvent(this._rtf_event);
          break;
        case "rts":
          this.modelDataSlow = e.data.payload[0];
          document.dispatchEvent(this._rts_event);
          break;

        case "model_types":
          this._model_types_event["model_types"] = JSON.parse(e.data.payload);
          document.dispatchEvent(this._model_types_event);
          break;

        case "model_interface":
          this._model_interface_event["model_type"] = e.data.message;
          this._model_interface_event["model_props"] = JSON.parse(
            e.data.payload
          );
          document.dispatchEvent(this._model_interface_event);
          break;

        case "saved_state":
          this.download_model_state(e.data.message, e.data.payload[0]);
          break;

        case "saved_state_python":
          this.download_model_state_python(e.data.message, e.data.payload[0]);
          break;

        default:
          console.log("Unknown message type received from model engine");
          console.log(e.data);
          break;
      }
    };
  }

  download_model_state(target, state) {
    this.modelDefinition = { ...state };
    if (target === "local") {
      let current_date = new Date();
      let filename =
        state["name"] + "_" + current_date.toLocaleTimeString() + ".json";
      this.saveObjectAsJson(state, filename);
    } else {
      document.dispatchEvent(this._state_saved);
    }
  }
  processModelStateForDownloading() {
    // transfrom the modelstate object to a serializable object by removing
    let modelStateCopy = { ...this.modelState };
    delete modelStateCopy["DataCollector"];
    delete modelStateCopy["TaskScheduler"];
    // iterate over all model and delete the local attributes
    Object.values(modelStateCopy.models).forEach((m) => {
      for (const key in m) {
        if (key.startsWith("_")) {
          delete m[key];
        }
        delete m["model_interface"];
      }
    });

    return modelStateCopy;
  }
  download_model_state_json() {
    let current_date = new Date();
    let modelStateCopy = this.processModelStateForDownloading();
    let filename =
      modelStateCopy["name"] +
      "_" +
      current_date.toLocaleTimeString() +
      ".json";
    let jsonString = JSON.stringify(modelStateCopy, null, 2); // Convert object to JSON string
    this.download_object(jsonString, filename);
  }

  download_model_state_python() {
    let current_date = new Date();
    let modelStateCopy = this.processModelStateForDownloading();
    let filename =
      modelStateCopy["name"] + "_" + current_date.toLocaleTimeString() + ".py";
    let pythonString = JSON.stringify(modelStateCopy, null, 2); // Convert object to JSON string
    // convert the true and false texts
    pythonString = pythonString.replace(/\btrue\b/g, "True");
    pythonString = pythonString.replace(/\bfalse\b/g, "False");

    this.download_object(pythonString, filename);
  }
  download_object(object_string, filename) {
    const blob = new Blob([object_string], { type: "application/json" }); // Create a blob with JSON content
    const url = URL.createObjectURL(blob); // Create a URL for the blob

    // Create a temporary anchor element and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Append the anchor to the document
    a.click(); // Trigger the download

    document.body.removeChild(a); // Remove the anchor from the document
    URL.revokeObjectURL(url); // Clean up the URL object
  }

  saveObjectAsJson(jsonString, filename) {
    const blob = new Blob([jsonString], { type: "application/json" }); // Create a blob with JSON content
    const url = URL.createObjectURL(blob); // Create a URL for the blob

    // Create a temporary anchor element and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Append the anchor to the document
    a.click(); // Trigger the download

    document.body.removeChild(a); // Remove the anchor from the document
    URL.revokeObjectURL(url); // Clean up the URL object
  }



  restartModelDefinition() {
    this.sendMessageToModelEngine({
      type: "restart_definition",
      message: "",
      payload: [JSON.stringify(this.modelDefinition)],
    });
  }

 

  calculate(time_to_calculate) {
    this.sendMessageToModelEngine({
      type: "calc",
      message: parseInt(time_to_calculate),
      payload: [],
    });
  }


  start() {
    this.sendMessageToModelEngine({
      type: "start",
      message: "",
      payload: [],
    });
  }

  stop() {
    this.sendMessageToModelEngine({
      type: "stop",
      message: "",
      payload: [],
    });
  }

  buildExecutionList() {
    this.sendMessageToModelEngine({
      type: "build_execution_list",
      message: "",
      payload: [],
    });
  }

  clearWatchList() {
    this.sendMessageToModelEngine({
      type: "clear_watchlist",
      message: "",
      payload: [],
    });
  }

  clearWatchListSlow() {
    this.sendMessageToModelEngine({
      type: "clear_watchlist_slow",
      message: "",
      payload: [],
    });
  }

  watchModelProps(args) {
    // args is an array of strings with format model.prop1.prop2
    if (typeof args === "string") {
      args = [args];
    }
    this.sendMessageToModelEngine({
      type: "watch_props",
      message: "",
      payload: args,
    });
  }

  watchModelPropsSlow(args) {
    // args is an array of strings with format model.prop1.prop2
    if (typeof args === "string") {
      args = [args];
    }
    this.sendMessageToModelEngine({
      type: "watch_props_slow",
      message: "",
      payload: args,
    });
  }

  getModelData() {
    this.sendMessageToModelEngine({
      type: "get_data",
      message: "",
      payload: [],
    });
  }

  getModelDataSlow() {
    this.sendMessageToModelEngine({
      type: "get_data_slow",
      message: "",
      payload: [],
    });
  }

  getModelState() {
    this.sendMessageToModelEngine({
      type: "get_state",
      message: "",
      payload: [],
    });
  }

  saveModelState(target) {
    this.sendMessageToModelEngine({
      type: "save_state",
      message: target,
      payload: [],
    });
  }

  saveModelStatePython(target) {
    this.sendMessageToModelEngine({
      type: "save_state_python",
      message: target,
      payload: [],
    });
  }

  enable(model_name, at = 0) {
    this.setPropValue(model_name + ".is_enabled", true, 0, at);
  }

  disable(model_name, at = 0) {
    this.setPropValue(model_name + ".is_enabled", false, 0, at);
  }

  scaleByWeight(new_weight) {
    this.sendMessageToModelEngine({
      type: "scale_by_weight",
      message: "",
      payload: new_weight,
    });
  }

  setSampleInterval(new_interval) {
    this.sendMessageToModelEngine({
      type: "set_sample_interval",
      message: "",
      payload: new_interval,
    });
  }

  setSampleIntervalSlow(new_interval) {
    this.sendMessageToModelEngine({
      type: "set_sample_interval_slow",
      message: "",
      payload: new_interval,
    });
  }

  getModelProps(model_name) {
    // get the properties of a specific model
    this.sendMessageToModelEngine({
      type: "get_model_props",
      message: "",
      payload: model_name,
    });
  }

  getPropValue(property) {
    // get the value of a specific property with string format model.prop1.prop2
    this.sendMessageToModelEngine({
      type: "get_prop_value",
      message: "",
      payload: property,
    });
  }

  setPropValue(prop, new_value, it = 1, at = 0) {
    // make sure the it is not zero
    if (it < 0) {
      it = 0;
    }
    let result = prop.split(".");
    let model = result[0];
    let prop1 = result[1];
    let prop2 = null;
    if (result.length > 2) {
      prop2 = result[2];
    }
    // set the property of a model with format {prop: model.prop1.prop2, v: value, at: time, it: time, type: task_type}
    this.sendMessageToModelEngine({
      type: "set_property",
      message: "",
      payload: JSON.stringify({
        model: model,
        prop1: prop1,
        prop2: prop2,
        t: new_value,
        it: it,
        at: at,
        type: typeof new_value,
      }),
    });
  }

  callModelFunction(model_function, args, at = 0) {
    this.sendMessageToModelEngine({
      type: "call_function",
      message: "",
      payload: JSON.stringify({
        func: model_function,
        args: args,
        it: 0,
        at: at,
        type: "function",
      }),
    });
  }

  updateAirwayPressure(new_value) {
    this.sendMessageToModelEngine({
      type: "aw_pressure",
      message: "",
      payload: new_value,
    });
  }
}
