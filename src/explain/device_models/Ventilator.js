import { GasCapacitance } from "../core_models/GasCapacitance";
import { set_gas_composition } from "../helpers/GasComposition";
import { GasResistor } from "../core_models/GasResistor";
import { calc_resistance_tube } from "../helpers/ResistanceTube";

export class Ventilator {
  static class_type = "Ventilator";
  static indepent_parameters = [
    {
      name: "set_ettube_resistance",
      unit: "",
      type: "function",
      factor: "",
      rounding: 1,
      local_value: "et_tube_resistance",
    },
  ];
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
  vent_running = false;
  ettube_diameter = 3.5; // in mm
  ettube_length = 110; // in mm
  ettube_length_ref = 110;
  vent_mode = "PRVC";
  vent_rate = 40.0;
  insp_time = 0.4;
  insp_flow = 10.0;
  hfo_map_cmh2o = 10.0;
  hfo_bias_flow = 10.0;
  hfo_freq = 12;
  hfo_amplitude_cmh2o = 20.0;
  exp_flow = 3.0;
  pip_cmh2o = 10.3;
  pip_cmh2o_max = 10.3;
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
  hfo_valve = {};
  hfo_out = {};

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
  et_tube_resistance = 60.0;
  hfo_pres = 0.0;

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
  _vol_reached = false;
  _pip = 0.0;
  _pip_max = 0.0;
  _peep = 0.0;
  _hfo_map = 0.0;
  _hfo_amplitude = 0.0;
  _tv_tolerance = 0.0005; // tidal volume tolerance for volume control in l
  _triggered_breath = false;
  _block_trigger_counter = 0.0;
  _block_trigger = false;
  _prev_et_tube_flow = 0.0;
  _prev_et_tube_flow_delta = 0.0;
  _peak_flow = 0.0;
  _peak_flow_temp = 0.0;
  _end_insp = false;
  _a = 0.0;
  _b = 0.0;
  _hfo_time_counter = 0;

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

    // calculate the tube resistance
    this.set_ettube_diameter(this.ettube_diameter);
    this.et_tube_resistance = this.calc_ettube_resistance(this.insp_flow);

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
      { key: "r_for", value: this.et_tube_resistance },
      { key: "r_back", value: this.et_tube_resistance },
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

  set_ettube_length(new_length) {
    this.ettube_length = new_length;
    if (new_length >= 50) {
      this.ettube_length = new_length;
    }
  }
  set_ettube_diameter(new_diameter) {
    // diameter in mm
    if (new_diameter > 1.5) {
      this.ettube_diameter = new_diameter;
      /// set the flow dependent parameters
      this._a = -2.375 * new_diameter + 11.9375;
      this._b = -14.375 * new_diameter + 65.9374;
    }
  }
  calc_ettube_resistance(flow) {
    let res =
      (this._a * flow + this._b) *
      (this.ettube_length / this.ettube_length_ref);
    if (res < 15.0) {
      res = 15;
    }
    return res;
  }
  set_tubing_length(new_length) {}

  set_fio2(new_fio2) {
    this.fio2 = new_fio2 / 100.0;
    set_gas_composition(this.vent_in, this.fio2, this.temp, this.humidity);
  }

  set_temp(new_temp) {
    if (new_temp > 0 && new_temp < 60) {
      this.temp = new_temp;
      set_gas_composition(this.vent_in, this.fio2, this.temp, this.humidity);
    }
  }

  set_humidity(new_hum) {
    if (new_hum > 0 && new_hum <= 1.0) {
      this.humidity = new_hum;
      set_gas_composition(this.vent_in, this.fio2, this.temp, this.humidity);
    }
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

  set_ventilator_hfov(
    map = 10.0,
    freq = 12.0,
    amplitude = 25,
    bias_flow = 10.0
  ) {
    this.hfo_map_cmh2o = map;
    this.hfo_freq = freq;
    this.hfo_amplitude_cmh2o = amplitude;
    this.hfo_bias_flow = bias_flow;
    this.synchronized = false;
    this.vent_mode = "HFOV";
  }

  set_trigger_perc(new_perc) {
    if (new_perc > 1.0 && new_perc < 50.0) {
      this.trigger_volume_perc = new_perc;
    }
  }

  set_ventilator_ps(
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
    this.vent_mode = "PS";
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
    //this.pip_cmh2o = pip_max;
    this.pip_cmh2o_max = pip_max;
    this.peep_cmh2o = peep;
    this.vent_rate = rate;
    this.insp_time = t_in;
    this.tidal_volume = tv / 1000.0;
    this.insp_flow = insp_flow;
    this.vent_mode = "PRVC";
  }

  set_ventilator_vc(
    pip_max = 18.0,
    peep = 4.0,
    rate = 40.0,
    tv = 15.0,
    t_in = 0.4,
    insp_flow = 10.0
  ) {
    //this.pip_cmh2o = pip_max;
    this.pip_cmh2o_max = pip_max;
    this.peep_cmh2o = peep;
    this.vent_rate = rate;
    this.insp_time = t_in;
    this.tidal_volume = tv / 1000.0;
    this.insp_flow = insp_flow;
    this.vent_mode = "VC";
  }

  set_ventilator_mode(new_mode) {
    if (new_mode == "PRVC" || new_mode == "PC" || new_mode == "CPAP") {
      this.vent_mode = new_mode;
    }
  }

  switch_ventilator(state) {
    this._model_engine.models["MOUTH_DS"].no_flow = state;
    this._model_engine.models["Breathing"].is_intubated = state;
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
    this._hfo_map = this.hfo_map_cmh2o / 1.35951;
    this._hfo_amplitude = (this.hfo_amplitude_cmh2o / 1.35951) * 0.5;

    // determine the trigger volume
    this.trigger_volume = (this.tidal_volume / 100) * this.trigger_volume_perc;

    // check whether the trigger volume is reached
    if (
      this._trigger_volume_counter > this.trigger_volume &&
      !this._triggered_breath
    ) {
      // we have a triggered breath
      this._triggered_breath = true;
      console.log("triggered breath");
      // reset the trigger volume counter
      this._trigger_volume_counter = 0.0;
    }

    // update the triggered volume
    if (
      !this._triggered_breath &&
      !this._inspiration &&
      !this._block_trigger &&
      this.et_tube.flow > 0.0
    ) {
      this._trigger_volume_counter += this.et_tube.flow * this._t;
    }

    // call the correct ventilation mode
    switch (this.vent_mode) {
      case "VC":
        this.time_cycling();
        this.volume_control();
        break;
      case "PC":
        this.time_cycling();
        this.pressure_control();
        break;
      case "PRVC":
        this.time_cycling();
        this.pressure_control();
        break;
      case "PS":
        this.flow_cycling();
        this.pressure_support();
        break;
      case "HFOV":
        this.hfov();
        break;
    }

    // store the values
    this.pres = (this.vent_circuit.pres - this.p_atm) * 1.35951; // in cmH2O
    this.flow = this.et_tube.flow * 60.0; // in l/min
    this.vol += this.et_tube.flow * 1000 * this._t; // in ml
    this.co2 = this._model_engine.models["DS"].pco2; // in mmHg
    this.vc_po2 = this.vent_circuit.po2;
    this.vc_pco2 = this.vent_circuit.pco2;
    this.minute_volume = this.exp_tidal_volume * this.vent_rate;

    // set the flow dependent endotracheal tube resistance
    this.et_tube_resistance = this.calc_ettube_resistance(this.flow);
    this.et_tube.r_for = this.et_tube_resistance;
    this.et_tube.r_back = this.et_tube_resistance;

    // do the model step of the ventilator parts
    this._vent_parts.forEach((vent_part) => vent_part.step_model());
  }
  hfov() {
    // shut down flow to patient
    this.et_tube.no_flow = false;

    // open the inspiration valve
    this.insp_valve.no_flow = false;

    // open the expiration valve
    this.exp_valve.no_flow = false;

    // back flow to the ventilator
    this.insp_valve.no_back_flow = true;

    // back flow to the ventilator
    this.exp_valve.no_back_flow = false;

    // set the resistance of the inspiration valve to supply the bias flow
    this.insp_valve.r_for =
      (this.vent_in.pres - this.p_atm - this._hfo_map) /
      (this.hfo_bias_flow / 60.0);

    // set the expiration valve
    this.exp_valve.r_for = 15;
    this.vent_out.vol =
      this._hfo_map / this.vent_out.el_base + this.vent_out.u_vol;

    let hfo_p =
      this._hfo_amplitude *
      Math.sin(2 * Math.PI * this.hfo_freq * this._hfo_time_counter);
    this._hfo_time_counter += this._t;

    this.hfo_pres = hfo_p;

    this.vent_circuit.pres_ext += hfo_p;
  }

  flow_cycling() {
    // is there flow moving to the lungs and the breath is triggered
    if (this.et_tube.flow > 0.0 && this._triggered_breath) {
      // check whether the flow is increasing
      if (this.et_tube.flow > this._prev_et_tube_flow) {
        // if increasing then keep inspiration going
        this._inspiration = true;
        this._expiration = false;
        // determine the peak flow
        if (this.et_tube.flow > this._peak_flow) {
          this._peak_flow = this.et_tube.flow;
        }
        // store the current exhaled tidal volume
        this.exp_tidal_volume = -this._exp_tidal_volume_counter;
      } else {
        // if decreasing wait until it is 70% of the peak flow
        if (this.et_tube.flow < 0.7 * this._peak_flow) {
          // go into expiration
          this._inspiration = false;
          this._expiration = true;
          // reset the tidal volume counter
          this._exp_tidal_volume_counter = 0.0;
          // reset the triggered breath flag
          this._triggered_breath = false;
        }
      }
      this._prev_et_tube_flow = this.et_tube.flow;
    }

    if (this.et_tube.flow < 0.0 && !this._triggered_breath) {
      this._peak_flow = 0.0;
      this._prev_et_tube_flow = 0.0;
      this._inspiration = false;
      this._expiration = true;
      // calculate the expiratory tidal volume
      this._exp_tidal_volume_counter += this.et_tube.flow * this._t;
    }
  }

  time_cycling() {
    // calculate the expiration time
    this.exp_time = 60.0 / this.vent_rate - this.insp_time;

    // has the inspiration time elapsed?
    if (this._insp_time_counter > this.insp_time) {
      // reset the inspiration time counter
      this._insp_time_counter = 0.0;
      // reset the inspiratory tidal volume counter
      this._insp_tidal_volume_counter = 0.0;
      // flag the inspiration and expiration
      this._inspiration = false;
      this._expiration = true;
      // reset the triggered breath flag
      this._triggered_breath = false;
      // reset the block trigger counter
      this._block_trigger_counter = 0.0;
      // as the inspiration is just finished block the triggered breath for a while
      this._block_trigger = true;
    }

    // release the triggered breath block over 1.5 times the inspiration time
    if (this._block_trigger_counter > this.insp_time * 0.25) {
      // reset the block trigger counter
      this._block_trigger_counter = 0.0;
      // release the blocked trigger lock
      this._block_trigger = false;
    }

    // has the expiration time elapsed or is the expiration phase ended by a triggered breath
    if (this._exp_time_counter > this.exp_time || this._triggered_breath) {
      // reset the expiration time counter
      this._exp_time_counter = 0.0;
      // flag the inspiration and expiration
      this._inspiration = true;
      this._expiration = false;
      // reset the triggered breath flag
      this._triggered_breath = false;
      // reset the volume counter
      this.vol = 0.0;
      // reset the volume counters
      this.exp_tidal_volume = -this._exp_tidal_volume_counter;
      // store the end tidal co2
      this.etco2 = this._model_engine.models["DS"].pco2;
      // calculate the tidal volume per kg
      this.tv_kg = (this.exp_tidal_volume * 1000.0) / this._model_engine.weight;
      // calculate the compliance of the lung
      if (this.exp_tidal_volume > 0) {
        this.compliance =
          1 /
          (((this._pip - this._peep) * 1.35951) /
            (this.exp_tidal_volume * 1000.0)); // in ml/cmH2O
      }
      // reset the expiratory tidal volume counter
      this._exp_tidal_volume_counter = 0.0;
      // check whether the ventilator is in PRVC mode because we need to adjust the pressure depending on the tidal volume
      if (this.vent_mode == "PRVC") {
        this.pressure_regulated_volume_control();
      }
    }

    // if the trigger volume is blocked increase the timer for the blokkade duration
    if (this._block_trigger) {
      this._block_trigger_counter += this._t;
    }

    // if in inspiration increase the timer
    if (this._inspiration) {
      this._insp_time_counter += this._t;
    }

    // if in expiration increase the timer
    if (this._expiration) {
      this._exp_time_counter += this._t;
    }
  }

  volume_control() {
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
      if (this._insp_tidal_volume_counter > this.tidal_volume) {
        this.insp_valve.no_flow = true;
        this.insp_valve.r_for_factor = 1.0;
        if (this.insp_valve.flow > 0 && !this._vol_reached) {
          this.resistance =
            (this.vent_circuit.pres - this.p_atm) / this.insp_valve.flow;
          this._vol_reached = true;
        }
      }
      // calculate the expiratory tidal volume
      if (this.insp_valve.flow > 0) {
        this._insp_tidal_volume_counter += this.insp_valve.flow * this._t;
      }
    }

    if (this._expiration) {
      this._vol_reached = false;
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

  pressure_support() {
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
      this.pip_cmh2o += 1.0;
      if (this.pip_cmh2o > this.pip_cmh2o_max) {
        this.pip_cmh2o = this.pip_cmh2o_max;
      }
    }

    if (this.exp_tidal_volume > this.tidal_volume + this._tv_tolerance) {
      this.pip_cmh2o -= 1.0;
      if (this.pip_cmh2o < this.peep_cmh2o + 2.0) {
        this.pip_cmh2o = this.peep_cmh2o + 2.0;
      }
    }
  }
}
