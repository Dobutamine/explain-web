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

  // declare the events
  rtf_event = new CustomEvent("rtf");
  rts_event = new CustomEvent("rts");
  data_event = new CustomEvent("data");
  data_slow_event = new CustomEvent("data_slow");
  info_event = new CustomEvent("info");
  state_event = new CustomEvent("state");
  status_event = new CustomEvent("status");
  error_event = new CustomEvent("error");
  script_event = new CustomEvent("script");

  // declare object holding the generated messages
  info_message = "";
  error_message = "";
  status_message = "";
  script_message = "";

  // declare a message log
  message_log = [];

  // message debug fag
  debug = true;

  constructor() {
    // spin up a new model engine worker thread
    this.modelEngine = new Worker(
      new URL("./ModelEngine.js", import.meta.url),
      { type: "module" }
    );

    // set up a listener for messages from the model engine
    this.receiveMessageFromModelEngine();

    // wake up the model engine
    this.sendMessageToModelEngine({
      type: "wake_up",
      message: "Model: He ModelEngine, wake up!",
      payload: [],
    });

    // get the baseline neonate
    this.modelDefinition = this.loadBaselineNeonate();
  }

  sendMessageToModelEngine(message) {
    if (this.modelEngine) {
      message.message = message.message;
      this.modelEngine.postMessage(message);
    }
  }

  logMessage(msg_type, msg) {
    let m = { type: msg_type, msg: msg };
    this.message_log.push(m);
    if (this.message_log.length > 25) {
      this.message_log.shift();
    }
  }
  receiveMessageFromModelEngine() {
    // set up a listener for messages from the model engine
    this.modelEngine.onmessage = (e) => {
      switch (e.data.type) {
        case "info":
          if (this.debug) {
            console.info(e.data.message);
          }
          // store the message in the log
          this.info_message = e.data.message;
          this.logMessage("info", e.data.message);
          // dispatch an info event
          document.dispatchEvent(this.info_event);
          break;
        case "status":
          if (this.debug) {
            console.info(e.data.message);
          }

          // store the message in the log
          this.status_message = e.data.message;
          this.logMessage("status", e.data.message);
          // dispatch a status event
          document.dispatchEvent(this.status_event);
          break;
        case "error":
          if (this.debug) {
            console.info(e.data.message);
          }
          // store the message in the log
          this.error_message = e.data.message;
          this.logMessage("error", e.data.message);
          // dispatch an error event
          document.dispatchEvent("error", this.error_event);
          break;
        case "script":
          if (this.debug) {
            console.info(e.data.message);
          }
          // store the message in the log
          this.script_message = e.data.message;
          this.logMessage("script", e.data.message);
          // dispatch an script event
          document.dispatchEvent(this.script_event);
          break;
        case "state":
          if (this.debug) {
            console.log(`Model: received model engine state.`);
          }
          this.modelState = e.data.payload[0];
          document.dispatchEvent(this.state_event);
          break;
        case "data":
          if (this.debug) {
            console.log(`Model: received model data.`);
          }
          this.modelData = e.data.payload[0];
          document.dispatchEvent(this.data_event);
          break;
        case "data_slow":
          if (this.debug) {
            console.log(`Model: received model data slow.`);
          }
          this.modelDataSlow = e.data.payload[0];
          document.dispatchEvent(this.data_slow_event);
          break;
        case "rtf":
          if (this.debug) {
            console.log(`Model: received model engine rt data.`);
          }
          this.modelData = e.data.payload[0];
          document.dispatchEvent(this.rtf_event);
          break;
        case "rts":
          if (this.debug) {
            console.log(`Model: received model engine rt data slow.`);
          }
          this.modelDataSlow = e.data.payload[0];
          document.dispatchEvent(this.rts_event);
          break;

        default:
          console.log("Unknown message type received from model engine");
          console.log(e.data);
          break;
      }
    };
  }

  loadBaselineNeonate() {
    fetch(new URL("./definitions/baseline_neonate.json", import.meta.url))
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Uh oh! could not get the baseline_neonate from the server!"
          );
        }
        return response.json();
      })
      .then((jsonData) => {
        this.injectModelDefinition(jsonData);
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
  }

  injectModelDefinition(explain_definition) {
    this.sendMessageToModelEngine({
      type: "eat_definition",
      message: "",
      payload: [JSON.stringify(explain_definition)],
    });
  }

  calculate(time_to_calculate) {
    this.sendMessageToModelEngine({
      type: "calc",
      message: parseInt(time_to_calculate),
      payload: [],
    });
  }

  getState() {
    this.sendMessageToModelEngine({
      type: "get_state",
      message: "",
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
}
