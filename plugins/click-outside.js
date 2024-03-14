import Vue from "vue";

function validate(binding) {
  return typeof binding.value === "function";
}

function isPopup(popupItem, elements) {
  if (!popupItem || !elements) return false;

  for (let i = 0, len = elements.length; i < len; i++) {
    try {
      if (popupItem.contains(elements[i])) {
        return true;
      }
      if (elements[i].contains(popupItem)) {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  return false;
}

function isServer(vNode) {
  return (
    typeof vNode.componentInstance !== "undefined" &&
    vNode.componentInstance.$isServer
  );
}

export const ClickOutside = {
  bind(el, binding, vNode) {
    if (!validate(binding)) return;

    // Define Handler and cache it on the element
    function handler(e) {
      if (!vNode.context) return;

      const elements = e.path || (e.composedPath && e.composedPath());
      if (elements && elements.length > 0) {
        elements.unshift(e.target);
      }

      if (el.contains(e.target) || isPopup(vNode.context.popupItem, elements))
        return;

      if (el.$clickOutside) {
        el.$clickOutside.callback(e);
      }
    }

    // add Event Listeners
    el.$clickOutside = {
      handler,
      callback: binding.value,
    };
    const clickHandler =
      "ontouchstart" in document.documentElement ? "touchstart" : "click";
    if (!isServer(vNode)) {
      document.addEventListener(clickHandler, handler);
    }
  },

  update(el, binding) {
    if (validate(binding) && el.$clickOutside) {
      el.$clickOutside.callback = binding.value;
    }
  },

  unbind(el, _binding, vNode) {
    // Remove Event Listeners
    const clickHandler =
      "ontouchstart" in document.documentElement ? "touchstart" : "click";
    if (!isServer(vNode) && el.$clickOutside) {
      document.removeEventListener(clickHandler, el.$clickOutside.handler);
    }
    delete el.$clickOutside;
  },
};

Vue.directive("click-outside", ClickOutside);

export default ClickOutside;
