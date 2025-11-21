# Retro Arcade Controls Module

A lightweight, framework-agnostic controls module for browser-based games. Provides on-screen touch/mouse controls and keyboard input handling that works with any frontend framework or vanilla JavaScript.

## 🎯 Purpose & Design

This module is designed to be:

- **Non-invasive**: Add controls to any project without modifying existing files
- **Framework-agnostic**: Works with React, Vue, Angular, or vanilla JavaScript
- **Lightweight**: Zero dependencies, ~8KB minified
- **Mobile-friendly**: Responsive touch controls with visual feedback
- **Accessible**: Keyboard support with proper event handling and debouncing

## 📦 Installation

Simply copy the `controls.js` and `controls.css` files to your project and include them:

```html
<link rel="stylesheet" href="path/to/controls.css">
<script src="path/to/controls.js"></script>
```

## 🚀 Quick Start

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
    Controls.init({
      mountPoint: document.body, // Optional: defaults to document.body
      size: 'medium',            // Optional: 'small', 'medium', 'large'
      theme: 'dark'              // Optional: 'dark', 'light', 'retro'
    });

    // Listen for control events
    window.addEventListener('control-input', (event) => {
      const { type, direction, pressed, timestamp } = event.detail;
      
      if (type === 'move' && pressed) {
        console.log(`Moving ${direction}`);
        // Update your game state
      }
      
      if (type === 'action' && pressed) {
        console.log('Action button pressed!');
        // Handle action (jump, fire, etc.)
      }
    });

    // Clean up when done
    // Controls.destroy();
  </script>
</body>
</html>
```

### React Integration

```jsx
import { useEffect } from 'react';
import './controls.css';
// Import the script via script tag in index.html or use dynamic import

function GameComponent() {
  useEffect(() => {
    // Initialize controls when component mounts
    if (window.Controls) {
      window.Controls.init({
        size: 'medium',
        theme: 'dark'
      });
    }

    // Listen for control events
    const handleControlInput = (event) => {
      const { type, direction, pressed } = event.detail;
      
      if (type === 'move' && pressed) {
        // Update game state based on direction
        setPlayerDirection(direction);
      }
      
      if (type === 'action' && pressed) {
        // Handle action
        performAction();
      }
    };

    window.addEventListener('control-input', handleControlInput);

    // Cleanup
    return () => {
      window.removeEventListener('control-input', handleControlInput);
      if (window.Controls) {
        window.Controls.destroy();
      }
    };
  }, []);

  return (
    <div className="game-container">
      {/* Your game content */}
    </div>
  );
}

export default GameComponent;
```

### Vue Integration

```vue
<template>
  <div class="game-container">
    <!-- Your game content -->
  </div>
</template>

<script>
import './controls.css';
// Import the script via script tag in index.html or use dynamic import

export default {
  name: 'GameComponent',
  
  mounted() {
    // Initialize controls
    if (window.Controls) {
      window.Controls.init({
        size: 'medium',
        theme: 'dark'
      });
    }

    // Listen for control events
    this.handleControlInput = (event) => {
      const { type, direction, pressed } = event.detail;
      
      if (type === 'move' && pressed) {
        // Update game state
        this.movePlayer(direction);
      }
      
      if (type === 'action' && pressed) {
        // Handle action
        this.performAction();
      }
    };

    window.addEventListener('control-input', this.handleControlInput);
  },
  
  beforeUnmount() {
    // Cleanup
    window.removeEventListener('control-input', this.handleControlInput);
    if (window.Controls) {
      window.Controls.destroy();
    }
  },
  
  methods: {
    movePlayer(direction) {
      // Your movement logic
    },
    performAction() {
      // Your action logic
    }
  }
};
</script>

<style src="./controls.css"></style>
```

## 📚 API Reference

### `window.Controls.init(options)`

Initialize the controls module.

**Parameters:**
- `options` (Object, optional):
  - `mountPoint` (HTMLElement): Element to mount controls to. Default: `document.body`
  - `size` (String): Control size - `'small'`, `'medium'`, or `'large'`. Default: `'medium'`
  - `theme` (String): Color theme - `'dark'`, `'light'`, or `'retro'`. Default: `'dark'`

**Example:**
```javascript
Controls.init({
  mountPoint: document.getElementById('controls-container'),
  size: 'large',
  theme: 'retro'
});
```

### `window.Controls.destroy()`

Destroy the controls module and clean up all event listeners and DOM elements.

**Example:**
```javascript
Controls.destroy();
```

### CustomEvent: `control-input`

All control inputs dispatch a `control-input` CustomEvent on the `window` object.

**Event Detail Structure:**
```javascript
{
  type: 'move' | 'action' | 'stop',  // Type of input
  direction: 'up' | 'down' | 'left' | 'right',  // Only for move/stop
  pressed: true | false,              // Whether button is pressed or released
  timestamp: 1234567890               // Timestamp from Date.now()
}
```

**Event Types:**
- `move`: Directional input started (includes `direction` and `pressed: true`)
- `stop`: Directional input stopped (includes `direction` and `pressed: false`)
- `action`: Action button input (includes `pressed: true/false`)

**Example Handler:**
```javascript
window.addEventListener('control-input', (event) => {
  const { type, direction, pressed, timestamp } = event.detail;
  
  switch(type) {
    case 'move':
      if (pressed) {
        console.log(`Started moving ${direction} at ${timestamp}`);
      }
      break;
      
    case 'stop':
      if (!pressed) {
        console.log(`Stopped moving ${direction}`);
      }
      break;
      
    case 'action':
      console.log(pressed ? 'Action pressed' : 'Action released');
      break;
  }
});
```

## ⌨️ Keyboard Support

The module automatically listens for keyboard input:

- **Arrow Keys**: ↑ ↓ ← → for directional movement
- **WASD Keys**: W/A/S/D for directional movement
- **Space Bar**: Action button
- **Enter Key**: Action button

### Debouncing & Auto-Repeat Prevention

The module includes intelligent key state tracking to prevent repeated events:

- First `keydown` dispatches `type: 'move'` with `pressed: true`
- Holding the key down does NOT generate repeated events
- `keyup` dispatches `type: 'stop'` with `pressed: false`
- Key states are cleared on window blur to prevent stuck keys

## 🎨 Themes

Three built-in themes are available:

### Dark Theme (default)
```javascript
Controls.init({ theme: 'dark' });
```
Modern dark UI with gradient buttons and subtle shadows.

### Light Theme
```javascript
Controls.init({ theme: 'light' });
```
Clean light UI perfect for bright environments.

### Retro Theme
```javascript
Controls.init({ theme: 'retro' });
```
Nostalgic 80s/90s aesthetic with neon colors and glowing effects.

## 📱 Mobile Support

The controls are fully responsive and touch-friendly:

- Touch events properly handled (`touchstart`, `touchend`, `touchcancel`)
- Visual feedback on button press
- Automatic sizing adjustments for different screen sizes
- Prevents unwanted text selection and callouts
- Semi-transparent overlay doesn't block game view

## 🎮 Demo

Open `demo.html` in a browser to see the controls in action:

```bash
# Using a simple HTTP server
python -m http.server 8000
# or
npx serve .

# Then open http://localhost:8000/demo.html
```

The demo includes:
- A movable square controlled by inputs
- Visual feedback for all control events
- Real-time event logging
- Theme and size switchers
- Console logging for debugging

## 🔧 Customization

### Custom Styling

You can override the default styles by adding your own CSS after including `controls.css`:

```css
/* Custom positioning */
.controls-panel {
  bottom: 50px;
  left: 20px; /* Move to left side */
}

/* Custom colors */
.controls-panel[data-theme="dark"] .controls-btn:not(.controls-btn-center) {
  background: linear-gradient(145deg, #your-color-1, #your-color-2);
  border-color: #your-border-color;
}

/* Custom button size */
.controls-btn {
  width: 80px;
  height: 80px;
}
```

### Adding Custom Themes

Define your own theme in CSS:

```css
.controls-panel[data-theme="custom"] .controls-btn:not(.controls-btn-center) {
  background: linear-gradient(145deg, #ff6b6b, #ee5a6f);
  color: #ffffff;
  border: 2px solid #ff8787;
}

.controls-panel[data-theme="custom"] .controls-btn.pressed {
  background: linear-gradient(145deg, #ee5a6f, #c92a2a);
  border-color: #ffd700;
}
```

Then use it:
```javascript
Controls.init({ theme: 'custom' });
```

## 🐛 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- ES5+ compatible
- No external dependencies

## 📝 License

This module is part of the Retro Arcade project. Feel free to use and modify as needed.

## 🚧 Next Steps

Future enhancements planned in follow-up PRs:
- WebSocket integration for multiplayer controls
- REST API integration for game state sync
- Procfile and deployment configuration
- Additional control layouts (joystick, custom buttons)
- Haptic feedback for mobile devices
- Gamepad API integration

## 🤝 Contributing

Contributions welcome! To integrate this module into your own game:

1. Copy `controls.js` and `controls.css` to your project
2. Include them in your HTML or build process
3. Call `Controls.init()` with your preferred options
4. Listen for `control-input` events and update your game logic
5. Call `Controls.destroy()` when cleaning up

See `demo.html` for a complete working example.
