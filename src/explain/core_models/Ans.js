import { set_blood_composition } from "../helpers/BloodComposition";

export class Ans {
  static model_type = "Ans";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "baroreceptor_location",
      caption: "baroreceptor location",
      type: "list",
      optional: false,
      options: ["BloodCapacitance"],
    },
    {
      target: "chemoreceptor_location",
      caption: "chemoreceptor location",
      type: "list",
      optional: false,
      options: ["BloodCapacitance"],
    },
    {
      target: "change_map",
      caption: "mean arterial pressure (mmHg)",
      type: "function",
      optional: false,
      args: [
        {
          target: "min_map",
          caption: "min map",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 0.1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "set_map",
          caption: "set map",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "max_map",
          caption: "max map",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 0.1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
      ],
    },
    {
      target: "change_po2",
      caption: "oxygen partial pressure (mmHg)",
      type: "function",
      optional: false,
      args: [
        {
          target: "min_po2",
          caption: "min po2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 0.1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "set_po2",
          caption: "set po2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "max_po2",
          caption: "max po2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 0.1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
      ],
    },
    {
      target: "change_pco2",
      caption: "carbon dioxide partial pressure (mmHg)",
      type: "function",
      optional: false,
      args: [
        {
          target: "min_pco2",
          caption: "min pco2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 0.1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "set_pco2",
          caption: "set pco2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "max_pco2",
          caption: "max pco2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 0.1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
      ],
    },
    {
      target: "change_ph",
      caption: "hydrogen ion concentration (pH)",
      type: "function",
      optional: false,
      args: [
        {
          target: "min_ph",
          caption: "min ph",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 0.1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "set_ph",
          caption: "set ph",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "max_ph",
          caption: "max ph",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 0.1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
      ],
    },
    {
      target: "hr_targets",
      caption: "heartrate targets",
      type: "multiple-list",
      optional: false,
      options: ["Heart"],
    },
    {
      target: "change_hr_effector",
      caption: "hr effector configuration",
      type: "function",
      optional: true,
      args: [
        {
          target: "hr_factor_min",
          caption: "hr factor min",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 0.1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "hr_factor_max",
          caption: "hr factor max",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "hr_mxe_map_low",
          caption: "hr mxe map low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "hr_mxe_map_high",
          caption: "hr mxe map high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "hr_tc_map",
          caption: "hr tc map",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "hr_mxe_pco2_low",
          caption: "hr mxe pco2 low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "hr_mxe_pco2_high",
          caption: "hr mxe pco2 high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "hr_tc_pco2",
          caption: "hr tc pco2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "hr_mxe_ph_low",
          caption: "hr mxe ph low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "hr_mxe_ph_high",
          caption: "hr mxe ph high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "hr_tc_ph",
          caption: "hr tc ph",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "hr_mxe_po2_low",
          caption: "hr mxe po2 low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "hr_mxe_po2_high",
          caption: "hr mxe po2 high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "hr_tc_po2",
          caption: "hr tc po2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
      ],
    },
    {
      target: "mv_targets",
      caption: "minute volume targets",
      type: "multiple-list",
      optional: false,
      options: ["Breathing"],
    },
    {
      target: "change_mv_effector",
      caption: "mv effector configuration",
      type: "function",
      optional: true,
      args: [
        {
          target: "mv_factor_min",
          caption: "mv factor min",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 0.1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "mv_factor_max",
          caption: "mv factor max",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "mv_mxe_map_low",
          caption: "mv mxe map low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "mv_mxe_map_high",
          caption: "mv mxe map high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "mv_tc_map",
          caption: "mv tc map",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "mv_mxe_pco2_low",
          caption: "mv mxe pco2 low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "mv_mxe_pco2_high",
          caption: "mv mxe pco2 high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "mv_tc_pco2",
          caption: "mv tc pco2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "mv_mxe_ph_low",
          caption: "mv mxe ph low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "mv_mxe_ph_high",
          caption: "mv mxe ph high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "mv_tc_ph",
          caption: "mv tc ph",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "mv_mxe_po2_low",
          caption: "mv mxe po2 low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "mv_mxe_po2_high",
          caption: "mv mxe po2 high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "mv_tc_po2",
          caption: "mv tc po2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
      ],
    },
    {
      target: "venpool_targets",
      caption: "venous pool targets",
      type: "multiple-list",
      optional: false,
      options: ["BloodCapacitance"],
    },
    {
      target: "change_venpool_effector",
      caption: "venpool effector configuration",
      type: "function",
      optional: true,
      args: [
        {
          target: "venpool_factor_min",
          caption: "venpool factor min",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 0.1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "venpool_factor_max",
          caption: "venpool factor max",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "venpool_mxe_map_low",
          caption: "venpool mxe map low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "venpool_mxe_map_high",
          caption: "venpool mxe map high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "venpool_tc_map",
          caption: "venpool tc map",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "venpool_mxe_pco2_low",
          caption: "venpool mxe pco2 low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "venpool_mxe_pco2_high",
          caption: "venpool mxe pco2 high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "venpool_tc_pco2",
          caption: "venpool tc pco2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "venpool_mxe_ph_low",
          caption: "venpool mxe ph low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "venpool_mxe_ph_high",
          caption: "venpool mxe ph high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "venpool_tc_ph",
          caption: "venpool tc ph",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "venpool_mxe_po2_low",
          caption: "venpool mxe po2 low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "venpool_mxe_po2_high",
          caption: "venpool mxe po2 high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "venpool_tc_po2",
          caption: "venpool tc po2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
      ],
    },
    {
      target: "cont_targets",
      caption: "contractility targets",
      type: "multiple-list",
      optional: false,
      options: ["BloodTimeVaryingElastance"],
    },
    {
      target: "change_cont_effector",
      caption: "cont effector configuration",
      type: "function",
      optional: true,
      args: [
        {
          target: "cont_factor_min",
          caption: "cont factor min",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 0.1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "cont_factor_max",
          caption: "cont factor max",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "cont_mxe_map_low",
          caption: "cont mxe map low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "cont_mxe_map_high",
          caption: "cont mxe map high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "cont_tc_map",
          caption: "cont tc map",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "cont_mxe_pco2_low",
          caption: "cont mxe pco2 low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "cont_mxe_pco2_high",
          caption: "cont mxe pco2 high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "cont_tc_pco2",
          caption: "cont tc pco2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "cont_mxe_ph_low",
          caption: "cont mxe ph low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "cont_mxe_ph_high",
          caption: "cont mxe ph high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "cont_tc_ph",
          caption: "cont tc ph",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "cont_mxe_po2_low",
          caption: "cont mxe po2 low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "cont_mxe_po2_high",
          caption: "cont mxe po2 high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "cont_tc_po2",
          caption: "cont tc po2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
      ],
    },
    {
      target: "svr_targets",
      caption: "svr targets",
      type: "multiple-list",
      optional: false,
      options: ["BloodResistor"],
    },
    {
      target: "change_svr_effector",
      caption: "svr effector configuration",
      type: "function",
      optional: true,
      args: [
        {
          target: "svr_factor_min",
          caption: "svr factor min",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 0.1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "svr_factor_max",
          caption: "svr factor max",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "svr_mxe_map_low",
          caption: "svr mxe map low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "svr_mxe_map_high",
          caption: "svr mxe map high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "svr_tc_map",
          caption: "svr tc map",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "svr_mxe_pco2_low",
          caption: "svr mxe pco2 low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "svr_mxe_pco2_high",
          caption: "svr mxe pco2 high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "svr_tc_pco2",
          caption: "svr tc pco2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "svr_mxe_ph_low",
          caption: "svr mxe ph low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "svr_mxe_ph_high",
          caption: "svr mxe ph high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "svr_tc_ph",
          caption: "svr tc ph",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "svr_mxe_po2_low",
          caption: "svr mxe po2 low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "svr_mxe_po2_high",
          caption: "svr mxe po2 high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "svr_tc_po2",
          caption: "svr tc po2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
      ],
    },
    {
      target: "pvr_targets",
      caption: "pvr targets",
      type: "multiple-list",
      optional: false,
      options: ["BloodResistor"],
    },
    {
      target: "change_pvr_effector",
      caption: "pvr effector configuration",
      type: "function",
      optional: true,
      args: [
        {
          target: "pvr_factor_min",
          caption: "pvr factor min",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 0.1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "pvr_factor_max",
          caption: "pvr factor max",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "pvr_mxe_map_low",
          caption: "pvr mxe map low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "pvr_mxe_map_high",
          caption: "pvr mxe map high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "pvr_tc_map",
          caption: "pvr tc map",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "pvr_mxe_pco2_low",
          caption: "pvr mxe pco2 low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "pvr_mxe_pco2_high",
          caption: "pvr mxe pco2 high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "pvr_tc_pco2",
          caption: "pvr tc pco2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "pvr_mxe_ph_low",
          caption: "pvr mxe ph low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "pvr_mxe_ph_high",
          caption: "pvr mxe ph high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "pvr_tc_ph",
          caption: "pvr tc ph",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "pvr_mxe_po2_low",
          caption: "pvr mxe po2 low",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "pvr_mxe_po2_high",
          caption: "pvr mxe po2 high",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
        },
        {
          target: "pvr_tc_po2",
          caption: "pvr tc po2",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100000000000000.0,
          ll: 0.0,
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

  ans_active = true;
  chemoreceptor_location = "AAR";
  baroreceptor_location = "AAR";
  hr_targets = ["Heart"];
  mv_targets = ["Breathing"];
  venpool_targets = ["IVCE", "SVC"];
  cont_targets = ["LV", "RV", "LA", "RA"];
  svr_targets = ["AD_INT", "AD_KID", "AD_LS", "AAR_RUB", "AD_RLB"];
  pvr_targets = ["PA_LL", "PA_RL"];

  hr_effect_factor = 0.0;
  mv_effect_factor = 0.0;
  venpool_effect_factor = 0.0;
  cont_effect_factor = 0.0;
  svr_effect_factor = 0.0;
  pvr_effect_factor = 0.0;

  min_map = 20.0;
  set_map = 57.5;
  max_map = 100.0;

  min_pco2 = 20.0;
  set_pco2 = 57.5;
  max_pco2 = 100.0;

  min_ph = 20.0;
  set_ph = 57.5;
  max_ph = 100.0;

  min_po2 = 20.0;
  set_po2 = 57.5;
  max_po2 = 100.0;

  // dependent parameters

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;

  _baroreceptor = {};
  _chemoreceptor = {};
  _hr_targets = [];
  _hr_effector = {};
  _mv_targets = [];
  _mv_effector = {};
  _venpool_targets = [];
  _venpool_effector = {};
  _cont_targets = [];
  _cont_effector = {};
  _svr_targets = [];
  _svr_effector = {};
  _pvr_targets = [];
  _pvr_effector = {};

  _update_window = 0.015;
  _update_counter = 0.0;

  _pressures = [];
  _data_window = 133;

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

    // fill the list of pressures with the baroreflex start point
    this._pressures = new Array(this._data_window).fill(this.set_map);

    // initialize the effectors
    this.init_effectors();

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  change_map(min_map, set_map, max_map) {
    this.min_map = min_map;
    this.set_map = set_map;
    this.max_map = max_map;
    AnsEffector.min_map = this.min_map;
    AnsEffector.set_map = this.set_map;
    AnsEffector.max_map = this.max_map;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
  }

  change_set_map(new_map) {
    this.set_map = new_map;
    AnsEffector.set_map = this.set_map;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
  }

  change_min_map(new_map) {
    this.min_map = new_map;
    AnsEffector.min_map = this.min_map;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
  }

  change_max_map(new_map) {
    this.max_map = new_map;
    AnsEffector.max_map = this.max_map;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
  }

  change_po2(min_po2, set_po2, max_po2) {
    this.min_po2 = min_po2;
    this.set_po2 = set_po2;
    this.max_po2 = max_po2;
    AnsEffector.set_po2 = this.set_po2;
    AnsEffector.min_po2 = this.min_po2;
    AnsEffector.max_po2 = this.max_po2;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
    this._mv_effector.calc_gains();
  }

  change_set_po2(new_po2) {
    this.set_po2 = new_po2;
    AnsEffector.set_po2 = this.set_po2;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
    this._mv_effector.calc_gains();
  }

  change_max_po2(new_po2) {
    this.max_po2 = new_po2;
    AnsEffector.max_po2 = this.max_po2;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
    this._mv_effector.calc_gains();
  }

  change_min_po2(new_po2) {
    this.min_po2 = new_po2;
    AnsEffector.min_po2 = this.min_po2;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
    this._mv_effector.calc_gains();
  }

  change_pco2(min_pco2, set_pco2, max_pco2) {
    this.min_pco2 = min_pco2;
    this.set_pco2 = set_pco2;
    this.max_pco2 = max_pco2;
    AnsEffector.set_po2 = this.set_pco2;
    AnsEffector.min_po2 = this.min_pco2;
    AnsEffector.max_po2 = this.max_pco2;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
    this._mv_effector.calc_gains();
  }

  change_set_pco2(new_pco2) {
    this.set_pco2 = new_pco2;
    AnsEffector.set_pco2 = this.set_pco2;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
    this._mv_effector.calc_gains();
  }

  change_max_pco2(new_pco2) {
    this.max_pco2 = new_pco2;
    AnsEffector.max_pco2 = this.max_pco2;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
    this._mv_effector.calc_gains();
  }

  change_min_pco2(new_pco2) {
    this.min_pco2 = new_pco2;
    AnsEffector.min_pco2 = this.min_pco2;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
    this._mv_effector.calc_gains();
  }

  change_ph(min_ph, set_ph, max_ph) {
    this.set_ph = set_ph;
    this.min_ph = min_ph;
    this.max_ph = max_ph;
    AnsEffector.set_ph = this.set_ph;
    AnsEffector.min_ph = this.min_ph;
    AnsEffector.max_ph = this.max_ph;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
    this._mv_effector.calc_gains();
  }

  change_set_ph(new_ph) {
    this.set_ph = new_ph;
    AnsEffector.set_ph = this.set_ph;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
    this._mv_effector.calc_gains();
  }

  change_max_ph(new_ph) {
    this.max_ph = new_ph;
    AnsEffector.max_ph = this.max_ph;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
    this._mv_effector.calc_gains();
  }

  change_min_ph(new_ph) {
    this.min_ph = new_ph;
    AnsEffector.min_pco2 = this.min_ph;
    this._hr_effector.calc_gains();
    this._svr_effector.calc_gains();
    this._pvr_effector.calc_gains();
    this._cont_effector.calc_gains();
    this._venpool_effector.calc_gains();
    this._mv_effector.calc_gains();
  }

  change_hr_effector(
    min,
    max,
    tc,
    mxe_map_low,
    mxe_map_high,
    tc_map,
    mxe_pco2_low,
    mxe_pco2_high,
    tc_pco2,
    mxe_ph_low,
    mxe_ph_high,
    tc_ph,
    mxe_po2_low,
    mxe_po2_high,
    tc_po2
  ) {
    this.hr_factor_min = min;
    this.hr_factor_max = max;
    this.hr_tc = tc;
    this.hr_mxe_map_low = mxe_map_low;
    this.hr_mxe_map_high = mxe_map_high;
    this.hr_tc_map = tc_map;
    this.hr_mxe_pco2_low = mxe_pco2_low;
    this.hr_mxe_pco2_high = mxe_pco2_high;
    this.hr_tc_pco2 = tc_pco2;
    this.hr_mxe_ph_low = mxe_ph_low;
    this.hr_mxe_ph_high = mxe_ph_high;
    this.hr_tc_ph = tc_ph;
    this.hr_mxe_po2_low = mxe_po2_low;
    this.hr_mxe_po2_high = mxe_po2_high;
    this.hr_tc_po2 = tc_po2;
    this._hr_effector.calc_gains();
  }

  change_mv_effector(
    min,
    max,
    tc,
    mxe_map_low,
    mxe_map_high,
    tc_map,
    mxe_pco2_low,
    mxe_pco2_high,
    tc_pco2,
    mxe_ph_low,
    mxe_ph_high,
    tc_ph,
    mxe_po2_low,
    mxe_po2_high,
    tc_po2
  ) {
    this.mv_factor_min = min;
    this.mv_factor_max = max;
    this.mv_tc = tc;
    this.mv_mxe_map_low = mxe_map_low;
    this.mv_mxe_map_high = mxe_map_high;
    this.mv_tc_map = tc_map;
    this.mv_mxe_pco2_low = mxe_pco2_low;
    this.mv_mxe_pco2_high = mxe_pco2_high;
    this.mv_tc_pco2 = tc_pco2;
    this.mv_mxe_ph_low = mxe_ph_low;
    this.mv_mxe_ph_high = mxe_ph_high;
    this.mv_tc_ph = tc_ph;
    this.mv_mxe_po2_low = mxe_po2_low;
    this.mv_mxe_po2_high = mxe_po2_high;
    this.mv_tc_po2 = tc_po2;
    this._mv_effector.calc_gains();
  }

  change_venpool_effector(
    min,
    max,
    tc,
    mxe_map_low,
    mxe_map_high,
    tc_map,
    mxe_pco2_low,
    mxe_pco2_high,
    tc_pco2,
    mxe_ph_low,
    mxe_ph_high,
    tc_ph,
    mxe_po2_low,
    mxe_po2_high,
    tc_po2
  ) {
    this.venpool_factor_min = min;
    this.venpool_factor_max = max;
    this.venpool_tc = tc;
    this.venpool_mxe_map_low = mxe_map_low;
    this.venpool_mxe_map_high = mxe_map_high;
    this.venpool_tc_map = tc_map;
    this.venpool_mxe_pco2_low = mxe_pco2_low;
    this.venpool_mxe_pco2_high = mxe_pco2_high;
    this.venpool_tc_pco2 = tc_pco2;
    this.venpool_mxe_ph_low = mxe_ph_low;
    this.venpool_mxe_ph_high = mxe_ph_high;
    this.venpool_tc_ph = tc_ph;
    this.venpool_mxe_po2_low = mxe_po2_low;
    this.venpool_mxe_po2_high = mxe_po2_high;
    this.venpool_tc_po2 = tc_po2;
    this._venpool_effector.calc_gains();
  }

  change_cont_effector(
    min,
    max,
    tc,
    mxe_map_low,
    mxe_map_high,
    tc_map,
    mxe_pco2_low,
    mxe_pco2_high,
    tc_pco2,
    mxe_ph_low,
    mxe_ph_high,
    tc_ph,
    mxe_po2_low,
    mxe_po2_high,
    tc_po2
  ) {
    this.cont_factor_min = min;
    this.cont_factor_max = max;
    this.cont_tc = tc;
    this.cont_mxe_map_low = mxe_map_low;
    this.cont_mxe_map_high = mxe_map_high;
    this.cont_tc_map = tc_map;
    this.cont_mxe_pco2_low = mxe_pco2_low;
    this.cont_mxe_pco2_high = mxe_pco2_high;
    this.cont_tc_pco2 = tc_pco2;
    this.cont_mxe_ph_low = mxe_ph_low;
    this.cont_mxe_ph_high = mxe_ph_high;
    this.cont_tc_ph = tc_ph;
    this.cont_mxe_po2_low = mxe_po2_low;
    this.cont_mxe_po2_high = mxe_po2_high;
    this.cont_tc_po2 = tc_po2;
    this._cont_effector.calc_gains();
  }

  change_svr_effector(
    min,
    max,
    tc,
    mxe_map_low,
    mxe_map_high,
    tc_map,
    mxe_pco2_low,
    mxe_pco2_high,
    tc_pco2,
    mxe_ph_low,
    mxe_ph_high,
    tc_ph,
    mxe_po2_low,
    mxe_po2_high,
    tc_po2
  ) {
    this.svr_factor_min = min;
    this.svr_factor_max = max;
    this.svr_tc = tc;
    this.svr_mxe_map_low = mxe_map_low;
    this.svr_mxe_map_high = mxe_map_high;
    this.svr_tc_map = tc_map;
    this.svr_mxe_pco2_low = mxe_pco2_low;
    this.svr_mxe_pco2_high = mxe_pco2_high;
    this.svr_tc_pco2 = tc_pco2;
    this.svr_mxe_ph_low = mxe_ph_low;
    this.svr_mxe_ph_high = mxe_ph_high;
    this.svr_tc_ph = tc_ph;
    this.svr_mxe_po2_low = mxe_po2_low;
    this.svr_mxe_po2_high = mxe_po2_high;
    this.svr_tc_po2 = tc_po2;
    this._svr_effector.calc_gains();
  }

  change_pvr_effector(
    min,
    max,
    tc,
    mxe_map_low,
    mxe_map_high,
    tc_map,
    mxe_pco2_low,
    mxe_pco2_high,
    tc_pco2,
    mxe_ph_low,
    mxe_ph_high,
    tc_ph,
    mxe_po2_low,
    mxe_po2_high,
    tc_po2
  ) {
    this.pvr_factor_min = min;
    this.pvr_factor_max = max;
    this.pvr_tc = tc;
    this.pvr_mxe_map_low = mxe_map_low;
    this.pvr_mxe_map_high = mxe_map_high;
    this.pvr_tc_map = tc_map;
    this.pvr_mxe_pco2_low = mxe_pco2_low;
    this.pvr_mxe_pco2_high = mxe_pco2_high;
    this.pvr_tc_pco2 = tc_pco2;
    this.pvr_mxe_ph_low = mxe_ph_low;
    this.pvr_mxe_ph_high = mxe_ph_high;
    this.pvr_tc_ph = tc_ph;
    this.pvr_mxe_po2_low = mxe_po2_low;
    this.pvr_mxe_po2_high = mxe_po2_high;
    this.pvr_tc_po2 = tc_po2;
    this._pvr_effector.calc_gains();
  }

  step_model() {
    if (this.is_enabled && this._is_initialized && this.ans_active) {
      this.calc_model();
    }
  }

  calc_model() {
    // the ans model is executed at a lower frequency then the model step for performance reasons
    if (this._update_counter > this._update_window) {
      // get a reference to the baro- and chemoreceptors
      this._baroreceptor =
        this._model_engine.models[this.baroreceptor_location];
      this._chemoreceptor =
        this._model_engine.models[this.chemoreceptor_location];

      // insert a new pressure at the start of the list
      this._pressures.unshift(this._baroreceptor.pres);

      // remove the last pressure from the list
      this._pressures.pop();

      // get the moving average of the pressure. We now have the mean arterial pressure
      //this._map = Math.sum(this._pressures) / this._data_window;
      this._map =
        this._pressures.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        ) / this._data_window;

      // update the independent parameters
      AnsEffector.min_map = this.min_map;
      AnsEffector.set_map = this.set_map;
      AnsEffector.max_map = this.max_map;

      AnsEffector.min_pco2 = this.min_pco2;
      AnsEffector.set_pco2 = this.set_pco2;
      AnsEffector.max_pco2 = this.max_pco2;

      AnsEffector.min_ph = this.min_ph;
      AnsEffector.set_ph = this.set_ph;
      AnsEffector.max_ph = this.max_ph;

      AnsEffector.min_po2 = this.min_po2;
      AnsEffector.set_po2 = this.set_po2;
      AnsEffector.max_po2 = this.max_po2;

      // set the properties
      this._hr_effector.factor_max = this.hr_factor_max;
      this._hr_effector.factor_min = this.hr_factor_min;
      this._hr_effector.mxe_map_low = this.hr_mxe_map_low;
      this._hr_effector.mxe_map_high = this.hr_mxe_map_high;
      this._hr_effector.tc_map = this.hr_tc_map;
      this._hr_effector.mxe_pco2_low = this.hr_mxe_pco2_low;
      this._hr_effector.mxe_pco2_high = this.hr_mxe_pco2_high;
      this._hr_effector.tc_pco2 = this.hr_tc_pco2;
      this._hr_effector.mxe_ph_low = this.hr_mxe_ph_low;
      this._hr_effector.mxe_ph_high = this.hr_mxe_ph_high;
      this._hr_effector.tc_ph = this.hr_tc_ph;
      this._hr_effector.mxe_po2_low = this.hr_mxe_po2_low;
      this._hr_effector.mxe_po2_high = this.hr_mxe_po2_high;
      this._hr_effector.tc_po2 = this.hr_tc_po2;

      this._mv_effector.factor_max = this.mv_factor_max;
      this._mv_effector.factor_min = this.mv_factor_min;
      this._mv_effector.mxe_map_low = this.mv_mxe_map_low;
      this._mv_effector.mxe_map_high = this.mv_mxe_map_high;
      this._mv_effector.tc_map = this.mv_tc_map;
      this._mv_effector.mxe_pco2_low = this.mv_mxe_pco2_low;
      this._mv_effector.mxe_pco2_high = this.mv_mxe_pco2_high;
      this._mv_effector.tc_pco2 = this.mv_tc_pco2;
      this._mv_effector.mxe_ph_low = this.mv_mxe_ph_low;
      this._mv_effector.mxe_ph_high = this.mv_mxe_ph_high;
      this._mv_effector.tc_ph = this.mv_tc_ph;
      this._mv_effector.mxe_po2_low = this.mv_mxe_po2_low;
      this._mv_effector.mxe_po2_high = this.mv_mxe_po2_high;
      this._mv_effector.tc_po2 = this.mv_tc_po2;

      this._venpool_effector.factor_max = this.venpool_factor_max;
      this._venpool_effector.factor_min = this.venpool_factor_min;
      this._venpool_effector.mxe_map_low = this.venpool_mxe_map_low;
      this._venpool_effector.mxe_map_high = this.venpool_mxe_map_high;
      this._venpool_effector.tc_map = this.venpool_tc_map;
      this._venpool_effector.mxe_pco2_low = this.venpool_mxe_pco2_low;
      this._venpool_effector.mxe_pco2_high = this.venpool_mxe_pco2_high;
      this._venpool_effector.tc_pco2 = this.venpool_tc_pco2;
      this._venpool_effector.mxe_ph_low = this.venpool_mxe_ph_low;
      this._venpool_effector.mxe_ph_high = this.venpool_mxe_ph_high;
      this._venpool_effector.tc_ph = this.venpool_tc_ph;
      this._venpool_effector.mxe_po2_low = this.venpool_mxe_po2_low;
      this._venpool_effector.mxe_po2_high = this.venpool_mxe_po2_high;
      this._venpool_effector.tc_po2 = this.venpool_tc_po2;

      this._cont_effector.factor_max = this.cont_factor_max;
      this._cont_effector.factor_min = this.cont_factor_min;
      this._cont_effector.mxe_map_low = this.cont_mxe_map_low;
      this._cont_effector.mxe_map_high = this.cont_mxe_map_high;
      this._cont_effector.tc_map = this.cont_tc_map;
      this._cont_effector.mxe_pco2_low = this.cont_mxe_pco2_low;
      this._cont_effector.mxe_pco2_high = this.cont_mxe_pco2_high;
      this._cont_effector.tc_pco2 = this.cont_tc_pco2;
      this._cont_effector.mxe_ph_low = this.cont_mxe_ph_low;
      this._cont_effector.mxe_ph_high = this.cont_mxe_ph_high;
      this._cont_effector.tc_ph = this.cont_tc_ph;
      this._cont_effector.mxe_po2_low = this.cont_mxe_po2_low;
      this._cont_effector.mxe_po2_high = this.cont_mxe_po2_high;
      this._cont_effector.tc_po2 = this.cont_tc_po2;

      this._svr_effector.factor_max = this.svr_factor_max;
      this._svr_effector.factor_min = this.svr_factor_min;
      this._svr_effector.mxe_map_low = this.svr_mxe_map_low;
      this._svr_effector.mxe_map_high = this.svr_mxe_map_high;
      this._svr_effector.tc_map = this.svr_tc_map;
      this._svr_effector.mxe_pco2_low = this.svr_mxe_pco2_low;
      this._svr_effector.mxe_pco2_high = this.svr_mxe_pco2_high;
      this._svr_effector.tc_pco2 = this.svr_tc_pco2;
      this._svr_effector.mxe_ph_low = this.svr_mxe_ph_low;
      this._svr_effector.mxe_ph_high = this.svr_mxe_ph_high;
      this._svr_effector.tc_ph = this.svr_tc_ph;
      this._svr_effector.mxe_po2_low = this.svr_mxe_po2_low;
      this._svr_effector.mxe_po2_high = this.svr_mxe_po2_high;
      this._svr_effector.tc_po2 = this.svr_tc_po2;

      this._pvr_effector.factor_max = this.pvr_factor_max;
      this._pvr_effector.factor_min = this.pvr_factor_min;
      this._pvr_effector.mxe_map_low = this.pvr_mxe_map_low;
      this._pvr_effector.mxe_map_high = this.pvr_mxe_map_high;
      this._pvr_effector.tc_map = this.pvr_tc_map;
      this._pvr_effector.mxe_pco2_low = this.pvr_mxe_pco2_low;
      this._pvr_effector.mxe_pco2_high = this.pvr_mxe_pco2_high;
      this._pvr_effector.tc_pco2 = this.pvr_tc_pco2;
      this._pvr_effector.mxe_ph_low = this.pvr_mxe_ph_low;
      this._pvr_effector.mxe_ph_high = this.pvr_mxe_ph_high;
      this._pvr_effector.tc_ph = this.pvr_tc_ph;
      this._pvr_effector.mxe_po2_low = this.pvr_mxe_po2_low;
      this._pvr_effector.mxe_po2_high = this.pvr_mxe_po2_high;
      this._pvr_effector.tc_po2 = this.pvr_tc_po2;

      // for the chemoreflex we need the acidbase and oxygenation of the location of the chemoreceptor
      set_blood_composition(this._chemoreceptor);

      // get the chemoreflex inputs
      this._po2 = this._chemoreceptor.aboxy["po2"];
      this._pco2 = this._chemoreceptor.aboxy["pco2"];
      this._ph = this._chemoreceptor.aboxy["ph"];

      // calculate the ans effect factors and apply the effects
      this.hr_effect_factor = this._hr_effector.calc_ans_effect_factor(
        this._map,
        this._pco2,
        this._ph,
        this._po2
      );

      for (let hrt of this.hr_targets) {
        this._model_engine.models[hrt].hr_ans_factor = this.hr_effect_factor;
      }

      this.mv_effect_factor = this._mv_effector.calc_ans_effect_factor(
        this._map,
        this._pco2,
        this._ph,
        this._po2
      );

      for (let mvt of this.mv_targets) {
        this._model_engine.models[mvt].mv_ans_factor = this.mv_effect_factor;
      }

      this.venpool_effect_factor =
        this._venpool_effector.calc_ans_effect_factor(
          this._map,
          this._pco2,
          this._ph,
          this._po2
        );

      for (let vpt of this.venpool_targets) {
        this._model_engine.models[vpt].u_vol_ans_factor =
          this.venpool_effect_factor;
      }

      this.cont_effect_factor = this._cont_effector.calc_ans_effect_factor(
        this._map,
        this._pco2,
        this._ph,
        this._po2
      );
      for (let contt of this.cont_targets) {
        this._model_engine.models[contt].el_max_ans_factor =
          this.cont_effect_factor;
      }

      this.svr_effect_factor = this._svr_effector.calc_ans_effect_factor(
        this._map,
        this._pco2,
        this._ph,
        this._po2
      );

      for (let svrt of this.svr_targets) {
        this._model_engine.models[svrt].r_ans_factor = this.svr_effect_factor;
      }

      this.pvr_effect_factor = this._pvr_effector.calc_ans_effect_factor(
        this._map,
        this._pco2,
        this._ph,
        this._po2
      );

      for (let pvrt of this.pvr_targets) {
        this._model_engine.models[pvrt].r_ans_factor = this.pvr_effect_factor;
      }

      // reset the update counter
      this._update_counter = 0.0;
    }

    this._update_counter += this._t;
  }

  freeze_scaling() {}

  freeze_factors() {}

  init_effectors() {
    // set the class attributes (so for all classes)
    AnsEffector.min_map = this.min_map;
    AnsEffector.set_map = this.set_map;
    AnsEffector.max_map = this.max_map;

    AnsEffector.min_pco2 = this.min_pco2;
    AnsEffector.set_pco2 = this.set_pco2;
    AnsEffector.max_pco2 = this.max_pco2;

    AnsEffector.min_ph = this.min_ph;
    AnsEffector.set_ph = this.set_ph;
    AnsEffector.max_ph = this.max_ph;

    AnsEffector.min_po2 = this.min_po2;
    AnsEffector.set_po2 = this.set_po2;
    AnsEffector.max_po2 = this.max_po2;

    this._hr_effector = new AnsEffector();
    this._hr_effector.factor = this.hr_factor;
    this._hr_effector.factor_max = this.hr_factor_max;
    this._hr_effector.factor_min = this.hr_factor_min;
    this._hr_effector.mxe_map_low = this.hr_mxe_map_low;
    this._hr_effector.mxe_map_high = this.hr_mxe_map_high;
    this._hr_effector.tc_map = this.hr_tc_map;
    this._hr_effector.mxe_pco2_low = this.hr_mxe_pco2_low;
    this._hr_effector.mxe_pco2_high = this.hr_mxe_pco2_high;
    this._hr_effector.tc_pco2 = this.hr_tc_pco2;
    this._hr_effector.mxe_ph_low = this.hr_mxe_ph_low;
    this._hr_effector.mxe_ph_high = this.hr_mxe_ph_high;
    this._hr_effector.tc_ph = this.hr_tc_ph;
    this._hr_effector.mxe_po2_low = this.hr_mxe_po2_low;
    this._hr_effector.mxe_po2_high = this.hr_mxe_po2_high;
    this._hr_effector.tc_po2 = this.hr_tc_po2;
    this._hr_effector.calc_gains();

    this._mv_effector = new AnsEffector();
    this._mv_effector.factor = this.mv_factor;
    this._mv_effector.factor_max = this.mv_factor_max;
    this._mv_effector.factor_min = this.mv_factor_min;
    this._mv_effector.mxe_map_low = this.mv_mxe_map_low;
    this._mv_effector.mxe_map_high = this.mv_mxe_map_high;
    this._mv_effector.tc_map = this.mv_tc_map;
    this._mv_effector.mxe_pco2_low = this.mv_mxe_pco2_low;
    this._mv_effector.mxe_pco2_high = this.mv_mxe_pco2_high;
    this._mv_effector.tc_pco2 = this.mv_tc_pco2;
    this._mv_effector.mxe_ph_low = this.mv_mxe_ph_low;
    this._mv_effector.mxe_ph_high = this.mv_mxe_ph_high;
    this._mv_effector.tc_ph = this.mv_tc_ph;
    this._mv_effector.mxe_po2_low = this.mv_mxe_po2_low;
    this._mv_effector.mxe_po2_high = this.mv_mxe_po2_high;
    this._mv_effector.tc_po2 = this.mv_tc_po2;
    this._mv_effector.calc_gains();

    this._venpool_effector = new AnsEffector();
    this._venpool_effector.factor = this.venpool_factor;
    this._venpool_effector.factor_max = this.venpool_factor_max;
    this._venpool_effector.factor_min = this.venpool_factor_min;
    this._venpool_effector.mxe_map_low = this.venpool_mxe_map_low;
    this._venpool_effector.mxe_map_high = this.venpool_mxe_map_high;
    this._venpool_effector.tc_map = this.venpool_tc_map;
    this._venpool_effector.mxe_pco2_low = this.venpool_mxe_pco2_low;
    this._venpool_effector.mxe_pco2_high = this.venpool_mxe_pco2_high;
    this._venpool_effector.tc_pco2 = this.venpool_tc_pco2;
    this._venpool_effector.mxe_ph_low = this.venpool_mxe_ph_low;
    this._venpool_effector.mxe_ph_high = this.venpool_mxe_ph_high;
    this._venpool_effector.tc_ph = this.venpool_tc_ph;
    this._venpool_effector.mxe_po2_low = this.venpool_mxe_po2_low;
    this._venpool_effector.mxe_po2_high = this.venpool_mxe_po2_high;
    this._venpool_effector.tc_po2 = this.venpool_tc_po2;
    this._venpool_effector.calc_gains();

    this._cont_effector = new AnsEffector();
    this._cont_effector.factor = this.cont_factor;
    this._cont_effector.factor_max = this.cont_factor_max;
    this._cont_effector.factor_min = this.cont_factor_min;
    this._cont_effector.mxe_map_low = this.cont_mxe_map_low;
    this._cont_effector.mxe_map_high = this.cont_mxe_map_high;
    this._cont_effector.tc_map = this.cont_tc_map;
    this._cont_effector.mxe_pco2_low = this.cont_mxe_pco2_low;
    this._cont_effector.mxe_pco2_high = this.cont_mxe_pco2_high;
    this._cont_effector.tc_pco2 = this.cont_tc_pco2;
    this._cont_effector.mxe_ph_low = this.cont_mxe_ph_low;
    this._cont_effector.mxe_ph_high = this.cont_mxe_ph_high;
    this._cont_effector.tc_ph = this.cont_tc_ph;
    this._cont_effector.mxe_po2_low = this.cont_mxe_po2_low;
    this._cont_effector.mxe_po2_high = this.cont_mxe_po2_high;
    this._cont_effector.tc_po2 = this.cont_tc_po2;
    this._cont_effector.calc_gains();

    this._svr_effector = new AnsEffector();
    this._svr_effector.factor = this.svr_factor;
    this._svr_effector.factor_max = this.svr_factor_max;
    this._svr_effector.factor_min = this.svr_factor_min;
    this._svr_effector.mxe_map_low = this.svr_mxe_map_low;
    this._svr_effector.mxe_map_high = this.svr_mxe_map_high;
    this._svr_effector.tc_map = this.svr_tc_map;
    this._svr_effector.mxe_pco2_low = this.svr_mxe_pco2_low;
    this._svr_effector.mxe_pco2_high = this.svr_mxe_pco2_high;
    this._svr_effector.tc_pco2 = this.svr_tc_pco2;
    this._svr_effector.mxe_ph_low = this.svr_mxe_ph_low;
    this._svr_effector.mxe_ph_high = this.svr_mxe_ph_high;
    this._svr_effector.tc_ph = this.svr_tc_ph;
    this._svr_effector.mxe_po2_low = this.svr_mxe_po2_low;
    this._svr_effector.mxe_po2_high = this.svr_mxe_po2_high;
    this._svr_effector.tc_po2 = this.svr_tc_po2;
    this._svr_effector.calc_gains();

    this._pvr_effector = new AnsEffector();
    this._pvr_effector.factor = this.pvr_factor;
    this._pvr_effector.factor_max = this.pvr_factor_max;
    this._pvr_effector.factor_min = this.pvr_factor_min;
    this._pvr_effector.mxe_map_low = this.pvr_mxe_map_low;
    this._pvr_effector.mxe_map_high = this.pvr_mxe_map_high;
    this._pvr_effector.tc_map = this.pvr_tc_map;
    this._pvr_effector.mxe_pco2_low = this.pvr_mxe_pco2_low;
    this._pvr_effector.mxe_pco2_high = this.pvr_mxe_pco2_high;
    this._pvr_effector.tc_pco2 = this.pvr_tc_pco2;
    this._pvr_effector.mxe_ph_low = this.pvr_mxe_ph_low;
    this._pvr_effector.mxe_ph_high = this.pvr_mxe_ph_high;
    this._pvr_effector.tc_ph = this.pvr_tc_ph;
    this._pvr_effector.mxe_po2_low = this.pvr_mxe_po2_low;
    this._pvr_effector.mxe_po2_high = this.pvr_mxe_po2_high;
    this._pvr_effector.tc_po2 = this.pvr_tc_po2;
    this._pvr_effector.calc_gains();
  }
}

export class AnsEffector {
  is_enabled = true;

  static min_map = 20.0;
  static set_map = 57.5;
  static max_map = 100.0;

  static min_pco2 = 20.0;
  static set_pco2 = 57.5;
  static max_pco2 = 100.0;

  static min_ph = 20.0;
  static set_ph = 57.5;
  static max_ph = 100.0;

  static min_po2 = 20.0;
  static set_po2 = 57.5;
  static max_po2 = 100.0;

  factor = 1.0;
  factor_max = 2.5;
  factor_min = 0.01;

  mxe_map_low = 0.0;
  g_map_low = 0.0;
  mxe_map_high = 0.0;
  g_map_high = 0.0;
  tc_map = 1.0;

  mxe_pco2_low = 0.0;
  g_pco2_low = 0.0;
  mxe_pco2_high = 0.0;
  g_pco2_high = 0.0;
  tc_pco2 = 1.0;

  mxe_ph_low = 0.0;
  g_ph_low = 0.0;
  mxe_ph_high = 0.0;
  g_ph_high = 0.0;
  tc_ph = 1.0;

  mxe_po2_low = 0.0;
  g_po2_low = 0.0;
  mxe_po2_high = 0.0;
  g_po2_high = 0.0;
  tc_po2 = 1.0;

  _a_map = 0.0;
  _a_pco2 = 0.0;
  _a_ph = 0.0;
  _a_po2 = 0.0;

  _d_map = 0.0;
  _d_pco2 = 0.0;
  _d_ph = 0.0;
  _d_po2 = 0.0;

  constructor(
    min_map,
    set_map,
    max_map,
    min_ph,
    set_ph,
    max_ph,
    min_po2,
    set_po2,
    max_po2,
    min_pco2,
    set_pco2,
    max_pco2
  ) {
    this.min_map = min_map;
    this.set_map = set_map;
    this.max_map = max_map;

    this.min_ph = min_ph;
    this.set_ph = set_ph;
    this.max_ph = max_ph;

    this.min_po2 = min_po2;
    this.set_po2 = set_po2;
    this.max_po2 = max_po2;

    this.min_pco2 = min_pco2;
    this.set_pco2 = set_pco2;
    this.max_pco2 = max_pco2;
  }
  calc_gains() {
    this.g_map_low =
      this.translate_mxe(this.mxe_map_low) /
      (AnsEffector.min_map - AnsEffector.set_map);
    this.g_map_high =
      this.translate_mxe(this.mxe_map_high) /
      (AnsEffector.max_map - AnsEffector.set_map);
    this.g_pco2_low =
      this.translate_mxe(this.mxe_pco2_low) /
      (AnsEffector.min_pco2 - AnsEffector.set_pco2);
    this.g_pco2_high =
      this.translate_mxe(this.mxe_pco2_high) /
      (AnsEffector.max_pco2 - AnsEffector.set_pco2);
    this.g_ph_low =
      this.translate_mxe(this.mxe_ph_low) /
      (AnsEffector.min_ph - AnsEffector.set_ph);
    this.g_ph_high =
      this.translate_mxe(this.mxe_ph_high) /
      (AnsEffector.max_ph - AnsEffector.set_ph);
    this.g_po2_low =
      this.translate_mxe(this.mxe_po2_low) /
      (AnsEffector.min_po2 - AnsEffector.set_po2);
    this.g_po2_high =
      this.translate_mxe(this.mxe_po2_high) /
      (AnsEffector.max_po2 - AnsEffector.set_po2);
  }

  calc_ans_effect_factor(_map, _pco2, _ph, _po2) {
    // calculate the gains
    this.calc_gains();

    // calculate the activation functions
    this._a_map = this.activation_function(
      _map,
      AnsEffector.max_map,
      AnsEffector.set_map,
      AnsEffector.min_map
    );
    this._a_po2 = this.activation_function(
      _po2,
      AnsEffector.max_po2,
      AnsEffector.set_po2,
      AnsEffector.min_po2
    );
    this._a_pco2 = this.activation_function(
      _pco2,
      AnsEffector.max_pco2,
      AnsEffector.set_pco2,
      AnsEffector.min_pco2
    );
    this._a_ph = this.activation_function(
      _ph,
      AnsEffector.max_ph,
      AnsEffector.set_ph,
      AnsEffector.min_ph
    );

    // apply the time constants
    this._d_map = this.time_constant(this.tc_map, this._d_map, this._a_map);
    this._d_pco2 = this.time_constant(this.tc_pco2, this._d_pco2, this._a_pco2);
    this._d_ph = this.time_constant(this.tc_ph, this._d_ph, this._a_ph);
    this._d_po2 = this.time_constant(this.tc_po2, this._d_po2, this._a_po2);

    // reset the cumulative hr factor
    let cum_factor = 0.0;
    // mean arterial pressure influence
    if (this._d_map > 0) {
      cum_factor = this.g_map_high * this._d_map;
    } else {
      cum_factor = this.g_map_low * this._d_map;
    }
    // pco2 influence
    if (this._d_pco2 > 0) {
      cum_factor += this.g_pco2_high * this._d_pco2;
    } else {
      cum_factor += this.g_pco2_low * this._d_pco2;
    }
    // ph influence
    if (this._d_ph > 0) {
      cum_factor += this.g_ph_high * this._d_ph;
    } else {
      cum_factor += this.g_ph_low * this._d_ph;
    }
    // po2 influence
    if (this._d_po2 > 0) {
      cum_factor += this.g_po2_high * this._d_po2;
    } else {
      cum_factor += this.g_po2_low * this._d_po2;
    }
    // calculate the new heartrate factor
    this.factor = this.calc_factor(cum_factor);
    // gueard the minimum and maximum factor values
    if (this.factor > this.factor_max) {
      this.factor = this.factor_max;
    }
    if (this.factor < this.factor_min) {
      this.factor = this.factor_min;
    }

    // return the calculated factor
    return this.factor;
  }

  calc_factor(cum_factor) {
    // reset the cumulative hr factor
    let factor = 1.0;
    if (cum_factor > 0) {
      factor = 1.0 + cum_factor;
    }
    if (cum_factor < 0) {
      factor = 1.0 - cum_factor;
      factor = 1.0 / factor;
    }
    return factor;
  }

  time_constant(tc, cv, nv, t = 0.015) {
    return t * ((1.0 / tc) * (-cv + nv)) + cv;
  }

  translate_mxe(mxe) {
    if (mxe > 1.0) {
      mxe = mxe - 1.0;
      return mxe;
    }

    if (mxe > 0.0 && mxe < 1.0) {
      mxe = -1.0 / mxe + 1.0;
      return mxe;
    }

    return 0;
  }

  activation_function(value, max, setpoint, min) {
    let activation = 0.0;

    if (value >= max) {
      activation = max - setpoint;
    } else {
      if (value <= min) {
        activation = min - setpoint;
      } else {
        activation = value - setpoint;
      }
    }

    return activation;
  }
}
