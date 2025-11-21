/**
 * Retro Arcade Controls Module
 * A lightweight, non-invasive vanilla JavaScript controls module
 * Exposes window.Controls with init() and destroy() methods
 */
(function(global) {
  'use strict';

  // State management
  let state = {
    initialized: false,
    mountPoint: null,
    controlPanel: null,
    keyboardListeners: {},
    activeKeys: new Set(),
    repeatInterval: 100,
    repeatTimers: {},
    options: {}
  };

  // Key mappings
  const KEY_MAPPINGS = {
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'w': 'up',
    'W': 'up',
    's': 'down',
    'S': 'down',
    'a': 'left',
    'A': 'left',
    'd': 'right',
    'D': 'right',
    ' ': 'action',
    'Enter': 'action'
  };

  // Dispatch custom event
  function dispatchControlEvent(type, detail) {
    const event = new CustomEvent('control-input', {
      detail: {
        type: type,
        ...detail,
        timestamp: Date.now()
      },
      bubbles: true,
      cancelable: true
    });
    global.dispatchEvent(event);
  }

  // Handle button press
  function handleButtonPress(direction, pressed) {
    const button = state.controlPanel.querySelector(`[data-direction="${direction}"]`);
    
    if (pressed) {
      if (state.activeKeys.has(direction)) {
        // Already pressed, don't send duplicate start
        return;
      }
      
      state.activeKeys.add(direction);
      if (button) button.classList.add('pressed');
      
      // Send start event
      if (direction === 'action') {
        dispatchControlEvent('action', { pressed: true });
      } else {
        dispatchControlEvent('start', { direction, pressed: true });
      }
      
      // Start repeat timer for move events
      if (direction !== 'action') {
        state.repeatTimers[direction] = setInterval(() => {
          if (state.activeKeys.has(direction)) {
            dispatchControlEvent('move', { direction, pressed: true });
          }
        }, state.repeatInterval);
      }
    } else {
      if (!state.activeKeys.has(direction)) {
        // Not pressed, nothing to release
        return;
      }
      
      state.activeKeys.delete(direction);
      if (button) button.classList.remove('pressed');
      
      // Clear repeat timer
      if (state.repeatTimers[direction]) {
        clearInterval(state.repeatTimers[direction]);
        delete state.repeatTimers[direction];
      }
      
      // Send stop event
      if (direction === 'action') {
        dispatchControlEvent('action', { pressed: false });
      } else {
        dispatchControlEvent('stop', { direction, pressed: false });
      }
    }
  }

  // Keyboard event handlers
  function handleKeyDown(e) {
    const direction = KEY_MAPPINGS[e.key];
    if (direction) {
      e.preventDefault();
      handleButtonPress(direction, true);
    }
  }

  function handleKeyUp(e) {
    const direction = KEY_MAPPINGS[e.key];
    if (direction) {
      e.preventDefault();
      handleButtonPress(direction, false);
    }
  }

  // Mouse/Touch event handlers
  function createButtonHandler(direction) {
    return {
      down: (e) => {
        e.preventDefault();
        handleButtonPress(direction, true);
      },
      up: (e) => {
        e.preventDefault();
        handleButtonPress(direction, false);
      },
      leave: (e) => {
        e.preventDefault();
        handleButtonPress(direction, false);
      }
    };
  }

  // Create control panel HTML
  function createControlPanel() {
    const panel = document.createElement('div');
    panel.className = 'controls-panel';
    panel.innerHTML = `
      <div class="controls-grid">
        <div class="controls-dpad">
          <button class="control-btn control-up" data-direction="up" aria-label="Up">▲</button>
          <div class="controls-middle">
            <button class="control-btn control-left" data-direction="left" aria-label="Left">◄</button>
            <div class="controls-center"></div>
            <button class="control-btn control-right" data-direction="right" aria-label="Right">►</button>
          </div>
          <button class="control-btn control-down" data-direction="down" aria-label="Down">▼</button>
        </div>
        <div class="controls-actions">
          <button class="control-btn control-action" data-direction="action" aria-label="Action">A</button>
        </div>
      </div>
    `;
    
    return panel;
  }

  // Attach button listeners
  function attachButtonListeners() {
    const buttons = state.controlPanel.querySelectorAll('.control-btn');
    
    buttons.forEach(button => {
      const direction = button.getAttribute('data-direction');
      const handler = createButtonHandler(direction);
      
      // Mouse events
      button.addEventListener('mousedown', handler.down);
      button.addEventListener('mouseup', handler.up);
      button.addEventListener('mouseleave', handler.leave);
      
      // Touch events
      button.addEventListener('touchstart', handler.down);
      button.addEventListener('touchend', handler.up);
      button.addEventListener('touchcancel', handler.up);
      
      // Store for cleanup
      button._controlHandlers = handler;
    });
  }

  // Public API
  const Controls = {
    /**
     * Initialize the controls module
     * @param {Object} options - Configuration options
     * @param {HTMLElement} options.mountPoint - Element to mount controls into (default: document.body)
     * @param {number} options.repeatInterval - Interval for repeated move events in ms (default: 100)
     */
    init: function(options) {
      options = options || {};
      
      if (state.initialized) {
        console.warn('Controls already initialized. Call destroy() first.');
        return;
      }
      
      state.options = options;
      state.repeatInterval = options.repeatInterval || 100;
      state.mountPoint = options.mountPoint || document.body;
      
      // Create and mount control panel
      state.controlPanel = createControlPanel();
      state.mountPoint.appendChild(state.controlPanel);
      
      // Attach event listeners
      attachButtonListeners();
      
      // Keyboard listeners
      state.keyboardListeners.keydown = handleKeyDown;
      state.keyboardListeners.keyup = handleKeyUp;
      document.addEventListener('keydown', state.keyboardListeners.keydown);
      document.addEventListener('keyup', state.keyboardListeners.keyup);
      
      state.initialized = true;
      
      console.log('Controls initialized');
      return this;
    },
    
    /**
     * Destroy the controls module and clean up
     */
    destroy: function() {
      if (!state.initialized) {
        console.warn('Controls not initialized.');
        return;
      }
      
      // Clear all repeat timers
      Object.values(state.repeatTimers).forEach(timer => clearInterval(timer));
      state.repeatTimers = {};
      
      // Remove keyboard listeners
      document.removeEventListener('keydown', state.keyboardListeners.keydown);
      document.removeEventListener('keyup', state.keyboardListeners.keyup);
      
      // Remove control panel
      if (state.controlPanel && state.controlPanel.parentNode) {
        state.controlPanel.parentNode.removeChild(state.controlPanel);
      }
      
      // Reset state
      state.initialized = false;
      state.mountPoint = null;
      state.controlPanel = null;
      state.keyboardListeners = {};
      state.activeKeys.clear();
      
      console.log('Controls destroyed');
      return this;
    },
    
    /**
     * Check if controls are initialized
     */
    isInitialized: function() {
      return state.initialized;
    }
  };
  
  // Expose to global scope
  global.Controls = Controls;
  
})(typeof window !== 'undefined' ? window : this);
