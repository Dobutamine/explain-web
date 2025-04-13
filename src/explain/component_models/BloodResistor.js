import { Resistor } from "../base_models/Resistor";

/*
Various receptors on blood vessels regulate vascular resistance:

Adrenergic Receptors:
- Alpha-1 receptors: When activated by norepinephrine or epinephrine, cause vasoconstriction. These are predominant in arterioles.
- Alpha-2 receptors: Present on presynaptic nerve terminals and some vascular smooth muscle. Can cause vasoconstriction when stimulated.
- Beta-2 receptors: Cause vasodilation when activated, particularly in skeletal muscle, liver, and coronary vessels.

Cholinergic Receptors:
- Muscarinic receptors: Stimulated by acetylcholine, causing vasodilation through nitric oxide release from endothelial cells.

Other Vascular Receptors:
- Angiotensin II receptors (AT1): Promote powerful vasoconstriction when activated.
- Endothelin receptors (ETA): Mediate vasoconstriction when bound by endothelin-1.
- Vasopressin (V1) receptors: Cause vasoconstriction in response to vasopressin/ADH.
- Serotonin receptors: Can cause either vasoconstriction or vasodilation depending on the specific receptor subtype.
- Histamine receptors: H1 receptors mediate vasodilation, especially in postcapillary venules.
- Purinergic receptors: Respond to ATP and adenosine, generally causing vasodilation.
- Prostaglandin receptors: Various subtypes can cause either vasodilation or vasoconstriction.
- Bradykinin receptors: Promote vasodilation when activated.
- VEGF receptors: Primarily involved in angiogenesis but also cause vasodilation.
- Thromboxane receptors: Promote vasoconstriction when activated.

The distribution and density of these receptors vary across different vascular beds, allowing for specialized control of blood flow to different organs based on their specific needs.
*/

export class BloodResistor extends Resistor {
  // static properties
  static model_type = "BloodResistor";
  static model_interface = []

  constructor(model_ref, name = "") {
    // initialize the base class
    super(model_ref, name);

    // initialize independent properties
    this.r_circ_factor = 1.0; // for manually increasing or decreasing the resistance
    this.ans_activity_factor = 1.0;
    this.sensitivity = 1.0;  // 0 = no response, 1 = full response
    this.alpha_adrenergic_sensitivity = 1.0;
    this.r_mob_factor = 1.0;
    this.r_ans_factor = 1.0;
    this.r_drug_factor = 1.0;
    this.r_k_circ_factor = 1.0;
    this.r_k_ans_factor = 1.0;
    this.r_k_drug_factor = 1.0;
  }

  // override the resistance calculation method of the resistor base class
  calc_resistance() {
    // incorporate all factors influencing this resistor
    this._r_for = this.r_for + (this.r_factor - 1) * this.r_for +
    (this.r_circ_factor - 1) * this.r_for * this.sensitivity +
    (this.r_ans_factor - 1) * this.r_for * this.ans_activity_factor * this.sensitivity +
    (this.r_mob_factor - 1) * this.r_for * this.sensitivity +
    (this.r_drug_factor - 1) * this.r_for * this.sensitivity;

    this._r_back = this.r_back + (this.r_factor - 1) * this.r_back +
    (this.r_circ_factor - 1) * this.r_back * this.sensitivity +
    (this.r_ans_factor - 1) * this.r_back * this.ans_activity_factor * this.sensitivity +
    (this.r_mob_factor - 1) * this.r_back * this.sensitivity +
    (this.r_drug_factor - 1) * this.r_back * this.sensitivity;

    this._r_k = this.r_k + (this.r_k_factor - 1) * this.r_k +
    (this.r_k_circ_factor - 1) * this.r_k * this.sensitivity +
    (this.r_k_ans_factor - 1) * this.r_k * this.ans_activity_factor * this.sensitivity +
    (this.r_mob_factor - 1) * this.r_k * this.sensitivity +
    (this.r_drug_factor - 1) * this.r_k * this.sensitivity;

    // make the resistances flow dependent
    this._r_for += this._r_k * this.flow * this.flow;
    this._r_back += this._r_k * this.flow * this.flow;
  }
}







