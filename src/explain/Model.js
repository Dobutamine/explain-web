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
  _rt_start_event = new CustomEvent("rt_start");
  _rt_stop_event = new CustomEvent("rt_stop");

  _rtf_event = new CustomEvent("rtf");
  _rts_event = new CustomEvent("rts");
  _data_event = new CustomEvent("data");
  _data_slow_event = new CustomEvent("data_slow");
  _info_event = new CustomEvent("info");
  _state_event = new CustomEvent("state");
  _status_event = new CustomEvent("status", { detail: { message: ""} });

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

  loadModelDefinition(definition_name) {
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
        this.modelDefinition = jsonData
        this.build(jsonData);
      })
      .catch((error) => {
        console.error("Error: ", error);
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

  receiveMessageFromModelEngine() {
    // set up a listener for messages from the model engine
    this.modelEngine.onmessage = (e) => {
      switch (e.data.type) {
        case "status":
          this.status_message = e.data.message
          document.dispatchEvent(this._status_event, { detail: {message:  this.status_message }})
          break;
        case "model_ready":
          console.log("Model: ModelEngine reports model build success. Dispatching model_ready event.")
          document.dispatchEvent(this._model_ready_event);
          break;
        case "rt_start":
          document.dispatchEvent(this._rt_start_event);
          break;
        case "rt_stop":
          document.dispatchEvent(this._rt_stop_event);
          break;

        case "model_props":
          document.dispatchEvent(this._props_event);
          break;
        case "prop_value":
          break;
        case "info":
          document.dispatchEvent(this._info_event);
          break;
        case "error":
          switch (e.data.message) {
            case "model_failed":
              console.log("Model: ModelEngine reports a model build failure. Dispatching model_error event.")
              // dispatch an error event
              document.dispatchEvent(this._error_event);
              break;
          }
          break;
        case "script":
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

  // API CALLS
  build(explain_definition) {
    console.log("Model: Injecting the model definition into the ModelEngine.")
    this.modelDefinition = { ...explain_definition };
    this.sendMessageToModelEngine({
      type: "POST",
      message: "build",
      payload: [JSON.stringify(explain_definition)],
    });
  }

  restart() {
    this.sendMessageToModelEngine({
      type: "POST",
      message: "restart",
      payload: [JSON.stringify(this.modelDefinition)],
    });
  }

  calculate(time_to_calculate) {
    this.sendMessageToModelEngine({
      type: "POST",
      message: "calc",
      payload: parseInt(time_to_calculate),
    });
  }

  start() {
    this.sendMessageToModelEngine({
      type: "POST",
      message: "start",
      payload: [],
    });
  }

  stop() {
    this.sendMessageToModelEngine({
      type: "POST",
      message: "stop",
      payload: [],
    });
  }

  clearWatchList() {
    this.sendMessageToModelEngine({
      type: "DELETE",
      message: "watchlist",
      payload: [],
    });
  }

  clearWatchListSlow() {
    this.sendMessageToModelEngine({
      type: "DELETE",
      message: "watchlist_slow",
      payload: [],
    });
  }

  watchModelProps(args) {
    // args is an array of strings with format model.prop1.prop2
    if (typeof args === "string") {
      args = [args];
    }
    this.sendMessageToModelEngine({
      type: "POST",
      message: "watch_props",
      payload: args,
    });
  }

  watchModelPropsSlow(args) {
    // args is an array of strings with format model.prop1.prop2
    if (typeof args === "string") {
      args = [args];
    }
    this.sendMessageToModelEngine({
      type: "POST",
      message: "watch_props_slow",
      payload: args,
    });
  }

  getModelData() {
    this.sendMessageToModelEngine({
      type: "GET",
      message: "model_data",
      payload: [],
    });
  }

  getModelDataSlow() {
    this.sendMessageToModelEngine({
      type: "GET",
      message: "model_data_slow",
      payload: [],
    });
  }

  getModelState() {
    this.sendMessageToModelEngine({
      type: "GET",
      message: "model_state",
      payload: [],
    });
  }

  saveModelState() {
    this.sendMessageToModelEngine({
      type: "POST",
      message: "save_state",
      payload: [],
    });
  }

  setSampleInterval(new_interval) {
    this.sendMessageToModelEngine({
      type: "PUT",
      message: "sample_interval",
      payload: new_interval,
    });
  }

  setSampleIntervalSlow(new_interval) {
    this.sendMessageToModelEngine({
      type: "PUT",
      message: "sample_interval_slow",
      payload: new_interval,
    });
  }

  getModelProps(model_name) {
    // get the properties of a specific model
    this.sendMessageToModelEngine({
      type: "GET",
      message: "model_properties",
      payload: model_name,
    });
  }

  getPropValue(property) {
    // get the value of a specific property with string format model.prop1.prop2
    this.sendMessageToModelEngine({
      type: "GET",
      message: "property",
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
      type: "PUT",
      message: "property",
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
      type: "POST",
      message: "call_function",
      payload: JSON.stringify({
        func: model_function,
        args: args,
        it: 0,
        at: at,
        type: "function",
      }),
    });
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

  _processModelStateForDownloading() {
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
    let modelStateCopy = this._processModelStateForDownloading();
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
    let modelStateCopy = this._processModelStateForDownloading();
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
}
