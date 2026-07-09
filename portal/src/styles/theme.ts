import type { ThemeName } from '../types'

/** Design tokens from the handoff — three selectable palettes. */
export const THEMES: Record<ThemeName, string> = {
  premium:
    '--bg:#f4f3ee;--panel:#ffffff;--ink:#282820;--muted:#79776d;--line:#e7e4db;--accent:#5f7856;--accent-soft:#e9efe4;--brand:#41533a;--danger:#b4553f;--warn:#a9762f;--warn-soft:#f4ebd6;--good:#4f7a4a;--good-soft:#e6efe4;',
  warm:
    '--bg:#faf4ed;--panel:#fffdf9;--ink:#332b24;--muted:#8b8074;--line:#efe5d8;--accent:#c17a52;--accent-soft:#f6e8dc;--brand:#a15c39;--danger:#b4553f;--warn:#a9762f;--warn-soft:#f6ead4;--good:#6a8a52;--good-soft:#ecefdf;',
  clinical:
    '--bg:#eef4f8;--panel:#ffffff;--ink:#122636;--muted:#65809a;--line:#dde8ef;--accent:#2f7f93;--accent-soft:#dcedf1;--brand:#1d5f70;--danger:#c15b48;--warn:#a9762f;--warn-soft:#f4ead4;--good:#2f8a6a;--good-soft:#dcefe6;',
}

export const DOCUSEAL_BLUE = '#1a73e8'
export const ZOOM_BLUE = '#2D8CFF'
