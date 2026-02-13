import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockContractTemplates } from '@/data/mockData';
import { ContractTemplate } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, MoreHorizontal, Edit, Copy, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export function ContractTemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ContractTemplate[]>(() => {
    const saved = localStorage.getItem('trackr_contract_templates');
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'createdAt') return new Date(value);
      return value;
    }) : [...mockContractTemplates];
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const currentUserRole = localStorage.getItem('trackr_user_role') || 'operations';

  const saveTemplates = (updated: ContractTemplate[]) => {
    setTemplates(updated);
    localStorage.setItem('trackr_contract_templates', JSON.stringify(updated));
  };

  const handleDuplicate = (template: ContractTemplate) => {
    const newTemplate: ContractTemplate = {
      ...template,
      id: `tpl_${Date.now()}`,
      name: `${template.name} (Cópia)`,
      version: 'v1.0',
      createdAt: new Date(),
    };
    saveTemplates([...templates, newTemplate]);
    toast.success('Modelo duplicado com sucesso!');
  };

  const handleDelete = () => {
    if (!deleteId) return;
    saveTemplates(templates.filter(t => t.id !== deleteId));
    setDeleteId(null);
    toast.success('Modelo excluído.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Modelos de Contrato</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie templates para geração automática de contratos
          </p>
        </div>
        <Button onClick={() => navigate('/rentals/templates/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Modelo
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {templates.filter(t => t.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Arquivados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {templates.filter(t => t.status === 'ARCHIVED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atualização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{template.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.version}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {template.status === 'ACTIVE' ? 'Ativo' : 'Arquivado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(template.createdAt, 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/rentals/templates/${template.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        {currentUserRole === 'admin' && (
                          <DropdownMenuItem
                            onClick={() => setDeleteId(template.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir modelo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este modelo de contrato? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ContractTemplatesPage;
