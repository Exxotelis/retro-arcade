/**
 * Retro Arcade Controls Module
 * A lightweight, framework-agnostic control system for on-screen buttons and keyboard input
 * 
 * Usage:
 *   <script src="controls.js"></script>
 *   <script>
 *     window.Controls.init({ mountPoint: document.getElementById('controls-container') });
 *     window.addEventListener('control-input', (e) => console.log(e.detail));
 *   </script>
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory();
  } else {
    // Browser globals
    root.Controls = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // State management
  let initialized = false;
  let mountPoint = null;
  let controlsContainer = null;
  let activeKeys = new Set();

  // Configuration
  let config = {
    size: 'medium',
    theme: 'dark'
  };

  // Key mappings
  const KEY_MAPPINGS = {
    // Arrow keys
    'ArrowUp': { type: 'move', direction: 'up' },
    'ArrowDown': { type: 'move', direction: 'down' },
    'ArrowLeft': { type: 'move', direction: 'left' },
    'ArrowRight': { type: 'move', direction: 'right' },
    // WASD
    'w': { type: 'move', direction: 'up' },
    'W': { type: 'move', direction: 'up' },
    's': { type: 'move', direction: 'down' },
    'S': { type: 'move', direction: 'down' },
    'a': { type: 'move', direction: 'left' },
    'A': { type: 'move', direction: 'left' },
    'd': { type: 'move', direction: 'right' },
    'D': { type: 'move', direction: 'right' },
    // Action keys
    ' ': { type: 'action' },
    'Enter': { type: 'action' }
  };

  // Button to key mapping for visual feedback
  const BUTTON_KEY_MAP = {
    'up': ['ArrowUp', 'w', 'W'],
    'down': ['ArrowDown', 's', 'S'],
    'left': ['ArrowLeft', 'a', 'A'],
    'right': ['ArrowRight', 'd', 'D'],
    'action': [' ', 'Enter']
  };

  /**
   * Dispatch a custom control-input event
   */
  function dispatchControlEvent(eventData) {
    const event = new CustomEvent('control-input', {
      detail: {
        ...eventData,
        timestamp: Date.now()
      },
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(event);
  }

  /**
   * Get button element by direction/action
   */
  function getButtonElement(buttonType) {
    if (!controlsContainer) return null;
    return controlsContainer.querySelector(`[data-control="${buttonType}"]`);
  }

  /**
   * Add visual highlight to button
   */
  function highlightButton(buttonType, pressed) {
    const button = getButtonElement(buttonType);
    if (button) {
      if (pressed) {
        button.classList.add('pressed');
      } else {
        button.classList.remove('pressed');
      }
    }
  }

  /**
   * Handle keydown events with debouncing
   */
  function handleKeyDown(e) {
    if (!initialized) return;

    const mapping = KEY_MAPPINGS[e.key];
    if (!mapping) return;

    const keyId = e.key;
    
    // Check if this key is already being held
    if (activeKeys.has(keyId)) {
      // Key is being held, dispatch with pressed=true (auto-repeat)
      e.preventDefault();
      const eventData = {
        ...mapping,
        pressed: true
      };
      dispatchControlEvent(eventData);
      return;
    }

    // First press - add to active keys and dispatch 'start'
    e.preventDefault();
    activeKeys.add(keyId);

    const eventData = {
      ...mapping,
      type: mapping.type === 'move' ? 'start' : 'action',
      pressed: true
    };

    // Visual feedback
    if (mapping.direction) {
      highlightButton(mapping.direction, true);
    } else if (mapping.type === 'action') {
      highlightButton('action', true);
    }

    dispatchControlEvent(eventData);
  }

  /**
   * Handle keyup events
   */
  function handleKeyUp(e) {
    if (!initialized) return;

    const mapping = KEY_MAPPINGS[e.key];
    if (!mapping) return;

    const keyId = e.key;
    
    if (!activeKeys.has(keyId)) return;

    e.preventDefault();
    activeKeys.delete(keyId);

    const eventData = {
      ...mapping,
      type: 'stop',
      pressed: false
    };

    // Remove visual feedback
    if (mapping.direction) {
      highlightButton(mapping.direction, false);
    } else if (mapping.type === 'action') {
      highlightButton('action', false);
    }

    dispatchControlEvent(eventData);
  }

  /**
   * Handle button press (mouse/touch)
   */
  function handleButtonPress(buttonType, direction) {
    const eventData = direction 
      ? { type: 'start', direction, pressed: true }
      : { type: 'action', pressed: true };
    
    highlightButton(buttonType, true);
    dispatchControlEvent(eventData);
  }

  /**
   * Handle button release (mouse/touch)
   */
  function handleButtonRelease(buttonType, direction) {
    const eventData = direction
      ? { type: 'stop', direction, pressed: false }
      : { type: 'action', pressed: false };
    
    highlightButton(buttonType, false);
    dispatchControlEvent(eventData);
  }

  /**
   * Create the control panel HTML
   */
  function createControlPanel() {
    const panel = document.createElement('div');
    panel.className = `controls-panel controls-${config.size} controls-${config.theme}`;
    panel.innerHTML = `
      <div class="controls-dpad">
        <button class="control-btn control-up" data-control="up" aria-label="Up">▲</button>
        <div class="controls-dpad-middle">
          <button class="control-btn control-left" data-control="left" aria-label="Left">◀</button>
          <div class="controls-dpad-center"></div>
          <button class="control-btn control-right" data-control="right" aria-label="Right">▶</button>
        </div>
        <button class="control-btn control-down" data-control="down" aria-label="Down">▼</button>
      </div>
      <div class="controls-actions">
        <button class="control-btn control-action" data-control="action" aria-label="Action">A</button>
      </div>
    `;

    // Add event listeners for buttons
    const buttons = {
      'up': { direction: 'up' },
      'down': { direction: 'down' },
      'left': { direction: 'left' },
      'right': { direction: 'right' },
      'action': { direction: null }
    };

    Object.keys(buttons).forEach(buttonType => {
      const button = panel.querySelector(`[data-control="${buttonType}"]`);
      const { direction } = buttons[buttonType];

      // Mouse events
      button.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleButtonPress(buttonType, direction);
      });
      button.addEventListener('mouseup', (e) => {
        e.preventDefault();
        handleButtonRelease(buttonType, direction);
      });
      button.addEventListener('mouseleave', (e) => {
        if (button.classList.contains('pressed')) {
          handleButtonRelease(buttonType, direction);
        }
      });

      // Touch events
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleButtonPress(buttonType, direction);
      });
      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleButtonRelease(buttonType, direction);
      });
      button.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        handleButtonRelease(buttonType, direction);
      });
    });

    return panel;
  }

  /**
   * Initialize the controls module
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.mountPoint - Element to mount controls to (defaults to body)
   * @param {string} options.size - Size of controls: 'small', 'medium', 'large' (default: 'medium')
   * @param {string} options.theme - Theme: 'dark', 'light' (default: 'dark')
   */
  function init(options = {}) {
    if (initialized) {
      console.warn('Controls already initialized. Call destroy() first.');
      return;
    }

    // Merge configuration
    config = {
      size: options.size || 'medium',
      theme: options.theme || 'dark'
    };

    // Set mount point
    mountPoint = options.mountPoint || document.body;

    // Create and mount controls
    controlsContainer = createControlPanel();
    mountPoint.appendChild(controlsContainer);

    // Add keyboard listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    initialized = true;

    console.log('Retro Arcade Controls initialized');
  }

  /**
   * Destroy the controls module and clean up
   */
  function destroy() {
    if (!initialized) {
      return;
    }

    // Remove keyboard listeners
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);

    // Remove controls from DOM
    if (controlsContainer && controlsContainer.parentNode) {
      controlsContainer.parentNode.removeChild(controlsContainer);
    }

    // Clear state
    activeKeys.clear();
    controlsContainer = null;
    mountPoint = null;
    initialized = false;

    console.log('Retro Arcade Controls destroyed');
  }

  // Public API
  return {
    init: init,
    destroy: destroy
  };
}));
