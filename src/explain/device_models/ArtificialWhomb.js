import { BloodCapacitance } from "../ModelIndex";
import { BloodResistor } from "../ModelIndex";
import { GasCapacitance } from "../ModelIndex";
import { set_gas_composition } from "../helpers/GasComposition";
import { GasResistor } from "../ModelIndex";
import { GasExchanger } from "../ModelIndex";

export class ArtificialWhomb {
  static model_type = "ArtificialWhomb";
  static model_interface = [];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  fio2 = 0.205;
  humidity = 1.0;
  temp = 37.0;
  p_atm = 760;
  origin = "AD";
  target = "IVCE";

  aw_gas_in = {};
  aw_gas_in_oxy = {};
  aw_gas_oxy = {};
  aw_gas_oxy_out = {};
  aw_gas_out = {};

  aw_blood_oxy = {};
  aw_blood_oxy_in = {};
  aw_blood_oxy_out = {};

  // dependent parameters

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _aw_parts = [];

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

    // build the whomb
    this.build_artificial_whomb();

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  build_artificial_whomb() {
    // define a array holding all the parts
    this._aw_parts = [];

    // build the gas part of the artifical whomb
    this.build_gas_part();

    // build the blood part of the artificial whomb
    this.build_blood_part();
  }

  build_blood_part() {
    // build the oxygenator blood part
    this.aw_blood_oxy = new BloodCapacitance(
      this._model_engine,
      "aw_blood_oxy",
      "BloodCapacitance"
    );
    this.aw_blood_oxy.init_model([
      { key: "name", value: "aw_blood_oxy" },
      { key: "model_type", value: "BloodCapacitance" },
      { key: "description", value: "blood part of the oxygenator reservoir" },
      { key: "is_enabled", value: true },
      { key: "vol", value: 0.8 },
      { key: "u_vol", value: 0.8 },
      { key: "el_base", value: 10000.0 },
      { key: "el_k", value: 0.0 },
    ]);
    // set the solutes of the lung
    this.aw_blood_oxy.solutes = { ...this._model_engine.models["AA"].solutes };
    this.aw_blood_oxy.aboxy = {
      ...this._model_engine.models["AA"].aboxy,
    };
    this.aw_blood_oxy.calc_model();
    // add to the aw parts list
    this._aw_parts.push(this.aw_blood_oxy);

    // connect the blood parts
    this.aw_blood_oxy_in = new BloodResistor(
      this._model_engine,
      "aw_blood_oxy_in",
      "BloodResistor"
    );
    this.aw_blood_oxy_in.init_model([
      { key: "name", value: "aw_blood_oxy_in" },
      { key: "model_type", value: "BloodResistor" },
      { key: "description", value: "body to aw oxygenator" },
      { key: "is_enabled", value: true },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      { key: "comp_from", value: this.origin },
      { key: "comp_to", value: this.aw_blood_oxy },
      { key: "r_for", value: 150000.0 },
      { key: "r_back", value: 150000.0 },
      { key: "r_k", value: 0.0 },
    ]);
    // add to the vent parts array
    this._aw_parts.push(this.aw_blood_oxy_in);

    this.aw_blood_oxy_out = new BloodResistor(
      this._model_engine,
      "aw_blood_oxy_out",
      "BloodResistor"
    );
    this.aw_blood_oxy_out.init_model([
      { key: "name", value: "aw_blood_oxy_out" },
      { key: "model_type", value: "BloodResistor" },
      { key: "description", value: "aw oxygenator to body" },
      { key: "is_enabled", value: true },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      { key: "comp_from", value: this.aw_blood_oxy },
      { key: "comp_to", value: this.target },
      { key: "r_for", value: 1500000.0 },
      { key: "r_back", value: 1500000.0 },
      { key: "r_k", value: 0.0 },
    ]);
    // add to the vent parts array
    this._aw_parts.push(this.aw_blood_oxy_out);
  }

  build_gas_part() {
    // aw gas reservoir
    this.aw_gas_in = new GasCapacitance(
      this._model_engine,
      "aw_gas_in",
      "GasCapacitance"
    );
    this.aw_gas_in.init_model([
      { key: "name", value: "aw_gas_in" },
      { key: "model_type", value: "GasCapacitance" },
      { key: "description", value: "artificial whomb gas reservoir" },
      { key: "is_enabled", value: true },
      { key: "fixed_composition", value: true },
      { key: "vol", value: 5.4 },
      { key: "u_vol", value: 5.0 },
      { key: "el_base", value: 1000.0 },
      { key: "el_k", value: 0.0 },
      { key: "pres_atm", value: this.p_atm },
    ]);
    // calculate the current pressure
    this.aw_gas_in.calc_model();
    // set the gas composition
    set_gas_composition(this.aw_gas_in, this.fio2, this.temp, this.humidity);
    // add to the vent parts array
    this._aw_parts.push(this.aw_gas_in);

    // aw gas lung
    this.aw_gas_oxy = new GasCapacitance(
      this._model_engine,
      "aw_gas_oxy",
      "GasCapacitance"
    );
    this.aw_gas_in.init_model([
      { key: "name", value: "aw_gas_oxy" },
      { key: "model_type", value: "GasCapacitance" },
      { key: "description", value: "gas part of the oxygenator" },
      { key: "is_enabled", value: true },
      { key: "fixed_composition", value: false },
      { key: "vol", value: 0.8 },
      { key: "u_vol", value: 0.8 },
      { key: "el_base", value: 10000.0 },
      { key: "el_k", value: 0.0 },
      { key: "pres_atm", value: this.p_atm },
    ]);
    // calculate the current pressure
    this.aw_gas_oxy.calc_model();
    // set the gas composition
    set_gas_composition(this.aw_gas_oxy, this.fio2, this.temp, this.humidity);
    // add to the vent parts array
    this._aw_parts.push(this.aw_gas_oxy);

    // aw gas out reservoir
    this.aw_gas_out = new GasCapacitance(
      this._model_engine,
      "aw_gas_out",
      "GasCapacitance"
    );
    this.aw_gas_out.init_model([
      { key: "name", value: "aw_gas_out" },
      { key: "model_type", value: "GasCapacitance" },
      { key: "description", value: "artificial whomb out gas reservoir" },
      { key: "is_enabled", value: true },
      { key: "fixed_composition", value: true },
      { key: "vol", value: 5.0 },
      { key: "u_vol", value: 5.0 },
      { key: "el_base", value: 1000.0 },
      { key: "el_k", value: 0.0 },
      { key: "pres_atm", value: this.p_atm },
    ]);
    // calculate the current pressure
    this.aw_gas_out.calc_model();
    // set the gas composition
    set_gas_composition(this.aw_gas_out, this.fio2, this.temp, this.humidity);
    // add to the vent parts array
    this._aw_parts.push(this.aw_gas_out);

    // connect the gas parts
    this.aw_gas_in_oxy = new GasResistor(
      this._model_engine,
      "aw_gas_in_oxy",
      "GasResistor"
    );
    this.aw_gas_in_oxy.init_model([
      { key: "name", value: "aw_gas_in_oxy" },
      { key: "model_type", value: "GasResistor" },
      { key: "description", value: "gas in to oxygenator connector" },
      { key: "is_enabled", value: true },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      { key: "comp_from", value: this.aw_gas_in },
      { key: "comp_to", value: this.aw_gas_oxy },
      { key: "r_for", value: 50.0 },
      { key: "r_back", value: 50.0 },
      { key: "r_k", value: 0.0 },
    ]);
    // add to the aw parts array
    this._aw_parts.push(this.aw_gas_in_oxy);

    // connect the gas parts
    this.aw_gas_oxy_out = new GasResistor(
      this._model_engine,
      "aw_gas_oxy_out",
      "GasResistor"
    );
    this.aw_gas_oxy_out.init_model([
      { key: "name", value: "aw_gas_oxy_out" },
      { key: "model_type", value: "GasResistor" },
      { key: "description", value: "oxygenator to gas out connector" },
      { key: "is_enabled", value: true },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      { key: "comp_from", value: this.aw_gas_oxy },
      { key: "comp_to", value: this.aw_gas_oxy },
      { key: "r_for", value: 50.0 },
      { key: "r_back", value: 50.0 },
      { key: "r_k", value: 0.0 },
    ]);
    // add to the vent parts array
    this._aw_parts.push(this.aw_gas_oxy_out);
  }
  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    // do the model step of the ventilator parts
    //this._aw_parts.forEach((_aw_part) => _aw_part.step_model());
  }
}
