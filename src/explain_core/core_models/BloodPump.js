export class BloodPump {
  // static properties
  static model_type = "BloodPump";
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
    this.pump_mode = 0;  // 0 = centrifugal, 1 = roller pump
    this.pump_pressure = 0.0;
    this.pump_rpm = 0.0;
    this.inlet = "";
    this.outlet = "";

    // initialize independent properties
    this.u_vol = this.u_vol_factor = this.u_vol_scaling_factor = 1.0;
    this.el_base = this.el_base_factor = this.el_base_scaling_factor = 1.0;
    this.el_k = this.el_k_factor = this.el_k_scaling_factor = 1.0;
    this.pres_ext = this.pres_atm = 0.0;

    // initialize dependent properties
    this.vol = 0.0;
    this.pres = this.pres_in = this.pres_out = this.pres_tm = 0.0;
    this.po2 = this.pco2 = this.ph = this.so2 = 0.0;

    // initialize local properties
    this._model_engine = model_ref;
    this._t = model_ref.modeling_stepsize;
    this._is_initialized = false;
    this._inlet_res = null;
    this._outlet_res = null;
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

  connect_pump(_in, _out) {
    if (typeof _in === "string") {
      this._inlet_res = this._model_engine.models[_in];
    } else {
      this._inlet_res = _in;
    }

    if (typeof _out === "string") {
      this._outlet_res = this._model_engine.models[_out];
    } else {
      this._outlet_res = _out;
    }
  }

  // actual model calculations are done here
  calc_model() {
    // connect the pump if not already connected
    if (!this._inlet_res || !this._outlet_res) {
      this.connect_pump(this.inlet, this.outlet);
    }

    // Calculate the baseline elastance and unstressed volume
    const _el_base = this.el_base * this.el_base_scaling_factor;
    const _el_k_base = this.el_k * this.el_k_scaling_factor;
    const _u_vol_base = this.u_vol * this.u_vol_scaling_factor;

    // Adjust for factors
    let _el = _el_base + (this.el_base_factor - 1) * _el_base;
    let _el_k = _el_k_base + (this.el_k_factor - 1) * _el_k_base;
    let _u_vol = _u_vol_base + (this.u_vol_factor - 1) * _u_vol_base;

    // calculate the volume difference
    const vol_diff = this.vol - _u_vol;

    // make the elastances volume dependent
    _el += _el_k * vol_diff * vol_diff;

    // Calculate pressures
    this.pres_in = _el * vol_diff;
    this.pres_out = this.pres_ext + this.pres_atm;
    this.pres_tm = this.pres_in - this.pres_out;
    this.pres = this.pres_in + this.pres_out;

    // Reset external pressures
    this.pres_ext = 0.0;

    // apply the pump pressures to the connected resistors
    this.pump_pressure = -this.pump_rpm / 25.0;

    if (this.pump_mode === 0) {
      this._inlet_res.p1_ext = 0.0;
      this._inlet_res.p2_ext = this.pump_pressure;
    } else {
      this._outlet_res.p1_ext = this.pump_pressure;
      this._outlet_res.p2_ext = 0.0;
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
}
