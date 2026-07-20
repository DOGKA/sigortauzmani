import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type Map, type MapLayerMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  RISK_COLORS,
  RISK_LABELS,
  type ProvinceRisk,
  type RiskKey,
  type RiskLevel,
  provinceRiskByName,
  stars,
} from "../data/provinceRisks";
import "./RiskMapPage.css";

const GEOJSON_URL = "/data/turkey-provinces.geojson";

const RISK_KEYS: RiskKey[] = ["earthquake", "flood", "hail", "theft"];

interface TooltipState {
  x: number;
  y: number;
  province: ProvinceRisk;
}

function riskColorExpression(activeRisk: RiskKey): maplibregl.ExpressionSpecification {
  const match: unknown[] = ["match", ["get", "name"]];
  for (const [name, entry] of Object.entries(provinceRiskByName)) {
    match.push(name, RISK_COLORS[entry.risk[activeRisk]]);
  }
  match.push("#cbd5e1");
  return match as maplibregl.ExpressionSpecification;
}

export default function RiskMapPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [activeRisk, setActiveRisk] = useState<RiskKey>("earthquake");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [ready, setReady] = useState(false);
  const activeRiskRef = useRef(activeRisk);
  activeRiskRef.current = activeRisk;

  const legendLevels = useMemo(
    () => ([1, 2, 3, 4, 5] as RiskLevel[]).map((level) => ({
      level,
      color: RISK_COLORS[level],
    })),
    [],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: "background",
            type: "background",
            paint: { "background-color": "#eef3fb" },
          },
        ],
      },
      center: [35.2, 39.0],
      zoom: 4.6,
      minZoom: 3.8,
      maxZoom: 8,
      attributionControl: false,
      cooperativeGestures: true,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    const fitTurkey = () => {
      map.fitBounds(
        [
          [25.5, 35.7],
          [45.0, 42.3],
        ],
        {
          padding: { top: 40, bottom: 40, left: 32, right: 32 },
          duration: 0,
          maxZoom: 5.5,
        },
      );
    };

    map.on("load", async () => {
      const res = await fetch(GEOJSON_URL);
      const geojson = await res.json();

      map.addSource("provinces", {
        type: "geojson",
        data: geojson,
        promoteId: "name",
      });

      map.addLayer({
        id: "provinces-fill",
        type: "fill",
        source: "provinces",
        paint: {
          "fill-color": riskColorExpression(activeRiskRef.current),
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.95,
            0.78,
          ],
        },
      });

      map.addLayer({
        id: "provinces-outline",
        type: "line",
        source: "provinces",
        paint: {
          "line-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#0b48c8",
            "rgba(16, 28, 48, 0.35)",
          ],
          "line-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            2.2,
            0.7,
          ],
        },
      });

      let hoveredId: string | number | null = null;

      const onMove = (e: MapLayerMouseEvent) => {
        const feature = e.features?.[0];
        if (!feature || feature.id == null) {
          setTooltip(null);
          return;
        }

        if (hoveredId !== null && hoveredId !== feature.id) {
          map.setFeatureState({ source: "provinces", id: hoveredId }, { hover: false });
        }
        hoveredId = feature.id;
        map.setFeatureState({ source: "provinces", id: feature.id }, { hover: true });
        map.getCanvas().style.cursor = "pointer";

        const name = String(feature.properties?.name ?? "");
        const province = provinceRiskByName[name];
        if (!province) {
          setTooltip(null);
          return;
        }

        setTooltip({
          x: e.point.x,
          y: e.point.y,
          province,
        });
      };

      const onLeave = () => {
        if (hoveredId !== null) {
          map.setFeatureState({ source: "provinces", id: hoveredId }, { hover: false });
          hoveredId = null;
        }
        map.getCanvas().style.cursor = "";
        setTooltip(null);
      };

      map.on("mousemove", "provinces-fill", onMove);
      map.on("mouseleave", "provinces-fill", onLeave);
      fitTurkey();
      setReady(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getLayer("provinces-fill")) return;
    map.setPaintProperty("provinces-fill", "fill-color", riskColorExpression(activeRisk));
  }, [activeRisk, ready]);

  return (
    <main className="risk-map">
      <div className="risk-map__bg" aria-hidden="true">
        <div className="risk-map__blob risk-map__blob--1" />
        <div className="risk-map__blob risk-map__blob--2" />
      </div>

      <div className="risk-map__inner">
        <header className="risk-map__header">
          <p className="risk-map__eyebrow">Türkiye Risk Haritası</p>
          <h1 className="risk-map__title">İllere göre teminat risk görünümü</h1>
          <p className="risk-map__subtitle">
            Bir risk türü seçin, illerin üzerine gelerek detaylı skoru inceleyin.
            Deprem skorları AFAD DD-2 il merkezi tehlike özetine; sel, dolu ve
            araç hırsızlığı skorları yayınlanmış afet / Emniyet yoğunluk
            verilerine dayanır. Mahalle bazlı resmi değerler için AFAD ve DSİ
            haritaları esas alınmalıdır.
          </p>
        </header>

        <div className="risk-map__toolbar" role="tablist" aria-label="Risk türü">
          {RISK_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeRisk === key}
              className={`risk-map__tab ${activeRisk === key ? "risk-map__tab--active" : ""}`}
              onClick={() => setActiveRisk(key)}
            >
              {RISK_LABELS[key]}
            </button>
          ))}
        </div>

        <section className="risk-map__stage">
          <div className="risk-map__canvas-wrap">
            <div ref={containerRef} className="risk-map__canvas" />
            {tooltip && (
              <div
                className="risk-map__tooltip"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                }}
              >
                <strong className="risk-map__tooltip-title">
                  {tooltip.province.name.toLocaleUpperCase("tr-TR")}
                </strong>
                <ul className="risk-map__tooltip-list">
                  {RISK_KEYS.map((key) => (
                    <li key={key}>
                      <span>{RISK_LABELS[key]}</span>
                      <span
                        className="risk-map__stars"
                        style={{ color: RISK_COLORS[tooltip.province.risk[key]] }}
                        aria-label={`${tooltip.province.risk[key]} / 5`}
                      >
                        {stars(tooltip.province.risk[key])}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="risk-map__legend">
            <h2 className="risk-map__legend-title">{RISK_LABELS[activeRisk]} riski</h2>
            <ol className="risk-map__legend-list">
              {legendLevels.map(({ level, color }) => (
                <li key={level}>
                  <span className="risk-map__swatch" style={{ background: color }} />
                  <span>
                    {level} — {stars(level)}
                  </span>
                </li>
              ))}
            </ol>
            <p className="risk-map__legend-note">
              1 = Düşük risk · 5 = Yüksek risk
            </p>
            <p className="risk-map__sources">
              Kaynak:{" "}
              <a
                href="https://tdth.afad.gov.tr/"
                target="_blank"
                rel="noreferrer"
              >
                AFAD TDTH
              </a>
              , DSİ / afet sel çalışmaları, Emniyet hırsızlık yoğunluğu.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}
