import { BaseModelClass } from "../base_models/BaseModelClass";
import { calc_gas_composition } from "../helpers/GasComposition";
import { GasCapacitance } from "../base_models/GasCapacitance";
import { Resistor } from "../base_models/Resistor";

export class Ventilator extends BaseModelClass {
  // static properties
  static model_type = "Ventilator";
  static model_interface = [
    {
      caption: "switch ventilator on/off",
      target: "switch_ventilator",
      type: "function",
      args: [
        {
          caption: "state",
          target: "is_enabled",
          type: "boolean",
        },
      ],
    },
    {
      caption: "endotracheal tube diameter (mm)",
      target: "set_ettube_diameter",
      type: "function",
      args: [
        {
          caption: "new diameter (mm)",
          target: "ettube_diameter",
          type: "number",
          factor: 1,
          delta: 0.5,
          rounding: 1,
        },
      ],
    },
    {
      caption: "endotracheal tube length (mm)",
      target: "set_ettube_length",
      type: "function",
      args: [
        {
          caption: "new length (mm)",
          target: "ettube_length",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
        },
      ],
    },
    {
      caption: "fio2",
      target: "set_fio2",
      type: "function",
      args: [
        {
          caption: "new fio2",
          target: "fio2",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
        },
      ],
    },
    {
      caption: "humidity",
      target: "set_humidity",
      type: "function",
      args: [
        {
          caption: "new humidity",
          target: "humidity",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
        },
      ],
    },
    {
      caption: "temperature (C)",
      target: "set_temp",
      type: "function",
      args: [
        {
          caption: "new temp (C)",
          target: "temp",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
        },
      ],
    },
    {
      caption: "current volume (mL)",
      target: "vol",
      type: "number",
      delta: 0.1,
      factor: 1000.0,
      rounding: 3,
    },
    {
      caption: "ventilator mode",
      target: "vent_mode",
      type: "list",
      custom_options: true,
      options: ["PC", "PRVC"],
    },
    {
      caption: "ventilator rate (/min)",
      target: "vent_rate",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0,
    },
    {
      caption: "inspiration time (s)",
      target: "insp_time",
      type: "number",
      delta: 0.1,
      factor: 1,
      rounding: 1,
    },
    {
      caption: "inspiratory flow (l/min)",
      target: "insp_flow",
      type: "number",
      delta: 0.1,
      factor: 1,
      rounding: 1,
    },
    {
      caption: "expiratory flow (l/min)",
      target: "exp_flow",
      type: "number",
      delta: 0.1,
      factor: 1,
      rounding: 1,
    },
    {
      caption: "tidal volume (mL)",
      target: "tidal_volume",
      type: "number",
      delta: 1,
      factor: 1000,
      rounding: 0,
    },
    {
      caption: "peak inspiratory pressure (cmH2O)",
      target: "pip_cmh2o",
      type: "number",
      delta: 1,
      factor: 1,
      rounding: 0,
    },
    {
      caption: "max peak inspiratory pressure (cmH2O)",
      target: "pip_cmh2o_max",
      type: "number",
      delta: 1,
      factor: 1,
      rounding: 0,
    },
    {
      caption: "positive end expiratory pressure (cmH2O)",
      target: "peep_cmh2o",
      type: "number",
      delta: 1,
      factor: 1,
      rounding: 0,
    },
    {
      caption: "trigger volume percentage (%)",
      target: "trigger_volume_perc",
      type: "number",
      delta: 0.1,
      factor: 1,
      rounding: 1,
    },
    {
      caption: "synchronized ventilation",
      target: "synchronized",
      type: "boolean",
    },
  ];

  /**
   * The Ventilator class models a mechanical ventilator.
   */
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // Independent properties
    this.pres_atm = 760;
    this.fio2 = 0.205;
    this.humidity = 1.0;
    this.temp = 37;
    this.ettube_diameter = 4;
    this.ettube_length = 110;
    this.vent_mode = "PRVC";
    this.vent_rate = 40;
    this.tidal_volume = 0.015;
    this.insp_time = 0.4;
    this.insp_flow = 12;
    this.exp_flow = 3;
    this.pip_cmh2o = 14;
    this.pip_cmh2o_max = 14;
    this.peep_cmh2o = 3;
    this.trigger_volume_perc = 6;
    this.synchronized = false;
    this.components = {}

    // Dependent properties
    this.pres = 0.0;
    this.flow = 0.0;
    this.vol = 0.0;
    this.exp_time = 1.0;
    this.trigger_volume = 0.0;
    this.minute_volume = 0.0;
    this.compliance = 0.0;
    this.resistance = 0.0;
    this.exp_tidal_volume = 0.0;
    this.insp_tidal_volume = 0.0;
    this.ncc_insp = 0.0;
    this.ncc_exp = 0.0;
    this.etco2 = 0.0;
    this.co2 = 0.0;
    this.triggered_breath = false;

    // Local properties
    this._vent_gasin = null;
    this._vent_gascircuit = null;
    this._vent_gasout = null;
    this._vent_insp_valve = null;
    this._vent_exp_valve = null;
    this._vent_ettube = null;
    this._ventilator_parts = [];
    this._ettube_length_ref = 110;
    this._pip = 0.0;
    this._pip_max = 0.0;
    this._peep = 0.0;
    this._a = 0.0;
    this._b = 0.0;
    this._insp_time_counter = 0.0;
    this._exp_time_counter = 0.0;
    this._insp_tidal_volume_counter = 0.0;
    this._exp_tidal_volume_counter = 0.0;
    this._trigger_volume_counter = 0.0;
    this._inspiration = false;
    this._expiration = true;
    this._tv_tolerance = 0.0005;
    this._trigger_blocked = false;
    this._trigger_start = false;
    this._breathing_model = null;
    this._peak_flow = 0.0;
    this._prev_et_tube_flow = 0.0;
    this._et_tube_resistance = 40.0;
  }

  init_model(args = {}) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // initialize the components
    Object.keys(this.components).forEach(component_name => {
      let component = {}
      switch (this.components[component_name].model_type) {
        case "Resistor":
          component = new Resistor(this._model_engine, component_name)
          break;
        case "GasCapacitance":
          component = new GasCapacitance(this._model_engine, component_name)
          break;
      }
  
      let args = [];
      for (const [key, value] of Object.entries(this.components[component_name])) {
        args.push({ key, value });
      }
      component.init_model(args)
      this._model_engine.models[component_name] = component
    })

    this._breathing_model = this._model_engine.models["Breathing"];
    this._vent_gasin = this._model_engine.models["VENT_GASIN"];
    this._vent_gascircuit = this._model_engine.models["VENT_GASCIRCUIT"];
    this._vent_gasout = this._model_engine.models["VENT_GASOUT"];
    this._vent_insp_valve = this._model_engine.models["VENT_INSP_VALVE"];
    this._vent_ettube = this._model_engine.models["VENT_ETTUBE"];
    this._vent_exp_valve = this._model_engine.models["VENT_EXP_VALVE"];

    this._ventilator_parts = [
      this._vent_gasin,
      this._vent_gascircuit,
      this._vent_gasout,
      this._vent_insp_valve,
      this._vent_ettube,
      this._vent_exp_valve,
    ];

    calc_gas_composition(this._vent_gasin, this.fio2, this.temp, this.humidity);
    calc_gas_composition(
      this._vent_gascircuit,
      this.fio2,
      this.temp,
      this.humidity
    );
    calc_gas_composition(this._vent_gasout, 0.205, 20.0, 0.5);

    this.set_ettube_diameter(this.ettube_diameter);
    this._et_tube_resistance = this.calc_ettube_resistance(this.flow);
    this._is_initialized = true;
  }

  calc_model() {
    this._pip = this.pip_cmh2o / 1.35951;
    this._pip_max = this.pip_cmh2o_max / 1.35951;
    this._peep = this.peep_cmh2o / 1.35951;

    if (this.synchronized) {
      this.triggering();
    }

    if (this.vent_mode === "PC" || this.vent_mode === "PRVC") {
      this.time_cycling();
      this.pressure_control();
    }

    if (this.vent_mode === "PS") {
      this.flow_cycling();
      this.pressure_control();
    }

    this.pres = (this._vent_gascircuit.pres - this.pres_atm) * 1.35951;
    this.flow = this._vent_ettube.flow * 60.0;
    this.vol += this._vent_ettube.flow * 1000 * this._t;
    this.co2 = this._model_engine.models["DS"].pco2;
    this.minute_volume = this.exp_tidal_volume * this.vent_rate;
    this.compliance = 1 / ((this._pip - this._peep) / this.exp_tidal_volume);
    this.resistance = null;
    this._et_tube_resistance = this.calc_ettube_resistance(this.flow);
  }

  triggering() {
    this.trigger_volume =
      (this.tidal_volume / 100.0) * this.trigger_volume_perc;

    if (this._breathing_model.ncc_insp === 1 && !this._trigger_blocked) {
      this._trigger_start = true;
    }

    if (this._trigger_start) {
      this._trigger_volume_counter += this._vent_ettube.flow * this._t;
    }

    if (this._trigger_volume_counter > this.trigger_volume) {
      this._trigger_volume_counter = 0.0;
      this._exp_time_counter = this.exp_time;
      this._trigger_start = false;
      this.triggered_breath = true;
    }
  }

  flow_cycling() {
    if (this._vent_ettube.flow > 0.0 && this.triggered_breath) {
      if (this._vent_ettube.flow > this._prev_et_tube_flow) {
        this._inspiration = true;
        this._expiration = false;
        this.ncc_insp = -1;

        if (this._vent_ettube.flow > this._peak_flow) {
          this._peak_flow = this._vent_ettube.flow;
        }

        this.exp_tidal_volume = -this._exp_tidal_volume_counter;
      } else if (this._vent_ettube.flow < 0.3 * this._peak_flow) {
        this._inspiration = false;
        this._expiration = true;
        this.ncc_exp = -1;
        this._exp_tidal_volume_counter = 0.0;
        this.triggered_breath = false;
      }

      this._prev_et_tube_flow = this._vent_ettube.flow;
    }

    if (this._vent_ettube.flow < 0.0 && !this.triggered_breath) {
      this._peak_flow = 0.0;
      this._prev_et_tube_flow = 0.0;
      this._inspiration = false;
      this._expiration = true;
      this.ncc_exp = -1;
      this._exp_tidal_volume_counter += this._vent_ettube.flow * this._t;
    }

    if (this._inspiration) {
      this.ncc_insp += 1;
      this._trigger_blocked = true;
    }

    if (this._expiration) {
      this.ncc_exp += 1;
      this._trigger_blocked = false;
    }
  }

  time_cycling() {
    this.exp_time = 60.0 / this.vent_rate - this.insp_time;

    if (this._insp_time_counter > this.insp_time) {
      this._insp_time_counter = 0.0;
      this.insp_tidal_volume = this._insp_tidal_volume_counter;
      this._insp_tidal_volume_counter = 0.0;
      this._inspiration = false;
      this._expiration = true;
      this.triggered_breath = false;
      this.ncc_exp = -1;
    }

    if (this._exp_time_counter > this.exp_time) {
      this._exp_time_counter = 0.0;
      this._inspiration = true;
      this._expiration = false;
      this.ncc_insp = -1;
      this.vol = 0.0;
      this.exp_tidal_volume = -this._exp_tidal_volume_counter;
      this.etco2 = this._model_engine.models["DS"].pco2;
      this.tv_kg = (this.exp_tidal_volume * 1000.0) / this._model_engine.weight;

      if (this.exp_tidal_volume > 0) {
        this.compliance =
          1 /
          (((this._pip - this._peep) * 1.35951) /
            (this.exp_tidal_volume * 1000.0));
      }

      this._exp_tidal_volume_counter = 0.0;

      if (this.vent_mode === "PRVC") {
        this.pressure_regulated_volume_control();
      }
    }

    if (this._inspiration) {
      this._insp_time_counter += this._t;
      this.ncc_insp += 1;
      this._trigger_blocked = true;
      this._trigger_volume_counter = 0.0;
    }

    if (this._expiration) {
      this._exp_time_counter += this._t;
      this.ncc_exp += 1;
      this._trigger_blocked = false;
    }
  }

  pressure_control() {
    if (this._inspiration) {
      this._vent_exp_valve.no_flow = true;
      this._vent_insp_valve.no_flow = false;
      this._vent_insp_valve.no_back_flow = true;
      this._vent_insp_valve.r_for =
        (this._vent_gasin.pres + this._pip - this.pres_atm - this._peep) /
        (this.insp_flow / 60.0);

      if (this._vent_gascircuit.pres > this._pip + this.pres_atm) {
        this._vent_insp_valve.no_flow = true;
      }

      if (this._vent_ettube.flow > 0) {
        this._insp_tidal_volume_counter += this._vent_ettube.flow * this._t;
      }
    }

    if (this._expiration) {
      this._vent_insp_valve.no_flow = true;
      this._vent_exp_valve.no_flow = false;
      this._vent_exp_valve.no_back_flow = true;
      this._vent_exp_valve.r_for = 10;
      this._vent_gasout.vol =
        this._peep / this._vent_gasout.el_base + this._vent_gasout.u_vol;

      if (this._vent_ettube.flow < 0) {
        this._exp_tidal_volume_counter += this._vent_ettube.flow * this._t;
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

  reset_dependent_properties() {
    this.pres = 0.0;
    this.flow = 0.0;
    this.vol = 0.0;
    this.exp_time = 1.0;
    this.trigger_volume = 0.0;
    this.minute_volume = 0.0;
    this.compliance = 0.0;
    this.resistance = 0.0;
    this.exp_tidal_volume = 0.0;
    this.insp_tidal_volume = 0.0;
    this.ncc_insp = 0.0;
    this.ncc_exp = 0.0;
    this.etco2 = 0.0;
    this.co2 = 0.0;
    this.triggered_breath = false;
  }

  switch_ventilator(state) {
    this.is_enabled = state;
    if (!state) {
      this.reset_dependent_properties();
    }

    for (const vp of this._ventilator_parts) {
      vp.is_enabled = state;

      if ("no_flow" in vp) {
        vp.no_flow = !state;
      }
    }

    this._model_engine.models["MOUTH_DS"].no_flow = state;
  }

  calc_ettube_resistance(flow) {
    const _ettube_length_ref = 110;
    let res =
      (this._a * flow + this._b) * (this.ettube_length / _ettube_length_ref);
    if (res < 15.0) {
      res = 15;
    }

    this._vent_ettube.r_for = res;
    this._vent_ettube.r_back = res;

    return res;
  }

  set_ettube_length(new_length) {
    if (new_length >= 50) {
      this.ettube_length = new_length;
    }
  }

  set_ettube_diameter(new_diameter) {
    if (new_diameter > 1.5) {
      this.ettube_diameter = new_diameter;
      this._a = -2.375 * new_diameter + 11.9375;
      this._b = -14.375 * new_diameter + 65.9374;
    }
  }

  set_fio2(new_fio2) {
    if (new_fio2 > 20) {
      this.fio2 = new_fio2 / 100.0;
    } else {
      this.fio2 = new_fio2;
    }

    calc_gas_composition(
      this._vent_gasin,
      this.fio2,
      this._vent_gasin.temp,
      this._vent_gasin.humidity
    );
  }

  set_humidity(new_humidity) {
    if (new_humidity >= 0 && new_humidity <= 1.0) {
      this.humidity = new_humidity;
      calc_gas_composition(
        this._vent_gasin,
        this.fio2,
        this._vent_gasin.temp,
        this.humidity
      );
    }
  }

  set_temp(new_temp) {
    this.temp = new_temp;
    calc_gas_composition(
      this._vent_gasin,
      this.fio2,
      this.temp,
      this._vent_gasin.humidity
    );
  }

  set_pc(pip = 14.0, peep = 4.0, rate = 40.0, t_in = 0.4, insp_flow = 10.0) {
    this.pip_cmh2o = pip;
    this.pip_cmh2o_max = pip;
    this.peep_cmh2o = peep;
    this.vent_rate = rate;
    this.insp_time = t_in;
    this.insp_flow = insp_flow;
    this.vent_mode = "PC";
  }

  set_prvc(
    pip_max = 18.0,
    peep = 4.0,
    rate = 40.0,
    tv = 15.0,
    t_in = 0.4,
    insp_flow = 10.0
  ) {
    this.pip_cmh2o_max = pip_max;
    this.peep_cmh2o = peep;
    this.vent_rate = rate;
    this.insp_time = t_in;
    this.tidal_volume = tv / 1000.0;
    this.insp_flow = insp_flow;
    this.vent_mode = "PRVC";
  }

  set_psv(pip = 14.0, peep = 4.0, rate = 40.0, t_in = 0.4, insp_flow = 10.0) {
    this.pip_cmh2o = pip;
    this.pip_cmh2o_max = pip;
    this.peep_cmh2o = peep;
    this.vent_rate = rate;
    this.insp_time = t_in;
    this.insp_flow = insp_flow;
    this.vent_mode = "PS";
  }

  trigger_breath(
    pip = 14.0,
    peep = 4.0,
    rate = 40.0,
    t_in = 0.4,
    insp_flow = 10.0
  ) {
    this._exp_time_counter = this.exp_time + 0.1;
  }
}
