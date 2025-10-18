'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CyberpunkExample() {
    return (
        <div className="cyber-bg cyber-grid min-h-screen p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="cyber-card p-6 text-center cyber-glow">
                    <h1 className="text-4xl font-bold cyber-text-neon mb-2 cyber-pulse">
                        CYBERPUNK DASHBOARD
                    </h1>
                    <p className="text-gray-400">Futuristic interface with neon accents</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="cyber-card">
                        <CardHeader className="text-center">
                            <CardTitle className="cyber-text-neon">SYSTEM USERS</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-3xl font-bold cyber-text-neon mb-2">1,234</div>
                            <Badge className="cyber-button-secondary border-0">+12% UPTIME</Badge>
                        </CardContent>
                    </Card>

                    <Card className="cyber-card">
                        <CardHeader className="text-center">
                            <CardTitle className="cyber-text-neon">CREDITS</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-3xl font-bold cyber-text-neon mb-2">$45,678</div>
                            <Badge className="cyber-button-secondary border-0">+8% PROFIT</Badge>
                        </CardContent>
                    </Card>

                    <Card className="cyber-card">
                        <CardHeader className="text-center">
                            <CardTitle className="cyber-text-neon">TRANSACTIONS</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-3xl font-bold cyber-text-neon mb-2">567</div>
                            <Badge className="cyber-button-secondary border-0">+15% SPEED</Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Form */}
                <Card className="cyber-card">
                    <CardHeader>
                        <CardTitle className="cyber-text-neon">ADD NEW DATA</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="DATA INPUT"
                            className="cyber-input text-white placeholder:text-gray-500"
                        />
                        <Input
                            placeholder="DESCRIPTION"
                            className="cyber-input text-white placeholder:text-gray-500"
                        />
                        <div className="flex gap-4">
                            <Button className="cyber-button">EXECUTE</Button>
                            <Button className="cyber-button-secondary">ABORT</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
