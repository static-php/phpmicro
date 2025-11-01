import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "micro SAPI",
  description: "micro SAPI makes PHP self-executable, allowing you to run php-cli apps without any PHP installation.",

  locales: {
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      themeConfig: {
        footer: {
          message: 'Released under the Apache-2.0 License.',
        },
        nav: [
          { text: 'Guide', link: '/en/' },
          { text: 'static-php-cli', link: 'https://static-php.dev' },
        ],
        sidebar: [
          {
            text: 'Guide',
            items: [
              { text: 'Introduction', link: '/en/index' },
              { text: 'Building micro SAPI', link: '/en/build-micro' },
              { text: 'Customizing micro SAPI', link: '/en/customization' },
              { text: 'Digging Deeper', link: '/en/digging-deeper' },
            ]
          }
        ],
        socialLinks: [
          { icon: 'github', link: 'https://github.com/static-php/phpmicro' }
        ]
      }
    },
    zh: {
      label: '简体中文',
      lang: 'zh',
      link: '/zh/',
      themeConfig: {
        footer: {
          message: 'Released under the Apache-2.0 License.',
        },
        nav: [
          { text: '指南', link: '/zh/' },
          { text: 'static-php-cli', link: 'https://static-php.dev' },
        ],
        sidebar: [
          {
            text: '指南',
            items: [
              { text: '简介', link: '/zh/index' },
              { text: '构建 micro SAPI', link: '/zh/build-micro' },
              { text: '配置 micro SAPI', link: '/zh/customization' },
              { text: '深入 micro SAPI', link: '/zh/digging-deeper' },
            ]
          }
        ],
        socialLinks: [
          { icon: 'github', link: 'https://github.com/static-php/phpmicro' }
        ],
        outlineTitle: '页面导航',
        lastUpdatedText: '最后更新于',
        docFooter: {
          prev: '上一页',
          next: '下一页'
        }
      }
    }
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [
      { icon: 'github', link: 'https://github.com/static-php/phpmicro' }
    ],
    footer: {
      message: 'micro SAPI released under the Apache-2.0 License | Documentation under CC BY 4.0.',
    },
  }
})
