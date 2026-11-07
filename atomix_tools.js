/* A.T.O.M.I.X. Engine tools for Blockbench (by AtomicX).
 * Adds two actions to the File menu:
 *   - "Atomix: Check Names"        finds animation bones that the model does not have, and other mistakes
 *   - "Atomix: Export Pack File"   writes the *.pack.json that maps game states to your animations
 * Use with the Bedrock Entity format. Load via File > Plugins > Load Plugin from File. */
(function () {
    let checkAction, packAction;

    function boneNames() {
        const names = new Set();
        (typeof Group !== 'undefined' ? Group.all : []).forEach(g => names.add(g.name));
        return names;
    }

    function animators(anim) {
        const out = [];
        for (const key in anim.animators) {
            const a = anim.animators[key];
            if (a && a.type === 'bone') out.push(a);
        }
        return out;
    }

    function shortName(n) { return n.substring(n.lastIndexOf('.') + 1); }

    function runCheck() {
        const bones = boneNames();
        const problems = [], notes = [];
        if (!bones.size) problems.push('The model has no bones (groups).');
        if (!Animation.all.length) problems.push('The project has no animations.');
        Animation.all.forEach(anim => {
            if (!anim.name.startsWith('animation.')) problems.push(`"${anim.name}": Bedrock animation names should start with "animation." (for example animation.dragon.walk).`);
            animators(anim).forEach(a => {
                if (!bones.has(a.name)) problems.push(`"${anim.name}": animates bone "${a.name}" but the model has no bone with that exact name (names are case-sensitive).`);
            });
            if (anim.loop === 'once' && /idle|walk|run|swim|fly/i.test(anim.name)) notes.push(`"${anim.name}" looks like a repeating motion but Loop is "once".`);
            if (!(anim.length > 0)) problems.push(`"${anim.name}": length is 0.`);
        });
        const seen = {};
        Animation.all.forEach(a => { const s = shortName(a.name); (seen[s] = seen[s] || []).push(a.name); });
        Object.keys(seen).forEach(s => { if (seen[s].length > 1) notes.push(`Short name "${s}" is used by ${seen[s].join(', ')}; in a pack use the full name.`); });

        let msg = problems.length ? 'Problems:\n- ' + problems.join('\n- ') : 'No name problems found.';
        if (notes.length) msg += '\n\nNotes:\n- ' + notes.join('\n- ');
        Blockbench.showMessageBox({ title: 'Atomix: Check Names', message: msg.replace(/\n/g, '<br>'), icon: problems.length ? 'warning' : 'check' });
    }

    function exportPack() {
        if (!Animation.all.length) return Blockbench.showQuickMessage('No animations to export', 2000);
        const base = (Project.geometry_name || Project.name || 'model').replace(/\.geo$/, '');
        new Dialog({
            id: 'atomix_pack_dialog',
            title: 'Atomix: Export Pack File',
            form: {
                namespace: { label: 'Namespace (your pack/mod id)', type: 'text', value: 'mymod' },
                model: { label: 'Target model (file name of the .geo.json, no extension)', type: 'text', value: base },
                file: { label: 'This animation file name (no extension)', type: 'text', value: base },
                priority: { label: 'Priority (higher wins over other packs)', type: 'number', value: 10 },
                fade: { label: 'Default fade in seconds', type: 'number', value: 0.15 }
            },
            onConfirm(f) {
                const states = {};
                Animation.all.forEach(a => {
                    states[shortName(a.name)] = { file: `${f.namespace}:${f.file}`, clip: a.name, fade: f.fade };
                });
                const pack = { target: `${f.namespace}:${f.model}`, priority: f.priority, states };
                Blockbench.export({
                    type: 'Atomix pack', extensions: ['json'], name: f.file + '.pack',
                    content: JSON.stringify(pack, null, 2)
                });
            }
        }).show();
    }

    Plugin.register('atomix_tools', {
        title: 'A.T.O.M.I.X. Engine Tools',
        author: 'AtomicX',
        description: 'Checks bone and animation names and exports the pack file for the A.T.O.M.I.X. Engine.',
        icon: 'fa-atom',
        version: '1.0.0',
        variant: 'both',
        onload() {
            checkAction = new Action('atomix_check', { name: 'Atomix: Check Names', icon: 'fa-check-double', click: runCheck });
            packAction = new Action('atomix_export_pack', { name: 'Atomix: Export Pack File', icon: 'fa-file-export', click: exportPack });
            MenuBar.addAction(checkAction, 'file.export');
            MenuBar.addAction(packAction, 'file.export');
        },
        onunload() {
            checkAction && checkAction.delete();
            packAction && packAction.delete();
        }
    });
})();
