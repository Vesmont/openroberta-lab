import * as Blockly from "blockly";
import * as NepoExt from "nepo.constants.extensions";
import * as NepoMix from "nepo.constants.mixins";

(Blockly as any).Extensions.ALL_ = {}; //TODO remove this later
Blockly.Extensions.register("parent_tooltip_extension", NepoExt.COMMON_PARENT_TOOLTIP_EXTENSION);
Blockly.Extensions.register("tooltip_extension", NepoExt.COMMON_TOOLTIP_EXTENSION);
Blockly.Extensions.register("variable_scope_extension", NepoExt.VARIABLE_SCOPE_EXTENSION);

(Blockly as any).Extensions.registerMutators("variable_plus_mutator", "mutatorPlus", NepoMix.VARIABLE_PLUS_MUTATOR_MIXIN);
(Blockly as any).Extensions.registerMutators("controls_if_mutator", "mutatorPlus", NepoMix.CONTROLS_IF_MUTATOR_MIXIN);
(Blockly as any).Extensions.registerMutators("controls_wait_for_mutator", "mutatorPlus", NepoMix.CONTROLS_WAIT_FOR_MUTATOR_MIXIN);

Blockly.Extensions.register("controls_if_tooltip", NepoExt.CONTROLS_IF_TOOLTIP_EXTENSION);

(Blockly as any).Extensions.registerMutators("math_is_divisibleby_mutator", null, NepoMix.IS_DIVISIBLEBY_MUTATOR_MIXIN, NepoExt.IS_DIVISIBLE_MUTATOR_EXTENSION);

Blockly.Extensions.register("text_quotes", NepoExt.TEXT_QUOTES_EXTENSION);
(Blockly as any).Extensions.registerMutators("text_join_mutator", "mutatorPlus", NepoMix.TEXT_JOIN_MUTATOR_MIXIN, NepoExt.TEXT_JOIN_EXTENSION);
Blockly.Extensions.register("text_comments", NepoExt.TEXT_COMMENTS_EXTENSION);
Blockly.Extensions.register("text_comment_validator", NepoExt.TEXT_COMMENTS_VALIDATOR);

(Blockly as any).Extensions.registerMutators("variable_minus_mutator", "mutatorMinus", NepoMix.VARIABLE_DECLARATION_MIXIN);

Blockly.Extensions.register("datatype_dropdown_validator_extension", NepoExt.DATATYPE_DROPDOWN_VALIDATOR_EXTENSION);
Blockly.Extensions.register("variable_declaration_extension", NepoExt.VARIABLE_DECLARATION_EXTENSION);
Blockly.Extensions.register("variable_extension", NepoExt.VARIABLE_EXTENSION);
Blockly.Extensions.register("internal_variable_declaration_extension", NepoExt.INTERNAL_VARIABLE_DECLARATION_EXTENSION);
Blockly.Extensions.registerMixin('common_type_mixin', NepoMix.COMMON_TYPE_MIXIN);
Blockly.Extensions.register("procedure_extension", NepoExt.PROCEDURE_EXTENSION);
Blockly.Extensions.register("procedure_call_extension", NepoExt.PROCEDURE_CALL_EXTENSION);
