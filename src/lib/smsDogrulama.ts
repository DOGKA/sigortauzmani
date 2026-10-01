/** `/api/sms/*` istemcisi. Hata metinleri sunucudan geliyor. */

export type KodGonderSonucu =
  | { durum: "dogrulandi" }
  | { durum: "gonderildi"; telefon: string; sureSaniye: number; tekrarSaniye: number }
  | { durum: "hata"; mesaj: string; bekleSaniye: number | null };

export type KodDogrulaSonucu =
  | { durum: "dogrulandi" }
  | { durum: "hata"; mesaj: string; yeniKodGerekli: boolean };

async function post(path: string, body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = ((await response.json().catch(() => null)) ?? {}) as Record<string, unknown>;
  return { ok: response.ok, data };
}

function mesajOf(data: Record<string, unknown>, varsayilan: string): string {
  return typeof data.error === "string" && data.error ? data.error : varsayilan;
}

export async function kodGonder(phone: string, varsayilanHata: string): Promise<KodGonderSonucu> {
  try {
    const { ok, data } = await post("/api/sms/kod-gonder", { phone });
    if (ok && data.dogrulandi === true) return { durum: "dogrulandi" };
    if (ok && data.gonderildi === true) {
      return {
        durum: "gonderildi",
        telefon: String(data.telefon ?? ""),
        sureSaniye: Number(data.sureSaniye) || 120,
        tekrarSaniye: Number(data.tekrarSaniye) || 30,
      };
    }
    const bekle = Number(data.bekleSaniye);
    return {
      durum: "hata",
      mesaj: mesajOf(data, varsayilanHata),
      bekleSaniye: Number.isFinite(bekle) && bekle > 0 ? bekle : null,
    };
  } catch {
    return { durum: "hata", mesaj: varsayilanHata, bekleSaniye: null };
  }
}

export async function kodDogrula(
  phone: string,
  kod: string,
  varsayilanHata: string,
): Promise<KodDogrulaSonucu> {
  try {
    const { ok, data } = await post("/api/sms/kod-dogrula", { phone, kod });
    if (ok && data.dogrulandi === true) return { durum: "dogrulandi" };
    return {
      durum: "hata",
      mesaj: mesajOf(data, varsayilanHata),
      yeniKodGerekli: data.yeniKodGerekli === true,
    };
  } catch {
    return { durum: "hata", mesaj: varsayilanHata, yeniKodGerekli: false };
  }
}
