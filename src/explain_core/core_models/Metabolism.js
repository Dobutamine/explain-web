export class Metabolism {
  static model_type = "Metabolism";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "vo2",
      caption: "vo2 (mmol/s)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 300000.0,
      ll: 0.0,
    },
    {
      target: "resp_q",
      caption: "respiratory quotient",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 10.0,
      ll: 0.001,
    },
    {
      target: "set_body_temp",
      caption: "body temperature (°C)",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "body_temp",
          caption: "new temperature (°C)",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 43.0,
          ll: 20.0,
        },
      ],
    },
  ];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  vo2 = 0.0;
  vo2_factor = 1.0;
  vo2_scaling_factor = 1.0;
  resp_q = 0.6;
  resp_q_scaling_factor = 1.0;
  body_temp = 37;
  metabolic_active_models = {};

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

  set_body_temp(new_temp) {
    this.body_temp = new_temp;
    Object.values(this._model_engine.models).forEach((model) => {
      if (
        model.model_type === "BloodCompartment" ||
        model.model_type === "BloodTimeVaryingElastance"
      ) {
        model.temp = new_temp;
      }
    });
  }

  calc_model() {
    // translate the VO2 in ml/kg/min to VO2 in mmol for this stepsize (assumption is 37 degrees and atmospheric pressure)
    let vo2_step =
      ((0.039 *
        this.vo2 *
        this.vo2_factor *
        this.vo2_scaling_factor *
        this._model_engine.weight) /
        60.0) *
      this._t;

    for (let [model, fvo2] of Object.entries(this.metabolic_active_models)) {
      // get the vol, tco2 and to2 from the blood compartment
      let vol = this._model_engine.models[model].vol;
      let to2 = this._model_engine.models[model].aboxy["to2"];
      let tco2 = this._model_engine.models[model].aboxy["tco2"];

      // calculate the change in oxygen concentration in this step
      let dto2 = vo2_step * fvo2;

      // calculate the new oxygen concentration in blood
      let new_to2 = (to2 * vol - dto2) / vol;

      // guard against negative values
      if (new_to2 < 0) {
        new_to2 = 0;
      }

      // calculate the change in co2 concentration in this step
      let dtco2 = vo2_step * fvo2 * this.resp_q * this.resp_q_scaling_factor;

      // calculate the new co2 concentration in blood
      let new_tco2 = (tco2 * vol + dtco2) / vol;
      // guard against negative values
      if (new_tco2 < 0) {
        new_tco2 = 0;
      }

      // store the new to2 and tco2
      this._model_engine.models[model].aboxy.to2 = new_to2;
      this._model_engine.models[model].aboxy.tco2 = new_tco2;
    }
  }
}
