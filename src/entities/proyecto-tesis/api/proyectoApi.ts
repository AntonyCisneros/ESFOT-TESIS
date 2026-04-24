import { supabase } from "@shared/api/supabase";
import { ENV } from "@shared/config/env";
import type { CreateProyectoDto, ProyectoTesis, UpdateProyectoDto } from "../model/types";

const TABLE = "proyectos_tesis";

export const proyectoApi = {
  /** Obtiene todos los proyectos ordenados por fecha de creación */
  async getAll(): Promise<ProyectoTesis[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[proyectoApi.getAll]", error.message);
      throw new Error(error.message);
    }
    return data ?? [];
  },

  /** Obtiene un proyecto por su ID */
  async getById(id: string): Promise<ProyectoTesis> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /** Crea un nuevo proyecto de tesis */
  async create(dto: CreateProyectoDto): Promise<ProyectoTesis> {
    const payload: CreateProyectoDto = { ...dto };

    // Evita enviar strings vacios a columnas opcionales (ej. fecha/date).
    if (!payload.fecha_fin?.trim()) delete payload.fecha_fin;
    if (!payload.repositorio_github?.trim()) delete payload.repositorio_github;

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[proyectoApi.create]", error.message);
      throw new Error(error.message);
    }
    return data;
  },

  /** Actualiza un proyecto de tesis existente */
  async update(id: string, dto: UpdateProyectoDto): Promise<ProyectoTesis> {
    const payload: UpdateProyectoDto = { ...dto };

    if (payload.fecha_fin !== undefined && !payload.fecha_fin?.trim()) {
      delete payload.fecha_fin;
    }
    if (payload.repositorio_github !== undefined && !payload.repositorio_github?.trim()) {
      delete payload.repositorio_github;
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[proyectoApi.update]", error.message);
      throw new Error(error.message);
    }

    return data;
  },

  /** Elimina un proyecto de tesis existente */
  async delete(id: string): Promise<void> {
    console.log("[proyectoApi.delete]", {
      id,
      supabaseUrl: ENV.supabaseUrl,
      table: TABLE,
    });
    const { data, error } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", id)
      .select("id");

    console.log("[proyectoApi.delete.result]", { id, data, error });

    if (error) {
      console.error("[proyectoApi.delete]", error.message);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error(
        `No se eliminó ningún registro con id ${id}. Revisa que ese ID pertenezca al mismo proyecto de Supabase al que apunta la app.`
      );
    }
  },

  /** Busca proyectos por título o autor */
  async search(query: string): Promise<ProyectoTesis[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .or(`titulo.ilike.%${query}%,autores.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },
};