/*
  Cuadros del río ya decodificados (ImageBitmap) alrededor del que se está viendo. Subir a la GPU una imagen que el
  navegador todavía no decodificó obliga a decodificarla en ese mismo cuadro: eso trababa la bajada de la cámara
  (Alejo, 14-oct). Se guardan solo los vecinos, al ancho del lienzo, para no llenar la memoria del celular.
*/
const VECINOS = 6;

export class CacheCuadros {
  private listos = new Map<number, ImageBitmap>();
  private pedidos = new Set<number>();
  private vivo = true;

  constructor(private imgs: HTMLImageElement[]) {}

  /** Pide decodificar los cuadros cercanos a `f` (1..N) y suelta los lejanos. */
  alrededor(f: number, ancho: number): void {
    for (let k = f - VECINOS; k <= f + VECINOS; k++) {
      const img = this.imgs[k - 1];
      if (!img || !img.complete || !img.naturalWidth || this.listos.has(k) || this.pedidos.has(k)) continue;
      this.pedidos.add(k);
      const w = Math.min(img.naturalWidth, Math.max(640, ancho));
      createImageBitmap(img, { resizeWidth: w, resizeHeight: Math.round((w * img.naturalHeight) / img.naturalWidth), resizeQuality: "high" })
        .then((b) => { if (this.vivo) this.listos.set(k, b); else b.close(); })
        .catch(() => undefined)
        .finally(() => this.pedidos.delete(k));
    }
    for (const [k, b] of this.listos) if (Math.abs(k - f) > VECINOS + 3) { b.close(); this.listos.delete(k); }
  }

  listo(f: number): ImageBitmap | undefined {
    return this.listos.get(f);
  }

  vaciar(): void {
    this.vivo = false;
    for (const b of this.listos.values()) b.close();
    this.listos.clear();
  }
}
