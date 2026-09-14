/**
 * CRM'in araç bilgileri girilirken yaptığı `TeklifBul` ön kontrolü.
 *
 * Acente defterinin ham yanıtı kişisel veri taşıdığı için istemciye hiçbir
 * zaman geçirilmez. Yalnızca istekteki kimlik + plaka + branşla birebir
 * eşleşen en son teklifin kimliği ve tarihi döner.
 */

import { jsonResponse } from "../_shared/io";
import { rateCheck } from "../_shared/iolog";
import { clientIp, hashIp, resolveSession, withCookie } from "../_shared/session";
import {
  aktifPoliceBitisi,
  kayitliTeklifBul,
} from "../_shared/uye";

export const config = { runtime: "edge" };

interface RequestBody {
  kimlikNo?: string;
  plaka?: string;
  bransNo?: number;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Yöntem desteklenmiyor." }, 405);
  }

  const session = await resolveSession(request);
  const ipHash = await hashIp(clientIp(request));
  const allowed = await rateCheck(ipHash, "kayitli_teklif", 30, 3600);
  if (!allowed) {
    return withCookie(
      jsonResponse({ error: "Çok fazla sorgu yaptınız. Lütfen daha sonra deneyin." }, 429),
      session,
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return withCookie(jsonResponse({ error: "Geçersiz istek." }, 400), session);
  }

  const kimlikNo = String(body.kimlikNo ?? "").replace(/\D/g, "");
  const plaka = String(body.plaka ?? "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
  const bransNo = Number(body.bransNo);

  if (
    ![10, 11].includes(kimlikNo.length) ||
    plaka.length < 5 ||
    plaka.length > 12 ||
    !Number.isInteger(bransNo) ||
    bransNo < 0
  ) {
    return withCookie(
      jsonResponse({ error: "Kimlik, plaka ve branş bilgisi geçersiz." }, 400),
      session,
    );
  }

  const [teklif, policeBitisi] = await Promise.all([
    kayitliTeklifBul(plaka, kimlikNo, bransNo),
    aktifPoliceBitisi(plaka, bransNo),
  ]);

  return withCookie(
    jsonResponse({
      bulundu: teklif !== null,
      teklifId: teklif?.teklifId ?? null,
      teklifTarihi: teklif?.teklifTarihi ?? null,
      policeBitisi,
    }),
    session,
  );
}
