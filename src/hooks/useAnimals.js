import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAnimals(filters = {}) {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      let query = supabase
        .from("animals")
        .select("*")
        .eq("status", "disponivel")
        .order("name");

      if (filters.type && filters.type !== "todos")
        query = query.eq("type", filters.type);
      if (filters.size && filters.size !== "todos")
        query = query.eq("size", filters.size);
      if (filters.fiv && filters.fiv !== "todos")
        query = query.eq("fiv", filters.fiv);
      if (filters.search) query = query.ilike("name", `%${filters.search}%`);

      const { data, error } = await query;
      if (error) setError(error);
      else setAnimals(data || []);
      setLoading(false);
    }
    fetch();
  }, [filters.type, filters.size, filters.search]);

  return { animals, loading, error };
}

export function useAnimal(slug) {
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    async function fetch() {
      const { data, error } = await supabase
        .from("animals")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) setError(error);
      else setAnimal(data);
      setLoading(false);
    }
    fetch();
  }, [slug]);

  return { animal, loading, error };
}

export function useAdminAnimals() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    setLoading(true);
    const { data } = await supabase
      .from("animals")
      .select("*")
      .order("name", { ascending: true });
    setAnimals(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  return { animals, loading, refetch: fetchAll };
}
