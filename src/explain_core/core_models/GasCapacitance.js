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

  constructor(model_ref, name = "") {
    // Independent properties
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.fixed_composition = false;
    this.analysis_enabled = false;

    // Initialize independent properties
    this.u_vol = this.u_vol_factor = this.u_vol_ans_factor = 1.0;
    this.u_vol_drug_factor = this.u_vol_scaling_factor = 1.0;
    this.el_base = this.el_base_factor = this.el_base_ans_factor = 1.0;
    this.el_base_drug_factor = this.el_base_scaling_factor = 1.0;
    this.el_k = this.el_k_factor = this.el_k_ans_factor = 1.0;
    this.el_k_drug_factor = this.el_k_scaling_factor = 1.0;
    this.pres_ext = this.pres_cc = this.pres_atm = this.pres_mus = 0.0;
    this.act_factor = this.ans_activity_factor = 1.0;
    this.pres_min = this.pres_max = this.pres_mean = 0.0;
    this.pres_min_avg = this.pres_max_avg = this.pres_mean_avg = 0.0;
    this.vol_min = this.vol_max = this.sv = 0.0;

    // Initialize dependent properties
    this.vol = 0.0;
    this.pres = this.pres_in = this.pres_out = this.pres_tm = 0.0;
    this.ctotal =
      this.co2 =
      this.cco2 =
      this.cn2 =
      this.ch2o =
      this.cother =
        0.0;
    this.po2 = this.pco2 = this.pn2 = this.ph2o = this.pother = 0.0;
    this.fo2 = this.fco2 = this.fn2 = this.fh2o = this.fother = 0.0;

    // Local properties
    this._model_engine = model_ref;
    this._is_initialized = false;
    this._t = model_ref.modeling_stepsize;
    this._gas_constant = 62.36367;
    this._temp_min_pres = 1000.0;
    this._temp_max_pres = -1000.0;
    this._temp_min_vol = 1000.0;
    this._temp_max_vol = -1000.0;
    this._temp_cum_pres = 0.0;
    this._analysis_window = 5.0;
    this._analysis_counter = 0.0;

    this._pres_max_avg_queue = [];
    this._pres_max_avg_sum = 0.0;
    this._pres_min_avg_queue = [];
    this._pres_min_avg_sum = 0.0;
    this._pres_mean_avg_queue = [];
    this._pres_mean_avg_sum = 0.0;

    this._vol_max_avg_queue = [];
    this._vol_max_avg_sum = 0.0;
    this._vol_min_avg_queue = [];
    this._vol_min_avg_sum = 0.0;

    this._pres_avg_analysis_windows = 5;
  }

  init_model(args) {
    // set the values of the properties as passed in the arguments
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // Flag that the model is initialized
    this._is_initialized = true;
  }

  // This method is called during every model step by the model engine
  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  // Actual model calculations are done here
  calc_model() {
    // Add heat to the gas
    this.add_heat();

    // Add water vapor to the gas
    this.add_watervapour();

    // Calculate the baseline elastance and unstressed volume
    const _el_base = this.el_base * this.el_base_scaling_factor;
    const _el_k_base = this.el_k * this.el_k_scaling_factor;
    const _u_vol_base = this.u_vol * this.u_vol_scaling_factor;

    // Adjust for factors
    let _el =
      _el_base +
      (this.el_base_factor - 1) * _el_base +
      (this.el_base_ans_factor - 1) * _el_base * this.ans_activity_factor +
      (this.el_base_drug_factor - 1) * _el_base;

    let _el_k =
      _el_k_base +
      (this.el_k_factor - 1) * _el_k_base +
      (this.el_k_ans_factor - 1) * _el_k_base * this.ans_activity_factor +
      (this.el_k_drug_factor - 1) * _el_k_base;

    let _u_vol =
      _u_vol_base +
      (this.u_vol_factor - 1) * _u_vol_base +
      (this.u_vol_ans_factor - 1) * _u_vol_base * this.ans_activity_factor +
      (this.u_vol_drug_factor - 1) * _u_vol_base;

    // Calculate the volume difference
    const vol_diff = this.vol - _u_vol;

    // Make the elastances volume dependent
    _el += _el_k * vol_diff * vol_diff;

    // Calculate pressures
    this.pres_in = _el * vol_diff;
    this.pres_out =
      this.pres_ext + this.pres_cc + this.pres_mus + this.pres_atm;
    this.pres_tm = this.pres_in - this.pres_out;
    this.pres = this.pres_in + this.pres_out;

    // Reset external pressures
    this.pres_ext = this.pres_cc = this.pres_mus = 0.0;

    // Calculate the current gas composition
    this.calc_gas_composition();

    // do the analysis if necessary
    if (this.analysis_enabled) {
      this.analyze();
    }
  }

  volume_in(dvol, comp_from) {
    if (this.fixed_composition) {
      return;
    }

    // Increase the volume
    this.vol += dvol;

    // Change the gas concentrations
    if (this.vol > 0.0) {
      const dco2 = (comp_from.co2 - this.co2) * dvol;
      this.co2 = (this.co2 * this.vol + dco2) / this.vol;

      const dcco2 = (comp_from.cco2 - this.cco2) * dvol;
      this.cco2 = (this.cco2 * this.vol + dcco2) / this.vol;

      const dcn2 = (comp_from.cn2 - this.cn2) * dvol;
      this.cn2 = (this.cn2 * this.vol + dcn2) / this.vol;

      const dch2o = (comp_from.ch2o - this.ch2o) * dvol;
      this.ch2o = (this.ch2o * this.vol + dch2o) / this.vol;

      const dcother = (comp_from.cother - this.cother) * dvol;
      this.cother = (this.cother * this.vol + dcother) / this.vol;

      // Change temperature due to influx of gas
      const dtemp = (comp_from.temp - this.temp) * dvol;
      this.temp = (this.temp * this.vol + dtemp) / this.vol;
    }
  }

  volume_out(dvol) {
    // Do not change the volume if the composition is fixed
    if (this.fixed_composition) {
      return 0.0;
    }

    // Guard against negative volumes
    const vol_not_removed = Math.max(0.0, -this.vol + dvol);
    this.vol = Math.max(0.0, this.vol - dvol);

    return vol_not_removed;
  }

  add_heat() {
    // Calculate a temperature change depending on the target temperature and the current temperature
    const dT = (this.target_temp - this.temp) * 0.0005;
    this.temp += dT;

    // Change the volume as the temperature changes
    if (this.pres !== 0.0 && !this.fixed_composition) {
      // As Ctotal is in mmol/l, we have to convert it as the gas constant is in mol
      const dV = (this.ctotal * this.vol * this._gas_constant * dT) / this.pres;
      this.vol += dV / 1000.0;
    }

    // Guard against negative volumes
    if (this.vol < 0) {
      this.vol = 0;
    }
  }

  add_watervapour() {
    // Calculate water vapor pressure at compliance temperature
    const pH2Ot = this.calc_watervapour_pressure();

    // Do the diffusion from water vapor depending on the tissue water vapor and gas water vapor pressure
    const dH2O = 0.00001 * (pH2Ot - this.ph2o) * this._t;
    if (this.vol > 0.0) {
      this.ch2o = (this.ch2o * this.vol + dH2O) / this.vol;
    }

    // Add water vapor volume to the compliance
    if (this.pres !== 0.0 && !this.fixed_composition) {
      // As dH2O is in mmol/l, we have to convert it as the gas constant is in mol
      this.vol +=
        ((this._gas_constant * (273.15 + this.temp)) / this.pres) *
        (dH2O / 1000.0);
    }
  }

  calc_watervapour_pressure() {
    // Calculate the water vapor pressure in air depending on the temperature
    return Math.exp(20.386 - 5132 / (this.temp + 273));
  }

  calc_gas_composition() {
    // Calculate the concentration in mmol/l using the sum of all concentrations
    this.ctotal = this.ch2o + this.co2 + this.cco2 + this.cn2 + this.cother;

    // Protect against division by zero
    if (this.ctotal === 0.0) {
      return;
    }

    // Calculate the partial pressures
    this.ph2o = (this.ch2o / this.ctotal) * this.pres;
    this.po2 = (this.co2 / this.ctotal) * this.pres;
    this.pco2 = (this.cco2 / this.ctotal) * this.pres;
    this.pn2 = (this.cn2 / this.ctotal) * this.pres;
    this.pother = (this.cother / this.ctotal) * this.pres;

    // Calculate the fractions
    this.fh2o = this.ch2o / this.ctotal;
    this.fo2 = this.co2 / this.ctotal;
    this.fco2 = this.cco2 / this.ctotal;
    this.fn2 = this.cn2 / this.ctotal;
    this.fother = this.cother / this.ctotal;
  }

  analyze() {
    this._temp_max_pres = Math.max(this._temp_max_pres, this.pres_in);
    this._temp_min_pres = Math.min(this._temp_min_pres, this.pres_in);

    this._temp_max_vol = Math.max(this._temp_max_vol, this.vol);
    this._temp_min_vol = Math.min(this._temp_min_vol, this.vol);

    this._temp_cum_pres += this.pres_in;

    this._analysis_counter += 1;

    if (this._analysis_counter > this._analysis_window / this._t) {
      this.pres_max = this._temp_max_pres;
      this.pres_min = this._temp_min_pres;
      this.pres_mean = this._temp_cum_pres / this._analysis_counter;

      this.vol_max = this._temp_max_vol;
      this.vol_min = this._temp_min_vol;
      this.sv = this.vol_max - this.vol_min;

      this._temp_max_pres = -1000.0;
      this._temp_min_pres = 1000.0;
      this._temp_max_vol = -1000.0;
      this._temp_min_vol = 1000.0;
      this._temp_cum_pres = 0.0;
      this._analysis_counter = 0.0;

      // calculate a moving average over a number of heartbeats
      this._pres_max_avg_queue.push(this.pres_max);
      this._pres_min_avg_queue.push(this.pres_min);
      this._pres_mean_avg_queue.push(this.pres_mean);

      this._pres_max_avg_sum += this.pres_max;
      this._pres_min_avg_sum += this.pres_min;
      this._pres_mean_avg_sum += this.pres_mean;

      this._vol_max_avg_queue.push(this.vol_max);
      this._vol_min_avg_queue.push(this.vol_min);

      this._vol_max_avg_sum += this.vol_max;
      this._vol_min_avg_sum += this.vol_min;

      if (this._pres_max_avg_queue.length > this._pres_avg_analysis_windows) {
        this._pres_max_avg_sum -= this._pres_max_avg_queue.shift();
        this._pres_min_avg_sum -= this._pres_min_avg_queue.shift();
        this._pres_mean_avg_sum -= this._pres_mean_avg_queue.shift();

        this._vol_max_avg_sum -= this._vol_max_avg_queue.shift();
        this._vol_min_avg_sum -= this._vol_min_avg_queue.shift();
      }
      this.pres_max_avg =
        this._pres_max_avg_sum / this._pres_max_avg_queue.length;
      this.pres_min_avg =
        this._pres_min_avg_sum / this._pres_max_avg_queue.length;
      this.pres_mean_avg =
        this._pres_mean_avg_sum / this._pres_max_avg_queue.length;

      this.vol_max_avg = this._vol_max_avg_sum / this._vol_max_avg_queue.length;
      this.vol_min_avg = this._vol_min_avg_sum / this._vol_max_avg_queue.length;
    }
  }
}
