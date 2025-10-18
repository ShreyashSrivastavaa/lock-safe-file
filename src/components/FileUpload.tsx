import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Lock } from "lucide-react";
import { toast } from "sonner";
import { encryptFile, readFileAsArrayBuffer } from "@/lib/encryption";

interface FileUploadProps {
  onFileUploaded: () => void;
  userId: string;
}

const FileUpload = ({ onFileUploaded, userId }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !password || !userId) {
      toast.error("Please select a file and enter a password");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setUploading(true);

    try {
      // Read file as ArrayBuffer
      const fileData = await readFileAsArrayBuffer(file);

      // Encrypt the file
      const { encryptedData, salt, iv } = await encryptFile(fileData, password);

      // Store encrypted file in database
      const { error } = await supabase.from("encrypted_files").insert({
        user_id: userId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || "application/octet-stream",
        encrypted_data: encryptedData,
        encryption_salt: salt,
        encryption_iv: iv,
        is_locked: true,
      });

      if (error) throw error;

      toast.success("File encrypted and uploaded successfully!");
      setFile(null);
      setPassword("");
      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      onFileUploaded();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file-upload">Select File</Label>
        <Input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          required
          disabled={uploading}
        />
        {file && (
          <p className="text-xs text-muted-foreground">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="encryption-password">Encryption Password</Label>
        <Input
          id="encryption-password"
          type="password"
          placeholder="Enter a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          disabled={uploading}
        />
        <p className="text-xs text-muted-foreground">
          Remember this password - you'll need it to decrypt the file
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={uploading}>
        {uploading ? (
          <>
            <Lock className="w-4 h-4 mr-2 animate-pulse" />
            Encrypting & Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Encrypt & Upload
          </>
        )}
      </Button>
    </form>
  );
};

export default FileUpload;
