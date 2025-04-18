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
  statusMessage = "";
  script_message = "";

  // declare a message log
  message_log = [];
  no_logs = 25;

  // declare the events
  _model_ready_event = new CustomEvent("model_ready")
  _error_event = new CustomEvent("error");
  _rt_start_event = new CustomEvent("rt_start");
  _rt_stop_event = new CustomEvent("rt_stop");
  _rts_event = new CustomEvent("rts");
  _rtf_event = new CustomEvent("rtf");
  _status_event = new CustomEvent("status");
  _state_event = new CustomEvent("state");
  _data_event = new CustomEvent("data");
  _data_slow_event = new CustomEvent("data_slow");
  _state_saved_event = new CustomEvent("state_saved")

  constructor() {
    // spin up a new model engine worker thread
    this.modelEngine = new Worker(new URL("./ModelEngine.js", import.meta.url), { type: "module" });

    // set up a listener for messages from the model engine
    this.receive();
  }

  load(definition_name) {
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
        this.build(jsonData);
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
  }

  send(message) {
    if (this.modelEngine) {
      this.modelEngine.postMessage(message);
    }
  }

  receive() {
    // set up a listener for messages from the model engine
    this.modelEngine.onmessage = (e) => {
      switch (e.data.type) {
        case "state":
          this.modelState = e.data.payload;
          document.dispatchEvent(this._state_event);
          break;
        case "status":
          this.statusMessage = e.data.message
          document.dispatchEvent(this._status_event)
          break;
        case "model_ready":
          document.dispatchEvent(this._model_ready_event);
          break;
        case "rt_start":
          document.dispatchEvent(this._rt_start_event);
          break;
        case "rt_stop":
          document.dispatchEvent(this._rt_stop_event);
          break;
        case "data":
          this.modelData = e.data.payload;
          document.dispatchEvent(this._data_event);
          break;
        case "data_slow":
          this.modelDataSlow = e.data.payload;
          document.dispatchEvent(this._data_slow_event);
          break;
        case "rtf":
          this.modelData = e.data.payload;
          document.dispatchEvent(this._rtf_event);
          break;
        case "rts":
          this.modelDataSlow = e.data.payload;
          document.dispatchEvent(this._rts_event);
          break;
        case "prop_value":
          const _prop_value_event = new CustomEvent("prop_value", { detail: e.data.payload, bubbles: true, cancelable: true, composed: false });
          document.dispatchEvent(_prop_value_event)
          break;
        case "model_props":
          const _model_props_event = new CustomEvent("model_props", { detail: e.data.payload, bubbles: true, cancelable: true, composed: false });
          document.dispatchEvent(_model_props_event)
          break;
        case "model_interface":
          const _model_interface_event = new CustomEvent("model_interface", { detail: e.data.payload, bubbles: true, cancelable: true, composed: false });
          document.dispatchEvent(_model_interface_event)
          break;
        case "model_types":
          const _model_types_event = new CustomEvent("model_types", { detail: e.data.payload, bubbles: true, cancelable: true, composed: false });
          document.dispatchEvent(_model_types_event)
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
    this.send({
      type: "POST",
      message: "build",
      payload: JSON.stringify(explain_definition),
    });
  }

  restart() {
    this.send({
      type: "POST",
      message: "build",
      payload: JSON.stringify(this.modelDefinition),
    });
  }

  calculate(time_to_calculate) {
    this.send({
      type: "POST",
      message: "calc",
      payload: parseInt(time_to_calculate),
    });
  }

  start() {
    this.send({
      type: "POST",
      message: "start",
      payload: [],
    });
  }

  stop() {
    this.send({
      type: "POST",
      message: "stop",
      payload: [],
    });
  }

  clearWatchList() {
    this.send({
      type: "DELETE",
      message: "watchlist",
      payload: [],
    });
  }

  clearWatchListSlow() {
    this.send({
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
    this.send({
      type: "POST",
      message: "watch",
      payload: args,
    });
  }

  watchModelPropsSlow(args) {
    // args is an array of strings with format model.prop1.prop2
    if (typeof args === "string") {
      args = [args];
    }
    this.send({
      type: "POST",
      message: "watch_slow",
      payload: args,
    });
  }

  getModelData() {
    this.send({
      type: "GET",
      message: "data",
      payload: [],
    });
  }

  getModelDataSlow() {
    this.send({
      type: "GET",
      message: "data_slow",
      payload: [],
    });
  }

  setSampleInterval(new_interval) {
    this.send({
      type: "PUT",
      message: "sample_interval",
      payload: new_interval,
    });
  }

  setSampleIntervalSlow(new_interval) {
    this.send({
      type: "PUT",
      message: "sample_interval_slow",
      payload: new_interval,
    });
  }

  getModelState() {
    this.send({
      type: "GET",
      message: "state",
      payload: [],
    });
  }

  saveModelState() {
    this.send({
      type: "POST",
      message: "save",
      payload: [],
    });
  }

  getModelProps(model_name) {
    // get the properties of a specific model
    this.send({
      type: "GET",
      message: "model_props",
      payload: model_name,
    });
  }

  getModelTypes() {
    // get all the model types
    this.send({
      type: "GET",
      message: "model_types",
      payload: {},
    });
  }

  getModelInterface(model_name) {
    // get the interface of a specific model
    this.send({
      type: "GET",
      message: "model_interface",
      payload: model_name,
    });
  }

  getPropValue(property) {
    // get the value of a specific property with string format model.prop1.prop2
    this.send({
      type: "GET",
      message: "property_value",
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
    this.send({
      type: "PUT",
      message: "property_value",
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
    this.send({
      type: "POST",
      message: "call",
      payload: JSON.stringify({
        func: model_function,
        args: args,
        it: 0,
        at: at,
        type: "function",
      }),
    });
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
    this._download_object(jsonString, filename);
  }

  download_model_state_python() {
    console.log('Python saved')
    let current_date = new Date();
    let modelStateCopy = this._processModelStateForDownloading();
    let filename =
      modelStateCopy["name"] + "_" + current_date.toLocaleTimeString() + ".py";
    let pythonString = JSON.stringify(modelStateCopy, null, 2); // Convert object to JSON string
    // convert the true and false texts
    pythonString = pythonString.replace(/\btrue\b/g, "True");
    pythonString = pythonString.replace(/\bfalse\b/g, "False");

    this._download_object(pythonString, filename);
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
        if (key === 'components') {
          if (Object.keys(m[key]).length > 0) {
            // build name array of keys
            let key_names = [] 
            Object.keys(m[key]).forEach(k => {
              key_names.push(k)
            })
            // replace
            key_names.forEach( key_name => {
              m['components'][key_name] = modelStateCopy.models[key_name]
              delete modelStateCopy.models[key_name]
            })
          }

        }
        delete m["model_interface"];
      }
    });
    return modelStateCopy;
  }

  _download_object(object_string, filename) {
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

}
