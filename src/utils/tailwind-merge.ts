import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Generates a utility function that merges Tailwind classes and resolves
 * style conflicts. We need to tell it some of our custom classes so that it
 * knows what to do.
 *
 * The generated function has the same interface as twMerge.
 */
export default extendTailwindMerge({
    extend: {
        classGroups: {
            'font-size': ['text-p', 'text-caption', 'text-p-small'],
        },
    },
});
