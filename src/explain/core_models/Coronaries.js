export class Coronaries {
  static model_type = "Coronaries";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "el_min_cor",
      caption: "minimal elastance (mmHg/l)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 100000000.0,
      ll: 1,
    },
    {
      target: "el_max_cor",
      caption: "maximal elastance (mmHg/l)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 100000000.0,
      ll: 1,
    },
    {
      target: "res_in",
      caption: "input resistance (mmHg/l/s)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 100000000.0,
      ll: 1,
    },
    {
      target: "res_out",
      caption: "output resistance (mmHg/l/s)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 100000000.0,
      ll: 1,
    },
  ];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  coronaries = "COR";
  coronary_artery = "AA_COR";
  coronary_sinus = "COR_RA";
  el_min_cor = 10000;
  el_min_cor_factor = 1.0;
  el_max_cor = 10000;
  el_max_cor_factor = 1.0;

  res_in = 30000;
  res_in_factor = 1.0;
  res_out = 30000;
  res_out_factor = 1.0;

  act_factor = 0.0;

  // dependent parameters

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _cor = {};
  _aa_cor = {};
  _cor_ra = {};

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

    // get a reference to the coronaries
    this._cor = this._model_engine.models[this.coronaries];

    // get a reference to the coronary artery
    this._aa_cor = this._model_engine.models[this.coronary_artery];

    // get a reference to the coronary sinus
    this._cor_ra = this._model_engine.models[this.coronary_sinus];

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    // set coronary circulation properties
    this._cor.el_min = this.el_min_cor * this.el_min_cor_factor;
    this._cor.el_max = this.el_max_cor * this.el_max_cor_factor;
    this._cor.act_factor = this.act_factor;

    this._aa_cor.r_for = this.res_in * this.res_in_factor;
    this._aa_cor.r_back = this.res_in * this.res_in_factor;

    this._cor_ra.r_for = this.res_out * this.res_out_factor;
    this._cor_ra.r_back = this.res_out * this.res_out_factor;
  }
}
