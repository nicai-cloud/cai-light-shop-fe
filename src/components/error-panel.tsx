import React from 'react';
import WarningTriangle from './icons/24/warning-triangle';
import tailwindMerge from '../utils/tailwind-merge';

type ErrorPanelProps = {
    text: string;
} & Pick<React.ComponentPropsWithoutRef<'div'>, 'className'>;

export default function ErrorPanel({ text, className }: ErrorPanelProps) {
    return (
        <div className={tailwindMerge('p-4 rounded-2xl bg-status-error flex flex-row gap-2 justify-start items-center', className)}>
            <WarningTriangle className="flex-shrink-0 text-error" />
            <p className="text-error text-start font-bold">
                {text}
            </p>
        </div>
    );
}
