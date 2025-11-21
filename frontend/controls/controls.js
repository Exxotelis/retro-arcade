/**
 * Retro Arcade Controls Module
 * A lightweight, framework-agnostic controls module for browser-based games.
 * Provides on-screen buttons and keyboard input handling.
 */
(function (global) {
  'use strict';

  // Track key states to prevent repeated events
  const keyStates = new Map();
  let container = null;
  let config = {};
  
  // Button refs for highlighting
  const buttonRefs = {
    up: null,
    down: null,
    left: null,
    right: null,
    action: null
  };

  // Event listener references for cleanup
  let keydownListener = null;
  let keyupListener = null;
  let blurListener = null;

  /**
   * Dispatch a control-input event
   * @param {Object} detail - Event detail object
   */
  function dispatchControlEvent(detail) {
    const event = new CustomEvent('control-input', {
      detail: {
        ...detail,
        timestamp: Date.now()
      },
      bubbles: true,
      cancelable: true
    });
    global.dispatchEvent(event);
  }

  /**
   * Handle directional input
   * @param {string} direction - up, down, left, right
   * @param {boolean} pressed - true for keydown/click, false for keyup/release
   */
  function handleDirection(direction, pressed) {
    // Visual feedback
    const button = buttonRefs[direction];
    if (button) {
      if (pressed) {
        button.classList.add('pressed');
      } else {
        button.classList.remove('pressed');
      }
    }

    dispatchControlEvent({
      type: pressed ? 'move' : 'stop',
      direction: direction,
      pressed: pressed
    });
  }

  /**
   * Handle action input (e.g., fire, jump)
   * @param {boolean} pressed - true for keydown/click, false for keyup/release
   */
  function handleAction(pressed) {
    const button = buttonRefs.action;
    if (button) {
      if (pressed) {
        button.classList.add('pressed');
      } else {
        button.classList.remove('pressed');
      }
    }

    dispatchControlEvent({
      type: 'action',
      pressed: pressed
    });
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} e - Keyboard event
   * @param {boolean} pressed - true for keydown, false for keyup
   */
  function handleKeyboard(e, pressed) {
    const key = e.key;
    
    // Prevent auto-repeat - only process if state is changing
    const currentState = keyStates.get(key);
    if (pressed && currentState === true) {
      return; // Already pressed, ignore repeat
    }

    // Update key state
    keyStates.set(key, pressed);

    // Map keys to actions
    switch (key) {
      // Arrow keys
      case 'ArrowUp':
        e.preventDefault();
        handleDirection('up', pressed);
        break;
      case 'ArrowDown':
        e.preventDefault();
        handleDirection('down', pressed);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handleDirection('left', pressed);
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleDirection('right', pressed);
        break;
      
      // WASD keys
      case 'w':
      case 'W':
        handleDirection('up', pressed);
        break;
      case 's':
      case 'S':
        handleDirection('down', pressed);
        break;
      case 'a':
      case 'A':
        handleDirection('left', pressed);
        break;
      case 'd':
      case 'D':
        handleDirection('right', pressed);
        break;
      
      // Action keys
      case ' ':
      case 'Enter':
        e.preventDefault();
        handleAction(pressed);
        break;
    }
  }

  /**
   * Create the control panel UI
   * @returns {HTMLElement} Container element with controls
   */
  function createControlPanel() {
    const panel = document.createElement('div');
    panel.className = 'controls-panel';
    panel.setAttribute('data-theme', config.theme || 'dark');
    panel.setAttribute('data-size', config.size || 'medium');

    // D-pad container
    const dpad = document.createElement('div');
    dpad.className = 'controls-dpad';

    // Create direction buttons
    const directions = ['up', 'left', 'center', 'right', 'down'];
    directions.forEach(dir => {
      const btn = document.createElement('button');
      btn.className = `controls-btn controls-btn-${dir}`;
      btn.setAttribute('aria-label', dir === 'center' ? 'center' : dir);
      
      if (dir === 'center') {
        btn.disabled = true;
        btn.textContent = '';
      } else {
        btn.textContent = dir === 'up' ? '▲' : 
                          dir === 'down' ? '▼' : 
                          dir === 'left' ? '◀' : '▶';
        
        // Store reference for highlighting
        buttonRefs[dir] = btn;
        
        // Mouse/touch events
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          handleDirection(dir, true);
        });
        btn.addEventListener('mouseup', (e) => {
          e.preventDefault();
          handleDirection(dir, false);
        });
        btn.addEventListener('mouseleave', (e) => {
          handleDirection(dir, false);
        });
        btn.addEventListener('touchstart', (e) => {
          e.preventDefault();
          handleDirection(dir, true);
        });
        btn.addEventListener('touchend', (e) => {
          e.preventDefault();
          handleDirection(dir, false);
        });
        btn.addEventListener('touchcancel', (e) => {
          e.preventDefault();
          handleDirection(dir, false);
        });
      }
      
      dpad.appendChild(btn);
    });

    // Action button
    const actionBtn = document.createElement('button');
    actionBtn.className = 'controls-btn controls-btn-action';
    actionBtn.setAttribute('aria-label', 'action');
    actionBtn.textContent = 'A';
    buttonRefs.action = actionBtn;

    actionBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handleAction(true);
    });
    actionBtn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      handleAction(false);
    });
    actionBtn.addEventListener('mouseleave', (e) => {
      handleAction(false);
    });
    actionBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleAction(true);
    });
    actionBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleAction(false);
    });
    actionBtn.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      handleAction(false);
    });

    panel.appendChild(dpad);
    panel.appendChild(actionBtn);

    return panel;
  }

  /**
   * Initialize the controls module
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.mountPoint - Element to mount controls to (default: document.body)
   * @param {string} options.size - Size of controls: 'small', 'medium', 'large' (default: 'medium')
   * @param {string} options.theme - Color theme: 'dark', 'light', 'retro' (default: 'dark')
   */
  function init(options = {}) {
    if (container) {
      console.warn('Controls already initialized. Call destroy() first.');
      return;
    }

    config = options;

    // Create and mount control panel
    container = createControlPanel();
    const mountPoint = options.mountPoint || document.body;
    mountPoint.appendChild(container);

    // Setup keyboard listeners
    keydownListener = (e) => handleKeyboard(e, true);
    keyupListener = (e) => handleKeyboard(e, false);
    document.addEventListener('keydown', keydownListener);
    document.addEventListener('keyup', keyupListener);

    // Clear key states on blur to handle edge cases
    blurListener = () => {
      keyStates.clear();
      // Clear all button highlights
      Object.values(buttonRefs).forEach(btn => {
        if (btn) btn.classList.remove('pressed');
      });
    };
    global.addEventListener('blur', blurListener);

    console.log('Controls initialized');
  }

  /**
   * Destroy the controls module and clean up
   */
  function destroy() {
    if (!container) {
      console.warn('Controls not initialized.');
      return;
    }

    // Remove event listeners
    if (keydownListener) {
      document.removeEventListener('keydown', keydownListener);
      keydownListener = null;
    }
    if (keyupListener) {
      document.removeEventListener('keyup', keyupListener);
      keyupListener = null;
    }
    if (blurListener) {
      global.removeEventListener('blur', blurListener);
      blurListener = null;
    }

    // Remove control panel
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;

    // Clear button references
    Object.keys(buttonRefs).forEach(key => {
      buttonRefs[key] = null;
    });

    // Clear key states
    keyStates.clear();

    console.log('Controls destroyed');
  }

  // Expose public API
  global.Controls = {
    init: init,
    destroy: destroy
  };

})(typeof window !== 'undefined' ? window : this);
