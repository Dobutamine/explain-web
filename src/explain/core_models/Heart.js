export class Heart {
  static model_type = "Heart";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: false,
      relative: false,
    },
    {
      target: "heart_rate_ref",
      caption: "heartrate reference (bpm)",
      type: "number",
      mode: "abs",
      optional: false,
      relative: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 300.0,
      ll: 10.0,
    },
    {
      target: "heart_rate_override",
      caption: "override heartrate",
      type: "boolean",
      optional: false,
      relative: false,
    },
    {
      target: "heart_rate_forced",
      caption: "heartrate override (bpm)",
      type: "number",
      optional: true,
      relative: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 300.0,
      ll: 10.0,
    },
    // ecg timings
    {
      target: "set_ecg_timings",
      caption: "ecg timings",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "pq_time",
          caption: "pq time (ms)",
          type: "number",
          factor: 1000,
          delta: 1,
          rounding: 0,
          ul: 10000.0,
          ll: 1.0,
        },
        {
          target: "qrs_time",
          caption: "qrs time (ms)",
          type: "number",
          factor: 1000,
          delta: 1,
          rounding: 0,
          ul: 10000.0,
          ll: 1.0,
        },
        {
          target: "qt_time",
          caption: "qt time (ms)",
          type: "number",
          factor: 1000,
          delta: 1,
          rounding: 0,
          ul: 10000.0,
          ll: 1.0,
        },
        {
          target: "av_delay",
          caption: "av delay (ms)",
          type: "number",
          factor: 1000,
          delta: 1,
          rounding: 0,
          ul: 10000.0,
          ll: 1.0,
        },
      ],
    },

    // av
    {
      target: "set_heartvalve_props_abs",
      caption: "aortic valve properties ",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "valve",
          type: "list",
          default: "_av",
          options: [],
          options_default: [],
          hidden: true,
        },
        {
          target: "_av.r_for",
          caption: "forward resistance (mmHg*sec/ml)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000000000.0,
          ll: 0.0,
        },
        {
          target: "_av.r_back",
          caption: "backward resistance (mmHg*sec/ml)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000000000.0,
          ll: 0.0,
        },
        {
          target: "_av.r_k",
          caption: "non linear resistance (sec/l)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: -10000000.0,
        },
        {
          target: "_av.no_flow",
          caption: "no flow allowed",
          type: "boolean",
        },
        {
          target: "_av.no_back_flow",
          caption: "no backflow allowed",
          type: "boolean",
        },
      ],
    },

    // pv
    {
      target: "set_heartvalve_props_abs",
      caption: "pulmonary valve properties ",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "valve",
          type: "list",
          default: "_pv",
          options: [],
          options_default: [],
          hidden: true,
        },
        {
          target: "_pv.r_for",
          caption: "forward resistance (mmHg*sec/ml)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000000000.0,
          ll: 0.0,
        },
        {
          target: "_pv.r_back",
          caption: "backward resistance (mmHg*sec/ml)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000000000.0,
          ll: 0.0,
        },
        {
          target: "_pv.r_k",
          caption: "non linear resistance (sec/l)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: -10000000.0,
        },
        {
          target: "_pv.no_flow",
          caption: "no flow allowed",
          type: "boolean",
        },
        {
          target: "_pv.no_back_flow",
          caption: "no backflow allowed",
          type: "boolean",
        },
      ],
    },

    // mv
    {
      target: "set_heartvalve_props_abs",
      caption: "mitral valve properties ",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "valve",
          type: "list",
          default: "_mv",
          options: [],
          options_default: [],
          hidden: true,
        },
        {
          target: "_mv.r_for",
          caption: "forward resistance (mmHg*sec/ml)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000000000.0,
          ll: 0.0,
        },
        {
          target: "_mv.r_back",
          caption: "backward resistance (mmHg*sec/ml)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000000000.0,
          ll: 0.0,
        },
        {
          target: "_mv.r_k",
          caption: "non linear resistance (sec/l)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: -10000000.0,
        },
        {
          target: "_mv.no_flow",
          caption: "no flow allowed",
          type: "boolean",
        },
        {
          target: "_mv.no_back_flow",
          caption: "no backflow allowed",
          type: "boolean",
        },
      ],
    },

    // tv
    {
      target: "set_heartvalve_props_abs",
      caption: "tricuspid valve properties ",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "valve",
          type: "list",
          default: "_tv",
          options: [],
          options_default: [],
          hidden: true,
        },
        {
          target: "_tv.r_for",
          caption: "forward resistance (mmHg*sec/ml)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000000000.0,
          ll: 0.0,
        },
        {
          target: "_tv.r_back",
          caption: "backward resistance (mmHg*sec/ml)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000000000.0,
          ll: 0.0,
        },
        {
          target: "_tv.r_k",
          caption: "non linear resistance (sec/l)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: -10000000.0,
        },
        {
          target: "_tv.no_flow",
          caption: "no flow allowed",
          type: "boolean",
        },
        {
          target: "_tv.no_back_flow",
          caption: "no backflow allowed",
          type: "boolean",
        },
      ],
    },

    // lv
    {
      target: "set_heartchamber_props_abs",
      caption: "left ventricle properties ",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "chamber",
          type: "list",
          default: "_lv",
          options: [],
          options_default: [],
          hidden: true,
        },
        {
          target: "_lv.el_min",
          caption: "minimal elastance (mmHg/l)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: 1,
        },
        {
          target: "_lv.el_max",
          caption: "maximal elastance (mmHg/l)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: 1,
        },
        {
          target: "_lv.el_k",
          caption: "non-linear elastance (mmHg/l^2)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: 1,
        },
        {
          target: "_lv.u_vol",
          caption: "unstressed volume (ml)",
          type: "number",
          factor: 1000,
          delta: 0.01,
          rounding: 2,
          ul: 100000000.0,
          ll: -10000000.0,
        },
      ],
    },

    {
      target: "set_heartchamber_props_abs",
      caption: "right ventricle properties ",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "chamber",
          type: "list",
          default: "_rv",
          options: [],
          options_default: [],
          hidden: true,
        },
        {
          target: "_rv.el_min",
          caption: "minimal elastance (mmHg/l)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: 1,
        },
        {
          target: "_rv.el_max",
          caption: "maximal elastance (mmHg/l)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: 1,
        },
        {
          target: "_rv.el_k",
          caption: "non-linear elastance (mmHg/l^2)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: 1,
        },
        {
          target: "_rv.u_vol",
          caption: "unstressed volume (ml)",
          type: "number",
          factor: 1000,
          delta: 0.01,
          rounding: 2,
          ul: 100000000.0,
          ll: -10000000.0,
        },
      ],
    },

    {
      target: "set_heartchamber_props_abs",
      caption: "left atrial properties ",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "chamber",
          type: "list",
          default: "_la",
          options: [],
          options_default: [],
          hidden: true,
        },
        {
          target: "_la.el_min",
          caption: "minimal elastance (mmHg/l)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: 1,
        },
        {
          target: "_la.el_max",
          caption: "maximal elastance (mmHg/l)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: 1,
        },
        {
          target: "_la.el_k",
          caption: "non-linear elastance (mmHg/l^2)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: 1,
        },
        {
          target: "_la.u_vol",
          caption: "unstressed volume (ml)",
          type: "number",
          factor: 1000,
          delta: 0.01,
          rounding: 2,
          ul: 100000000.0,
          ll: -10000000.0,
        },
      ],
    },

    {
      target: "set_heartchamber_props_abs",
      caption: "right atrial properties ",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "chamber",
          type: "list",
          default: "_ra",
          options: [],
          options_default: [],
          hidden: true,
        },
        {
          target: "_ra.el_min",
          caption: "minimal elastance (mmHg/l)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: 1,
        },
        {
          target: "_ra.el_max",
          caption: "maximal elastance (mmHg/l)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: 1,
        },
        {
          target: "_ra.el_k",
          caption: "non-linear elastance (mmHg/l^2)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 100000000.0,
          ll: 1,
        },
        {
          target: "_ra.u_vol",
          caption: "unstressed volume (ml)",
          type: "number",
          factor: 1000,
          delta: 0.01,
          rounding: 2,
          ul: 100000000.0,
          ll: -10000000.0,
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
  coronaries = "";
  coronary_sinus = "";
  pericardium = "";
  left_atrium = "";
  right_atrium = "";
  left_ventricle = "";
  right_ventricle = "";
  mitral_valve = "";
  tricuspid_valve = "";
  pulmonary_valve = "";
  aortic_valve = "";
  heart_rate_ref = 110.0;
  heart_rate_override = false;
  heart_rate_forced = 110.0;
  rhythm_type = 0.0;
  pq_time = 0.1;
  qrs_time = 0.075;
  qt_time = 0.25;
  av_delay = 0.0005;
  cardiac_cycle_running = 0;
  prev_cardiac_cycle_running = 0;
  cardiac_cycle_time = 0.353;

  hr_ans_factor = 1.0;
  hr_mob_factor = 1.0;
  hr_temp_factor = 1.0;
  hr_drug_factor = 1.0;
  ans_activity_factor = 1.0;
  ncc_ventricular = 0.0;
  ncc_atrial = 0.0;
  ncc_resus = 0.0;

  // dependent parameters
  heart_rate = 110.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _la = {};
  _mv = {};
  _lv = {};
  _av = {};
  _ra = {};
  _tv = {};
  _rv = {};
  _pv = {};
  _cor = {};
  _pc = {};
  _sa_node_interval = 0.0;
  _sa_node_timer = 0.0;
  _pq_running = false;
  _pq_timer = 0.0;
  _av_delay_running = false;
  _av_delay_timer = 0.0;
  _qrs_running = false;
  _qrs_timer = 0.0;
  _qt_running = false;
  _qt_timer = 0.0;
  _ventricle_is_refractory = false;
  _kn = 0.579;
  _prev_cardiac_cycle = false;
  _temp_cardiac_cycle_time = 0.0;

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
    // process the model parameters
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // get a reference to all the heart models
    this._la = this._model_engine.models[this.left_atrium];
    this._ra = this._model_engine.models[this.right_atrium];
    this._lv = this._model_engine.models[this.left_ventricle];
    this._rv = this._model_engine.models[this.right_ventricle];

    // get a reference to the heart valves
    this._av = this._model_engine.models[this.aortic_valve];
    this._mv = this._model_engine.models[this.mitral_valve];
    this._tv = this._model_engine.models[this.tricuspid_valve];
    this._pv = this._model_engine.models[this.pulmonary_valve];

    // get a reference to the pericardium
    this._pc = this._model_engine.models[this.pericardium];

    // get a reference to the coronaries model
    this._cor = this._model_engine.models[this.coronaries];

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
    // set the previous cardiac cycle flag
    this.prev_cardiac_cycle_running = this.cardiac_cycle_running;

    // calculate the heartrate from the reference value and all other influences
    this.heart_rate =
      this.heart_rate_ref +
      (this.hr_ans_factor * this.heart_rate_ref - this.heart_rate_ref) *
        this.ans_activity_factor +
      (this.hr_mob_factor * this.heart_rate_ref - this.heart_rate_ref) +
      (this.hr_temp_factor * this.heart_rate_ref - this.heart_rate_ref) +
      (this.hr_drug_factor * this.heart_rate_ref - this.heart_rate_ref);

    // override the heart rate if switch is on
    if (this.heart_rate_override) {
      this.heart_rate = this.heart_rate_forced;
    }

    // calculate the qtc time depending on the heartrate
    this.cqt_time = this.calc_qtc(this.heart_rate);

    // calculate the sinus node interval in seconds depending on the heart rate
    this._sa_node_interval = 60.0 / this.heart_rate;

    // has the sinus node period elapsed?
    if (this._sa_node_timer > this._sa_node_interval) {
      // reset the sinus node timer
      this._sa_node_timer = 0.0;
      // signal that the pq-time starts running
      this._pq_running = true;
      // reset the atrial activation curve counter
      this.ncc_atrial = -1;
      // signal that the cardiac cycle is running and reset the timer
      this._temp_cardiac_cycle_time = 0.0;
      this.cardiac_cycle_running = 1;
    }

    // has the pq time period elapsed?
    if (this._pq_timer > this.pq_time) {
      // reset the pq timer
      this._pq_timer = 0.0;
      // signal that pq timer has stopped
      this._pq_running = false;
      // signal that the av delay timer has started
      this._av_delay_running = true;
    }

    // has the av delay time elasped
    if (this._av_delay_timer > this.av_delay) {
      // reset the av delay timer
      this._av_delay_timer = 0.0;
      // signal that the av delay has stopped
      this._av_delay_running = false;
      // check whether the ventricles are in a refractory state
      if (!this._ventricle_is_refractory) {
        // signal that the qrs time starts running
        this._qrs_running = true;
        // reset the ventricular activation curve
        this.ncc_ventricular = -1;
      }
    }

    // has the qrs time period elapsed?
    if (this._qrs_timer > this.qrs_time) {
      // reset the qrs timer
      this._qrs_timer = 0.0;
      // signal that the qrs timer has stopped
      this._qrs_running = false;
      // signal that the at timer starts running
      this._qt_running = true;
      // signal that the ventricles are now in a refractory state
      this._ventricle_is_refractory = true;
    }

    // has the qt time period elapsed?
    if (this._qt_timer > this.cqt_time) {
      // reset the qt timer
      this._qt_timer = 0.0;
      // signal that the qt timer has stopped
      this._qt_running = false;
      // signal that the ventricles are coming out of their refractory state
      this._ventricle_is_refractory = false;
      // signal the end of the cardiac cycle
      this.cardiac_cycle_time = this._temp_cardiac_cycle_time;
      this.cardiac_cycle_running = 0;
    }

    // increase the timers with the modeling stepsize as set by the model base class
    this._sa_node_timer += this._t;

    if (this._pq_running) {
      this._pq_timer += this._t;
    }
    if (this._av_delay_running) {
      this._av_delay_timer += this._t;
    }
    if (this._qrs_running) {
      this._qrs_timer += this._t;
    }
    if (this._qt_running) {
      this._qt_timer += this._t;
    }

    // check the cardiac cycle
    if (this.cardiac_cycle_running === 1) {
      this._temp_cardiac_cycle_time += this._t;
    }

    // increase the heart activation function counters
    this.ncc_atrial += 1;
    this.ncc_ventricular += 1;

    // calculate the varying elastance factor
    this.calc_varying_elastance();
  }

  calc_varying_elastance() {
    // calculate the atrial activation factor
    let _atrial_duration = this.pq_time / this._t;
    if (this.ncc_atrial >= 0 && this.ncc_atrial < _atrial_duration) {
      this.aaf = Math.sin(Math.PI * (this.ncc_atrial / _atrial_duration));
    } else {
      this.aaf = 0.0;
    }

    // calculate the ventricular activation factor
    let _ventricular_duration = (this.qrs_time + this.cqt_time) / this._t;
    if (
      this.ncc_ventricular >= 0 &&
      this.ncc_ventricular < _ventricular_duration
    ) {
      this.vaf =
        (this.ncc_ventricular / (this._kn * _ventricular_duration)) *
        Math.sin(Math.PI * (this.ncc_ventricular / _ventricular_duration));
    } else {
      this.vaf = 0.0;
    }

    // transfer the activation factor to the heart components
    this._la.act_factor = this.aaf;
    this._ra.act_factor = this.aaf;
    this._lv.act_factor = this.vaf;
    this._rv.act_factor = this.vaf;

    if (this._cor) {
      // transfer the activation factor to the heart components
      this._cor.act_factor = this.vaf;
    }
  }

  calc_qtc(hr) {
    if (hr > 10.0) {
      return this.qt_time * Math.sqrt(60.0 / hr);
    } else {
      return this.qt_time * 2.449; // (sqrt(6))
    }
  }

  set_ecg_timings(pq_time, qrs_time, qt_time) {
    this.pq_time = pq_time;
    this.qrs_time = qrs_time;
    this.qt_time = qt_time;
  }

  set_heartchamber_props_abs(chamber, el_min, el_max, u_vol, el_k) {
    let t = this[chamber];
    t.el_min = el_min;
    t.el_max = el_max;
    t.u_vol = u_vol;
    t.el_k = el_k;
  }

  set_heartchamber_props_rel(
    chamber,
    el_min_factor,
    el_max_factor,
    u_vol_factor,
    el_k_factor
  ) {
    let t = this[chamber];
    t.el_min_factor = el_min_factor;
    t.el_max_factor = el_max_factor;
    t.u_vol_factor = u_vol_factor;
    t.el_k_factor = el_k_factor;
  }

  set_heartvalve_props_abs(valve, r_for, r_back, r_k, no_flow, no_back_flow) {
    let t = this[valve];
    t.r_for = r_for;
    t.r_back = r_back;
    t.r_k = r_k;
    t.no_flow = no_flow;
    t.no_back_flow = no_back_flow;
  }

  set_heartvalve_props_rel(
    valve,
    r_for_factor,
    r_back_factor,
    r_k_factor,
    no_flow,
    no_back_flow
  ) {
    let t = this[valve];
    t.r_for_factor = r_for_factor;
    t.r_back_factor = r_back_factor;
    t.r_k_factor = r_k_factor;
    t.no_flow = no_flow;
    t.no_back_flow = no_back_flow;
  }
}
