import api from "@/lib/axios";

export const getPedidos = async (user?: string) => {
  const response = await api.get("orders/all");

  return response.data;
};
