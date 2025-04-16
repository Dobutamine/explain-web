import { BloodCapacitance } from "../base_models/BloodCapacitance";

/*
Arteries have three distinct layers (tunics):

Tunica intima: Inner layer of endothelial cells and elastic tissue
Tunica media: Middle layer composed of smooth muscle cells and elastic fibers
Tunica adventitia: Outer layer of connective tissue

The muscle layer (tunica media) is thick and contains significant amounts of elastic tissue, especially in large arteries like the aorta
This structure allows arteries to withstand high pressure and maintain blood flow during the cardiac cycle
The elastic components help dampen the pulsatile flow from the heart

Larger vessels (0.1-10mm diameter)
Carry blood away from the heart
Thick, muscular walls with significant elastic tissue
Main function: Conduct blood under high pressure
Examples: Aorta, carotid, femoral arteries
Less involved in regulating blood flow to specific tissues
Less densely innervated by sympathetic nerves

Various receptors on blood vessels regulate vascular resistance and elastance changes
When a blood vessel constricts it's elastic properties also change.

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

/*
Veins:

Have the same three layers as arteries:

Tunica intima: Inner endothelial layer
Tunica media: Middle smooth muscle layer
Tunica adventitia: Outer connective tissue layer


However, their muscle layer (tunica media) is much thinner than in arteries
Have a larger lumen relative to their wall thickness
The adventitia is often the thickest layer in veins
Many veins, especially in the limbs, contain valves to prevent backflow of blood
Their walls are more distensible and can stretch to accommodate large volumes of blood

Larger vessels (0.1-30mm diameter)
Carry blood toward the heart
Thin walls relative to lumen size
Contain valves to prevent backflow (especially in limbs)
Main function: Blood reservoir (capacitance vessels)
Hold 60-70% of total blood volume
Collapse when empty due to thinner walls

Various receptors on blood vessels regulate vascular resistance and elastance changes
When a blood vessel constricts it's elastic properties also change.

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

/*
Venules:

Have the same three layers as arteries:

Tunica intima: Inner endothelial layer
Tunica media: Middle smooth muscle layer
Tunica adventitia: Outer connective tissue layer

They are the smallest veins that collect blood from capillaries and have a very thin muscle layer
The smallest venules (postcapillary venules) may have only scattered smooth muscle cells

As venules increase in size, they gradually develop a more defined smooth muscle layer
Function as capacitance vessels that can hold significant blood volume

Are important sites for fluid exchange and immune cell migration during inflammation
The thinner muscle walls in veins and venules reflect their function of returning blood to the heart under low pressure conditions. 
They act as capacitance vessels, holding about 60-70% of the body's blood volume at any given time, 
compared to arteries which contain only about 10-15%.

Smaller vessels (10-200μm diameter)
Collect blood from capillaries
Very thin walls with minimal smooth muscle
Postcapillary venules (smallest) have almost no muscle cells
Main function: Initial collection of blood from tissues
Important sites for immune cell migration during inflammation
More permeable than capillaries, allowing for additional fluid exchange

Various receptors on blood vessels regulate vascular resistance and elastance changes
When a blood vessel constricts it's elastic properties also change.

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

export class BloodVessel extends BloodCapacitance {
  // static properties
  static model_type = "BloodVessel";

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.alpha_sensitivity = 0.0; // lumped alpha1 and alpha2 adrenergic receptor sensitivity (0-1)
    this.alpha_activity_factor = 1.0; // lumped alpha1 and alpha2 adrenergic receptor activity
    this.beta_sensitivity = 0.0; // beta adrenergic receptor sensitivity (0-1)
    this.beta_activity_factor = 1.0; // beta adrenergic receptor activity

  }

  calc_elastances() {
    this._el = this.el_base +
    (this.el_base_factor - 1) * this.el_base +
    (this.el_base_circ_factor - 1) * this.el_base +
    (this.el_base_ans_factor - 1) * this.el_base * this.ans_activity_factor +
    (this.el_base_drug_factor - 1) * this.el_base + 
    (this.alpha_activity_factor - 1) * this.el_base * this.alpha_sensitivity + 
    (this.beta_activity_factor - 1) * this.el_base * this.beta_sensitivity

    this._el_k = this.el_k +
    (this.el_k_factor - 1) * this.el_k +
    (this.el_k_circ_factor - 1) * this.el_k +
    (this.el_k_ans_factor - 1) * this.el_k * this.ans_activity_factor +
    (this.el_k_drug_factor - 1) * this.el_k;
  }
}
