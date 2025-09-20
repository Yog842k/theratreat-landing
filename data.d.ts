declare module "../app/data" {
  export const coreModules: Array<{
    id: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    features: string[];
    cta: string;
  }>;
}
