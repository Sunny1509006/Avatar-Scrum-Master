import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
    doc_id: string;
    filename: string;
    upload_date: string;
    chunk_count: number;
}

const DocumentUpload = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const API_BASE = "/api";

    // Fetch documents on mount
    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await fetch(`${API_BASE}/documents`);
            if (response.ok) {
                const docs = await response.json();
                setDocuments(docs);
            }
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (file.type !== "application/pdf") {
            toast({
                title: "Invalid file type",
                description: "Please upload a PDF file",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please upload a file smaller than 10MB",
                variant: "destructive",
            });
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${API_BASE}/uploadDoc`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                toast({
                    title: "Upload successful",
                    description: `${result.filename} has been uploaded and indexed`,
                });
                fetchDocuments(); // Refresh document list
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            toast({
                title: "Upload failed",
                description: "Failed to upload document. Please try again.",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
            // Reset input
            event.target.value = "";
        }
    };

    const handleDelete = async (docId: string, filename: string) => {
        if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/documents/${docId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast({
                    title: "Document deleted",
                    description: `${filename} has been removed`,
                });
                fetchDocuments(); // Refresh document list
            } else {
                throw new Error("Delete failed");
            }
        } catch (error) {
            toast({
                title: "Delete failed",
                description: "Failed to delete document. Please try again.",
                variant: "destructive",
            });
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Unknown";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "Unknown";
        }
    };

    return (
        <Card className="shadow-luxury">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent" />
                    Knowledge Base
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Upload PDF documents for the AI Coach to reference
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Upload Section */}
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors">
                    <input
                        type="file"
                        id="pdf-upload"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                    <label
                        htmlFor="pdf-upload"
                        className={`cursor-pointer ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            {uploading ? (
                                <Loader2 className="h-12 w-12 text-accent animate-spin" />
                            ) : (
                                <Upload className="h-12 w-12 text-accent" />
                            )}
                            <div>
                                <p className="text-lg font-semibold">
                                    {uploading ? "Uploading..." : "Click to upload PDF"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    or drag and drop (max 10MB)
                                </p>
                            </div>
                        </div>
                    </label>
                </div>

                {/* Documents List */}
                <div>
                    <h3 className="font-semibold mb-3 flex items-center justify-between">
                        <span>Uploaded Documents ({documents.length})</span>
                    </h3>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-accent" />
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No documents uploaded yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {documents.map((doc) => (
                                <div
                                    key={doc.doc_id}
                                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <FileText className="h-5 w-5 text-accent flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{doc.filename}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(doc.upload_date)} • {doc.chunk_count} chunks
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(doc.doc_id, doc.filename)}
                                        className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default DocumentUpload;
