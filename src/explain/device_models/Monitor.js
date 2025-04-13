import { BaseModelClass } from "../base_models/BaseModelClass.js";

export class Monitor extends BaseModelClass {
  // static properties
  static model_type = "Monitor";
  static model_interface = [];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // Independent properties
    this.hr_avg_beats = 5.0; // the number of beats for averaging the heartrate
    this.rr_avg_time = 20.0; // averaging time of the respiratory rate
    this.sat_avg_time = 5.0; // averaging time of the pulse oximeter
    this.sat_sampling_interval = 1.0;
    this.heart = "Heart"; // name of the heart model
    this.lv = "LV"; // name of the left ventricla
    this.rv = "RV"; // name of the right ventricle
    this.ascending_aorta = "AA"; // name of the ascending aorta
    this.descending_aorta = "AD"; // name of the descending aorta
    this.pulm_artery = "PA"; // name of the descending aorta
    this.right_atrium = "RA"; // name of the right atrium model
    this.breathing = "Breathing"; // name of the spontanenous breathing model
    this.ventilator = "Ventilator"; // name of the mechanical ventilator model
    this.aortic_valve = "LV_AA"; // name of the aortic valve
    this.pulm_valve = "RV_PA"; // name of the pulmonary valve
    this.cor_ra = "COR_RA"; // name of the connector connecting the coronaries to the right atrium
    this.aa_brain = "AA_BR"; // name of the connector connecting the aorta to the brain
    this.ad_kid = "AD_KID"; // name of the connector connecting the descending aorta to the kidneys
    this.ivc_ra = "IVCI_RA"; // name of the connector connecting the inferior vena cava to the right atrium
    this.svc_ra = "SVC_RA"; // name of the connector connecting the superior vena cava to the right atrium
    this.thorax = "THORAX"; // name of the thorax model
    this.deadspace = "DS"; // name of the dead space airway model
    this.fo = "FO"; // name of the foramen ovale
    this.da = "DA_OUT"; // name of the ductus arteriosus
    this.vsd = "VSD"; // name of the ventricular septal defect
    this.ips = "IPS"; // name of the intrapulmonary shunt

    // Dependent properties
    this.heart_rate = 0.0; // heartrate (bpm)
    this.resp_rate = 0.0; // respiratory rate in (/min)
    this.abp_syst = 0.0; // arterial blood pressure systole (mmHg)
    this.abp_diast = 0.0; // arterial blood pressure diastole (mmHg)
    this.abp_mean = 0.0; // arterial blood pressure mean (mmHg)
    this.abp_pre_syst = 0.0; // arterial blood pressure systole (mmHg)
    this.abp_pre_diast = 0.0; // arterial blood pressure diastole (mmHg)
    this.abp_pre_mean = 0.0; // arterial blood pressure mean (mmHg)
    this.pap_syst = 0.0; // pulmonary artery pressure systole (mmHg)
    this.pap_diast = 0.0; // pulmonary artery pressure diastole (mmHg)
    this.pap_mean = 0.0; // pulmonary artery pressure mean (mmHg)
    this.edv_lv = 0.0; // left ventricular end diastolic volume
    this.esv_lv = 0.0; // left ventricular end systolic volume
    this.edp_lv = 0.0; // left ventricular end diastolic pressure
    this.esp_lv = 0.0; // left ventricular end systolic pressure
    this.edv_rv = 0.0; // left ventricular end diastolic volume
    this.esv_rv = 0.0; // left ventricular end systolic volume
    this.edp_rv = 0.0; // left ventricular end diastolic pressure
    this.esp_rv = 0.0; // left ventricular end systolic pressure
    this.cvp = 0.0; // central venous pressure (mmHg)
    this.spo2 = 0.0; // arterial oxygen saturation in descending aorta (%)
    this.spo2_pre = 0.0; // arterial oxygen saturation in ascending aorta (%)
    this.spo2_ven = 0.0; // venous oxygen saturation in right atrium (%)
    this.etco2 = 0.0; // end tidal partial pressure of carbon dioxide (kPa)
    this.temp = 0.0; // blood temperature (dgs C)
    this.co = 0.0; // cardiac output (l/min)
    this.ci = 0.0; // cardiac index (l/min/m2)
    this.lvo = 0.0; // left ventricular output (l/min)
    this.rvo = 0.0; // right ventricular output (l/min)
    this.lv_sv = 0.0; // left ventricular stroke volume (ml)
    this.rv_sv = 0.0; // right ventricular stroke volume (ml)
    this.ivc_flow = 0.0; // inferior vena cava flow (l/min)
    this.svc_flow = 0.0; // superior vena cava flow (l/min)
    this.cor_flow = 0.0; // coronary flow (l/min)
    this.brain_flow = 0.0; // brain flow (l/min)
    this.kid_flow = 0.0; // kidney flow (l/min)
    this.da_flow = 0.0; // ductus arteriosus flow (l/min)
    this.fo_flow = 0.0; // foramen ovale flow (l/min)
    this.vsd_flow = 0.0; // vsd flow (l/min)
    this.ips_flow = 0.0; // ips flow (l/min)
    this.fio2 = 0.0; // inspired fraction of oxygen
    this.pip = 0.0; // peak inspiratory pressure (cmH2O)
    this.p_plat = 0.0; // plateau inspiratory pressure (cmH2O)
    this.peep = 0.0; // positive end expiratory pressure (cmH2O)
    this.tidal_volume = 0.0; // tidal volume (l)
    this.ph = 0.0; // arterial ph
    this.po2 = 0.0; // arterial po2 (kPa)
    this.pco2 = 0.0; // arterial pco2 (kPa)
    this.hco3 = 0.0; // arterial bicarbonate concentration (mmol/l)
    this.be = 0.0; // arterial base excess concentration (mmol/l)
    this.dps = 0.0; //

    // signals
    this.ecg_signal = 0.0; // ecg signal
    this.abp_signal = 0.0; // abp signal
    this.pap_signal = 0.0; // pap signal
    this.cvp_signal = 0.0; // cvp signal
    this.spo2_pre_signal = 0.0; // pulse-oximeter signal
    this.spo2_signal = 0.0; // pulse-oximeter signal
    this.resp_signal = 0.0; // respiratory signal
    this.co2_signal = 0.0; // co2 signal

    // local properties
    this._heart = null; // reference to the heart model
    this._lv = null; // reference to the left ventricular model
    this._rv = null; // reference to the right ventricular model
    this._breathing = null; // reference to the breathing model
    this._ventilator = null; // reference to the mechanical ventilator model
    this._aa = null; // reference to the ascending aorta
    this._ad = null; // reference to the descending aorta
    this._ra = null; // reference to the right atrium
    this._pa = null; // reference to the pulmonary artery
    this._ds = null; // reference to the upper airway deadspace
    this._thorax = null; // reference to the thorax
    this._lv_aa = null; // reference to the aortic valve
    this._rv_pa = null; // reference to the pulmonary valve
    this._ivc_ra = null; // reference to the inferior cava to right atrium connector
    this._svc_ra = null; // reference to the superior cava to right atrium connector
    this._cor_ra = null; // reference to the coronaries to right atrium connector
    this._aa_br = null; // reference to the ascending aorta to brain connector
    this._ad_kid = null; // reference to the descending aorta to kidneys connector
    this._fo = null; // reference to the foramen ovale
    this._da = null; // reference to the ductus arteriosus
    this._vsd = null; // reference to the ventricular septal defect
    this._ips = null; // reference to the intrapulmonary shunt

    this._temp_aa_pres_max = -1000.0;
    this._temp_aa_pres_min = 1000.0;
    this._temp_ad_pres_max = -1000.0;
    this._temp_ad_pres_min = 1000.0;
    this._temp_ra_pres_max = -1000.0;
    this._temp_ra_pres_min = 1000.0;
    this._temp_pa_pres_max = -1000.0;
    this._temp_pa_pres_min = 1000.0;
    this._temp_lv_pres_max = -1000.0;
    this._temp_lv_pres_min = 1000.0;
    this._temp_rv_pres_max = -1000.0;
    this._temp_rv_pres_min = 1000.0;
    this._temp_lv_vol_max = -1000.0;
    this._temp_lv_vol_min = 1000.0;
    this._temp_rv_vol_max = -1000.0;
    this._temp_rv_vol_min = 1000.0;
    this._lvo_counter = 0.0;
    this._rvo_counter = 0.0;
    this._cor_flow_counter = 0.0;
    this._ivc_flow_counter = 0.0;
    this._svc_flow_counter = 0.0;
    this._brain_flow_counter = 0.0;
    this._kid_flow_counter = 0.0;
    this._da_flow_counter = 0.0;
    this._fo_flow_counter = 0.0;
    this._vsd_flow_counter = 0.0;
    this._ips_flow_counter = 0.0;
    this._hr_list = [];
    this._edv_lv_list = [];
    this._edv_rv_list = [];
    this._esv_lv_list = [];
    this._esv_rv_list = [];
    this._edp_lv_list = [];
    this._edp_rv_list = [];
    this._rr_list = [];
    this._spo2_list = [];
    this._spo2_pre_list = [];
    this._spo2_ven_list = [];
    this._rr_avg_counter = 0.0;
    this._sat_avg_counter = 0.0;
    this._sat_sampling_counter = 0.0;
    this._beats_counter = 0;
    this._beats_time = 0.0;
  }

  init_model(args = {}) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // get the references to the models
    this._heart = this._model_engine.models[this.heart] ?? null;
    this._lv = this._model_engine.models[this.lv] ?? null;
    this._rv = this._model_engine.models[this.rv] ?? null;
    this._ra = this._model_engine.models[this.right_atrium] ?? null;
    this._breathing = this._model_engine.models[this.breathing] ?? null;
    this._ventilator = this._model_engine.models[this.ventilator] ?? null;
    this._ds = this._model_engine.models[this.deadspace] ?? null;
    this._thorax = this._model_engine.models[this.thorax] ?? null;
    this._aa = this._model_engine.models[this.ascending_aorta] ?? null;
    this._ad = this._model_engine.models[this.descending_aorta] ?? null;
    this._pa = this._model_engine.models[this.pulm_artery] ?? null;
    this._lv_aa = this._model_engine.models[this.aortic_valve] ?? null;
    this._rv_pa = this._model_engine.models[this.pulm_valve] ?? null;
    this._ivc_ra = this._model_engine.models[this.ivc_ra] ?? null;
    this._svc_ra = this._model_engine.models[this.svc_ra] ?? null;
    this._cor_ra = this._model_engine.models[this.cor_ra] ?? null;
    this._aa_br = this._model_engine.models[this.aa_brain] ?? null;
    this._ad_kid = this._model_engine.models[this.ad_kid] ?? null;
    this._da = this._model_engine.models[this.da] ?? null;
    this._fo = this._model_engine.models[this.fo] ?? null;
    this._vsd = this._model_engine.models[this.vsd] ?? null;
    this._ips = this._model_engine.models[this.ips] ?? null;

    // flag that the model is initialized
    this._is_initialized = true;
  }

  calc_model() {
    // collect the pressure
    this.collect_pressures();

    // collect flows
    this.collect_blood_flows();

    // collect signals
    this.collect_signals();

    // collect temperature
    this.temp = this._aa.temp;

    // collect end tidal pco2
    this.etco2 = this._ventilator.etco2;

    // determine the begin of the cardiac cycle
    if (this._heart.ncc_ventricular === 1) {
      // heart rate determination
      this._hr_list.push(this._heart.heart_rate);
      // get the rolling average of the heartrate
      this.heart_rate = this._hr_list.reduce((acc, val) => acc + val, 0) / this._hr_list.length;
      if (this._hr_list.length > this.hr_avg_beats) {
        this._hr_list.shift();
      }
      // add 1 beat
      this._beats_counter += 1;

      // blood pressures
      if (this._aa) {
        this.abp_pre_syst = this._temp_aa_pres_max;
        this.abp_pre_diast = this._temp_aa_pres_min;
        this.abp_pre_mean =
          (2 * this._temp_aa_pres_min + this._temp_aa_pres_max) / 3.0;
        this._temp_aa_pres_max = -1000.0;
        this._temp_aa_pres_min = 1000.0;
      }
      if (this._ad) {
        this.abp_syst = this._temp_ad_pres_max;
        this.abp_diast = this._temp_ad_pres_min;
        this.abp_mean =
          (2 * this._temp_ad_pres_min + this._temp_ad_pres_max) / 3.0;
        this._temp_ad_pres_max = -1000.0;
        this._temp_ad_pres_min = 1000.0;
      }
      if (this._ra) {
        this.cvp = (2 * this._temp_ra_pres_min + this._temp_ra_pres_max) / 3.0;
        this._temp_ra_pres_max = -1000.0;
        this._temp_ra_pres_min = 1000.0;
      }
      if (this._pa) {
        this.pap_syst = this._temp_pa_pres_max;
        this.pap_diast = this._temp_pa_pres_min;
        this.pap_mean =
          (2 * this._temp_pa_pres_min + this._temp_pa_pres_max) / 3.0;
        this._temp_pa_pres_max = -1000.0;
        this._temp_pa_pres_min = 1000.0;
      }
      if (this._lv) {
        this._edv_lv_list.push(this._temp_lv_vol_max * 1000.0);
        this._edv_rv_list.push(this._temp_rv_vol_max * 1000.0);

        this._esv_lv_list.push(this._temp_lv_vol_min * 1000.0);
        this._esv_rv_list.push(this._temp_rv_vol_min * 1000.0);

        // get the rolling averages
        this.edv_lv = this._edv_lv_list.reduce((acc, val) => acc + val, 0) / this._edv_lv_list.length;
        this.edv_rv = this._edv_rv_list.reduce((acc, val) => acc + val, 0) / this._edv_rv_list.length;

        this.esv_lv = this._esv_lv_list.reduce((acc, val) => acc + val, 0) / this._esv_lv_list.length;
        this.esv_rv = this._esv_rv_list.reduce((acc, val) => acc + val, 0) / this._esv_rv_list.length;

        if (this._edv_lv_list.length > this.hr_avg_beats) {
          this._edv_lv_list.shift();
          this._edv_rv_list.shift();
          this._esv_lv_list.shift();
          this._esv_rv_list.shift();
        }

        this.edp_lv = this._temp_lv_pres_min;
        this.esp_lv = this._temp_lv_pres_max;
        this.edp_rv = this._temp_rv_pres_min;
        this.esp_rv = this._temp_rv_pres_max;

        // reset pressures
        this._temp_lv_pres_max = -1000
        this._temp_lv_pres_min = 1000
        this._temp_rv_pres_max = -1000
        this._temp_rv_pres_min = 1000

        // reset the volumes
        this._temp_lv_vol_max = -1000
        this._temp_lv_vol_min = 1000
        this._temp_rv_vol_max = -1000
        this._temp_rv_vol_min = 1000

      }
    }

    // cardiac outputs
    if (this._beats_counter > this.hr_avg_beats) {
      if (this._lv_aa) {
        this.lvo = (this._lvo_counter / this._beats_time) * 60.0;
        this._lvo_counter = 0.0;
      }
      if (this._rv_pa) {
        this.rvo = (this._rvo_counter / this._beats_time) * 60.0;
        this._rvo_counter = 0.0;
      }
      if (this._ivc_ra) {
        this.ivc_flow = (this._ivc_flow_counter / this._beats_time) * 60.0;
        this._ivc_flow_counter = 0.0;
      }
      if (this._svc_ra) {
        this.svc_flow = (this._svc_flow_counter / this._beats_time) * 60.0;
        this._svc_flow_counter = 0.0;
      }
      if (this._cor_ra) {
        this.cor_flow = (this._cor_flow_counter / this._beats_time) * 60.0;
        this._cor_flow_counter = 0.0;
      }
      if (this._aa_br) {
        this.brain_flow = (this._brain_flow_counter / this._beats_time) * 60.0;
        this._brain_flow_counter = 0.0;
      }
      if (this._ad_kid) {
        this.kid_flow = (this._kid_flow_counter / this._beats_time) * 60.0;
        this._kid_flow_counter = 0.0;
      }

      if (this._da) {
        this.da_flow = (this._da_flow_counter / this._beats_time) * 60.0;
        this._da_flow_counter = 0.0;
      }

      if (this._fo) {
        this.fo_flow = (this._fo_flow_counter / this._beats_time) * 60.0;
        this._fo_flow_counter = 0.0;
      }

      if (this._vsd) {
        this.vsd_flow = (this._vsd_flow_counter / this._beats_time) * 60.0;
        this._vsd_flow_counter = 0.0;
      }

      if (this._ips) {
        this.ips_flow = (this._ips_flow_counter / this._beats_time) * 60.0;
        this._ips_flow_counter = 0.0;
      }
      // reset the counters
      this._beats_counter = 0;
      this._beats_time = 0.0;
    }
    this._beats_time += this._t;

    // respiratory rate (rolling average over rr_avg_time seconds)
    this._rr_avg_counter += this._t;
    if (this._rr_avg_counter > this.rr_avg_time) {
      this._rr_list.shift();
    }
    if (this._breathing.ncc_insp === 1) {
      this._rr_list.push(this._breathing.resp_rate);
      // get the rolling average of the resprate
      this.resp_rate =
        this._rr_list.reduce((acc, val) => acc + val, 0) / this._rr_list.length;
    }

    // saturation
    this.spo2 = this._ad.so2
    this.spo2_pre = this._aa.so2
    this.spo2_ven = this._ra.so2

    // this._sat_avg_counter += this._t;
    // if (this._sat_avg_counter > this.sat_avg_time) {
    //   this._sat_avg_counter = 0.0;

    //   this._spo2_list.shift();
    //   this._spo2_pre_list.shift();
    //   this._spo2_ven_list.shift();
    // }

    // this._sat_sampling_counter += this._t;
    // if (this._sat_sampling_counter >= this.sat_sampling_interval) {
    //   this._sat_sampling_counter = 0.0;

    //   this._spo2_list.push(this._ad.so2);
    //   this._spo2_pre_list.push(this._aa.so2);
    //   this._spo2_ven_list.push(this._ra.so2);

    //   this.spo2 = this._spo2_list.reduce((acc, val) => acc + val, 0) / this._spo2_list.length;
    //   this.spo2_pre = this._spo2_pre_list.reduce((acc, val) => acc + val, 0) / this._spo2_pre_list.length;
    //   this.spo2_ven = this._spo2_ven_list.reduce((acc, val) => acc + val, 0) / this._spo2_ven_list.length;
    // }


  }
  collect_signals() {
    this.ecg_signal = this._heart ? this._heart.ecg_signal : 0.0;
    this.resp_signal = this._thorax ? this._thorax.vol : 0.0;
    this.spo2_pre_signal = this._aa ? this._aa.pres_in : 0.0;
    this.spo2_signal = this._ad ? this._ad.pres_in : 0.0;
    this.abp_signal = this._ad ? this._ad.pres_in : 0.0;
    this.pap_signal = this._pa ? this._pa.pres_in : 0.0;
    this.cvp_signal = this._ra ? this._ra.pres_in : 0.0;
    this.co2_signal = this._ventilator ? this._ventilator.co2 : 0.0;
  }

  collect_pressures() {
    this._temp_aa_pres_max = this._aa ? Math.max(this._temp_aa_pres_max, this._aa.pres_in) : -1000;
    this._temp_aa_pres_min = this._aa ? Math.min(this._temp_aa_pres_min, this._aa.pres_in) : 1000;

    this._temp_lv_pres_max = this._lv ? Math.max(this._temp_lv_pres_max, this._lv.pres_in) : -1000;
    this._temp_lv_pres_min = this._lv ? Math.min(this._temp_lv_pres_min, this._lv.pres_in) : 1000;

    this._temp_rv_pres_max = this._rv ? Math.max(this._temp_rv_pres_max, this._rv.pres_in) : -1000;
    this._temp_rv_pres_min = this._rv ? Math.min(this._temp_rv_pres_min, this._rv.pres_in) : 1000;

    this._temp_lv_vol_max = this._lv ? Math.max(this._temp_lv_vol_max, this._lv.vol) : -1000;
    this._temp_lv_vol_min = this._lv ? Math.min(this._temp_lv_vol_min, this._lv.vol) : 1000;

    this._temp_rv_vol_max = this._rv ? Math.max(this._temp_rv_vol_max, this._rv.vol) : -1000;
    this._temp_rv_vol_min = this._rv ? Math.min(this._temp_rv_vol_min, this._rv.vol) : 1000;

    this._temp_ad_pres_max = this._ad ? Math.max(this._temp_ad_pres_max, this._ad.pres_in) : -1000;
    this._temp_ad_pres_min = this._ad ? Math.min(this._temp_ad_pres_min, this._ad.pres_in) : 1000;

    this._temp_ra_pres_max = this._ra ? Math.max(this._temp_ra_pres_max, this._ra.pres_in) : -1000;
    this._temp_ra_pres_min = this._ra ? Math.min(this._temp_ra_pres_min, this._ra.pres_in) : 1000;

    this._temp_pa_pres_max = this._pa ? Math.max(this._temp_pa_pres_max, this._pa.pres_in) : -1000;
    this._temp_pa_pres_min = this._pa ? Math.min(this._temp_pa_pres_min, this._pa.pres_in) : 1000;
  }

  collect_blood_flows() {
    this._lvo_counter += this._lv_aa ? this._lv_aa.flow * this._t : 0.0;
    this._rvo_counter += this._rv_pa ? this._rv_pa.flow * this._t : 0.0;
    this._cor_flow_counter += this._cor_ra ? this._cor_ra.flow * this._t : 0.0;
    this._ivc_flow_counter += this._ivc_ra ? this._ivc_ra.flow * this._t : 0.0;
    this._svc_flow_counter += this._svc_ra ? this._svc_ra.flow * this._t : 0.0;
    this._brain_flow_counter += this._aa_br ? this._aa_br.flow * this._t : 0.0;
    this._kid_flow_counter += this._ad_kid ? this._ad_kid.flow * this._t : 0.0;
    this._da_flow_counter += this._da ? this._da.flow * this._t : 0.0;
    this._fo_flow_counter += this._fo ? this._fo.flow * this._t : 0.0;
    this._vsd_flow_counter += this._vsd ? this._vsd.flow * this._t : 0.0;
    this._ips_flow_counter += this._ips ? this._ips.flow * this._t : 0.0;
  }
}
