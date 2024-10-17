import { BaseModelClass } from "./BaseModelClass";

export class BloodPump extends BaseModelClass {
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
    this.inlet = ""; // name of the BloodResistor at the inlet of the pump
    this.outlet = ""; // name of the BloodResistor at the outlet of the pump
    this.drugs = {}; // dictionary holding all drug concentrations

    // general factors
    this.ans_activity_factor = 1.0;

    // unstressed volume factors
    this.u_vol_factor = 1.0;
    this.u_vol_scaling_factor = 1.0;
    this.u_vol_ans_factor = 1.0;
    this.u_vol_drug_factor = 1.0;

    // elastance factors
    this.el_base_factor = 1.0;
    this.el_base_scaling_factor = 1.0;
    this.el_base_ans_factor = 1.0;
    this.el_base_drug_factor = 1.0;

    // non-linear elastance factors
    this.el_k_factor = 1.0;
    this.el_k_scaling_factor = 1.0;
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
    this.pump_rpm = 0.0; // pump speed in rotations per minute
    this.pump_mode = 0; // pump mode (0=centrifugal, 1=roller pump)

    // local properties
    this._inlet = null; // holds a reference to the inlet BloodResistor
    this._outlet = null; // holds a reference to the outlet BloodResistor
  }

  init_model(args = {}) {
    // set the properties of this model
    Object.keys(args).forEach((key) => {
      this[key] = args[key];
    });

    // find the inlet and outlet resistors
    this._inlet = this._model_engine.models[this.inlet];
    this._outlet = this._model_engine.models[this.outlet];

    // flag that the model is initialized
    this._is_initialized = true;
  }

  calc_model() {
    // Incorporate the scaling factors
    let _el_base = this.el_base * this.el_base_scaling_factor;
    let _el_k_base = this.el_k * this.el_k_scaling_factor;
    let _u_vol_base = this.u_vol * this.u_vol_scaling_factor;

    // Incorporate the other factors
    let _el =
      _el_base +
      (this.el_base_factor - 1) * _el_base +
      (this.el_base_ans_factor - 1) * _el_base * this.ans_activity_factor +
      (this.el_base_drug_factor - 1) * _el_base;

    let _el_k =
      _el_k_base +
      (this.el_k_factor - 1) * _el_k_base +
      (this.el_k_ans_factor - 1) * _el_k_base * this.ans_activity_factor +
      (this.el_k_drug_factor - 1) * _el_k_base;

    let _u_vol =
      _u_vol_base +
      (this.u_vol_factor - 1) * _u_vol_base +
      (this.u_vol_ans_factor - 1) * _u_vol_base * this.ans_activity_factor +
      (this.u_vol_drug_factor - 1) * _u_vol_base;

    // calculate the current recoil pressure of the blood pump
    this.pres_in =
      _el_k * Math.pow(this.vol - _u_vol, 2) + _el_base * (this.vol - _u_vol);

    // calculate the total pressure
    this.pres = this.pres_in + this.pres_ext + this.pres_cc + this.pres_mus;

    // reset the external pressure
    this.pres_ext = 0.0;
    this.pres_cc = 0.0;
    this.pres_mus = 0.0;

    // calculate the pump pressure and apply the pump pressures to the connected resistors
    this.pump_pressure = -this.pump_rpm / 25.0;
    if (this.pump_mode === 0) {
      this._inlet.p1_ext = 0.0;
      this._inlet.p2_ext = this.pump_pressure;
    } else {
      this._outlet.p1_ext = this.pump_pressure;
      this._outlet.p2_ext = 0.0;
    }
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

    // return if the volume is zero or lower
    if (this.vol < 0.0) {
      let _vol_not_removed = -this.vol;
      this.vol = 0.0;
      console.log(`Negative volume error in blood capacitance: ${this.name}!`);

      // return the volume which could not be removed
      return _vol_not_removed;
    }

    // return zero as all volume in dvol is removed from the capacitance
    return 0.0;
  }
}
