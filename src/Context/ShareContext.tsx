import React, { createContext, useContext, ReactNode, useState } from 'react';

interface ShareConfig {
  shareMessageTemplate: (title: string, url: string, description?: string, image?: string) => string;
  availablePlatforms: ('native' | 'telegram' | 'whatsapp' | 'copy' | 'instagram' | 'linkedin')[];
}

interface ShareContextType {
  shareConfig: ShareConfig;
  updateShareConfig: (config: Partial<ShareConfig>) => void;
}

const defaultShareConfig: ShareConfig = {
  shareMessageTemplate: (title: string, url: string, description?: string, image?: string) =>
    `دوره "${title}" را در روم دنتال بررسی کنید!${description ? `\n${description}` : ''}${image ? `\nتصویر: ${image}` : ''}\n${url}`,
  availablePlatforms: ['native', 'telegram', 'whatsapp', 'copy', 'instagram', 'linkedin'],
};

const ShareContext = createContext<ShareContextType>({
  shareConfig: defaultShareConfig,
  updateShareConfig: () => {},
});

export const ShareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shareConfig, setShareConfig] = useState<ShareConfig>(defaultShareConfig);

  const updateShareConfig = (config: Partial<ShareConfig>) => {
    setShareConfig((prev) => ({
      ...prev,
      ...config,
      shareMessageTemplate: config.shareMessageTemplate || prev.shareMessageTemplate,
      availablePlatforms: config.availablePlatforms || prev.availablePlatforms,
    }));
  };

  return (
    <ShareContext.Provider value={{ shareConfig, updateShareConfig }}>
      {children}
    </ShareContext.Provider>
  );
};

export const useShareContext = () => useContext(ShareContext);