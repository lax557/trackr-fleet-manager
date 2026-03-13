import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } =
      await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Check role: only manager/admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, company_id")
      .eq("user_id", userId)
      .single();

    if (
      !profile ||
      !["manager", "admin"].includes(profile.role)
    ) {
      return new Response(
        JSON.stringify({ error: "Permissão insuficiente" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    const { entity, format, dateFrom, dateTo, status } = body as {
      entity: string;
      format: string;
      dateFrom?: string;
      dateTo?: string;
      status?: string;
    };

    if (!entity || !format) {
      return new Response(
        JSON.stringify({ error: "Parâmetros entity e format são obrigatórios" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!["csv", "xlsx"].includes(format)) {
      return new Response(
        JSON.stringify({ error: "Formato deve ser csv ou xlsx" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let rows: Record<string, unknown>[] = [];
    let columns: string[] = [];
    let fileName = "";

    // ─── Vehicles ───
    if (entity === "vehicles") {
      const { data, error } = await supabase
        .from("vehicles")
        .select(
          "vehicle_code, plate, brand, model, version, year_mfg, year_model, category, color, status, odometer, vin, renavam, owner_name, created_at, delivered_at"
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;

      columns = [
        "Código",
        "Placa",
        "Marca",
        "Modelo",
        "Versão",
        "Ano Fab",
        "Ano Mod",
        "Categoria",
        "Cor",
        "Status",
        "Odômetro (km)",
        "Chassi",
        "RENAVAM",
        "Proprietário",
        "Cadastrado em",
        "Entregue em",
      ];

      const statusLabels: Record<string, string> = {
        available: "Disponível",
        rented: "Alugado",
        maintenance: "Manutenção",
        incident: "Sinistro",
        for_sale: "Para Venda",
        backlog: "Em Liberação",
      };

      rows = (data || []).map((v: any) => ({
        Código: v.vehicle_code || "",
        Placa: v.plate || "",
        Marca: v.brand,
        Modelo: v.model,
        Versão: v.version || "",
        "Ano Fab": v.year_mfg || "",
        "Ano Mod": v.year_model || "",
        Categoria: v.category,
        Cor: v.color || "",
        Status: statusLabels[v.status] || v.status,
        "Odômetro (km)": v.odometer || 0,
        Chassi: v.vin || "",
        RENAVAM: v.renavam || "",
        Proprietário: v.owner_name || "",
        "Cadastrado em": v.created_at
          ? new Date(v.created_at).toLocaleDateString("pt-BR")
          : "",
        "Entregue em": v.delivered_at
          ? new Date(v.delivered_at).toLocaleDateString("pt-BR")
          : "",
      }));
      fileName = "veiculos";
    }

    // ─── Maintenance Orders ───
    else if (entity === "maintenance") {
      let q = supabase
        .from("maintenance_orders")
        .select(
          "*, vehicles(plate, brand, model, vehicle_code), suppliers(name)"
        )
        .order("opened_at", { ascending: false });

      if (dateFrom) q = q.gte("opened_at", dateFrom);
      if (dateTo) q = q.lte("opened_at", dateTo + "T23:59:59");
      if (status && status !== "ALL") q = q.eq("status", status);

      const { data, error } = await q;
      if (error) throw error;

      const statusLabels: Record<string, string> = {
        open: "Aberta",
        in_progress: "Em Execução",
        done: "Finalizada",
        cancelled: "Cancelada",
      };
      const typeLabels: Record<string, string> = {
        preventive: "Preventiva",
        corrective: "Corretiva",
      };

      columns = [
        "Veículo",
        "Placa",
        "Tipo",
        "Área",
        "Status",
        "Data Abertura",
        "Odômetro (km)",
        "Fornecedor",
        "Peças (R$)",
        "Mão de Obra (R$)",
        "Total (R$)",
        "Observações",
      ];

      rows = (data || []).map((m: any) => ({
        Veículo: m.vehicles
          ? `${m.vehicles.brand} ${m.vehicles.model}`
          : "",
        Placa: m.vehicles?.plate || m.vehicles?.vehicle_code || "",
        Tipo: typeLabels[m.type] || m.type,
        Área: m.service_area,
        Status: statusLabels[m.status] || m.status,
        "Data Abertura": m.opened_at
          ? new Date(m.opened_at).toLocaleDateString("pt-BR")
          : "",
        "Odômetro (km)": m.odometer_at_open || "",
        Fornecedor: m.suppliers?.name || m.supplier_name || "",
        "Peças (R$)": m.parts_cost || 0,
        "Mão de Obra (R$)": m.labor_cost || 0,
        "Total (R$)": m.total_cost || 0,
        Observações: m.notes || "",
      }));
      fileName = "manutencoes";
    }

    // ─── Rentals (active contracts) ───
    else if (entity === "contracts") {
      let q = supabase
        .from("rentals")
        .select(
          "*, vehicles(plate, brand, model, vehicle_code), drivers(full_name, cpf, phone)"
        )
        .order("start_date", { ascending: false });

      if (status && status !== "ALL") {
        q = q.eq("status", status);
      } else {
        q = q.in("status", ["active", "awaiting_signature"]);
      }
      if (dateFrom) q = q.gte("start_date", dateFrom);
      if (dateTo) q = q.lte("start_date", dateTo);

      const { data, error } = await q;
      if (error) throw error;

      const statusLabels: Record<string, string> = {
        draft: "Rascunho",
        awaiting_signature: "Aguardando Assinatura",
        active: "Ativo",
        ended: "Encerrado",
        cancelled: "Cancelado",
      };

      columns = [
        "Veículo",
        "Placa",
        "Motorista",
        "CPF",
        "Telefone",
        "Status",
        "Início",
        "Fim",
        "Valor Semanal (R$)",
        "Caução (R$)",
        "Observações",
      ];

      rows = (data || []).map((r: any) => ({
        Veículo: r.vehicles
          ? `${r.vehicles.brand} ${r.vehicles.model}`
          : "",
        Placa: r.vehicles?.plate || r.vehicles?.vehicle_code || "",
        Motorista: r.drivers?.full_name || "",
        CPF: r.drivers?.cpf || "",
        Telefone: r.drivers?.phone || "",
        Status: statusLabels[r.status] || r.status,
        Início: r.start_date
          ? new Date(r.start_date).toLocaleDateString("pt-BR")
          : "",
        Fim: r.end_date
          ? new Date(r.end_date).toLocaleDateString("pt-BR")
          : "",
        "Valor Semanal (R$)": r.weekly_rate || 0,
        "Caução (R$)": r.deposit || 0,
        Observações: r.notes || "",
      }));
      fileName = "contratos";
    }

    // ─── Fines ───
    else if (entity === "fines") {
      let q = supabase
        .from("fines")
        .select(
          "*, vehicles(plate, brand, model, vehicle_code), drivers(full_name)"
        )
        .order("occurred_at", { ascending: false });

      if (dateFrom) q = q.gte("occurred_at", dateFrom);
      if (dateTo) q = q.lte("occurred_at", dateTo);
      if (status && status !== "ALL") q = q.eq("status", status);

      const { data, error } = await q;
      if (error) throw error;

      const statusLabels: Record<string, string> = {
        open: "Aberta",
        nearing_due: "Próxima do vencimento",
        overdue: "Vencida",
        paid: "Paga",
        disputed: "Contestada",
        cancelled: "Cancelada",
      };

      columns = [
        "Veículo",
        "Placa",
        "Motorista",
        "Data",
        "Infração",
        "Gravidade",
        "Pontos",
        "Valor (R$)",
        "Status",
        "Vencimento",
        "Observações",
      ];

      rows = (data || []).map((f: any) => ({
        Veículo: f.vehicles
          ? `${f.vehicles.brand} ${f.vehicles.model}`
          : "",
        Placa: f.vehicles?.plate || f.vehicles?.vehicle_code || "",
        Motorista: f.drivers?.full_name || "",
        Data: f.occurred_at
          ? new Date(f.occurred_at).toLocaleDateString("pt-BR")
          : "",
        Infração: f.infraction || "",
        Gravidade: f.severity || "",
        Pontos: f.points || "",
        "Valor (R$)": f.amount || 0,
        Status: statusLabels[f.status] || f.status,
        Vencimento: f.due_date
          ? new Date(f.due_date).toLocaleDateString("pt-BR")
          : "",
        Observações: f.notes || "",
      }));
      fileName = "multas";
    } else {
      return new Response(
        JSON.stringify({ error: "Entidade inválida" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate file
    const ws = XLSX.utils.json_to_sheet(rows, { header: columns });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados");

    if (format === "csv") {
      const csv = XLSX.utils.sheet_to_csv(ws);
      return new Response(csv, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${fileName}.csv"`,
        },
      });
    }

    // XLSX
    const xlsxBuf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new Response(xlsxBuf, {
      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Erro interno",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
