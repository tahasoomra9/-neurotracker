# NeuroTracker Desktop Application

A modern desktop application built with Electron and React for neural activity tracking and analysis.

## Features

- **Minimal & Lightweight**: No heavy UI libraries required
- **Hover-visible scrollbars**: Subtle, thin scrollbars that appear on hover
- **Multiple variants**: Default, thin, and auto-hide options
- **Smooth scrolling**: CSS-based smooth scroll behavior
- **TypeScript support**: Fully typed components and hooks
- **Electron compatible**: Works in both dev server and built app
- **Accessibility**: Respects `prefers-reduced-motion`
- **Graceful fallback**: Falls back to default scrolling if needed

## Quick Start

### 1. CSS Classes (Simplest approach)

Add the `scrollable` class to any container:

```tsx
<div className="scrollable scroll-h-64 bg-card rounded-lg p-4">
  {/* Your scrollable content */}
  {items.map(item => (
    <div key={item.id}>{item.content}</div>
  ))}
</div>
```

Available CSS classes:
- `scrollable` - Default 6px scrollbar, visible on hover
- `scrollable-thin` - Thinner 4px scrollbar
- `scrollable-auto-hide` - Hidden by default, shows on hover
- `scroll-h-64`, `scroll-h-80`, `scroll-h-96` - Height utilities
- `scroll-h-screen`, `scroll-h-1/2`, `scroll-h-2/3` - Viewport-based heights

### 2. ScrollableContainer Component

Use the React component for more control:

```tsx
import { ScrollableContainer } from './src/components/ScrollableContainer';

<ScrollableContainer 
  variant="default" 
  maxHeight="h-64"
  className="bg-card rounded-lg p-4"
>
  {/* Your content */}
</ScrollableContainer>
```

### 3. useScrollable Hook (Advanced)

For custom implementations with scroll utilities:

```tsx
import { useScrollable } from './src/hooks/useScrollable';

const MyComponent = () => {
  const { scrollRef, scrollToTop, scrollToBottom, isAtBottom } = useScrollable({
    enhanceWheel: true,
    wheelSpeed: 1.5
  });

  return (
    <div ref={scrollRef} className="scrollable h-64">
      {/* Your content */}
    </div>
  );
};
```

## Component API

### ScrollableContainer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'thin' \| 'auto-hide'` | `'default'` | Scrollbar appearance |
| `maxHeight` | `'h-64' \| 'h-80' \| 'h-96' \| 'h-screen' \| 'h-1/2' \| 'h-2/3' \| 'h-3/4'` | - | Maximum height utility |
| `enhanceWheel` | `boolean` | `false` | Enable enhanced wheel scrolling |
| `wheelSpeed` | `number` | `1` | Scroll speed multiplier |
| `autoScrollToBottom` | `boolean` | `false` | Auto-scroll when content changes |
| `onScrollUtilsReady` | `function` | - | Callback with scroll utilities |

### useScrollable Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `behavior` | `'smooth' \| 'instant' \| 'auto'` | `'smooth'` | Scroll behavior |
| `enhanceWheel` | `boolean` | `false` | Enhanced wheel scrolling |
| `wheelSpeed` | `number` | `1` | Wheel scroll speed multiplier |
| `autoScrollToBottom` | `boolean` | `false` | Auto-scroll to bottom on content change |

## Usage Examples

### Dashboard Panel
```tsx
// Perfect for task lists, notifications, etc.
<div className="premium-glass p-6">
  <h3 className="text-lg font-semibold mb-4">Weekly Tasks</h3>
  <div className="scrollable scroll-h-80 space-y-2">
    {tasks.map(task => (
      <TaskItem key={task.id} task={task} />
    ))}
  </div>
</div>
```

### Chat Interface
```tsx
const ChatPanel = () => {
  const { scrollRef, scrollToBottom } = useScrollable({
    autoScrollToBottom: true
  });

  return (
    <div ref={scrollRef} className="scrollable-auto-hide h-96 p-4">
      {messages.map(msg => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
    </div>
  );
};
```

### Settings Panel
```tsx
<ScrollableContainer 
  variant="thin" 
  maxHeight="h-screen"
  className="p-6"
>
  <SettingsForm />
</ScrollableContainer>
```

## Styling Customization

The scrollbars use CSS custom properties from your existing design system:

```css
/* Scrollbar colors are based on your theme */
--muted-foreground /* Used for scrollbar thumb color */
```

To customize further, override the CSS classes:

```css
.scrollable::-webkit-scrollbar-thumb {
  background: your-custom-color;
}
```

## Browser Support

- **Webkit browsers** (Chrome, Safari, Edge): Full custom styling
- **Firefox**: Uses `scrollbar-width: thin` and `scrollbar-color`
- **Fallback**: Default scrollbars if custom styling fails

## Performance Notes

- Uses CSS-only animations for smooth performance
- No JavaScript scroll listeners by default
- Optional enhanced wheel scrolling for specific use cases
- Respects `prefers-reduced-motion` for accessibility

## Integration with Existing Code

The scrollable components are designed to be drop-in replacements. Simply:

1. Add the CSS file import to your `index.html`
2. Replace existing scrollable containers with the new classes/components
3. No changes needed to your existing React architecture

## Files Added

- `src/styles/scrollbar.css` - CSS styles for custom scrollbars
- `src/hooks/useScrollable.ts` - React hook for scroll utilities
- `src/components/ScrollableContainer.tsx` - React component wrapper
- `examples/ScrollableUsage.tsx` - Usage examples and demos