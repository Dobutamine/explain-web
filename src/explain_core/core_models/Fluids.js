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

  constructor(model_ref, name = "") {
    // Independent properties
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.fluid_types = null;

    // Dependent properties
    this.total_blood_volume = 0.0;

    // Local properties
    this._model_engine = model_ref;
    this._is_initialized = false;
    this._t = model_ref.modeling_stepsize;
    this._infusions = [];
  }

  init_model(args) {
    // set the values of the properties as passed in the arguments
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // Flag that the model is initialized
    this._is_initialized = true;
  }

  // This method is called during every model step by the model engine
  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  // Actual model calculations are done here
  calc_model() {
    let infusions_finished = true;

    for (const iv of this._infusions) {
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
    if (vol > 0.0) {
      let new_fluid;
      if (fluid_type && fluid_type in this.fluid_types) {
        new_fluid = new Fluid(
          vol,
          this.fluid_types[fluid_type],
          in_time,
          0.0,
          this._model_engine.models[site],
          this._t
        );
      } else {
        new_fluid = new Fluid(
          vol,
          null,
          in_time,
          0.0,
          this._model_engine.models[site],
          this._t
        );
      }
      this._infusions.push(new_fluid);
      return true;
    }
  }

  remove_volume(vol = 10.0, in_time = 5.0, site = "VLB") {
    if (vol > 0.0) {
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

class Fluid {
  constructor(volume, fluid_comp, in_time, at_time, site, t) {
    this._t = t;
    this._addition = true;

    if (volume < 0) {
      this._addition = false;
      volume = -volume;
    }

    if (fluid_comp) {
      this.fluid_comp = fluid_comp;
      this.solutes = fluid_comp.solutes ? { ...fluid_comp.solutes } : {};
    } else {
      this.solutes = {};
    }

    this.site = site;
    this.completed = false;
    this.volume = volume / 1000.0;
    this.in_time = in_time;
    this.at_time = at_time;
    this.delta_vol = (this.volume / this.in_time) * this._t;
  }

  calc_iv() {
    if (this.at_time > 0) {
      this.at_time -= this._t;
      return this.completed;
    }

    this.in_time -= this._t;
    this.volume -= this.delta_vol;

    if (this.volume <= 0) {
      this.volume = 0;
      this.completed = true;
      return this.completed;
    }

    if (!this._addition) {
      this.site.vol -= this.delta_vol;
      if (this.site.vol < 0) {
        this.site.vol = 0;
      }
      return this.completed;
    }

    this.site.vol += this.delta_vol;

    if (this.fluid_comp) {
      for (const [solute, conc] of Object.entries(this.solutes)) {
        const d_solute = (conc - this.site.solutes[solute]) * this.delta_vol;
        this.site.solutes[solute] += d_solute / this.site.vol;
      }
    }

    return this.completed;
  }
}
