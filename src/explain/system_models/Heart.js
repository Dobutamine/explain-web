import { BaseModelClass } from "../base_models/BaseModelClass";

export class Heart extends BaseModelClass {
  // static properties
  static model_type = "Heart";
  static model_interface = [
    {
      caption: "reference heart rate (bpm)",
      target: "heart_rate_ref",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0,
    },
    {
      caption: "pq time (s)",
      target: "pq_time",
      type: "number",
      delta: 0.001,
      factor: 1.0,
      rounding: 3,
    },
    {
      caption: "qrs time (s)",
      target: "qrs_time",
      type: "number",
      delta: 0.001,
      factor: 1.0,
      rounding: 3,
    },
    {
      caption: "qt time (s)",
      target: "qt_time",
      type: "number",
      delta: 0.001,
      factor: 1.0,
      rounding: 3,
    },
    {
      caption: "av delay time (s)",
      target: "av_delay",
      type: "number",
      delta: 0.0001,
      factor: 1.0,
      rounding: 4,
    },

  ];

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
    this.cardiac_cycle_state = 0;

    this.ecg_signal = 0.0; // ecg signal (mV)
    this.ncc_ventricular = 0; // ventricular contraction counter
    this.ncc_atrial = 0; // atrial contraction counter
    this.cardiac_cycle_running = 0; // signal whether or not the cardiac cycle is running (0 = not, 1 = running)
    this.cardiac_cycle_time = 0.353; // cardiac cycle time (s)

    this.lv_edv = 0.0
    this.lv_esv = 0.0
    this.lv_edp = 0.0
    this.lv_esp = 0.0
    this.lv_sp = 0.0
    this.lv_sv = 0.0
    this.lv_ef = 0.0

    this.rv_edv = 0.0
    this.rv_esv = 0.0
    this.rv_edp = 0.0
    this.rv_esp = 0.0
    this.rv_sp = 0.0
    this.rv_sv = 0.0
    this.rv_ef = 0.0

    this.ra_edv = 0.0
    this.ra_esv = 0.0
    this.ra_edp = 0.0
    this.ra_esp = 0.0
    this.ra_sp = 0.0

    this.la_edv = 0.0
    this.la_esv = 0.0
    this.la_edp = 0.0
    this.la_esp = 0.0
    this.la_sp = 0.0


    // local properties
    this._kn = 0.579; // constant of the activation curve
    this._prev_cardiac_cycle_running = 0;
    this._prev_cardiac_cycle_state = 0;
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
    this._la_lv = null;
    this._lv_aa = null;
    this._ra_rv = null;
    this._coronaries = null;

    this._systole_running = false
    this._diastole_running = false

    this._prev_la_lv_flow = 0.0
    this._prev_lv_aa_flow = 0.0

  }

  analyze() {
    // state going from diastole to systole (end_diastolic)
    if (this._prev_cardiac_cycle_state === 0 && this.cardiac_cycle_state === 1) {
      this.lv_edv = this._lv.vol
      this.lv_edp = this._lv.pres_in
      
      this.rv_edv = this._rv.vol
      this.rv_edp = this._rv.pres_in

    }

    // state going from systole to diastole (end systolic)
    if (this._prev_cardiac_cycle_state === 1 && this.cardiac_cycle_state === 0) {
      this.lv_esv = this._lv.vol
      this.lv_esp = this._lv.pres_in

      this.la_esv = this._la.vol
      this.la_esp = this._la.pres_in
      
      this.rv_esv = this._rv.vol
      this.rv_esp = this._rv.pres_in
      
      this.ra_esv = this._ra.vol
      this.ra_esp = this._ra.pres_in
    }

    // state going from diastole to systole (end diastolic)
    if (this._prev_cardiac_cycle_state === 0 && this.cardiac_cycle_state === 1) {
      this.lv_edv = this._lv.vol
      this.lv_esp = this._lv.pres_in

      this.la_edv = this._la.vol
      this.la_esp = this._la.pres_in
      
      this.rv_edv = this._rv.vol
      this.rv_esp = this._rv.pres_in
      
      this.ra_edv = this._ra.vol
      this.ra_esp = this._ra.pres_in

      // store the other parameters
      this.lv_sv = this.lv_edv - this.lv_esv
      this.rv_sv = this.rv_edv - this.lv_edv
      this.lv_ef = this.lv_sv / this.lv_edv
      this.rv_ef = this.rv_sv / this.rv_edv
    }
  }

  calc_model() {
    // get a reference to the heart component models
    this._la = this._model_engine.models["LA"];
    this._lv = this._model_engine.models["LV"];
    this._ra = this._model_engine.models["RA"];
    this._rv = this._model_engine.models["RV"];
    this._la_lv = this._model_engine.models["LA_LV"]
    this._ra_rv = this._model_engine.models["RA_RV"]
    this._lv_aa = this._model_engine.models["LV_AA"]
    this._coronaries = this._model_engine.models["COR"];

        
    // store the previous cardiac cycle state
    this._prev_cardiac_cycle_running = this.cardiac_cycle_running;

    // store the previous state
    this._prev_cardiac_cycle_state = this.cardiac_cycle_state

    // when then mitral valve closes the systole starts
    if (this._prev_la_lv_flow > 0.0 && this._la_lv.flow <= 0.0) {
      // mitral valve closes so the systole starts
      this._systole_running = true
    }
    // store the previous flow
    this._prev_la_lv_flow = this._la_lv.flow

    if (this._systole_running) {
      // check whether the aortic valve closes
      if (this._prev_lv_aa_flow > 0.0 && this._lv_aa.flow <= 0.0) {
        // aortic valve closes so the systole ends
        this._systole_running = false
      }
    }
    // store the previous flow
    this._prev_lv_aa_flow = this._lv_aa.flow

    // set the cardiac cycle
    if (this._systole_running) {
      this.cardiac_cycle_state = 1
      this._diastole_running = false
    } else {
      this.cardiac_cycle_state = 0
      this._diastole_running = true
    }

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

    // analyze current state
    this.analyze()
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
