'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

const themes = [
    {
        id: 'glassmorphism',
        name: 'Glassmorphism',
        description: 'Modern glass-like interface',
        preview: 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500',
        file: '/styles/glassmorphism.css',
    },
    {
        id: 'neumorphism',
        name: 'Neumorphism',
        description: 'Soft 3D design style',
        preview: 'bg-gray-200',
        file: '/styles/neumorphism.css',
    },
    {
        id: 'gradient',
        name: 'Gradient',
        description: 'Vibrant colorful gradients',
        preview: 'bg-gradient-to-r from-blue-500 to-purple-600',
        file: '/styles/gradient.css',
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        description: 'Futuristic neon style',
        preview: 'bg-black',
        file: '/styles/cyberpunk.css',
    },
    {
        id: 'minimalist',
        name: 'Minimalist',
        description: 'Clean Apple-inspired design',
        preview: 'bg-white',
        file: '/styles/minimalist.css',
    },
];

export default function ThemeSwitcher() {
    const [currentTheme, setCurrentTheme] = useState('minimalist');

    useEffect(() => {
        // Load current theme from localStorage
        const savedTheme = localStorage.getItem('dashboard-theme') || 'minimalist';
        setCurrentTheme(savedTheme);
        loadTheme(savedTheme);
    }, []);

    const loadTheme = (themeId: string) => {
        // Remove existing theme stylesheets
        const existingLinks = document.querySelectorAll('link[data-theme]');
        existingLinks.forEach((link) => link.remove());

        // Add new theme stylesheet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = themes.find((t) => t.id === themeId)?.file || '';
        link.setAttribute('data-theme', themeId);
        document.head.appendChild(link);

        // Update body classes
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${themeId}`);
    };

    const handleThemeChange = (themeId: string) => {
        setCurrentTheme(themeId);
        loadTheme(themeId);
        localStorage.setItem('dashboard-theme', themeId);
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>🎨 Theme Switcher</CardTitle>
                <p className="text-muted-foreground">
                    Choose your preferred dashboard style. All themes use shadcn/ui components.
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {themes.map((theme) => (
                        <div
                            key={theme.id}
                            className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                                currentTheme === theme.id
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => handleThemeChange(theme.id)}
                        >
                            <div
                                className={`h-20 rounded-md mb-3 ${theme.preview} flex items-center justify-center`}
                            >
                                <span className="text-white font-bold text-sm">{theme.name}</span>
                            </div>
                            <h3 className="font-semibold mb-1">{theme.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                {theme.description}
                            </p>
                            {currentTheme === theme.id && (
                                <Badge className="absolute top-2 right-2">Active</Badge>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">
                        Current Theme: {themes.find((t) => t.id === currentTheme)?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        The theme is automatically saved and will persist across sessions.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
