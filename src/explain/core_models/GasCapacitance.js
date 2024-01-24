export class GasCapacitance {
  static class_type = "GasCapacitance";
  static indepent_parameters = [
    { name: "is_enabled", unit: "", type: "boolean", factor: 1.0, rounding: 1 },
    {
      name: "fixed_composition",
      unit: "",
      type: "boolean",
      factor: 1.0,
      rounding: 1,
    },
    { name: "description", unit: "", type: "string", factor: 1.0, rounding: 1 },
    { name: "u_vol", unit: "", type: "number", factor: 1000.0, rounding: 2 },
    {
      name: "u_vol_factor",
      unit: "",
      type: "number",
      factor: 1.0,
      rounding: 1,
    },
    { name: "el_base", unit: "", type: "number", factor: 1.0, rounding: 1 },
    {
      name: "el_base_factor",
      unit: "",
      type: "number",
      factor: 1.0,
      rounding: 1,
    },
    { name: "el_k", unit: "", type: "number", factor: 1.0, rounding: 1 },
    { name: "el_k_factor", unit: "", type: "number", factor: 1.0, rounding: 1 },
  ];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  fixed_composition = true;
  u_vol = 0.0;
  el_base = 0.0;
  el_k = 0.0;

  // dependent parameters
  pres = 0.0;
  vol = 0.0;

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
