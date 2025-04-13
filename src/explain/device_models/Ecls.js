import { BaseModelClass } from "../base_models/BaseModelClass.js";
import * as Models from "../ModelIndex.js"

import { calc_blood_composition } from "../helpers/BloodComposition.js"
import { calc_gas_composition } from "../helpers/GasComposition.js"

export class Ecls extends BaseModelClass {
  // static properties
  static model_type = "Ecls";
  static model_interface = [
    {
      caption: "switch ecls on/off",
      target: "switch_ecls",
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
      caption: "clamp tubing",
      target: "set_clamp",
      type: "function",
      args:[
        {
          caption: "state",
          target: "tubing_clamped",
          type: "boolean",
        },
      ]
    },
    {
      caption: "pump speed (rpm)",
      target: "set_pump_speed",
      type: "function",
      args:[
        {
          caption: "rpm",
          target: "pump_rpm",
          type: "number",
          factor: 1.0,
          rounding: 0,
          delta: 10
        },
      ]
    },
    {
      caption: "fio2 oxygenator",
      target: "set_fio2",
      type: "function",
      args:[
        {
          caption: "new fio2",
          target: "fio2_gas",
          type: "number",
          factor: 1.0,
          rounding: 2,
          delta: 0.01
        },
      ]
    },
    {
      caption: "co2 flow oxygenator (L/min)",
      target: "set_co2_flow",
      type: "function",
      args:[
        {
          caption: "new co2 flow",
          target: "co2_gas_flow",
          type: "number",
          factor: 1.0,
          rounding: 2,
          delta: 0.01
        },
      ]
    },
    {
      caption: "sweep gas oxygenator (L/min)",
      target: "set_gas_flow",
      type: "function",
      args:[
        {
          caption: "new gas flow",
          target: "sweep_gas",
          type: "number",
          factor: 1.0,
          rounding: 1,
          delta: 0.1
        },
      ]
    },
    {
      caption: "drainage cannula diameter (Fr)",
      target: "set_drainage_cannula_diameter",
      type: "function",
      args:[
        {
          caption: "new diameter",
          target: "drainage_cannula_diameter",
          type: "number",
          factor: 1.0,
          rounding: 0,
          delta: 1
        },
      ]
    },
    {
      caption: "return cannula diameter (Fr)",
      target: "set_return_cannula_diameter",
      type: "function",
      args:[
        {
          caption: "new diameter",
          target: "return_cannula_diameter",
          type: "number",
          factor: 1.0,
          rounding: 0,
          delta: 1
        },
      ]
    },
    {
      caption: "tubing diameter (inch)",
      target: "set_tubing_diameter",
      type: "function",
      args:[
        {
          caption: "new diameter",
          target: "tubing_diameter",
          type: "number",
          factor: 1.0,
          rounding: 2,
          delta: 0.01
        },
      ]
    },
    {
      caption: "drainage cannula length (m)",
      target: "set_drainage_cannula_length",
      type: "function",
      args:[
        {
          caption: "new length",
          target: "drainage_cannula_length",
          type: "number",
          factor: 1.0,
          rounding: 2,
          delta: 0.01
        },
      ]
    },
    {
      caption: "return cannula length (m)",
      target: "set_return_cannula_length",
      type: "function",
      args:[
        {
          caption: "new length",
          target: "return_cannula_length",
          type: "number",
          factor: 1.0,
          rounding: 2,
          delta: 0.01
        },
      ]
    },
    {
      caption: "tubing length (m)",
      target: "set_tubing_length",
      type: "function",
      args:[
        {
          caption: "new length",
          target: "tubing_length",
          type: "number",
          factor: 1.0,
          rounding: 2,
          delta: 0.01
        },
      ]
    },
    {
      caption: "tubing elastance (mmHg/L)",
      target: "set_tubing_elastance",
      type: "function",
      args:[
        {
          caption: "new elastance",
          target: "tubing_elastance",
          type: "number",
          factor: 1.0,
          rounding: 0,
          delta: 1
        },
      ]
    },
    {
      caption: "oxygenator resistance (mmHg/L*s)",
      target: "set_oxygenator_resistance",
      type: "function",
      args:[
        {
          caption: "new resistance",
          target: "oxy_resistance",
          type: "number",
          factor: 1.0,
          rounding: 0,
          delta: 1
        },
      ]
    },
    {
      caption: "oxygenator volume (L)",
      target: "set_oxygenator_volume",
      type: "function",
      args:[
        {
          caption: "new volume",
          target: "oxy_volume",
          type: "number",
          factor: 1.0,
          rounding: 3,
          delta: 0.001
        },
      ]
    },
    {
      caption: "pump head volume (L)",
      target: "set_pump_volume",
      type: "function",
      args:[
        {
          caption: "new volume",
          target: "pump_volume",
          type: "number",
          factor: 1.0,
          rounding: 3,
          delta: 0.001
        },
      ]
    },
    {
      caption: "o2 and co2 diffusion constants",
      target: "set_gasexchanger_properties",
      type: "function",
      args:[
        {
          caption: "new o2 dif constant",
          target: "oxy_dif_o2",
          type: "number",
          factor: 1.0,
          rounding: 4,
          delta: 0.0001
        },
        {
          caption: "new co2 dif constant",
          target: "oxy_dif_co2",
          type: "number",
          factor: 1.0,
          rounding: 4,
          delta: 0.0001
        },
      ]
    },
  ];

  /*
    The ECLS class models an ECLS system where blood is taken out of the circulation and oxygen added and carbon dioxide removed
    and then pumped back into the circulation. It is built with standard Explain components (BloodCapacitances, BloodResistors, BloodPump, GasCapacitances, GasResistor and GasExchanger)
    It showcases the flexibility of the object-oriented design of the Explain model.
    The cannulas that drain and return blood into the circulation are BloodResistors, while the tubing and oxygenator are BloodCapacitances.
    The pump is modeled by the BloodPump class, and everything is connected by a set of BloodResistors.
    The gas part is modeled by GasCapacitances, modeling the gas source, artificial lung, and outside air.
    The GasCapacitances are connected by GasResistors, and a GasExchanger model connects the blood and gas parts of the oxygenator.
    */

  constructor(model_ref, name = "") {
    // initialize the base model class setting all the general properties of the model which all models have in common
    super(model_ref, name);

    // -----------------------------------------------
    // initialize the independent parameters
    this.pres_atm = 760.0; // atmospheric pressure (mmHg)
    this.tubing_diameter = 0.25; // tubing diameter (inch)
    this.tubing_elastance = 11600; // tubing elastance (mmHg/l)
    this.tubing_in_length = 1.0; // tubing in length (m)
    this.tubing_out_length = 1.0; // tubing out length (m)
    this.tubing_length = 2.0; // tubing length (m)
    this.tubing_clamped = true; // states whether the tubing is clamped or not
    this.drainage_cannula_diameter = 12; // drainage cannula diameter in (Fr)
    this.drainage_cannula_length = 0.11; // drainage cannula length (m)
    this.return_cannula_diameter = 10; // drainage cannula diameter in (Fr)
    this.return_cannula_length = 0.11; // return cannula length (m)
    this.pump_volume = 0.8; // volume of the pumphead (l)
    this.oxy_volume = 0.8; // volume of the oxygenator (l)
    this.oxy_resistance = 100; // resistance of the oxygenator (mmHg/l*s)
    this.oxy_dif_o2 = 0.001; // oxygenator oxygen diffusion constant (mmol/mmHg)
    this.oxy_dif_co2 = 0.001; // oxygenator carbon dioxide diffusion constant (mmol/mmHg)
    this.sweep_gas = 0.5; // gas flowing through the gas part of the oxygenator (L/min)
    this.fio2_gas = 0.3; // fractional oxygen content of the oxygenator gas
    this.co2_gas_flow = 0.4; // added carbon dioxide gas flow (L/min)
    this.temp_gas = 37.0; // temperature of the oxygenator gas (°C)
    this.humidity_gas = 0.5; // humidity of the oxygenator gas (0-1)
    this.pump_rpm = 1500; // rotations of the centrifugal pump (rpm)
    this.components = {};

    // initialize the dependent parameters
    this.blood_flow = 0.0; // ECLS blood flow (L/min)
    this.gas_flow = 0.0; // ECLS gas flow (L/min)
    this.p_ven = 0.0; // pressure on the drainage side of the ECLS system (mmHg)
    this.p_int = 0.0; // pressure between the pump and oxygenator (mmHg)
    this.p_art = 0.0; // pressure after the oxygenator on the return side of the ECLS system (mmHg)
    this.pre_oxy_bloodgas = {}; // object holding the blood gas pre-oxygenator
    this.post_oxy_bloodgas = {}; // object holding the blood gas post-oxygenator

    // initialize the local parameters
    this._ecls_tubin = null; // reference to the inlet tubing on the drainage side (BloodCapacitance)
    this._ecls_pump = null; // reference to the ECLS pump (BloodPump)
    this._ecls_oxy = null; // reference to the oxygenator (BloodCapacitance)
    this._ecls_tubout = null; // reference to the outlet tubing on the return side (BloodCapacitance)
    this._ecls_drainage = null; // reference to the drainage cannula (BloodResistor)
    this._ecls_tubin_pump = null; // reference to the connector between inlet tubing and the pump (BloodResistor)
    this._ecls_pump_oxy = null; // reference to the connector between the pump and oxygenator (BloodResistor)
    this._ecls_oxy_tubout = null; // reference to the connector between the oxygenator and outlet tubing (BloodResistor)
    this._ecls_return = null; // reference to the return cannula (BloodResistor)
    this._ecls_gasin = null; // reference to the gas source (GasCapacitance)
    this._ecls_gasoxy = null; // reference to the oxygenator (GasCapacitance)
    this._ecls_gasout = null; // reference to the gas outside world (GasCapacitance)
    this._ecls_gasin_oxy = null; // reference to the connector connecting the gas source to the oxygenator (GasResistor)
    this._ecls_oxy_gasout = null; // reference to the connector connecting the oxygenator to the outside world (GasResistor)
    this._ecls_parts = []; // list holding all ECLS parts
    this._fico2_gas = 0.0004; // fractional carbon dioxide content of the ECLS gas
    this._update_interval = 0.015; // update interval of the model (s)
    this._update_counter = 0.0; // update counter (s)
    this._bloodgas_interval = 1.0; // interval at which the blood gases are calculated (s)
    this._bloodgas_counter = 0.0; // counter of the blood gas interval (s)
  }

  init_model(args = {}) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // build all components
    Object.keys(this.components).forEach(component_name => {
      this._model_engine.models[component_name] = new Models[this.components[component_name].model_type](this._model_engine, component_name)
    })
  
    // initialize all components
    Object.keys(this.components).forEach(component_name => {
      let args = [];
      for (const [key, value] of Object.entries(this.components[component_name])) {
        args.push({ key, value });
      }
      this._model_engine.models[component_name].init_model(args)
    })
  
    // get a reference to all ECLS components for performance reasons
    this._ecls_tubin = this._model_engine.models["ECLS_TUBIN"];
    this._ecls_pump = this._model_engine.models["ECLS_PUMP"];
    this._ecls_oxy = this._model_engine.models["ECLS_OXY"];
    this._ecls_tubout = this._model_engine.models["ECLS_TUBOUT"];
    this._ecls_drainage = this._model_engine.models["ECLS_DRAINAGE"];
    this._ecls_tubin_pump = this._model_engine.models["ECLS_TUBIN_PUMP"];
    this._ecls_pump_oxy = this._model_engine.models["ECLS_PUMP_OXY"];
    this._ecls_oxy_tubout = this._model_engine.models["ECLS_OXY_TUBOUT"];
    this._ecls_return = this._model_engine.models["ECLS_RETURN"];
    this._ecls_gasin = this._model_engine.models["ECLS_GASIN"];
    this._ecls_gasoxy = this._model_engine.models["ECLS_GASOXY"];
    this._ecls_gasout = this._model_engine.models["ECLS_GASOUT"];
    this._ecls_gasin_oxy = this._model_engine.models["ECLS_GASIN_OXY"];
    this._ecls_oxy_gasout = this._model_engine.models["ECLS_OXY_GASOUT"];
    this._ecls_gasex = this._model_engine.models["ECLS_GASEX"];

    // clear the ECLS part list
    this._ecls_parts = [];
    // add the ECLS models to the part list
    this._ecls_parts.push(
      this._ecls_tubin,
      this._ecls_pump,
      this._ecls_oxy,
      this._ecls_tubout,
      this._ecls_drainage,
      this._ecls_tubin_pump,
      this._ecls_pump_oxy,
      this._ecls_oxy_tubout,
      this._ecls_return,
      this._ecls_gasin,
      this._ecls_gasoxy,
      this._ecls_tubin,
      this._ecls_gasout,
      this._ecls_gasin_oxy,
      this._ecls_oxy_gasout,
      this._ecls_gasex
    );

    // set the tubing properties
    this.set_tubing_properties();

    // set the properties of the cannulas
    this.set_cannula_properties();

    // set the properties of the oxygenator
    this.set_oxygenator_properties();

    // set the properties of the pump
    this.set_pump_properties();

    // set the properties of the gas source
    this.set_gas_source_properties();

    // set the properties of the gas outlet
    this.set_gas_outlet_properties();

    // set the properties of the gas oxy
    this.set_gas_oxy_properties();

    // set the gas exchanger properties
    this.set_gasexchanger_properties(this.oxy_dif_o2, this.oxy_dif_co2);

    // set the gas flow
    this.set_gas_flow(this.sweep_gas);

    // set the pump speed
    this.set_pump_speed(1500);

    // set the clamp
    this.set_clamp(true);

    // flag that the model is initialized
    this._is_initialized = true;
  }

  calc_model() {
    // increase the update timer
    this._update_counter += this._t;
    if (this._update_counter > this._update_interval) {
      this._update_counter = 0.0;
      // store the blood and gas flows
      this.blood_flow = this._ecls_return.flow * 60.0;
      this.gas_flow = this._ecls_oxy_gasout.flow * 60.0;

      // store the pressures
      this.p_ven = this._ecls_tubin.pres_in;
      this.p_int = this._ecls_oxy.pres_in;
      this.p_art = this._ecls_tubout.pres_in;
    }

    // calculate the blood gases
    this._bloodgas_counter += this._t;
    if (this._bloodgas_counter > this._bloodgas_interval) {
      this._bloodgas_counter = 0.0;

      // calculate the blood gases
      calc_blood_composition(this._ecls_tubin);
      calc_blood_composition(this._ecls_tubout);

      this.pre_oxy_bloodgas = {
        ph: this._ecls_tubin.ph,
        po2: this._ecls_tubin.po2,
        pco2: this._ecls_tubin.pco2,
        hco3: this._ecls_tubin.hco3,
        be: this._ecls_tubin.be,
        so2: this._ecls_tubin.so2,
      };
      this.post_oxy_bloodgas = {
        ph: this._ecls_tubout.ph,
        po2: this._ecls_tubout.po2,
        pco2: this._ecls_tubout.pco2,
        hco3: this._ecls_tubout.hco3,
        be: this._ecls_tubout.be,
        so2: this._ecls_tubout.so2,
      };
    }
  }

  switch_ecls(state) {
    // switch the calculations of the ECLS model
    this.is_enabled = state;

    // enable or disable all ECLS components
    this._ecls_parts.forEach((ep) => {
      ep.is_enabled = state;
      // make sure the no_flow flag is set correctly on the resistors (safety)
      if (ep.hasOwnProperty("no_flow")) {
        ep.no_flow = !state;
      }
    });
  }

  set_pump_speed(new_pump_speed) {
    // store new pump speed
    this.pump_rpm = new_pump_speed;
    // set the pump speed on the BloodPump model
    this._ecls_pump.pump_rpm = this.pump_rpm;
  }

  set_clamp(state) {
    // clamp/unclamp the drainage and return tubing by setting the no_flow property
    this.tubing_clamped = state;
    this._ecls_drainage.no_flow = state;
    this._ecls_return.no_flow = state;
  }

  set_fio2(new_fio2) {
    // set the new fio2 of the ECLS gas
    this.fio2_gas = new_fio2 > 20 ? new_fio2 / 100.0 : new_fio2;
    // determine the fico2 of the gas
    this._fico2_gas = (this.co2_gas_flow * 0.001) / this.sweep_gas;
    // recalculate the gas composition
    calc_gas_composition(
      this._ecls_gasin,
      this.fio2_gas,
      this.temp_gas,
      this.humidity_gas,
      this._fico2_gas
    );
  }

  set_co2_flow(new_co2_flow) {
    // store the new gas flow
    this.co2_gas_flow = new_co2_flow;
    // determine the fico2 of the gas
    this._fico2_gas = (this.co2_gas_flow * 0.001) / this.sweep_gas;
    // recalculate the gas composition
    calc_gas_composition(
      this._ecls_gasin,
      this.fio2_gas,
      this.temp_gas,
      this.humidity_gas,
      this._fico2_gas
    );
  }

  set_gas_flow(new_sweep_gas) {
    // set the new gas flow
    if (new_sweep_gas > 0.0) {
      this.sweep_gas = new_sweep_gas;
      this._ecls_gasin.calc_model();
      this._ecls_gasoxy.calc_model();
      this._ecls_gasout.calc_model();
      this._ecls_gasin_oxy.r_for =
        (this._ecls_gasin.pres - this.pres_atm) / (this.sweep_gas / 60.0);
      this._ecls_gasin_oxy.r_back = this._ecls_gasin_oxy.r_for;
    }
  }

  set_oxygenator_volume(new_volume) {
    // set the new oxygenator volume (blood part)
    this.oxy_volume = new_volume;
    // reset the oxygenator
    this.set_oxygenator_properties();
  }

  set_pump_volume(new_volume) {
    // set the new pump volume
    this.pump_volume = new_volume;
    // reset the pump
    this.set_pump_properties();
  }

  set_oxygenator_resistance(new_resistance) {
    // set the new oxygenator (blood part) additional resistance (on top of the tubing resistance)
    this.oxy_resistance = new_resistance;
    this._ecls_oxy_tubout.r_for =
      this.calc_tube_resistance(
        this.tubing_diameter * 0.0254,
        this.tubing_out_length
      ) + this.oxy_resistance;
    this._ecls_oxy_tubout.r_back =
      this._ecls_oxy_tubout.r_for + this.oxy_resistance;
  }

  set_drainage_cannula_diameter(new_diameter) {
    // set the drainage cannula diameter
    this.drainage_cannula_diameter = new_diameter;
    // reset the drainage cannula
    this.set_cannula_properties();
  }

  set_return_cannula_diameter(new_diameter) {
    // set the return cannula diameter
    this.return_cannula_diameter = new_diameter;
    // reset the return cannula
    this.set_cannula_properties();
  }

  set_drainage_cannula_length(new_length) {
    // set the drainage cannula length
    this.drainage_cannula_length = new_length;
    // reset the drainage cannula
    this.set_cannula_properties();
  }

  set_return_cannula_length(new_length) {
    // set the return cannula length
    this.return_cannula_length = new_length;
    // reset the return cannula
    this.set_cannula_properties();
  }

  set_tubing_diameter(new_diameter) {
    // set the tubing diameter
    this.tubing_diameter = new_diameter;
    this.set_tubing_properties();
  }

  set_tubing_length(new_length) {
    // set the tubing total length and assume the drainage and return part have the same length
    this.tubing_in_length = new_length / 2.0;
    this.tubing_out_length = new_length / 2.0;
    this.set_tubing_properties();
  }

  set_tubing_elastance(new_elastance) {
    // set the tubing elastance
    this.tubing_elastance = new_elastance;
    this.set_tubing_properties();
  }

  set_gas_oxy_properties() {
    // calculate the gas composition of the gas part of the oxygenator
    this._fico2_gas = (this.co2_gas_flow * 0.001) / this.sweep_gas;
    calc_gas_composition(
      this._ecls_gasoxy,
      this.fio2_gas,
      this.temp_gas,
      this.humidity_gas,
      this._fico2_gas
    );
  }

  set_gas_outlet_properties() {
    // calculate the composition of the outside air
    calc_gas_composition(this._ecls_gasout, 0.205, 20.0, 0.1, 0.0004);
  }

  set_gas_source_properties() {
    // calculate the gas composition of the gas source
    this._fico2_gas = (this.co2_gas_flow * 0.001) / this.sweep_gas;
    calc_gas_composition(
      this._ecls_gasin,
      this.fio2_gas,
      this.temp_gas,
      this.humidity_gas,
      this._fico2_gas
    );
  }

  set_gasexchanger_properties(_oxy_dif_o2, _oxy_dif_co2) {
    // set the diffusion constants for oxygen and carbon dioxide of the GasExchanger
    this.oxy_dif_o2 = _oxy_dif_o2;
    this.oxy_dif_co2 = _oxy_dif_co2;
    this._ecls_gasex.dif_o2 = this.oxy_dif_o2;
    this._ecls_gasex.dif_co2 = this.oxy_dif_co2;
  }

  set_oxygenator_properties() {
    this._ecls_oxy.vol = this.oxy_volume;
    this._ecls_oxy.u_vol = this.oxy_volume;
    this._ecls_oxy.calc_model();
  }

  set_pump_properties() {
    this._ecls_pump.vol = this.pump_volume;
    this._ecls_pump.u_vol = this.pump_volume;
    this._ecls_pump.calc_model();
  }

  set_cannula_properties() {
    let _drainage_res = this.calc_tube_resistance(
      this.drainage_cannula_diameter * 0.00033,
      this.drainage_cannula_length
    );
    this._ecls_drainage.r_for = _drainage_res;
    this._ecls_drainage.r_back = _drainage_res;

    let _return_res = this.calc_tube_resistance(
      this.return_cannula_diameter * 0.00033,
      this.return_cannula_length
    );
    this._ecls_return.r_for = _return_res;
    this._ecls_return.r_back = _return_res;
  }

  set_tubing_properties() {
    // tubing in properties
    let _tubing_volume_in = this.calc_tube_volume(
      this.tubing_diameter * 0.0254,
      this.tubing_in_length
    );
    this._ecls_tubin.vol = _tubing_volume_in;
    this._ecls_tubin.u_vol = _tubing_volume_in;
    this._ecls_tubin.el_base = this.tubing_elastance;
    this._ecls_tubin.calc_model();
    this._ecls_tubin_pump.r_for = this.calc_tube_resistance(
      this.tubing_diameter * 0.0254,
      this.tubing_in_length
    );
    this._ecls_tubin_pump.r_back = this._ecls_tubin_pump.r_for;

    let _tubing_volume_out = this.calc_tube_volume(
      this.tubing_diameter * 0.0254,
      this.tubing_out_length
    );
    this._ecls_tubout.vol = _tubing_volume_out;
    this._ecls_tubout.u_vol = _tubing_volume_out;
    this._ecls_tubout.el_base = this.tubing_elastance;
    this._ecls_tubout.calc_model();
    this._ecls_oxy_tubout.r_for =
      this.calc_tube_resistance(
        this.tubing_diameter * 0.0254,
        this.tubing_out_length
      ) + this.oxy_resistance;
    this._ecls_oxy_tubout.r_back =
      this._ecls_oxy_tubout.r_for + this.oxy_resistance;
  }

  calc_tube_volume(diameter, length) {
    // return the volume in liters
    return Math.PI * Math.pow(0.5 * diameter, 2) * length * 1000.0;
  }

  calc_tube_resistance(diameter, length, viscosity = 6.0) {
    // resistance is calculated using Poiseuille's Law : R = (8 * n * L) / (PI * r^4)
    // resistance is in mmHg * s / l
    // L = length in meters
    // r = radius in meters
    // n = viscosity in centiPoise

    // convert viscosity from centiPoise to Pa * s
    let n_pas = viscosity / 1000.0;

    // calculate radius in meters
    let radius_meters = diameter / 2;

    // calculate the resistance    Pa *  / m3
    let res = (8.0 * n_pas * length) / (Math.PI * Math.pow(radius_meters, 4));

    // convert resistance of Pa/m3 to mmHg/l
    res = res * 0.00000750062;
    return res;
  }
}
