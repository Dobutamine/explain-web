export class BloodPump {
  static model_type = "BloodPump";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      default: true,
    },
    {
      target: "fixed_composition",
      caption: "fixed composition",
      type: "boolean",
      default: true,
    },
    {
      target: "pump_rpm",
      caption: "rotations per minute",
      type: "number",
      default: 0.0,
      factor: 1,
      delta: 10,
      rounding: 0,
      ul: 100000000.0,
      ll: -100000000.0,
    },
    {
      target: "vol",
      caption: "volume (l)",
      type: "number",
      default: 0.01,
      factor: 1,
      delta: 0.0001,
      rounding: 4,
      ul: 100000000.0,
      ll: 0.0,
    },
    {
      target: "u_vol",
      caption: "unstressed volume (l)",
      type: "number",
      default: 0,
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
      default: 10000,
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
      default: 1,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 1,
    },
    {
      target: "inlet",
      caption: "inlet compartment",
      type: "list",
      options: ["BloodResistor", "BloodValve"],
    },
    {
      target: "outlet",
      caption: "outlet compartment",
      type: "list",
      options: ["BloodResistor", "BloodValve"],
    },
    {
      target: "connect_pump",
      caption: "pump connectors",
      type: "function",
      optional: false,
      args: [
        {
          target: "inlet",
          type: "list",
          options: ["BloodResistor", "BloodValve"],
        },
        {
          target: "outlet",
          type: "list",
          options: ["BloodResistor", "BloodValve"],
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
  fixed_composition = false;
  u_vol = 0.0;
  el_base = 0.0;
  el_k = 0.0;
  solutes = {};
  aboxy = {};
  drugs = {};

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

  pump_mode = 0; // 0 = centrifugal, 1 = roller pump
  pump_pressure = 0.0;
  pump_rpm = 0.0;
  inlet = "";
  outlet = "";

  // dependent parameters
  vol = 0.0;
  vol_max = 0.0;
  vol_min = 0.0;
  vol_sv = 0.0;
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
  _inlet_res = {};
  _outlet_res = {};

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

  connect_pump(_in, _out) {
    if (typeof _in == "string") {
      this._inlet_res = this._model_engine.models[_in];
    } else {
      this._inlet_res = _in;
    }

    if (typeof _out == "string") {
      this._outlet_res = this._model_engine.models[_out];
    } else {
      this._outlet_res = _out;
    }
  }

  calc_model() {
    // conect the pump
    this.connect_pump(this.inlet, this.outlet);

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

    this.pump_pressure = -this.pump_rpm / 25.0;

    if (this.pump_mode == 0) {
      this._inlet_res.p1_ext = 0.0;
      this._inlet_res.p2_ext = this.pump_pressure;
    } else {
      this._outlet_res.p1_ext = this.pump_pressure;
      this._outlet_res.p2_ext = 0.0;
    }

    // analyze the pressures and volume
    this.analyze();

    // reset the pressure which are recalculated every model iterattion
    this.pres_ext = 0.0;
    this.pres_cc = 0.0;
    this.pres_mus = 0.0;
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

  volume_in(dvol, comp_from) {
    // return if the capacitance is fixed
    if (this.fixed_composition) {
      return;
    }

    // increase the volume
    this.vol += dvol;

    // return id the volume is zero or lower
    if (this.vol <= 0) {
      return;
    }

    // process the solutes, aboxy's (some of them) and drugs
    ["to2", "tco2", "hemoglobin", "albumin"].forEach((solute) => {
      let d_solute = (comp_from.aboxy[solute] - this.aboxy[solute]) * dvol;
      this.aboxy[solute] += d_solute / this.vol;
    });

    for (let [solute, conc] of Object.entries(this.solutes)) {
      let d_solute = (comp_from.solutes[solute] - conc) * dvol;
      conc += d_solute / this.vol;
    }

    for (let [drug, conc] of Object.entries(this.drugs)) {
      let d_drug = (comp_from.drugs[drug] - conc) * dvol;
      conc += d_drug / this.vol;
    }
  }

  volume_out(dvol) {
    // do not change the volume if the composition is fixed
    if (this.fixed_composition) {
      return 0;
    }

    // assume all dvol can be removed
    let vol_not_removed = 0.0;

    // decrease the volume
    this.vol -= dvol;

    // guard against negative volumes
    if (this.vol < 0) {
      // so we need to remove more volume then we have which is not possible. Calculate how much volume can be removed
      // this is an undesirable situation and it means that the modeling stepsize is too large
      vol_not_removed = -this.vol;
      // reset the volume to zero
      this.vol = 0.0;
    }

    // return the amount of volume that could not be removed
    return vol_not_removed;
  }
}
