import { useOutletContext } from 'react-router-dom';

export type SubmissionError = {
    message: string;
};

export type MainContext = {
    navigateTo: (path: string) => void;
    handleAddToCart: (destinaionPath?: string) => void;
    submitCompleteOrder: (details: any) => Promise<SubmissionError | null>;
};

export function useMainContext(): MainContext {
    return useOutletContext();
}
