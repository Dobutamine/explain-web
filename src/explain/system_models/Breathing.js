import { BaseModelClass } from "../base_models/BaseModelClass";

export class Breathing extends BaseModelClass {
  // static properties
  static model_type = "Breathing";
  static model_interface = [
    {
      caption: "spont breathing enabled",
      target: "breathing_enabled",
      type: "boolean",
    },
    {
      caption: "reference minute volume (L/kg/min)",
      target: "minute_volume_ref",
      type: "number",
      delta: 0.01,
      factor: 1.0,
      rounding: 2,
    },
    {
      caption: "vt rr ratio",
      target: "vt_rr_ratio",
      type: "number",
      delta: 0.001,
      factor: 1000.0,
      rounding: 4,
    },
    {
      caption: "insp/exp ratio",
      target: "ie_ratio",
      type: "number",
      delta: 0.01,
      factor: 1.0,
      rounding: 2,
    },
    {
      caption: "rmp gain max",
      target: "rmp_gain_max",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0,
    },
  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.breathing_enabled = true; // flag whether spontaneous breathing is enabled or not
    this.minute_volume_ref = 0.2; // reference minute volume (L/kg/min)
    this.minute_volume_ref_factor = 1.0; // factor influencing the reference minute volume
    this.minute_volume_ref_scaling_factor = 1.0; // scaling factor of the reference minute volume
    this.vt_rr_ratio = 0.0001212; // ratio between tidal volume and respiratory rate
    this.vt_rr_ratio_factor = 1.0; // factor influencing the ratio
    this.vt_rr_ratio_scaling_factor = 1.0; // scaling factor for vt-rr ratio
    this.rmp_gain_max = 100.0; // maximum pressure exerted by respiratory muscles
    this.ie_ratio = 0.3; // ratio of inspiratory and expiratory time
    this.mv_ans_factor = 1.0; // factor from the autonomic nervous system
    this.ans_activity_factor = 1.0; // global ANS activity factor

    // initialize dependent properties
    this.target_minute_volume = 0.0; // target minute volume
    this.resp_rate = 36.0; // respiratory rate (breaths/min)
    this.target_tidal_volume = 0.0; // target tidal volume (L)
    this.minute_volume = 0.0; // minute volume (L/min)
    this.exp_tidal_volume = 0.0; // expiratory tidal volume (L)
    this.insp_tidal_volume = 0.0; // inspiratory tidal volume (L)
    this.resp_muscle_pressure = 0.0; // respiratory muscle pressure (mmHg/L)
    this.ncc_insp = 0; // inspiratory counter
    this.ncc_exp = 0; // expiratory counter
    this.rmp_gain = 9.5; // elastance change gain (mmHg/L)

    // local properties
    this._eMin4 = Math.pow(Math.E, -4); // constant for Mecklenburgh function
    this._ti = 0.4; // inspiration time (s)
    this._te = 1.0; // expiration time (s)
    this._breath_timer = 0.0; // current breath time (s)
    this._breath_interval = 60.0; // breathing interval (s)
    this._insp_running = false; // flag for inspiration
    this._insp_timer = 0.0; // inspiration timer (s)
    this._temp_insp_volume = 0.0; // inspiratory volume counter (L)
    this._exp_running = false; // flag for expiration
    this._exp_timer = 0.0; // expiration timer (s)
    this._temp_exp_volume = 0.0; // expiratory volume counter (L)

    // debug factor
    this.debug_factor1 = 0.0
  }

  calc_model() {
    const _weight = this._model_engine.weight;

    // calculate the target minute volume
    const _minute_volume_ref = this.minute_volume_ref * this.minute_volume_ref_factor * this.minute_volume_ref_scaling_factor * _weight;
    this.target_minute_volume = (_minute_volume_ref + (this.mv_ans_factor - 1.0) * _minute_volume_ref) * this.ans_activity_factor;

    // calculate respiratory rate and tidal volume
    this.vt_rr_controller(_weight);

    // calculate inspiratory and expiratory times
    this._breath_interval = 60.0;
    if (this.resp_rate > 0) {
      this._breath_interval = 60.0 / this.resp_rate;
      this._ti = this.ie_ratio * this._breath_interval;
      this._te = this._breath_interval - this._ti;
    }

    // handle breathing phases
    if (this._breath_timer > this._breath_interval) {
      this._breath_timer = 0.0; // reset breath timer
      this._insp_running = true; // start inspiration
      this._insp_timer = 0.0; // reset inspiration timer
      this.ncc_insp = 0;
    }

    if (this._insp_timer > this._ti) {
      this._insp_timer = 0.0;
      this._insp_running = false;
      this._exp_running = true; // start expiration
      this.ncc_exp = 0;
      this._temp_exp_volume = 0.0;
      this.insp_tidal_volume = this._temp_insp_volume;
    }

    if (this._exp_timer > this._te) {
      this._exp_timer = 0.0;
      this._exp_running = false;
      this._temp_insp_volume = 0.0;
      this.exp_tidal_volume = -this._temp_exp_volume;

      if (this.breathing_enabled) {
        if (Math.abs(this.exp_tidal_volume) < this.target_tidal_volume) {
          this.rmp_gain += 0.1;
        }
        if (Math.abs(this.exp_tidal_volume) > this.target_tidal_volume) {
          this.rmp_gain -= 0.1;
        }
        this.rmp_gain = Math.max(
          0.0,
          Math.min(this.rmp_gain, this.rmp_gain_max)
        );
      }

      this.minute_volume = this.exp_tidal_volume * this.resp_rate;
    }

    this._breath_timer += this._t;

    if (this._insp_running) {
      this._insp_timer += this._t;
      this.ncc_insp += 1;
      if (this._model_engine.models["MOUTH_DS"].flow > 0) {
        this._temp_insp_volume +=
          this._model_engine.models["MOUTH_DS"].flow * this._t;
      }
    }

    if (this._exp_running) {
      this._exp_timer += this._t;
      this.ncc_exp += 1;
      if (this._model_engine.models["MOUTH_DS"].flow < 0) {
        this._temp_exp_volume +=
          this._model_engine.models["MOUTH_DS"].flow * this._t;
      }
    }

    this.resp_muscle_pressure = 0.0;
    if (this.breathing_enabled) {
      this.resp_muscle_pressure = this.calc_resp_muscle_pressure();
    } else {
      this.resp_rate = 0.0;
      this.ncc_insp = 0.0;
      this.ncc_exp = 0.0;
      this.target_tidal_volume = 0.0;
      this.resp_muscle_pressure = 0.0;
    }

    this._model_engine.models["THORAX"].pres_mus = -this.resp_muscle_pressure
  }

  vt_rr_controller(_weight) {
    this.resp_rate = Math.sqrt(this.target_minute_volume / (this.vt_rr_ratio * this.vt_rr_ratio_factor * this.vt_rr_ratio_scaling_factor * _weight));

    if (this.resp_rate > 0) {
      this.target_tidal_volume = this.target_minute_volume / this.resp_rate;
    }
  }

  calc_resp_muscle_pressure() {
    let mp = 0.0;

    if (this._insp_running) {
      mp = (this.ncc_insp / (this._ti / this._t)) * this.rmp_gain;
    }

    if (this._exp_running) {
      mp = ((Math.pow(Math.E, -4.0 * (this.ncc_exp / (this._te / this._t))) - this._eMin4) / (1.0 - this._eMin4)) * this.rmp_gain;
    }

    return mp;
  }

  switch_breathing(state) {
    this.breathing_enabled = state;
  }
}
