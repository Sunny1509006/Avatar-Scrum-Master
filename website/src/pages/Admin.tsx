import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentUpload from "@/components/DocumentUpload";
import { Lock, LogOut } from "lucide-react";

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        // Check if already authenticated in this session
        return sessionStorage.getItem("admin_auth") === "true";
    });
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Simple password - you can change this to your preferred password
    // For production, this should be stored in environment variables
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem("admin_auth", "true");
            setError("");
        } else {
            setError("Incorrect password");
            setPassword("");
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem("admin_auth");
        setPassword("");
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <Card className="w-full max-w-md shadow-luxury">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Lock className="h-6 w-6 text-accent" />
                            Admin Access
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Enter password to access document management
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Input
                                    type="password"
                                    placeholder="Enter admin password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full"
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-sm text-destructive mt-2">{error}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" variant="luxury" className="flex-1">
                                    Login
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/")}
                                >
                                    Back to Home
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <nav className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                                Admin Panel
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Document Management
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/")}
                            >
                                Back to Home
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="flex items-center gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12 max-w-4xl">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">Knowledge Base Management</h2>
                    <p className="text-muted-foreground">
                        Upload and manage PDF documents for the AI Coach to reference during conversations
                    </p>
                </div>

                <DocumentUpload />
            </main>
        </div>
    );
};

export default Admin;
