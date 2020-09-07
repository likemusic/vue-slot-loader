export default function ({options}, render, name) {
    const slots = {};

    if (options.extends && options.extends._slots) {
        Object.assign(slots, options.extends._slots);
    }

    if (options._slots) {
        Object.assign(slots, options._slots);
    }

    Object.assign(slots, {
        [name]: render
    });

    options._slots = slots;

    const unwatchers = {};

    const initSlotsWatchers = function () {
        updateWatcherBySlotName(name, this);
        updatePreviousWatchersBySlotName(name, this);

        function updateWatcherBySlotName(slotName, vm) {
            unwatchIfWatcherExists(slotName);
            setWatcherBySlotName(slotName, vm);


            function setWatcherBySlotName(slotName, vm) {
                const r = vm.$options._slots[slotName].bind(vm, vm.$createElement);
                unwatchers[slotName] = vm.$watch(
                    r,
                    t => {
                        vm.$slots[name] = t;
                        vm.$forceUpdate();
                    },
                    {immediate: true, deep: true}
                );
            }

            function unwatchIfWatcherExists(slotName) {
                const unwatcher = unwatchers[slotName];
                if (!unwatcher) {
                    return;
                }

                unwatcher();
            }
        }

        function updatePreviousWatchersBySlotName(slotName, vm) {
            for (const [key, value] of Object.entries(vm.$options._slots)) {
                if (key === name) {
                    break;
                }

                updateWatcherBySlotName(key, vm);
            }
        }
    };

    options.created = (options.created || []).concat(initSlotsWatchers);
    options.beforeUpdate = (options.beforeUpdate || []).concat(function () {
        const optionsSlots = this.$options._slots;
        const componentSlots = this.$slots;

        if (Object.keys(optionsSlots).length === Object.keys(componentSlots).length) {
            return;
        }

        for (const [key, value] of Object.entries(optionsSlots)) {
            componentSlots[key] = optionsSlots[key].call(this, this.$createElement);
        }
    });
}
