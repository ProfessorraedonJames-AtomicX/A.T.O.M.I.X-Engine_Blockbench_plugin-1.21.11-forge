# A.T.O.M.I.X. Engine (Forge 1.21.11) v0.3.0

Created by AtomicX a.k.a Professor. Raedon James. A layered, procedural animation engine for Forge. Loads Blockbench/Bedrock models and animations
(the GeckoLib format), so existing animation work can be reused.

## Highlights
- **Inertialization transitions**: pose + velocity continuity with a critically damped spring (smoother than crossfades, one clip sampled per frame).
- **Quaternion blending** everywhere (no Euler flips), layers with masks, weights and additive mode.
- **Speed-driven blend spaces** (idle/walk/run) sharing one phase so feet stay in sync.
- **Root motion** extraction, **attack phases** and timeline events from Blockbench timelines.
- **Render-time sampling**: smooth at any FPS; absolute-time update makes multi-pass rendering safe.
- **Allocation-free steady state**: index-based poses, binary-search keyframes (~0.6 us per update in a micro-test).
- **No-code animation packs** (`*.pack.json`) so anyone can add or override animations; see `docs/ANIMATOR_GUIDE.md`.
- Box UV and per-face UV models, Blockbench timeline events in every shape it writes.
- Spring bones, head look-at, two-bone IK, post-process hooks.

## Quick use
```java
public class Dragon extends Mob implements AtomixAnimatable {
    private final AtomixController ctrl = new AtomixController()
            .addSpring(new SpringBone("tail", 60f, 8f, 0.05f, 0.6f))
            .headLook("head", 70f, 40f);
    // each tick (client): drive states by name, safe to call every tick
    //   ctrl.base().playBlend(0.2f, new float[]{0f, 1.2f, 4f}, "idle", "walk", "run").setBlendValue(speed);
    //   ctrl.layer("upper").mask("arm_l", "arm_r").play("attack_1", 0.08f);
    public AtomixController getAtomixController() { return ctrl; }
    public ResourceLocation getAtomixModel() { return ResourceLocation.fromNamespaceAndPath("mymod", "dragon"); }
    public ResourceLocation getAtomixTexture() { return ResourceLocation.fromNamespaceAndPath("mymod", "textures/entity/dragon.png"); }
}
// Client setup: EntityRenderers.register(TYPE, AtomixEntityRenderer::new);
```

## For animators
Bone and clip names must match exactly or things are silently ignored. Read `docs/ANIMATOR_GUIDE.md` (names, Blockbench export, pack layout, Molang) before making a pack.

## Status
Port of the 1.21.1 version to Forge 1.21.11 (61.2.4, ForgeGradle 7, Gradle 9.5, Java 21).
The animation core (layers, blending, IK, springs) is Minecraft-independent and tested in a standalone harness.
The Minecraft-facing code (renderer, resource loader, commands, mod class) is ported from the official
1.21.11 MDK but has **not been compiled yet**. Build with `./gradlew build` (Windows: `gradlew.bat build`).

In-game tools: `/atomix models|bones|clips|check` (see the animator guide).

Molang (full expression language, queries, variables, scripts), all Blockbench easings, step keys, `start_delay`, `loop_delay`, `anim_time_update` and `blend_weight` are supported.

Not yet supported: Epic Fight's native animation format (needs a converter),
item/block/armor renderers, server-side clip sync.
