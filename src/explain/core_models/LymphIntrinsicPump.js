export class LymphIntrinsicPump {
  static model_type = "LymphIntrinsicPump";
  static model_interface = [];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  scalable = true;
  duration = 2.0; // duration of contraction
  freq = 10.0; // frequency
  el_rest = 20.0; // elastance at rest
  targets = ["LT", "LD"];

  // dependent parameters
  el_con = 0.0; // variable elastance simulating contraction
  el_tot = 0.0; // total elastance
  total_time = 0.0;

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
      let t_start = 1;
      if (this._model_engine.models[target].pacemaker) {
        t_start = 1;
        this._model_engine.models[target].t_start = t_start;
      } else {
        let act = this._model_engine.models[target].activator;
        t_start = this._model_engine.models[act].t_start + 0.5;
        this._model_engine.models[target].t_start = t_start;
      }

      let el_rest = this._model_engine.models[target].el_rest;
      this._model_engine.models[target].contraction_interval = 60 / this.freq;

      if (this.total_time >= t_start) {
        this._model_engine.models[target].interval_running = true;
        // if timer exceeds contraction duration refractory period starts
        if (
          this._model_engine.models[target].contraction_timer > this.duration
        ) {
          this._model_engine.models[target].contraction_timer = 0.0;
          this._model_engine.models[target].contraction_running = false;
        }

        // if timer exceeds interval, new interval starts
        if (
          this._model_engine.models[target].interval_timer >
          this._model_engine.models[target].contraction_interval
        ) {
          this._model_engine.models[target].interval_timer = 0.0;
          this._model_engine.models[target].contraction_running = true;
        }

        let f = 1.0;
        if (
          this._model_engine.models[target].vol <
          this._model_engine.models[target].u_vol
        ) {
          f = -1.0;
        }
        let amp = this._model_engine.models[target].amp * f;
        let el_con =
          amp *
          (0.5 *
            (1 -
              Math.cos(
                ((2 * Math.PI) / this.duration) *
                  this._model_engine.models[target].contraction_timer
              )));
        // el_con = amp * math.sin(2*math.pi/(2*this.duration) * (this._model.models[targets].contraction_timer))

        this._model_engine.models[target].el_con = el_con;
        let el_tot = el_rest + el_con;
        this._model_engine.models[target].el_base = el_tot;
      }

      // increase the timers
      if (this._model_engine.models[target].interval_running) {
        this._model_engine.models[target].interval_timer += this._t;
      }

      if (this._model_engine.models[target].contraction_running) {
        this._model_engine.models[target].contraction_timer += this._t;
      }
    });
  }
}
