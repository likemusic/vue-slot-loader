export default function({ options }, render, name) {
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

  options.created = (options.created || []).concat(function () {
    this.$slots[name] = this.$options._slots[name].call(this, this.$createElement);

    for (const [key, value] of Object.entries(this.$options._slots)) {
      if (key === name) {
        break;
      }

      this.$slots[key] = this.$options._slots[key].call(this, this.$createElement);
    }

    this.$forceUpdate();
  });
}
