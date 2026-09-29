import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import {
  actualizarEstadoLead,
  obtenerLeads
} from "../services/leads-api";
import type {
  EstadoGestionLead,
  FiltrosLeads
} from "../types/lead";

export function useLeads(
  filtros: FiltrosLeads
) {
  return useQuery({
    queryKey: [
      "leads",
      filtros.estado,
      filtros.buscar
    ],
    queryFn: ({ signal }) =>
      obtenerLeads(filtros, signal),
    placeholderData: keepPreviousData,
    refetchInterval: 5_000
  });
}

type CambiarEstadoParametros = {
  id: string;
  estadoGestion: EstadoGestionLead;
};

export function useCambiarEstadoLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      parametros: CambiarEstadoParametros
    ) =>
      actualizarEstadoLead(
        parametros.id,
        parametros.estadoGestion
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["leads"]
      });
    }
  });
}