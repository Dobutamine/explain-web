export class LymphExtrinsicPump {
  static model_type = "LymphExtrinsicPump";
  static model_interface = [];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  ampEXT = 1.0; // contraction amplitude
  freqEXT = 10; // frequency, contractions per minute
  durEXT = 2.0; // duration of contraction
  targets = ["IL","LT","LD"];

  c = 0.0;

  // dependent parameters
  total_time = 0.0;
  pres_contEXT = 0.0;

  interval_timer = 0.0;
  contraction_timer = 0.0;
  contraction_interval = 0.0;
  interval_running = true;
  contraction_running = true;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;

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

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    this.total_time += this._t;

    // if timer exceeds contraction duration, refractory period starts
    if (
      this.contraction_timer > this._model_engine.models["LT"].durEXT
    ) {
      this.contraction_timer = 0.0;
      this.contraction_running = false;
    }

    // if timer exceeds interval, new interval starts
    let contraction_interval = 60 / this._model_engine.models["LT"].freqEXT
      if (
        this.interval_timer > contraction_interval
      ) {
        this.interval_timer = 0.0;
        this.contraction_running = true;
      }

    this.targets.forEach((target) => {
      let time = this.total_time;
      if (this._model_engine.models[target].name === "LT") {
        time = this.contraction_timer;
      } 

      let pres_conEXT =
        this._model_engine.models[target].ampEXT * 0.5*
        (1/this._model_engine.models[target].b-
        Math.cos(2*Math.PI/this._model_engine.models[target].durEXT*(time))) + this._model_engine.models[target].c
      
      this._model_engine.models[target].pres_conEXT = pres_conEXT;
      this._model_engine.models[target].pres_ext += pres_conEXT;

      let f = 1.0;
      if (
        this._model_engine.models[target].vol <
        this._model_engine.models[target].u_vol
      ) {
        f = -1.0;
      }
      let amp = this._model_engine.models[target].ampEXT * f;
      let el_conEXT =
          amp/2*(3-Math.cos(
            2*Math.PI/this._model_engine.models[target].durEXT*(this.total_time + this._model_engine.models[target].phase))) 

      this._model_engine.models[target].el_conEXT = el_conEXT;
      })

    // increase the timers
    if (this.interval_running) {
      this.interval_timer += this._t;
    }

    if (this.contraction_running) {
      this.contraction_timer += this._t;
    }
    };
  }
