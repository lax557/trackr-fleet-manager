import { useState } from 'react';
import { FileRecord, VehicleDocType, DriverDocType } from '@/types';
import { vehicleDocTypeLabels, driverDocTypeLabels } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, ExternalLink, Download, File, Image, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface DocumentsCardProps {
  title: string;
  description?: string;
  scope: 'VEHICLE' | 'DRIVER';
  scopeId: string;
  documents: FileRecord[];
  docTypes: VehicleDocType[] | DriverDocType[];
  docTypeLabels: Record<string, string>;
  onUpload?: (docType: string, file: File) => void;
  onDelete?: (fileId: string) => void;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <Image className="h-4 w-4 text-blue-500" />;
  }
  return <File className="h-4 w-4 text-red-500" />;
}

export function DocumentsCard({
  title,
  description,
  scope,
  scopeId,
  documents,
  docTypes,
  docTypeLabels,
  onUpload,
  onDelete,
}: DocumentsCardProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedDocType || !selectedFile) {
      toast.error('Selecione um tipo de documento e um arquivo.');
      return;
    }

    // Check if document already exists for this type
    const existingDoc = documents.find(d => d.docType === selectedDocType);
    if (existingDoc) {
      toast.info(`Substituindo documento anterior: ${existingDoc.fileName}`);
    }

    if (onUpload) {
      onUpload(selectedDocType, selectedFile);
    }

    toast.success('Documento enviado com sucesso!');
    setUploadModalOpen(false);
    setSelectedDocType('');
    setSelectedFile(null);
  };

  const handleOpenFile = (fileUrl: string) => {
    // In a real app, this would open the actual file URL
    window.open(fileUrl, '_blank');
    toast.info('Abrindo documento...');
  };

  const handleDownload = (fileName: string, fileUrl: string) => {
    // In a real app, this would trigger a download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
    toast.info(`Download: ${fileName}`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload de Documento</DialogTitle>
                <DialogDescription>
                  Selecione o tipo de documento e faça o upload do arquivo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="docType">Tipo de Documento</Label>
                  <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {docTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {docTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selecionado: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpload} disabled={!selectedDocType || !selectedFile}>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum documento cadastrado</p>
            <p className="text-xs mt-1">Clique em "Upload" para adicionar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(doc.mimeType)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs shrink-0">
                        {docTypeLabels[doc.docType] || doc.docType}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm truncate mt-1">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(doc.uploadedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenFile(doc.fileUrl)}
                    title="Abrir em nova aba"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(doc.fileName, doc.fileUrl)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(doc.id)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
