// DEAKTIVIERTER Toast-Hook
export const useToast = () => ({
  toasts: [],
  toast: () => ({ id: '', dismiss: () => {} }),
  dismiss: () => {},
});

export type ToasterToast = {
  id: string;
  title?: string;
  description?: string;
  action?: any;
  dismiss: () => void;
};