import { FileValidator } from '@nestjs/common';

type MagicCheck = (b: Buffer) => boolean;

/**
 * Vérifie les magic bytes du fichier (en-têtes binaires) pour s'assurer que
 * le contenu correspond réellement au MIME type déclaré.
 * Empêche le spoofing du Content-Type header.
 */
const MAGIC_SIGNATURES: Record<string, MagicCheck> = {
  'image/jpeg': (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/jpg': (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) =>
    b.length >= 4 &&
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  'image/webp': (b) =>
    b.length >= 12 &&
    b.slice(0, 4).toString('ascii') === 'RIFF' &&
    b.slice(8, 12).toString('ascii') === 'WEBP',
  'image/gif': (b) =>
    b.length >= 3 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46,
  'video/mp4': (b) => {
    if (b.length < 8) return false;
    const box = b.slice(4, 8).toString('ascii');
    return ['ftyp', 'free', 'moov', 'mdat'].some((t) => box.startsWith(t));
  },
  'video/quicktime': (b) => {
    if (b.length < 8) return false;
    const box = b.slice(4, 8).toString('ascii');
    return ['ftyp', 'moov', 'free', 'wide'].some((t) => box.startsWith(t));
  },
  'video/webm': (b) =>
    b.length >= 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3,
  'video/x-msvideo': (b) =>
    b.length >= 4 && b.slice(0, 4).toString('ascii') === 'RIFF',
};

export class MagicBytesValidator extends FileValidator {
  constructor() {
    super({});
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!file?.buffer || !file.mimetype) return false;
    const check = MAGIC_SIGNATURES[file.mimetype];
    if (!check) return true; // MIME type inconnu : laisse passer (FileTypeValidator filtre)
    return check(file.buffer);
  }

  buildErrorMessage(): string {
    return 'Le contenu du fichier ne correspond pas au type MIME déclaré';
  }
}
