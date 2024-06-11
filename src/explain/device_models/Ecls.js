import { set_gas_composition } from "../helpers/GasComposition";
import { set_blood_composition } from "../helpers/BloodComposition";

export class Ecls {
  static model_type = "Ecls";
  static model_interface = [];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  pres_atm = 760.0;
  ecls_running = false;
  ecls_clamped = false;
  fio2_gas_baseline = 0.205;
  fio2_gas = 0.205;
  fico2_gas_baseline = 0.000392;
  fico2_gas = 0.000392;
  co2_gas_flow = 0.4;
  temp_gas = 37.0;
  humidity_gas = 1.0;
  sweep_gas = 1.0;
  drainage_site = "RA";
  return_site = "AAR";
  drainage_cannula_length = 0.011;
  drainage_cannula_size = 12;
  drainage_cannula_diameter = 0.3;
  return_cannula_length = 0.011;
  return_cannula_size = 10;
  return_cannula_diameter = 0.3;
  tubing_size = 0.25;
  tubing_elastance = 11600;
  tubing_diameter = 0.3;
  tubing_in_length = 1.0;
  tubing_out_length = 1.0;
  diff_o2 = 0.001;
  diff_o2_factor = 1.0;
  diff_co2 = 0.001;
  diff_co2_factor = 1.0;
  pump_volume = 0.8;
  oxy_volume = 0.8;
  oxy_resistance = 1000;
  oxy_resistance_factor = 1.0;
  inlet_res = 20000.0;
  inlet_res_factor = 1.0;
  outlet_res = 20000.0;
  outlet_res_factor = 1.0;
  pump_rpm = 0.0;

  // dependent parameters
  pre_oxy_ph = 0.0;
  pre_oxy_po2 = 0.0;
  pre_oxy_pco2 = 0.0;
  pre_oxy_hco3 = 0.0;
  pre_oxy_be = 0.0;
  pre_oxy_so2 = 0.0;

  post_oxy_ph = 0.0;
  post_oxy_po2 = 0.0;
  post_oxy_pco2 = 0.0;
  post_oxy_hco3 = 0.0;
  post_oxy_be = 0.0;
  post_oxy_so2 = 0.0;

  ven_pres = 0.0;
  pre_oxy_pres = 0.0;
  post_oxy_pres = 0.0;
  tmp_pres = 0.0;
  flow = 0.0;
  gas_flow = 0.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;

  _drainage_cannula = {}; // bloodresistor
  _tubing_in = {}; // bloodcapacitance
  _tubing_in_pump = {}; // bloodresistor
  _pump = {}; // bloodpump
  _pump_bridge = {}; // bloodresistor
  _bridge = {};
  _bridge_oxy = {}; // bloodresistor
  _oxy = {}; // bloodcapacitance
  _oxy_tubing_out = {}; // bloodresistor
  _tubing_out = {}; // bloodcapacitance
  _return_cannula = {}; // bloodresistor

  _gas_in = {}; // gascapacitance
  _gas_in_oxy = {}; // gasresistor
  _gas_oxy = {}; // gascapacitance
  _gas_oxy_out = {}; // gasresistor
  _gas_out = {}; // gascapacitance

  _gasex = {}; // gasexchanger
  _ecls_parts = [];

  _update_counter = 0.0;
  _update_interval = 1.0;

  // the constructor builds a bare bone modelobject of the correct type and with the correct name and stores a reference to the modelengine object
  constructor(model_ref, name = "", type = "") {
    // name of the model
    this.name = name;

    // model type
    this.model_type = type;

    // reference to the model engine
    this._model_engine = model_ref;
  }

  init_model(args) {
    // process the parameters
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // set the modeling step size
    this._t = this._model_engine.modeling_stepsize;

    // build the ecls system
    this.build_blood_part();
    this.build_gas_part();
    this.build_gasexchanger();

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  build_tubing_in() {
    // define a blood capacitance which represents the tubing on the inlet side
    this._tubing_in = this._model_engine.models["ECLS_TUBIN"];

    // calculate the tubing diameter from the tubing size
    this.tubing_diameter = this.tubing_size * 0.0254;

    // we need to calculate the unstressed volume of the tubing depending on the length and diameter
    let tubing_in_uvol = this.calc_volume(
      this.tubing_in_length,
      this.tubing_diameter
    );

    this._tubing_in.init_model([
      { key: "is_enabled", value: false },
      { key: "fixed_composition", value: false },
      { key: "vol", value: tubing_in_uvol },
      { key: "u_vol", value: tubing_in_uvol },
      { key: "el_base", value: this.tubing_elastance },
    ]);

    // set the electrolytes
    this._tubing_in.solutes = { ...this._model_engine.models["AA"].solutes };
    this._tubing_in.aboxy = { ...this._model_engine.models["AA"].aboxy };

    // calculate the starting pressure
    this._tubing_in.calc_model();

    // add the tubing in to the ecls parts list
    this._ecls_parts.push(this._tubing_in);
  }

  build_tubing_out() {
    // define a blood capacitance which represents the tubing on the inlet side
    this._tubing_out = this._model_engine.models["ECLS_TUBOUT"];

    // calculate the tubing diameter from the tubing size
    this.tubing_diameter = this.tubing_size * 0.0254;

    // we need to calculate the unstressed volume of the tubing depending on the length and diameter
    let tubing_out_uvol = this.calc_volume(
      this.tubing_out_length,
      this.tubing_diameter
    );
    this._tubing_out.init_model([
      { key: "is_enabled", value: false },
      { key: "fixed_composition", value: false },
      { key: "vol", value: tubing_out_uvol },
      { key: "u_vol", value: tubing_out_uvol },
      { key: "el_base", value: this.tubing_elastance },
    ]);

    // set the electrolytes
    this._tubing_out.solutes = { ...this._model_engine.models["AA"].solutes };
    this._tubing_out.aboxy = { ...this._model_engine.models["AA"].aboxy };

    // calculate the starting pressure
    this._tubing_out.calc_model();

    // add the tubing in to the ecls parts list
    this._ecls_parts.push(this._tubing_out);
  }

  build_oxy() {
    // define a blood capacitance which represents the tubing between the pump and oxygenator
    this._bridge = this._model_engine.models["ECLS_BRIDGE"];

    // calculate the tubing diameter from the tubing size
    this.tubing_diameter = this.tubing_size * 0.0254;

    // we need to calculate the unstressed volume of the tubing depending on the length and diameter
    let bridge_uvol = this.calc_volume(
      this.tubing_in_length / 2.0,
      this.tubing_diameter
    );

    // define a blood capacitance which represents the tubing between the pump and oxygenator
    this._bridge.init_model([
      { key: "is_enabled", value: false },
      { key: "fixed_composition", value: false },
      { key: "vol", value: bridge_uvol },
      { key: "u_vol", value: bridge_uvol },
      { key: "el_base", value: this.tubing_elastance },
    ]);

    // set the electrolytes
    this._bridge.solutes = { ...this._model_engine.models["AA"].solutes };
    this._bridge.aboxy = { ...this._model_engine.models["AA"].aboxy };

    // calculate the starting pressure
    this._bridge.calc_model();
    // add the tubing in to the ecls parts list
    this._ecls_parts.push(this._bridge);

    // define a blood capacitance which represents the tubing on the inlet side
    this._oxy = this._model_engine.models["ECLS_OXY"];
    this._oxy.init_model([
      { key: "is_enabled", value: false },
      { key: "fixed_composition", value: false },
      { key: "vol", value: this.oxy_volume },
      { key: "u_vol", value: this.oxy_volume },
      { key: "el_base", value: 10000 },
    ]);

    // set the electrolytes
    this._oxy.solutes = { ...this._model_engine.models["AA"].solutes };
    this._oxy.aboxy = { ...this._model_engine.models["AA"].aboxy };

    // calculate the starting pressure
    this._oxy.calc_model();
    // add the tubing in to the ecls parts list
    this._ecls_parts.push(this._oxy);
  }

  init_pump() {
    // define a blood capacitance which represents the tubing on the inlet side
    this._pump.init_model([
      { key: "is_enabled", value: false },
      { key: "fixed_composition", value: false },
      { key: "vol", value: this.pump_volume },
      { key: "u_vol", value: this.pump_volume },
      { key: "el_base", value: this.tubing_elastance },
      { key: "inlet", value: this._tubing_in_pump },
      { key: "outlet", value: this._pump_oxy },
    ]);
    // set the electrolytes
    this._pump.solutes = { ...this._model_engine.models["AA"].solutes };
    this._pump.aboxy = { ...this._model_engine.models["AA"].aboxy };
    // calculate the starting pressure
    this._pump.calc_model();

    // add the tubing in to the ecls parts list
    this._ecls_parts.push(this._pump);
  }

  build_blood_part() {
    this.build_tubing_in();
    this.build_tubing_out();
    this.build_oxy();

    // define a blood pump but don't initialize it because the connectors have not been built yet
    this._pump = this._model_engine.models["ECLS_PUMP"];

    // calculate the drainage cannula diameter
    this.drainage_cannula_diameter =
      (this.drainage_cannula_size * 0.33) / 1000.0;

    // calculate the return cannula diameter (1 Fr is 0.33 mm)
    this.return_cannula_diameter = (this.return_cannula_size * 0.33) / 1000.0;

    // calculate the resistance of this cannula depending on the length and diameter
    let drainage_res = this.calc_resistance_tube(
      this.drainage_cannula_diameter,
      this.drainage_cannula_length
    );

    let return_res = this.calc_resistance_tube(
      this.return_cannula_diameter,
      this.return_cannula_length
    );

    // connect the parts
    this._drainage_cannula = this._model_engine.models["ECLS_DR"];
    this._drainage_cannula.init_model([
      { key: "is_enabled", value: false },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      {
        key: "comp_from",
        value: this._model_engine.models[this.drainage_site],
      },
      { key: "comp_to", value: this._tubing_in },
      { key: "r_for", value: drainage_res },
      { key: "r_back", value: drainage_res },
      { key: "r_k", value: 0.0 },
    ]);

    // add the resistor to the list
    this._ecls_parts.push(this._drainage_cannula);

    this._tubing_in_pump = this._model_engine.models["ECLS_TUBIN_PUMP"];
    this._tubing_in_pump.init_model([
      { key: "is_enabled", value: false },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      { key: "comp_from", value: this._tubing_in },
      { key: "comp_to", value: this._pump },
      { key: "r_for", value: 50.0 },
      { key: "r_back", value: 50.0 },
      { key: "r_k", value: 0.0 },
    ]);

    // add the resistor to the list
    this._ecls_parts.push(this._tubing_in_pump);

    this._pump_bridge = this._model_engine.models["ECLS_PUMP_BRIDGE"];
    this._pump_bridge.init_model([
      { key: "is_enabled", value: false },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      { key: "comp_from", value: this._pump },
      { key: "comp_to", value: this._bridge },
      { key: "r_for", value: 50.0 },
      { key: "r_back", value: 50.0 },
      { key: "r_k", value: 0.0 },
    ]);

    // add the resistor to the list
    this._ecls_parts.push(this._pump_bridge);

    this._bridge_oxy = this._model_engine.models["ECLS_BRIDGE_OXY"];
    this._bridge_oxy.init_model([
      { key: "is_enabled", value: false },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      { key: "comp_from", value: this._bridge },
      { key: "comp_to", value: this._oxy },
      { key: "r_for", value: 50.0 },
      { key: "r_back", value: 50.0 },
      { key: "r_k", value: 0.0 },
    ]);

    // add the resistor to the list
    this._ecls_parts.push(this._bridge_oxy);

    this._oxy_tubing_out = this._model_engine.models["ECLS_OXY_TUBOUT"];
    this._oxy_tubing_out.init_model([
      { key: "is_enabled", value: false },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      { key: "comp_from", value: this._oxy },
      { key: "comp_to", value: this._tubing_out },
      { key: "r_for", value: 50.0 },
      { key: "r_back", value: 50.0 },
      { key: "r_k", value: 0.0 },
    ]);

    // add the resistor to the list
    this._ecls_parts.push(this._oxy_tubing_out);

    this._return_cannula = this._model_engine.models["ECLS_RE"];

    this._return_cannula.init_model([
      { key: "is_enabled", value: false },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      { key: "comp_from", value: this._tubing_out },
      { key: "comp_to", value: this.return_site },
      { key: "r_for", value: return_res },
      { key: "r_back", value: return_res },
      { key: "r_k", value: 0.0 },
    ]);

    // add the resistor to the list
    this._ecls_parts.push(this._return_cannula);

    // initialize the pump
    this.init_pump();
  }

  set_fio2(new_fio2) {
    this.fio2_gas = new_fio2;
    set_gas_composition(
      this._gas_in,
      this.fio2_gas,
      this.temp_gas,
      this.humidity_gas
    );
  }

  set_co2_flow(new_co2_flow) {
    if (new_co2_flow > 0.0) {
      this.co2_gas_flow = new_co2_flow;
      this.fico2_gas = (new_co2_flow * 0.001) / this.sweep_gas;
    } else {
      this.co2_gas_flow = this.fico2_gas_baseline * 1000;
      this.fico2_gas = this.fico2_gas_baseline;
    }
    set_gas_composition(
      this._gas_in,
      this.fio2_gas,
      this.temp_gas,
      this.humidity_gas,
      this.fico2_gas
    );
  }

  set_fico2(new_fico2) {
    // calculate the co2 with normal fico2 of 0.000392
    // when sweep gas is 1 l/min then the co2_flow is = 0.000392 * 1 = 0.000392 l/min

    // calculate the ml
    this.fico2_gas = new_fico2;
  }

  reconnect_drainage(comp) {
    if (this._model_engine.models[comp]) {
      this.drainage_site = comp;
      this._drainage_cannula.reconnect(comp, "ECLS_TUBIN");
    } else {
      console.log(`${comp} cannot be found in the model list`);
    }
  }

  reconnect_return(comp) {
    if (this._model_engine.models[comp]) {
      this.return_site = comp;
      this._return_cannula.reconnect("ECLS_TUBOUT", comp);
    } else {
      console.log(`${comp} cannot be found in the model list`);
    }
  }

  build_gas_part() {
    this._gas_in = this._model_engine.models["ECLS_GASIN"];
    this._gas_in.init_model([
      { key: "is_enabled", value: false },
      { key: "fixed_composition", value: true },
      { key: "vol", value: 5.4 },
      { key: "u_vol", value: 5.0 },
      { key: "el_base", value: 1000.0 },
      { key: "el_k", value: 0.0 },
      { key: "pres_atm", value: this.pres_atm },
    ]);
    // calculate the current pressure
    this._gas_in.calc_model();
    // set the gas composition
    set_gas_composition(
      this._gas_in,
      this.fio2_gas,
      this.temp_gas,
      this.humidity_gas
    );
    // add to the vent parts array
    this._ecls_parts.push(this._gas_in);

    this._gas_oxy = this._model_engine.models["ECLS_GASOXY"];
    this._gas_oxy.init_model([
      { key: "is_enabled", value: false },
      { key: "fixed_composition", value: false },
      { key: "vol", value: 0.1 },
      { key: "u_vol", value: 0.1 },
      { key: "el_base", value: 10000.0 },
      { key: "el_k", value: 0.0 },
      { key: "pres_atm", value: this.pres_atm },
    ]);
    // calculate the current pressure
    this._gas_oxy.calc_model();
    // set the gas composition
    set_gas_composition(
      this._gas_oxy,
      this.fio2_gas,
      this.temp_gas,
      this.humidity_gas
    );
    // add to the vent parts array
    this._ecls_parts.push(this._gas_oxy);

    this._gas_out = this._model_engine.models["ECLS_GASOUT"];
    this._gas_out.init_model([
      { key: "is_enabled", value: false },
      { key: "fixed_composition", value: true },
      { key: "vol", value: 5.0 },
      { key: "u_vol", value: 5.0 },
      { key: "el_base", value: 1000.0 },
      { key: "el_k", value: 0.0 },
      { key: "pres_atm", value: this.pres_atm },
    ]);
    // calculate the current pressure
    this._gas_out.calc_model();
    // set the gas composition
    set_gas_composition(this._gas_out, 0.205, 20.0, 0.5);
    // add to the vent parts array
    this._ecls_parts.push(this._gas_out);

    // connect the parts
    this._gas_in_oxy = this._model_engine.models["ECLS_GASIN_OXY"];
    this._gas_in_oxy.init_model([
      { key: "is_enabled", value: false },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      { key: "comp_from", value: this._gas_in },
      { key: "comp_to", value: this._gas_oxy },
      { key: "r_for", value: 2000.0 },
      { key: "r_back", value: 2000.0 },
      { key: "r_k", value: 0.0 },
    ]);
    this._ecls_parts.push(this._gas_in_oxy);

    this._gas_oxy_out = this._model_engine.models["ECLS_OXY_GASOUT"];
    this._gas_oxy_out.init_model([
      { key: "is_enabled", value: false },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      { key: "comp_from", value: this._gas_oxy },
      { key: "comp_to", value: this._gas_out },
      { key: "r_for", value: 50.0 },
      { key: "r_back", value: 50.0 },
      { key: "r_k", value: 0.0 },
    ]);
    this._ecls_parts.push(this._gas_oxy_out);
  }

  build_gasexchanger() {
    this._gasex = this._model_engine.models["ECLS_GASEX"];
    this._gasex.init_model([
      { key: "is_enabled", value: false },
      { key: "comp_blood", value: this._oxy },
      { key: "comp_gas", value: this._gas_oxy },
      { key: "dif_o2", value: this.diff_o2 },
      { key: "dif_co2", value: this.diff_co2 },
    ]);
    this._ecls_parts.push(this._gasex);
  }

  step_model() {
    if (this.is_enabled && this._is_initialized && this.ecls_running) {
      this.calc_model();
    }
  }

  toggle_ecls(state) {
    // turn all on
    this._ecls_parts.forEach((ecls_part) => {
      ecls_part.is_enabled = state;
    });

    // rebuild execution list
    this._model_engine.rebuildExecutionListFlag = true;

    // turn ecls on
    this.ecls_running = state;

    this._drainage_cannula.no_flow = !state;
    this._return_cannula.no_flow = !state;
  }

  toggle_clamp(state) {
    this.ecls_clamped = state;
  }
  calc_model() {
    // make sure all components are enabled
    this._ecls_parts.forEach((ecls_part) => {
      ecls_part.is_enabled = true;
    });

    // set the number of rotations of the pump
    this._pump.pump_rpm = this.pump_rpm;

    // check if ecls is clamped
    this._drainage_cannula.no_flow = this.ecls_clamped;
    this._return_cannula.no_flow = this.ecls_clamped;

    // get the dependent parameters
    this.flow = this._oxy_tubing_out.flow_lmin_avg;
    this.gas_flow = this._gas_oxy_out.flow * 60.0;
    this.ven_pres = this._tubing_in.pres;
    this.pre_oxy_pres = this._bridge.pres;
    this.post_oxy_pres = this._tubing_out.pres;
    this.tmp_pres = this.pre_oxy_pres - this.post_oxy_pres;

    // calculate the pre and post oxygenator bloodgasses
    if (this._update_counter > this._update_interval) {
      this._update_counter = 0.0;
      set_blood_composition(this._tubing_in);
      set_blood_composition(this._tubing_out);

      this.pre_oxy_ph = this._tubing_in.aboxy.ph;
      this.pre_oxy_po2 = this._tubing_in.aboxy.po2;
      this.pre_oxy_pco2 = this._tubing_in.aboxy.pco2;
      this.pre_oxy_hco3 = this._tubing_in.aboxy.hco3;
      this.pre_oxy_be = this._tubing_in.aboxy.be;
      this.pre_oxy_so2 = this._tubing_in.aboxy.so2;

      this.post_oxy_ph = this._tubing_out.aboxy.ph;
      this.post_oxy_po2 = this._tubing_out.aboxy.po2;
      this.post_oxy_pco2 = this._tubing_out.aboxy.pco2;
      this.post_oxy_hco3 = this._tubing_out.aboxy.hco3;
      this.post_oxy_be = this._tubing_out.aboxy.be;
      this.post_oxy_so2 = this._tubing_out.aboxy.so2;

      // calculate the tubing diameter from the tubing size
      this.tubing_diameter = this.tubing_size * 0.0254;

      // calculate the drainage cannula diameter
      this.drainage_cannula_diameter =
        (this.drainage_cannula_size * 0.33) / 1000.0;

      // calculate the return cannula diameter (1 Fr is 0.33 mm)
      this.return_cannula_diameter = (this.return_cannula_size * 0.33) / 1000.0;

      // calculate the resistance of these cannulas depending on the length and diameter
      let drainage_res = this.calc_resistance_tube(
        this.drainage_cannula_diameter,
        this.drainage_cannula_length
      );

      this._drainage_cannula.r_for = drainage_res * this.inlet_res_factor;
      this._drainage_cannula.r_back = drainage_res * this.inlet_res_factor;

      let return_res = this.calc_resistance_tube(
        this.return_cannula_diameter,
        this.return_cannula_length
      );

      this._return_cannula.r_for = return_res * this.outlet_res_factor;
      this._return_cannula.r_back = return_res * this.outlet_res_factor;

      // calculate the oxgenator resistance
      this._oxy_tubing_out.r_for =
        this.oxy_resistance * this.oxy_resistance_factor;
      this._oxy_tubing_out.r_back =
        this.oxy_resistance * this.oxy_resistance_factor;

      // set the resistance of the inspiration valve for the sweep gas flow
      if (this.sweep_gas > 0.0) {
        this._gas_in_oxy.r_for =
          (this._gas_in.pres - this.pres_atm) / (this.sweep_gas / 60.0);
      }

      // set the diffusion coeeficients of the oxygenator
      this._gasex.dif_o2 = this.diff_o2 * this.diff_o2_factor;
      this._gasex.dif_co2 = this.diff_co2 * this.diff_co2_factor;
    }
    this._update_counter += this._t;
  }

  calc_volume(length, diameter) {
    // return the volume in liters
    return Math.PI * Math.pow(0.5 * diameter, 2) * length * 1000.0;
  }

  calc_resistance_tube(diameter, length, viscosity = 6.0) {
    // 1 Fr= 0.33 mm

    // resistance is calculated using Poiseuille's Law : R = (8 * n * L) / (PI * r^4)

    // we have to watch the units carefully where we have to make sure that the units in the formula are
    // resistance is in mmHg * s / l
    // L = length in meters from millimeters
    // r = radius in meters from millimeters
    // n = viscosity in centiPoise

    // convert viscosity from centiPoise to Pa * s
    let n_pas = viscosity / 1000.0;

    // convert the length to meters
    let length_meters = length;

    // calculate radius in meters
    let radius_meters = diameter / 2;

    // calculate the resistance    Pa *  / m3
    let res =
      (8.0 * n_pas * length_meters) / (Math.PI * Math.pow(radius_meters, 4));

    // convert resistance of Pa/m3 to mmHg/l
    res = res * 0.00000750062;
    return res;
  }
}
