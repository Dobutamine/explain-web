import { BaseModelClass } from "./BaseModelClass";
import { BloodResistor } from "../component_models/BloodResistor";
import { HeartValve } from "../component_models/HeartValve"

export class BloodTimeVaryingElastance extends BaseModelClass {
  // static properties
  static model_type = "BloodTimeVaryingElastance";
  model_interface = [];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.u_vol = 0.0; // unstressed volume UV of the capacitance in (L)
    this.el_min = 0.0; // minimal elastance Emin in (mmHg/L)
    this.el_max = 0.0; // maximal elastance emax(n) in (mmHg/L)
    this.el_k = 0.0; // non-linear elastance factor K2 of the capacitance (unitless)
    this.pres_ext = 0.0; // external pressure p2(t) in mmHg
    this.pres_cc = 0.0; // external pressure from chest compressions (mmHg)
    this.pres_mus = 0.0; // external pressure from outside muscles (mmHg)
    this.temp = 0.0; // blood temperature (dgs C)
    this.viscosity = 6.0; // blood viscosity (centiPoise = Pa * s)
    this.solutes = {}; // dictionary holding all solutes
    this.drugs = {}; // dictionary holding all drug concentrations
    this.outputs = {};

    // general factors
    this.act_factor = 0.0; // activation factor from the heart model (unitless)
    this.ans_activity_factor = 1.0;

    // unstressed volume factors
    this.u_vol_factor = 1.0;
    this.u_vol_circ_factor = 1.0;
    this.u_vol_ans_factor = 1.0;
    this.u_vol_drug_factor = 1.0;

    // elastance factors
    this.el_min_factor = 1.0;
    this.el_min_circ_factor = 1.0;
    this.el_min_ans_factor = 1.0;
    this.el_min_drug_factor = 1.0;
    this.el_min_mob_factor = 1.0;
    this.el_max_factor = 1.0;
    this.el_max_circ_factor = 1.0;
    this.el_max_ans_factor = 1.0;
    this.el_max_drug_factor = 1.0;
    this.el_max_mob_factor = 1.0;

    // non-linear elastance factors
    this.el_k_factor = 1.0;
    this.el_k_circ_factor = 1.0;
    this.el_k_ans_factor = 1.0;
    this.el_k_drug_factor = 1.0;

    // initialize dependent properties
    this.vol = 0.0; // volume v(t) (L)
    this.pres = 0.0; // pressure p1(t) (mmHg)
    this.pres_in = 0.0; // pressure compared to atmospheric pressure
    this.to2 = 0.0; // total oxygen concentration (mmol/l)
    this.tco2 = 0.0; // total carbon dioxide concentration (mmol/l)
    this.ph = 0.0; // ph
    this.pco2 = 0.0; // pco2 (mmHg)
    this.po2 = 0.0; // po2 (mmHg)
    this.so2 = 0.0; // o2 saturation
    this.hco3 = 0.0; // bicarbonate concentration (mmol/l)
    this.be = 0.0; // base excess (mmol/l)

    // local properties
    this._u_vol = 0.0; // unstressed volume (L)
    this._el_min = 0.0; // minimal elastance (mmHg/L)
    this._el_max = 0.0; // maximal elastance (mmHg/L)
    this._el_k = 0.0; // non-linear elastance factor (unitless)
  }

  calc_model() {
    // calculate the elastances
    this.calc_elastances();
    // calculate the volumes
    this.calc_volumes();
    // calculate the pressure
    this.calc_pressure();
  }

  // override the elastance calculation
  calc_elastances() {    
        // Incorporate the other factors
        this._el_min =
          this.el_min +
          (this.el_min_factor - 1) * this.el_min +
          (this.el_min_circ_factor - 1) * this.el_min +
          (this.el_min_ans_factor - 1) * this.el_min * this.ans_activity_factor +
          (this.el_min_mob_factor - 1) * this.el_min +
          (this.el_min_drug_factor - 1) * this.el_min;
    
          this._el_max =
          this.el_max +
          (this.el_max_factor - 1) * this.el_max +
          (this.el_max_circ_factor - 1) * this.el_max +
          (this.el_max_ans_factor - 1) * this.el_max * this.ans_activity_factor +
          (this.el_max_mob_factor - 1) * this.el_max +
          (this.el_max_drug_factor - 1) * this.el_max;
    
          this._el_k =
          this.el_k +
          (this.el_k_factor - 1) * this.el_k +
          (this.el_k_circ_factor - 1) * this.el_k +
          (this.el_k_ans_factor - 1) * this.el_k * this.ans_activity_factor +
          (this.el_k_drug_factor - 1) * this.el_k;
  }

  // override the unstressed volume calculation
  calc_volumes() {
    this._u_vol =
      this.u_vol +
      (this.u_vol_factor - 1) * this.u_vol +
      (this.u_vol_circ_factor - 1) * this.u_vol +
      (this.u_vol_ans_factor - 1) * this.u_vol * this.ans_activity_factor +
      (this.u_vol_drug_factor - 1) * this.u_vol;
  }

  // override the pressure calculation
  calc_pressure() {
    // calculate the recoil pressure of the time-varying elastance
    let p_ms = (this.vol - this._u_vol) * this._el_max;
    let p_ed = this._el_k * Math.pow(this.vol - this._u_vol, 2) + this._el_min * (this.vol - this._u_vol);

    // calculate the current recoil pressure
    this.pres_in = (p_ms - p_ed) * this.act_factor + p_ed;

    // calculate the total pressure by incorporating the external pressures
    this.pres = this.pres_in + this.pres_ext + this.pres_cc + this.pres_mus;

    // reset the external pressure
    this.pres_ext = 0.0;
    this.pres_cc = 0.0;
    this.pres_mus = 0.0;
  }

  // override the volume_in method
  volume_in(dvol, comp_from) {
    // add volume to the capacitance
    this.vol += dvol;

    // return if the volume is zero or lower
    if (this.vol <= 0.0) return;

    // process the gases
    this.to2 += ((comp_from.to2 - this.to2) * dvol) / this.vol;
    this.tco2 += ((comp_from.tco2 - this.tco2) * dvol) / this.vol;

    // process the solutes
    Object.keys(this.solutes).forEach((solute) => {
      this.solutes[solute] +=
        ((comp_from.solutes[solute] - this.solutes[solute]) * dvol) / this.vol;
    });
  }

  volume_out(dvol) {
    // remove volume from capacitance
    this.vol -= dvol;

    // return if the volume is zero or lower
    if (this.vol < 0.0) {
      let _vol_not_removed = -this.vol;
      this.vol = 0.0;
      return _vol_not_removed;
    }

    // return zero as all volume is removed
    return 0.0;
  }
}
