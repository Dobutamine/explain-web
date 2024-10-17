import { BaseModelClass } from "./BaseModelClass";

export class Heart extends BaseModelClass {
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.heart_rate_ref = 110.0; // reference heart rate (beats/minute)
    this.pq_time = 0.1; // pq time (s)
    this.qrs_time = 0.075; // qrs time (s)
    this.qt_time = 0.25; // qt time (s)
    this.av_delay = 0.0005; // delay in the AV-node (s)

    this.hr_ans_factor = 1.0; // heart rate factor of the autonomic nervous system
    this.hr_mob_factor = 1.0; // heart rate factor of the myocardial oxygen balance model
    this.hr_temp_factor = 1.0; // heart rate factor of temperature (not implemented yet)
    this.hr_drug_factor = 1.0; // heart rate factor of the drug model (not implemented yet)
    this.ans_activity_factor = 1.0; // global activity factor of the autonomic nervous system

    // initialize dependent properties
    this.heart_rate = 120.0; // calculated heart rate (beats/minute)
    this.ncc_ventricular = 0; // ventricular contraction counter
    this.ncc_atrial = 0; // atrial contraction counter
    this.cardiac_cycle_running = 0; // signal whether or not the cardiac cycle is running (0 = not, 1 = running)
    this.cardiac_cycle_time = 0.353; // cardiac cycle time (s)

    // local properties
    this._kn = 0.579; // constant of the activation curve
    this._prev_cardiac_cycle_running = 0;
    this._temp_cardiac_cycle_time = 0.0;
    this._sa_node_interval = 1.0;
    this._sa_node_timer = 0.0;
    this._av_delay_timer = 0.0;
    this._pq_timer = 0.0;
    this._pq_running = false;
    this._av_delay_running = false;
    this._qrs_timer = 0.0;
    this._qrs_running = false;
    this._ventricle_is_refractory = false;
    this._qt_timer = 0.0;
    this._qt_running = false;
    this._la = null;
    this._lv = null;
    this._ra = null;
    this._rv = null;
    this._coronaries = null;
  }

  init_model(args = {}) {
    // set the properties of this model
    Object.keys(args).forEach((key) => {
      this[key] = args[key];
    });

    // get a reference to the heart component models
    this._la = this._model_engine.models["LA"];
    this._lv = this._model_engine.models["LV"];
    this._ra = this._model_engine.models["RA"];
    this._rv = this._model_engine.models["RV"];
    this._coronaries = this._model_engine.models["COR"];

    // flag that the model is initialized
    this._is_initialized = true;
  }

  calc_model() {
    // store the previous cardiac cycle state
    this._prev_cardiac_cycle_running = this.cardiac_cycle_running;

    // calculate heart rate from the reference value and influencing factors
    this.heart_rate =
      this.heart_rate_ref +
      (this.hr_ans_factor - 1.0) *
        this.heart_rate_ref *
        this.ans_activity_factor +
      (this.hr_mob_factor - 1.0) * this.heart_rate_ref +
      (this.hr_temp_factor - 1.0) * this.heart_rate_ref +
      (this.hr_drug_factor - 1.0) * this.heart_rate_ref;

    // calculate qtc time depending on heart rate
    this.cqt_time = this.calc_qtc(this.heart_rate);

    // calculate the sinus node interval (in seconds) based on heart rate
    this._sa_node_interval = 60.0 / this.heart_rate;

    // sinus node period check
    if (this._sa_node_timer > this._sa_node_interval) {
      this._sa_node_timer = 0.0; // reset the timer
      this._pq_running = true; // start the pq-time
      this.ncc_atrial = -1; // reset atrial activation counter
      this.cardiac_cycle_running = 1; // cardiac cycle starts
      this._temp_cardiac_cycle_time = 0.0; // reset cardiac cycle time
    }

    // pq time period check
    if (this._pq_timer > this.pq_time) {
      this._pq_timer = 0.0;
      this._pq_running = false;
      this._av_delay_running = true; // start av-delay
    }

    // av delay period check
    if (this._av_delay_timer > this.av_delay) {
      this._av_delay_timer = 0.0;
      this._av_delay_running = false;

      if (!this._ventricle_is_refractory) {
        this._qrs_running = true; // start qrs
        this.ncc_ventricular = -1; // reset ventricular activation
      }
    }

    // qrs time period check
    if (this._qrs_timer > this.qrs_time) {
      this._qrs_timer = 0.0;
      this._qrs_running = false;
      this._qt_running = true; // start qt
      this._ventricle_is_refractory = true;
    }

    // qt time period check
    if (this._qt_timer > this.cqt_time) {
      this._qt_timer = 0.0;
      this._qt_running = false;
      this._ventricle_is_refractory = false; // ventricles leave refractory state
      this.cardiac_cycle_running = 0; // end of cardiac cycle
      this.cardiac_cycle_time = this._temp_cardiac_cycle_time;
    }

    // increment timers with the model's time step
    this._sa_node_timer += this._t;

    if (this.cardiac_cycle_running === 1) {
      this._temp_cardiac_cycle_time += this._t;
    }

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

    // increase heart activation function counters
    this.ncc_atrial += 1;
    this.ncc_ventricular += 1;

    // calculate the varying elastance factor
    this.calc_varying_elastance();
  }

  calc_varying_elastance() {
    // calculate atrial activation factor
    let _atrial_duration = this.pq_time / this._t;
    if (this.ncc_atrial >= 0 && this.ncc_atrial < _atrial_duration) {
      this.aaf = Math.sin(Math.PI * (this.ncc_atrial / _atrial_duration));
    } else {
      this.aaf = 0.0;
    }

    // calculate ventricular activation factor
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
    this._coronaries.act_factor = this.vaf;
  }

  calc_qtc(hr) {
    if (hr > 10.0) {
      // Bazett's formula
      return this.qt_time * Math.sqrt(60.0 / hr);
    } else {
      return this.qt_time * 2.449;
    }
  }
}
