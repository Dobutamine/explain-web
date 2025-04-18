import { BaseModelClass } from "../base_models/BaseModelClass";

export class Coronaries extends BaseModelClass {
  // static properties
  static model_type = "Coronaries";
  static model_interface = [
    {
      caption: "minimal to2 (mmol/l)",
      target: "to2_min",
      type: "number",
      delta: 0.0001,
      factor: 1.0,
      rounding: 4,
    },
    {
      caption: "reference to2 (mmol/l)",
      target: "to2_ref",
      type: "number",
      delta: 0.0001,
      factor: 1.0,
      rounding: 4,
    },
    {
      caption: "basal metabolism reference vo2",
      target: "bm_vo2_ref",
      type: "number",
      delta: 0.0001,
      factor: 1.0,
      rounding: 4,
    },
    {
      caption: "basal metabolism minimal vo2",
      target: "bm_vo2_min",
      type: "number",
      delta: 0.0001,
      factor: 1.0,
      rounding: 4,
    },
    {
      caption: "basal metabolism time constant",
      target: "bm_vo2_tc",
      type: "number",
      delta: 0.0001,
      factor: 1.0,
      rounding: 4,
    },
    {
      caption: "ecc reference",
      target: "ecc_ref",
      type: "number",
      delta: 0.00000001,
      factor: 1.0,
      rounding: 8,
    },
    {
      caption: "pva reference",
      target: "pva_ref",
      type: "number",
      delta: 0.00000001,
      factor: 1.0,
      rounding: 8,
    },
    {
      caption: "pe reference",
      target: "pe_ref",
      type: "number",
      delta: 0.00000001,
      factor: 1.0,
      rounding: 8,
    },
    {
      caption: "heartrate factor min",
      target: "hr_factor_min",
      type: "number",
      delta: 0.01,
      factor: 1.0,
      rounding: 2,
    },
    {
      caption: "heartrate factor max",
      target: "hr_factor_max",
      type: "number",
      delta: 0.01,
      factor: 1.0,
      rounding: 2,
    },
    {
      caption: "heartrate time constant",
      target: "hr_tc",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "contractility factor min",
      target: "cont_factor_min",
      type: "number",
      delta: 0.01,
      factor: 1.0,
      rounding: 2,
    },
    {
      caption: "contractility factor max",
      target: "cont_factor_max",
      type: "number",
      delta: 0.01,
      factor: 1.0,
      rounding: 2,
    },
    {
      caption: "contractility time constant",
      target: "cont_tc",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "ans factor min",
      target: "ans_factor_min",
      type: "number",
      delta: 0.01,
      factor: 1.0,
      rounding: 2,
    },
    {
      caption: "ans factor max",
      target: "ans_factor_max",
      type: "number",
      delta: 0.01,
      factor: 1.0,
      rounding: 2,
    },
    {
      caption: "ans time constant",
      target: "ans_tc",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
  ];

  /**
   * The myocardial oxygen balance (Mob) class models the dynamic oxygen use and carbon dioxide production (metabolism) of the heart
   * and models the effect on the heart (heartrate and contractility).
   */
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // Independent properties
    this.mob_active = true;
    this.to2_min = 0.0002;
    this.to2_ref = 0.2;
    this.resp_q = 0.1;
    this.bm_vo2_ref = 0.0007;
    this.bm_vo2_min = 0.00035;
    this.bm_vo2_tc = 5;
    this.bm_g = 0.0;
    this.ecc_ref = 0.00000301;
    this.pva_ref = 0.00143245;
    this.pe_ref = 0;
    this.hr_factor = 1;
    this.hr_factor_max = 1;
    this.hr_factor_min = 0.01;
    this.hr_tc = 5;
    this.cont_factor = 1;
    this.cont_factor_max = 1;
    this.cont_factor_min = 0.01;
    this.cont_tc = 5;
    this.act_factor = 1;
    this.ans_factor = 1;
    this.ans_factor_max = 1;
    this.ans_factor_min = 0.01;
    this.ans_tc = 5;
    this.ans_activity_factor = 1;

    // Dependent properties
    this.hw = 0.0;
    this.mob_vo2 = 0.0;
    this.bm_vo2 = 0.0;
    this.ecc_vo2 = 0.0;
    this.pe_vo2 = 0.0;
    this.pva_vo2 = 0.0;
    this.pva = 0.0;
    this.stroke_work_lv = 0.0;
    this.stroke_work_rv = 0.0;

    // Local properties and intermediates
    this._cor = null;
    this._aa_cor = null;
    this._heart = null;
    this._lv = null;
    this._rv = null;
    this._a_to2 = 0.0;
    this._d_bm_vo2 = 0.0;
    this._d_hr = 0.0;
    this._d_cont = 0.0;
    this._d_ans = 0.0;
    this._ml_to_mmol = 22.414;
    this._cc_time = 0.0;
    this._prev_lv_vol = 0.0;
    this._prev_lv_pres = 0.0;
    this._prev_rv_vol = 0.0;
    this._prev_rv_pres = 0.0;
    this._pv_area_lv = 0.0;
    this._pv_area_rv = 0.0;
    this._pv_area_lv_inc = 0.0;
    this._pv_area_rv_inc = 0.0;
    this._pv_area_lv_dec = 0.0;
    this._pv_area_rv_dec = 0.0;
  }

  calc_model() {
    if (!this.mob_active) return;

    // Set the heart weight
    this.hw = 7.799 + 0.004296 * this._model_engine.weight * 1000.0;

    // Gain determination
    this.bm_g = (this.bm_vo2_ref * this.hw - this.bm_vo2_min * this.hw) / (this.to2_ref - this.to2_min);
    this.hr_g = (this.hr_factor_max - this.hr_factor_min) / (this.to2_ref - this.to2_min);
    this.cont_g = (this.cont_factor_max - this.cont_factor_min) / (this.to2_ref - this.to2_min);
    this.ans_g = (this.ans_factor_max - this.ans_factor_min) / (this.to2_ref - this.to2_min);

    // Store references to the models the Mob model needs
    this._aa = this._model_engine.models["AA"];
    this._aa_cor = this._model_engine.models["AA_COR"];
    this._cor = this._model_engine.models["COR"];
    this._heart = this._model_engine.models["Heart"];
    this._lv = this._model_engine.models["LV"];
    this._rv = this._model_engine.models["RV"];
    
    // Get necessary model properties
    const to2_cor = this._cor.to2;
    const tco2_cor = this._cor.tco2;
    const vol_cor = this._cor.vol;
    this._cc_time = this._heart.cardiac_cycle_time;

    // Activation function for baseline to2
    this._a_to2 = this.activation_function(
      to2_cor,
      this.to2_ref,
      this.to2_ref,
      this.to2_min
    );

    // Hypoxia effects and time constants
    this._d_bm_vo2 =
      this._t * ((1 / this.bm_vo2_tc) * (-this._d_bm_vo2 + this._a_to2)) +
      this._d_bm_vo2;
    this._d_hr =
      this._t * ((1 / this.hr_tc) * (-this._d_hr + this._a_to2)) + this._d_hr;
    this._d_cont =
      this._t * ((1 / this.cont_tc) * (-this._d_cont + this._a_to2)) +
      this._d_cont;
    this._d_ans =
      this._t * ((1 / this.ans_tc) * (-this._d_ans + this._a_to2)) +
      this._d_ans;

    // Basal metabolism
    this.bm_vo2 = this.calc_bm();

    // Hypoxia effects on heartrate, contractility, and ANS
    this.calc_hypoxia_effects();

    // Energy costs
    this.ecc_vo2 = this.calc_ecc();
    this.pva_vo2 = this.calc_pva();
    this.pe_vo2 = this.calc_pe();

    // Total myocardial vo2
    this.mob_vo2 = this.bm_vo2 + this.ecc_vo2 + this.pva_vo2 + this.pe_vo2;

    // Model step calculations
    const bm_vo2_step = this.bm_vo2 * this._t;
    let ecc_vo2_step = 0.0;
    let pva_vo2_step = 0.0;
    let pe_vo2_step = 0.0;

    if (this._cc_time > 0.0 && this._heart.cardiac_cycle_running) {
      ecc_vo2_step = (this.ecc_vo2 / this._cc_time) * this._t;
      pva_vo2_step = (this.pva_vo2 / this._cc_time) * this._t;
      pe_vo2_step = (this.pe_vo2 / this._cc_time) * this._t;
    }

    // Total vo2 and co2 production
    this.mvo2_step = bm_vo2_step + ecc_vo2_step + pva_vo2_step + pe_vo2_step;
    const co2_production = this.mvo2_step * this.resp_q;

    // Myocardial oxygen balance
    const o2_inflow = this._aa_cor.flow * this._aa.to2;
    const o2_use = this.mvo2_step / this._t;
    this.mob = o2_inflow - o2_use + to2_cor;

    // New blood composition of coronary blood
    if (vol_cor > 0) {
      const new_to2_cor = (to2_cor * vol_cor - this.mvo2_step) / vol_cor;
      const new_tco2_cor = (tco2_cor * vol_cor + co2_production) / vol_cor;
      if (new_to2_cor >= 0) {
        this._cor.to2 = new_to2_cor;
        this._cor.tco2 = new_tco2_cor;
      }
    }
  }

  calc_bm() {
    let bm_vo2 = this.bm_vo2_ref * this.hw + this._d_bm_vo2 * this.bm_g;
    if (bm_vo2 < this.bm_vo2_min * this.hw) {
      bm_vo2 = this.bm_vo2_min * this.hw;
    }
    return bm_vo2 / this._ml_to_mmol;
  }

  calc_ecc() {
    this.ecc_lv = this._lv.el_max;
    this.ecc_rv = this._rv.el_max;
    this.ecc = (this.ecc_lv + this.ecc_rv) / 1000.0;
    return (this.ecc * this.ecc_ref * this.hw) / this._ml_to_mmol;
  }

  calc_pe() {
    this.pe = 0;
    return (this.pe * this.pe_ref * this.hw) / this._ml_to_mmol;
  }

  calc_pva() {
    if (
      this._heart.cardiac_cycle_running &&
      !this._heart._prev_cardiac_cycle_running
    ) {
      this.stroke_work_lv = this._pv_area_lv_dec - this._pv_area_lv_inc;
      this.stroke_work_rv = this._pv_area_rv_dec - this._pv_area_rv_inc;
      this._pv_area_lv_inc = 0.0;
      this._pv_area_rv_inc = 0.0;
      this._pv_area_lv_dec = 0.0;
      this._pv_area_rv_dec = 0.0;
    }

    const _dV_lv = this._lv.vol - this._prev_lv_vol;
    if (_dV_lv > 0) {
      this._pv_area_lv_inc +=
        _dV_lv * this._prev_lv_pres +
        (_dV_lv * (this._lv.pres - this._prev_lv_pres)) / 2.0;
    } else {
      this._pv_area_lv_dec +=
        -_dV_lv * this._prev_lv_pres +
        (-_dV_lv * (this._lv.pres - this._prev_lv_pres)) / 2.0;
    }

    const _dV_rv = this._rv.vol - this._prev_rv_vol;
    if (_dV_rv > 0) {
      this._pv_area_rv_inc +=
        _dV_rv * this._prev_rv_pres +
        (_dV_rv * (this._rv.pres - this._prev_rv_pres)) / 2.0;
    } else {
      this._pv_area_rv_dec +=
        -_dV_rv * this._prev_rv_pres +
        (-_dV_rv * (this._rv.pres - this._prev_rv_pres)) / 2.0;
    }

    this._prev_lv_vol = this._lv.vol;
    this._prev_lv_pres = this._lv.pres;
    this._prev_rv_vol = this._rv.vol;
    this._prev_rv_pres = this._rv.pres;

    this.pva = this.stroke_work_lv + this.stroke_work_rv;
    return (this.pva * this.pva_ref * this.hw) / this._ml_to_mmol;
  }

  calc_hypoxia_effects() {
    this.ans_activity_factor = 1.0 + this.ans_g * this._d_ans;
    this._heart.ans_activity_factor = this.ans_activity_factor;

    this.hr_factor = 1.0 + this.hr_g * this._d_hr;
    this._heart.hr_mob_factor = this.hr_factor;

    this.cont_factor = 1.0 + this.cont_g * this._d_cont;
    this._heart._lv.el_max_mob_factor = this.cont_factor;
    this._heart._rv.el_max_mob_factor = this.cont_factor;
    this._heart._la.el_max_mob_factor = this.cont_factor;
    this._heart._ra.el_max_mob_factor = this.cont_factor;
  }

  activation_function(value, max, setpoint, min) {
    let activation = 0.0;

    if (value >= max) {
      activation = max - setpoint;
    } else if (value <= min) {
      activation = min - setpoint;
    } else {
      activation = value - setpoint;
    }

    return activation;
  }
}
