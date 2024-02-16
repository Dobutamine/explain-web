import { GasCapacitance } from "../core_models/GasCapacitance";
import {
  set_gas_composition,
  calc_gas_composition,
} from "../helpers/GasComposition";
import { GasExchanger } from "../core_models/GasExchanger";
import { GasResistor } from "../core_models/GasResistor";

export class Ventilator {
  static class_type = "Ventilator";
  static indepent_parameters = [];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  p_atm = 760.0;
  fio2 = 0.205;
  temp = 37.0;
  humidity = 1.0;
  vent_running = true;
  ettube_diameter = 0.0035;
  ettube_length = 0.11;
  vent_mode = "PRVC";
  vent_rate = 40.0;
  insp_time = 0.4;
  insp_flow = 10.0;
  exp_flow = 3.0;
  pip_cmh2o = 10.3;
  pip_cmh2o_max = 20.0;
  peep_cmh2o = 3.65;
  tidal_volume = 0.0165;
  trigger_volume_perc = 6;
  synchronized = false;

  // ventilator parts
  vent_in = {};
  insp_valve = {};
  vent_circuit = {};
  et_tube = {};
  exp_valve = {};
  vent_out = {};

  // dependent parameters
  pres = 0.0;
  pres_cmh2o = 0.0;
  flow = 0.0;
  vol = 0.0;
  compliance = 0.0;
  elastance = 0.0;
  resistance = 0.0;
  co2 = 0.0;
  etco2 = 0.0;
  exp_time = 0.8;
  insp_tidal_volume = 0.0;
  exp_tidal_volume = 0.0;
  minute_volume = 0.0;
  trigger_volume = 0.0;
  tv_kg = 0.0;
  vc_po2 = 0.0;
  vc_pco2 = 0.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _vent_parts = [];
  _insp_time_counter = 0.0;
  _exp_time_counter = 0.0;
  _inspiration = true;
  _expiration = false;
  _insp_tidal_volume_counter = 0.0;
  _exp_tidal_volume_counter = 0.0;
  _trigger_volume_counter = 0.0;
  _tube_resistance = 25.0;
  _max_flow = 0.0;
  _pres_reached = false;
  _pip = 0.0;
  _pip_max = 0.0;
  _peep = 0.0;
  _tv_tolerance = 0.0005; // tidal volume tolerance for volume control in l
  _triggered_breath = false;

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

    // build the ventilator
    this.build_ventilator();

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  build_ventilator() {
    // clear the ventilator parts list
    this._vent_parts = [];

    // ventilator gas reservoir
    this.vent_in = new GasCapacitance(
      this._model_engine,
      "vent_in",
      "GasCapacitance"
    );
    this.vent_in.init_model([
      { key: "name", value: "vent_in" },
      { key: "model_type", value: "GasCapacitance" },
      { key: "description", value: "ventilator gas reservoir" },
      { key: "is_enabled", value: true },
      { key: "fixed_composition", value: true },
      { key: "vol", value: 5.4 },
      { key: "u_vol", value: 5.0 },
      { key: "el_base", value: 1000.0 },
      { key: "el_k", value: 0.0 },
      { key: "pres_atm", value: this.p_atm },
    ]);
    // calculate the current pressure
    this.vent_in.calc_model();
    // set the gas composition
    set_gas_composition(this.vent_in, this.fio2, this.temp, this.humidity);
    // add to the vent parts array
    this._vent_parts.push(this.vent_in);

    // ventilator circuit
    this.vent_circuit = new GasCapacitance(
      this._model_engine,
      "vent_circuit",
      "GasCapacitance"
    );
    this.vent_circuit.init_model([
      { key: "name", value: "vent_circuit" },
      { key: "model_type", value: "GasCapacitance" },
      { key: "description", value: "ventilator circuit" },
      { key: "is_enabled", value: true },
      { key: "fixed_composition", value: false },
      { key: "vol", value: 0.262 },
      { key: "u_vol", value: 0.262 },
      { key: "el_base", value: 1130.0 },
      { key: "el_k", value: 0.0 },
      { key: "pres_atm", value: this.p_atm },
    ]);
    // calculate the current pressure
    this.vent_circuit.calc_model();
    // set the gas composition
    set_gas_composition(this.vent_circuit, this.fio2, this.temp, this.humidity);
    // add to the vent parts array
    this._vent_parts.push(this.vent_circuit);

    // ventilator out reservoir
    this.vent_out = new GasCapacitance(
      this._model_engine,
      "vent_out",
      "GasCapacitance"
    );
    this.vent_out.init_model([
      { key: "name", value: "vent_out" },
      { key: "model_type", value: "GasCapacitance" },
      { key: "description", value: "ventilator out gas reservoir" },
      { key: "is_enabled", value: true },
      { key: "fixed_composition", value: true },
      { key: "vol", value: 5.0 },
      { key: "u_vol", value: 5.0 },
      { key: "el_base", value: 1000.0 },
      { key: "el_k", value: 0.0 },
      { key: "pres_atm", value: this.p_atm },
    ]);
    // calculate the current pressure
    this.vent_out.calc_model();
    // set the gas composition
    set_gas_composition(this.vent_out, this.fio2, this.temp, this.humidity);
    // add to the vent parts array
    this._vent_parts.push(this.vent_out);

    // connect the parts
    this.insp_valve = new GasResistor(
      this._model_engine,
      "insp_valve",
      "GasResistor"
    );
    this.insp_valve.init_model([
      { key: "name", value: "insp_valve" },
      { key: "model_type", value: "GasResistor" },
      { key: "description", value: "inspiratory valve" },
      { key: "is_enabled", value: true },
      { key: "no_flow", value: true },
      { key: "no_back_flow", value: false },
      { key: "comp_from", value: this.vent_in },
      { key: "comp_to", value: this.vent_circuit },
      { key: "r_for", value: 2000.0 },
      { key: "r_back", value: 2000.0 },
      { key: "r_k", value: 0.0 },
    ]);
    // add to the vent parts array
    this._vent_parts.push(this.insp_valve);

    this.et_tube = new GasResistor(
      this._model_engine,
      "et_tube",
      "GasResistor"
    );
    this.et_tube.init_model([
      { key: "name", value: "et_tube" },
      { key: "model_type", value: "GasResistor" },
      { key: "description", value: "inspiratory tube" },
      { key: "is_enabled", value: true },
      { key: "no_flow", value: true },
      { key: "no_back_flow", value: false },
      { key: "comp_from", value: this.vent_circuit },
      { key: "comp_to", value: this._model_engine.models["DS"] },
      { key: "r_for", value: 100.0 },
      { key: "r_back", value: 100.0 },
      { key: "r_k", value: 0.0 },
    ]);
    // add to the vent parts array
    this._vent_parts.push(this.et_tube);

    this.exp_valve = new GasResistor(
      this._model_engine,
      "exp_valve",
      "GasResistor"
    );
    this.exp_valve.init_model([
      { key: "name", value: "exp_valve" },
      { key: "model_type", value: "GasResistor" },
      { key: "description", value: "expiratory tube" },
      { key: "is_enabled", value: true },
      { key: "no_flow", value: true },
      { key: "no_back_flow", value: false },
      { key: "comp_from", value: this.vent_circuit },
      { key: "comp_to", value: this.vent_out },
      { key: "r_for", value: 2000.0 },
      { key: "r_back", value: 2000.0 },
      { key: "r_k", value: 0.0 },
    ]);
    // add to the vent parts array
    this._vent_parts.push(this.exp_valve);
  }

  set_ventilator_cpap(peep = 4.0, rate = 1.0, t_in = 0.4, insp_flow = 10.0) {
    this.pip_cmh2o = peep + 0.5;
    this.pip_cmh2o_max = peep + 0.5;
    this.peep = peep;
    this.vent_rate = 0.01;
    this.insp_time = t_in;
    this.insp_flow = insp_flow;
    this.synchronized = false;
    this.vent_mode = "CPAP";
  }
  set_ventilator_pc(
    pip = 14.0,
    peep = 4.0,
    rate = 40.0,
    t_in = 0.4,
    insp_flow = 10.0
  ) {
    this.pip_cmh2o = pip;
    this.pip_cmh2o_max = pip;
    this.peep_cmh2o = peep;
    this.vent_rate = rate;
    this.insp_time = t_in;
    this.insp_flow = insp_flow;
    this.vent_mode = "PC";
  }
  set_ventilator_prvc(
    pip_max = 18.0,
    peep = 4.0,
    rate = 40.0,
    tv = 15.0,
    t_in = 0.4,
    insp_flow = 10.0
  ) {
    this.pip_cmh2o = pip_max;
    this.pip_cmh2o_max = pip_max;
    this.peep_cmh2o = peep;
    this.vent_rate = rate;
    this.insp_time = t_in;
    this.tidal_volume = tv / 1000.0;
    this.insp_flow = insp_flow;
    this.vent_mode = "PRVC";
  }
  set_ventilator_mode(new_mode) {
    if (new_mode == "PRVC" || new_mode == "PC" || new_mode == "CPAP") {
      this.vent_mode = new_mode;
    }
  }

  switch_ventilator(state) {
    this._model_engine.models["MOUTH_DS"].no_flow = state;
    this._model_engine.models["Breathing"].is_intubated = state;
    this._model_engine.models["Breathing"].breathing_enabled = !state;
    this.et_tube.no_flow = !state;
    this.vent_running = state;
    this.is_enabled = state;
  }
  step_model() {
    if (this.is_enabled && this.vent_running) {
      this.calc_model();
    }
  }

  calc_model() {
    // convert settings to mmHg from cmH2o
    this._pip = this.pip_cmh2o / 1.35951;
    this._pip_max = this.pip_cmh2o_max / 1.35951;
    this._peep = this.peep_cmh2o / 1.35951;

    // // check for triggered breath
    // this.trigger_volume = (this.tidal_volume / 100) * this.trigger_volume_perc;
    // if (
    //   this._trigger_volume_counter > this.trigger_volume &&
    //   !this._triggered_breath
    // ) {
    //   this._triggered_breath = true;
    //   // reset the trigger volume counter
    //   this._trigger_volume_counter = 0.0;
    // }

    // // calculate the triggered volume
    // if (
    //   !this._triggered_breath &&
    //   !this._inspiration &&
    //   this.et_tube.flow > 0.0
    // ) {
    //   this._trigger_volume_counter += this.et_tube.flow * this._t;
    // }

    // calculate the expiration time
    this.exp_time = 60.0 / this.vent_rate - this.insp_time;

    // has the inspiration time elapsed?
    if (this._insp_time_counter > this.insp_time) {
      this._insp_time_counter = 0.0;
      this._inspiration = false;
      this._expiration = true;
      this._triggered_breath = false;
      this.etco2 = this._model_engine.models["DS"].pco2;
    }

    // has the expiration time elapsed?
    if (this._exp_time_counter > this.exp_time || this._triggered_breath) {
      this._triggered_breath = false;
      this.vol = 0.0;
      this._exp_time_counter = 0.0;
      this._inspiration = true;
      this._expiration = false;
      // reset the volume counters
      this.exp_tidal_volume = -this._exp_tidal_volume_counter;
      this.tv_kg = (this.exp_tidal_volume * 1000.0) / this._model_engine.weight;

      if (this.exp_tidal_volume > 0) {
        this.elastance = (this._pip - this._peep) / this.exp_tidal_volume; // in mmHg/l
        this.compliance =
          1 /
          (((this._pip - this._peep) * 1.35951) /
            (this.exp_tidal_volume * 1000.0)); // in ml/cmH2O
      }
      this._exp_tidal_volume_counter = 0.0;
      // check whether the ventilator is in PRVC mode
      if (this.vent_mode == "PRVC") {
        this.pressure_regulated_volume_control();
      }
    }

    // inspiration
    if (this._inspiration) {
      this._insp_time_counter += this._t;
    }

    if (this._expiration) {
      this._exp_time_counter += this._t;
    }

    // call the correct ventilation mode
    this.pressure_control();

    // store the values
    this.pres = (this.vent_circuit.pres - this.p_atm) * 1.35951; // in cmH2O
    this.flow = this.et_tube.flow * 60.0; // in l/min
    this.vol += this.et_tube.flow * 1000 * this._t; // in ml
    this.co2 = this._model_engine.models["DS"].pco2; // in mmHg
    this.vc_po2 = this.vent_circuit.po2;
    this.vc_pco2 = this.vent_circuit.pco2;

    this._vent_parts.forEach((vent_part) => vent_part.step_model());
  }

  pressure_control() {
    if (this._inspiration) {
      // close the expiration valve and open the inspiration valve
      this.exp_valve.no_flow = true;
      this.insp_valve.no_flow = false;

      // prevent back flow to the ventilator
      this.insp_valve.no_back_flow = true;

      // set the resistance of the inspiration valve
      this.insp_valve.r_for =
        (this.vent_in.pres + this._pip - this.p_atm - this._peep) /
        (this.insp_flow / 60.0);

      // guard the inspiratory pressure
      if (this.vent_circuit.pres > this._pip + this.p_atm) {
        this.insp_valve.no_flow = true;
        this.insp_valve.r_for_factor = 1.0;
        if (this.insp_valve.flow > 0 && !this._pres_reached) {
          this.resistance =
            (this.vent_circuit.pres - this.p_atm) / this.insp_valve.flow;
          this._pres_reached = true;
        }
      }
    }

    if (this._expiration) {
      this._pres_reached = false;
      // close the inspiration valve and open the expiration valve
      this.insp_valve.no_flow = true;

      this.exp_valve.no_flow = false;
      this.exp_valve.no_back_flow = true;

      // set the resistance of the expiration valve to and calculate the pressure in the expiration block
      this.exp_valve.r_for = 10;
      this.vent_out.vol =
        this._peep / this.vent_out.el_base + this.vent_out.u_vol;

      // calculate the expiratory tidal volume
      if (this.et_tube.flow < 0) {
        this._exp_tidal_volume_counter += this.et_tube.flow * this._t;
      }
    }
  }

  pressure_regulated_volume_control() {
    if (this.exp_tidal_volume < this.tidal_volume - this._tv_tolerance) {
      console.log("too low", this.exp_tidal_volume);
      this.pip_cmh2o += 0.5;
      if (this.pip_cmh2o > this.pip_cmh2o_max) {
        this.pip_cmh2o = this.pip_cmh2o_max;
      }

      if (this.exp_tidal_volume > this.tidal_volume + this._tv_tolerance) {
        console.log("too high", this.exp_tidal_volume);
        this.pip_cmh2o -= 0.5;
        if (this.pip_cmh2o < this.peep_cmh2o + 2.0) {
          this.pip_cmh2o = this.peep_cmh2o + 2.0;
        }
      }
    }
  }
}
