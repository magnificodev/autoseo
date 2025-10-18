# 🎨 Dashboard Theme System

This guide explains how to use and customize the different UI themes available for the dashboard.

## Available Themes

### 1. 🌟 Glassmorphism

-   **Style**: Modern glass-like interface with backdrop blur
-   **Best for**: Modern, elegant applications
-   **Key features**: Transparency, blur effects, subtle shadows

### 2. 🎯 Neumorphism

-   **Style**: Soft 3D design with embossed/debossed effects
-   **Best for**: Clean, minimalist interfaces
-   **Key features**: Soft shadows, subtle depth, monochromatic

### 3. 🌈 Gradient

-   **Style**: Vibrant colorful gradients
-   **Best for**: Creative, energetic applications
-   **Key features**: Bold colors, smooth transitions, modern look

### 4. 🌙 Cyberpunk

-   **Style**: Futuristic neon design
-   **Best for**: Tech, gaming, futuristic applications
-   **Key features**: Dark theme, neon accents, glowing effects

### 5. 🎨 Minimalist

-   **Style**: Clean Apple-inspired design
-   **Best for**: Professional, clean applications
-   **Key features**: Simple, clean, focused on content

## Usage

### Basic Implementation

1. **Include the theme CSS file**:

```html
<link rel="stylesheet" href="/styles/glassmorphism.css" />
```

2. **Add theme classes to your components**:

```tsx
<Card className="glass-card">
    <CardHeader>
        <CardTitle>Glassmorphism Card</CardTitle>
    </CardHeader>
    <CardContent>
        <Button className="glass-button">Glass Button</Button>
    </CardContent>
</Card>
```

### Dynamic Theme Switching

Use the `ThemeSwitcher` component to allow users to change themes:

```tsx
import ThemeSwitcher from '@/components/theme/ThemeSwitcher';

export default function SettingsPage() {
    return (
        <div>
            <h1>Theme Settings</h1>
            <ThemeSwitcher />
        </div>
    );
}
```

### Customization

Each theme uses CSS custom properties (variables) that you can override:

```css
:root {
    --glass-bg: rgba(255, 255, 255, 0.1);
    --glass-border: rgba(255, 255, 255, 0.2);
    /* Override these values to customize */
}
```

## Component Classes

### Glassmorphism

-   `.glass-card` - Glass-like card
-   `.glass-button` - Glass-like button
-   `.glass-input` - Glass-like input
-   `.glass-nav` - Glass-like navigation

### Neumorphism

-   `.neumorphism-card` - Soft 3D card
-   `.neumorphism-button` - Soft 3D button
-   `.neumorphism-input` - Soft 3D input
-   `.neumorphism-flat` - Flat neumorphism element

### Gradient

-   `.gradient-card` - Gradient background card
-   `.gradient-button` - Gradient button
-   `.gradient-text` - Gradient text effect
-   `.gradient-bg` - Gradient background

### Cyberpunk

-   `.cyber-card` - Dark cyberpunk card
-   `.cyber-button` - Neon button
-   `.cyber-input` - Dark input with neon focus
-   `.cyber-text-neon` - Neon text effect

### Minimalist

-   `.minimalist-card` - Clean card
-   `.minimalist-button` - Clean button
-   `.minimalist-input` - Clean input
-   `.minimalist-badge` - Clean badge

## Best Practices

1. **Consistency**: Stick to one theme throughout your application
2. **Accessibility**: Ensure sufficient contrast ratios
3. **Performance**: Only load the CSS for the theme you're using
4. **Testing**: Test themes on different devices and screen sizes
5. **Customization**: Use CSS variables for easy theme customization

## Browser Support

-   **Glassmorphism**: Modern browsers with backdrop-filter support
-   **Neumorphism**: All modern browsers
-   **Gradient**: All modern browsers
-   **Cyberpunk**: All modern browsers
-   **Minimalist**: All browsers

## Examples

Visit `/theme-demo` to see all themes in action with live examples.

## Contributing

To add a new theme:

1. Create a new CSS file in `/styles/`
2. Define theme classes and CSS variables
3. Add the theme to the `ThemeSwitcher` component
4. Create an example component
5. Update this documentation
