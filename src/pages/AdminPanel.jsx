import { useState, useRef } from "react";
import { useAuth } from "../App";
import { useAdminAnimals } from "../hooks/useAnimals";
import { supabase } from "../lib/supabase";
import styles from "./AdminPanel.module.css";

const EMPTY_FORM = {
  name: "",
  slug: "",
  type: "cao",
  born_year: "",
  size: "medio",
  gender: "Macho",
  description: "",
  status: "disponivel",
  fiv: "",
};

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminPanel() {
  const { profile } = useAuth();
  const { animals, loading, refetch } = useAdminAnimals();
  const [view, setView] = useState("list"); // 'list' | 'form' | 'requests'
  const [editing, setEditing] = useState(null); // animal obj or null
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [imgFiles, setImgFiles] = useState([]);
  const [imgPreviews, setImgPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const fileRef = useRef();

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImgFiles([]);
    setImgPreviews([]);
    setExistingImages([]);
    setMsg("");
    setView("form");
  }

  function openEdit(animal) {
    setEditing(animal);
    setForm({
      name: animal.name || "",
      slug: animal.slug || "",
      type: animal.type || "cao",
      born_year: animal.born_year || "",
      size: animal.size || "medio",
      gender: animal.gender || "Macho",
      description: animal.description || "",
      status: animal.status || "disponivel",
      fiv: animal.fiv || "",
    });
    setImgFiles([]);
    setImgPreviews([]);
    setExistingImages(animal.images || []);
    setMsg("");
    setView("form");
  }

  async function loadRequests() {
    setReqLoading(true);
    const { data } = await supabase
      .from("adoption_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setRequests(data || []);
    setReqLoading(false);
    setView("requests");
  }

  function handleField(k, v) {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "name" && !editing) next.slug = slugify(v);
      return next;
    });
  }

  function handleImages(e) {
    const files = Array.from(e.target.files);
    setImgFiles((prev) => [...prev, ...files]);
    setImgPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  }

  async function uploadImages(animalId) {
    const urls = [];
    for (const file of imgFiles) {
      const ext = file.name.split(".").pop();
      const path = `${animalId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("animal-photos")
        .upload(path, file, { upsert: true });
      if (!error) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("animal-photos").getPublicUrl(path);
        urls.push(publicUrl);
      }
    }
    return urls;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || !form.slug) {
      setMsg("Nome e slug são obrigatórios.");
      return;
    }
    setSaving(true);
    setMsg("");

    try {
      let imageUrls = editing ? [...existingImages] : [];

      const payload = {
        ...form,
        fiv: form.fiv || null,
        size: form.type === "gato" ? null : form.size,
      };

      if (editing) {
        if (imgFiles.length > 0) {
          const newUrls = await uploadImages(editing.id);
          imageUrls = [...imageUrls, ...newUrls];
        }
        const { error } = await supabase
          .from("animals")
          .update({ ...payload, images: imageUrls })
          .eq("id", editing.id);
        if (error) throw error;
        setMsg("✅ Animal atualizado!");
      } else {
        const { data, error } = await supabase
          .from("animals")
          .insert({ ...payload, images: [] })
          .select()
          .single();
        if (error) throw error;

        if (imgFiles.length > 0) {
          imageUrls = await uploadImages(data.id);
          await supabase
            .from("animals")
            .update({ images: imageUrls })
            .eq("id", data.id);
        }
        setMsg("✅ Animal adicionado!");
      }

      await refetch();
      setTimeout(() => {
        setView("list");
        setMsg("");
      }, 1200);
    } catch (err) {
      setMsg("❌ Erro: " + (err.message || "tenta novamente"));
    }
    setSaving(false);
  }

  async function handleDelete(animal) {
    if (!window.confirm(`Apagar "${animal.name}" permanentemente?`)) return;
    await supabase.from("animals").delete().eq("id", animal.id);
    await refetch();
  }

  async function handleStatus(animal, status) {
    await supabase.from("animals").update({ status }).eq("id", animal.id);
    await refetch();
  }

  async function updateRequest(id, status) {
    await supabase.from("adoption_requests").update({ status }).eq("id", id);
    setRequests((r) =>
      r.map((req) => (req.id === id ? { ...req, status } : req)),
    );
  }

  const isAdmin = profile?.role === "admin";
  const statusCount = { disponivel: 0, reservado: 0, adotado: 0 };
  animals.forEach((a) => {
    if (statusCount[a.status] !== undefined) statusCount[a.status]++;
  });

  // ── FORM VIEW ──
  if (view === "form")
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.topBar}>
            <button className={styles.backBtn} onClick={() => setView("list")}>
              ← Voltar à lista
            </button>
            <h1>{editing ? `Editar: ${editing.name}` : "Adicionar animal"}</h1>
          </div>

          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.col}>
                <div className={styles.group}>
                  <label>Nome *</label>
                  <input
                    value={form.name}
                    onChange={(e) => handleField("name", e.target.value)}
                    placeholder="ex: Acordeon"
                    required
                  />
                </div>

                <div className={styles.group}>
                  <label>
                    Slug{" "}
                    <span className={styles.hint}>
                      (gerado automaticamente)
                    </span>
                  </label>
                  <input
                    value={form.slug}
                    readOnly
                    style={{
                      opacity: 0.5,
                      cursor: "not-allowed",
                      background: "var(--border)",
                    }}
                  />
                </div>
                <div className={styles.row2}>
                  <div className={styles.group}>
                    <label>Tipo</label>
                    <select
                      value={form.type}
                      onChange={(e) => handleField("type", e.target.value)}
                    >
                      <option value="cao">🐶 Cão</option>
                      <option value="gato">🐱 Gato</option>
                    </select>
                  </div>
                  <div className={styles.group}>
                    <label>Género</label>
                    <select
                      value={form.gender}
                      onChange={(e) => handleField("gender", e.target.value)}
                    >
                      <option value="Macho">Macho</option>
                      <option value="Femea">Fêmea</option>
                    </select>
                  </div>
                </div>
                <div className={styles.row2}>
                  <div className={styles.group}>
                    <label>Tamanho</label>
                    <select
                      value={form.size}
                      onChange={(e) => handleField("size", e.target.value)}
                      disabled={form.type === "gato"}
                      style={form.type === "gato" ? { opacity: 0.35 } : {}}
                    >
                      <option value="pequeno">Pequeno</option>
                      <option value="medio">Médio</option>
                      <option value="grande">Grande</option>
                    </select>
                  </div>
                  <div className={styles.group}>
                    <label>Ano de nascimento</label>
                    <input
                      value={form.born_year}
                      onChange={(e) => handleField("born_year", e.target.value)}
                      placeholder="ex: 2019 ou Indeterminada"
                    />
                  </div>
                </div>
                {form.type === "gato" && (
                  <div className={styles.group}>
                    <label>FIV</label>
                    <select
                      value={form.fiv}
                      onChange={(e) => handleField("fiv", e.target.value)}
                    >
                      <option value="">Desconhecido</option>
                      <option value="negativo">FIV −</option>
                      <option value="positivo">FIV +</option>
                    </select>
                  </div>
                )}
                <div className={styles.group}>
                  <label>Estado</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleField("status", e.target.value)}
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="reservado">Reservado</option>
                    <option value="adotado">Adotado</option>
                  </select>
                </div>
              </div>

              <div className={styles.col}>
                <div className={styles.group} style={{ flex: 1 }}>
                  <label>Descrição</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleField("description", e.target.value)}
                    placeholder="Conta a história deste animal…"
                    rows={7}
                  />
                </div>
                <div className={styles.group}>
                  <label>Fotos</label>
                  <input
                    type="file"
                    ref={fileRef}
                    multiple
                    accept="image/*"
                    onChange={handleImages}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className={styles.uploadBtn}
                    onClick={() => fileRef.current.click()}
                  >
                    📷 Escolher fotos
                  </button>
                  {(existingImages.length > 0 || imgPreviews.length > 0) && (
                    <div className={styles.previews}>
                      {existingImages.map((src, i) => (
                        <div
                          key={`existing-${i}`}
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
                        >
                          <img src={src} alt={`foto ${i}`} />
                          <button
                            type="button"
                            title="Remover foto"
                            onClick={() =>
                              setExistingImages((p) =>
                                p.filter((_, j) => j !== i),
                              )
                            }
                            style={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              background: "rgba(44,42,40,.8)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              width: 20,
                              height: 20,
                              fontSize: 10,
                              cursor: "pointer",
                              lineHeight: "20px",
                              textAlign: "center",
                              padding: 0,
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {imgPreviews.map((src, i) => (
                        <div
                          key={`new-${i}`}
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
                        >
                          <img src={src} alt={`nova foto ${i}`} />
                          <button
                            type="button"
                            title="Remover foto"
                            onClick={() => {
                              setImgPreviews((p) =>
                                p.filter((_, j) => j !== i),
                              );
                              setImgFiles((f) => f.filter((_, j) => j !== i));
                            }}
                            style={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              background: "rgba(44,42,40,.8)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              width: 20,
                              height: 20,
                              fontSize: 10,
                              cursor: "pointer",
                              lineHeight: "20px",
                              textAlign: "center",
                              padding: 0,
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {msg && <p className={styles.msg}>{msg}</p>}
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setView("list")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={saving}
              >
                {saving
                  ? "A guardar…"
                  : editing
                    ? "Guardar alterações"
                    : "Adicionar animal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );

  // ── REQUESTS VIEW ──
  if (view === "requests")
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.topBar}>
            <button className={styles.backBtn} onClick={() => setView("list")}>
              ← Voltar
            </button>
            <h1>Pedidos de Adoção</h1>
          </div>
          {reqLoading ? (
            <p>A carregar…</p>
          ) : requests.length === 0 ? (
            <p style={{ color: "var(--mid)" }}>Nenhum pedido ainda.</p>
          ) : (
            <div className={styles.requestsList}>
              {requests.map((r) => (
                <div key={r.id} className={styles.requestCard}>
                  <div className={styles.reqTop}>
                    <div>
                      <strong>{r.name}</strong>
                      <span
                        className={`${styles.reqStatus} ${styles["req_" + r.status]}`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <span className={styles.reqAnimal}>→ {r.animal_name}</span>
                  </div>
                  <div className={styles.reqMeta}>
                    <a href={`tel:${r.phone}`}>{r.phone}</a>
                    <a href={`mailto:${r.email}`}>{r.email}</a>
                    <span>
                      {new Date(r.created_at).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                  {r.message && <p className={styles.reqMsg}>"{r.message}"</p>}
                  <div className={styles.reqActions}>
                    <button
                      onClick={() => updateRequest(r.id, "contactado")}
                      className={styles.reqBtn}
                    >
                      Contactado
                    </button>
                    <button
                      onClick={() => updateRequest(r.id, "aprovado")}
                      className={`${styles.reqBtn} ${styles.reqApprove}`}
                    >
                      Aprovado
                    </button>
                    <button
                      onClick={() => updateRequest(r.id, "recusado")}
                      className={`${styles.reqBtn} ${styles.reqReject}`}
                    >
                      Recusado
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );

  // ── LIST VIEW ──
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <h1>Painel — {profile?.name || profile?.email}</h1>
          <div className={styles.topActions}>
            <button className={styles.reqsBtn} onClick={loadRequests}>
              📋 Pedidos de adoção
            </button>
            <button className={styles.addBtn} onClick={openAdd}>
              + Adicionar animal
            </button>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statN}>{statusCount.disponivel}</span>
            <span>Disponíveis</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statN} style={{ color: "var(--amber)" }}>
              {statusCount.reservado}
            </span>
            <span>Reservados</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statN} style={{ color: "var(--green)" }}>
              {statusCount.adotado}
            </span>
            <span>Adotados</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statN}>{animals.length}</span>
            <span>Total</span>
          </div>
        </div>

        {loading ? (
          <p>A carregar…</p>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Animal</span>
              <span>Tipo</span>
              <span>Estado</span>
              <span>Ações</span>
            </div>
            {animals.map((a) => (
              <div key={a.id} className={styles.tableRow}>
                <div className={styles.animalCell}>
                  <div className={styles.thumb}>
                    {a.images?.[0] || a.wix_img_url ? (
                      <img src={a.images?.[0] || a.wix_img_url} alt={a.name} />
                    ) : (
                      <span>🐾</span>
                    )}
                  </div>
                  <div>
                    <strong>{a.name}</strong>
                    <span className={styles.slug}>/animal/{a.slug}</span>
                  </div>
                </div>
                <span>
                  {a.type === "cao"
                    ? "🐶 Cão"
                    : a.type === "gato"
                      ? "🐱 Gato"
                      : "—"}
                </span>
                <span>
                  <select
                    className={`${styles.statusSelect} ${styles["s_" + a.status]}`}
                    value={a.status}
                    onChange={(e) => handleStatus(a, e.target.value)}
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="reservado">Reservado</option>
                    <option value="adotado">Adotado</option>
                  </select>
                </span>
                <div className={styles.rowActions}>
                  <button
                    onClick={() => openEdit(a)}
                    className={styles.editBtn}
                  >
                    Editar
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(a)}
                      className={styles.deleteBtn}
                    >
                      Apagar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
