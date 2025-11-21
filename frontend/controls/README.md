# Retro Arcade Controls Module

A lightweight, framework-agnostic frontend controls module that provides on-screen buttons and keyboard support for game interfaces. Built with vanilla JavaScript, it can be integrated into any frontend framework (React, Vue, or vanilla JS) without modifying existing project files.

## Purpose & Design

This module provides:
- **On-screen controls**: D-pad (Up/Down/Left/Right) and Action button for touch/mouse input
- **Keyboard support**: Arrow keys, WASD, Space, and Enter
- **Universal compatibility**: Works with vanilla JS, React, Vue, or any other framework
- **Event-based communication**: Uses CustomEvent API for loose coupling
- **Zero dependencies**: No external libraries required
- **Responsive design**: Mobile-friendly with touch support
- **Minimal footprint**: Small, portable, and non-invasive

The module is designed to be a drop-in solution that doesn't require changes to your existing codebase. It communicates through standard browser events, making it easy to integrate and remove.

## Installation

Simply include the CSS and JavaScript files in your project:

```html
<link rel="stylesheet" href="path/to/controls.css">
<script src="path/to/controls.js"></script>
```

## Quick Start

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="controls.css">
</head>
<body>
  <div id="game-area"></div>

  <script src="controls.js"></script>
  <script>
    // Initialize controls
    window.Controls.init({
      mountPoint: document.body, // Optional, defaults to document.body
      size: 'medium',            // 'small', 'medium', or 'large'
      theme: 'dark'              // 'dark' or 'light'
    });

    // Listen for control events
    window.addEventListener('control-input', (event) => {
      const { type, direction, pressed, timestamp } = event.detail;
      
      console.log('Control event:', type, direction, pressed);
      
      // Handle movement
      if (type === 'start' || type === 'move') {
        // Move your game object based on direction
        movePlayer(direction);
      }
      
      // Handle action button
      if (type === 'action' && pressed) {
        // Trigger action (jump, shoot, etc.)
        performAction();
      }
      
      // Handle stop event
      if (type === 'stop') {
        // Stop movement in the given direction
        stopMovement(direction);
      }
    });

    // Clean up when done
    // window.Controls.destroy();
  </script>
</body>
</html>
```

### React Integration

```jsx
import { useEffect, useState } from 'react';

function GameComponent() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Initialize controls
    window.Controls.init({
      size: 'medium',
      theme: 'dark'
    });

    // Event handler
    const handleControlInput = (event) => {
      const { type, direction, pressed } = event.detail;
      
      if ((type === 'start' || type === 'move') && pressed) {
        setPosition(prev => {
          const speed = 5;
          switch (direction) {
            case 'up': return { ...prev, y: prev.y - speed };
            case 'down': return { ...prev, y: prev.y + speed };
            case 'left': return { ...prev, x: prev.x - speed };
            case 'right': return { ...prev, x: prev.x + speed };
            default: return prev;
          }
        });
      }
      
      if (type === 'action' && pressed) {
        console.log('Action button pressed!');
      }
    };

    // Add event listener
    window.addEventListener('control-input', handleControlInput);

    // Cleanup
    return () => {
      window.removeEventListener('control-input', handleControlInput);
      window.Controls.destroy();
    };
  }, []);

  return (
    <div className="game-area">
      <div 
        className="player"
        style={{ 
          position: 'absolute',
          left: position.x,
          top: position.y
        }}
      >
        🎮
      </div>
    </div>
  );
}

export default GameComponent;
```

### Vue Integration

```vue
<template>
  <div class="game-area">
    <div 
      class="player"
      :style="{ 
        position: 'absolute',
        left: position.x + 'px',
        top: position.y + 'px'
      }"
    >
      🎮
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameComponent',
  data() {
    return {
      position: { x: 0, y: 0 }
    };
  },
  mounted() {
    // Initialize controls
    window.Controls.init({
      size: 'medium',
      theme: 'dark'
    });

    // Event handler
    this.handleControlInput = (event) => {
      const { type, direction, pressed } = event.detail;
      
      if ((type === 'start' || type === 'move') && pressed) {
        const speed = 5;
        switch (direction) {
          case 'up':
            this.position.y -= speed;
            break;
          case 'down':
            this.position.y += speed;
            break;
          case 'left':
            this.position.x -= speed;
            break;
          case 'right':
            this.position.x += speed;
            break;
        }
      }
      
      if (type === 'action' && pressed) {
        console.log('Action button pressed!');
      }
    };

    // Add event listener
    window.addEventListener('control-input', this.handleControlInput);
  },
  beforeUnmount() {
    // Cleanup
    window.removeEventListener('control-input', this.handleControlInput);
    window.Controls.destroy();
  }
};
</script>
```

## Public API

### `window.Controls.init(options)`

Initializes the controls module and adds it to the DOM.

**Parameters:**
- `options` (Object, optional):
  - `mountPoint` (HTMLElement): Element to mount controls to. Defaults to `document.body`.
  - `size` (String): Size of controls. Options: `'small'`, `'medium'`, `'large'`. Default: `'medium'`.
  - `theme` (String): Color theme. Options: `'dark'`, `'light'`. Default: `'dark'`.

**Example:**
```javascript
window.Controls.init({
  mountPoint: document.getElementById('controls-container'),
  size: 'large',
  theme: 'light'
});
```

### `window.Controls.destroy()`

Removes the controls from the DOM and cleans up all event listeners.

**Example:**
```javascript
window.Controls.destroy();
```

## CustomEvent Format

The module dispatches a `'control-input'` CustomEvent on the `window` object with the following `detail` structure:

### Event Detail Properties

```typescript
interface ControlEventDetail {
  type: 'start' | 'move' | 'action' | 'stop';
  direction?: 'up' | 'down' | 'left' | 'right';
  pressed: boolean;
  timestamp: number;
}
```

### Event Types

- **`start`**: Fired when a movement key/button is first pressed
  - Includes `direction` property
  - `pressed` is always `true`

- **`move`**: Fired during continuous key hold (auto-repeat)
  - Includes `direction` property
  - `pressed` is always `true`

- **`action`**: Fired when action key/button (Space/Enter/A button) is pressed
  - No `direction` property
  - `pressed` is `true`

- **`stop`**: Fired when a movement key/button is released
  - Includes `direction` property
  - `pressed` is always `false`

### Example Events

```javascript
// Movement start
{
  type: 'start',
  direction: 'up',
  pressed: true,
  timestamp: 1700000000000
}

// Continuous movement
{
  type: 'move',
  direction: 'right',
  pressed: true,
  timestamp: 1700000000100
}

// Action button
{
  type: 'action',
  pressed: true,
  timestamp: 1700000000200
}

// Movement stop
{
  type: 'stop',
  direction: 'left',
  pressed: false,
  timestamp: 1700000000300
}
```

## Keyboard Mappings

### Movement Keys
- **Arrow Keys**: ↑ ↓ ← →
- **WASD**: W (up), S (down), A (left), D (right)

### Action Keys
- **Space**: Primary action
- **Enter**: Alternative action

All keys trigger the same event format, allowing you to handle them uniformly.

## Features

### Debounce & Auto-Repeat Prevention

The module intelligently handles key repeat events:
- First press triggers `type: 'start'`
- Held key triggers `type: 'move'` for continuous movement
- Release triggers `type: 'stop'`
- Prevents duplicate events from browser auto-repeat

### Visual Feedback

Buttons show visual feedback when pressed:
- Pressed state with color change
- Subtle animation on press/release
- Works for both keyboard and on-screen controls

### Mobile Support

- Touch-friendly button sizes
- Responsive layout adapts to screen size
- Prevents unwanted scrolling and text selection
- Semi-transparent overlay doesn't obscure gameplay

## Demo

Open `demo.html` in your browser to see a working example with:
- Movable square controlled by keyboard or on-screen buttons
- Real-time event logging
- Visual feedback for all inputs
- Example of handling movement and action events

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- No polyfills required for evergreen browsers

## Customization

### Custom Styling

The controls use CSS classes that can be overridden:

```css
/* Override button colors */
.control-btn {
  background: your-custom-color;
}

/* Override pressed state */
.control-btn.pressed {
  background: your-pressed-color;
}

/* Reposition controls */
.controls-panel {
  bottom: 10px;
  left: 20px;
  transform: none;
}
```

### Custom Mount Point

Mount controls in a specific container instead of body:

```javascript
const container = document.getElementById('my-controls-area');
window.Controls.init({ mountPoint: container });
```

## Integration Notes

1. **Non-Invasive**: The module only adds event listeners and DOM elements when initialized
2. **Framework Agnostic**: Works with any JavaScript framework or vanilla JS
3. **No Modifications Required**: Existing project files remain unchanged
4. **Easy Removal**: Call `destroy()` to completely remove the module
5. **Event-Based**: Uses browser CustomEvent API for loose coupling

## Next Steps

This controls module is designed to work standalone, but future enhancements could include:

- **REST API Integration**: Send control events to backend endpoints
- **Socket.io Support**: Real-time multiplayer control synchronization
- **Procfile Configuration**: Deploy with proper process management
- **Game State Management**: Optional state management helpers
- **Recording/Playback**: Record and replay control sequences

These features will be added in follow-up PRs to keep this module focused and minimal.

## License

Part of the Retro Arcade project. See main project LICENSE for details.

## Contributing

Contributions are welcome! Please:
1. Test your changes with the demo
2. Ensure backward compatibility
3. Update documentation for API changes
4. Keep the module small and portable
