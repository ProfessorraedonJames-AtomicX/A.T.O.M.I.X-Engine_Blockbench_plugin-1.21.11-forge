# A.T.O.M.I.X. animator guide

You do not need to write Java to add animations to an A.T.O.M.I.X. entity.

## Names must match (read this first)
The model file, the animation file and the pack file are separate. They connect **only by exact, case-sensitive names**:

| In this file | The name must match | What happens on a mismatch |
|---|---|---|
| `*.animation.json` bone (`"head"`) | a bone in the model's `*.geo.json` | that bone is ignored, nothing moves, no error |
| `*.pack.json` `"clip"` | a clip name in the animation file (or its last part, e.g. `walk`) | the state is skipped, a warning is logged |
| `*.pack.json` `"file"` and `"target"` | the file id `namespace:filename` and the model id | the pack does nothing |

`Head` and `head` are different names. Find the real bone names with `/atomix bones <model>`, and find mismatches with `/atomix check <model> <animation file>`.

## Using Blockbench
No plugin is needed. Use **File -> New -> Bedrock Entity**, animate, then export the Bedrock geometry (`.geo.json`) and the animations (`.animation.json`). A.T.O.M.I.X. reads those files directly. Full steps are in `docs/ANIMATOR_GUIDE.md`.

## 1. Animate in Blockbench
Use the normal **Bedrock Entity** format and export `*.animation.json` (the same files GeckoLib uses).
Rotation, position, scale, `loop`, `hold_on_last_frame`, `catmullrom`, every easing, `step`, `sound_effects`,
`particle_effects`, `timeline`, Molang expressions and the clip properties `start_delay`, `loop_delay`,
`anim_time_update` and `blend_weight` all work. See sections 6 and 7.

Box UV and per-face UV both work. Name your bones like the target model (look at its `.geo.json`). Bones the model doesn't have are ignored.

## 2. Ship a pack
```
assets/<yourpack>/atomix/animations/cool_moves.animation.json
assets/<yourpack>/atomix/packs/cool_moves.pack.json
```
`cool_moves.pack.json`:
```json
{
  "target": "mymod:dragon",
  "priority": 10,
  "states": {
    "walk":     { "file": "yourpack:cool_moves", "clip": "animation.cool.walk", "fade": 0.15 },
    "attack_1": { "file": "yourpack:cool_moves", "clip": "animation.cool.slash", "fade": 0.08, "speed": 1.2 },
    "dodge":    { "file": "yourpack:cool_moves", "clip": "animation.cool.dodge", "root_motion": true }
  }
}
```
`clip` may be the full name or just the last part (`walk`). Packs override the mod's own states by name; higher `priority` wins. Players add the pack like any resource pack.

## 3. Attack phases (for combat timing)
Add keys to the clip's **timeline** in Blockbench:
```json
"timeline": { "0.0": "phase:windup", "0.20": "phase:strike", "0.40": "phase:recover" }
```
The mod can read `layer.phase()` / `layer.inPhase("strike")` to open hit windows or allow cancels.
`sound_effects` and `particle_effects` keys fire events at their time.

## 4. Root motion
Animate the bone named `root` toward the model's front (negative Z in Blockbench); with `"root_motion": true` the body no longer slides in the
animation, and the mod receives the distance travelled (`controller.consumeRootMotion`).

## 5. Why transitions look smoother
Switching clips uses **inertialization**: the mod captures the old pose *and its velocity* and decays the
difference with a critically damped spring, instead of crossfading two clips. Limbs keep their momentum, nothing
ghosts, and rotations blend as quaternions (no Euler flips). `fade` is the approximate settle time in seconds.

## 6. Molang
Any keyframe value may be a Molang string, like `["0", "math.sin(query.anim_time * 90) * 20", "0"]`.

- Operators: `+ - * /`, `< <= > >= == != && || !`, `a ? b : c`, `a ? b`, `??` (fallback for an unset variable or query), `( )`, `'strings'`, `true`/`false`. Division by zero gives 0.
- Names: `query.x` (`q.x`), `variable.x` (`v.x`), `temp.x` (`t.x`), `context.x` (`c.x`), all case-insensitive. Variables are shared by every clip of one entity; temps live for one expression.
- Scripts: several statements separated by `;`, assignments (`v.charge = v.charge + 1;`) and `return`. A trailing plain expression is the result.
- Functions (angles in degrees): `math.abs acos asin atan atan2 ceil clamp cos die_roll die_roll_integer exp floor hermite_blend lerp lerprotate ln max min min_angle mod pow random random_integer round sign sin sqrt trunc`, and `math.pi`, `math.e`.
- A typo is reported once in the log (`Atomix: animation '...': bad Molang ...`); that value reads 0 and the rest of the animation still plays.

**Queries the engine provides.** `query.anim_time` (seconds into this clip), `query.life_time`, `query.delta_time`, `query.modified_distance_moved`.
For entities rendered by `AtomixEntityRenderer`: `ground_speed` and `vertical_speed` (blocks/s), `is_on_ground`, `is_in_water`, `is_swimming`, `is_sprinting`,
`is_sneaking`, `is_on_fire`, `is_riding`, `is_alive`, `health`, `max_health`, `is_baby`, `hurt_time`, `is_using_item`, `is_gliding`,
`head_x_rotation`, `head_y_rotation` (relative to the body) and `body_y_rotation`.
Mod authors add their own: `controller.setQuery("charge_level", 3)` / `controller.setVariable("rage", 1)`.

**Timeline scripts.** A timeline entry with an assignment, like `"0.5": "v.charge = 1;"`, is run by the engine at that time. Other timeline entries stay custom events for your code.

## 7. Clip properties
| Property | Meaning |
|---|---|
| `start_delay` | Seconds (number or Molang) before the clip starts. Nothing is applied while waiting. |
| `loop_delay` | Seconds between loops. Re-evaluated every cycle, so `math.random(1, 3)` gives irregular pauses. |
| `anim_time_update` | Molang that returns the clip's new time each frame. Default is normal playback; `q.anim_time + q.delta_time * 0.5` is half speed. |
| `blend_weight` | 0 to 1 (number or Molang) multiplied into the layer's weight while the clip plays. |

Easing names: `linear`, `step`, and `ease` + `In`/`Out`/`InOut` + `Sine Quad Cubic Quart Quint Expo Circ Back Elastic Bounce` (for example `easeInOutCubic`). An unknown name is reported and treated as linear.
`lerp_mode`: `linear`, `catmullrom` and `step`; other modes (such as `bezier`) are reported and treated as linear.
`override_previous_animation` is always on: a layer replaces what is below it unless the layer is additive.
Speed blends (idle/walk/run) fire the events, phases and scripts of whichever clip dominates the mix; `anim_time_update` and delays apply to single clips, not blends.

## Conventions
- Rotations: Bedrock degrees, mirrored on x/y to Minecraft space (same as GeckoLib). The animation's angles are **added** to the bone's rest rotation as Euler angles, exactly as Blockbench shows them.
- Positions are in 1/16 block units; x is mirrored like GeckoLib.

## Tools for animators (in game)
Press **F3+T** after changing files to reload resources, then:
- `/atomix models` lists loaded models.
- `/atomix bones <model>` shows the bone hierarchy, so you know the exact names to animate.
- `/atomix clips <file>` lists clips with length, loop mode and attack phases.
- `/atomix check <model> <file>` finds animated bones that don't exist in the model (typos), which would otherwise be silently ignored.
