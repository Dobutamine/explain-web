export class LymphExtrinsicPump {
  static model_type = "LymphExtrinsicPump";
  static model_interface = [];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  ampEXT = 1.0; // amplitude of contraction
  freq = 10; // frequency, contractions per minute
  duration = 2.0; // duration of contraction
  targets = ["IL"];

  // dependent parameters
  // el_conEXT = 0.0; // variable elastance simulating contraction
  // el_tot = 0.0; // total elastance
  total_time = 0.0;
  pres_contEXT = 0.0

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

    this.targets.forEach((target) => {
  
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
              2*Math.PI/this._model_engine.models[target].duration*(this.total_time + this._model_engine.models[target].phase)))

        this._model_engine.models[target].el_conEXT = el_conEXT;
        // this._model_engine.models[target].el_base += el_conEXT;
  

        let pres_conEXT =
            this._model_engine.models[target].ampEXT/2*(1/this._model_engine.models[target].b-Math.cos(
              2*Math.PI/this._model_engine.models[target].duration*(this.total_time + this._model_engine.models[target].phase)))
        this._model_engine.models[target].pres_conEXT = pres_conEXT;
        this._model_engine.models[target].pres_ext += pres_conEXT;
      })
    };
  }
