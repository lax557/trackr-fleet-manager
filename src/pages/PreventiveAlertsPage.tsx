import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPreventiveAlerts, AlertStatus, PreventiveAlert } from '@/services/preventiveAlerts.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Bell, Search, AlertTriangle, AlertCircle, CheckCircle, Car, Filter, X } from 'lucide-react';

const statusConfig: Record<AlertStatus, { label: string; icon: any; className: string }> = {
  overdue: { label: 'Vencido', icon: AlertCircle, className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300' },
  near: { label: 'Próximo', icon: AlertTriangle, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300' },
  ok: { label: 'OK', icon: CheckCircle, className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300' },
};

export function PreventiveAlertsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'ALL'>('ALL');

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['preventive-alerts'],
    queryFn: fetchPreventiveAlerts,
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    let result = alerts;
    if (statusFilter !== 'ALL') result = result.filter(a => a.status === statusFilter);
    // Default: hide OK unless explicitly filtering for ALL
    if (statusFilter === 'ALL') result = result.filter(a => a.status !== 'ok');
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(a =>
        a.vehiclePlate?.toLowerCase().includes(s) ||
        a.vehicleCode?.toLowerCase().includes(s) ||
        a.vehicleModel.toLowerCase().includes(s) ||
        a.catalogItemName.toLowerCase().includes(s)
      );
    }
    return result;
  }, [alerts, statusFilter, search]);

  const overdueCount = alerts.filter(a => a.status === 'overdue').length;
  const nearCount = alerts.filter(a => a.status === 'near').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Manutenção Preventiva
          </h1>
          <p className="text-muted-foreground mt-1">Alertas baseados nos planos por modelo</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                <p className="text-sm text-muted-foreground">Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-amber-600">{nearCount}</p>
                <p className="text-sm text-muted-foreground">Próximos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Car className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{new Set(alerts.filter(a => a.status !== 'ok').map(a => a.vehicleId)).size}</p>
                <p className="text-sm text-muted-foreground">Veículos com alertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por placa, código, modelo, item..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Vencidos + Próximos</SelectItem>
            <SelectItem value="overdue">Apenas Vencidos</SelectItem>
            <SelectItem value="near">Apenas Próximos</SelectItem>
            <SelectItem value="ok">Apenas OK</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Odômetro Atual</TableHead>
                <TableHead className="text-right">Último (km)</TableHead>
                <TableHead className="text-right">KM Restante</TableHead>
                <TableHead className="text-right">Dias Restante</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="h-32 text-center text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  {statusFilter === 'ALL' ? 'Nenhum alerta pendente 🎉' : 'Nenhum alerta encontrado'}
                </TableCell></TableRow>
              ) : (
                filtered.map((a, i) => {
                  const cfg = statusConfig[a.status];
                  const Icon = cfg.icon;
                  return (
                    <TableRow key={`${a.vehicleId}-${a.catalogItemId}-${i}`}>
                      <TableCell>
                        <Badge variant="outline" className={cfg.className}>
                          <Icon className="h-3 w-3 mr-1" />{cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{a.vehiclePlate || a.vehicleCode || '—'}</TableCell>
                      <TableCell className="text-sm">{a.vehicleBrand} {a.vehicleModel}</TableCell>
                      <TableCell className="text-sm">{a.catalogItemName}</TableCell>
                      <TableCell className="text-right text-sm">{a.currentOdometer.toLocaleString()} km</TableCell>
                      <TableCell className="text-right text-sm">{a.lastOdometer != null ? `${a.lastOdometer.toLocaleString()} km` : '—'}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {a.kmRemaining != null ? (
                          <span className={a.kmRemaining <= 0 ? 'text-red-600' : a.kmRemaining <= (a.alertBeforeKm || 500) ? 'text-amber-600' : ''}>
                            {a.kmRemaining.toLocaleString()} km
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {a.daysRemaining != null ? (
                          <span className={a.daysRemaining <= 0 ? 'text-red-600' : a.daysRemaining <= 7 ? 'text-amber-600' : ''}>
                            {a.daysRemaining} dias
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/vehicles/${a.vehicleId}`)}>
                          <Car className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default PreventiveAlertsPage;
