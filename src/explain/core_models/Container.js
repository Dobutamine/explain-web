export class Container {
  static model_type = "Container";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
    },
    {
      target: "contained_components",
      caption: "contained components",
      type: "multiple-list",
      options: [
        "BloodCapacitance",
        "GasCapacitance",
        "BloodTimeVaryingElastance",
        "Container",
      ],
    },
    {
      target: "u_vol",
      caption: "unstressed volume (l)",
      type: "number",
      factor: 1,
      delta: 0.0001,
      rounding: 4,
      ul: 100000000.0,
      ll: 0.0,
    },
    {
      target: "el_base",
      caption: "baseline elastance (mmHg/l)",
      type: "number",
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 100000000.0,
      ll: 1,
    },
    {
      target: "el_k",
      caption: "non-linear elastance (mmHg/l^2)",
      type: "number",
      factor: 1,
      delta: 0.0001,
      rounding: 4,
      ul: 100000000.0,
      ll: 0,
    },
  ];

  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  fixed_composition = false;
  contained_components = [];
  u_vol = 0.0;
  el_base = 0.0;
  el_k = 0.0;

  pres_ext = 0.0;
  pres_cc = 0.0;
  pres_atm = 0.0;
  pres_mus = 0.0;

  act_factor = 0.0;
  ans_activity_factor = 1.0;

  u_vol_factor = 1.0;
  u_vol_ans_factor = 1.0;
  u_vol_drug_factor = 1.0;
  u_vol_scaling_factor = 1.0;

  el_base_factor = 1.0;
  el_base_ans_factor = 1.0;
  el_base_drug_factor = 1.0;
  el_base_scaling_factor = 1.0;

  el_k_factor = 1.0;
  el_k_ans_factor = 1.0;
  el_k_drug_factor = 1.0;
  el_k_scaling_factor = 1.0;

  // dependent parameters
  vol = 0.0;
  vol_max = 0.0;
  vol_min = 0.0;
  vol_sv = 0.0;
  vol_extra = 0.0;
  pres = 0.0;
  pres_in = 0.0;
  pres_out = 0.0;
  pres_tm = 0.0;
  pres_max = 0.0;
  pres_min = 0.0;
  pres_mean = 0.0;

  // local parameters
  _model_engine = {};
  _heart = {};
  _is_initialized = false;
  _t = 0.0005;
  _temp_pres_max = -1000.0;
  _temp_pres_min = 1000.0;
  _temp_vol_max = -1000.0;
  _temp_vol_min = 1000.0;

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

    // reference to the heart
    this._heart = this._model_engine.models["Heart"];

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
    // set the volume
    this.vol = this.vol_extra / 1000.0;

    // get the current volume from all contained models
    for (const c of this.contained_components) {
      // if (isNaN(this._model_engine.models[c].vol)) {
      //   console.log(this._model_engine.models[c].name);
      // }
      this.vol += this._model_engine.models[c].vol;
    }

    // calculate the baseline elastance depending on the scaling factor
    let _el_base = this.el_base * this.el_base_scaling_factor;

    // adjust the elastance depending on the activity of the external factor, autonomic nervous system and the drug model
    let _el =
      _el_base +
      this.act_factor +
      (this.el_base_factor * _el_base - _el_base) +
      (this.el_base_ans_factor * _el_base - _el_base) *
        this.ans_activity_factor +
      (this.el_base_drug_factor * _el_base - _el_base);

    // calculate the non-linear elastance factor depending on the scaling factor
    let _el_k_base = this.el_k * this.el_k_scaling_factor;

    // adjust the non-linear elastance depending on the activity of the external factor, autonomic nervous system and the drug model
    let _el_k =
      _el_k_base +
      (this.el_k_factor * _el_k_base - _el_k_base) +
      (this.el_k_ans_factor * _el_k_base - _el_k_base) *
        this.ans_activity_factor +
      (this.el_k_drug_factor * _el_k_base - _el_k_base);

    // calculate the unstressed volume depending on the scaling factor
    let _u_vol_base = this.u_vol * this.u_vol_scaling_factor;

    // adjust the unstressed volume depending on the activity of the external factor, autonomic nervous system and the drug model
    let _u_vol =
      _u_vol_base +
      (_u_vol_base * this.u_vol_factor - _u_vol_base) +
      (_u_vol_base * this.u_vol_ans_factor - _u_vol_base) *
        this.ans_activity_factor +
      (_u_vol_base * this.u_vol_drug_factor - _u_vol_base);

    // calculate the recoil pressure depending on the volume, unstressed volume and elastance
    this.pres_in =
      _el * (this.vol - _u_vol) +
      _el_k * Math.pow(this.vol - _u_vol, 2) +
      this.pres_atm;

    // calculate the pressures exerted by the surrounding tissues or other forces
    this.pres_out = this.pres_ext + this.pres_cc + this.pres_mus;

    // calculate the transmural pressure
    this.pres_tm = this.pres_in - this.pres_out;

    // calculate the total pressure
    this.pres = this.pres_in + this.pres_out;

    // analyze the pressures and volume
    this.analyze();

    // reset the pressure which are recalculated every model iterattion
    this.pres_ext = 0.0;
    this.pres_cc = 0.0;
    this.pres_mus = 0.0;
    this.act_factor = 0.0;

    // transfer the pressures to the models the container contains
    for (const c of this.contained_components) {
      this._model_engine.models[c].pres_ext += this.pres;
    }
  }

  analyze() {
    // analyze the pressures
    if (this.pres > this._temp_pres_max) {
      this._temp_pres_max = this.pres;
    }
    if (this.pres < this._temp_vol_min) {
      this._temp_pres_min = this.pres;
    }
    if (this.vol > this._temp_vol_max) {
      this._temp_vol_max = this.vol;
    }
    if (this.vol < this._temp_vol_min) {
      this._temp_vol_min = this.vol;
    }

    // set the max and min pressures
    if (this._heart.ncc_ventricular === 1) {
      this.pres_max = this._temp_pres_max;
      this.pres_min = this._temp_pres_min;
      this.pres_mean = (2.0 * this.pres_min + this.pres_max) / 3.0;
      this.vol_max = this._temp_vol_max;
      this.vol_min = this._temp_vol_min;
      this.vol_sv = this.vol_max - this.vol_min;
      this._temp_pres_max = -1000.0;
      this._temp_pres_min = 1000.0;
      this._temp_vol_max = -1000.0;
      this._temp_vol_min = 1000.0;
    }
  }
}
