export class Heart {
  static model_type = "Heart";
  static model_interface = [];

  constructor(model_ref, name = "") {
      // Independent properties
      this.name = name;
      this.description = "";
      this.is_enabled = false;
      this.dependencies = [];
      this.left_atrium = "";
      this.right_atrium = "";
      this.left_ventricle = "";
      this.right_ventricle = "";
      this.coronaries = "";
      this.coronary_sinus = "";
      this.pericardium = "";
      this.mitral_valve = "";
      this.tricuspid_valve = "";
      this.pulmonary_valve = "";
      this.aortic_valve = "";
      this.heart_rate_ref = 110.0;
      this.heart_rate_override = false;
      this.heart_rate_forced = 110.0;
      this.rhythm_type = 0.0;
      this.pq_time = 0.1;
      this.qrs_time = 0.075;
      this.qt_time = 0.25;
      this.av_delay = 0.0005;
      this.cardiac_cycle_time = 0.353;
      this.hr_ans_factor = 1.0;
      this.cont_ans_factor = 1.0;
      this.hr_mob_factor = 1.0;
      this.hr_temp_factor = 1.0;
      this.hr_drug_factor = 1.0;
      this.ans_activity_factor = 1.0;

      // Dependent properties
      this.heart_rate = 120.0;
      this.ncc_ventricular = 0.0;
      this.ncc_atrial = 0.0;
      this.ncc_resus = 0.0;
      this.cardiac_cycle_running = 0;
      this.prev_cardiac_cycle_running = 0;
      this.input_values = [];

      // Local properties
      this._model_engine = model_ref;
      this._is_initialized = false;
      this._t = model_ref.modeling_stepsize;
      this._la = null;
      this._mv = null;
      this._lv = null;
      this._av = null;
      this._ra = null;
      this._tv = null;
      this._rv = null;
      this._pv = null;
      this._cor = null;
      this._pc = null;
      this._sa_node_interval = 0.0;
      this._sa_node_timer = 0.0;
      this._pq_running = false;
      this._pq_timer = 0.0;
      this._av_delay_running = false;
      this._av_delay_timer = 0.0;
      this._qrs_running = false;
      this._qrs_timer = 0.0;
      this._qt_running = false;
      this._qt_timer = 0.0;
      this._ventricle_is_refractory = false;
      this._kn = 0.579;
      this._prev_cardiac_cycle = false;
      this._temp_cardiac_cycle_time = 0.0;
  }

  init_model(args) {
      // set the values of the properties as passed in the arguments
      args.forEach((arg) => {
        this[arg["key"]] = arg["value"];
      });

      // Get a reference to all the heart models
      this._la = this._model_engine.models[this.left_atrium];
      this._ra = this._model_engine.models[this.right_atrium];
      this._lv = this._model_engine.models[this.left_ventricle];
      this._rv = this._model_engine.models[this.right_ventricle];

      // Get a reference to the heart valves
      this._av = this._model_engine.models[this.aortic_valve];
      this._mv = this._model_engine.models[this.mitral_valve];
      this._tv = this._model_engine.models[this.tricuspid_valve];
      this._pv = this._model_engine.models[this.pulmonary_valve];

      // Get a reference to the pericardium and coronaries model
      this._pc = this._model_engine.models[this.pericardium];
      this._cor = this._model_engine.models[this.coronaries];

      this.input_value = this._input_site = this._model_engine.models["LL"].aboxy;

      // Flag that the model is initialized
      this._is_initialized = true;
  }

  step_model() {
      if (this.is_enabled && this._is_initialized) {
          this.calc_model();
      }
  }

  calc_model() {
      // Set the previous cardiac cycle flag
      this.prev_cardiac_cycle_running = this.cardiac_cycle_running;

      // Calculate the heart rate from the reference value and all other influences
      this.heart_rate = this.heart_rate_ref +
          (this.hr_ans_factor - 1.0) * this.heart_rate_ref * this.ans_activity_factor +
          (this.hr_mob_factor - 1.0) * this.heart_rate_ref +
          (this.hr_temp_factor - 1.0) * this.heart_rate_ref +
          (this.hr_drug_factor - 1.0) * this.heart_rate_ref;

      // Override the heart rate if switch is on
      if (this.heart_rate_override) {
          this.heart_rate = this.heart_rate_forced;
      }

      // Calculate the qtc time depending on the heart rate
      this.cqt_time = this.calc_qtc(this.heart_rate);

      // Calculate the sinus node interval in seconds depending on the heart rate
      this._sa_node_interval = 60.0 / this.heart_rate;

      // Has the sinus node period elapsed?
      if (this._sa_node_timer > this._sa_node_interval) {
          this._sa_node_timer = 0.0;
          this._pq_running = true;
          this.ncc_atrial = -1;
          this._temp_cardiac_cycle_time = 0.0;
          this.cardiac_cycle_running = 1;
      }

      // Has the pq time period elapsed?
      if (this._pq_timer > this.pq_time) {
          this._pq_timer = 0.0;
          this._pq_running = false;
          this._av_delay_running = true;
      }

      // Has the av delay time elapsed?
      if (this._av_delay_timer > this.av_delay) {
          this._av_delay_timer = 0.0;
          this._av_delay_running = false;
          if (!this._ventricle_is_refractory) {
              this._qrs_running = true;
              this.ncc_ventricular = -1;
          }
      }

      // Has the qrs time period elapsed?
      if (this._qrs_timer > this.qrs_time) {
          this._qrs_timer = 0.0;
          this._qrs_running = false;
          this._qt_running = true;
          this._ventricle_is_refractory = true;
      }

      // Has the qt time period elapsed?
      if (this._qt_timer > this.cqt_time) {
          this._qt_timer = 0.0;
          this._qt_running = false;
          this._ventricle_is_refractory = false;
          this.cardiac_cycle_time = this._temp_cardiac_cycle_time;
          this.cardiac_cycle_running = 0;
      }

      // Increase the timers with the modeling stepsize as set by the model base class
      this._sa_node_timer += this._t;
      if (this._pq_running) this._pq_timer += this._t;
      if (this._av_delay_running) this._av_delay_timer += this._t;
      if (this._qrs_running) this._qrs_timer += this._t;
      if (this._qt_running) this._qt_timer += this._t;

      // Check the cardiac cycle
      if (this.cardiac_cycle_running === 1) {
          this._temp_cardiac_cycle_time += this._t;
      }

      // Increase the heart activation function counters
      this.ncc_atrial += 1;
      this.ncc_ventricular += 1;
      this._model_engine.ncc_ventricular = this.ncc_ventricular;

      // Calculate the varying elastance factor
      this.calc_varying_elastance();
  }

  calc_varying_elastance() {
      // Calculate the atrial activation factor
      const _atrial_duration = this.pq_time / this._t;
      if (this.ncc_atrial >= 0 && this.ncc_atrial < _atrial_duration) {
          this.aaf = Math.sin(Math.PI * (this.ncc_atrial / _atrial_duration));
      } else {
          this.aaf = 0.0;
      }

      // Calculate the ventricular activation factor
      const _ventricular_duration = (this.qrs_time + this.cqt_time) / this._t;
      if (this.ncc_ventricular >= 0 && this.ncc_ventricular < _ventricular_duration) {
          this.vaf = (this.ncc_ventricular / (this._kn * _ventricular_duration)) *
              Math.sin(Math.PI * (this.ncc_ventricular / _ventricular_duration));
      } else {
          this.vaf = 0.0;
      }

      // Transfer the activation factor to the heart components
      this._la.act_factor = this.aaf;
      this._ra.act_factor = this.aaf;
      this._lv.act_factor = this.vaf;
      this._rv.act_factor = this.vaf;

      // Incorporate the ans factors
      this._la.el_max_ans_factor = this.cont_ans_factor;
      this._ra.el_max_ans_factor = this.cont_ans_factor;
      this._lv.el_max_ans_factor = this.cont_ans_factor;
      this._rv.el_max_ans_factor = this.cont_ans_factor;

      if (this._cor) {
          this._cor.act_factor = this.vaf;
      }
  }

  calc_qtc(hr) {
      if (hr > 10.0) {
          return this.qt_time * Math.sqrt(60.0 / hr);
      } else {
          return this.qt_time * 2.449;
      }
  }

  set_ecg_timings(pq_time, qrs_time, qt_time) {
      this.pq_time = pq_time;
      this.qrs_time = qrs_time;
      this.qt_time = qt_time;
  }

  set_heartchamber_props_abs(chamber, el_min, el_max, u_vol, el_k) {
      const t = this._model_engine.models[chamber];
      t.el_min = el_min;
      t.el_max = el_max;
      t.u_vol = u_vol;
      t.el_k = el_k;
  }

  set_heartchamber_props_rel(chamber, el_min_factor, el_max_factor, el_k_factor, u_vol_factor) {
      const t = this._model_engine.models[chamber];
      t.el_min_factor = el_min_factor;
      t.el_max_factor = el_max_factor;
      t.u_vol_factor = u_vol_factor;
      t.el_k_factor = el_k_factor;
  }

  set_heartvalve_props_abs(valve, r_for, r_back, r_k, no_flow, no_back_flow) {
      const t = this._model_engine.models[valve];
      t.r_for = r_for;
      t.r_back = r_back;
      t.r_k = r_k;
      t.no_flow = no_flow;
      t.no_back_flow = no_back_flow;
  }

  set_heartvalve_props_rel(valve, r_for_factor, r_back_factor, r_k_factor, no_flow, no_back_flow) {
      const t = this._model_engine.models[valve];
      t.r_for_factor = r_for_factor;
      t.r_back_factor = r_back_factor;
      t.r_k_factor = r_k_factor;
      t.no_flow = no_flow;
      t.no_back_flow = no_back_flow;
  }
}
