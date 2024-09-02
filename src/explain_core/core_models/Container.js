export class Container {
  static model_type = "Container";
  static model_interface = [];

  constructor(model_ref, name = "") {
    // Independent properties
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.contained_components = [];

    // Initialize independent properties
    this.u_vol = this.u_vol_factor = 1.0;
    this.u_vol_drug_factor = this.u_vol_scaling_factor = 1.0;
    this.vol_extra = 0.0;
    this.el_base = this.el_base_factor = 1.0;
    this.el_base_drug_factor = this.el_base_scaling_factor = 1.0;
    this.el_k = this.el_k_factor = 1.0;
    this.el_k_drug_factor = this.el_k_scaling_factor = 1.0;
    this.pres_ext = this.pres_cc = this.pres_atm = this.pres_mus = 0.0;
    this.act_factor = 1.0;
    this.analysis_enabled = false;

    // Dependent properties
    this.vol = this.vol_max = this.vol_min = this.vol_sv = 0.0;
    this.pres = this.pres_in = this.pres_out = this.pres_tm = 0.0;
    this.pres_min = this.pres_max = this.pres_mean = 0.0;
    this.vol_min = this.vol_max = this.sv = 0.0;

    // Local properties
    this._model_engine = model_ref;
    this._is_initialized = false;
    this._t = model_ref.modeling_stepsize;
    this._temp_min_pres = 1000.0;
    this._temp_max_pres = -1000.0;
    this._temp_min_vol = 1000.0;
    this._temp_max_vol = -1000.0;
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
    // Set the starting volume
    this.vol = this.vol_extra;

    // Get the cumulative volume from all contained models
    this.contained_components.forEach((c) => {
      this.vol += this._model_engine.models[c].vol;
    });

    // Calculate the baseline elastance and unstressed volume
    const _el_base = this.el_base * this.el_base_scaling_factor;
    const _el_k_base = this.el_k * this.el_k_scaling_factor;
    const _u_vol_base = this.u_vol * this.u_vol_scaling_factor;

    // Adjust for factors
    let _el =
      _el_base +
      this.act_factor +
      (this.el_base_factor - 1) * _el_base +
      (this.el_base_drug_factor - 1) * _el_base;

    let _el_k =
      _el_k_base +
      (this.el_k_factor - 1) * _el_k_base +
      (this.el_k_drug_factor - 1) * _el_k_base;

    let _u_vol =
      _u_vol_base +
      (this.u_vol_factor - 1) * _u_vol_base +
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
    this.act_factor = 0.0;

    // Transfer the pressures to the models the container contains
    this.contained_components.forEach((c) => {
      this._model_engine.models[c].pres_ext += this.pres;
    });

    // do the analysis if necessary
    if (this.analysis_enabled) {
      this.analyze();
    }
  }

  analyze() {
    this._temp_max_pres = Math.max(this._temp_max_pres, this.pres);
    this._temp_min_pres = Math.min(this._temp_min_pres, this.pres);

    this._temp_max_vol = Math.max(this._temp_max_vol, this.vol);
    this._temp_min_vol = Math.min(this._temp_min_vol, this.vol);

    if (this._model_engine.ncc_ventricular == 1) {
      this.pres_max = this._temp_max_pres;
      this.pres_min = this._temp_min_pres;
      this.pres_mean = (this.pres_min * 2 + this.pres_max) / 3.0;

      this.vol_max = this._temp_max_vol;
      this.vol_min = this._temp_min_vol;
      this.sv = this.vol_max - this.vol_min;

      this._temp_max_pres = -1000.0;
      this._temp_min_pres = 1000.0;
      this._temp_max_vol = -1000.0;
      this._temo_min_vol = 1000.0;
    }
  }
}
