export default class Model {
  // declare an object holding the worker thread which does the heavy llifting
  modelEngine = {};

  // declare an object holding the model definition as loaded from the server
  modelDefinition = {};

  // declare an object holding the model data
  modelData = {};
  modelDataSlow = {};

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
      type: "info",
      message: "ModelEngine, wake up!",
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

  receiveMessageFromModelEngine() {
    // set up a listener for messages from the model engine
    this.modelEngine.onmessage = (e) => {
      switch (e.data.type) {
        case "info":
          console.info(e.data.message);
          break;
        case "error":
          console.info(e.data.message);
          break;
        case "data":
          this.modelData = e.data.payload[0];
          break;
        case "data_slow":
          this.modelDataSlow = e.data.payload[0];
          break;
        case "rtf":
          this.modelData = e.data.payload[0];
          break;
        case "rts":
          this.modelDataSlow = e.data.payload[0];
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
