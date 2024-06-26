export class GasCapacitance {
  static model_type = "GasCapacitance";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "fixed_composition",
      caption: "fixed composition",
      type: "boolean",
      optional: false,
    },
    {
      target: "u_vol",
      caption: "unstressed volume (l)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.0001,
      rounding: 4,
      ul: 100000000.0,
      ll: -10000000.0,
    },
    {
      target: "el_base",
      caption: "baseline elastance (mmHg/l)",
      type: "number",
      optional: false,
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
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
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
  scalable = true;
  fixed_composition = true;
  u_vol = 0.0;
  el_base = 0.0;
  el_k = 0.0;
  target_temp = 37.0;
  humidity = 0.0;

  pres_atm = 760;
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
  pres = 0.0;
  pres_rel = 0.0;
  pres_max = -1000.0;
  pres_min = 1000.0;
  pres_mean = 0.0;
  vol = 0.0;
  vol_max = -1000.0;
  vol_min = 1000.0;
  tidal_volume = 0.0;
  ctotal = 0.0;
  co2 = 0.0;
  cco2 = 0.0;
  cn2 = 0.0;
  ch2o = 0.0;
  cother = 0.0;
  po2 = 0.0;
  pco2 = 0.0;
  pn2 = 0.0;
  ph2o = 0.0;
  pother = 0.0;
  fo2 = 0.0;
  fco2 = 0.0;
  fn2 = 0.0;
  fh2o = 0.0;
  fother = 0.0;
  temp = 0.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _gas_constant = 62.36367;
  _stat_update_interval = 3.0;
  _stat_update_timer = 0.0;

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
    // add heat to the gas
    this.add_heat();

    // add water vapour to the gas
    this.add_watervapour();

    // do the capacitance calculations
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
    this.pres_rel = this.pres - this.pres_atm;

    // analyze the pressures and volume
    this.analyze();

    // reset the pressure which are recalculated every model iterattion
    this.pres_ext = 0.0;
    this.pres_cc = 0.0;
    this.pres_mus = 0.0;

    // calculate the current gas composition
    this.calc_gas_composition();
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
    if (this._stat_update_timer > this._stat_update_interval) {
      this._stat_update_timer = 0.0;
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
    this._stat_update_timer += this._t;
  }

  volume_in(dvol, comp_from) {
    if (this.fixed_composition) {
      return;
    }

    // increase the volume
    this.vol += dvol;

    // change the gas concentrations
    if (this.vol > 0.0) {
      let dco2 = (comp_from.co2 - this.co2) * dvol;
      this.co2 = (this.co2 * this.vol + dco2) / this.vol;

      let dcco2 = (comp_from.cco2 - this.cco2) * dvol;
      this.cco2 = (this.cco2 * this.vol + dcco2) / this.vol;

      let dcn2 = (comp_from.cn2 - this.cn2) * dvol;
      this.cn2 = (this.cn2 * this.vol + dcn2) / this.vol;

      let dch2o = (comp_from.ch2o - this.ch2o) * dvol;
      this.ch2o = (this.ch2o * this.vol + dch2o) / this.vol;

      let dcother = (comp_from.cother - this.cother) * dvol;
      this.cother = (this.cother * this.vol + dcother) / this.vol;

      // change temperature due to influx of gas
      let dtemp = (comp_from.temp - this.temp) * dvol;
      this.temp = (this.temp * this.vol + dtemp) / this.vol;
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

  add_heat() {
    // calculate a temperature change depending on the target temperature and the current temperature
    let dT = (this.target_temp - this.temp) * 0.0005;
    this.temp += dT;

    // change the volume as the temperature changes
    if (this.pres != 0.0 && this.fixed_composition == false) {
      // as Ctotal is in mmol/l we have convert it as the gas constant is in mol
      let dV = (this.ctotal * this.vol * this._gas_constant * dT) / this.pres;
      this.vol += dV / 1000.0;
    }

    // guard against negative volumes
    if (this.vol < 0) {
      this.vol = 0;
    }
  }

  add_watervapour() {
    // Calculate water vapour pressure at compliance temperature
    let pH2Ot = this.calc_watervapour_pressure();

    // do the diffusion from water vapour depending on the tissue water vapour and gas water vapour pressure
    let dH2O = 0.00001 * (pH2Ot - this.ph2o) * this._t;
    if (this.vol > 0.0) {
      this.ch2o = (this.ch2o * this.vol + dH2O) / this.vol;
    }

    // as the water vapour also takevol_totals volume this is added to the compliance
    if (this.pres != 0.0 && this.fixed_composition == false) {
      // as dH2O is in mmol/l we have convert it as the gas constant is in mol
      this.vol +=
        ((this._gas_constant * (273.15 + this.temp)) / this.pres) *
        (dH2O / 1000.0);
    }
  }

  calc_watervapour_pressure() {
    // calculate the water vapour pressure in air depending on the temperature
    return Math.pow(Math.E, 20.386 - 5132 / (this.temp + 273));
  }

  calc_gas_composition() {
    // calculate the concentration in mmol/l using the sum of all concentrations
    this.ctotal = this.ch2o + this.co2 + this.cco2 + this.cn2 + this.cother;

    // protect against division by zero
    if (this.ctotal == 0.0) {
      return;
    }

    // calculate the partial pressures
    this.ph2o = (this.ch2o / this.ctotal) * this.pres;
    this.po2 = (this.co2 / this.ctotal) * this.pres;
    this.pco2 = (this.cco2 / this.ctotal) * this.pres;
    this.pn2 = (this.cn2 / this.ctotal) * this.pres;
    this.pother = (this.cother / this.ctotal) * this.pres;

    // calculate the fractions
    this.fh2o = this.ch2o / this.ctotal;
    this.fo2 = this.co2 / this.ctotal;
    this.fco2 = this.cco2 / this.ctotal;
    this.fn2 = this.cn2 / this.ctotal;
    this.fother = this.cother / this.ctotal;
  }
}
