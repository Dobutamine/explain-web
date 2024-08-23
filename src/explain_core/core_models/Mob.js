import { set_blood_composition } from "../helpers/BloodComposition";

export class Mob {
    static model_type = "Mob";
    static model_interface = [];

    constructor(model_ref, name = "") {
        // Independent properties
        this.name = name;
        this.description = "";
        this.is_enabled = false;
        this.dependencies = [];
        this.mob_active = true;
        this.heart_model = "Heart";
        this.aa_model = "AA";
        this.aa_cor_model = "AA_COR";
        this.cor_model = "COR";
        this.ecc_c = 0.00000301;
        this.ecc_c_factor = 1;
        this.pva_c = 0.00143245;
        this.pva_c_factor = 1;
        this.pe_c = 0;
        this.pe_c_factor = 1;
        this.to2_min = 0.0002;
        this.to2_set = 0.2;
        this.to2_max = 0.2;
        this.bm_vo2_ref = 0.0007;
        this.bm_vo2_max = 0.0007;
        this.bm_vo2_min = 0.00035;
        this.bm_vo2_factor = 1;
        this.bm_vo2_tc = 5;
        this.resp_q = 0.1;
        this.hr_factor = 1;
        this.hr_factor_max = 1;
        this.hr_factor_min = 0.01;
        this.hr_tc = 5;
        this.cont_factor = 1;
        this.cont_factor_max = 1;
        this.cont_factor_min = 0.01;
        this.cont_tc = 5;
        this.ans_factor = 1;
        this.ans_factor_max = 1;
        this.ans_factor_min = 0.01;
        this.ans_tc = 5;
        this.ans_activity_factor = 1;

        // Dependent properties
        this.mob = 0.0;
        this.mvo2 = 0.0;
        this.mvo2_step = 0.0;
        this.bm = 0.0;
        this.bm_vo2 = 0.0;
        this.ecc_vo2 = 0.0;
        this.pva_vo2 = 0.0;
        this.pe_vo2 = 0.0;
        this.bm_g = 2.0;
        this.cont_g = 0.0;
        this.hr_g = 0.0;
        this.ans_g = 0.0;
        this.ecc_lv = 0.0;
        this.ecc_rv = 0.0;
        this.ecc = 0.0;
        this.pva = 0.0;
        this.pe = 0.0;
        this.stroke_work_lv = 0.0;
        this.stroke_work_rv = 0.0;
        this.stroke_volume_lv = 0.0;
        this.stroke_volume_rv = 0.0;
        this.sv_lv_kg = 0.0;
        this.sv_rv_kg = 0.0;
        this.cor_po2 = 0.0;
        this.cor_pco2 = 0.0;
        this.cor_so2 = 0.0;

        // Local properties
        this._model_engine = model_ref;
        this._is_initialized = false;
        this._t = model_ref.modeling_stepsize;
        this._heart = {};
        this._aa = {};
        this._aa_cor = {};
        this._cor = {};
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
        this._sv_lv_cum = 0.0;
        this._sv_rv_cum = 0.0;
        this._a_to2 = 0.0;
        this._d_bm_vo2 = 0.0;
        this._d_cont = 0.0;
        this._d_hr = 0.0;
        this._d_ans = 0.0;
        this._ml_to_mmol = 22.414;
    }

    init_model(args) {
      // set the values of the properties as passed in the arguments
      args.forEach((arg) => {
        this[arg["key"]] = arg["value"];
      });

        // Get references to heart and coronary models
        this._heart = this._model_engine.models[this.heart_model];
        this._aa = this._model_engine.models[this.aa_model];
        this._aa_cor = this._model_engine.models[this.aa_cor_model];
        this._cor = this._model_engine.models[this.cor_model];

        // Flag that the model is initialized
        this._is_initialized = true;
    }

    step_model() {
        if (this.is_enabled && this._is_initialized && this.mob_active) {
            this.calc_model();
        }
    }

    calc_model() {
        // Set the heart weight
        this.hw = 7.799 + 0.004296 * this._model_engine.weight * 1000.0;

        // Get the necessary model properties from the coronaries
        const to2_cor = this._cor.aboxy["to2"];
        const tco2_cor = this._cor.aboxy["tco2"];
        const vol_cor = this._cor.vol;

        // Activation function for VO2 calculation
        this.to2_max = this.to2_set;
        this._a_to2 = this.activation_function(to2_cor, this.to2_max, this.to2_set, this.to2_min);

        // Calculate various oxygen consumption values
        this.bm_vo2 = this.calc_bm(this._a_to2);
        this.ecc_vo2 = this.calc_ecc(this._a_to2);
        this.pva_vo2 = this.calc_pva(this._a_to2);
        this.pe_vo2 = this.calc_pe(this._a_to2);

        // Basal metabolism VO2 step
        const bm_vo2_step = this.bm_vo2 * this._t;

        // VO2 steps only during cardiac cycle
        let ecc_vo2_step = 0.0;
        let pva_vo2_step = 0.0;
        let pe_vo2_step = 0.0;

        if (this._heart.cardiac_cycle_time > 0.0 && this._heart.cardiac_cycle_running) {
            ecc_vo2_step = (this.ecc_vo2 / this._heart.cardiac_cycle_time) * this._t;
            pva_vo2_step = (this.pva_vo2 / this._heart.cardiac_cycle_time) * this._t;
            pe_vo2_step = (this.pe_vo2 / this._heart.cardiac_cycle_time) * this._t;
        }

        // Total VO2 in mmol O2 for the model step
        this.mvo2_step = bm_vo2_step + ecc_vo2_step + pva_vo2_step + pe_vo2_step;

        // CO2 production in the model step
        const co2_production = this.mvo2_step * this.resp_q;

        // Myocardial oxygen balance in mmol/s
        const o2_inflow = this._aa_cor.flow * this._aa.aboxy["to2"];
        const o2_use = this.mvo2_step / this._t;
        this.mob = o2_inflow - o2_use + to2_cor;

        // Update blood composition in coronary blood
        if (vol_cor > 0) {
            let new_to2_cor = (to2_cor * vol_cor - this.mvo2_step) / vol_cor;
            let new_tco2_cor = (tco2_cor * vol_cor + co2_production) / vol_cor;
            if (new_to2_cor >= 0) {
                this._cor.aboxy["to2"] = new_to2_cor;
                this._cor.aboxy["tco2"] = new_tco2_cor;
            }
        }

        // Store blood composition of coronary blood
        this.cor_po2 = this._cor.aboxy["po2"];
        this.cor_pco2 = this._cor.aboxy["pco2"];
        this.cor_so2 = this._cor.aboxy["so2"];

        // Calculate effects on heart rate, contractility, and autonomic nervous system
        this.calc_effectors(this._a_to2);
    }

    calc_bm(act) {
        // Calculate baseline VO2 in mmol O2 / cardiac cycle
        this.bm_g = (this.bm_vo2_max * this.bm_vo2_factor * this.hw - this.bm_vo2_min * this.bm_vo2_factor * this.hw) / (this.to2_max - this.to2_min);
        this._d_bm_vo2 = this._t * ((1 / this.bm_vo2_tc) * (-this._d_bm_vo2 + act)) + this._d_bm_vo2;
        let bm_vo2 = (this.bm_vo2_ref * this.bm_vo2_factor * this.hw + this._d_bm_vo2 * this.bm_g) / this._ml_to_mmol;
        if (bm_vo2 < (this.bm_vo2_min * this.bm_vo2_factor * this.hw) / this._ml_to_mmol) {
            bm_vo2 = (this.bm_vo2_min * this.bm_vo2_factor * this.hw) / this._ml_to_mmol;
        }
        return bm_vo2;
    }

    calc_ecc(act) {
        // Calculate excitation-contraction coupling in mmol O2 / cardiac cycle
        this.ecc_lv = this._heart._lv.el_max * this._heart._lv.el_max_factor;
        this.ecc_rv = this._heart._rv.el_max * this._heart._rv.el_max_factor;
        this.ecc = (this.ecc_lv + this.ecc_rv) / 1000.0;
        return (this.ecc * this.ecc_c * this.ecc_c_factor * this.hw) / this._ml_to_mmol;
    }

    calc_pe(act) {
        // Potential mechanical work stored in ventricular wall
        this.pe = 0;
        return (this.pe * this.pe_c * this.pe_c_factor * this.hw) / this._ml_to_mmol;
    }

    calc_pva(act) {
        // Calculate pressure-volume area (PVA) and update stroke work and volumes
        if (this._heart.cardiac_cycle_running && !this._heart.prev_cardiac_cycle_running) {
            set_blood_composition(this._cor);

            this.stroke_work_lv = this._pv_area_lv_dec - this._pv_area_lv_inc;
            this.stroke_work_rv = this._pv_area_rv_dec - this._pv_area_rv_inc;
            this.stroke_volume_lv = this._sv_lv_cum;
            this.stroke_volume_rv = this._sv_rv_cum;
            this.sv_lv_kg = (this.stroke_volume_lv * 1000.0) / this._model_engine.weight;
            this.sv_rv_kg = (this.stroke_volume_rv * 1000.0) / this._model_engine.weight;

            this._pv_area_lv_inc = 0.0;
            this._pv_area_rv_inc = 0.0;
            this._pv_area_lv_dec = 0.0;
            this._pv_area_rv_dec = 0.0;
            this._sv_lv_cum = 0.0;
            this._sv_rv_cum = 0.0;
        }

        // Calculate the pressure-volume area of this model step
        let _dV_lv = this._heart._lv.vol - this._prev_lv_vol;
        if (_dV_lv > 0) {
            this._sv_lv_cum += _dV_lv;
            this._pv_area_lv_inc += _dV_lv * this._prev_lv_pres + (_dV_lv * (this._heart._lv.pres - this._prev_lv_pres)) / 2.0;
        } else {
            this._pv_area_lv_dec += -_dV_lv * this._prev_lv_pres + (-_dV_lv * (this._heart._lv.pres - this._prev_lv_pres)) / 2.0;
        }

        let _dV_rv = this._heart._rv.vol - this._prev_rv_vol;
        if (_dV_rv > 0) {
            this._sv_rv_cum += _dV_rv;
            this._pv_area_rv_inc += _dV_rv * this._prev_rv_pres + (_dV_rv * (this._heart._rv.pres - this._prev_rv_pres)) / 2.0;
        } else {
            this._pv_area_rv_dec += -_dV_rv * this._prev_rv_pres + (-_dV_rv * (this._heart._rv.pres - this._prev_rv_pres)) / 2.0;
        }

        // Store current volumes and pressures
        this._prev_lv_vol = this._heart._lv.vol;
        this._prev_lv_pres = this._heart._lv.pres;
        this._prev_rv_vol = this._heart._rv.vol;
        this._prev_rv_pres = this._heart._rv.pres;

        // Return the total PVA of both ventricles
        this.pva = this.stroke_work_lv + this.stroke_work_rv;
        return (this.pva * this.pva_c * this.pva_c_factor * this.hw) / this._ml_to_mmol;
    }

    calc_effectors(act) {
        // Calculate the gain of the effectors: heart rate, contractility, and autonomic nervous system suppression
        this.hr_g = (this.hr_factor_max - this.hr_factor_min) / (this.to2_max - this.to2_min);
        this.cont_g = (this.cont_factor_max - this.cont_factor_min) / (this.to2_max - this.to2_min);
        this.ans_g = (this.ans_factor_max - this.ans_factor_min) / (this.to2_max - this.to2_min);

        // Time constants for HR, contractility, and ANS effects
        this._d_hr = this._t * ((1 / this.hr_tc) * (-this._d_hr + act)) + this._d_hr;
        this._d_cont = this._t * ((1 / this.cont_tc) * (-this._d_cont + act)) + this._d_cont;
        this._d_ans = this._t * ((1 / this.ans_tc) * (-this._d_ans + act)) + this._d_ans;

        // Calculate the autonomic nervous system activity
        this.ans_activity_factor = 1.0 + this.ans_g * this._d_ans;
        this._heart.ans_activity_factor = this.ans_activity_factor;

        // Calculate the heart rate control factor
        this.hr_factor = 1.0 + this.hr_g * this._d_hr;
        this._heart.hr_mob_factor = this.hr_factor;

        // Calculate the contractility control factor
        this.cont_factor = 1.0 + this.cont_g * this._d_cont;
        this._heart._lv.el_max_mob_factor = this.cont_factor;
        this._heart._rv.el_max_mob_factor = this.cont_factor;
        this._heart._la.el_max_mob_factor = this.cont_factor;
        this._heart._ra.el_max_mob_factor = this.cont_factor;
    }

    activation_function(value, max, setpoint, min) {
        if (value >= max) {
            return max - setpoint;
        } else if (value <= min) {
            return min - setpoint;
        } else {
            return value - setpoint;
        }
    }
}
