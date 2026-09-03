/**
 * Audio Chunker and Resampler Utility for High-Capacity Audio Transcription (STT)
 * Supports ~1 hour+ audio files by downsampling to 16kHz Mono 16-bit PCM WAV
 * and slicing into safe chunks (< 15MB) to avoid Gateway Timeouts and Body Size limits.
 */

export interface AudioChunkPayload {
  chunkIndex: number;
  totalChunks: number;
  startSec: number;
  endSec: number;
  durationSec: number;
  base64: string;
  mimeType: string;
  sizeMB: number;
  timeRangeLabel: string;
}

export interface ChunkProgressCallback {
  (message: string, percent: number): void;
}

/**
 * Format seconds to MM:SS format
 */
export function formatTimeMMSS(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Fast detection of audio duration via HTMLAudioElement or Web Audio
 */
export async function getAudioDurationFast(file: File): Promise<number> {
  return new Promise((resolve) => {
    try {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      const url = URL.createObjectURL(file);
      audio.src = url;
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration && !isNaN(audio.duration) ? audio.duration : 0);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(0);
      };
      setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve(0);
      }, 2000);
    } catch {
      resolve(0);
    }
  });
}

/**
 * Format duration to Korean and MM:SS
 * e.g. "42분 15초 (00:42:15)"
 */
export function formatDurationKorean(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '시간 계산 중...';
  const totalSec = Math.round(seconds);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const timeFormatted = h > 0
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  if (h > 0) {
    return `${h}시간 ${m}분 ${s}초 (${timeFormatted})`;
  }
  return `${m}분 ${s}초 (${timeFormatted})`;
}

/**
 * Encodes a section of an AudioBuffer to a 16kHz mono 16-bit PCM WAV Blob
 */
export function sliceAudioBufferTo16kWav(
  audioBuffer: AudioBuffer,
  startSample: number,
  endSample: number,
  targetSampleRate = 16000
): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sourceSampleRate = audioBuffer.sampleRate;
  const actualEndSample = Math.min(endSample, audioBuffer.length);
  const actualStartSample = Math.max(0, startSample);
  const sourceLength = actualEndSample - actualStartSample;

  if (sourceLength <= 0) {
    throw new Error('유효하지 않은 오디오 슬라이스 범위입니다.');
  }

  // Calculate target output length at targetSampleRate
  const ratio = sourceSampleRate / targetSampleRate;
  const targetLength = Math.max(1, Math.round(sourceLength / ratio));

  // Downsample & Mix to Mono Float32
  const monoData = new Float32Array(targetLength);
  const channelData: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channelData.push(audioBuffer.getChannelData(c));
  }

  for (let i = 0; i < targetLength; i++) {
    const srcPos = actualStartSample + i * ratio;
    const srcIndex = Math.floor(srcPos);
    const frac = srcPos - srcIndex;

    let sample = 0;
    for (let c = 0; c < numChannels; c++) {
      const ch = channelData[c];
      const s0 = ch[srcIndex] !== undefined ? ch[srcIndex] : 0;
      const s1 = ch[srcIndex + 1] !== undefined ? ch[srcIndex + 1] : s0;
      sample += s0 + frac * (s1 - s0);
    }
    sample /= numChannels;

    // Hard clip -1.0 ~ 1.0
    monoData[i] = Math.max(-1, Math.min(1, sample));
  }

  // WAV Header (44 bytes) + 16-bit PCM (2 bytes per sample)
  const dataSize = targetLength * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let j = 0; j < str.length; j++) {
      view.setUint8(offset + j, str.charCodeAt(j));
    }
  }

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, targetSampleRate, true); // SampleRate (16000)
  view.setUint32(28, targetSampleRate * 2, true); // ByteRate (16000 * 1 * 2)
  view.setUint16(32, 2, true); // BlockAlign (1 * 2)
  view.setUint16(34, 16, true); // BitsPerSample (16)

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < targetLength; i++) {
    const s = monoData[i];
    const int16 = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, Math.round(int16), true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Converts a Blob to a Base64 string without data-URI prefix
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.includes(',') ? res.split(',')[1] : res;
      resolve(base64.trim());
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
}

/**
 * Decodes an audio file and slices it into optimized chunks for Gemini STT
 * - Max chunk duration: 360 seconds (6 minutes)
 * - 6 minutes of 16kHz mono WAV is ~11.5MB (Base64 ~15.3MB)
 * - Ensures every chunk easily passes through Nginx 32M limit and Gemini 20MB limit
 */
export async function prepareOptimizedAudioChunks(
  file: File,
  options?: {
    chunkDurationSec?: number;
    onProgress?: ChunkProgressCallback;
  }
): Promise<{
  chunks: AudioChunkPayload[];
  totalDurationSec: number;
  isChunked: boolean;
}> {
  const chunkDurationSec = options?.chunkDurationSec || 360; // 6 minutes per chunk
  const onProgress = options?.onProgress;

  onProgress?.('오디오 스트림 분석 및 디코딩 준비 중...', 10);

  const arrayBuffer = await file.arrayBuffer();

  onProgress?.('브라우저 Web Audio API로 음성 데이터 디코딩 중...', 15);

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('이 브라우저는 Web Audio API를 지원하지 않습니다.');
  }

  const audioCtx = new AudioContextClass();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    audioCtx.close().catch(() => {});
  }

  const totalDurationSec = audioBuffer.duration;
  const sampleRate = audioBuffer.sampleRate;
  const totalSamples = audioBuffer.length;

  onProgress?.(
    `음성 길이 확인 완료: ${formatTimeMMSS(totalDurationSec)} (${Math.round(totalDurationSec)}초)`,
    25
  );

  // If audio is shorter than 6 minutes (360s) AND small enough, 1 chunk is sufficient
  if (totalDurationSec <= chunkDurationSec) {
    onProgress?.('음성 데이터를 고음질 16kHz 모노 규격으로 최적화 중...', 35);
    const wavBlob = sliceAudioBufferTo16kWav(audioBuffer, 0, totalSamples, 16000);
    const base64 = await blobToBase64(wavBlob);
    const sizeMB = Number((wavBlob.size / (1024 * 1024)).toFixed(2));

    return {
      chunks: [
        {
          chunkIndex: 0,
          totalChunks: 1,
          startSec: 0,
          endSec: totalDurationSec,
          durationSec: totalDurationSec,
          base64,
          mimeType: 'audio/wav',
          sizeMB,
          timeRangeLabel: `00:00 ~ ${formatTimeMMSS(totalDurationSec)}`,
        },
      ],
      totalDurationSec,
      isChunked: false,
    };
  }

  // Audio is longer than 6 minutes -> Split into chunks of chunkDurationSec
  const totalChunks = Math.ceil(totalDurationSec / chunkDurationSec);
  const chunks: AudioChunkPayload[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const startSec = i * chunkDurationSec;
    const endSec = Math.min((i + 1) * chunkDurationSec, totalDurationSec);
    const startSample = Math.round(startSec * sampleRate);
    const endSample = Math.round(endSec * sampleRate);

    const percent = Math.round(30 + ((i + 1) / totalChunks) * 20);
    onProgress?.(
      `대용량 음성 분할 처리 중: [${i + 1}/${totalChunks} 구간] ${formatTimeMMSS(startSec)} ~ ${formatTimeMMSS(endSec)}...`,
      percent
    );

    const wavBlob = sliceAudioBufferTo16kWav(audioBuffer, startSample, endSample, 16000);
    const base64 = await blobToBase64(wavBlob);
    const sizeMB = Number((wavBlob.size / (1024 * 1024)).toFixed(2));

    chunks.push({
      chunkIndex: i,
      totalChunks,
      startSec,
      endSec,
      durationSec: endSec - startSec,
      base64,
      mimeType: 'audio/wav',
      sizeMB,
      timeRangeLabel: `${formatTimeMMSS(startSec)} ~ ${formatTimeMMSS(endSec)}`,
    });
  }

  return {
    chunks,
    totalDurationSec,
    isChunked: true,
  };
}
