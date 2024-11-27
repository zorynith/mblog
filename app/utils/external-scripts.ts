interface ScriptConfig {
    src: string;
    defer?: boolean;
    async?: boolean;
    attributes?: Record<string, string>;
    enabled?: boolean;
  }
  
  export const externalScriptslist: ScriptConfig[] = [
    // Umami 统计
    //https://umami.is/docs/deployment/cloud
    {
      src: 'https://cloud.umami.is/script.js',
      defer: true,
      attributes: {
        'data-website-id': ''
      },
      enabled: true
    },
    // 其他外部脚本
    // {
    //   src: 'https://other-analytics.com/script.js',
    //   async: true,
    //   attributes: {
    //     'custom-attribute': 'value'
    //   }
    // }
  ];