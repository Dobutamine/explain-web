import { BaseModelClass } from "../base_models/BaseModelClass";
import * as Models from "../ModelIndex.js"

export class Shunts extends BaseModelClass {
  // static properties
  static model_type = "Shunts";
  static model_interface = [
    {
      caption: "ductus arteriosus enabled",
      target: "da_enabled",
      type: "boolean"
    },
    {
      caption: "ductus arteriosus diameter (mm)",
      target: "da_diameter",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "ductus arteriosus length (mm)",
      target: "da_length",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "ductus arteriosus elastance (mmHg/L)",
      target: "da_el",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "ductus arteriosus backflow factor",
      target: "da_backflow_factor",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "ductus arteriosus non linear resistance factor",
      target: "da_r_k",
      type: "number",
      delta: 0.01,
      factor: 1.0,
      rounding: 2,
    },
    {
      caption: "foramen ovale enabled",
      target: "fo_enabled",
      type: "boolean"
    },
    {
      caption: "foramen ovale diameter (mm)",
      target: "fo_diameter",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "foramen ovale length (mm)",
      target: "fo_length",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "foramen ovale backflow factor",
      target: "fo_backflow_factor",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "foramen ovale non linear resistance factor",
      target: "fo_r_k",
      type: "number",
      delta: 0.01,
      factor: 1.0,
      rounding: 2,
    },
    {
      caption: "vsd enabled",
      target: "vsd_enabled",
      type: "boolean"
    },
    {
      caption: "vsd diameter (mm)",
      target: "vsd_diameter",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "vsd length (mm)",
      target: "vsd_length",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "vsd backflow factor",
      target: "vsd_backflow_factor",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "vsd non linear resistance factor",
      target: "vsd_r_k",
      type: "number",
      delta: 0.01,
      factor: 1.0,
      rounding: 2,
    },
  ];

  /*
    The Shunts class calculates the resistances of the shunts (ductus arteriosus, foramen ovale, and ventricular septal defect) from the diameter and length.
    It sets the resistances on the correct models representing the shunts.
    */
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // -----------------------------------------------
    // initialize independent properties
    this.fo_enabled = true; // boolean determining whether the foramen ovale is enabled or not
    this.fo_diameter = 0.0; // diameter of the foramen ovale (mm)
    this.fo_length = 2.0; // thickness of the foramen ovale (mm)
    this.fo_backflow_factor = 1.0; // backflow resistance factor of the foramen ovale
    this.fo_r_k = 1.0; // non linear resistance of the foramen ovale

    this.vsd_enabled = false; // boolean determining whether the ventricular septal defect is enabled or not
    this.vsd_diameter = 0.0; // diameter of the ventricular septal defect (mm)
    this.vsd_length = 2.0; // thickness of the ventricular septal defect (mm)
    this.vsd_backflow_factor = 1.0; // backflow resistance factor of the ventricular septal defect
    this.vsd_r_k = 1.0; // non linear resistance of the ventricular septal defect

    this.da_enabled = false; // boolean determining whether the ductus arteriosus is enabled or not
    this.da_el = 5000.0; // elastance of the ductus arteriosus (mmHg / L)
    this.da_el_factor = 1.0;
    this.da_diameter = 0.0; // diameter of the ductus arteriosus (mm)
    this.da_length = 10.0; // length of the ductus arteriosus (mm)
    this.da_backflow_factor = 1.0; // backflow resistance factor of the ductus arteriosus
    this.da_r_k = 1.0; // non linear resistance of the ductus arteriosus

    this.da = ""; // name of the ductus arteriosus blood capacitance model
    this.da_in = ""; // name of the ductus arteriosus inflow blood resistor
    this.da_out = ""; // name of the ductus arteriosus outflow blood resistor
    this.fo = ""; // name of the foramen ovale blood resistor
    this.vsd = ""; // name of the ventricular septal defect blood resistor

    // -----------------------------------------------
    // initialize dependent properties
    this.da_r_for = 1000.0; // calculated forward resistance across the ductus arteriosus (mmHg * s / L)
    this.da_r_back = 1000.0; // calculated backward resistance across the ductus arteriosus (mmHg * s / L)
    this.da_flow = 0.0; // flow across the ductus arteriosus (L/min)
    this.da_flow_in = 0.0; // flow across the ductus arteriosus (L/min)
    this.da_velocity = 0.0; // velocity of the flow across the ductus arteriosus (m/s)
    this.da_velocity_in = 0.0; // velocity of the flow across the ductus arteriosus (m/s)
    this.fo_r_for = 1000.0; // calculated forward resistance across the foramen ovale (mmHg * s / L)
    this.fo_r_back = 1000.0; // calculated forward resistance across the foramen ovale (mmHg * s / L)
    this.fo_flow = 0.0; // flow across the foramen ovale (L/min)
    this.fo_velocity = 0.0; // velocity of the flow across the foramen ovale (m/s)
    this.vsd_r_for = 1000.0; // calculated forward resistance across the ventricular septal defect (mmHg * s / L)
    this.vsd_r_back = 1000.0; // calculated forward resistance across the ventricular septal defect (mmHg * s / L)
    this.vsd_flow = 0.0; // flow across the ventricular septal defect (L/min)
    this.vsd_velocity = 0.0; // velocity of the flow across the ventricular septal defect (m/s)

    // -----------------------------------------------
    // local properties
    this._update_interval = 0.015; // update interval (s)
    this._update_counter = 1.0; // update interval counter (s)
    this._da = null; // reference to the ductus arteriosus blood capacitance
    this._da_in = null; // reference to the ductus arteriosus inflow resistance
    this._da_out = null; // reference to the ductus arteriosus outflow resistance
    this._fo = null; // reference to the foramen ovale blood resistor
    this._vsd = null; // reference to the ventricular septal defect resistor
    this._da_area = 0.0; // area of the ductus arteriosus (m^2)
    this._fo_area = 0.0; // area of the foramen ovale (m^2)
    this._vsd_area = 0.0; // area of the ventricular septal defect (m^2)
  }

  init_model(args = {}) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // build all components of this model
    Object.keys(this.components).forEach(component_name => {
      this._model_engine.models[component_name] = new Models[this.components[component_name].model_type](this._model_engine, component_name)
    })
  
    // initialize all components of this model with all arguments
    Object.keys(this.components).forEach(component_name => {
      let args = [];
      for (const [key, value] of Object.entries(this.components[component_name])) {
        args.push({ key, value });
      }
      this._model_engine.models[component_name].init_model(args)
    })

    // flag that the model is initialized
    this._is_initialized = true;
  }

  calc_model() {
    if (this._update_counter > this._update_interval) {
      this._update_counter = 0.0;
      
      // store the references to the models for performance reasons
      this._da = this._model_engine.models[this.da];
      this._da_in = this._model_engine.models[this.da_in];
      this._da_out = this._model_engine.models[this.da_out];
      this._fo = this._model_engine.models[this.fo];
      this._vsd = this._model_engine.models[this.vsd];


      // update the diameters and other properties
      this.set_ductus_arteriosus_properties(this.da_diameter, this.da_length);
      this.set_foramen_ovale_properties(this.fo_diameter, this.fo_length);
      this.set_ventricular_septal_defect_properties(this.vsd_diameter,this.vsd_length);
    }
    this._update_counter += this._t;

    // store the flows and velocities
    this.da_flow = this._da_out.flow * 60.0;
    this.da_flow_in = this._da_in.flow * 60.0;
    this.fo_flow = this._fo.flow * 60.0;
    this.vsd_flow = this._vsd.flow * 60.0;

    // calculate the velocity = flow_rate (in m^3/s) / (pi * radius^2) in m/s
    if (this._da_area > 0) {
      this.da_velocity = ((this.da_flow * 0.001) / this._da_area) * 1.4;
      this.da_velocity_in = ((this.da_flow_in * 0.001) / this._da_area) * 1.4;
    }
    if (this._fo_area > 0) {
      this.fo_velocity = ((this.fo_flow * 0.001) / this._fo_area) * 1.4;
    }
    if (this._vsd_area > 0) {
      this.vsd_velocity = ((this.vsd_flow * 0.001) / this._vsd_area) * 1.4;
    }
  }

  set_ductus_arteriosus_properties(new_diameter = this.da_diameter, new_length = this.da_length) {

    if (new_diameter > 0.0  && this.da_enabled) {
      this.da_diameter = new_diameter;
      this.da_el_factor = 1.0 // 5.0 / this.da_diameter
      this.da_length = new_length;
      this._da_area = Math.pow((this.da_diameter * 0.001) / 2.0, 2.0) * Math.PI; // in m^2
      this.da_r_for = this.calc_resistance(this.da_diameter, this.da_length);
      this.da_r_back = this.da_r_for * this.da_backflow_factor;
      this._da_out.r_for = this.da_r_for;
      this._da_out.r_back = this.da_r_back;
      this._da.el_base = this.da_el * this.da_el_factor
      this._da.is_enabled = true;
      this._da_in.is_enabled = true;
      this._da_out.is_enabled = true;
      this._da_in.no_flow = false;
      this._da_out.no_flow = false;
    } else {
      this.da_diameter = 0.0;
      this.da_el_factor = 1.0 // 5.0 // this.da_diameter
      this._da.el_base = this.da_el * this.da_el_factor
      this._da_out.no_flow = true;
      this._da_in.no_flow = true;
    }
  }

  set_foramen_ovale_properties(new_diameter = this.fo_diameter, new_length = this.fo_length) {
    if (new_diameter > 0.0 && this.fo_enabled) {
      this.fo_diameter = new_diameter;
      this.fo_length = new_length;
      this._fo_area = Math.pow((this.fo_diameter * 0.001) / 2.0, 2.0) * Math.PI; // in m^2
      this.fo_r_for = this.calc_resistance(this.fo_diameter, this.fo_length);
      this.fo_r_back = this.fo_r_for * this.fo_backflow_factor;
      this._fo.r_for = this.fo_r_for
      this._fo.r_back = this.fo_r_back
      this._fo.is_enabled = true;
      this._fo.no_flow = false;
    } else {
      this.fo_diameter = 0.0;
      this._fo.no_flow = true;
    }
  }

  set_ventricular_septal_defect_properties(new_diameter = this.vsd_diameter, new_length = this.vsd_length) {
    if (new_diameter > 0.0 && this.vsd_enabled) {
      this.vsd_diameter = new_diameter;
      this.vsd_length = new_length;
      this._vsd_area = Math.pow((this.vsd_diameter * 0.001) / 2.0, 2.0) * Math.PI; // in m^2
      this.vsd_r_for = this.calc_resistance(this.vsd_diameter, this.vsd_length);
      this.vsd_r_back = this.vsd_r_for * this.vsd_backflow_factor;
      this._vsd.r_for = this.vsd_r_for
      this._vsd.r_back = this.vsd_r_back
      this._vsd.is_enabled = true;
      this._vsd.no_flow = false;
    } else {
      this.vsd_diameter = 0.0;
      this._vsd.no_flow = true;
    }
  }

  calc_resistance(diameter, length = 2.0, viscosity = 6.0) {
    if (diameter > 0.0 && length > 0.0) {
      // resistance is calculated using Poiseuille's Law: R = (8 * n * L) / (PI * r^4)
      // diameter (mm), length (mm), viscosity (cP)

      // convert viscosity from centiPoise to Pa * s
      const n_pas = viscosity / 1000.0;

      // convert the length to meters
      const length_meters = length / 1000.0;

      // calculate radius in meters
      const radius_meters = diameter / 2 / 1000.0;

      // calculate the resistance Pa * s / m^3
      let res =
        (8.0 * n_pas * length_meters) / (Math.PI * Math.pow(radius_meters, 4));

      // convert resistance from Pa * s / m^3 to mmHg * s / L
      res = res * 0.00000750062;
      return res;
    } else {
      return 100000000; // a very high resistance to represent no flow
    }
  }
}
