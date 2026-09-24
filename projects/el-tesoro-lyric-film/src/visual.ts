export type Aspect = 'landscape' | 'portrait';
export type FeatureMetadata = {
  sourceSha256: string;
  framesPerSecond: number;
  frameCount: number;
  bandCount: number;
  dataSha256: string;
};
export type AcousticFrame = {rms: number; flux: number; bands: number[]};

export function featureAt(bytes: Uint8Array, metadata: FeatureMetadata, seconds: number): AcousticFrame {
  const stride = metadata.bandCount + 2;
  const position = Math.max(0, Math.min(metadata.frameCount - 1, seconds * metadata.framesPerSecond));
  const first = Math.floor(position);
  const second = Math.min(metadata.frameCount - 1, first + 1);
  const mix = position - first;
  const sample = (offset: number): number => ((bytes[first * stride + offset] ?? 0) * (1 - mix) + (bytes[second * stride + offset] ?? 0) * mix) / 255;
  return {rms: sample(0), flux: sample(1), bands: Array.from({length: metadata.bandCount}, (_, i) => sample(i + 2))};
}

const clamp = (value: number, low = 0, high = 1): number => Math.max(low, Math.min(high, value));

export function paintAtmosphere(canvas: HTMLCanvasElement, aspect: Aspect, seconds: number, audio: AcousticFrame): number {
  const width = aspect === 'landscape' ? 1920 : 1080;
  const height = aspect === 'landscape' ? 1080 : 1920;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;
  ctx.clearRect(0, 0, width, height);
  // The measured broadband envelope moves a few smoke contours already present
  // in the source art. These are an expressive display, not a frequency ruler.
  // The encoded RMS retains an absolute dBFS scale. This display window spans
  // the quiet-to-loud part of this source without making the response constant.
  const pressure = clamp((audio.rms - 0.82) / 0.12);
  const pulse = clamp(audio.flux * 1.25);
  const centerX = width / 2;
  const smokeY = aspect === 'landscape' ? 250 : 310;
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    for (let strand = 0; strand < 4; strand++) {
      const band = audio.bands[(strand * 5 + (side === 1 ? 2 : 0)) % audio.bands.length] ?? 0;
      const local = clamp((band - 0.26) * 1.65);
      const reach = (aspect === 'landscape' ? 445 : 300) * (0.91 + 0.09 * pressure);
      const offset = aspect === 'landscape' ? 235 : 135;
      ctx.beginPath();
      for (let point = 0; point <= 55; point++) {
        const u = point / 55;
        const edge = Math.sin(Math.PI * u);
        const flutter = Math.sin(u * 7.0 + seconds * 0.18 + strand * 0.82 + side) * 10;
        const breathing = edge * (12 + 26 * local + 12 * pressure) * Math.sin(u * 5.2 + seconds * 0.26 + strand);
        const x = centerX + side * (offset + reach * u + flutter * edge);
        const y = smokeY + strand * 29 + 30 * u + breathing;
        if (point === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(117,83,151,${(0.075 + 0.075 * pressure + 0.055 * local).toFixed(3)})`;
      ctx.lineWidth = 1.8 + 0.9 * pressure;
      ctx.stroke();
    }
  }
  // A short reflection sits on the existing blade rather than shaking the image.
  return clamp(0.025 + 0.19 * pulse * (0.35 + pressure), 0, 0.22);
}

export function artworkTransform(seconds: number): string {
  const zoom = 1.014 + 0.008 * Math.sin(seconds / 24);
  const x = 0.28 * Math.sin(seconds / 31);
  const y = 0.16 * Math.cos(seconds / 37);
  return `translate(${x.toFixed(3)}%,${y.toFixed(3)}%) scale(${zoom.toFixed(5)})`;
}
