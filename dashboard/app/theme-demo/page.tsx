'use client';

import CyberpunkExample from '@/components/examples/CyberpunkExample';
import GlassmorphismExample from '@/components/examples/GlassmorphismExample';
import ThemeSwitcher from '@/components/theme/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function ThemeDemoPage() {
    const [showExample, setShowExample] = useState(false);
    const [currentExample, setCurrentExample] = useState('');

    const examples = [
        { id: 'glassmorphism', component: GlassmorphismExample, name: 'Glassmorphism' },
        { id: 'cyberpunk', component: CyberpunkExample, name: 'Cyberpunk' },
    ];

    const handleShowExample = (exampleId: string) => {
        setCurrentExample(exampleId);
        setShowExample(true);
    };

    if (showExample) {
        const ExampleComponent = examples.find((e) => e.id === currentExample)?.component;
        return (
            <div>
                <div className="p-4 bg-background border-b">
                    <Button onClick={() => setShowExample(false)} variant="outline">
                        ← Back to Theme Switcher
                    </Button>
                </div>
                {ExampleComponent && <ExampleComponent />}
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">🎨 Dashboard Theme Demo</h1>
                <p className="text-muted-foreground text-lg">
                    Explore different UI styles using shadcn/ui components
                </p>
            </div>

            <ThemeSwitcher />

            <Card>
                <CardHeader>
                    <CardTitle>🚀 Live Examples</CardTitle>
                    <p className="text-muted-foreground">
                        Click to see full-page examples of each theme in action
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {examples.map((example) => (
                            <div key={example.id} className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">{example.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    See how {example.name.toLowerCase()} looks in a real dashboard
                                </p>
                                <Button
                                    onClick={() => handleShowExample(example.id)}
                                    className="w-full"
                                >
                                    View {example.name} Example
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>💡 Implementation Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">1. CSS Classes</h4>
                        <p className="text-sm text-muted-foreground">
                            Each theme provides CSS classes that work with shadcn/ui components.
                            Simply add the theme classes to your existing components.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">2. Customization</h4>
                        <p className="text-sm text-muted-foreground">
                            Modify the CSS variables in each theme file to customize colors,
                            shadows, and effects to match your brand.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">3. Responsive Design</h4>
                        <p className="text-sm text-muted-foreground">
                            All themes are fully responsive and work seamlessly with Tailwind CSS
                            responsive utilities.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
