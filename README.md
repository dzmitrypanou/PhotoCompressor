# Photo Compressor

Bulk photo compression for Windows with a Discord-inspired dark UI.

Built with **Electron**, **React**, **TypeScript**, and **Sharp** (libvips). Images are processed in parallel using Node.js worker threads for high throughput.

## Features

- Batch compression for **JPEG**, **PNG**, and **WebP**
- **5 quality presets** from minimal loss to maximum savings
- Multi-threaded processing (auto-detects CPU cores or manual thread count)
- Source and output folder selection with optional recursive scanning
- Output format: keep original, force JPEG, or force WebP
- Strip EXIF metadata, overwrite existing files, preserve folder structure
- Live progress bar, throughput, ETA, and processing log
- Cancel in-flight jobs without closing the app

## Requirements

- [Node.js](https://nodejs.org/) 20+
- Windows 10/11

## Development

```bash
npm install
npm run dev
```

Other scripts:

| Command | Description |
|---------|-------------|
| `npm run build` | Build the app and package Windows installers |
| `npm run build:app` | Build compiled output only (no installer) |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run TypeScript checks |
| `npm run generate:icon` | Regenerate `resources/icon.ico` from `resources/icon-source.png` |

## Building executables

```bash
npm run build
```

Outputs in `dist/`:

| File | Description |
|------|-------------|
| `Photo Compressor Setup 1.0.0.exe` | NSIS installer (recommended) |
| `Photo Compressor 1.0.0.exe` | Portable executable (no install) |
| `win-unpacked/` | Unpacked build for debugging |

Code signing is disabled in `package.json` (`signAndEditExecutable: false`) so local builds work without a certificate.

## Quality presets

| Preset | JPEG quality | WebP quality | Max side |
|--------|-------------|--------------|----------|
| Maximum | 92 | 90 | unchanged |
| High | 85 | 82 | unchanged |
| Balanced | 75 | 72 | 2560 px |
| Web | 70 | 68 | 1920 px |
| Aggressive | 55 | 52 | 1280 px |

The **Web** and **Aggressive** presets use progressive JPEG encoding. When a preset sets a max side, images are downscaled before encoding to reduce file size and speed up processing.

## Format notes

- **JPEG** and **WebP** use lossy compression with mozjpeg / WebP effort 4
- **PNG (RGB)** can be re-encoded or converted depending on the output format setting
- **PNG with transparency (RGBA)** cannot be saved as JPEG — use WebP or keep the original format

Default output folder when none is selected: `<input-folder>/compressed/`

## Performance

On an 8-core CPU, Sharp typically handles **150–400 JPEG files per second**, depending on resolution, preset, and disk speed.

## Project structure

```
electron/           Main process, IPC, Sharp worker pool
  compressor/       Scanner, worker, thread pool
  ipc/              Folder picker, start/cancel handlers
src/                React UI (Discord-style theme)
  components/       Sidebar, settings, progress, log
  hooks/            IPC progress subscriptions
shared/             Presets and shared utilities
resources/          App icon (icon.ico, icon-source.png)
scripts/            Icon generation script
```

## License

Free to use, no copyrights! 😘
