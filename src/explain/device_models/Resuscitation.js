export class Resuscitation {
  static model_type = "Resuscitation";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: true,
    },
    {
      target: "chest_comp_enabled",
      caption: "compressions enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "chest_comp_freq",
      caption: "compressions frequency",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 200,
      ll: 10,
    },
    {
      target: "chest_comp_pres",
      caption: "compressions pressure",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 200,
      ll: 0,
    },
  ];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  compressions = 15.0;
  chest_comp_enabled = true;
  chest_comp_freq = 100.0;
  chest_comp_pres = 10.0;
  chest_comp_time = 1.0;
  chest_comp_targets = {
    THORAX: 0.1,
  };
  ventilations = 2.0;
  vent_freq = 30.0;
  vent_pres = 4.0;
  vent_insp_time = 1.0;
  vent_fio2 = 0.21;
  async_ventilation = false;
  forced_hr = false;

  // dependent parameters
  chest_comp_force = 0.0;
  overriden_hr = 30.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _timer = 0.0;

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
    // y(t) = A sin(2PIft+o)
    // A = amplitude, f = frequency in Hz, t is time, o = phase shift

    this._model_engine.models["Heart"].heart_rate_override = this.forced_hr;
    if (this.forced_hr) {
      this._model_engine.models["Heart"].heart_rate_forced = parseFloat(
        this.overriden_hr
      );
    }

    if (this.chest_comp_enabled) {
      let f = this.chest_comp_freq / 60.0;
      let a = this.chest_comp_pres / 2.0;
      this.chest_comp_force =
        a * Math.sin(2 * Math.PI * f * this._timer - 0.5 * Math.PI) + a;
      this._timer += this._t;

      this._model_engine.models["Heart"].ncc_resus += 1.0;
      if (this._timer > f) {
        this._timer = 0.0;
        this._model_engine.models["Heart"].ncc_resus = 0.0;
      }
    } else {
      this.chest_comp_force = 0.0;
      this._timer = 0.0;
    }

    for (let [comp_target, force] of Object.entries(this.chest_comp_targets)) {
      this._model_engine.models[comp_target].pres_cc = parseFloat(
        this.chest_comp_force * force
      );
    }
  }
}
