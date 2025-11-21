/**
 * Retro Arcade Controls Module
 * 
 * A lightweight, non-invasive vanilla JavaScript module for adding
 * on-screen controls and keyboard support to any web application.
 * 
 * Features:
 * - On-screen directional pad and action buttons
 * - Keyboard support (Arrow keys, WASD, Space, Enter)
 * - Custom event dispatching for easy integration
 * - Auto-repeat prevention and debouncing
 * - Visual button press feedback
 * 
 * Usage:
 *   window.Controls.init({ container: '#game-container' });
 *   window.addEventListener('control-input', (e) => {
 *     console.log(e.detail); // { type, direction, pressed, timestamp }
 *   });
 */

(function() {
  'use strict';

  // State management
  const state = {
    initialized: false,
    container: null,
    controlPanel: null,
    keyStates: new Map(),
    buttonStates: new Map(),
    options: {
      container: 'body',
      showOnScreen: true,
      keyboardEnabled: true,
      preventRepeat: true,
      position: 'bottom-center', // bottom-left, bottom-center, bottom-right
    }
  };

  // Key mappings
  const keyMappings = {
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
    ' ': { type: 'action', action: 'primary' },
    'Enter': { type: 'action', action: 'start' },
    'Escape': { type: 'action', action: 'pause' },
  };

  /**
   * Dispatch a control input event
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
   * Handle keyboard events
   */
  function handleKeyDown(e) {
    if (!state.options.keyboardEnabled) return;
    
    const mapping = keyMappings[e.key];
    if (!mapping) return;

    // Prevent default behavior for game keys
    e.preventDefault();

    // Check for repeat prevention
    const keyId = e.key;
    if (state.options.preventRepeat && state.keyStates.get(keyId)) {
      return; // Key already pressed
    }

    state.keyStates.set(keyId, true);

    // Dispatch event
    dispatchControlEvent({
      type: mapping.type,
      direction: mapping.direction,
      action: mapping.action,
      pressed: true,
      source: 'keyboard',
      key: e.key
    });
  }

  function handleKeyUp(e) {
    if (!state.options.keyboardEnabled) return;
    
    const mapping = keyMappings[e.key];
    if (!mapping) return;

    e.preventDefault();

    const keyId = e.key;
    state.keyStates.set(keyId, false);

    dispatchControlEvent({
      type: mapping.type,
      direction: mapping.direction,
      action: mapping.action,
      pressed: false,
      source: 'keyboard',
      key: e.key
    });
  }

  /**
   * Handle on-screen button events
   */
  function handleButtonPress(buttonType, direction, action) {
    return function(e) {
      e.preventDefault();
      
      const buttonId = direction || action || buttonType;
      const button = e.currentTarget;
      
      // Add visual feedback
      button.classList.add('pressed');
      state.buttonStates.set(buttonId, true);

      dispatchControlEvent({
        type: buttonType,
        direction: direction,
        action: action,
        pressed: true,
        source: 'touch'
      });
    };
  }

  function handleButtonRelease(buttonType, direction, action) {
    return function(e) {
      e.preventDefault();
      
      const buttonId = direction || action || buttonType;
      const button = e.currentTarget;
      
      // Remove visual feedback
      button.classList.remove('pressed');
      state.buttonStates.set(buttonId, false);

      dispatchControlEvent({
        type: buttonType,
        direction: direction,
        action: action,
        pressed: false,
        source: 'touch'
      });
    };
  }

  /**
   * Create on-screen control panel
   */
  function createControlPanel() {
    const panel = document.createElement('div');
    panel.className = `control-panel control-panel-${state.options.position}`;
    panel.innerHTML = `
      <div class="control-section dpad-section">
        <div class="dpad">
          <button class="dpad-btn dpad-up" data-direction="up" aria-label="Up">
            <span>▲</span>
          </button>
          <button class="dpad-btn dpad-left" data-direction="left" aria-label="Left">
            <span>◄</span>
          </button>
          <button class="dpad-btn dpad-center" aria-label="Center">
            <span>●</span>
          </button>
          <button class="dpad-btn dpad-right" data-direction="right" aria-label="Right">
            <span>►</span>
          </button>
          <button class="dpad-btn dpad-down" data-direction="down" aria-label="Down">
            <span>▼</span>
          </button>
        </div>
      </div>
      <div class="control-section action-section">
        <button class="action-btn action-primary" data-action="primary" aria-label="Action">
          <span>A</span>
        </button>
        <button class="action-btn action-secondary" data-action="secondary" aria-label="Secondary Action">
          <span>B</span>
        </button>
        <button class="action-btn action-start" data-action="start" aria-label="Start">
          <span>START</span>
        </button>
      </div>
    `;

    // Add event listeners to directional buttons
    const dpadButtons = panel.querySelectorAll('.dpad-btn[data-direction]');
    dpadButtons.forEach(button => {
      const direction = button.dataset.direction;
      
      // Touch events
      button.addEventListener('touchstart', handleButtonPress('move', direction, null));
      button.addEventListener('touchend', handleButtonRelease('move', direction, null));
      button.addEventListener('touchcancel', handleButtonRelease('move', direction, null));
      
      // Mouse events (for desktop testing)
      button.addEventListener('mousedown', handleButtonPress('move', direction, null));
      button.addEventListener('mouseup', handleButtonRelease('move', direction, null));
      button.addEventListener('mouseleave', handleButtonRelease('move', direction, null));
    });

    // Add event listeners to action buttons
    const actionButtons = panel.querySelectorAll('.action-btn[data-action]');
    actionButtons.forEach(button => {
      const action = button.dataset.action;
      
      // Touch events
      button.addEventListener('touchstart', handleButtonPress('action', null, action));
      button.addEventListener('touchend', handleButtonRelease('action', null, action));
      button.addEventListener('touchcancel', handleButtonRelease('action', null, action));
      
      // Mouse events
      button.addEventListener('mousedown', handleButtonPress('action', null, action));
      button.addEventListener('mouseup', handleButtonRelease('action', null, action));
      button.addEventListener('mouseleave', handleButtonRelease('action', null, action));
    });

    return panel;
  }

  /**
   * Initialize the controls module
   */
  function init(options = {}) {
    if (state.initialized) {
      console.warn('Controls already initialized. Call destroy() first.');
      return;
    }

    // Merge options
    state.options = { ...state.options, ...options };

    // Get container element
    const containerSelector = state.options.container;
    state.container = typeof containerSelector === 'string' 
      ? document.querySelector(containerSelector)
      : containerSelector;

    if (!state.container) {
      console.error(`Container not found: ${containerSelector}`);
      return;
    }

    // Add keyboard listeners
    if (state.options.keyboardEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
    }

    // Create and append on-screen controls
    if (state.options.showOnScreen) {
      state.controlPanel = createControlPanel();
      state.container.appendChild(state.controlPanel);
    }

    state.initialized = true;
    
    // Dispatch init event
    dispatchControlEvent({
      type: 'start',
      pressed: true,
      source: 'system'
    });

    console.log('Retro Arcade Controls initialized');
  }

  /**
   * Destroy the controls module
   */
  function destroy() {
    if (!state.initialized) {
      return;
    }

    // Remove keyboard listeners
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);

    // Remove control panel
    if (state.controlPanel && state.controlPanel.parentNode) {
      state.controlPanel.parentNode.removeChild(state.controlPanel);
    }

    // Clear state
    state.keyStates.clear();
    state.buttonStates.clear();
    state.controlPanel = null;
    state.container = null;
    state.initialized = false;

    // Dispatch stop event
    dispatchControlEvent({
      type: 'stop',
      pressed: false,
      source: 'system'
    });

    console.log('Retro Arcade Controls destroyed');
  }

  /**
   * Get current state
   */
  function getState() {
    return {
      initialized: state.initialized,
      keyStates: Object.fromEntries(state.keyStates),
      buttonStates: Object.fromEntries(state.buttonStates)
    };
  }

  // Expose public API
  window.Controls = {
    init: init,
    destroy: destroy,
    getState: getState,
    version: '1.0.0'
  };

  // Auto-initialize if data attribute is present
  if (document.currentScript && document.currentScript.hasAttribute('data-auto-init')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => init());
    } else {
      init();
    }
  }

})();
