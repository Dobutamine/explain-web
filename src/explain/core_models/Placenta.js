import { BaseModelClass } from "./BaseModelClass";

export class Placenta extends BaseModelClass {
  // static properties
  static model_type = "Placenta";
  static model_interface = [];

  /*
    The Placenta class models the placental circulation and gas exchange using core models of the Explain model.
    The umbilical arteries and veins are modeled by BloodResistors connected to the descending aorta (DA) and
    inferior vena cava (IVCI). The fetal (PLF) and maternal placenta (PLM) are modeled by two BloodCapacitances.
    A BloodDiffusor model instance takes care of the GasExchange between the PLF and PLM.
    */

  constructor(model_ref, name = "") {
    // initialize the base model class setting all the general properties of the model which all models have in common
    super(model_ref, name);

    // -----------------------------------------------
    // initialize independent parameters
    this.umb_art_diameter = 0.005; // diameter of the umbilical arteries combined (m)
    this.umb_art_length = 0.5; // length of the umbilical arteries (m)
    this.umb_ven_diameter = 0.005; // diameter of the umbilical vein (m)
    this.umb_ven_length = 0.5; // length of the umbilical vein (m)
    this.umb_art_res = 30000; // resistance of the umbilical artery (mmHg/L * s)
    this.umb_ven_res = 30000; // resistance of the umbilical vein (mmHg/L * s)
    this.plf_u_vol = 0.15; // unstressed volume of the fetal placenta (L)
    this.plf_el_base = 5000.0; // elastance of the fetal placenta (mmHg/L)
    this.plm_u_vol = 0.5; // unstressed volume of the maternal placenta (L)
    this.plm_el_base = 5000.0; // elastance of the maternal placenta (mmHg/L)
    this.dif_o2 = 0.01; // diffusion constant of oxygen (mmol/mmHg)
    this.dif_co2 = 0.01; // diffusion constant of carbon dioxide (mmol/mmHg)
    this.mat_to2 = 6.5; // maternal total oxygen concentration (mmol/L)
    this.mat_tco2 = 23.0; // maternal total carbon dioxide concentration (mmol/L)
    this.umb_clamped = true; // flags whether the umbilical vessels are clamped or not

    // -----------------------------------------------
    // initialize dependent parameters
    this.umb_art_flow = 0.0; // flow in the umbilical artery (L/s)
    this.umb_art_velocity = 0.0; // velocity in the umbilical artery (m/s)
    this.umb_ven_flow = 0.0; // flow in the umbilical vein (L/s)
    this.umb_ven_velocity = 0.0; // velocity in the umbilical vein (m/s)
    this.mat_po2 = 0.0; // maternal placenta oxygen partial pressure (mmHg)
    this.mat_pco2 = 0.0; // maternal placenta carbon dioxide partial pressure (mmHg)

    // -----------------------------------------------
    // local parameters
    this._umb_art = null; // reference to the umbilical artery (BloodResistor)
    this._umb_ven = null; // reference to the umbilical vein (BloodResistor)
    this._plm = null; // reference to the fetal placenta (BloodCapacitance)
    this._plf = null; // reference to the maternal placenta (BloodCapacitance)
    this._pl_gasex = null; // reference to the gas exchanger between fetal and maternal placenta (GasExchanger)
    this._calc_blood_composition = null; // reference to the function of the Blood model which calculates the blood composition in a blood containing model
    this._placenta_parts = []; // list holding all placental parts
    this._update_interval = 0.015; // update interval of the placenta model (s)
    this._update_counter = 0.0; // counter of the update interval (s)
  }

  init_model(args = {}) {
    // set the properties of this model
    Object.keys(args).forEach((key) => {
      this[key] = args[key];
    });

    // get a reference to all ECLS components for performance reasons
    this._umb_art = this._model_engine.models["UMB_ART"];
    this._umb_ven = this._model_engine.models["UMB_VEN"];
    this._plf = this._model_engine.models["PLF"];
    this._plm = this._model_engine.models["PLM"];
    this._pl_gasex = this._model_engine.models["PL_GASEX"];

    // clear the placenta part list
    this._placenta_parts = [];
    // add the placenta parts to the list
    this._placenta_parts.push(
      this._umb_art,
      this._umb_ven,
      this._plf,
      this._plm,
      this._pl_gasex
    );

    // get a reference to the blood composition routine
    this._calc_blood_composition =
      this._model_engine.models["Blood"].calc_blood_composition;

    // prepare placenta
    this.set_umb_art_diameter(this.umb_art_diameter);
    this.set_umb_art_length(this.umb_art_length);
    this.set_umb_ven_diameter(this.umb_ven_diameter);
    this.set_umb_ven_length(this.umb_ven_length);
    this.set_fetal_placenta_volume(this.plf_u_vol);
    this.set_fetal_placenta_elastance(this.plf_el_base);
    this.set_maternal_placenta_volume(this.plm_u_vol);
    this.set_maternal_placenta_elastance(this.plm_el_base);
    this.set_maternal_to2(this.mat_to2);
    this.set_maternal_tco2(this.mat_tco2);
    this.set_dif_o2(this.dif_o2);
    this.set_dif_co2(this.dif_co2);

    // clamp the umbilical cord
    this.clamp_umbilical_cord(true);

    // flag that the model is initialized
    this._is_initialized = true;
    this._update_interval = 0.015;
    this._update_counter = 0.0;
  }

  calc_model() {
    // increase the update counter
    this._update_counter += this._t;
    if (this._update_counter > this._update_interval) {
      this._update_counter = 0.0;

      // store the maternal po2 and pco2
      this.mat_po2 = this._plm.po2;
      this.mat_pco2 = this._plm.pco2;

      // store the arterial and venous flows
      this.umb_art_flow = this._umb_art.flow * 60.0;
      this.umb_ven_flow = this._umb_ven.flow * 60.0;

      // determine the area of the umbilical artery and veins depending on the diameter
      let ua_area =
        Math.pow((this.umb_art_diameter * 0.001) / 2.0, 2.0) * Math.PI; // in m^2
      let uv_area =
        Math.pow((this.umb_ven_diameter * 0.001) / 2.0, 2.0) * Math.PI; // in m^2

      // calculate the velocity = flow_rate (in m^3/s) / (pi * radius^2) in m/s
      if (ua_area > 0) {
        this.umb_art_velocity = ((this.umb_art_flow * 0.001) / ua_area) * 1.4;
      }
      if (uv_area > 0) {
        this.umb_ven_velocity = ((this.umb_ven_flow * 0.001) / uv_area) * 1.4;
      }
    }
  }

  switch_placenta(state) {
    // switch the calculations of the placenta model
    this.is_enabled = state;

    // enable or disable all placenta components
    this._placenta_parts.forEach((pp) => {
      pp.is_enabled = state;
      // make sure the no_flow flag is set correctly on the resistors (safety)
      if (pp.hasOwnProperty("no_flow")) {
        pp.no_flow = !state;
      }
    });
  }

  clamp_umbilical_cord(state) {
    // determines whether or not the umbilical vessels are clamped by setting the no_flow property
    this.umb_clamped = state;
    this._umb_art.no_flow = state;
    this._umb_ven.no_flow = state;
  }

  set_umb_art_diameter(new_diameter) {
    this.umb_art_diameter = new_diameter;
    // calculate the resistance
    this.umb_art_res = this.calc_tube_resistance(
      this.umb_art_diameter,
      this.umb_art_length
    );
    // reset the umbilical artery resistance
    this.set_umb_art_resistance(this.umb_art_res);
  }

  set_umb_art_length(new_length) {
    this.umb_art_length = new_length;
    // calculate the resistance
    this.umb_art_res = this.calc_tube_resistance(
      this.umb_art_diameter,
      this.umb_art_length
    );
    // reset the umbilical artery resistance
    this.set_umb_art_resistance(this.umb_art_res);
  }

  set_umb_art_resistance(new_res) {
    // reset the umbilical artery resistance
    this.umb_art_res = new_res;
    this._umb_art.r_for = this.umb_art_res;
    this._umb_art.r_back = this._umb_art.r_for;
  }

  set_umb_ven_diameter(new_diameter) {
    this.umb_ven_diameter = new_diameter;
    this.umb_ven_res = this.calc_tube_resistance(
      this.umb_ven_diameter,
      this.umb_ven_length
    );
    this.set_umb_ven_resistance(this.umb_ven_res);
  }

  set_umb_ven_length(new_length) {
    this.umb_ven_length = new_length;
    this.umb_ven_res = this.calc_tube_resistance(
      this.umb_ven_diameter,
      this.umb_ven_length
    );
    this.set_umb_ven_resistance(this.umb_ven_res);
  }

  set_umb_ven_resistance(new_res) {
    // reset the umbilical vein resistance
    this.umb_ven_res = new_res;
    this._umb_ven.r_for = this.umb_ven_res;
    this._umb_ven.r_back = this._umb_art.r_for;
  }

  set_fetal_placenta_volume(new_volume) {
    this._plf.u_vol = new_volume;
    this._plf.vol = new_volume;
  }

  set_fetal_placenta_elastance(new_elastance) {
    this._plf.el_base = new_elastance;
  }

  set_maternal_to2(new_to2) {
    this._plm.to2 = new_to2;
  }

  set_maternal_tco2(new_tco2) {
    this._plm.tco2 = new_tco2;
  }

  set_maternal_solutes(new_solutes) {
    Object.keys(new_solutes).forEach((key) => {
      this._plm.solutes[key] = new_solutes[key];
    });
  }

  set_maternal_placenta_volume(new_volume) {
    this._plm.u_vol = new_volume;
    this._plm.vol = new_volume;
  }

  set_maternal_placenta_elastance(new_elastance) {
    this._plm.el_base = new_elastance;
  }

  set_dif_o2(new_dif_o2) {
    this.dif_o2 = new_dif_o2;
    this._pl_gasex.dif_o2 = this.dif_o2;
  }

  set_dif_co2(new_dif_co2) {
    this.dif_co2 = new_dif_co2;
    this._pl_gasex.dif_co2 = this.dif_co2;
  }

  calc_tube_volume(diameter, length) {
    // return the volume in liters
    return Math.PI * Math.pow(0.5 * diameter, 2) * length * 1000.0;
  }

  calc_tube_resistance(diameter, length, viscosity = 6.0) {
    // resistance is calculated using Poiseuille's Law: R = (8 * n * L) / (PI * r^4)
    // resistance is in mmHg * s / l
    // L = length in meters, r = radius in meters, n = viscosity in centiPoise

    // convert viscosity from centiPoise to Pa * s
    let n_pas = viscosity / 1000.0;

    // calculate radius in meters
    let radius_meters = diameter / 2;

    // calculate the resistance in Pa/m3
    let res = (8.0 * n_pas * length) / (Math.PI * Math.pow(radius_meters, 4));

    // convert resistance of Pa/m3 to mmHg/l
    res = res * 0.00000750062;
    return res;
  }
}
