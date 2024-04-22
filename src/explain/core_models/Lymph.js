export class Lymph {
  static model_type = "Lymph";
  static model_interface = [];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  ducts = ["LD"];
  trunks = ["LT"];
  interstitium = ["IS"];
  pump = [];
  starlings = [
    "INT_IS",
    "KID_IS",
    "RLB_IS",
    "LS_IS",
    "RUB_IS",
    "LL_IS",
    "RL_IS",
  ];

  // dependent parameters
  is_flow = 0.0;
  is_lt_flow = 0.0;
  lt_ld_flow = 0.0;
  ld_svc_flow = 0.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _analysis_counter = 0.0;
  _analysis_interval = 2.0;
  _cum_is_flow = 0.0;
  _cum_is_lt_flow = 0.0;
  _cum_lt_ld_flow = 0.0;
  _cum_ld_svc_flow = 0.0;

  // the constructor builds a bare bone modelobject of the correct type and with the correct name and stores a reference to the modelengine object
  constructor(model_ref, name = "", type = "") {
    // name of the model
    this.name = name;

    // model type
    this.model_type = type;

    // reference to the model engine
    this._model_engine = model_ref;
  }

  init_model(args) {
    // process the parameters
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // set the modeling step size
    this._t = this._model_engine.modeling_stepsize;

    // set the aboxy and solutes
    for (let [model_name, model] of Object.entries(this._model_engine.models)) {
      if (model.model_type === "LymphCapacitance") {
        if (Object.keys(model.aboxy).length < 1) {
          model.aboxy = { ...this.aboxy };
          model.solutes = { ...this.solutes };
        }
      }
    }
    // set the flag to model is initialized
    this._is_initialized = true;
  }

  switch_lymphatics(state) {
    this.interstitium.forEach((i) => {
      this._model_engine.models[i].is_enabled = state;
    });
    this.trunks.forEach((i) => {
      this._model_engine.models[i].is_enabled = state;
    });
    this.ducts.forEach((i) => {
      this._model_engine.models[i].is_enabled = state;
    });
    this.pump.forEach((i) => {
      this._model_engine.models[i].is_enabled = state;
    });
    this.starlings.forEach((i) => {
      this._model_engine.models[i].is_enabled = state;
    });
    this.is_enabled = state;

    //this._model_engine.rebuildExecutionList = true;
    console.log(this._model_engine);
  }
  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    if (this._analysis_counter > this._analysis_interval) {
      this.is_flow = (this._cum_is_flow / this._analysis_counter) * 60.0;
      this.is_lt_flow = (this._cum_is_lt_flow / this._analysis_counter) * 60.0;
      this.lt_ld_flow = (this._cum_lt_ld_flow / this._analysis_counter) * 60.0;
      this.ld_svc_flow =
        (this._cum_ld_svc_flow / this._analysis_counter) * 60.0;

      this._cum_is_flow = 0.0;
      this._cum_is_lt_flow = 0.0;
      this._cum_lt_ld_flow = 0.0;
      this._cum_ld_svc_flow = 0.0;

      this._analysis_counter = 0.0;
    }
    this.starlings.forEach((cap) => {
      this._cum_is_flow += this._model_engine.models[cap].flow * this._t;
    });
    this._cum_is_lt_flow += this._model_engine.models["IS_LT"].flow * this._t;
    this._cum_lt_ld_flow += this._model_engine.models["LT_LD"].flow * this._t;
    this._cum_ld_svc_flow += this._model_engine.models["LD_SVC"].flow * this._t;

    this._analysis_counter += this._t;
  }
}
