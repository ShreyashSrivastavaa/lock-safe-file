import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock, Unlock, Download, Trash2, FileIcon } from "lucide-react";
import { toast } from "sonner";
import { decryptFile, downloadDecryptedFile } from "@/lib/encryption";

interface EncryptedFile {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  encrypted_data: string;
  encryption_salt: string;
  encryption_iv: string;
  is_locked: boolean;
  created_at: string;
}

interface FileListProps {
  userId: string;
}

const FileList = ({ userId }: FileListProps) => {
  const [files, setFiles] = useState<EncryptedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<EncryptedFile | null>(null);
  const [decryptPassword, setDecryptPassword] = useState("");
  const [decrypting, setDecrypting] = useState(false);
  const [showDecryptDialog, setShowDecryptDialog] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [userId]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from("encrypted_files")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      console.error("Error fetching files:", error);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleDecryptClick = (file: EncryptedFile) => {
    setSelectedFile(file);
    setShowDecryptDialog(true);
  };

  const handleDecrypt = async () => {
    if (!selectedFile || !decryptPassword) {
      toast.error("Please enter the decryption password");
      return;
    }

    setDecrypting(true);

    try {
      const decryptedData = await decryptFile(
        selectedFile.encrypted_data,
        decryptPassword,
        selectedFile.encryption_salt,
        selectedFile.encryption_iv
      );

      downloadDecryptedFile(
        decryptedData,
        selectedFile.file_name,
        selectedFile.file_type
      );

      toast.success("File decrypted and downloaded successfully!");
      setShowDecryptDialog(false);
      setDecryptPassword("");
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Decryption error:", error);
      toast.error(error.message || "Failed to decrypt file. Check your password.");
    } finally {
      setDecrypting(false);
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("encrypted_files")
        .delete()
        .eq("id", fileId);

      if (error) throw error;

      toast.success("File deleted successfully");
      fetchFiles();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading your files...
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No encrypted files yet. Upload your first file to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {file.is_locked ? (
                  <Lock className="w-5 h-5 text-primary" />
                ) : (
                  <Unlock className="w-5 h-5 text-accent" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{file.file_name}</h4>
                <p className="text-xs text-muted-foreground">
                  {(file.file_size / 1024).toFixed(2)} KB • {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDecryptClick(file)}
              >
                <Download className="w-4 h-4 mr-1" />
                Decrypt
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(file.id, file.file_name)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showDecryptDialog} onOpenChange={setShowDecryptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decrypt File</DialogTitle>
            <DialogDescription>
              Enter the password to decrypt "{selectedFile?.file_name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="decrypt-password">Decryption Password</Label>
              <Input
                id="decrypt-password"
                type="password"
                placeholder="Enter password"
                value={decryptPassword}
                onChange={(e) => setDecryptPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleDecrypt();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDecryptDialog(false);
                setDecryptPassword("");
                setSelectedFile(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleDecrypt} disabled={decrypting}>
              {decrypting ? (
                <>
                  <Unlock className="w-4 h-4 mr-2 animate-pulse" />
                  Decrypting...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  Decrypt & Download
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileList;
