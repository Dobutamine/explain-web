export class Breathing {
  static model_type = "Breathing";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "breathing_enabled",
      caption: "spontaneous breathing",
      type: "boolean",
      optional: false,
    },
    {
      target: "minute_volume_ref",
      caption: "reference minute volume (l/kg/min)",
      type: "number",
      optional: false,
      factor: 1.0,
      delta: 0.001,
      rounding: 3,
      ul: 100000000.0,
      ll: 0.0,
    },
    {
      target: "vt_rr_ratio",
      caption: "tidal volume/respiration rate ratio",
      type: "number",
      optional: false,
      factor: 1000,
      delta: 0.001,
      rounding: 3,
      ul: 10,
      ll: 0.001,
    },
    {
      target: "ie_ratio",
      caption: "inspiration/expiration time ratio",
      type: "number",
      optional: false,
      factor: 1.0,
      delta: 0.01,
      rounding: 2,
      ul: 1.0,
      ll: 0.01,
    },
    {
      target: "rmp_gain_max",
      caption: "max respiratory muscle pressure gain",
      type: "number",
      optional: false,
      factor: 1.0,
      delta: 0.1,
      rounding: 1,
      ul: 100000000.0,
      ll: 0.1,
    },
    {
      target: "targets",
      caption: "resp muscle pressure targets",
      type: "multiple-list",
      optional: false,
      options: ["Container", "GasCapacitance"],
    },
    {
      target: "tv_source",
      caption: "tidal volume source",
      type: "list",
      optional: false,
      options: ["GasResistor"],
    },
  ];

  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  breathing_enabled = true;
  minute_volume_ref = 0.64; // in L/min/kg
  minute_volume_ref_factor = 1.0;
  minute_volume_ref_scaling_factor = 1.0;
  vt_rr_ratio = 0.03; // in L/bpm/kg
  vt_rr_ratio_factor = 1.0;
  vt_rr_ratio_scaling_factor = 1.0;

  rmp_gain = 2.0;
  rmp_gain_max = 12.0;
  ie_ratio = 0.3;
  targets = [];
  is_intubated = false;
  tv_source = "MOUTH_DS";
  mv_ans_factor = 1.0;
  ans_activity_factor = 1.0;

  // dependent parameters
  resp_rate = 40.0;
  resp_signal = 0.0;
  minute_volume = 0.0;
  target_minute_volume = 0.4;
  target_tidal_volume = 16.0;
  exp_tidal_volume = 0.0;
  insp_tidal_volume = 0.0;
  resp_muscle_pressure = 0.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _eMin4 = Math.pow(Math.E, -4);
  _ti = 0.4;
  _te = 1.0;
  _breath_timer = 0.0;
  _breath_interval = 60.0;
  _insp_running = false;
  _insp_timer = 0.0;
  _ncc_insp = 0;
  _temp_insp_volume = 0.0;
  _exp_running = false;
  _exp_timer = 0.0;
  _ncc_exp = 0;
  _temp_exp_volume = 0.0;

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
    // get the current model weight
    let _weight = this._model_engine.weight;

    if (this.is_intubated) {
      this.exp_tidal_volume =
        this._model_engine.models["Ventilator"].exp_tidal_volume;
    }

    // calculate the target minute volume
    let _minute_volume_ref =
      this.minute_volume_ref *
      this.minute_volume_ref_factor *
      this.minute_volume_ref_scaling_factor *
      _weight;

    this.target_minute_volume =
      _minute_volume_ref +
      (this.mv_ans_factor * _minute_volume_ref - _minute_volume_ref) *
        this.ans_activity_factor;

    if (this.target_minute_volume < 0.01) {
      this.target_minute_volume = 0.01;
    }

    // calculate the respiratory rate and target tidal volume from the target minute volume
    this.vt_rr_controller(_weight);

    // calculate the inspiratory and expiratory time
    this._breath_interval = 60.0;
    if (this.resp_rate > 0) {
      this._breath_interval = 60.0 / this.resp_rate;
      this._ti = this.ie_ratio * this._breath_interval; // in seconds
      this._te = this._breath_interval - this._ti; // in seconds
    }

    // is it time to start a breath?
    if (this._breath_timer > this._breath_interval) {
      this._breath_timer = 0.0;
      this._insp_running = true;
      this._insp_timer = 0.0;
      this._ncc_insp = 0.0;
    }

    // has the inspiration time elapsed?
    if (this._insp_timer > this._ti) {
      this._insp_timer = 0.0;
      this._insp_running = false;
      this._exp_running = true;
      this._ncc_exp = 0.0;
      this._temp_exp_volume = 0.0;
      this.insp_tidal_volume = -this._temp_insp_volume;
    }

    // has the expiration time elapsed?
    if (this._exp_timer > this._te) {
      this._exp_timer = 0.0;
      this._exp_running = false;
      this._temp_insp_volume = 0.0;
      if (this.is_intubated) {
        this.exp_tidal_volume =
          this._model_engine.models["Ventilator"].exp_tidal_volume;
      } else {
        this.exp_tidal_volume = -this._temp_exp_volume;
      }

      // calculate the rmp gain
      if (this.breathing_enabled) {
        if (Math.abs(this.exp_tidal_volume) < this.target_tidal_volume) {
          this.rmp_gain += 0.1;
        }
        if (Math.abs(this.exp_tidal_volume) > this.target_tidal_volume) {
          this.rmp_gain -= 0.1;
        }
        if (this.rmp_gain < 0) {
          this.rmp_gain = 0;
        }
        if (this.rmp_gain > this.rmp_gain_max) {
          this.rmp_gain = this.rmp_gain_max;
        }
      }
      this.minute_volume = this.exp_tidal_volume * this.resp_rate;
    }

    // increase the timers
    this._breath_timer += this._t;

    if (this._insp_running) {
      this._insp_timer += this._t;
      this._ncc_insp += 1;
      if (this._model_engine.models["MOUTH_DS"].flow > 0) {
        this._temp_insp_volume +=
          this._model_engine.models["MOUTH_DS"].flow * this._t;
      }
    }

    if (this._exp_running) {
      this._exp_timer += this._t;
      this._ncc_exp += 1;
      if (this._model_engine.models["MOUTH_DS"].flow < 0) {
        this._temp_exp_volume +=
          this._model_engine.models["MOUTH_DS"].flow * this._t;
      }
    }

    // reset the respiratory muscle pressure
    this.resp_muscle_pressure = 0.0;

    // calculate the new respiratory muscle pressure
    if (this.breathing_enabled) {
      this.resp_muscle_pressure = this.calc_resp_muscle_pressure();
    } else {
      this.resp_rate = 0.0;
      this.target_tidal_volume = 0.0;
      this.resp_muscle_pressure = 0.0;
    }

    // transfer the respiratory muscle pressure to the targets
    if (typeof this.targets === "string") {
      this.targets = [this.targets];
    }

    for (let target of this.targets) {
      this._model_engine.models[target].act_factor =
        this.resp_muscle_pressure * 100.0;
    }
  }

  calc_resp_muscle_pressure() {
    let mp = 0.0;
    // inspiration
    if (this._insp_running) {
      mp = (this._ncc_insp / (this._ti / this._t)) * this.rmp_gain;
    }

    // expiration
    if (this._exp_running) {
      mp =
        ((Math.pow(Math.E, -4.0 * (this._ncc_exp / (this._te / this._t))) -
          this._eMin4) /
          (1.0 - this._eMin4)) *
        this.rmp_gain;
    }

    return mp;
  }

  vt_rr_controller(_weight) {
    // calculate the spontaneous resp rate depending on the target minute volume (from ANS) and the set vt-rr ratio
    this.resp_rate = Math.sqrt(
      this.target_minute_volume /
        (this.vt_rr_ratio *
          this.vt_rr_ratio_factor *
          this.vt_rr_ratio_scaling_factor *
          _weight)
    );

    // calculate the target tidal volume depending on the target resp rate and target minute volume (from ANS)
    if (this.resp_rate > 0) {
      this.target_tidal_volume = this.target_minute_volume / this.resp_rate;
    }
  }

  switch_breathing(state) {
    this.breathing_enabled = state;
  }

  set_resp_rate(resp_rate) {
    this.resp_rate = resp_rate;
  }

  set_mv_ref(mv_ref) {
    this.minute_volume_ref = mv_ref;
  }

  set_vt_rr_ratio(self, vt_rr_ratio) {
    this.vt_rr_ratio = vt_rr_ratio;
  }
}
