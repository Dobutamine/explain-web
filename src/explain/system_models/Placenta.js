

import { BaseModelClass } from "../base_models/BaseModelClass.js";
import { BloodCapacitance } from "../base_models/BloodCapacitance.js";
import { BloodDiffusor } from "../base_models/BloodDiffusor.js"
import { calc_blood_composition } from "../helpers/BloodComposition"
import { Resistor } from "../base_models/Resistor";

export class Placenta extends BaseModelClass {
  // static properties
  static model_type = "Placenta";
  static model_interface = [
    {
      caption: "switch placenta on/off",
      target: "switch_placenta",
      type: "function",
      args:[
        {
          caption: "state",
          target: "is_enabled",
          type: "boolean",
        },
      ]
    },
    {
      caption: "umbilical cord clamping",
      target: "clamp_umbilical_cord",
      type: "function",
      args:[
        {
          caption: "clamped",
          target: "umb_clamped",
          type: "boolean",
        },
      ]
    },
    {
      caption: "umbilical arteries diameter",
      target: "set_umb_art_diameter",
      type: "function",
      args:[
        {
          caption: "new diameter (mm)",
          target: "umb_art_diameter",
          type: "number",
          factor: 1000,
          delta: 0.1,
          rounding: 1,
        },
      ]
    },
    {
      caption: "umbilical arteries length",
      target: "set_umb_art_length",
      type: "function",
      args:[
        {
          caption: "new length (mm)",
          target: "umb_art_length",
          type: "number",
          factor: 1000,
          delta: 0.1,
          rounding: 1,
        },
      ]
    },
    {
      caption: "umbilical arteries resistance",
      target: "set_umb_art_resistance",
      type: "function",
      args:[
        {
          caption: "new resistance (mmHg/L*sec)",
          target: "umb_art_res",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
        },
      ]
    },
    {
      caption: "umbilical vein diameter",
      target: "set_umb_ven_diameter",
      type: "function",
      args:[
        {
          caption: "new diameter (mm)",
          target: "umb_ven_diameter",
          type: "number",
          factor: 1000,
          delta: 0.1,
          rounding: 1,
        },
      ]
    },
    {
      caption: "umbilical vein length",
      target: "set_umb_ven_length",
      type: "function",
      args:[
        {
          caption: "new length (mm)",
          target: "umb_ven_length",
          type: "number",
          factor: 1000,
          delta: 0.1,
          rounding: 1,
        },
      ]
    },
    {
      caption: "umbilical vein resistance",
      target: "set_umb_ven_resistance",
      type: "function",
      args:[
        {
          caption: "new resistance (mmHg/L*sec)",
          target: "umb_ven_res",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
        },
      ]
    },
    {
      caption: "fetal placenta volume (L)",
      target: "set_fetal_placenta_volume",
      type: "function",
      args:[
        {
          caption: "new volume (L)",
          target: "plf_u_vol",
          type: "number",
          factor: 1,
          delta: 0.001,
          rounding: 3,
        },
      ]
    },
    {
      caption: "fetal placenta elastance (L)",
      target: "set_fetal_placenta_elastance",
      type: "function",
      args:[
        {
          caption: "new elastance (mmHg/L)",
          target: "plf_el_base",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
        },
      ]
    },
    {
      caption: "maternal placenta volume (L)",
      target: "set_maternal_placenta_volume",
      type: "function",
      args:[
        {
          caption: "new volume (L)",
          target: "plm_u_vol",
          type: "number",
          factor: 1,
          delta: 0.001,
          rounding: 3,
        },
      ]
    },
    {
      caption: "maternal placenta elastance (L)",
      target: "set_maternal_placenta_elastance",
      type: "function",
      args:[
        {
          caption: "new elastance (mmHg/L)",
          target: "plm_el_base",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
        },
      ]
    },
    {
      caption: "maternal to2 (mmol/l)",
      target: "set_maternal_to2",
      type: "function",
      args:[
        {
          caption: "new to2 (mmol/l)",
          target: "mat_to2",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
        },
      ]
    },
    {
      caption: "maternal tco2 (mmol/l)",
      target: "set_maternal_tco2",
      type: "function",
      args:[
        {
          caption: "new tco2 (mmol/l)",
          target: "mat_tco2",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
        },
      ]
    },
    {
      caption: "o2 diffusion constant",
      target: "set_dif_o2",
      type: "function",
      args:[
        {
          caption: "new diff o2 (mmol/mmHg)",
          target: "dif_o2",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
        },
      ]
    },
    {
      caption: "co2 diffusion constant",
      target: "set_dif_co2",
      type: "function",
      args:[
        {
          caption: "new diff co2 (mmol/mmHg)",
          target: "dif_co2",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
        },
      ]
    },
    {
      caption: "set maternal solute concentration",
      target: "set_maternal_solute",
      type: "function",
      args:[
        {
          target: "solute_name",
          caption: "solute name",
          type: "list",
          custom_options: true,
          options: ["na", "k"]
        },
        {
          target: "solute_value",
          caption: "solute value",
          type: "number",
          default: 0.0,
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000.0,
          ll: 0.0,
        }
      ]
    },
  ];

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
    this._placenta_parts = []; // list holding all placental parts
    this._update_interval = 0.015; // update interval of the placenta model (s)
    this._update_counter = 0.0; // counter of the update interval (s)
  }

  init_model(args = {}) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    Object.keys(this.components).forEach(component_name => {
      let component = {}
      switch (this.components[component_name].model_type) {
        case "BloodCapacitance":
          component = new BloodCapacitance(this._model_engine, component_name)
          break;
        case "Resistor":
          component = new Resistor(this._model_engine, component_name)
          break;
        case "BloodDiffusor":
          component = new BloodDiffusor(this._model_engine, component_name)
          break;
      }
  
      let args = [];
      for (const [key, value] of Object.entries(this.components[component_name])) {
        args.push({ key, value });
      }
      component.init_model(args)
      this._model_engine.models[component_name] = component
    })


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

  set_maternal_solute(solute_name, solute_conc) {
    this._plm.solutes[solute_name] = solute_conc
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
