export type LegacyAlias = {
    legacy: string;
    current: string;
    comment?: string;
};

/**
 * Canonical map of legacy token aliases kept for backwards compatibility.
 * Keep all compatibility alias rules in this single source of truth.
 */
export const LEGACY_ALIASES: LegacyAlias[] = [
    {
        legacy: 'xpl-color-transparent',
        current: 'xpl-color-transparent-0',
        comment: 'Backwards-compatible alias. Use --xpl-color-transparent-0 instead.',
    },
];
