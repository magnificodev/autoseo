'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function GlassmorphismExample() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="glass-card p-6 text-center">
                    <h1 className="text-4xl font-bold text-white mb-2">Glassmorphism Dashboard</h1>
                    <p className="text-white/80">
                        Modern glass-like interface with backdrop blur effects
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="glass-card border-0">
                        <CardHeader className="text-center">
                            <CardTitle className="text-white">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-3xl font-bold text-white mb-2">1,234</div>
                            <Badge className="glass-button border-0">+12% this month</Badge>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-0">
                        <CardHeader className="text-center">
                            <CardTitle className="text-white">Revenue</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-3xl font-bold text-white mb-2">$45,678</div>
                            <Badge className="glass-button border-0">+8% this month</Badge>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-0">
                        <CardHeader className="text-center">
                            <CardTitle className="text-white">Orders</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-3xl font-bold text-white mb-2">567</div>
                            <Badge className="glass-button border-0">+15% this month</Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Form */}
                <Card className="glass-card border-0">
                    <CardHeader>
                        <CardTitle className="text-white">Add New Item</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Item name"
                            className="glass-input border-0 text-white placeholder:text-white/60"
                        />
                        <Input
                            placeholder="Description"
                            className="glass-input border-0 text-white placeholder:text-white/60"
                        />
                        <div className="flex gap-4">
                            <Button className="glass-button border-0 text-white hover:text-purple-600">
                                Save Item
                            </Button>
                            <Button
                                variant="outline"
                                className="glass-button border-white/30 text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
