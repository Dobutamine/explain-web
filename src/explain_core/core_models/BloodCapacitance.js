export class BloodCapacitance {
  // static properties
  static model_type = "BloodCapacitance";
  static model_interface = [];

  constructor(model_ref, name = "") {
    // initialize independent properties
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.fixed_composition = false;
    this.aboxy = {};
    this.solutes = {};
    this.drugs = {};
    this.analysis_enabled = false;

    // initialize independent properties
    this.u_vol = this.u_vol_factor = this.u_vol_ans_factor = 1.0;
    this.u_vol_drug_factor = this.u_vol_scaling_factor = 1.0;
    this.el_base = this.el_base_factor = this.el_base_ans_factor = 1.0;
    this.el_base_drug_factor = this.el_base_scaling_factor = 1.0;
    this.el_k = this.el_k_factor = this.el_k_ans_factor = 1.0;
    this.el_k_drug_factor = this.el_k_scaling_factor = 1.0;
    this.pres_ext = this.pres_cc = this.pres_atm = this.pres_mus = 0.0;
    this.act_factor = this.ans_activity_factor = 1.0;
    this.pres_min = this.pres_max = this.pres_mean = 0.0;
    this.vol_min = this.vol_max = this.sv = 0.0;

    // initialize dependent properties
    this.vol = this.vol_max = this.vol_min = this.vol_sv = 0.0;
    this.pres = this.pres_in = this.pres_out = this.pres_tm = 0.0;
    this.po2 = this.pco2 = this.ph = this.so2 = 0.0;

    // initialize local properties
    this._model_engine = model_ref;
    this._t = model_ref.modeling_stepsize;
    this._is_initialized = false;
    this._temp_min_pres = 1000.0;
    this._temp_max_pres = -1000.0;
    this._temp_min_vol = 1000.0;
    this._temp_max_vol = -1000.0;
    this._temp_cum_pres = 0.0;
    this._analysis_counter = 0.0;
  }

  init_model(args) {
    // set the values of the properties as passed in the arguments
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // flag that the model is initialized
    this._is_initialized = true;
  }

  // this method is called during every model step by the model engine
  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  // actual model calculations are done here
  calc_model() {
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

    // calculate the volume difference
    const vol_diff = this.vol - _u_vol;

    // make the elastances volume dependent
    _el += _el_k * vol_diff * vol_diff;

    // Calculate pressures
    this.pres_in = _el * vol_diff;
    this.pres_out =
      this.pres_ext + this.pres_cc + this.pres_mus + this.pres_atm;
    this.pres_tm = this.pres_in - this.pres_out;
    this.pres = this.pres_in + this.pres_out;

    // Reset external pressures
    this.pres_ext = this.pres_cc = this.pres_mus = 0.0;

    // do the analysis if necessary
    if (this.analysis_enabled) {
      this.analyze();
    }
  }

  volume_in(dvol, comp_from) {
    // return if the capacitance is fixed
    if (this.fixed_composition) {
      return;
    }

    // increase the volume
    this.vol += dvol;

    // return if the volume is zero or lower
    if (this.vol <= 0.0) {
      return;
    }

    // process the solutes and drugs
    for (let solute in this.solutes) {
      this.solutes[solute] +=
        ((comp_from.solutes[solute] - this.solutes[solute]) * dvol) / this.vol;
    }

    for (let drug in this.drugs) {
      this.drugs[drug] +=
        ((comp_from.drugs[drug] - this.drugs[drug]) * dvol) / this.vol;
    }

    // process the aboxy relevant properties
    const ab_solutes = ["to2", "tco2", "hemoglobin", "albumin"];
    for (let ab_sol of ab_solutes) {
      this.aboxy[ab_sol] +=
        ((comp_from.aboxy[ab_sol] - this.aboxy[ab_sol]) * dvol) / this.vol;
    }
  }

  volume_out(dvol) {
    // do not change the volume if the composition is fixed
    if (this.fixed_composition) {
      return 0.0;
    }

    // guard against negative volumes
    const vol_not_removed = Math.max(0.0, -this.vol + dvol);
    this.vol = Math.max(0.0, this.vol - dvol);

    return vol_not_removed;
  }

  analyze() {
    this._temp_max_pres = Math.max(this._temp_max_pres, this.pres_in);
    this._temp_min_pres = Math.min(this._temp_min_pres, this.pres_in);

    this._temp_max_vol = Math.max(this._temp_max_vol, this.vol);
    this._temp_min_vol = Math.min(this._temp_min_vol, this.vol);

    this._temp_cum_pres += this.pres_in;

    this._analysis_counter += 1;

    if (this._model_engine.ncc_ventricular == 1) {
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
    }
  }
}
