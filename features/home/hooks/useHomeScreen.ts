import { useCallback, useEffect, useMemo, useState } from "react";
import { getPedidos } from "../services/HomeScreenServices";
import Pedidos from "../types/Pedidos";

// show Mil / Millon
const formatAbbreviated = (value: number | string): string => {
  const number = typeof value === "string" ? parseFloat(value) : value;
  if (number >= 1_000_000) return `$${(number / 1_000_000).toFixed(0)}Mill`;
  if (number >= 1_000) return `$${(number / 1_000).toFixed(0)}Mil`;
  return `$ ${number.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
};

export function useHomeScreen() {
  const [pedidos, setPedidos] = useState<Pedidos[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartText, setChartText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getData = useCallback(() => {
    setLoading(true);
    setError(null);
    getPedidos()
      .then((data) => {
        setPedidos(data || []);
        
        if (data && data.length > 0) {
          const firstDate = data[0].fec_emis?.split("T")[0]; 
          if (firstDate) {
            const [year, month] = firstDate.split("-");
            const meses = [
              "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
              "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ];
            const mesNombre = meses[parseInt(month, 10)];
            setChartText(`Pedidos ${mesNombre} ${year}`);
          } else {
            setChartText("Pedidos");
          }
        } else {
          setChartText("Pedidos");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Ocurrió un error al cargar los datos...");
      })

      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  // Totals  by day + labels
  const totalsByDate = useMemo(() => {
    const grouped: Record<string, number> = pedidos.reduce(
      (acc, pedido) => {
        const date = pedido.fec_emis?.split("T")[0];
        const tot =Number(pedido.tot_neto || 0);
        if (date) acc[date] = (acc[date] || 0) + tot;
        return acc;
      },
      {} as Record<string, number>
    );
    // const dateText = pedidos.
    // console.log(dateText)
    // setChartText(`${chartText}`)

    return Object.entries(grouped)
      .map(([x, y]) => ({
        x,
        y: y || 0,
        label: formatAbbreviated(y || 0),
        dayLabel: x.split("-")[2],
      }))
      .sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());

  }, [pedidos]);


  // Labels and values for the chart
  const labels = totalsByDate.map((t) => t.dayLabel);
  const values = totalsByDate.map((t) => t.y);
  const dotLabels = totalsByDate.map((t) => t.label);
  // Totals
  const totalPedidos = pedidos.length;
  const totalNeto = pedidos.reduce(
    (acc, p) => acc + (Number(p.tot_neto) || 0),
    0
  );

  return {
    getData,
    pedidos,
    loading,
    error,
    totalsByDate,
    totalPedidos,
    totalNeto,
    labels,
    values,
    dotLabels,
    chartText,
  };
}
