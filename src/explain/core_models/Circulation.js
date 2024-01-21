export class Circulation {
  static class_type = "Circulation";
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  pulmonary_arteries = [];
  pulmonary_veins = [];
  systemic_arteries = [];
  systemic_veins = [];
  svr_targets = [];
  pvr_targets = [];
  ofo_targets = [];
  vsd_targets = [];
  ips_targets = [];
  venpool_targets = [];
  heart_aorta = [];
  heart_inferior_vena_cava = [];
  heart_superior_vena_cava = [];
  heart_pulmonary_artery = [];
  heart_pulmonary_veins = [];

  // dependent parameters

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

  calc_model() {}
}
