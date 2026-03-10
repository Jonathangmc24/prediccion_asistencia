"use client";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [artistas, setArtistas] = useState<string[]>([]);
  const [recintos, setRecintos] = useState<string[]>([]);

  const [resultado, setResultado] = useState<number | null>(null);
  const [ocupacion, setOcupacion] = useState<number | null>(null);
  const [veredicto, setVeredicto] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Combobox artistas
  const [busqueda, setBusqueda] = useState("");
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Combobox recintos
  const [busquedaRecinto, setBusquedaRecinto] = useState("");
  const [dropdownRecintoAbierto, setDropdownRecintoAbierto] = useState(false);
  const comboboxRecintoRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    artista: "",
    lugar: "",
    capacidad_recinto: "",
    fecha: "",
    precio_minimo: "",
    precio_maximo: "",
    popularidad: "50",
    seguidores: "",
    oyentes_mensuales: "",
    seguidores_ig: "",
    seguidores_fb: "",
  });

  // Fetch artistas y recintos desde la API
  useEffect(() => {
    fetch("https://model-v3-vcc7.onrender.com/api/v1/opciones")
      .then((res) => res.json())
      .then((data) => {
        setArtistas(data.artistas ?? []);
        setRecintos(data.lugares ?? []);
      })
      .catch((err) => console.error(err));
  }, []);

  // Cerrar dropdown artistas al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar dropdown recintos al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (comboboxRecintoRef.current && !comboboxRecintoRef.current.contains(e.target as Node)) {
        setDropdownRecintoAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const artistasFiltrados = artistas.filter((a) =>
    a.toLowerCase().includes(busqueda.toLowerCase())
  );

  const recintosFiltrados = recintos.filter((r) =>
    r.toLowerCase().includes(busquedaRecinto.toLowerCase())
  );

  const seleccionarArtista = (artista: string) => {
    setFormData({ ...formData, artista });
    setBusqueda(artista);
    setDropdownAbierto(false);
  };

  const seleccionarRecinto = (recinto: string) => {
    setFormData({ ...formData, lugar: recinto });
    setBusquedaRecinto(recinto);
    setDropdownRecintoAbierto(false);
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setResultado(null);
      setOcupacion(null);
      setVeredicto(null);

      if (!formData.artista) {
        setError("Debes seleccionar un artista.");
        return;
      }

      if (!formData.capacidad_recinto) {
        setError("Debes ingresar la capacidad del recinto.");
        return;
      }

      setLoading(true);

      const precio_promedio =
        (Number(formData.precio_minimo) + Number(formData.precio_maximo)) / 2;

      const payload = {
        artista: formData.artista,
        lugar: formData.lugar,
        capacidad_maxima: Number(formData.capacidad_recinto),
        genero_principal: "pop",
        precio_promedio,
        popularidad_spotify: Number(formData.popularidad),
        seguidores_spotify: Number(formData.seguidores),
        oyentes_mensuales: Number(formData.oyentes_mensuales),
        seguidores_ig: Number(formData.seguidores_ig),
      };

      const response = await fetch(
        "https://model-v3-vcc7.onrender.com/api/v1/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Error en la API");
      }

      const data = await response.json();

      const asistencia = Number(data?.prediccion?.asistencia_estimada);
      const ocup = Number(data?.prediccion?.porcentaje_ocupacion);
      const ver = data?.prediccion?.veredicto_comercial;

      if (!Number.isNaN(asistencia)) {
        setResultado(asistencia);
        setOcupacion(!Number.isNaN(ocup) ? ocup : null);
        setVeredicto(ver ?? null);
      } else {
        setError("La API no devolvió una predicción válida.");
      }
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al hacer la predicción.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-purple-950 text-white p-6">
      <div className="w-full max-w-4xl bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-10 space-y-10 animate-fadeIn">

        <h1 className="text-3xl font-bold text-center text-purple-400">
          🔮 Predicción de Asistencia a Eventos
        </h1>

        {/* ===== ARTISTA ===== */}
        <div>
          <h2 className="text-xl font-semibold text-purple-300 mb-6">
            🎤 Detalles del Artista
          </h2>

          {/* Combobox artistas */}
          <label className="block text-sm text-white/70 mb-1">Nombre del Artista</label>
          <div ref={comboboxRef} className="relative mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar artista..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setFormData({ ...formData, artista: "" });
                  setDropdownAbierto(true);
                }}
                onFocus={() => setDropdownAbierto(true)}
                className="w-full p-3 pr-10 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-white/30"
              />
              <button
                type="button"
                onClick={() => setDropdownAbierto((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-purple-400 transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${dropdownAbierto ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {dropdownAbierto && (
              <div className="absolute z-50 mt-2 w-full rounded-xl bg-zinc-900 border border-white/10 shadow-2xl shadow-black/60 overflow-hidden">
                <ul className="max-h-60 overflow-y-auto divide-y divide-white/5 custom-scroll">
                  {artistasFiltrados.length > 0 ? (
                    artistasFiltrados.map((artista, index) => (
                      <li
                        key={index}
                        onClick={() => seleccionarArtista(artista)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-purple-600/20 hover:text-purple-300 ${
                          formData.artista === artista
                            ? "bg-purple-600/30 text-purple-300"
                            : "text-white/80"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-700/50 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                          {artista.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm">{artista}</span>
                        {formData.artista === artista && (
                          <svg className="w-4 h-4 ml-auto text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-4 text-sm text-white/30 text-center">
                      No se encontraron artistas
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Slider Popularidad */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-purple-300 mb-2">
              <span>Popularidad</span>
              <span className="font-bold text-purple-400">{formData.popularidad}</span>
            </div>
            <input
              type="range"
              name="popularidad"
              min="0"
              max="100"
              value={formData.popularidad}
              onChange={handleChange}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer slider-purple"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white/70 mb-1">Seguidores</label>
              <input
                type="number"
                name="seguidores"
                value={formData.seguidores}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Oyentes Mensuales</label>
              <input
                type="number"
                name="oyentes_mensuales"
                value={formData.oyentes_mensuales}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* ===== EVENTO ===== */}
        <div>
          <h2 className="text-xl font-semibold text-purple-300 mb-6">
            🏟️ Detalles del Evento
          </h2>

          {/* Combobox recintos */}
          <label className="block text-sm text-white/70 mb-1">Nombre del recinto</label>
          <div ref={comboboxRecintoRef} className="relative mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar recinto..."
                value={busquedaRecinto}
                onChange={(e) => {
                  setBusquedaRecinto(e.target.value);
                  setFormData({ ...formData, lugar: "" });
                  setDropdownRecintoAbierto(true);
                }}
                onFocus={() => setDropdownRecintoAbierto(true)}
                className="w-full p-3 pr-10 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-white/30"
              />
              <button
                type="button"
                onClick={() => setDropdownRecintoAbierto((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-purple-400 transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${dropdownRecintoAbierto ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {dropdownRecintoAbierto && (
              <div className="absolute z-50 mt-2 w-full rounded-xl bg-zinc-900 border border-white/10 shadow-2xl shadow-black/60 overflow-hidden">
                <ul className="max-h-60 overflow-y-auto divide-y divide-white/5 custom-scroll">
                  {recintosFiltrados.length > 0 ? (
                    recintosFiltrados.map((recinto, index) => (
                      <li
                        key={index}
                        onClick={() => seleccionarRecinto(recinto)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-purple-600/20 hover:text-purple-300 ${
                          formData.lugar === recinto
                            ? "bg-purple-600/30 text-purple-300"
                            : "text-white/80"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-700/50 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                          {recinto.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm">{recinto}</span>
                        {formData.lugar === recinto && (
                          <svg className="w-4 h-4 ml-auto text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-4 text-sm text-white/30 text-center">
                      No se encontraron recintos
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white/70 mb-1">Capacidad del recinto</label>
              <input
                type="number"
                name="capacidad_recinto"
                value={formData.capacidad_recinto}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Fecha del evento</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* ===== BOLETOS ===== */}
        <div>
          <h2 className="text-xl font-semibold text-purple-300 mb-6">
            🎟️ Boletos y Redes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white/70 mb-1">Precio Mínimo (MXN)</label>
              <input
                type="number"
                name="precio_minimo"
                value={formData.precio_minimo}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Precio Máximo (MXN)</label>
              <input
                type="number"
                name="precio_maximo"
                value={formData.precio_maximo}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Seguidores de Instagram</label>
              <input
                type="number"
                name="seguidores_ig"
                value={formData.seguidores_ig}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Seguidores de Facebook</label>
              <input
                type="number"
                name="seguidores_fb"
                value={formData.seguidores_fb}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* BOTÓN */}
        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 transition-all text-lg font-bold shadow-lg shadow-purple-500/40 hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? "Calculando..." : "Estimar Asistencia"}
        </button>

        {/* RESULTADO */}
        {resultado !== null && (
          <div className="mt-6 p-6 rounded-2xl bg-green-500/10 border border-green-500/30 text-center animate-fadeIn">
            <p className="text-sm uppercase tracking-widest text-green-300 mb-2">
              Asistencia Estimada
            </p>
            <p className="text-4xl font-extrabold text-green-400">
              {resultado.toLocaleString("es-MX")}
            </p>

            {ocupacion !== null && (
              <p className="text-green-200 mt-2">
                Ocupación: {(ocupacion * 100).toFixed(1)}%
              </p>
            )}

            {veredicto && (
              <p className="mt-2 text-xl font-bold text-purple-300">
                {veredicto}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 mt-4">{error}</div>
        )}
      </div>
    </div>
  );
}
