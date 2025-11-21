# Retro Arcade Controls Module

A lightweight, non-invasive JavaScript module that adds on-screen controls and keyboard support to web applications. Built with vanilla JavaScript, it integrates seamlessly with any frontend framework (React, Vue, vanilla JS, etc.) without requiring modifications to existing code.

## Features

- 🎮 **On-screen controls** - Directional pad and action buttons for touch devices
- ⌨️ **Keyboard support** - Arrow keys, WASD, Space, and Enter
- 🔌 **Framework agnostic** - Works with React, Vue, vanilla JS, and any other framework
- 🎯 **Event-driven** - Uses CustomEvents for loose coupling
- 🚀 **Zero dependencies** - Pure vanilla JavaScript
- 📱 **Responsive** - Adapts to different screen sizes
- ♿ **Accessible** - Keyboard navigation and ARIA labels
- 🎨 **Customizable** - Easy to style and configure

## Quick Start

### 1. Include the Files

Add the JavaScript and CSS files to your HTML:

```html
<link rel="stylesheet" href="controls/controls.css">
<script src="controls/controls.js"></script>
```

### 2. Initialize

```javascript
// Initialize with default options
window.Controls.init();

// Or with custom options
window.Controls.init({
  container: '#game-container',
  showOnScreen: true,
  keyboardEnabled: true,
  position: 'bottom-center'
});
```

### 3. Listen for Events

```javascript
window.addEventListener('control-input', (event) => {
  const { type, direction, action, pressed, source, timestamp } = event.detail;
  
  console.log('Control input:', event.detail);
  
  // Handle movement
  if (type === 'move' && pressed) {
    movePlayer(direction); // up, down, left, right
  }
  
  // Handle actions
  if (type === 'action' && pressed) {
    performAction(action); // primary, secondary, start
  }
});
```

## API Reference

### Initialization

```javascript
window.Controls.init(options)
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | string \| Element | `'body'` | Container element or selector where controls will be mounted |
| `showOnScreen` | boolean | `true` | Show on-screen touch controls |
| `keyboardEnabled` | boolean | `true` | Enable keyboard input |
| `preventRepeat` | boolean | `true` | Prevent key repeat when holding keys |
| `position` | string | `'bottom-center'` | Position of on-screen controls: `'bottom-left'`, `'bottom-center'`, or `'bottom-right'` |

### Cleanup

```javascript
window.Controls.destroy()
```

Removes all event listeners and on-screen controls. Call this when unmounting components or navigating away.

### Get State

```javascript
const state = window.Controls.getState()
```

Returns the current state of all controls:

```javascript
{
  initialized: true,
  keyStates: { 'ArrowUp': true, 'w': false, ... },
  buttonStates: { 'up': true, 'down': false, ... }
}
```

## Event Details

The `control-input` event includes the following details:

```typescript
{
  type: 'move' | 'action' | 'start' | 'stop',  // Event type
  direction?: 'up' | 'down' | 'left' | 'right', // For move events
  action?: 'primary' | 'secondary' | 'start',   // For action events
  pressed: boolean,                              // true on press, false on release
  source: 'keyboard' | 'touch' | 'system',      // Input source
  key?: string,                                  // Original key (keyboard only)
  timestamp: number                              // Event timestamp
}
```

## Keyboard Mappings

| Key(s) | Event Type | Direction/Action |
|--------|------------|------------------|
| Arrow Keys | `move` | `up`, `down`, `left`, `right` |
| W, A, S, D | `move` | `up`, `left`, `down`, `right` |
| Space | `action` | `primary` |
| Enter | `action` | `start` |
| Escape | `action` | `pause` |

## Integration Examples

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="controls/controls.css">
</head>
<body>
  <div id="game"></div>
  
  <script src="controls/controls.js"></script>
  <script>
    // Initialize
    window.Controls.init({ container: 'body' });
    
    // Listen for inputs
    window.addEventListener('control-input', (e) => {
      if (e.detail.type === 'move' && e.detail.pressed) {
        console.log('Move:', e.detail.direction);
      }
    });
  </script>
</body>
</html>
```

### React Integration

Create a React hook:

```javascript
// hooks/useControls.js
import { useEffect } from 'react';

export function useControls(onInput, options = {}) {
  useEffect(() => {
    // Initialize controls
    window.Controls.init({
      container: 'body',
      ...options
    });

    // Add event listener
    const handleInput = (event) => {
      onInput(event.detail);
    };
    window.addEventListener('control-input', handleInput);

    // Cleanup
    return () => {
      window.removeEventListener('control-input', handleInput);
      window.Controls.destroy();
    };
  }, [onInput, options]);
}
```

Usage in a component:

```javascript
// GameComponent.jsx
import { useControls } from './hooks/useControls';

function GameComponent() {
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });

  const handleInput = (detail) => {
    if (detail.type === 'move' && detail.pressed) {
      setPlayerPos(prev => {
        const speed = 5;
        const newPos = { ...prev };
        
        switch (detail.direction) {
          case 'up': newPos.y -= speed; break;
          case 'down': newPos.y += speed; break;
          case 'left': newPos.x -= speed; break;
          case 'right': newPos.x += speed; break;
        }
        
        return newPos;
      });
    }
  };

  useControls(handleInput, { position: 'bottom-right' });

  return (
    <div className="game">
      <div 
        className="player" 
        style={{ 
          left: playerPos.x, 
          top: playerPos.y 
        }}
      />
    </div>
  );
}
```

### Vue Integration

Create a Vue composable:

```javascript
// composables/useControls.js
import { onMounted, onUnmounted } from 'vue';

export function useControls(onInput, options = {}) {
  onMounted(() => {
    // Initialize controls
    window.Controls.init({
      container: 'body',
      ...options
    });

    // Add event listener
    const handleInput = (event) => {
      onInput(event.detail);
    };
    window.addEventListener('control-input', handleInput);

    // Store cleanup function
    onUnmounted(() => {
      window.removeEventListener('control-input', handleInput);
      window.Controls.destroy();
    });
  });
}
```

Usage in a component:

```vue
<script setup>
import { ref } from 'vue';
import { useControls } from '@/composables/useControls';

const playerPos = ref({ x: 0, y: 0 });

const handleInput = (detail) => {
  if (detail.type === 'move' && detail.pressed) {
    const speed = 5;
    
    switch (detail.direction) {
      case 'up': playerPos.value.y -= speed; break;
      case 'down': playerPos.value.y += speed; break;
      case 'left': playerPos.value.x -= speed; break;
      case 'right': playerPos.value.x += speed; break;
    }
  }
};

useControls(handleInput, { position: 'bottom-center' });
</script>

<template>
  <div class="game">
    <div 
      class="player" 
      :style="{ left: playerPos.x + 'px', top: playerPos.y + 'px' }"
    />
  </div>
</template>
```

## Customization

### Styling

Override CSS variables or classes to match your theme:

```css
/* Custom styles */
.control-panel {
  background: rgba(50, 50, 100, 0.9);
}

.dpad-btn {
  background: linear-gradient(145deg, #667eea, #764ba2);
}

.action-btn {
  background: linear-gradient(145deg, #f093fb, #f5576c);
}
```

### Auto-initialization

Add the `data-auto-init` attribute to the script tag for automatic initialization:

```html
<script src="controls/controls.js" data-auto-init></script>
```

## Testing

Open `demo.html` in a browser to test the controls:

```bash
# Simple HTTP server
python -m http.server 8000

# Or using Node.js
npx serve .
```

Then navigate to `http://localhost:8000/controls/demo.html`

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Touch events supported

## Architecture

The module follows these design principles:

1. **Non-invasive**: Creates new elements without modifying existing DOM
2. **Loosely coupled**: Uses CustomEvents for communication
3. **Framework agnostic**: Pure JavaScript with no dependencies
4. **Cleanup-friendly**: Proper event listener and DOM cleanup
5. **Accessible**: ARIA labels and keyboard navigation

## Event Flow

```
User Input (Keyboard/Touch)
    ↓
Controls Module
    ↓
CustomEvent 'control-input'
    ↓
Your Game Logic
```

## File Structure

```
controls/
├── controls.js       # Main module (10KB)
├── controls.css      # Styles (4KB)
├── demo.html         # Demo page
└── README.md         # This file
```

## Performance

- **Lightweight**: ~14KB total (unminified)
- **No dependencies**: No external libraries
- **Event debouncing**: Prevents input spam
- **Efficient DOM updates**: Minimal reflows

## Future Enhancements

Planned features for future releases:

- 🎮 Gamepad API support
- 🔊 Haptic feedback
- 🎨 Theme presets
- 📊 Input recording/playback
- 🌐 Multi-language support
- ⚙️ More configuration options

## Troubleshooting

### Controls not appearing

- Check that the container element exists
- Verify CSS file is loaded
- Check browser console for errors

### Events not firing

- Ensure event listener is added after initialization
- Check that `keyboardEnabled` option is true
- Verify the page has focus

### Controls positioned incorrectly

- Check the `position` option
- Verify CSS is not being overridden
- Try different container elements

## License

This module is part of the Retro Arcade project. See the main project LICENSE file for details.

## Contributing

Contributions are welcome! Please follow the project's contribution guidelines.

## Support

For issues, questions, or feature requests, please open an issue in the main repository.

---

**Version**: 1.0.0  
**Last Updated**: 2024
