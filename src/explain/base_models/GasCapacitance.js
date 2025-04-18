import { Capacitance } from "./Capacitance";

export class GasCapacitance extends Capacitance {
  // static properties
  static model_type = "GasCapacitance";
  model_interface = [
    {
      caption: "model is enabled",
      target: "is_enabled",
      type: "boolean"
    },
    {
      caption: "unstressed volume (mL)",
      target: "u_vol",
      type: "number",
      factor: 1000.0,
      delta: 0.1,
      rounding: 1,
    },
    {
      caption: "elastance baseline (mmHg/mL)",
      target: "el_base",
      type: "number",
      factor: 0.001,
      delta: 0.1,
      rounding: 1,
    },
    {
      caption: "elastance non linear k",
      target: "el_k",
      type: "number",
      factor: 1,
      delta: 1,
      rounding: 0,
    },
    {
      caption: "unstressed volume factor",
      target: "u_vol_factor",
      type: "factor"
    },
    {
      caption: "elastance baseline factor",
      target: "el_base_factor",
      type: "factor"
    },
    {
      caption: "elastance non linear  factor",
      target: "el_k_factor",
      type: "factor"
    },
  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.pres_atm = 760; // atmospheric pressure (mmHg)
    this.pres_cc = 0.0; // external pressure from chest compressions (mmHg)
    this.pres_mus = 0.0; // external pressure from outside muscles (mmHg)
    this.pres_rel = 0.0; // relative pressure
    this.fixed_composition = false; // flag for fixed gas composition

    // general factors
    this.ans_activity_factor = 1.0;

    // unstressed volume factors
    this.u_vol_resp_factor = 1.0;
    this.u_vol_ans_factor = 1.0;
    this.u_vol_drug_factor = 1.0;

    // elastance factors
    this.el_base_resp_factor = 1.0;
    this.el_base_ans_factor = 1.0;
    this.el_base_drug_factor = 1.0;

    // non-linear elastance factors
    this.el_k_resp_factor = 1.0;
    this.el_k_ans_factor = 1.0;
    this.el_k_drug_factor = 1.0;

    // dependent properties
    this.ctotal = 0.0; // total gas molecule concentration (mmol/l)
    this.co2 = 0.0; // oxygen concentration (mmol/l)
    this.cco2 = 0.0; // carbon dioxide concentration (mmol/l)
    this.cn2 = 0.0; // nitrogen concentration (mmol/l)
    this.cother = 0.0; // other gases concentration (mmol/l)
    this.ch2o = 0.0; // water vapor concentration (mmol/l)
    this.target_temp = 0.0; // target temperature (dgs C)
    this.humidity = 0.0; // humidity (fraction)
    this.po2 = 0.0; // partial pressure of oxygen (mmHg)
    this.pco2 = 0.0; // partial pressure of carbon dioxide (mmHg)
    this.pn2 = 0.0; // partial pressure of nitrogen (mmHg)
    this.pother = 0.0; // partial pressure of other gases (mmHg)
    this.ph2o = 0.0; // partial pressure of water vapor (mmHg)
    this.fo2 = 0.0; // fraction of oxygen of total gas volume
    this.fco2 = 0.0; // fraction of carbon dioxide of total gas volume
    this.fn2 = 0.0; // fraction of nitrogen of total gas volume
    this.fother = 0.0; // fraction of other gases of total gas volume
    this.fh2o = 0.0; // fraction of water vapor of total gas volume
    this.temp = 0.0; // gas temperature (dgs C)

    // local properties
    this._gas_constant = 62.36367; // ideal gas law constant (L·mmHg/(mol·K))
  }

  calc_model() {
    // Add heat to the gas
    this.add_heat();

    // Add water vapor to the gas
    this.add_watervapour();

    this.calc_elastances();

    this.calc_volumes();
    
    this.calc_pressure();

    // calculate the new gas composition
    this.calc_gas_composition();
  }

  calc_elastances() {
    this._el = this.el_base +
      (this.el_base_factor - 1) * this.el_base +
      (this.el_base_resp_factor - 1) * this.el_base +
      (this.el_base_ans_factor - 1) * this.el_base * this.ans_activity_factor +
      (this.el_base_drug_factor - 1) * this.el_base;

    this._el_k = this.el_k +
      (this.el_k_factor - 1) * this.el_k +
      (this.el_k_resp_factor - 1) * this.el_k +
      (this.el_k_ans_factor - 1) * this.el_k * this.ans_activity_factor +
      (this.el_k_drug_factor - 1) * this.el_k;
  
  }

  calc_volumes() {
    this._u_vol = this.u_vol +
      (this.u_vol_factor - 1) * this._u_vol +
      (this.u_vol_resp_factor - 1) * this._u_vol +
      (this.u_vol_ans_factor - 1) * this._u_vol * this.ans_activity_factor +
      (this.u_vol_drug_factor - 1) * this._u_vol;
  }

  calc_pressure() {
    // calculate the current recoil pressure of the capacitance
    this.pres_in = this._el_k * Math.pow(this.vol - this._u_vol, 2) + this._el * (this.vol - this._u_vol);

    // calculate the total pressure
    this.pres = this.pres_in + this.pres_ext + this.pres_cc + this.pres_mus + this.pres_atm;
    this.pres_rel = this.pres - this.pres_atm

    // reset the external pressure
    this.pres_ext = 0.0;
    this.pres_cc = 0.0;
    this.pres_mus = 0.0;
  }


  volume_in(dvol, comp_from) {
    if (this.fixed_composition) return;

    // add volume to the capacitance
    this.vol += dvol;

    if (this.vol > 0.0) {
      this.co2 = (this.co2 * this.vol + (comp_from.co2 - this.co2) * dvol) / this.vol;
      this.cco2 = (this.cco2 * this.vol + (comp_from.cco2 - this.cco2) * dvol) / this.vol;
      this.cn2 = (this.cn2 * this.vol + (comp_from.cn2 - this.cn2) * dvol) / this.vol;
      this.ch2o = (this.ch2o * this.vol + (comp_from.ch2o - this.ch2o) * dvol) / this.vol;
      this.cother = (this.cother * this.vol + (comp_from.cother - this.cother) * dvol) / this.vol;

      // adjust temperature due to gas influx
      this.temp = (this.temp * this.vol + (comp_from.temp - this.temp) * dvol) / this.vol;
    }
  }

  volume_out(dvol) {
    if (this.fixed_composition) return 0.0;

    // remove volume from capacitance
    this.vol -= dvol;

    if (this.vol < 0.0) {
      let _vol_not_removed = -this.vol;
      this.vol = 0.0;
      return _vol_not_removed;
    }

    return 0.0;
  }

  add_heat() {
    let dT = (this.target_temp - this.temp) * 0.0005;
    this.temp += dT;

    if (this.pres !== 0.0 && !this.fixed_composition) {
      let dV = (this.ctotal * this.vol * this._gas_constant * dT) / this.pres;
      this.vol += dV / 1000.0;
    }

    if (this.vol < 0) this.vol = 0;
  }

  add_watervapour() {
    let pH2Ot = this.calc_watervapour_pressure();
    let dH2O = 0.00001 * (pH2Ot - this.ph2o) * this._t;

    if (this.vol > 0.0) {
      this.ch2o = (this.ch2o * this.vol + dH2O) / this.vol;
    }

    if (this.pres !== 0.0 && !this.fixed_composition) {
      this.vol += ((this._gas_constant * (273.15 + this.temp)) / this.pres) * (dH2O / 1000.0);
    }
  }

  calc_watervapour_pressure() {
    return Math.exp(20.386 - 5132 / (this.temp + 273));
  }

  calc_gas_composition() {
    this.ctotal = this.ch2o + this.co2 + this.cco2 + this.cn2 + this.cother;

    if (this.ctotal === 0.0) return;

    this.ph2o = (this.ch2o / this.ctotal) * this.pres;
    this.po2 = (this.co2 / this.ctotal) * this.pres;
    this.pco2 = (this.cco2 / this.ctotal) * this.pres;
    this.pn2 = (this.cn2 / this.ctotal) * this.pres;
    this.pother = (this.cother / this.ctotal) * this.pres;

    this.fh2o = this.ch2o / this.ctotal;
    this.fo2 = this.co2 / this.ctotal;
    this.fco2 = this.cco2 / this.ctotal;
    this.fn2 = this.cn2 / this.ctotal;
    this.fother = this.cother / this.ctotal;
  }
}
