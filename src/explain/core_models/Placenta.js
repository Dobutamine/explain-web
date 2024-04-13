export class Placenta {
  static model_type = "Placenta";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: true,
    },
  ];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  pl_circ_enabled = false;

  // dependent parameters

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _umb_art = {};
  _umb_ven = {};
  _plm = {};
  _plf = {};
  _pl_gasex = {};

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

    // UMB_ART, UMB_VEN, PLF, PLM, PL_GASEX
    this._umb_art = this._model_engine.models["UMB_ART"];
    this._umb_ven = this._model_engine.models["UMB_VEN"];
    this._plf = this._model_engine.models["PLF"];
    this._plm = this._model_engine.models["PLM"];
    this._pl_gasex = this._model_engine.models["PL_GASEX"];

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  enable_placenta() {
    this._umb_art.is_enabled = true;
    this._umb_ven.is_enabled = true;
    this._plf.is_enabled = true;
    this._plm.is_enabled = true;
    this._pl_gasex.is_enabled = true;
  }

  calc_model() {}
}
