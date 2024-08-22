import { set_blood_composition } from "../helpers/BloodComposition";

export class Mob {
  static model_type = "Mob";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "mob_active",
      caption: "mob active",
      type: "boolean",
      optional: false,
    },
    {
      target: "po2_set",
      caption: "po2 setpoint (mmHg)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 100.0,
      ll: 0.0,
    },
    {
      target: "po2_min",
      caption: "po2 min (mmHg)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 100.0,
      ll: 0.0,
    },
    {
      target: "po2_max",
      caption: "po2 max (mmHg)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 100.0,
      ll: 0.0,
    },
    {
      target: "bm_vo2_ref",
      caption: "vo2 reference (mmol/s)",
      type: "number",
      optional: false,
      factor: 1000,
      delta: 0.0001,
      rounding: 4,
      ul: 100000000.0,
      ll: 0.0,
    },
    {
      target: "bm_vo2_max",
      caption: "vo2 max (mmol/s)",
      type: "number",
      optional: false,
      factor: 1000,
      delta: 0.0001,
      rounding: 4,
      ul: 100000000.0,
      ll: 0.0,
    },
    {
      target: "bm_vo2_min",
      caption: "vo2 min (mmol/s)",
      type: "number",
      optional: false,
      factor: 1000,
      delta: 0.0001,
      rounding: 4,
      ul: 100000000.0,
      ll: 0.0,
    },
    {
      target: "bm_vo2_tc",
      caption: "vo2 time constant (s)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 100.0,
      ll: 0.0,
    },
    {
      target: "pva_c",
      caption: "pva (mmol/gm tissue/cardiac cycle)",
      type: "number",
      optional: false,
      factor: 1000,
      delta: 0.0001,
      rounding: 4,
      ul: 100000000.0,
      ll: 0.0,
    },
    {
      target: "ecc_c",
      caption: "ecc (mmol/gm tissue/cardiac cycle)",
      type: "number",
      optional: false,
      factor: 1000,
      delta: 0.000001,
      rounding: 7,
      ul: 100000000.0,
      ll: 0.0,
    },
    {
      target: "ans_factor_max",
      caption: "ans factor max",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 1.0,
      ll: 0.0,
    },
    {
      target: "ans_factor_min",
      caption: "ans factor min",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 1.0,
      ll: 0.0,
    },
    {
      target: "ans_tc",
      caption: "ans time constant (s)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 100.0,
      ll: 0.0,
    },
    {
      target: "hr_factor_max",
      caption: "hr factor max",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 1.0,
      ll: 0.0,
    },
    {
      target: "hr_factor_min",
      caption: "hr factor min",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 1.0,
      ll: 0.0,
    },
    {
      target: "hr_tc",
      caption: "hr time constant (s)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 100.0,
      ll: 0.0,
    },
    {
      target: "cont_factor_max",
      caption: "contractility factor max",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 1.0,
      ll: 0.0,
    },
    {
      target: "cont_factor_min",
      caption: "contractility factor min",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 1.0,
      ll: 0.0,
    },
    {
      target: "cont_tc",
      caption: "contractility time constant (s)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 100.0,
      ll: 0.0,
    },

    {
      target: "resp_q",
      caption: "respiratory quotient",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 10.0,
      ll: 0.001,
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
  ecc_c_factor = 1.0;
  pva_c = 8.73e-5;
  pva_c_factor = 1.0;
  pe_c = 0.0;
  pe_c_factor = 1.0;

  to2_min = 0.0002;
  to2_set = 0.2;
  to2_max = 0.2;

  bm_vo2_ref = 0.0007;
  bm_vo2_max = 0.0007;
  bm_vo2_min = 0.00035;
  bm_vo2_factor = 1.0;

  bm_vo2_tc = 5.0;

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
  bm = 0.0;
  bm_vo2 = 0.0;
  ecc_vo2 = 0.0;
  pva_vo2 = 0.0;
  pe_vo2 = 0.0;
  bm_g = 2.0;
  cont_g = 0.0;
  hr_g = 0.0;
  ans_g = 0.0;

  ecc_lv = 0.0; // pres_ms of the heart chamber
  ecc_rv = 0.0;
  ecc = 0.0; // excitation contraction coupling
  pva = 0.0; // total pva of both ventricles
  pe = 0.0; // potenital mechanical work stored in the ventricular wall
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

  _a_to2 = 0.0;
  _d_bm_vo2 = 0.0;
  _d_cont = 0.0;
  _d_hr = 0.0;
  _d_ans = 0.0;
  _ml_to_mmol = 22.414;

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

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized && this.mob_active) {
      this.calc_model();
    }
  }

  calc_model() {
    // set the heart weight -> at 3.545 that is about 23 grams
    this.hw = 7.799 + 0.004296 * this._model_engine.weight * 1000.0;

    // get the necessary model properties from the coronaries
    let to2_cor = this._cor.aboxy.to2;
    let tco2_cor = this._cor.aboxy.tco2;
    let vol_cor = this._cor.vol;

    // calculate the activation function of the baseline vo2, which is zero when the to2 is above to2 setpoint
    // as the max is the same as the setpoint the activation function is zero when the to2 is above the setpoint
    this.to2_max = this.to2_set;
    this._a_to2 = this.activation_function(
      to2_cor,
      this.to2_max,
      this.to2_set,
      this.to2_min
    );

    // calculate the basal metabolism in mmol O2 / sec is dependent on the to2 in the coronary blood
    this.bm_vo2 = this.calc_bm(this._a_to2);

    // calculate the energy cost of the excitation-contraction coupling in mmol O2 / cardiac cycle
    this.ecc_vo2 = this.calc_ecc(this._a_to2);

    // calculate the pressure volume loop area which is the total stroke work and convert it to mmol O2 / cardiac cycle
    this.pva_vo2 = this.calc_pva(this._a_to2);

    // calculate the potentential mechanical work stored in the ventricular wall and convert it to mmol O2 / cardiac cycle
    this.pe_vo2 = this.calc_pe(this._a_to2);

    // so the basal metabolism is always running but the pe, ecc and pva are only calculated relevant during a cardiac cycle
    let bm_vo2_step = this.bm_vo2 * this._t;

    // the ecc_vo2, pva_vo2 are only running during a cardiac cycle which is stored in the heart object cardiac_cycle_time variable
    let ecc_vo2_step = 0.0;
    let pva_vo2_step = 0.0;
    let pe_vo2_step = 0.0;

    if (
      this._heart.cardiac_cycle_time > 0.0 &&
      this._heart.cardiac_cycle_running
    ) {
      ecc_vo2_step = (this.ecc_vo2 / this._heart.cardiac_cycle_time) * this._t;
      pva_vo2_step = (this.pva_vo2 / this._heart.cardiac_cycle_time) * this._t;
      pe_vo2_step = (this.pe_vo2 / this._heart.cardiac_cycle_time) * this._t;
    }

    // calculate the total vo2 in mmol O2 for the model step
    this.mvo2_step = bm_vo2_step + ecc_vo2_step + pva_vo2_step + pe_vo2_step;

    // calculate the co2 production in this model step
    let co2_production = this.mvo2_step * this.resp_q;

    // calculate the myocardial oxygen balance in mmol/s
    let o2_inflow = this._aa_cor.flow * this._aa.aboxy.to2; // in mmol/s
    let o2_use = this.mvo2_step / this._t; // in mmol/s
    this.mob = o2_inflow - o2_use + to2_cor;

    // calculate the new blood composition of the coronary blood
    if (vol_cor > 0) {
      let new_to2_cor = (to2_cor * vol_cor - this.mvo2_step) / vol_cor;
      let new_tco2_cor = (tco2_cor * vol_cor + co2_production) / vol_cor;
      if (new_to2_cor >= 0) {
        this._cor.aboxy.to2 = new_to2_cor;
        this._cor.aboxy.tco2 = new_tco2_cor;
      }
    }

    // store the blood composition of the coronary blood
    this.cor_po2 = this._cor.aboxy.po2;
    this.cor_pco2 = this._cor.aboxy.pco2;
    this.cor_so2 = this._cor.aboxy.so2;

    // calculate the effects on the heartrate, contractility and autonomic nervous system
    this.calc_effectors(this._a_to2);
  }

  calc_bm(act) {
    // calculate the gain depending on the reference and minimal baseline vo2 and po2 threshold from where the baseline vo2 is reduced
    // this gain determines how much the baseline vo2 is reduced when the po2 drops below the threshold
    this.bm_g =
      (this.bm_vo2_max * this.bm_vo2_factor * this.hw -
        this.bm_vo2_min * this.bm_vo2_factor * this.hw) /
      (this.to2_max - this.to2_min);

    // incorporate the time constants
    this._d_bm_vo2 =
      this._t * ((1 / this.bm_vo2_tc) * (-this._d_bm_vo2 + act)) +
      this._d_bm_vo2;

    // calculate the baseline vo2 in mmol O2 /  cardiac cycle
    let bm_vo2 =
      (this.bm_vo2_ref * this.bm_vo2_factor * this.hw +
        this._d_bm_vo2 * this.bm_g) /
      this._ml_to_mmol; // is about 20% in steady state

    if (
      bm_vo2 <
      (this.bm_vo2_min * this.bm_vo2_factor * this.hw) / this._ml_to_mmol
    ) {
      bm_vo2 =
        (this.bm_vo2_min * this.bm_vo2_factor * this.hw) / this._ml_to_mmol;
    }

    return bm_vo2;
  }

  calc_ecc(act) {
    // calculate the excitation contraction coupling in mmol O2 / cardiac cycle relates to the costs of ion transport and calcium cycling
    this.ecc_lv = this._heart._lv.el_max * this._heart._lv.el_max_factor;
    this.ecc_rv = this._heart._rv.el_max * this._heart._rv.el_max_factor;
    this.ecc = (this.ecc_lv + this.ecc_rv) / 1000.0;

    return (
      (this.ecc * this.ecc_c * this.ecc_c_factor * this.hw) / this._ml_to_mmol
    ); // is about 15% in steady state;
  }

  calc_pe(act) {
    // calculate the potential mechanical work stored in the ventricular wall in mmol O2 / cardiac cycle which does not have a direct metabolic cost but is stored energy
    this.pe = 0;

    return (
      (this.pe * this.pe_c * this.pe_c_factor * this.hw) / this._ml_to_mmol
    );
  }

  calc_pva(act) {
    // detect the start of the cardiac cycle and calculate the area of the pv loop of the last cardiac cycle
    if (
      this._heart.cardiac_cycle_running &&
      !this._heart.prev_cardiac_cycle_running
    ) {
      // calculate the composition the coronary blood
      set_blood_composition(this._cor);

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
    this.pva = this.stroke_work_lv + this.stroke_work_rv;

    return (
      (this.pva * this.pva_c * this.pva_c_factor * this.hw) / this._ml_to_mmol
    );
  }

  calc_effectors(act) {
    // calculate the gain of the effectors heart rate, contractility and autonomic nervous system suppression
    this.hr_g =
      (this.hr_factor_max - this.hr_factor_min) / (this.to2_max - this.to2_min);

    this.cont_g =
      (this.cont_factor_max - this.cont_factor_min) /
      (this.to2_max - this.to2_min);

    this.ans_g =
      (this.ans_factor_max - this.ans_factor_min) /
      (this.to2_max - this.to2_min);

    // incorporate the time constants
    this._d_hr =
      this._t * ((1 / this.hr_tc) * (-this._d_hr + act)) + this._d_hr;
    this._d_cont =
      this._t * ((1 / this.cont_tc) * (-this._d_cont + act)) + this._d_cont;
    this._d_ans =
      this._t * ((1 / this.ans_tc) * (-this._d_ans + act)) + this._d_ans;

    // when hypoxia gets severe the ANS influence gets inhibited and the heartrate, contractility and baseline metabolism are decreased

    // calculate the new ans activity (1.0 is max activity and 0.0 is min activity) which controls the ans activity
    this.ans_activity_factor = 1.0 + this.ans_g * this._d_ans;
    this._heart.ans_activity_factor = this.ans_activity_factor;

    // calculate the mob factor which controls the heart rate
    this.hr_factor = 1.0 + this.hr_g * this._d_hr;
    this._heart.hr_mob_factor = this.hr_factor;

    // calculate the mob factor which controls the contractility of the heart
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
