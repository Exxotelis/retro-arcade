# Controls Module

A lightweight, non-invasive frontend controls module for browser-based games. Implemented in vanilla JavaScript with no external dependencies.

## Purpose

This module provides a unified interface for game controls across different input methods:
- **Keyboard**: Arrow keys, WASD, Space, and Enter
- **On-screen controls**: Touch-friendly buttons for mobile devices
- **Event-driven**: Emits CustomEvents that any framework can consume

The module is designed to be framework-agnostic and can be integrated into vanilla JavaScript, React, Vue, or any other frontend framework.

## Features

- ✅ **No dependencies**: Pure vanilla JavaScript
- ✅ **UMD-like module**: Works in browser environments
- ✅ **Event-driven**: Uses CustomEvents for loose coupling
- ✅ **Mobile-friendly**: Responsive touch controls
- ✅ **Keyboard support**: Arrow keys, WASD, Space/Enter
- ✅ **Prevents duplicates**: No duplicate start events while held
- ✅ **Repeat events**: Configurable move event intervals
- ✅ **Visual feedback**: Pressed state styling
- ✅ **Clean API**: Simple init() and destroy() methods

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="controls.css">
</head>
<body>
  <script src="controls.js"></script>
  <script>
    // Initialize controls
    Controls.init({
      repeatInterval: 100  // Optional: milliseconds between move events
    });

    // Listen for control events
    window.addEventListener('control-input', (event) => {
      console.log(event.detail);
      // { type: 'start', direction: 'up', pressed: true, timestamp: 1234567890 }
    });
  </script>
</body>
</html>
```

## Public API

### `Controls.init(options)`

Initializes the controls module.

**Parameters:**
- `options` (Object, optional)
  - `mountPoint` (HTMLElement): Element to mount controls into. Default: `document.body`
  - `repeatInterval` (Number): Interval in milliseconds for repeated move events. Default: `100`

**Returns:** `Controls` (for chaining)

**Example:**
```javascript
Controls.init({
  mountPoint: document.getElementById('game-container'),
  repeatInterval: 50  // Faster movement updates
});
```

### `Controls.destroy()`

Destroys the controls module and cleans up all event listeners.

**Returns:** `Controls` (for chaining)

**Example:**
```javascript
Controls.destroy();
```

### `Controls.isInitialized()`

Checks if the controls are currently initialized.

**Returns:** `Boolean`

**Example:**
```javascript
if (!Controls.isInitialized()) {
  Controls.init();
}
```

## CustomEvent Format

The module dispatches `control-input` events on the `window` object with the following structure:

### Event Types

#### `start` - Directional button pressed
```javascript
{
  type: 'start',
  direction: 'up' | 'down' | 'left' | 'right',
  pressed: true,
  timestamp: 1234567890
}
```

#### `move` - Repeated while directional button held
```javascript
{
  type: 'move',
  direction: 'up' | 'down' | 'left' | 'right',
  pressed: true,
  timestamp: 1234567890
}
```

#### `stop` - Directional button released
```javascript
{
  type: 'stop',
  direction: 'up' | 'down' | 'left' | 'right',
  pressed: false,
  timestamp: 1234567890
}
```

#### `action` - Action button pressed/released
```javascript
{
  type: 'action',
  pressed: true | false,
  timestamp: 1234567890
}
```

### Event Properties

- `type` (String): Event type - `'start'`, `'move'`, `'stop'`, or `'action'`
- `direction` (String, optional): Direction for movement events - `'up'`, `'down'`, `'left'`, `'right'`
- `pressed` (Boolean): Whether the control is pressed (`true`) or released (`false`)
- `timestamp` (Number): Millisecond timestamp from `Date.now()`

## Key Mappings

| Input | Direction/Action |
|-------|-----------------|
| Arrow Up | up |
| Arrow Down | down |
| Arrow Left | left |
| Arrow Right | right |
| W / w | up |
| S / s | down |
| A / a | left |
| D / d | right |
| Space | action |
| Enter | action |

## Integration Examples

### Vanilla JavaScript

```javascript
let position = { x: 0, y: 0 };
const speed = 5;

window.addEventListener('control-input', (event) => {
  const { type, direction, pressed } = event.detail;
  
  if (type === 'move' && pressed) {
    switch (direction) {
      case 'up': position.y -= speed; break;
      case 'down': position.y += speed; break;
      case 'left': position.x -= speed; break;
      case 'right': position.x += speed; break;
    }
    updatePlayer(position);
  }
  
  if (type === 'action' && pressed) {
    performAction();
  }
});

Controls.init({ repeatInterval: 50 });
```

### React

```jsx
import { useEffect, useState } from 'react';

function Game() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const speed = 5;

  useEffect(() => {
    // Initialize controls
    if (typeof window !== 'undefined' && window.Controls) {
      window.Controls.init({ repeatInterval: 50 });
    }

    // Event handler
    const handleControl = (event) => {
      const { type, direction, pressed } = event.detail;
      
      if (type === 'move' && pressed) {
        setPosition(prev => {
          const newPos = { ...prev };
          switch (direction) {
            case 'up': newPos.y -= speed; break;
            case 'down': newPos.y += speed; break;
            case 'left': newPos.x -= speed; break;
            case 'right': newPos.x += speed; break;
          }
          return newPos;
        });
      }
    };

    window.addEventListener('control-input', handleControl);

    // Cleanup
    return () => {
      window.removeEventListener('control-input', handleControl);
      if (window.Controls) {
        window.Controls.destroy();
      }
    };
  }, []);

  return (
    <div className="game">
      <div 
        className="player" 
        style={{ 
          left: position.x, 
          top: position.y 
        }}
      />
    </div>
  );
}
```

### Vue

```vue
<template>
  <div class="game">
    <div 
      class="player" 
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
    ></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      position: { x: 0, y: 0 },
      speed: 5
    };
  },
  mounted() {
    // Initialize controls
    if (window.Controls) {
      window.Controls.init({ repeatInterval: 50 });
    }

    // Event handler
    this.handleControl = (event) => {
      const { type, direction, pressed } = event.detail;
      
      if (type === 'move' && pressed) {
        switch (direction) {
          case 'up': this.position.y -= this.speed; break;
          case 'down': this.position.y += this.speed; break;
          case 'left': this.position.x -= this.speed; break;
          case 'right': this.position.x += this.speed; break;
        }
      }
    };

    window.addEventListener('control-input', this.handleControl);
  },
  beforeUnmount() {
    window.removeEventListener('control-input', this.handleControl);
    if (window.Controls) {
      window.Controls.destroy();
    }
  }
};
</script>
```

## Demo

Open `demo.html` in a browser to see the controls in action. The demo includes:
- A movable square that responds to controls
- Real-time event logging
- Visual feedback for all interactions

## Styling

The module includes responsive CSS with:
- Fixed positioning at bottom center
- Touch-optimized button sizes
- Pressed state visual feedback
- Mobile-friendly breakpoints
- High contrast mode support

To customize styling, modify `controls.css` or override the classes in your application:
- `.controls-panel` - Main container
- `.control-btn` - Individual buttons
- `.control-btn.pressed` - Pressed state

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires ES5+ support (for CustomEvents and modern DOM APIs)

## File Structure

```
frontend/controls/
├── controls.js      # Main module (vanilla JS)
├── controls.css     # Styling
├── demo.html        # Standalone demo
└── README.md        # This file
```

## Next Steps

Future enhancements may include:
- REST API persistence for control mappings (Postgres)
- Realtime multiplayer support (socket.io)
- Configuration options for button layouts
- Additional action buttons
- Gamepad API integration

## License

Part of the Retro Arcade project. See main repository for license details.
