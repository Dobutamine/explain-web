import { set_blood_composition } from "../helpers/BloodComposition";

export class Mob {
  static model_type = "Mob";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: true,
    },
    {
      target: "po2_min",
      caption: "po2 minimum (mmhg)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 1000.0,
      ll: 0.0,
    },
    {
      target: "po2_set",
      caption: "po2 setpoint (mmhg)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 1000.0,
      ll: 0.0,
    },
    {
      target: "po2_max",
      caption: "po2 maximum (mmhg)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 1000.0,
      ll: 0.0,
    },
    {
      target: "bm_vo2_ref",
      caption: "basal vo2 reference (mmol/s)",
      type: "number",
      optional: false,
      factor: 1000,
      delta: 0.0001,
      rounding: 4,
      ul: 300.0,
      ll: 0.0,
    },
    {
      target: "bm_vo2_min",
      caption: "basal vo2 minimum (mmol/s)",
      type: "number",
      optional: false,
      factor: 1000,
      delta: 0.0001,
      rounding: 4,
      ul: 300.0,
      ll: 0.0,
    },
    {
      target: "bm_vo2_max",
      caption: "basal vo2 maximum (mmol/s)",
      type: "number",
      optional: false,
      factor: 1000,
      delta: 0.0001,
      rounding: 4,
      ul: 300.0,
      ll: 0.0,
    },
    {
      target: "bm_tc",
      caption: "basal vo2 time constant (s)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 3000.0,
      ll: 0.0,
    },
    {
      target: "ecc_c",
      caption: "ecc_c",
      type: "number",
      optional: false,
      factor: 1000,
      delta: 0.0001,
      rounding: 4,
      ul: 300.0,
      ll: 0.0,
    },
    {
      target: "pva_c",
      caption: "pva_c",
      type: "number",
      optional: false,
      factor: 1000,
      delta: 0.0001,
      rounding: 4,
      ul: 300.0,
      ll: 0.0,
    },
    {
      target: "hr_factor_max",
      caption: "hr_factor_max",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 3000.0,
      ll: 0.0,
    },
    {
      target: "hr_factor_min",
      caption: "hr_factor_min",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 3000.0,
      ll: 0.0,
    },
    {
      target: "hr_tc",
      caption: "hr factor time constant (sec)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 3000.0,
      ll: 0.0,
    },
    {
      target: "cont_factor_max",
      caption: "contractility factor maximum",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 3000.0,
      ll: 0.0,
    },
    {
      target: "cont_factor_min",
      caption: "contractility factor minimum",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 3000.0,
      ll: 0.0,
    },
    {
      target: "cont_tc",
      caption: "contractility factor time constant (sec)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 3000.0,
      ll: 0.0,
    },
    {
      target: "ans_factor_max",
      caption: "ans factor maximum",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 3000.0,
      ll: 0.0,
    },
    {
      target: "ans_factor_min",
      caption: "ans factor minimum",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 3000.0,
      ll: 0.0,
    },
    {
      target: "ans_tc",
      caption: "ans time constant (sec)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 3000.0,
      ll: 0.0,
    },
  ];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  mob_active = true;

  heart_model = "Heart";
  aa_model = "AA";
  aa_cor_model = "AA_COR";
  cor_model = "COR";

  ecc_c = 0.0;
  pva_c = 8.730000000000001e-5;
  po2_min = 0.05;
  po2_set = 10.0;
  po2_max = 10.0;

  bm_vo2_ref = 7.154999999999999e-5;
  bm_vo2_max = 7.154999999999999e-5;
  bm_vo2_min = 1.431e-5;

  vo2_factor = 0.45;
  bm_po2_tc = 5.0;
  bm_tc = 5.0;
  resp_q = 0.7;

  hr_factor = 1.0;
  hr_factor_max = 1.0;
  hr_factor_min = 0.01;
  hr_tc = 5.0;

  cont_factor = 1.0;
  cont_factor_max = 1.0;
  cont_factor_min = 0.01;
  cont_tc = 5.0;

  ans_factor = 1.0;
  ans_factor_max = 1.0;
  ans_factor_min = 0.01;
  ans_tc = 5.0;
  ans_activity_factor = 1.0;

  // dependent parameters
  mob = 0.0;
  mvo2 = 0.0;
  mvo2_step = 0.0;
  bm_vo2 = 0.0;
  ecc_vo2 = 0.0;
  pva_vo2 = 0.0;
  bm_g = 2.0;
  cont_g = 0.0;
  hr_g = 0.0;
  ans_g = 0.0;

  ecc_lv = 0.0; // pres_ms of the heart chamber
  ecc_rv = 0.0;
  ecc = 0.0;
  pva = 0.0; // total pva of both ventricles
  stroke_work_lv = 0.0; // stroke work of left ventricle
  stroke_work_rv = 0.0; // stroke work of right ventricle
  stroke_volume_lv = 0.0; // stroke volume in liters
  stroke_volume_rv = 0.0; // stroke volume in liters
  sv_lv_kg = 0.0;
  sv_rv_kg = 0.0;
  cor_po2 = 0.0;
  cor_pco2 = 0.0;
  cor_so2 = 0.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _heart = {};
  _aa = {};
  _aa_cor = {};
  _cor = {};

  _prev_lv_vol = 0.0;
  _prev_lv_pres = 0.0;
  _prev_rv_vol = 0.0;
  _prev_rv_pres = 0.0;

  _pv_area_lv = 0.0;
  _pv_area_rv = 0.0;
  _pv_area_lv_inc = 0.0;
  _pv_area_rv_inc = 0.0;
  _pv_area_lv_dec = 0.0;
  _pv_area_rv_dec = 0.0;
  _sv_lv_cum = 0.0;
  _sv_rv_cum = 0.0;

  _a_po2 = 0.0;
  _d_bm_vo2 = 0.0;
  _d_cont = 0.0;
  _d_hr = 0.0;
  _d_ans = 0.0;
  _ml_to_mmol = 22.414;

  test = 0;

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

    // get a reference to the heart
    this._heart = this._model_engine.models[this.heart_model];
    this._aa = this._model_engine.models[this.aa_model];
    this._aa_cor = this._model_engine.models[this.aa_cor_model];
    this._cor = this._model_engine.models[this.cor_model];

    // set the heart weight
    this.hw = 7.799 + 0.004296 * this._model_engine.weight * 1000.0; // = 21.9 grams for a 3 kg baby
    this.bm_vo2_ref = this.bm_vo2_ref * this.vo2_factor;
    this.bm_vo2_max = this.bm_vo2_max * this.vo2_factor;
    this.bm_vo2_min = this.bm_vo2_min * this.vo2_factor;
    this.pva_c = this.pva_c * this.vo2_factor;
    this.ecc_c = this.ecc_c * this.vo2_factor;

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized && this.mob_active) {
      this.calc_model();
    }
  }

  calc_model() {
    // set the heart weight -> at 3.545 ths is 23 grams
    this.hw = 7.799 + 0.004296 * this._model_engine.weight * 1000.0;

    // desried myocardial flow = 1.8 ml/min/gm tissue => 41.4 ml/min = 0.0414 l/min = 0.00069 l/s = 11,6 ml/kg/min

    // inflow of oxygen
    let to2_in = this._aa.aboxy["to2"] * this._aa_cor.flow; // mmol o2 per second

    // get the ecc from the heart chambers
    this.ecc_lv = this._heart._lv.el_max * this._heart._lv.el_max_factor;
    this.ecc_rv = this._heart._rv.el_max * this._heart._rv.el_max_factor;
    this.ecc = (this.ecc_lv + this.ecc_rv) / 1000.0;

    // calculate the pressure volume loop area which is the total stroke work of the heart
    this.pva = this.calc_pva();

    // calculate the blood composition of the coronary blood capacity every heart cycle
    if (this._heart.ncc_ventricular == 1) {
      set_blood_composition(this._cor);
    }

    // calculate the oxygen metabolism in mmol O2 / cardiac cycle
    this.mvo2 = this.oxygen_metabolism();

    // this total vo2 is in 1 cardiac cycle, we now have to calculate the vo2 in this model step
    let hc_duration = 60.0 / this._heart.heart_rate;
    this.mvo2_step = (this.mvo2 / hc_duration) * this._t;
    let co2_production = this.mvo2_step * this.resp_q;

    // get the necessary model properties from the coronaries
    let to2_cor = this._cor.aboxy.to2;
    let tco2_cor = this._cor.aboxy.tco2;
    let vol_cor = this._cor.vol;

    // // calculate the myocardial oxygen balance in mmol / cardiac cycle
    let o2_inflow = this._aa_cor.flow * this._aa.aboxy.to2; // in mmol/s
    let o2_use = this.mvo2 / hc_duration; // in mmol/s
    this.mob = o2_inflow - o2_use + to2_cor;

    if (vol_cor > 0) {
      let new_to2_cor = (to2_cor * vol_cor - this.mvo2_step) / vol_cor;
      let new_tco2_cor = (tco2_cor * vol_cor + co2_production) / vol_cor;
      if (new_to2_cor >= 0) {
        this._cor.aboxy.to2 = new_to2_cor;
        this._cor.aboxy.tco2 = new_tco2_cor;
      }
    }

    this.cor_po2 = this._cor.aboxy.po2;
    this.cor_pco2 = this._cor.aboxy.pco2;
    this.cor_so2 = this._cor.aboxy.so2;
  }

  oxygen_metabolism() {
    // get the po2 in mmHg from coronaries
    let po2_cor = this._cor.aboxy.po2;

    // calculate the activation function of the baseline vo2, which is zero when the po2 is above 10.0
    this._a_po2 = this.activation_function(
      po2_cor,
      this.po2_max,
      this.po2_set,
      this.po2_min
    );

    // calculate the gain depending on the reference and minimal baseline vo2 and po2 threshold from where the baseline vo2 is reduced
    // this gain determines how much the baseline vo2 is reduced when the po2 drops below the threshold
    this.bm_g =
      (this.bm_vo2_max * this.hw - this.bm_vo2_min * this.hw) /
      (this.po2_max - this.po2_min);
    this.cont_g =
      (this.cont_factor_max - this.cont_factor_min) /
      (this.po2_max - this.po2_min);
    this.hr_g =
      (this.hr_factor_max - this.hr_factor_min) / (this.po2_max - this.po2_min);
    this.ans_g =
      (this.ans_factor_max - this.ans_factor_min) /
      (this.po2_max - this.po2_min);

    // incorporate the time constants
    this._d_bm_vo2 =
      this._t * ((1 / this.bm_tc) * (-this._d_bm_vo2 + this._a_po2)) +
      this._d_bm_vo2;
    this._d_hr =
      this._t * ((1 / this.hr_tc) * (-this._d_hr + this._a_po2)) + this._d_hr;
    this._d_cont =
      this._t * ((1 / this.cont_tc) * (-this._d_cont + this._a_po2)) +
      this._d_cont;
    this._d_ans =
      this._t * ((1 / this.ans_tc) * (-this._d_ans + this._a_po2)) +
      this._d_ans;

    // calculate the baseline vo2 in mmol O2 /  cardiac cycle
    this.bm_vo2 =
      (this.bm_vo2_ref * this.hw + this._d_bm_vo2 * this.bm_g) /
      this._ml_to_mmol; // is about 20% in steady state

    // when hypoxia gets severe the ANS influence gets inhibited and the heartrate, contractility and baseline metabolism are decreased
    // calculate the new ans activity (1.0 is max activity and 0.0 is min activity) which controls the ans activity
    this.ans_activity_factor = 1.0 + this.ans_g * this._d_ans;
    this._heart.ans_activity_factor = this.ans_activity_factor;

    // calculate the mob factor which controls the heart rate
    this.hr_factor = 1.0 + this.hr_g * this._d_hr;
    this._heart.hr_mob_factor = this.hr_factor;

    // calculate the mob factor which controls the contractility of the heart
    this.cont_factor = 1.0 + this.cont_g * this._d_cont;
    this._heart._lv.el_max_ans_factor = this.cont_factor;
    this._heart._rv.el_max_ans_factor = this.cont_factor;
    this._heart._la.el_max_ans_factor = this.cont_factor;
    this._heart._ra.el_max_ans_factor = this.cont_factor;

    // calculate the ecc vo2 -> not implemented yet but included in baseline metabolism
    this.ecc_vo2 = (this.ecc * this.ecc_c * this.hw) / this._ml_to_mmol; // is about 15% in steady state

    // calculate the pva vo2 in mmol O2 / cardiac cycle
    this.pva_vo2 = (this.pva * this.pva_c * this.hw) / this._ml_to_mmol;

    // return the total vo2 in mmol O2 / carciac cycle
    return this.bm_vo2 + this.pva_vo2 + this.ecc_vo2;
  }

  calc_pe() {}

  calc_pva() {
    // detect the start of the cardiac cycle and calculate the area of the pv loop of the last cardiac cycle
    if (this._heart.ncc_ventricular == 1) {
      // calculate the stroke work of the ventricles
      this.stroke_work_lv = this._pv_area_lv_dec - this._pv_area_lv_inc; // in l * mmHg/cardiac cycle
      this.stroke_work_rv = this._pv_area_rv_dec - this._pv_area_rv_inc; // in l * mmHg/cardiac cycle

      // calculate the stroke volume of the ventricles
      this.stroke_volume_lv = this._sv_lv_cum; // in l/cardiac cycle
      this.stroke_volume_rv = this._sv_rv_cum; // in l/cardiac cycle
      this.sv_lv_kg =
        (this.stroke_volume_lv * 1000.0) / this._model_engine.weight;
      this.sv_rv_kg =
        (this.stroke_volume_rv * 1000.0) / this._model_engine.weight;

      // reset the counters
      this._pv_area_lv_inc = 0.0;
      this._pv_area_rv_inc = 0.0;
      this._pv_area_lv_dec = 0.0;
      this._pv_area_rv_dec = 0.0;
      this._sv_lv_cum = 0.0;
      this._sv_rv_cum = 0.0;
    }

    // calculate the pv area of this model step
    let _dV_lv = this._heart._lv.vol - this._prev_lv_vol;
    // if the volume is increasing count the stroke volume
    if (_dV_lv > 0) {
      this._sv_lv_cum += _dV_lv;
      this._pv_area_lv_inc +=
        _dV_lv * this._prev_lv_pres +
        (_dV_lv * (this._heart._lv.pres - this._prev_lv_pres)) / 2.0;
    } else {
      this._pv_area_lv_dec +=
        -_dV_lv * this._prev_lv_pres +
        (-_dV_lv * (this._heart._lv.pres - this._prev_lv_pres)) / 2.0;
    }

    let _dV_rv = this._heart._rv.vol - this._prev_rv_vol;
    // if the volume is increasing count the stroke volume
    if (_dV_rv > 0) {
      this._sv_rv_cum += _dV_rv;
      this._pv_area_rv_inc +=
        _dV_rv * this._prev_rv_pres +
        (_dV_rv * (this._heart._rv.pres - this._prev_rv_pres)) / 2.0;
    } else {
      this._pv_area_rv_dec +=
        -_dV_rv * this._prev_rv_pres +
        (-_dV_rv * (this._heart._rv.pres - this._prev_rv_pres)) / 2.0;
    }

    // store current volumes and pressures
    this._prev_lv_vol = this._heart._lv.vol;
    this._prev_lv_pres = this._heart._lv.pres;

    this._prev_rv_vol = this._heart._rv.vol;
    this._prev_rv_pres = this._heart._rv.pres;

    // return the total pressure volume area of both ventricles
    return this.stroke_work_lv + this.stroke_work_rv;
  }

  activation_function(value, max, setpoint, min) {
    let activation = 0.0;

    if (value >= max) {
      activation = max - setpoint;
    } else {
      if (value <= min) {
        activation = min - setpoint;
      } else {
        activation = value - setpoint;
      }
    }

    return activation;
  }
}
