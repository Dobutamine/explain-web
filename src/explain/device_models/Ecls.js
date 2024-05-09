import { set_gas_composition } from "../helpers/GasComposition";

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
  fio2_gas = 0.205;
  fico2_gas = 0.0004;
  temp_gas = 37.0;
  humidity_gas = 1.0;
  sweep_gas = 1.0;
  drainage_site = "RA";
  return_site = "AAR";
  drainage_cannula_length = 0.011;
  drainage_cannula_diameter = 0.3;
  return_cannula_length = 0.011;
  return_cannula_diameter = 0.3;
  tubing_elastance = 11600;
  tubing_diameter = 0.3;
  tubing_in_length = 1.0;
  tubing_out_length = 1.0;
  diff_o2 = 0.001;
  diff_co2 = 0.001;
  pump_volume = 0.8;
  oxy_volume = 0.8;
  inlet_res = 20000.0;
  outlet_res = 20000.0;
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
  _pump_oxy = {}; // bloodresistor
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

    // calculate the resistance of this cannula depending on the length and diameter
    let drainage_res = this.inlet_res;
    let return_res = this.outlet_res;

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

    this._pump_oxy = this._model_engine.models["ECLS_PUMP_OXY"];
    this._pump_oxy.init_model([
      { key: "is_enabled", value: false },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      { key: "comp_from", value: this._pump },
      { key: "comp_to", value: this._oxy },
      { key: "r_for", value: 50.0 },
      { key: "r_back", value: 50.0 },
      { key: "r_k", value: 0.0 },
    ]);

    // add the resistor to the list
    this._ecls_parts.push(this._pump_oxy);

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
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    this._pump.pump_rpm = this.pump_rpm;

    this._drainage_cannula.r_for = this.inlet_res;
    this._drainage_cannula.r_back = this.inlet_res;

    this._return_cannula.r_for = this.outlet_res;
    this._return_cannula.r_back = this.outlet_res;

    // set the resistance of the inspiration valve
    this._gas_in_oxy.r_for =
      (this._gas_in.pres - this.pres_atm) / (this.sweep_gas / 60.0);

    // do the model step of the ventilator parts
    this._ecls_parts.forEach((_ecls_part) => _ecls_part.step_model());

    // get the dependent parameters
    this.flow = this._oxy_tubing_out.flow * 60.0;
    this.gas_flow = this._gas_oxy_out.flow * 60.0;
  }

  calc_volume(length, diameter) {
    // return the volume in liters
    return Math.PI * (0.5 * diameter) * length * 1000.0;
  }
}
