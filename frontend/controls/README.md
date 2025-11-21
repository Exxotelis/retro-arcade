# Frontend Controls Module

A lightweight, non-invasive frontend controls module implemented in vanilla JavaScript. This module provides on-screen controls and keyboard support that can be integrated into any frontend framework (React, Vue, or vanilla JS) without modifying existing project files.

## Purpose and Design

The controls module is designed to:
- Provide a unified input system for retro arcade games
- Work seamlessly across desktop (keyboard) and mobile (touch) devices
- Integrate easily without framework dependencies
- Emit standardized control events that any application can consume
- Maintain a small footprint with no external dependencies

## Features

- **On-screen Controls**: Visual buttons for Up, Down, Left, Right, and Action
- **Keyboard Support**: Arrow keys, WASD, Space, and Enter
- **CustomEvent API**: Easy integration through standard browser events
- **Debounce Logic**: Prevents repeated keydown events, ensuring clean input handling
- **Visual Feedback**: Button highlights on press
- **Responsive Design**: Mobile-friendly layout with touch support
- **Framework Agnostic**: Works with vanilla JS, React, Vue, or any other framework

## Installation

Simply include the CSS and JS files in your HTML:

```html
<link rel="stylesheet" href="controls.css">
<script src="controls.js"></script>
```

## API Reference

### `window.Controls.init(options)`

Initialize the controls module.

**Parameters:**
- `options` (Object, optional):
  - `mountPoint` (HTMLElement): Element to mount controls to. Defaults to `document.body`
  - `size` (String): Size of controls - 'small', 'medium', or 'large'. Defaults to 'medium'
  - `theme` (String): Color theme - 'light', 'dark', or 'retro'. Defaults to 'retro'

**Returns:** void

**Example:**
```javascript
window.Controls.init({
  mountPoint: document.getElementById('controls-container'),
  size: 'large',
  theme: 'retro'
});
```

### `window.Controls.destroy()`

Remove the controls and clean up all event listeners.

**Returns:** void

**Example:**
```javascript
window.Controls.destroy();
```

## CustomEvent Format

The module dispatches a `control-input` CustomEvent on the `window` object with the following detail structure:

```javascript
{
  type: 'move' | 'action' | 'start' | 'stop',
  direction?: 'up' | 'down' | 'left' | 'right',  // Only for move events
  pressed: true | false,
  timestamp: number  // Date.now()
}
```

**Event Types:**
- `move`: Directional input (includes `direction` property)
- `action`: Action button pressed (Space/Enter)
- `start`: Key/button press initiated (first press)
- `stop`: Key/button released

**Pressed State:**
- `true`: Button/key is currently pressed
- `false`: Button/key was released

## Integration Examples

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
    window.Controls.init({ theme: 'retro' });
    
    // Listen for control events
    window.addEventListener('control-input', (event) => {
      const { type, direction, pressed, timestamp } = event.detail;
      console.log(`Control: ${type}`, direction, pressed);
      
      if (type === 'move' && pressed) {
        movePlayer(direction);
      } else if (type === 'action' && pressed) {
        playerAction();
      }
    });
    
    function movePlayer(direction) {
      // Your game logic here
    }
    
    function playerAction() {
      // Your action logic here
    }
  </script>
</body>
</html>
```

### React Integration

```jsx
import { useEffect } from 'react';

function GameComponent() {
  useEffect(() => {
    // Initialize controls when component mounts
    window.Controls.init({
      mountPoint: document.getElementById('controls-mount'),
      theme: 'dark'
    });
    
    // Add event listener
    const handleControlInput = (event) => {
      const { type, direction, pressed } = event.detail;
      
      if (type === 'move' && pressed) {
        // Handle movement
        console.log('Move:', direction);
      } else if (type === 'action' && pressed) {
        // Handle action
        console.log('Action!');
      }
    };
    
    window.addEventListener('control-input', handleControlInput);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('control-input', handleControlInput);
      window.Controls.destroy();
    };
  }, []);
  
  return (
    <div>
      <div id="game-canvas">
        {/* Your game content */}
      </div>
      <div id="controls-mount"></div>
    </div>
  );
}

export default GameComponent;
```

### Vue Integration

```vue
<template>
  <div>
    <div id="game-canvas">
      <!-- Your game content -->
    </div>
    <div ref="controlsMount"></div>
  </div>
</template>

<script>
export default {
  name: 'GameComponent',
  mounted() {
    // Initialize controls
    window.Controls.init({
      mountPoint: this.$refs.controlsMount,
      theme: 'retro'
    });
    
    // Add event listener
    window.addEventListener('control-input', this.handleControlInput);
  },
  beforeUnmount() {
    // Cleanup
    window.removeEventListener('control-input', this.handleControlInput);
    window.Controls.destroy();
  },
  methods: {
    handleControlInput(event) {
      const { type, direction, pressed } = event.detail;
      
      if (type === 'move' && pressed) {
        this.movePlayer(direction);
      } else if (type === 'action' && pressed) {
        this.playerAction();
      }
    },
    movePlayer(direction) {
      // Your game logic
      console.log('Move:', direction);
    },
    playerAction() {
      // Your action logic
      console.log('Action!');
    }
  }
};
</script>
```

## Keyboard Mappings

| Key(s) | Control |
|--------|---------|
| Arrow Up / W | Up |
| Arrow Down / S | Down |
| Arrow Left / A | Left |
| Arrow Right / D | Right |
| Space / Enter | Action |

## Demo

See `demo.html` for a complete working example with a movable square that responds to control inputs.

To run the demo:
1. Open `demo.html` in a web browser
2. Use arrow keys, WASD, or click the on-screen buttons
3. Watch the square move and change color on action
4. Check the console for event logs

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers with touch support

## License

Part of the Retro Arcade project.
