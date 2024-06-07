export class Fluids {
  static model_type = "Fluids";
  static model_interface = [
    {
      target: "add_volume",
      caption: "add volume (ml)",
      type: "function",
      optional: false,
      args: [
        {
          target: "vol",
          caption: "volume (ml)",
          type: "number",
          default: 10.0,
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000.0,
          ll: 0.0,
        },
        {
          target: "in_time",
          caption: "infusion time (sec)",
          type: "number",
          default: 5.0,
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000.0,
          ll: 0.0,
        },
        {
          target: "site",
          type: "list",
          default: "VLB",
          options: ["BloodCapacitance", "BloodTimeVaryingElastance"],
          options_default: [],
        },
        {
          target: "fluid_type",
          type: "list",
          default: "normal saline",
          options: [],
          options_default: ["", "normal saline", "packed cells"],
        },
      ],
    },
    {
      target: "remove_volume",
      caption: "remove volume (ml)",
      type: "function",
      optional: false,
      args: [
        {
          target: "vol",
          caption: "volume (ml)",
          type: "number",
          default: 10.0,
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000.0,
          ll: 0.0,
        },
        {
          target: "in_time",
          caption: "removal time (sec)",
          type: "number",
          default: 5.0,
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000.0,
          ll: 0.0,
        },
        {
          target: "site",
          type: "list",
          default: "VLB",
          options: ["BloodCapacitance", "BloodTimeVaryingElastance"],
          options_default: [],
        },
      ],
    },
  ];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  fluid_types = {};

  // dependent parameters
  total_blood_volume = 0.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _infusions = [];

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

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    let infusions_finished = true;

    for (let iv of this._infusions) {
      const finished = iv.calc_iv();
      if (!finished) {
        infusions_finished = false;
      }
    }

    if (infusions_finished) {
      this._infusions = [];
    }
  }

  add_volume(vol = 10.0, in_time = 5.0, site = "VLB", fluid_type = null) {
    if (vol > 0) {
      if (fluid_type in this.fluid_types) {
        const new_fluid = new Fluid(
          vol,
          this.fluid_types[fluid_type],
          in_time,
          0.0,
          this._model_engine.models[site],
          this._t
        );
        this._infusions.push(new_fluid);
      } else {
        const new_fluid = new Fluid(
          vol,
          null,
          in_time,
          0.0,
          this._model_engine.models[site],
          this._t
        );
        this._infusions.push(new_fluid);
      }
      return true;
    }
  }

  remove_volume(vol = 10.0, in_time = 5.0, site = "VLB") {
    if (vol > 0) {
      const new_fluid = new Fluid(
        -vol,
        null,
        in_time,
        0.0,
        this._model_engine.models[site],
        this._t
      );
      this._infusions.push(new_fluid);
      return true;
    }
  }
}

export class Fluid {
  site = {};
  volume = 0.0;
  in_time = 5.0;
  at_time = 0.0;
  infusing = false;
  completed = false;
  delta_vol = 0.0;

  fluid_comp = {};
  solutes = {};
  aboxy = {};

  _t = 0.0005;
  _addition = true;

  constructor(volume, fluid_comp, in_time, at_time, site, t) {
    this._t = t;
    if (volume < 0) {
      this._addition = false;
      volume = -volume;
    }

    if (fluid_comp) {
      this.fluid_comp = fluid_comp;
      this.solutes = { ...fluid_comp["solutes"] };
      this.aboxy = { ...fluid_comp["aboxy"] };
    } else {
      this.solutes = {};
      this.aboxy = {};
    }

    this.site = site;
    this.volume = volume / 1000.0;
    this.in_time = in_time;
    this.at_time = at_time;
    this.delta_vol = (this.volume / this.in_time) * this._t;
  }

  calc_iv() {
    if (this.at_time > 0) {
      this.at_time -= self._t;
      return this.completed;
    }

    this.in_time -= this._t;
    this.volume -= this.delta_vol;

    if (this.volume < 0) {
      this.volume = 0;
      this.completed = true;
      return this.completed;
    }

    // substract the volume and return
    if (!this._addition) {
      this.site.vol -= this.delta_vol;
      if (this.site.vol < 0) {
        this.site.vol = 0;
      }
      return this.completed;
    }

    // add  the volume and return
    this.site.vol += this.delta_vol;

    // process the aboxy and solutes if the fluid_composition is not none
    if (this.fluid_comp) {
      for (let [solute, conc] of Object.entries(this.aboxy)) {
        let d_solute = (conc - this.site.aboxy[solute]) * this.delta_vol;
        this.site.aboxy[solute] += d_solute / this.site.vol;
      }
      for (let [solute, conc] of Object.entries(this.solutes)) {
        let d_solute = (conc - this.site.aboxy[solute]) * this.delta_vol;
        this.site.aboxy[solute] += d_solute / this.site.vol;
      }
    }

    return this.completed;
  }
}
