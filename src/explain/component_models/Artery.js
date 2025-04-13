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

export class Artery extends BloodCapacitance {
  // static properties
  static model_type = "Artery";
  static model_interface = [
    {
      caption: "current volume (mL)",
      target: "vol",
      type: "number",
      delta: 0.1,
      factor: 1000.0,
      rounding: 3,
    },
    {
      caption: "unstressed volume (mL)",
      target: "u_vol",
      type: "number",
      delta: 0.1,
      factor: 1000.0,
      rounding: 3,
    },
    {
      caption: "elastance (mmHg/mL)",
      target: "el_base",
      delta: 0.1,
      factor: 0.001,
      rounding: 3,
      type: "number",
    },
    {
      caption: "non linear elastace factor",
      target: "el_k",
      delta: 0.1,
      factor: 0.001,
      rounding: 3,
      type: "number",
    },
  ];
}
