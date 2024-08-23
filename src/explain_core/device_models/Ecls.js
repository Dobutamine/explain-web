import { set_gas_composition } from "../helpers/GasComposition";
import { set_blood_composition } from "../helpers/BloodComposition";

export class Ecls {
  static model_type = "Ecls";
  static model_interface = [];

  constructor(model_ref, name = "") {
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.pres_atm = 760.0;
    this.ecls_running = false;
    this.ecls_clamped = false;
    this.fio2_gas_baseline = 0.205;
    this.fio2_gas = 0.205;
    this.fico2_gas_baseline = 0.000392;
    this.fico2_gas = 0.000392;
    this.co2_gas_flow = 0.4;
    this.temp_gas = 37.0;
    this.humidity_gas = 1.0;
    this.sweep_gas = 1.0;
    this.drainage_site = "RA";
    this.return_site = "AAR";
    this.drainage_cannula_length = 0.011;
    this.drainage_cannula_size = 12;
    this.drainage_cannula_diameter = 0.3;
    this.return_cannula_length = 0.011;
    this.return_cannula_size = 10;
    this.return_cannula_diameter = 0.3;
    this.tubing_size = 0.25;
    this.tubing_elastance = 11600;
    this.tubing_diameter = 0.3;
    this.tubing_in_length = 1.0;
    this.tubing_out_length = 1.0;
    this.diff_o2 = 0.001;
    this.diff_o2_factor = 1.0;
    this.diff_co2 = 0.001;
    this.diff_co2_factor = 1.0;
    this.pump_volume = 0.8;
    this.oxy_volume = 0.8;
    this.oxy_resistance = 1000;
    this.oxy_resistance_factor = 1.0;
    this.inlet_res = 20000.0;
    this.inlet_res_factor = 1.0;
    this.outlet_res = 20000.0;
    this.outlet_res_factor = 1.0;
    this.pump_rpm = 0.0;

    this.pre_oxy_ph = 0.0;
    this.pre_oxy_po2 = 0.0;
    this.pre_oxy_pco2 = 0.0;
    this.pre_oxy_hco3 = 0.0;
    this.pre_oxy_be = 0.0;
    this.pre_oxy_so2 = 0.0;

    this.post_oxy_ph = 0.0;
    this.post_oxy_po2 = 0.0;
    this.post_oxy_pco2 = 0.0;
    this.post_oxy_hco3 = 0.0;
    this.post_oxy_be = 0.0;
    this.post_oxy_so2 = 0.0;

    this.ven_pres = 0.0;
    this.pre_oxy_pres = 0.0;
    this.post_oxy_pres = 0.0;
    this.tmp_pres = 0.0;
    this.blood_flow = 0.0;
    this.gas_flow = 0.0;

    this._model_engine = model_ref;
    this._is_initialized = false;
    this._t = model_ref.modeling_stepsize;
    this.drainage_cannula = null;
    this._tubing_in = null;
    this._tubing_in_pump = null;
    this._pump = null;
    this._pump_bridge = null;
    this._bridge = null;
    this._bridge_oxy = null;
    this._oxy = null;
    this._oxy_tubing_out = null;
    this._tubing_out = null;
    this._return_cannula = null;

    this._gas_in = null;
    this._gas_in_oxy = null;
    this._gas_oxy = null;
    this._gas_oxy_out = null;
    this._gas_out = null;

    this._gasex = null;
    this._ecls_parts = [];

    this._update_counter = 0.0;
    this._update_interval = 1.0;
  }

  init_model(args) {
    // process the parameters
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    this.build_blood_part();
    // this.build_gas_part();
    // this.build_gasexchanger();

    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized && this.ecls_running) {
      this.calc_model();
    }
  }

  calc_model() {
    this._pump.pump_rpm = this.pump_rpm;
    this._drainage_cannula.no_flow = this.ecls_clamped;
    this._return_cannula.no_flow = this.ecls_clamped;

    this.blood_flow = this._oxy_tubing_out.flow_lmin_avg;
    this.gas_flow = this._gas_oxy_out.flow * 60.0;
    this.ven_pres = this._tubing_in.pres;
    this.pre_oxy_pres = this._bridge.pres;
    this.post_oxy_pres = this._tubing_out.pres;
    this.tmp_pres = this.pre_oxy_pres - this.post_oxy_pres;

    if (this._update_counter > this._update_interval) {
      this._update_counter = 0.0;
      set_blood_composition(this._tubing_in);
      set_blood_composition(this._tubing_out);

      this.pre_oxy_ph = this._tubing_in.ph;
      this.pre_oxy_po2 = this._tubing_in.po2;
      this.pre_oxy_pco2 = this._tubing_in.pco2;
      this.pre_oxy_so2 = this._tubing_in.so2;

      this.post_oxy_ph = this._tubing_out.ph;
      this.post_oxy_po2 = this._tubing_out.po2;
      this.post_oxy_pco2 = this._tubing_out.pco2;
      this.post_oxy_so2 = this._tubing_out.so2;

      this.tubing_diameter = this.tubing_size * 0.0254;

      this.drainage_cannula_diameter =
        (this.drainage_cannula_size * 0.33) / 1000.0;
      this.return_cannula_diameter = (this.return_cannula_size * 0.33) / 1000.0;

      const drainage_res = this.calc_resistance_tube(
        this.drainage_cannula_diameter,
        this.drainage_cannula_length
      );

      this._drainage_cannula.r_for = drainage_res * this.inlet_res_factor;
      this._drainage_cannula.r_back = drainage_res * this.inlet_res_factor;

      const return_res = this.calc_resistance_tube(
        this.return_cannula_diameter,
        this.return_cannula_length
      );

      this._return_cannula.r_for = return_res * this.outlet_res_factor;
      this._return_cannula.r_back = return_res * this.outlet_res_factor;

      this._oxy_tubing_out.r_for =
        this.oxy_resistance * this.oxy_resistance_factor;
      this._oxy_tubing_out.r_back =
        this.oxy_resistance * this.oxy_resistance_factor;

      if (this.sweep_gas > 0.0) {
        this._gas_in_oxy.r_for =
          (this._gas_in.pres - this.pres_atm) / (this.sweep_gas / 60.0);
      }

      this._gasex.dif_o2 = this.diff_o2 * this.diff_o2_factor;
      this._gasex.dif_co2 = this.diff_co2 * this.diff_co2_factor;
    }

    this._update_counter += this._t;
  }

  build_args_list(args) {
    let new_args = [];
    for (const [key, value] of Object.entries(args)) {
      new_args.push({ key, value });
    }
    return new_args;
  }

  build_tubing_in() {
    this._tubing_in = this._model_engine.models["ECLS_TUBIN"];
    this.tubing_diameter = this.tubing_size * 0.0254;
    const tubing_in_uvol = this.calc_volume(
      this.tubing_in_length,
      this.tubing_diameter
    );

    let args = this.build_args_list({
      is_enabled: false,
      fixed_composition: false,
      vol: tubing_in_uvol,
      u_vol: tubing_in_uvol,
      el_base: this.tubing_elastance,
    });
    this._tubing_in.init_model(args);

    this._tubing_in.solutes = { ...this._model_engine.models["AA"].solutes };
    this._tubing_in.aboxy = { ...this._model_engine.models["AA"].aboxy };

    this._tubing_in.calc_model();
    this._ecls_parts.push(this._tubing_in);
  }

  build_tubing_out() {
    this._tubing_out = this._model_engine.models["ECLS_TUBOUT"];
    this.tubing_diameter = this.tubing_size * 0.0254;
    const tubing_out_uvol = this.calc_volume(
      this.tubing_out_length,
      this.tubing_diameter
    );

    let args = this.build_args_list({
      is_enabled: false,
      fixed_composition: false,
      vol: tubing_out_uvol,
      u_vol: tubing_out_uvol,
      el_base: this.tubing_elastance,
    });
    this._tubing_out.init_model(args);

    this._tubing_out.solutes = { ...this._model_engine.models["AA"].solutes };
    this._tubing_out.aboxy = { ...this._model_engine.models["AA"].aboxy };

    this._tubing_out.calc_model();
    this._ecls_parts.push(this._tubing_out);
  }

  build_oxy() {
    this._bridge = this._model_engine.models["ECLS_BRIDGE"];
    this.tubing_diameter = this.tubing_size * 0.0254;
    const bridge_uvol = this.calc_volume(
      this.tubing_in_length / 2.0,
      this.tubing_diameter
    );

    this._bridge.init_model(
      this.build_args_list({
        is_enabled: false,
        fixed_composition: false,
        vol: bridge_uvol,
        u_vol: bridge_uvol,
        el_base: this.tubing_elastance,
      })
    );

    this._bridge.solutes = { ...this._model_engine.models["AA"].solutes };
    this._bridge.aboxy = { ...this._model_engine.models["AA"].aboxy };

    this._bridge.calc_model();
    this._ecls_parts.push(this._bridge);

    this._oxy = this._model_engine.models["ECLS_OXY"];
    this._oxy.init_model(
      this.build_args_list({
        is_enabled: false,
        fixed_composition: false,
        vol: this.oxy_volume,
        u_vol: this.oxy_volume,
        el_base: 10000,
      })
    );

    this._oxy.solutes = { ...this._model_engine.models["AA"].solutes };
    this._oxy.aboxy = { ...this._model_engine.models["AA"].aboxy };

    this._oxy.calc_model();
    this._ecls_parts.push(this._oxy);
  }

  init_pump() {
    this._pump.init_model(
      this.build_args_list({
        is_enabled: false,
        fixed_composition: false,
        vol: this.pump_volume,
        u_vol: this.pump_volume,
        el_base: this.tubing_elastance,
        inlet: this._tubing_in_pump,
        outlet: this._bridge_oxy,
      })
    );

    this._pump.solutes = { ...this._model_engine.models["AA"].solutes };
    this._pump.aboxy = { ...this._model_engine.models["AA"].aboxy };

    this._pump.calc_model();
    this._ecls_parts.push(this._pump);
  }

  build_blood_part() {
    this.build_tubing_in();
    this.build_tubing_out();
    this.build_oxy();

    this._pump = this._model_engine.models["ECLS_PUMP"];

    this.drainage_cannula_diameter =
      (this.drainage_cannula_size * 0.33) / 1000.0;
    this.return_cannula_diameter = (this.return_cannula_size * 0.33) / 1000.0;

    const drainage_res = this.calc_resistance_tube(
      this.drainage_cannula_diameter,
      this.drainage_cannula_length
    );
    const return_res = this.calc_resistance_tube(
      this.return_cannula_diameter,
      this.return_cannula_length
    );

    this._drainage_cannula = this._model_engine.models["ECLS_DR"];
    this._drainage_cannula.init_model(
      this.build_args_list({
        is_enabled: false,
        no_flow: false,
        no_back_flow: false,
        comp_from: this._model_engine.models[this.drainage_site],
        comp_to: this._tubing_in,
        r_for: drainage_res,
        r_back: drainage_res,
        r_k: 0.0,
      })
    );

    this._ecls_parts.push(this._drainage_cannula);

    this._tubing_in_pump = this._model_engine.models["ECLS_TUBIN_PUMP"];
    this._tubing_in_pump.init_model(
      this.build_args_list({
        is_enabled: false,
        no_flow: false,
        no_back_flow: false,
        comp_from: this._tubing_in,
        comp_to: this._pump,
        r_for: 50.0,
        r_back: 50.0,
        r_k: 0.0,
      })
    );

    this._ecls_parts.push(this._tubing_in_pump);

    this._pump_bridge = this._model_engine.models["ECLS_PUMP_BRIDGE"];
    this._pump_bridge.init_model(
      this.build_args_list({
        is_enabled: false,
        no_flow: false,
        no_back_flow: false,
        comp_from: this._pump,
        comp_to: this._bridge,
        r_for: 50.0,
        r_back: 50.0,
        r_k: 0.0,
      })
    );

    this._ecls_parts.push(this._pump_bridge);

    this._bridge_oxy = this._model_engine.models["ECLS_BRIDGE_OXY"];
    this._bridge_oxy.init_model(
      this.build_args_list({
        is_enabled: false,
        no_flow: false,
        no_back_flow: false,
        comp_from: this._bridge,
        comp_to: this._oxy,
        r_for: 50.0,
        r_back: 50.0,
        r_k: 0.0,
      })
    );

    this._ecls_parts.push(this._bridge_oxy);

    this._oxy_tubing_out = this._model_engine.models["ECLS_OXY_TUBOUT"];
    this._oxy_tubing_out.init_model(
      this.build_args_list({
        is_enabled: false,
        no_flow: false,
        no_back_flow: false,
        comp_from: this._oxy,
        comp_to: this._tubing_out,
        r_for: 50.0,
        r_back: 50.0,
        r_k: 0.0,
      })
    );

    this._ecls_parts.push(this._oxy_tubing_out);

    this._return_cannula = this._model_engine.models["ECLS_RE"];
    this._return_cannula.init_model(
      this.build_args_list({
        is_enabled: false,
        no_flow: false,
        no_back_flow: false,
        comp_from: this._tubing_out,
        comp_to: this.return_site,
        r_for: return_res,
        r_back: return_res,
        r_k: 0.0,
      })
    );

    this._ecls_parts.push(this._return_cannula);

    this.init_pump();
  }

  set_rpm(new_rpm) {
    if (new_rpm > 0.0) {
      this.pump_rpm = new_rpm;
    }
  }

  set_sweep_gas(new_sweep_gas) {
    this.sweep_gas = new_sweep_gas;
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
    this.fico2_gas = new_fico2;
  }

  reconnect_drainage(comp) {
    if (this._model_engine.models[comp]) {
      this.drainage_site = comp;
      this._drainage_cannula.reconnect(comp, "ECLS_TUBIN");
    }
  }

  reconnect_return(comp) {
    if (this._model_engine.models[comp]) {
      this.return_site = comp;
      this._return_cannula.reconnect("ECLS_TUBOUT", comp);
    }
  }

  build_gas_part() {
    this._gas_in = this._model_engine.models["ECLS_GASIN"];
    this._gas_in.init_model({
      is_enabled: false,
      fixed_composition: true,
      vol: 5.4,
      u_vol: 5.0,
      el_base: 1000.0,
      el_k: 0.0,
      pres_atm: this.pres_atm,
    });

    this._gas_in.calc_model();
    set_gas_composition(
      this._gas_in,
      this.fio2_gas,
      this.temp_gas,
      this.humidity_gas
    );
    this._ecls_parts.push(this._gas_in);

    this._gas_oxy = this._model_engine.models["ECLS_GASOXY"];
    this._gas_oxy.init_model({
      is_enabled: false,
      fixed_composition: false,
      vol: 0.1,
      u_vol: 0.1,
      el_base: 10000.0,
      el_k: 0.0,
      pres_atm: this.pres_atm,
    });

    this._gas_oxy.calc_model();
    set_gas_composition(
      this._gas_oxy,
      this.fio2_gas,
      this.temp_gas,
      this.humidity_gas
    );
    this._ecls_parts.push(this._gas_oxy);

    this._gas_out = this._model_engine.models["ECLS_GASOUT"];
    this._gas_out.init_model({
      is_enabled: false,
      fixed_composition: true,
      vol: 5.0,
      u_vol: 5.0,
      el_base: 1000.0,
      el_k: 0.0,
      pres_atm: this.pres_atm,
    });

    this._gas_out.calc_model();
    set_gas_composition(this._gas_out, 0.205, 20.0, 0.5);
    this._ecls_parts.push(this._gas_out);

    this._gas_in_oxy = this._model_engine.models["ECLS_GASIN_OXY"];
    this._gas_in_oxy.init_model({
      is_enabled: false,
      no_flow: false,
      no_back_flow: false,
      comp_from: this._gas_in,
      comp_to: this._gas_oxy,
      r_for: 2000.0,
      r_back: 2000.0,
      r_k: 0.0,
    });

    this._ecls_parts.push(this._gas_in_oxy);

    this._gas_oxy_out = this._model_engine.models["ECLS_OXY_GASOUT"];
    this._gas_oxy_out.init_model({
      is_enabled: false,
      no_flow: false,
      no_back_flow: false,
      comp_from: this._gas_oxy,
      comp_to: this._gas_out,
      r_for: 50.0,
      r_back: 50.0,
      r_k: 0.0,
    });

    this._ecls_parts.push(this._gas_oxy_out);
  }

  build_gasexchanger() {
    this._gasex = this._model_engine.models["ECLS_GASEX"];
    this._gasex.init_model({
      is_enabled: false,
      comp_blood: this._oxy,
      comp_gas: this._gas_oxy,
      dif_o2: this.diff_o2,
      dif_co2: this.diff_co2,
    });

    this._ecls_parts.push(this._gasex);
  }

  switch_ecls(state) {
    this._ecls_parts.forEach((ecls_part) => {
      ecls_part.is_enabled = state;
    });

    this._model_engine.rebuildExecutionListFlag = true;
    this.ecls_running = state;

    this._drainage_cannula.no_flow = !state;
    this._return_cannula.no_flow = !state;
  }

  switch_clamp(state) {
    this.ecls_clamped = state;
  }

  calc_volume(length, diameter) {
    return Math.PI * Math.pow(0.5 * diameter, 2) * length * 1000.0;
  }

  calc_resistance_tube(diameter, length, viscosity = 6.0) {
    const n_pas = viscosity / 1000.0;
    const length_meters = length;
    const radius_meters = diameter / 2;
    let res =
      (8.0 * n_pas * length_meters) / (Math.PI * Math.pow(radius_meters, 4));
    res = res * 0.00000750062;
    return res;
  }
}
