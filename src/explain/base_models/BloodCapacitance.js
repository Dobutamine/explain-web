import { BaseModelClass } from "./BaseModelClass";
import { BloodResistor } from "../component_models/BloodResistor"

export class BloodCapacitance extends BaseModelClass {
  // static properties
  static model_type = "BloodCapacitance";
  model_interface = [];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.u_vol = 0.0; // unstressed volume UV of the capacitance in (L)
    this.el_base = 0.0; // baseline elastance E of the capacitance in (mmHg/L)
    this.el_k = 0.0; // non-linear elastance factor K2 of the capacitance (unitless)
    this.pres_ext = 0.0; // external pressure p2(t) (mmHg)
    this.pres_cc = 0.0; // external pressure from chest compressions (mmHg)
    this.pres_mus = 0.0; // external pressure from outside muscles (mmHg)
    this.temp = 0.0; // blood temperature (dgs C)
    this.viscosity = 6.0; // blood viscosity (centiPoise = Pa * s)
    this.solutes = {}; // dictionary holding all solutes
    this.drugs = {}; // dictionary holding all drug concentrations
    this.smd = 0.0; // smooth muscle wall density between 0 - 1 where 0 = no muscle wall, 1 = maximal muscle wall
    this.outputs = {}

    // general factors
    this.ans_activity_factor = 1.0; // normalized autonomic nervous system activity factor (unitless)

    // unstressed volume factors
    this.u_vol_factor = 1.0;
    this.u_vol_circ_factor = 1.0;
    this.u_vol_ans_factor = 1.0;
    this.u_vol_drug_factor = 1.0;

    // elastance factors
    this.el_base_factor = 1.0;
    this.el_base_circ_factor = 1.0;
    this.el_base_ans_factor = 1.0;
    this.el_base_drug_factor = 1.0;

    // non-linear elastance factors
    this.el_k_factor = 1.0;
    this.el_k_circ_factor = 1.0;
    this.el_k_ans_factor = 1.0;
    this.el_k_drug_factor = 1.0;

    // initialize dependent properties
    this.vol = 0.0; // volume v(t) (L)
    this.pres = 0.0; // pressure p1(t) (mmHg)
    this.pres_in = 0.0; // recoil pressure of the elastance (mmHg)
    this.to2 = 0.0; // total oxygen concentration (mmol/l)
    this.tco2 = 0.0; // total carbon dioxide concentration (mmol/l)
    this.ph = -1.0; // ph (unitless)
    this.pco2 = -1.0; // pco2 (mmHg)
    this.po2 = -1.0; // po2 (mmHg)
    this.so2 = -1.0; // o2 saturation
    this.hco3 = -1.0; // bicarbonate concentration (mmol/l)
    this.be = -1.0; // base excess (mmol/l)

    // local variables
    this._el = 0.0
    this._u_vol = 0.0
    this._el_k = 0.0
  }

  calc_model() {
    this.calc_elastances();
    this.calc_volumes();
    this.calc_pressure();
  }

  calc_elastances() {
    this._el = this.el_base +
    (this.el_base_factor - 1) * this.el_base +
    (this.el_base_circ_factor - 1) * this.el_base +
    (this.el_base_ans_factor - 1) * this.el_base * this.ans_activity_factor +
    (this.el_base_drug_factor - 1) * this.el_base;

    this._el_k = this.el_k +
    (this.el_k_factor - 1) * this.el_k +
    (this.el_k_circ_factor - 1) * this.el_k +
    (this.el_k_ans_factor - 1) * this.el_k * this.ans_activity_factor +
    (this.el_k_drug_factor - 1) * this.el_k;
  }

  calc_volumes() {
    this._u_vol = this.u_vol +
    (this.u_vol_factor - 1) * this.u_vol +
    (this.u_vol_circ_factor - 1) * this.u_vol +
    (this.u_vol_ans_factor - 1) * this.u_vol * this.ans_activity_factor +
    (this.u_vol_drug_factor - 1) * this.u_vol;

  }
  
  calc_pressure() {
    // calculate the recoil pressure
    this.pres_in = this._el_k * Math.pow(this.vol - this._u_vol, 2) + this._el * (this.vol - this._u_vol);

    // calculate the total pressure by incorporating the external pressures
    this.pres = this.pres_in + this.pres_ext + this.pres_cc + this.pres_mus;

    // reset the external pressures
    this.pres_ext = 0.0;
    this.pres_cc = 0.0;
    this.pres_mus = 0.0;
  }

  volume_in(dvol, comp_from) {
    // add volume to the capacitance
    this.vol += dvol;

    // return if the volume is zero or lower
    if (this.vol <= 0.0) return;

    // process the gases o2 and co2
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

    // if the volume is zero or lower, handle it
    if (this.vol < 0.0 && this.vol < this.u_vol) {
      let _vol_not_removed = -this.vol;
      this.vol = 0.0;
      return _vol_not_removed;
    }

    // return zero as all volume is removed
    return 0.0;
  }
}
