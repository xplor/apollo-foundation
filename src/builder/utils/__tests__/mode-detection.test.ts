import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectColorModes, clearModeCache } from '../mode-detection';

const access = vi.hoisted(() => vi.fn());
vi.mock('fs/promises', () => ({
    access: (...args: unknown[]) => access(...args),
    constants: { R_OK: 4 },
}));

describe('mode-detection', () => {
    beforeEach(() => {
        clearModeCache();
        access.mockReset();
    });

    afterEach(() => {
        clearModeCache();
    });

    it('returns hasModes true when both light and dark dirs exist', async () => {
        access.mockResolvedValue(undefined);

        const result = await detectColorModes('apollo', '/tokens');

        expect(result).toEqual({
            hasModes: true,
            lightPath: 'apollo/color/light',
            darkPath: 'apollo/color/dark',
        });
        expect(access).toHaveBeenCalledTimes(2);
    });

    it('returns hasModes false when access throws', async () => {
        access.mockRejectedValue(new Error('ENOENT'));

        const result = await detectColorModes('apollo', '/tokens');

        expect(result).toEqual({ hasModes: false });
    });

    it('caches result for same brand and tokensDir', async () => {
        access.mockResolvedValue(undefined);

        const r1 = await detectColorModes('apollo', '/tokens');
        const r2 = await detectColorModes('apollo', '/tokens');

        expect(r1).toEqual(r2);
        expect(access).toHaveBeenCalledTimes(2); // only first call hits fs
    });

    it('clearModeCache forces fresh filesystem check', async () => {
        access.mockResolvedValue(undefined);

        await detectColorModes('apollo', '/tokens');
        clearModeCache();
        await detectColorModes('apollo', '/tokens');

        expect(access).toHaveBeenCalledTimes(4);
    });
});
