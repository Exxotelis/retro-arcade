/**
 * Retro Arcade Controls Module
 * A lightweight, framework-agnostic control system for arcade games
 * Supports keyboard and touch input with customizable themes
 */
(function(global) {
  'use strict';

  // Module state
  let controlsContainer = null;
  let mountPoint = null;
  let activeKeys = new Set();
  let config = {
    size: 'medium',
    theme: 'retro'
  };

  // Key mappings
  const KEY_MAPPINGS = {
    'ArrowUp': { type: 'move', direction: 'up' },
    'ArrowDown': { type: 'move', direction: 'down' },
    'ArrowLeft': { type: 'move', direction: 'left' },
    'ArrowRight': { type: 'move', direction: 'right' },
    'w': { type: 'move', direction: 'up' },
    'W': { type: 'move', direction: 'up' },
    's': { type: 'move', direction: 'down' },
    'S': { type: 'move', direction: 'down' },
    'a': { type: 'move', direction: 'left' },
    'A': { type: 'move', direction: 'left' },
    'd': { type: 'move', direction: 'right' },
    'D': { type: 'move', direction: 'right' },
    ' ': { type: 'action' },
    'Enter': { type: 'action' }
  };

  /**
   * Dispatch a control input event
   */
  function dispatchControlEvent(type, direction, pressed) {
    const event = new CustomEvent('control-input', {
      detail: {
        type: type,
        direction: direction,
        pressed: pressed,
        timestamp: Date.now()
      }
    });
    global.dispatchEvent(event);
  }

  /**
   * Handle keyboard down events
   */
  function handleKeyDown(event) {
    const mapping = KEY_MAPPINGS[event.key];
    if (!mapping) return;

    // Prevent default browser behavior for mapped keys
    event.preventDefault();

    // Create a unique key identifier
    const keyId = mapping.type === 'move' ? `${mapping.type}-${mapping.direction}` : mapping.type;

    // Check if this is a repeated keydown (key is held)
    if (activeKeys.has(keyId)) {
      // Key is already pressed, dispatch with pressed=true but don't trigger 'start' again
      dispatchControlEvent(mapping.type, mapping.direction, true);
      return;
    }

    // First press - add to active keys and dispatch 'start'
    activeKeys.add(keyId);
    dispatchControlEvent('start', mapping.direction, true);
    dispatchControlEvent(mapping.type, mapping.direction, true);

    // Update visual state
    updateButtonVisual(keyId, true);
  }

  /**
   * Handle keyboard up events
   */
  function handleKeyUp(event) {
    const mapping = KEY_MAPPINGS[event.key];
    if (!mapping) return;

    event.preventDefault();

    const keyId = mapping.type === 'move' ? `${mapping.type}-${mapping.direction}` : mapping.type;

    // Remove from active keys
    activeKeys.delete(keyId);

    // Dispatch stop and release events
    dispatchControlEvent('stop', mapping.direction, false);
    dispatchControlEvent(mapping.type, mapping.direction, false);

    // Update visual state
    updateButtonVisual(keyId, false);
  }

  /**
   * Update button visual state
   */
  function updateButtonVisual(keyId, pressed) {
    if (!controlsContainer) return;

    const buttonMap = {
      'move-up': 'btn-up',
      'move-down': 'btn-down',
      'move-left': 'btn-left',
      'move-right': 'btn-right',
      'action': 'btn-action'
    };

    const buttonClass = buttonMap[keyId];
    if (buttonClass) {
      const button = controlsContainer.querySelector(`.${buttonClass}`);
      if (button) {
        if (pressed) {
          button.classList.add('pressed');
        } else {
          button.classList.remove('pressed');
        }
      }
    }
  }

  /**
   * Handle button press (mouse/touch start)
   */
  function handleButtonPress(type, direction) {
    const keyId = type === 'move' ? `${type}-${direction}` : type;
    
    if (activeKeys.has(keyId)) return;

    activeKeys.add(keyId);
    dispatchControlEvent('start', direction, true);
    dispatchControlEvent(type, direction, true);
  }

  /**
   * Handle button release (mouse/touch end)
   */
  function handleButtonRelease(type, direction) {
    const keyId = type === 'move' ? `${type}-${direction}` : type;
    
    activeKeys.delete(keyId);
    dispatchControlEvent('stop', direction, false);
    dispatchControlEvent(type, direction, false);
  }

  /**
   * Create the controls UI
   */
  function createControlsUI() {
    const container = document.createElement('div');
    container.className = `controls-container controls-${config.size} controls-${config.theme}`;
    container.innerHTML = `
      <div class="controls-panel">
        <div class="controls-dpad">
          <button class="control-btn btn-up" data-direction="up" aria-label="Up">
            <span class="btn-arrow">▲</span>
          </button>
          <div class="dpad-middle">
            <button class="control-btn btn-left" data-direction="left" aria-label="Left">
              <span class="btn-arrow">◀</span>
            </button>
            <button class="control-btn btn-right" data-direction="right" aria-label="Right">
              <span class="btn-arrow">▶</span>
            </button>
          </div>
          <button class="control-btn btn-down" data-direction="down" aria-label="Down">
            <span class="btn-arrow">▼</span>
          </button>
        </div>
        <div class="controls-actions">
          <button class="control-btn btn-action" aria-label="Action">
            <span class="btn-label">A</span>
          </button>
        </div>
      </div>
    `;

    // Add event listeners to buttons
    const buttons = container.querySelectorAll('.control-btn');
    buttons.forEach(button => {
      const direction = button.dataset.direction;
      const isAction = button.classList.contains('btn-action');
      const type = isAction ? 'action' : 'move';

      // Mouse events
      button.addEventListener('mousedown', (e) => {
        e.preventDefault();
        button.classList.add('pressed');
        handleButtonPress(type, direction);
      });

      button.addEventListener('mouseup', (e) => {
        e.preventDefault();
        button.classList.remove('pressed');
        handleButtonRelease(type, direction);
      });

      button.addEventListener('mouseleave', () => {
        if (button.classList.contains('pressed')) {
          button.classList.remove('pressed');
          handleButtonRelease(type, direction);
        }
      });

      // Touch events
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        button.classList.add('pressed');
        handleButtonPress(type, direction);
      });

      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        button.classList.remove('pressed');
        handleButtonRelease(type, direction);
      });

      button.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        button.classList.remove('pressed');
        handleButtonRelease(type, direction);
      });
    });

    return container;
  }

  /**
   * Initialize the controls module
   */
  function init(options = {}) {
    // Clean up existing instance if any
    if (controlsContainer) {
      destroy();
    }

    // Apply configuration
    mountPoint = options.mountPoint || document.body;
    config.size = options.size || 'medium';
    config.theme = options.theme || 'retro';

    // Create and mount controls
    controlsContainer = createControlsUI();
    mountPoint.appendChild(controlsContainer);

    // Add keyboard event listeners
    global.addEventListener('keydown', handleKeyDown);
    global.addEventListener('keyup', handleKeyUp);

    // Prevent context menu on control buttons
    controlsContainer.addEventListener('contextmenu', (e) => e.preventDefault());

    console.log('Controls initialized with config:', config);
  }

  /**
   * Destroy the controls module
   */
  function destroy() {
    // Remove event listeners
    global.removeEventListener('keydown', handleKeyDown);
    global.removeEventListener('keyup', handleKeyUp);

    // Remove DOM elements
    if (controlsContainer && controlsContainer.parentNode) {
      controlsContainer.parentNode.removeChild(controlsContainer);
    }

    // Clear state
    controlsContainer = null;
    mountPoint = null;
    activeKeys.clear();

    console.log('Controls destroyed');
  }

  // Export public API
  global.Controls = {
    init: init,
    destroy: destroy
  };

  // Auto-initialize if data attribute is present
  if (document.currentScript && document.currentScript.hasAttribute('data-auto-init')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => init());
    } else {
      init();
    }
  }

})(typeof window !== 'undefined' ? window : this);
